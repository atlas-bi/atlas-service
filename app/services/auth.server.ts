import * as validator from '@authenio/samlify-node-xmllint';
import type { User } from '@prisma/client';
import { Authenticator } from 'remix-auth';
import { FormStrategy } from 'remix-auth-form';
import { SamlStrategy } from 'remix-auth-saml';
import invariant from 'tiny-invariant';
import { updateUserProps } from '~/models/user.server';
import { sessionStorage } from '~/services/session.server';

import { verifyLogin } from './ldap.server';

// Create an instance of the authenticator, pass a generic with what
// strategies will return and will store in the session
export let authenticator = new Authenticator<User>(sessionStorage);

const host =
  (process.env.SSL_CERTIFICATE ? 'https://' : 'http://') +
  process.env.EXTERNAL_URL;

let metadata = {};

try {
  invariant(process.env.SAML_IDP_METADATA);

  let samlStrategy = new SamlStrategy(
    {
      validator,
      authURL: host,
      callbackURL: host + '/auth/callback',
      idpMetadataURL: process.env.SAML_IDP_METADATA,
      spAuthnRequestSigned:
        (process.env.SAML_SP_AUTHNREQUESTSSIGNED || '').toLowerCase() ===
        'true',
      spWantAssertionSigned:
        (process.env.SAML_SP_WANTASSERTIONSIGNED || '').toLowerCase() ===
        'true',
      spWantMessageSigned:
        (process.env.SAML_SP_WANTMESSAGESIGNED || '').toLowerCase() === 'true',
      spWantLogoutRequestSigned:
        (process.env.SAML_SP_WANTLOGOUTRESPONSESIGNED || '').toLowerCase() ===
        'true',
      spWantLogoutResponseSigned:
        (process.env.SAML_SP_WANTLOGOUTREQUESTSIGNED || '').toLowerCase() ===
        'true',
      spIsAssertionEncrypted:
        (process.env.SAML_SP_ISASSERTIONENCRYPTED || '').toLowerCase() ===
        'true',
      // optional
      privateKey: process.env.SAML_PRIVATE_KEY,
      // optional
      privateKeyPass: process.env.SAML_PRIVATE_KEY_PASS,
      // optional
      encPrivateKey: process.env.SAML_ENC_PRIVATE_KEY,
    },
    async ({ extract, data }) => {
      if (!extract.nameID) {
        throw 'failed to login.';
      }
      const email = extract.nameID;

      return await updateUserProps(
        email,
        extract.attributes?.firstName,
        extract.attributes?.lastName,
        extract.attributes?.groups,
        extract.attributes?.profilePhoto,
      );
    },
  );

  authenticator.use(samlStrategy, 'saml');
  metadata = samlStrategy.metadata();
} catch (e) {
  console.log(e);
}
// use ldap

let ldapStrategy = new FormStrategy(async ({ form }) => {
  let email = form.get('email') as string;
  let password = form.get('password') as string;
  const user = await verifyLogin(email, password);
  if (!user) throw 'failed to login.';
  return user;
});

authenticator.use(ldapStrategy, 'ldap');

export { metadata };

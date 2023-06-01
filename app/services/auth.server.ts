import * as validator from '@authenio/samlify-node-xmllint';
import type { User } from '@prisma/client';
import { Authenticator } from 'remix-auth';
import { SamlStrategy } from 'remix-auth-saml';
import { updateUserProps } from '~/models/user.server';
import { sessionStorage } from '~/services/session.server';

// Create an instance of the authenticator, pass a generic with what
// strategies will return and will store in the session
export let authenticator = new Authenticator<User>(sessionStorage);

const host =
  (process.env.SSL_CERTIFICATE ? 'https://' : 'http://') +
  process.env.EXTERNAL_URL;

let samlStrategy = new SamlStrategy(
  {
    validator,
    authURL: host,
    callbackURL: host + '/auth/saml/callback',
    idpMetadataURL: process.env.SAML_IDP_METADATA,
    spAuthnRequestSigned:
      (process.env.SAML_SP_AUTHNREQUESTSSIGNED || '').toLowerCase() === 'true',
    spWantAssertionSigned:
      (process.env.SAML_SP_WANTASSERTIONSIGNED || '').toLowerCase() === 'true',
    spWantMessageSigned:
      (process.env.SAML_SP_WANTMESSAGESIGNED || '').toLowerCase() === 'true',
    spWantLogoutRequestSigned:
      (process.env.SAML_SP_WANTLOGOUTRESPONSESIGNED || '').toLowerCase() ===
      'true',
    spWantLogoutResponseSigned:
      (process.env.SAML_SP_WANTLOGOUTREQUESTSIGNED || '').toLowerCase() ===
      'true',
    spIsAssertionEncrypted:
      (process.env.SAML_SP_ISASSERTIONENCRYPTED || '').toLowerCase() === 'true',
    // optional
    privateKey: process.env.SAML_PRIVATE_KEY,
    // optional
    privateKeyPass: process.env.SAML_PRIVATE_KEY_PASS,
    // optional
    encPrivateKey: process.env.SAML_ENC_PRIVATE_KEY,
  },
  async ({ extract, data }) => {
    console.log('profile', extract);

    if (!extract.nameID) {
      // return to next url
      return false;
    }
    // const next = data.RelayState ? (data.RelayState as string) : '/';
    const email = extract.nameID;

    // const expiration = extract.conditions?.notOnOrAfter;

    // get or create user
    // let user = await getOrCreateUser(email);

    // update user info
    return await updateUserProps(
      email,
      extract.attributes?.firstName,
      extract.attributes?.lastName,
      extract.attributes?.groups,
    );

    // create a session
    // return true;
    // createUserSession({
    //   request: request,
    //   userId: user.id,
    //   expiration: expiration,
    //   redirectTo: next,
    // });
  },
);

export let metadata = samlStrategy.metadata();

authenticator.use(samlStrategy);

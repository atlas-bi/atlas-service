// saml server
import * as validator from '@authenio/samlify-node-xmllint';
import fs from 'fs';
import * as samlify from 'samlify';
import type {
  IdentityProviderSettings,
  ServiceProviderSettings,
} from 'samlify/types/src/types';

samlify.setSchemaValidator(validator);

const host =
  (process.env.SSL_CERTIFICATE ? 'https://' : 'http://') +
  process.env.EXTERNAL_URL;

const spData: ServiceProviderSettings = {
  entityID: host,
  authnRequestsSigned:
    (process.env.SAML_SP_AUTHNREQUESTSSIGNED || '').toLowerCase() === 'true',
  wantAssertionsSigned:
    (process.env.SAML_SP_WANTASSERTIONSIGNED || '').toLowerCase() === 'true',
  wantMessageSigned:
    (process.env.SAML_SP_WANTMESSAGESIGNED || '').toLowerCase() === 'true',
  wantLogoutResponseSigned:
    (process.env.SAML_SP_WANTLOGOUTREQUESTSIGNED || '').toLowerCase() ===
    'true',
  wantLogoutRequestSigned:
    (process.env.SAML_SP_WANTLOGOUTRESPONSESIGNED || '').toLowerCase() ===
    'true',
  isAssertionEncrypted:
    (process.env.SAML_SP_ISASSERTIONENCRYPTED || '').toLowerCase() === 'true',
  assertionConsumerService: [
    {
      Binding: 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST',
      Location: host + '/auth/asc',
    },
    {
      Binding: 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect',
      Location: host + '/auth/asc',
    },
  ],
  singleLogoutService: [
    {
      Binding: 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST',
      Location: host + '/auth/slo',
    },
    {
      Binding: 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect',
      Location: host + '/auth/slo',
    },
  ],
};
if (process.env.SAML_PRIVATE_KEY)
  spData.privateKey = fs.readFileSync(process.env.SAML_PRIVATE_KEY);
if (process.env.SAML_PRIVATE_KEY_PASS)
  spData.privateKeyPass = process.env.SAML_PRIVATE_KEY_PASS;
if (process.env.SAML_ENC_PRIVATE_KEY)
  spData.encPrivateKey = fs.readFileSync(process.env.SAML_ENC_PRIVATE_KEY);

export const sp = samlify.ServiceProvider(spData);

export async function getIdp() {
  // get IDP metadata XML
  let Idpxml = '';
  if (process.env.SAML_IDP_METADATA) {
    const IpdXmlFetch = await fetch(process.env.SAML_IDP_METADATA);
    Idpxml = await IpdXmlFetch.text();
  }

  const idpData: IdentityProviderSettings = {
    metadata: Idpxml,
  };

  if (process.env.SAML_PRIVATE_KEY)
    idpData.privateKey = fs.readFileSync(process.env.SAML_PRIVATE_KEY);

  return samlify.IdentityProvider(idpData);
}

export function metadata() {
  return sp.getMetadata();
}

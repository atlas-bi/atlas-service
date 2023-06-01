import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { authenticator } from '~/services/auth.server';

export let action: ActionFunction = ({ request }) => login(request);
export let loader: LoaderFunction = ({ request }) => login(request);

async function login(request: Request) {
  return authenticator.authenticate('saml', request);
}

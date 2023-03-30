import { type ActionArgs, redirect } from '@remix-run/node';
import { updateUserProps } from '~/models/user.server';
import { getIdp, sp } from '~/saml.server';
import { createUserSession } from '~/session.server';

export const action = async ({ request }: ActionArgs) => {
  const formData = await request.formData();

  if (request.method === 'POST') {
    const body = Object.fromEntries(formData);
    const idp = await getIdp();
    const { extract } = await sp.parseLoginResponse(idp, 'post', {
      body,
    });
    if (!extract.nameID) {
      // return to next url
      return redirect('/access_denied');
    }
    const next = body.RelayState ? (body.RelayState as string) : '/';
    const email = extract.nameID;

    const expiration = extract.conditions?.notOnOrAfter;

    // get or create user
    // let user = await getOrCreateUser(email);

    // update user info
    const user = await updateUserProps(
      email,
      extract.attributes?.firstName,
      extract.attributes?.lastName,
      extract.attributes?.groups,
    );

    // create a session
    return createUserSession({
      request: request,
      userId: user.id,
      expiration: expiration,
      redirectTo: next,
    });
  } else {
    return redirect('/');
  }
};

export const loader = async () =>
  // get request... send back to home page, we are here by accident.
  redirect('/');

import { type LoaderArgs, json } from '@remix-run/node';
import { Outlet, useLoaderData } from '@remix-run/react';
import Nav from '~/components/nav/Nav';
import { getRequestTypesLite } from '~/models/config.server';
import { authenticator } from '~/services/auth.server';
import { commitSession, getSession } from '~/services/session.server';

export async function loader({ request }: LoaderArgs) {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: `/auth/?returnTo=${encodeURI(
      new URL(request.url).pathname,
    )}`,
  });

  const navRequestTypes = await getRequestTypesLite();

  let session = await getSession(request.headers.get('cookie'));

  return json({
    headers: {
      'Set-Cookie': await commitSession(session),
    },
    user,
    navRequestTypes,
  });
}

const Authed = () => {
  const { user, navRequestTypes } = useLoaderData<typeof loader>();

  return (
    <>
      {user && <Nav requestTypes={navRequestTypes} />}
      <div className="container">
        <Outlet />
      </div>
    </>
  );
};

export default Authed;

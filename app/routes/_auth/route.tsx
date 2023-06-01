import { type LoaderArgs, json } from '@remix-run/node';
import { Outlet, PrefetchPageLinks, useLoaderData } from '@remix-run/react';
import Nav from '~/components/nav/Nav';
// import { json } from "@remix-run/node";
// import type { LoaderArgs } from "@remix-run/node";
import { getRequestTypesLite } from '~/models/config.server';
import { authenticator } from '~/services/auth.server';

// import { getSession, getUser, sessionStorage } from '~/session.server';

export async function loader({ request }: LoaderArgs) {
  // const session = await getSession(request);
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: `/auth/saml/?returnTo=${encodeURI(request.url)}`,

    // or to go back to the root `/`
    //failureRedirect: "/auth/saml/",
  });
  console.log(user);
  // return json({ user });
  const navRequestTypes = await getRequestTypesLite();

  return json({
    // headers: {
    //   'Set-Cookie': await sessionStorage.commitSession(session),
    // },
    // user: await getUser(request),
    user,
    navRequestTypes,
  });
}

const Authed = () => {
  const { user, navRequestTypes } = useLoaderData<typeof loader>();
  console.log(user);
  return (
    <>
      {/* {navRequestTypes &&
          navRequestTypes.map((rt: RequestType) => (
            <PrefetchPageLinks
              key={rt.id}
              page={`/request/new?type=${rt.name}`}
            />
          ))}*/}
      {user && <Nav />}
      <div className="container">
        <Outlet />
      </div>
    </>
  );
};

export default Authed;

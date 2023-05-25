import {
  type LinksFunction,
  type LoaderArgs,
  type MetaFunction,
  json,
} from '@remix-run/node';
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  PrefetchPageLinks,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from '@remix-run/react';
import remixImageStyles from 'remix-image/remix-image.css';
// import appStyles from './styles/main.css';
import stylesheet from '~/globals.css';
import { getRequestTypesLite } from '~/models/config.server';

import Nav from './components/nav/Nav';
import { getSession, getUser, sessionStorage } from './session.server';

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: remixImageStyles },
  // { rel: 'stylesheet', href: appStyles },
  { rel: 'stylesheet', href: stylesheet },
];

export const meta: MetaFunction = () => [
  { charset: 'utf-8' },
  { title: 'Atlas Requests' },
  { viewport: 'width=device-width,initial-scale=1' },
];

export async function loader({ request }: LoaderArgs) {
  const session = await getSession(request);
  const message = session.get('globalMessage') || null;
  const navRequestTypes = await getRequestTypesLite();

  return json({
    message,
    headers: {
      'Set-Cookie': await sessionStorage.commitSession(session),
    },
    user: await getUser(request),
    navRequestTypes,
  });
}

const App = () => {
  const { user, navRequestTypes } = useLoaderData<typeof loader>();
  return (
    <html lang="en" className={`${user ? 'has-navbar-fixed-top' : ''}`}>
      <head>
        <Meta />
        <Links />
        {navRequestTypes &&
          navRequestTypes.map((rt: RequestType) => (
            <PrefetchPageLinks
              key={rt.id}
              page={`/request/new?type=${rt.name}`}
            />
          ))}
      </head>
      <body>
        {user && <Nav />}
        <Outlet />
        <ScrollRestoration />

        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
};

export default App;

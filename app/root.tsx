// import appStyles from './styles/main.css';
import stylesheet from '@/styles/globals.css';
import { type LinksFunction, type MetaFunction, json } from '@remix-run/node';
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from '@remix-run/react';
import remixImageStyles from 'remix-image/remix-image.css';

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

const App = () => {
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
};

export default App;

import type { LinksFunction, LoaderArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import { useLoaderData } from "@remix-run/react";

import { getUser, getSession, sessionStorage } from "./session.server";
import appStyles from "./styles/main.css";

import Nav from "./components/Nav";

import remixImageStyles from "remix-image/remix-image.css";

export const links: LinksFunction = () => {
  return [
    { rel: "stylesheet", href: remixImageStyles },
    { rel: "stylesheet", href: appStyles },
  ];
};

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "Atlas Requests",
  viewport: "width=device-width,initial-scale=1",
});

export async function loader({ request }: LoaderArgs) {
  const session = await getSession(request);
  const message = session.get("globalMessage") || null;

  // return json({user: await getUser(request), message})
  return json({
    message,
    headers: {
      // only necessary with cookieSessionStorage
      "Set-Cookie": await sessionStorage.commitSession(session),
    },
    user: await getUser(request),
  });
}

export default function App() {
  const { user } = useLoaderData();
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body className="main">
        {user && <Nav />}
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

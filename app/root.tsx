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
    Scripts,
    ScrollRestoration,
    useLoaderData,
} from '@remix-run/react';
import remixImageStyles from 'remix-image/remix-image.css';

import Nav from './components/Nav';
import { getSession, getUser, sessionStorage } from './session.server';
import appStyles from './styles/main.css';

export const links: LinksFunction = () => [
    { rel: 'stylesheet', href: remixImageStyles },
    { rel: 'stylesheet', href: appStyles },
];

export const meta: MetaFunction = () => ({
    charset: 'utf-8',
    title: 'Atlas Requests',
    viewport: 'width=device-width,initial-scale=1',
});

export async function loader({ request }: LoaderArgs) {
    const session = await getSession(request);
    const message = session.get('globalMessage') || null;

    // return json({user: await getUser(request), message})
    return json({
        message,
        headers: {
            // only necessary with cookieSessionStorage
            'Set-Cookie': await sessionStorage.commitSession(session),
        },
        user: await getUser(request),
    });
}

export default function App() {
    const { user } = useLoaderData<typeof loader>();
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

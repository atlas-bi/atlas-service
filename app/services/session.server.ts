import { createCookieSessionStorage } from '@remix-run/node';
import invariant from 'tiny-invariant';

invariant(process.env.SESSION_SECRET, 'SESSION_SECRET must be set');

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: '__session',
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secrets: [process.env.SESSION_SECRET],
    // only works if site is using https.
    //secure: process.env.NODE_ENV === 'production',
  },
});

export let { getSession, commitSession, destroySession } = sessionStorage;

// const USER_SESSION_KEY = 'userId';

// export async function getSession(request: Request) {
//   const cookie = request.headers.get('Cookie');
//   return sessionStorage.getSession(cookie);
// }

export async function getUserId(
  request: Request,
): Promise<User['id'] | undefined> {
  const session = await getSession(request);
  const userId = session.get(USER_SESSION_KEY);

  return userId;
}

export async function getUser(request: Request): Promise<User | null> {
  const userId = await getUserId(request);
  if (userId === undefined) return null;

  const user = await getUserById(userId);
  if (user) return user;

  return null;
}

export async function requireUserId(
  request: Request,
  redirectTo: string = new URL(request.url).pathname,
) {
  const userId = await getUserId(request);
  if (!userId) {
    const searchParams = new URLSearchParams([['redirectTo', redirectTo]]);
    throw redirect(`/login?${searchParams}`);
  }
  return userId;
}

export async function requireUser(request: Request) {
  const userId = await requireUserId(request);

  const user = await getUserById(userId);
  if (user) return user;

  throw await logout(request);
}

export async function createUserSession({
  request,
  userId,
  expiration,
  redirectTo,
}: {
  request: Request;
  userId: number;
  expiration: string | undefined;
  redirectTo: string;
}) {
  const expirationDate = expiration
    ? new Date(expiration)
    : new Date(new Date().getTime() + 60 * 60 * 24 * 7);
  const maxAge = expirationDate.getTime() - new Date().getTime();
  const session = await getSession(request);
  session.set(USER_SESSION_KEY, userId);
  return redirect(redirectTo, {
    headers: {
      'Set-Cookie': await sessionStorage.commitSession(session, {
        maxAge: maxAge,
      }),
    },
  });
}

export async function logout(request: Request) {
  const session = await getSession(request);
  return redirect('/', {
    headers: {
      'Set-Cookie': await sessionStorage.destroySession(session),
    },
  });
}

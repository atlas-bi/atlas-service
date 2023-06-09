import { type LoaderArgs, json } from '@remix-run/node';
import { authenticator } from '~/services/auth.server';

export async function loader({ request, params }: LoaderArgs) {
  await authenticator.isAuthenticated(request, {
    failureRedirect: `/auth/?returnTo=${encodeURI(
      new URL(request.url).pathname,
    )}`,
  });

  return json({});
}

export default function Index() {
  return (
    <>
      Users admin type - what groups should admin users have/who is admin? who
      is an admin anyways?
    </>
  );
}

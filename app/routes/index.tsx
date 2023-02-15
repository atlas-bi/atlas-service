import type { User } from '@prisma/client';
import { type Session, json } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import type { LoaderArgs } from '@remix-run/server-runtime';
import { authorize } from '~/session.server';

// import greetingsQueue from "~/queues/greetings.server";

export async function loader({ request }: LoaderArgs) {
  return authorize(
    request,
    undefined,
    async ({ user, session }: { user: User; session: Session }) => json(user),
  );
}

export default function Index() {
  const user = useLoaderData<typeof loader>();
  return (
    <div className="container ">
      <Link to="/notes">View Notes for {user.email}</Link>
    </div>
  );
}

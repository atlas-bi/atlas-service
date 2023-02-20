import type { Request, User } from '@prisma/client';
import { type Session, json } from '@remix-run/node';
import { NavLink, useLoaderData } from '@remix-run/react';
import type { LoaderArgs } from '@remix-run/server-runtime';
import { getRequestListItems } from '~/models/request.server';
import { authorize } from '~/session.server';

// import greetingsQueue from "~/queues/greetings.server";

export async function loader({ request }: LoaderArgs) {
  return authorize(
    request,
    undefined,
    async ({ user, session }: { user: User; session: Session }) => {
      const requests = await getRequestListItems({ userId: user.id });
      return json({ user, requests });
    },
  );
}

export default function Index() {
  const { user, requests } = useLoaderData<typeof loader>();
  return (
    <div className="container ">
      hi {user.firstName}
      you have some requests:
      {requests.length === 0 ? (
        <p className="p-4">No requests yet</p>
      ) : (
        <ol>
          {requests.map((request: Request) => (
            <li key={request.id}>
              <NavLink
                className={({ isActive }) =>
                  `block border-b p-4 text-xl ${isActive ? 'bg-white' : ''}`
                }
                to={`/request/` + request.id.toString()}
              >
                📝 {request.name} {request.id}
              </NavLink>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

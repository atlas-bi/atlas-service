import {
  type ActionArgs,
  type LoaderArgs,
  json,
  redirect,
} from '@remix-run/node';
import { Form, useCatch, useLoaderData } from '@remix-run/react';
import invariant from 'tiny-invariant';
import { deleteRequest, getRequest } from '~/models/request.server';
import { requireUserId } from '~/session.server';

export async function loader({ request, params }: LoaderArgs) {
  const userId = await requireUserId(request);
  invariant(params.requestId, 'requestId not found');

  const thisRequest = await getRequest({
    userId,
    id: Number(params.requestId),
  });
  if (!thisRequest) {
    throw new Response('Not Found', { status: 404 });
  }
  return json({ thisRequest });
}

export async function action({ request, params }: ActionArgs) {
  const userId = await requireUserId(request);
  invariant(params.requestId, 'requestId not found');

  await deleteRequest({ userId, id: Number(params.requestId) });

  return redirect('/');
}

export default function RequestDetailsPage() {
  const data = useLoaderData<typeof loader>();

  return (
    <div>
      <h3 className="text-2xl font-bold">{data.thisRequest.name}</h3>
      <hr className="my-4" />
      <Form method="post">
        <button
          type="submit"
          className="rounded bg-blue-500  py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400"
        >
          Delete
        </button>
      </Form>
    </div>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);

  return <div>An unexpected error occurred: {error.message}</div>;
}

export function CatchBoundary() {
  const caught = useCatch();

  if (caught.status === 404) {
    return <div>Request not found</div>;
  }

  throw new Error(`Unexpected caught response with status: ${caught.status}`);
}

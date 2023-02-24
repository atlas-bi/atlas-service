import {
  type ActionArgs,
  type LoaderArgs,
  json,
  redirect,
} from '@remix-run/node';
import { Form, useCatch, useLoaderData } from '@remix-run/react';
import * as React from 'react';
import invariant from 'tiny-invariant';
import { deleteRequest, getRequest } from '~/models/request.server';
import { requireUserId } from '~/session.server';

import EditorReader from '../../components/EditorReader';

export async function loader({ request, params }: LoaderArgs) {
  invariant(params.requestId, 'requestId not found');

  const thisRequest = await getRequest({
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
  const { thisRequest } = useLoaderData<typeof loader>();
  const descriptionRef = React.useRef<HTMLInputElement>(null);
  const purposeRef = React.useRef<HTMLInputElement>(null);
  const criteriaRef = React.useRef<HTMLInputElement>(null);
  const parametersRef = React.useRef<HTMLInputElement>(null);
  const scheduleRef = React.useRef<HTMLInputElement>(null);
  return (
    <div className="container">
      <div className="columns">
        <div className="column">
          <h3 className="title is-3 pl-4">{thisRequest.name}</h3>

          <div className="thread-box">
            {thisRequest.description && (
              <>
                <strong className="p-2">Description</strong>
                <EditorReader
                  ref={descriptionRef}
                  initialEditorState={thisRequest.description}
                />
              </>
            )}
            {thisRequest.purpose && (
              <>
                <strong className="p-2">Purpose</strong>
                <EditorReader
                  ref={purposeRef}
                  initialEditorState={thisRequest.purpose}
                />
              </>
            )}
            {thisRequest.criteria && (
              <>
                <strong className="p-2">Criteria</strong>
                <EditorReader
                  ref={criteriaRef}
                  initialEditorState={thisRequest.criteria}
                />
              </>
            )}
            {thisRequest.parameters && (
              <>
                <strong className="p-2">Parameters</strong>
                <EditorReader
                  ref={parametersRef}
                  initialEditorState={thisRequest.parameters}
                />
              </>
            )}
            {thisRequest.purpose && (
              <>
                <strong className="p-2">Purpose</strong>
                <EditorReader
                  ref={purposeRef}
                  initialEditorState={thisRequest.purpose}
                />
              </>
            )}
            {thisRequest.schedule && (
              <>
                <strong className="p-2">Schedule</strong>
                <EditorReader
                  ref={scheduleRef}
                  initialEditorState={thisRequest.schedule}
                />
              </>
            )}
          </div>
        </div>
        <div className="column is-one-third">
          <Form method="post">
            <button
              type="submit"
              className="rounded bg-blue-500  py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400"
            >
              Delete
            </button>
          </Form>
          <p>{thisRequest.exportToExcel}</p>
          <p>{thisRequest.supportsInitiative}</p>
          <p>{thisRequest.regulatory}</p>
          <strong>Watchers</strong>
          <br />
          <strong>Requester</strong>
          <br />
          <strong>Requested For</strong>
          <br />
        </div>
      </div>
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

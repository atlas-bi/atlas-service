import { faBell } from '@fortawesome/free-regular-svg-icons';
import { faPencil } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  type ActionArgs,
  type LoaderArgs,
  json,
  redirect,
} from '@remix-run/node';
import { Form, useActionData, useCatch, useLoaderData } from '@remix-run/react';
import { useSubmit, useTransition } from '@remix-run/react';
import * as React from 'react';
import invariant from 'tiny-invariant';
import {
  deleteRequest,
  editRequester,
  getRequest,
} from '~/models/request.server';
import { authorize, requireUser } from '~/session.server';

import EditorReader from '../../components/EditorReader';
import { RequesterSelector } from '../../components/Requester';
import { MiniUser } from '../../components/User';

export async function loader({ request, params }: LoaderArgs) {
  return authorize(
    request,
    undefined,
    async ({ user, session }: { user: User; session: Session }) => {
      invariant(params.requestId, 'requestId not found');

      const thisRequest = await getRequest({
        id: Number(params.requestId),
      });
      if (!thisRequest) {
        throw new Response('Not Found', { status: 404 });
      }
      return json({
        user,
        thisRequest,
        ENV: { MEILISEARCH_URL: process.env.MEILISEARCH_URL },
      });
    },
  );
}

export async function action({ request, params }: ActionArgs) {
  console.log('action!');
  const user = await requireUser(request);
  const userId = user?.id;
  invariant(params.requestId, 'requestId not found');

  const formData = await request.formData();
  const { _action, ...values } = Object.fromEntries(formData);

  const errors: Errors = {};

  switch (_action) {
    case 'editRequester': {
      console.log('changing requester');
      console.log(values);
      const requestedFor = Number(values.requestedFor);
      await editRequester({
        requestedFor,
        userId,
        id: Number(params.requestId),
      });
      break;
    }
  }
  return null;
  // await deleteRequest({ userId, id: Number(params.requestId) });

  // return redirect('/');
}

export default function RequestDetailsPage() {
  const { thisRequest, ENV, user } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const descriptionRef = React.useRef<HTMLInputElement>(null);
  const purposeRef = React.useRef<HTMLInputElement>(null);
  const criteriaRef = React.useRef<HTMLInputElement>(null);
  const parametersRef = React.useRef<HTMLInputElement>(null);
  const scheduleRef = React.useRef<HTMLInputElement>(null);
  const changeRequester = React.useRef<HTMLFormElement>(null);
  const requestedForRef = React.useRef<HTMLInputElement>(null);
  const [requesterSearchResults, setRequesterSearchResults] =
    React.useState(null);

  const [requester, setRequester] = React.useState(thisRequest.requester);
  const requesterPopout = React.useRef<HTMLDivElement>();

  const submitRequester = useSubmit();

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

          <Form method="post" ref={changeRequester}>
            <input type="hidden" name="_action" value="editRequester" />
            <RequesterSelector
              onChange={() => {
                submitRequester(changeRequester.current, { replace: true });
              }}
              action="editRequester"
              me={user}
              ref={requestedForRef}
              user={thisRequest.requester}
              actionData={actionData}
              MEILISEARCH_URL={ENV.MEILISEARCH_URL}
            />
          </Form>

          <strong>Requested For</strong>
          <br />

          <button className="button">
            <span className="icon">
              <FontAwesomeIcon icon={faBell} size="lg" />
            </span>
            <span>subscribe</span>
          </button>
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

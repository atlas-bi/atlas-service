import {
  type ActionArgs,
  type LoaderArgs,
  json,
  redirect,
} from '@remix-run/node';
import {
  Form,
  useActionData,
  useCatch,
  useLoaderData,
  useSubmit,
} from '@remix-run/react';
import { $getRoot, CLEAR_HISTORY_COMMAND, type EditorState } from 'lexical';
import { MeiliSearch } from 'meilisearch';
import * as React from 'react';
import { namedAction } from 'remix-utils';
import invariant from 'tiny-invariant';
import {
  deleteRequest,
  editAssignees,
  editLabels,
  editRecipients,
  editRequester,
  editWatch,
  getRequest,
} from '~/models/request.server';
import { labelIndex, userIndex } from '~/search.server';
import { authorize, requireUser } from '~/session.server';

import { AssigneeSelector } from '../../components/Assignees';
import Editor from '../../components/Editor';
import EditorReader from '../../components/EditorReader';
import { LabelSelector } from '../../components/Labels';
import { RecipientSelector } from '../../components/Recipients';
import { RequesterSelector } from '../../components/Requester';
import { WatcherList } from '../../components/Watchers';

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

      const client = new MeiliSearch({
        host: process.env.MEILISEARCH_URL,
        apiKey: process.env.MEILI_MASTER_KEY,
      });
      const keys = await client.getKeys();

      return json({
        user,
        thisRequest,
        MEILISEARCH_URL: process.env.MEILISEARCH_URL,
        MEILISEARCH_KEY: keys.results.filter(
          (x) => x.name === 'Default Search API Key',
        )[0].key,
        search: { labelIndex, userIndex },
      });
    },
  );
}

export async function action({ request, params }: ActionArgs) {
  const user = await requireUser(request);
  const userId = user?.id;
  invariant(params.requestId, 'requestId not found');

  return namedAction(request, {
    async editRequester() {
      const formData = await request.formData();
      const { _action, ...values } = Object.fromEntries(formData);
      const requestedFor = Number(values.requestedFor);

      await editRequester({
        requestedFor,
        userId,
        id: Number(params.requestId),
      });
      return null;
    },
    async editRecipients() {
      const formData = await request.formData();
      const { _action, ...values } = Object.fromEntries(formData);
      await editRecipients({
        recipients: formData.getAll('recipients'),
        userId,
        id: Number(params.requestId),
      });
      return null;
    },
    async editLabels() {
      const formData = await request.formData();
      const { _action, ...values } = Object.fromEntries(formData);
      console.log(formData.getAll('labels'));
      await editLabels({
        labels: formData.getAll('labels'),
        userId,
        id: Number(params.requestId),
      });
      return null;
    },
    async editAssignees() {
      const formData = await request.formData();
      const { _action, ...values } = Object.fromEntries(formData);
      console.log('edit assignees', values);
      await editAssignees({
        assignees: formData.getAll('assignees'),
        userId,
        id: Number(params.requestId),
      });
      return null;
    },
    async editWatcher() {
      console.log('edit watcher');
      const formData = await request.formData();
      const { _action, ...values } = Object.fromEntries(formData);
      console.log(values);
      await editWatch({
        userId,
        watch: values.watch === 'true',
        id: Number(params.requestId),
      });
      return null;
    },
    async delete() {
      console.log('deleting');
      await deleteRequest({
        id: Number(params.requestId),
      });
      return redirect('/');
    },
    async comment() {
      console.log('comment!');
      const formData = await request.formData();
      const { _action, ...values } = Object.fromEntries(formData);
      console.log(values);
      return null;
    },
  });
}

export default function RequestDetailsPage() {
  const { thisRequest, MEILISEARCH_URL, MEILISEARCH_KEY, user, search } =
    useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const descriptionRef = React.useRef<HTMLInputElement>(null);
  const purposeRef = React.useRef<HTMLInputElement>(null);
  const criteriaRef = React.useRef<HTMLInputElement>(null);
  const parametersRef = React.useRef<HTMLInputElement>(null);
  const scheduleRef = React.useRef<HTMLInputElement>(null);
  const changeRequester = React.useRef<HTMLFormElement>(null);
  const changeRecipients = React.useRef<HTMLFormElement>(null);
  const changeAssignees = React.useRef<HTMLFormElement>(null);
  const changeWatcher = React.useRef<HTMLFormElement>(null);
  const changeLabels = React.useRef<HTMLFormElement>(null);
  const requestedForRef = React.useRef<HTMLInputElement>(null);

  const newCommentEditor = React.useRef<HTMLDivElement>();
  const [comment, setComment] = React.useState('');
  const commentTextRef = React.useRef<HTMLInputElement>();

  const formSubmitter = useSubmit();

  return (
    <div className="container">
      <div className="columns">
        <div className="column">
          <div className="is-flex is-justify-content-space-between">
            <h3 className="title is-3 pl-4">{thisRequest.name}</h3>
            <Form method="post">
              <button
                type="submit"
                name="_action"
                value="delete"
                className="button is-ghost has-text-link"
              >
                delete
              </button>
            </Form>
          </div>

          <article className="media ">
            {user.profilePhoto && (
              <div className="media-left my-auto">
                <figure className="image is-48x48">
                  <img
                    decoding="async"
                    loading="lazy"
                    alt="profile"
                    className="remix-image is-rounded profile"
                    src={`data:image/png;base64,${user.profilePhoto}`}
                  />
                </figure>
              </div>
            )}
            <div className="media-content my-auto">
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
          </article>

          <hr />
          <div className="thread-box">
            <Editor
              ref={newCommentEditor}
              userIndex={search.userIndex}
              activeEditor={newCommentEditor}
              MEILISEARCH_URL={MEILISEARCH_URL}
              MEILISEARCH_KEY={MEILISEARCH_KEY}
              onChange={(editorState: EditorState) => {
                editorState.read(() => {
                  if (commentTextRef.current) {
                    commentTextRef.current.value = $getRoot().getTextContent();
                  }
                });

                setComment(JSON.stringify(editorState));
              }}
            />

            <input type="hidden" ref={commentTextRef} name="commentText" />
            <button
              type="button"
              className="button is-success is-short m-2"
              onClick={() => {
                const formData = new FormData();
                formData.append('_action', 'comment');
                formData.append('comment', comment);
                if (newCommentEditor.current) {
                  const editor = newCommentEditor.current;
                  editor.update(() => {
                    $getRoot().clear();
                  });
                  editor.dispatchCommand(CLEAR_HISTORY_COMMAND, undefined);
                }

                formSubmitter(formData, { replace: true, method: 'post' });
              }}
            >
              Comment
            </button>
          </div>
        </div>
        <div className="column is-one-third">
          <p>{thisRequest.exportToExcel}</p>
          <p>{thisRequest.supportsInitiative}</p>
          <p>{thisRequest.regulatory}</p>

          <Form method="post" ref={changeRequester}>
            <input type="hidden" name="_action" value="editRequester" />
            <RequesterSelector
              onChange={() => {
                formSubmitter(changeRequester.current, { replace: true });
              }}
              action="editRequester"
              me={user}
              ref={requestedForRef}
              user={thisRequest.requester}
              actionData={actionData}
              MEILISEARCH_URL={MEILISEARCH_URL}
              MEILISEARCH_KEY={MEILISEARCH_KEY}
              searchIndex={search.userIndex}
            />
          </Form>

          <Form method="post" ref={changeRecipients}>
            <input type="hidden" name="_action" value="editRecipients" />
            <RecipientSelector
              onChange={() => {
                formSubmitter(changeRecipients.current, { replace: true });
              }}
              action="editRecipients"
              recipients={thisRequest.recipients}
              me={user}
              actionData={actionData}
              MEILISEARCH_URL={MEILISEARCH_URL}
              MEILISEARCH_KEY={MEILISEARCH_KEY}
              searchIndex={search.userIndex}
            />
          </Form>

          <Form method="post" ref={changeLabels}>
            <input type="hidden" name="_action" value="editLabels" />
            <LabelSelector
              onChange={() => {
                formSubmitter(changeLabels.current, { replace: true });
              }}
              labels={thisRequest.labels}
              actionData={actionData}
              MEILISEARCH_URL={MEILISEARCH_URL}
              MEILISEARCH_KEY={MEILISEARCH_KEY}
              searchIndex={search.labelIndex}
              action="editLabels"
            />
          </Form>
          <Form method="post" ref={changeAssignees}>
            <input type="hidden" name="_action" value="editAssignees" />
            <AssigneeSelector
              onChange={() => {
                formSubmitter(changeAssignees.current, { replace: true });
              }}
              action="editAssignees"
              assignees={thisRequest.assignees}
              me={user}
              actionData={actionData}
              MEILISEARCH_URL={MEILISEARCH_URL}
              MEILISEARCH_KEY={MEILISEARCH_KEY}
              searchIndex={search.userIndex}
            />
          </Form>

          <WatcherList
            me={user}
            watchers={thisRequest.watchers}
            action="editWatcher"
          />
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

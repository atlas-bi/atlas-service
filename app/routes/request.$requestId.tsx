// import {
//   faAtom,
//   faEnvelopesBulk,
//   faLifeRing,
//   faTag,
// } from '@fortawesome/free-solid-svg-icons';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  type ActionArgs,
  type LoaderArgs,
  json,
  redirect,
} from '@remix-run/node';
import {
  Form,
  isRouteErrorResponse,
  useActionData,
  useCatch,
  useLoaderData,
  useRouteError,
  useSubmit,
} from '@remix-run/react';
import { $getRoot, CLEAR_HISTORY_COMMAND, type EditorState } from 'lexical';
import { AtSign, LifeBuoy, Send, Tag } from 'lucide-react';
import { MeiliSearch } from 'meilisearch';
import * as React from 'react';
import { namedAction } from 'remix-utils';
import invariant from 'tiny-invariant';
import { AssigneeSelector } from '~/components/Assignees';
import { RelativeDate } from '~/components/Date';
import Editor from '~/components/Editor';
import EditorReader from '~/components/EditorReader';
import { LabelTag } from '~/components/Labels';
import { LabelSelector } from '~/components/Labels';
import { ProfilePhoto } from '~/components/Photo';
import { RecipientSelector } from '~/components/Recipients';
import { RequesterSelector } from '~/components/Requester';
import { InlineUser } from '~/components/User';
import { WatcherList } from '~/components/Watchers';
import { createLabel } from '~/models/label.server';
import {
  addComment,
  deleteRequest,
  editAssignees,
  editLabels,
  editRecipients,
  editRequester,
  editWatch,
  getRequest,
} from '~/models/request.server';
import { groupIndex, labelIndex, userIndex } from '~/search.server';
import { authorize, requireUser } from '~/session.server';

export async function loader({ request, params }: LoaderArgs) {
  return authorize(
    request,
    undefined,
    async ({ user, session }: { user: User; session: Session }) => {
      invariant(params.requestId, 'requestId not found');

      const thisRequest = await getRequest({
        id: Number(params.requestId),
        user,
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
        search: { labelIndex, userIndex, groupIndex },
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
      await editAssignees({
        assignees: formData.getAll('assignees'),
        userId,
        id: Number(params.requestId),
      });
      return null;
    },
    async editWatcher() {
      const formData = await request.formData();
      const { _action, ...values } = Object.fromEntries(formData);

      await editWatch({
        userId,
        watch: values.watch === 'true',
        id: Number(params.requestId),
      });
      return null;
    },
    async delete() {
      await deleteRequest({
        id: Number(params.requestId),
      });
      return redirect('/');
    },
    async comment() {
      const formData = await request.formData();
      const { _action, ...values } = Object.fromEntries(formData);

      await addComment({
        requestId: Number(params.requestId),
        comment: values.comment,
        userId,
      });
      return null;
    },
    async newLabel() {
      const formData = await request.formData();
      const { name, description, color, groups } = Object.fromEntries(formData);

      return json(
        {
          newLabel: await createLabel({
            userId,
            name: name as string,
            description: description as string | null,
            color: color as string | null,
            groups: JSON.parse(groups || '[]'),
          }),
        },
        { status: 200 },
      );
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

  const history = [
    ...thisRequest.recipientHistory.map((x) => {
      return { type: 'recipientHistory', ...x };
    }),
    ...thisRequest.requesterHistory.map((x) => {
      return { type: 'requesterHistory', ...x };
    }),
    ...thisRequest.assigneeHistory.map((x) => {
      return { type: 'assigneeHistory', ...x };
    }),
    ...thisRequest.comments.map((x) => {
      return { type: 'comment', ...x };
    }),
    ...thisRequest.labelHistory.map((x) => {
      return { type: 'labelHistory', ...x };
    }),
  ].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  return (
    <div className="container">
      <div className="columns">
        <div className="column">
          <div className="is-flex is-justify-content-space-between">
            <h3 className="title is-3">{thisRequest.name}</h3>
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

          <div className="timeline">
            <article className="media thread">
              <div className="media-left profile-photo">
                <figure className="image is-48x48">
                  <ProfilePhoto base64={thisRequest.creator?.profilePhoto} />
                </figure>
                {thisRequest.creator?.id !== thisRequest.requester?.id && (
                  <figure className="image is-48x48">
                    <ProfilePhoto
                      base64={thisRequest.requester?.profilePhoto}
                    />
                  </figure>
                )}
              </div>
              <div className="media-content my-auto">
                <div
                  className={`thread-box ${
                    thisRequest.creator?.id === user.id
                      ? 'has-background-info-light'
                      : 'has-background-white-bis'
                  }`}
                >
                  <div className="p-3 is-flex is-justify-content-space-between has-border-bottom-grey-lighter">
                    <span>
                      <strong>
                        {thisRequest.creator?.id == user.id ? (
                          'You'
                        ) : (
                          <>
                            {thisRequest.creator?.firstName}{' '}
                            {thisRequest.creator?.lastName}
                          </>
                        )}
                      </strong>
                      {thisRequest.requester?.id !==
                        thisRequest.creator?.id && (
                        <>
                          {' '}
                          created this request on behalf of{' '}
                          <strong>
                            {thisRequest.requester?.firstName}{' '}
                            {thisRequest.requester?.lastName}
                          </strong>
                        </>
                      )}{' '}
                      <RelativeDate date={thisRequest.createdAt} />
                    </span>
                    <div className="tags">
                      {thisRequest.requester?.id ===
                        thisRequest.creator?.id && (
                        <div className="tag is-rounded has-border-grey-lighter">
                          Requester
                        </div>
                      )}
                      {thisRequest.assignees?.filter(
                        (assignee) => assignee.id === thisRequest.creator?.id,
                      ).length > 0 && (
                        <div className="tag is-rounded has-border-grey-lighter">
                          Analyst
                        </div>
                      )}
                    </div>
                  </div>
                  <div
                    className="has-background-white"
                    style={{ borderRadius: 'inherit' }}
                  >
                    {thisRequest.description && (
                      <>
                        <strong className="is-block pt-2 px-3">
                          Description
                        </strong>
                        <EditorReader
                          ref={descriptionRef}
                          initialEditorState={thisRequest.description}
                        />
                      </>
                    )}
                    {thisRequest.purpose && (
                      <>
                        <strong className="is-block pt-2 px-3">Purpose</strong>
                        <EditorReader
                          ref={purposeRef}
                          initialEditorState={thisRequest.purpose}
                        />
                      </>
                    )}
                    {thisRequest.criteria && (
                      <>
                        <strong className="is-block pt-2 px-3">Criteria</strong>
                        <EditorReader
                          ref={criteriaRef}
                          initialEditorState={thisRequest.criteria}
                        />
                      </>
                    )}
                    {thisRequest.parameters && (
                      <>
                        <strong className="is-block pt-2 px-3">
                          Parameters
                        </strong>
                        <EditorReader
                          ref={parametersRef}
                          initialEditorState={thisRequest.parameters}
                        />
                      </>
                    )}
                    {thisRequest.purpose && (
                      <>
                        <strong className="is-block pt-2 px-3">Purpose</strong>
                        <EditorReader
                          ref={purposeRef}
                          initialEditorState={thisRequest.purpose}
                        />
                      </>
                    )}
                    {thisRequest.schedule && (
                      <>
                        <strong className="is-block pt-2 px-3">Schedule</strong>
                        <EditorReader
                          ref={scheduleRef}
                          initialEditorState={thisRequest.schedule}
                        />
                      </>
                    )}
                  </div>
                </div>
              </div>
            </article>

            {history.length > 0 &&
              history.map((item) => (
                <React.Fragment key={item.type + item.id}>
                  {item.type === 'comment' ? (
                    <article key={item.id} className="media thread">
                      <div className="media-left">
                        <figure className="image is-48x48">
                          <ProfilePhoto base64={item.creator?.profilePhoto} />
                        </figure>
                      </div>
                      <div className="media-content my-auto">
                        <div
                          className={`thread-box ${
                            item.creator?.id === user.id
                              ? 'has-background-info-light'
                              : 'has-background-white-bis'
                          }`}
                        >
                          <div className="p-3 is-flex is-justify-content-space-between has-border-bottom-grey-lighter">
                            <span>
                              <strong>
                                {item.creator?.firstName}{' '}
                                {item.creator?.lastName}
                              </strong>{' '}
                              <RelativeDate date={item.createdAt} />
                            </span>
                            <div className="tags">
                              {thisRequest.requester?.id ===
                                item.creator?.id && (
                                <div className="tag is-rounded has-border-grey-lighter">
                                  Requester
                                </div>
                              )}
                              {thisRequest.assignees?.filter(
                                (assignee) => assignee.id === item.creator?.id,
                              ).length > 0 && (
                                <div className="tag is-rounded has-border-grey-lighter">
                                  Analyst
                                </div>
                              )}
                            </div>
                          </div>
                          <EditorReader
                            key={item.id}
                            initialEditorState={item.comment}
                          />
                        </div>
                      </div>
                    </article>
                  ) : item.type === 'labelHistory' ? (
                    <div className="history">
                      <span className="icon has-text-grey-lighter mr-3 has-background-white">
                        <Tag color="grey" size={14} />
                      </span>
                      <InlineUser user={item.creator} />
                      &nbsp;{item.added ? 'added' : 'removed'}&nbsp;
                      <LabelTag label={item.label} />
                      &nbsp;label&nbsp;
                      <RelativeDate date={item.createdAt} />
                    </div>
                  ) : item.type === 'assigneeHistory' ? (
                    <div className="history">
                      <span className="icon has-text-grey-lighter mr-3 has-background-white">
                        <AtSign color="grey" size={14} />
                      </span>
                      <InlineUser user={item.creator} />
                      &nbsp;{item.added ? 'assigned' : 'unassigned'}&nbsp;
                      {item.assignee.firstName}&nbsp;{item.assignee.lastName}
                      &nbsp;
                      <RelativeDate date={item.createdAt} />
                    </div>
                  ) : item.type === 'requesterHistory' ? (
                    <div className="history">
                      <span className="icon has-text-grey-lighter mr-3 has-background-white">
                        <LifeBuoy color="grey" size={14} />
                      </span>
                      <InlineUser user={item.creator} />
                      &nbsp;changed the requester to&nbsp;
                      {item.requester.firstName}&nbsp;{item.requester.lastName}
                      &nbsp;
                      <RelativeDate date={item.createdAt} />
                    </div>
                  ) : (
                    item.type === 'recipientHistory' && (
                      <div className="history">
                        <span className="icon has-text-grey-lighter mr-3 has-background-white">
                          <Send color="grey" size={14} />
                        </span>
                        <InlineUser user={item.creator} />
                        &nbsp;{item.added ? 'added' : 'removed'}
                        &nbsp;recipient&nbsp;{item.recipient.firstName}&nbsp;
                        {item.recipient.lastName}&nbsp;
                        <RelativeDate date={item.createdAt} />
                      </div>
                    )
                  )}
                </React.Fragment>
              ))}
          </div>

          <hr />
          <div className="thread-box new">
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
              groupIndex={search.groupIndex}
              action="newLabel"
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

export function ErrorBoundary() {
  const error = useRouteError();
  console.error(error);

  // when true, this is what used to go to `CatchBoundary`
  if (isRouteErrorResponse(error)) {
    return (
      <div>
        <h1>Oops</h1>
        <p>Status: {error.status}</p>
        <p>{error.data.message}</p>
      </div>
    );
  }

  // Don't forget to typecheck with your own logic.
  // Any value can be thrown, not just errors!
  let errorMessage = 'Unknown error';
  if (isDefinitelyAnError(error)) {
    errorMessage = error.message;
  }

  return (
    <div>
      <h1>Uh oh ...</h1>
      <p>Something went wrong.</p>
      <pre>{errorMessage}</pre>
    </div>
  );
}

export function CatchBoundary() {
  const caught = useCatch();

  if (caught.status === 404) {
    return <div>Request not found</div>;
  }

  throw new Error(`Unexpected caught response with status: ${caught.status}`);
}

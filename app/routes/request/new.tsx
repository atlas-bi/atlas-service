import type { Label, RequestType, User } from '@prisma/client';
import {
  type ActionArgs,
  type LoaderArgs,
  type Session,
  json,
  redirect,
} from '@remix-run/node';
import { Form, useActionData, useLoaderData } from '@remix-run/react';
import { $getRoot, type EditorState } from 'lexical';
import { MeiliSearch } from 'meilisearch';
import * as React from 'react';
import { EmojiFinder } from '~/components/Emoji';
import { getRequestType, getRequestTypes } from '~/models/config.server';
import { createLabel } from '~/models/label.server';
import { createRequest } from '~/models/request.server';
import { labelIndex, userIndex } from '~/search.server';
import { authorize, requireUser } from '~/session.server';

import { AssigneeSelector } from '../../components/Assignees';
import Editor from '../../components/Editor';
import { LabelSelector } from '../../components/Labels';
import { RecipientSelector } from '../../components/Recipients';
import { RequesterSelector } from '../../components/Requester';

export async function loader({ request }: LoaderArgs) {
  return authorize(
    request,
    undefined,
    async ({ user, session }: { user: User; session: Session }) => {
      // here we can get the data for this route and return it
      const requestTypes = await getRequestTypes();

      const url = new URL(request.url);

      const defaultType = Number(url.searchParams.get('type'));

      const selectedType =
        requestTypes.filter((rt: RequestType) => rt.id === defaultType)[0] ||
        requestTypes[0];

      const client = new MeiliSearch({
        host: process.env.MEILISEARCH_URL,
        apiKey: process.env.MEILI_MASTER_KEY,
      });
      const keys = await client.getKeys();

      return json({
        requestTypes,
        user,
        selectedType,
        MEILISEARCH_URL: process.env.MEILISEARCH_URL,
        MEILISEARCH_KEY: keys.results.filter(
          (x) => x.name === 'Default Search API Key',
        )[0].key,
        search: { labelIndex, userIndex },
      });
    },
  );
}

type Errors = {
  name?: string;
  requestedFor?: string;
  type?: string;
  recipients?: string;
  labels?: string;
  description?: string;
  purpose?: string;
  criteria?: string;
  parameters?: string;
  schedule?: string;
};
export async function action({ request }: ActionArgs) {
  const user = await requireUser(request);
  const userId = user?.id;

  const formData = await request.formData();
  const { _action } = Object.fromEntries(formData);

  if (_action === 'newLabel') {
    console.log('new label');

    const { name, description, color } = Object.fromEntries(formData);

    return json(
      {
        newLabel: await createLabel({
          userId,
          name: name as string,
          description: description as string | null,
          color: color as string | null,
        }),
      },
      { status: 200 },
    );
  } else if (_action !== 'newRequest') return null;

  const name = formData.get('name') as string;
  const requestedFor = formData.get('requestedFor') as string | null;
  const type = formData.get('type') as string;
  const recipients = formData.getAll('recipients') as string[] | null;
  const assignees = formData.getAll('assignees') as string[] | null;
  const labels = formData.getAll('labels') as string[] | null;
  const excel = formData.get('excel') as string | null;
  const initiative = formData.get('initiative') as string | null;
  const regulatory = formData.get('regulatory') as string | null;
  const description = formData.get('description') as string | null;
  const descriptionText = formData.get('descriptionText') as string | null;
  const purpose = formData.get('purpose') as string | null;
  const purposeText = formData.get('purposeText') as string | null;
  const criteria = formData.get('criteria') as string | null;
  const criteriaText = formData.get('criteriaText') as string | null;
  const parameters = formData.get('parameters') as string | null;
  const parametersText = formData.get('parametersText') as string | null;
  const schedule = formData.get('schedule') as string | null;
  const scheduleText = formData.get('scheduleText') as string | null;

  const requestType = await getRequestType({ id: Number(type) });

  const errors: Errors = {};

  if (typeof name !== 'string' || name.length === 0) {
    errors.name = 'Name is required';
  }
  if (
    requestType?.showRequester &&
    (typeof requestedFor !== 'string' || requestedFor.length === 0)
  ) {
    errors.requestedFor = 'Requested for is required';
  }

  if (
    requestType?.showRecipients &&
    (!recipients || typeof recipients !== 'object' || recipients.length === 0)
  ) {
    errors.recipients = 'Recipients are required';
  }
  if (
    requestType?.showLabels &&
    (!labels || typeof labels !== 'object' || labels.length === 0)
  ) {
    errors.labels = 'Labels are required';
  }

  if (
    requestType?.showDescription &&
    (typeof description !== 'string' ||
      description.length === 0 ||
      (JSON.parse(description).root?.children.length === 1 &&
        JSON.parse(description).root?.children[0].children.length === 0))
  ) {
    errors.description = 'Description is required';
  }
  if (
    requestType?.showPurpose &&
    (typeof purpose !== 'string' ||
      purpose.length === 0 ||
      (JSON.parse(purpose).root?.children.length === 1 &&
        JSON.parse(purpose).root?.children[0].children.length === 0))
  ) {
    errors.purpose = 'Purpose is required';
  }
  if (
    requestType?.showCriteria &&
    (typeof criteria !== 'string' ||
      criteria.length === 0 ||
      (JSON.parse(criteria).root?.children.length === 1 &&
        JSON.parse(criteria).root?.children[0].children.length === 0))
  ) {
    errors.criteria = 'Criteria is required';
  }
  if (
    requestType?.showParameters &&
    (typeof parameters !== 'string' ||
      parameters.length === 0 ||
      (JSON.parse(parameters).root?.children.length === 1 &&
        JSON.parse(parameters).root?.children[0].children.length === 0))
  ) {
    errors.parameters = 'Parameters is required';
  }
  if (
    requestType?.showSchedule &&
    (typeof schedule !== 'string' ||
      schedule.length === 0 ||
      (JSON.parse(schedule).root?.children.length === 1 &&
        JSON.parse(schedule).root?.children[0].children.length === 0))
  ) {
    errors.schedule = 'Schedule is required';
  }

  if (Object.keys(errors).length) {
    return json({ errors }, { status: 400 });
  }

  const thisRequest = await createRequest({
    name,
    userId,
    purpose,
    purposeText,
    schedule,
    scheduleText,
    parameters,
    parametersText,
    criteria,
    criteriaText,
    description,
    descriptionText,
    type,
    excel,
    initiative,
    regulatory,
    recipients,
    labels,
    assignees,
    watchers: [userId],
  });

  return redirect(`/request/${thisRequest.id}`);
}

export default function NewRequestPage() {
  const { user, selectedType, MEILISEARCH_URL, MEILISEARCH_KEY, search } =
    useLoaderData<typeof loader>();

  type ActionData = { errors?: Errors; newLabel?: Label } | undefined | null;

  const actionData = useActionData<ActionData>();

  const [name, setName] = React.useState('');
  const requestedForRef = React.useRef<HTMLInputElement>(null);
  const assigneeRef = React.useRef<HTMLInputElement>(null);
  const labelRef = React.useRef<HTMLInputElement>(null);
  const typeRef = React.useRef<HTMLSelectElement>(null);
  const nameRef = React.useRef<HTMLInputElement>(null);
  const recipientsRef = React.useRef<HTMLInputElement>(null);
  const excelRef = React.useRef<HTMLInputElement>(null);
  const initiativeRef = React.useRef<HTMLInputElement>(null);
  const regulatoryRef = React.useRef<HTMLInputElement>(null);
  const descriptionRef = React.useRef<HTMLInputElement>(null);
  const descriptionTextRef = React.useRef<HTMLInputElement>(null);
  const purposeRef = React.useRef<HTMLInputElement>(null);
  const purposeTextRef = React.useRef<HTMLInputElement>(null);
  const criteriaRef = React.useRef<HTMLInputElement>(null);
  const criteriaTextRef = React.useRef<HTMLInputElement>(null);
  const parametersRef = React.useRef<HTMLInputElement>(null);
  const parametersTextRef = React.useRef<HTMLInputElement>(null);
  const scheduleRef = React.useRef<HTMLInputElement>(null);
  const scheduleTextRef = React.useRef<HTMLInputElement>(null);

  const descriptionWarningRef = React.useRef<HTMLParagraphElement>(null);
  const purposeWarningRef = React.useRef<HTMLParagraphElement>(null);
  const criteriaWarningRef = React.useRef<HTMLParagraphElement>(null);
  const parametersWarningRef = React.useRef<HTMLParagraphElement>(null);
  const scheduleWarningRef = React.useRef<HTMLParagraphElement>(null);

  const descriptionEditor = React.useRef<HTMLDivElement>();
  const purposeEditor = React.useRef<HTMLDivElement>();
  const criteriaEditor = React.useRef<HTMLDivElement>();
  const parametersEditor = React.useRef<HTMLDivElement>();
  const scheduleEditor = React.useRef<HTMLDivElement>();

  const [activeEditor, setActiveEditor] = React.useState(descriptionEditor);

  React.useEffect(() => {
    if (actionData?.errors?.name) {
      nameRef.current?.focus();
    } else if (actionData?.errors?.requestedFor) {
      requestedForRef.current?.focus();
    } else if (actionData?.errors?.type) {
      typeRef.current?.focus();
    } else if (actionData?.errors?.description) {
      descriptionRef.current?.focus();
    } else if (actionData?.errors?.purpose) {
      purposeRef.current?.focus();
    } else if (actionData?.errors?.criteria) {
      criteriaRef.current?.focus();
    } else if (actionData?.errors?.parameters) {
      parametersRef.current?.focus();
    } else if (actionData?.errors?.schedule) {
      scheduleRef.current?.focus();
    } else if (actionData?.errors?.recipients) {
      recipientsRef.current?.focus();
    }
  }, [actionData]);

  const resetInput = (input: HTMLInputElement | HTMLTextAreaElement) => {
    input.classList.remove('is-danger');
    const field = input.closest('div.field');
    if (field) {
      const help = field.querySelector('p.help');

      if (help) {
        help.classList.add('is-hidden');
      }
    }
    input.removeAttribute('aria-invalid');
    input.removeAttribute('aria-errormessage');
  };

  return (
    <div className="container">
      <Form method="post" className="form">
        <input type="hidden" name="_action" value="newRequest" />
        <div className="columns">
          <div className="column">
            <h3 className="title is-3 mb-1">{selectedType.name}</h3>
            <div className="mt-1 mb-5 is-size-6">
              {selectedType.description}
            </div>
            <hr className="my-0" />
            <div className="mt-1 mb-5 is-size-6">
              Not what you're looking for?{' '}
              <span className="is-clickable has-text-link">
                Choose a different type.
              </span>
            </div>
            <input type="hidden" name="type" value={selectedType.id} />

            {/*<div className="field">
              <label className="label">Type</label>
              <div className="control is-expanded">
                <div className="select is-fullwidth">
                  <select
                    name="type"
                    ref={typeRef}
                    aria-invalid={actionData?.errors?.type ? true : undefined}
                    aria-errormessage={
                      actionData?.errors?.type ? 'is-danger' : undefined
                    }
                    className={`select ${
                      actionData?.errors?.type ? 'is-danger' : ''
                    }`}
                  >
                    {requestTypes &&
                      requestTypes.map((type: RequestType) => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>{' '}
              {actionData?.errors?.type && (
                <p className="help is-danger">{actionData.errors.type}</p>
              )}
            </div>*/}

            <div className="thread-box">
              <div className="field p-2">
                <div className="control">
                  <input
                    autoFocus
                    ref={nameRef}
                    aria-invalid={actionData?.errors?.name ? true : undefined}
                    aria-errormessage={
                      actionData?.errors?.name ? 'title-error' : undefined
                    }
                    className={`input ${
                      actionData?.errors?.name ? 'is-danger' : undefined
                    }`}
                    name="name"
                    type="text"
                    placeholder="✨ [ New Report ]"
                    value={name}
                    onInput={(
                      event: React.SyntheticEvent<HTMLInputElement>,
                    ) => {
                      const input = event.target as HTMLInputElement;
                      resetInput(input);
                    }}
                    onChange={(e) => {
                      setName(e.target.value);
                    }}
                  />
                  <EmojiFinder
                    input={nameRef.current}
                    value={name}
                    setter={setName}
                  />
                </div>
                {actionData?.errors?.name && (
                  <p className="help is-danger">{actionData.errors.name}</p>
                )}
              </div>
              {selectedType.showDescription && (
                <>
                  <label className="label pl-2">Description</label>
                  {actionData?.errors?.description && (
                    <p
                      ref={descriptionWarningRef}
                      className="pl-2 help is-danger"
                    >
                      {actionData.errors.description}
                    </p>
                  )}
                  <Editor
                    ref={descriptionEditor}
                    userIndex={search.userIndex}
                    activeEditor={activeEditor}
                    MEILISEARCH_URL={MEILISEARCH_URL}
                    MEILISEARCH_KEY={MEILISEARCH_KEY}
                    onChange={(editorState: EditorState) => {
                      setActiveEditor(descriptionEditor);
                      descriptionWarningRef.current?.remove();
                      editorState.read(() => {
                        if (descriptionTextRef.current) {
                          descriptionTextRef.current.value =
                            $getRoot().getTextContent();
                        }
                      });

                      if (descriptionRef.current)
                        descriptionRef.current.value =
                          JSON.stringify(editorState);
                    }}
                  />

                  <input
                    type="hidden"
                    ref={descriptionRef}
                    name="description"
                  />
                  <input
                    type="hidden"
                    ref={descriptionTextRef}
                    name="descriptionText"
                  />
                </>
              )}

              {selectedType.showPurpose && (
                <>
                  <label className="label pl-2">Purpose</label>
                  {actionData?.errors?.purpose && (
                    <p ref={purposeWarningRef} className="pl-2 help is-danger">
                      {actionData.errors.purpose}
                    </p>
                  )}
                  <Editor
                    ref={purposeEditor}
                    activeEditor={activeEditor}
                    userIndex={search.userIndex}
                    MEILISEARCH_URL={MEILISEARCH_URL}
                    MEILISEARCH_KEY={MEILISEARCH_KEY}
                    onChange={(editorState: EditorState) => {
                      setActiveEditor(purposeEditor);
                      purposeWarningRef.current?.remove();

                      editorState.read(() => {
                        if (purposeTextRef.current) {
                          purposeTextRef.current.value =
                            $getRoot().getTextContent();
                        }
                      });

                      if (purposeRef.current)
                        purposeRef.current.value = JSON.stringify(editorState);
                    }}
                  />

                  <input type="hidden" ref={purposeRef} name="purpose" />
                  <input
                    type="hidden"
                    ref={purposeTextRef}
                    name="purposeText"
                  />
                </>
              )}
              {selectedType.showCriteria && (
                <>
                  <label className="label pl-2">Criteria</label>
                  {actionData?.errors?.criteria && (
                    <p ref={criteriaWarningRef} className="pl-2 help is-danger">
                      {actionData.errors.criteria}
                    </p>
                  )}
                  <Editor
                    ref={criteriaEditor}
                    MEILISEARCH_URL={MEILISEARCH_URL}
                    MEILISEARCH_KEY={MEILISEARCH_KEY}
                    activeEditor={activeEditor}
                    userIndex={search.userIndex}
                    onChange={(editorState: EditorState) => {
                      setActiveEditor(criteriaEditor);
                      criteriaWarningRef.current?.remove();
                      editorState.read(() => {
                        if (criteriaTextRef.current) {
                          criteriaTextRef.current.value =
                            $getRoot().getTextContent();
                        }
                      });

                      if (criteriaRef.current)
                        criteriaRef.current.value = JSON.stringify(editorState);
                    }}
                  />

                  <input type="hidden" ref={criteriaRef} name="criteria" />
                  <input
                    type="hidden"
                    ref={criteriaTextRef}
                    name="criteriaText"
                  />
                </>
              )}
              {selectedType.showParameters && (
                <>
                  <label className="label pl-2">Parameters</label>
                  {actionData?.errors?.parameters && (
                    <p
                      ref={parametersWarningRef}
                      className="pl-2 help is-danger"
                    >
                      {actionData.errors.parameters}
                    </p>
                  )}
                  <Editor
                    ref={parametersEditor}
                    MEILISEARCH_URL={MEILISEARCH_URL}
                    MEILISEARCH_KEY={MEILISEARCH_KEY}
                    activeEditor={activeEditor}
                    userIndex={search.userIndex}
                    onChange={(editorState: EditorState) => {
                      setActiveEditor(parametersEditor);
                      parametersWarningRef.current?.remove();
                      editorState.read(() => {
                        if (parametersTextRef.current) {
                          parametersTextRef.current.value =
                            $getRoot().getTextContent();
                        }
                      });
                      if (parametersRef.current)
                        parametersRef.current.value =
                          JSON.stringify(editorState);
                    }}
                  />

                  <input type="hidden" ref={parametersRef} name="parameters" />
                  <input
                    type="hidden"
                    ref={parametersTextRef}
                    name="parametersText"
                  />
                </>
              )}
              {selectedType.showSchedule && (
                <>
                  <label className="pl-2 label">Schedule</label>
                  {actionData?.errors?.schedule && (
                    <p ref={scheduleWarningRef} className="pl-2 help is-danger">
                      {actionData?.errors?.schedule}
                    </p>
                  )}
                  <Editor
                    ref={scheduleEditor}
                    activeEditor={activeEditor}
                    userIndex={search.userIndex}
                    MEILISEARCH_URL={MEILISEARCH_URL}
                    MEILISEARCH_KEY={MEILISEARCH_KEY}
                    onChange={(editorState: EditorState) => {
                      setActiveEditor(scheduleEditor);
                      scheduleWarningRef.current?.remove();
                      editorState.read(() => {
                        if (scheduleTextRef.current) {
                          scheduleTextRef.current.value =
                            $getRoot().getTextContent();
                        }
                      });
                      if (scheduleRef.current)
                        scheduleRef.current.value = JSON.stringify(editorState);
                    }}
                  />

                  <input type="hidden" ref={scheduleRef} name="schedule" />
                  <input
                    type="hidden"
                    ref={scheduleTextRef}
                    name="scheduleText"
                  />
                </>
              )}
              <hr className="mb-0 mx-2" />
              <button type="submit" className="button is-success is-short m-2">
                Save
              </button>
            </div>
          </div>

          <div className="column is-one-quarter">
            {selectedType.showRequester && (
              <RequesterSelector
                ref={requestedForRef}
                me={user}
                user={user}
                actionData={actionData}
                MEILISEARCH_URL={MEILISEARCH_URL}
                MEILISEARCH_KEY={MEILISEARCH_KEY}
                searchIndex={search.userIndex}
                action="newRequester"
              />
            )}

            {selectedType.showRecipients && (
              <RecipientSelector
                ref={recipientsRef}
                me={user}
                actionData={actionData}
                MEILISEARCH_URL={MEILISEARCH_URL}
                MEILISEARCH_KEY={MEILISEARCH_KEY}
                searchIndex={search.userIndex}
                action="newRecipient"
              />
            )}
            {selectedType.showLabels && (
              <LabelSelector
                ref={labelRef}
                labels={undefined}
                actionData={actionData}
                MEILISEARCH_URL={MEILISEARCH_URL}
                MEILISEARCH_KEY={MEILISEARCH_KEY}
                searchIndex={search.labelIndex}
                action="newLabel"
              />
            )}
            {selectedType.showExportToExcel && (
              <>
                <div className="field">
                  <div className="control">
                    <label className="checkbox">
                      <input type="checkbox" ref={excelRef} name="excel" />
                      Export To Excel
                    </label>
                  </div>
                </div>
              </>
            )}
            {selectedType.showRegulatory && (
              <>
                <div className="field">
                  <div className="control">
                    <label className="checkbox">
                      <input
                        type="checkbox"
                        ref={regulatoryRef}
                        name="regulatory"
                      />
                      Regulatory
                    </label>
                  </div>
                </div>
              </>
            )}
            {selectedType.showInitiative && (
              <>
                <div className="field">
                  <div className="control">
                    <label className="checkbox">
                      <input
                        type="checkbox"
                        ref={initiativeRef}
                        name="initiative"
                      />
                      Supports an Initiative
                    </label>
                  </div>
                </div>
              </>
            )}

            <AssigneeSelector
              ref={assigneeRef}
              me={user}
              user={user}
              actionData={actionData}
              MEILISEARCH_URL={MEILISEARCH_URL}
              MEILISEARCH_KEY={MEILISEARCH_KEY}
              searchIndex={search.userIndex}
              action="newAssignee"
            />
          </div>
        </div>
      </Form>
    </div>
  );
}

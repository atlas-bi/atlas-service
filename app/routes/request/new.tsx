import type { RequestType, User } from '@prisma/client';
import {
  type ActionArgs,
  type LoaderArgs,
  type Session,
  json,
  redirect,
} from '@remix-run/node';
import { Form, useActionData, useLoaderData } from '@remix-run/react';
import type { EditorState } from 'lexical';
import * as React from 'react';
import { getRequestTypes } from '~/models/config.server';
import { createRequest } from '~/models/request.server';
import { authorize, requireUser } from '~/session.server';

import Editor from '../../components/Editor';

export async function loader({ request }: LoaderArgs) {
  return authorize(
    request,
    undefined,
    async ({ user, session }: { user: User; session: Session }) => {
      // here we can get the data for this route and return it
      const requestTypes = await getRequestTypes();

      return json({ requestTypes, user });
    },
  );
}

export async function action({ request }: ActionArgs) {
  const user = await requireUser(request);
  const userId = user?.id;

  const formData = await request.formData();

  const name = formData.get('name') as string;
  const requestedFor = formData.get('requestedFor');
  const type = formData.get('type');
  const recipients = formData.get('recipients');
  const excel = formData.get('excel');
  const initiative = formData.get('initiative');
  const regulatory = formData.get('regulatory');
  const description = formData.get('description');
  const purpose = formData.get('purpose');
  const criteria = formData.get('criteria');
  const parameters = formData.get('parameters');
  const schedule = formData.get('schedule');

  const errors: {
    name?: string;
    requestedFor?: string;
    type?: string;
    recipients?: string;
    description?: string;
    purpose?: string;
    criteria?: string;
    parameters?: string;
    schedule?: string;
  } = {};
  if (typeof name !== 'string' || name.length === 0) {
    errors.name = 'Name is required';
  }
  if (typeof requestedFor !== 'string' || requestedFor.length === 0) {
    errors.requestedFor = 'Requested for is required';
  }

  if (typeof type !== 'string' || type.length === 0) {
    errors.type = 'Type is required';
  }
  if (typeof recipients !== 'string' || recipients.length === 0) {
    errors.recipients = 'Recipients are required';
  }

  if (
    typeof description !== 'string' ||
    description.length === 0 ||
    (JSON.parse(description).root?.children.length === 1 &&
      JSON.parse(description).root?.children[0].children.length === 0)
  ) {
    errors.description = 'Description is required';
  }
  if (
    typeof purpose !== 'string' ||
    purpose.length === 0 ||
    (JSON.parse(purpose).root?.children.length === 1 &&
      JSON.parse(purpose).root?.children[0].children.length === 0)
  ) {
    errors.purpose = 'Purpose is required';
  }
  if (
    typeof criteria !== 'string' ||
    criteria.length === 0 ||
    (JSON.parse(criteria).root?.children.length === 1 &&
      JSON.parse(criteria).root?.children[0].children.length === 0)
  ) {
    errors.criteria = 'Criteria is required';
  }
  if (
    typeof parameters !== 'string' ||
    parameters.length === 0 ||
    (JSON.parse(parameters).root?.children.length === 1 &&
      JSON.parse(parameters).root?.children[0].children.length === 0)
  ) {
    errors.parameters = 'Parameters is required';
  }
  if (
    typeof schedule !== 'string' ||
    schedule.length === 0 ||
    (JSON.parse(schedule).root?.children.length === 1 &&
      JSON.parse(schedule).root?.children[0].children.length === 0)
  ) {
    errors.schedule = 'Schedule is required';
  }

  if (Object.keys(errors).length) {
    return json({ errors: errors }, { status: 400 });
  }

  const thisRequest = await createRequest({
    name,
    userId,
    purpose,
    schedule,
    parameters,
    criteria,
    description,
    type,
    excel,
    initiative,
    regulatory,
  });

  return redirect(`/request/${thisRequest.id}`);
}

export default function NewRequestPage() {
  const { requestTypes } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const requestedForRef = React.useRef<HTMLInputElement>(null);
  const typeRef = React.useRef<HTMLSelectElement>(null);
  const nameRef = React.useRef<HTMLInputElement>(null);
  const recipientsRef = React.useRef<HTMLInputElement>(null);
  const excelRef = React.useRef<HTMLInputElement>(null);
  const initiativeRef = React.useRef<HTMLInputElement>(null);
  const regulatoryRef = React.useRef<HTMLInputElement>(null);
  const descriptionRef = React.useRef<HTMLInputElement>(null);
  const purposeRef = React.useRef<HTMLInputElement>(null);
  const criteriaRef = React.useRef<HTMLInputElement>(null);
  const parametersRef = React.useRef<HTMLInputElement>(null);
  const scheduleRef = React.useRef<HTMLInputElement>(null);

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
        <div className="columns">
          <div className="column">
            <div className="title is-3">
              New Report [ this should by type, and be reselectable ]
            </div>

            <div className="field">
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
            </div>

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
                    onInput={(
                      event: React.SyntheticEvent<HTMLInputElement>,
                    ) => {
                      const input = event.target as HTMLInputElement;
                      resetInput(input);
                    }}
                  />
                </div>
                {actionData?.errors?.name && (
                  <p className="help is-danger">{actionData.errors.name}</p>
                )}
              </div>
              <label className="label pl-2">Description</label>
              {actionData?.errors?.description && (
                <p ref={descriptionWarningRef} className="pl-2 help is-danger">
                  {actionData.errors.description}
                </p>
              )}
              <Editor
                ref={descriptionEditor}
                activeEditor={activeEditor}
                onChange={(editorState: EditorState) => {
                  // console.log(purposeEditor.current)
                  setActiveEditor(descriptionEditor);
                  descriptionWarningRef.current?.remove();
                  if (descriptionRef.current)
                    descriptionRef.current.value = JSON.stringify(editorState);
                }}
              />

              <input type="hidden" ref={descriptionRef} name="description" />

              <label className="label pl-2">Purpose</label>
              {actionData?.errors?.purpose && (
                <p ref={purposeWarningRef} className="pl-2 help is-danger">
                  {actionData.errors.purpose}
                </p>
              )}
              <Editor
                ref={purposeEditor}
                activeEditor={activeEditor}
                onChange={(editorState: EditorState) => {
                  setActiveEditor(purposeEditor);
                  purposeWarningRef.current?.remove();
                  if (purposeRef.current)
                    purposeRef.current.value = JSON.stringify(editorState);
                }}
              />

              <input type="hidden" ref={purposeRef} name="purpose" />

              <label className="label pl-2">Criteria</label>
              {actionData?.errors?.criteria && (
                <p ref={criteriaWarningRef} className="pl-2 help is-danger">
                  {actionData.errors.criteria}
                </p>
              )}
              <Editor
                ref={criteriaEditor}
                activeEditor={activeEditor}
                onChange={(editorState: EditorState) => {
                  setActiveEditor(criteriaEditor);
                  criteriaWarningRef.current?.remove();
                  if (criteriaRef.current)
                    criteriaRef.current.value = JSON.stringify(editorState);
                }}
              />

              <input type="hidden" ref={criteriaRef} name="criteria" />

              <label className="label pl-2">Parameters</label>
              {actionData?.errors?.parameters && (
                <p ref={parametersWarningRef} className="pl-2 help is-danger">
                  {actionData.errors.parameters}
                </p>
              )}
              <Editor
                ref={parametersEditor}
                activeEditor={activeEditor}
                onChange={(editorState: EditorState) => {
                  setActiveEditor(parametersEditor);
                  parametersWarningRef.current?.remove();
                  if (parametersRef.current)
                    parametersRef.current.value = JSON.stringify(editorState);
                }}
              />

              <input type="hidden" ref={parametersRef} name="parameters" />

              <label className="pl-2 label">Schedule</label>
              {actionData?.errors?.schedule && (
                <p ref={scheduleWarningRef} className="pl-2 help is-danger">
                  {actionData.errors.schedule}
                </p>
              )}
              <Editor
                ref={scheduleEditor}
                activeEditor={activeEditor}
                onChange={(editorState: EditorState) => {
                  setActiveEditor(scheduleEditor);
                  scheduleWarningRef.current?.remove();
                  if (scheduleRef.current)
                    scheduleRef.current.value = JSON.stringify(editorState);
                }}
              />

              <input type="hidden" ref={scheduleRef} name="schedule" />

              <hr className="mb-0 mx-2" />
              <button type="submit" className="button is-success m-2">
                Save
              </button>
            </div>
          </div>

          <div className="column is-one-third">
            <div className="field">
              <label className="label">Requested For</label>
              <div className="control">
                <input
                  ref={requestedForRef}
                  name="requestedFor"
                  aria-invalid={
                    actionData?.errors?.requestedFor ? true : undefined
                  }
                  aria-errormessage={
                    actionData?.errors?.requestedFor ? 'is-danger' : undefined
                  }
                  className={`input ${
                    actionData?.errors?.requestedFor ? 'is-danger' : undefined
                  }`}
                  type="text"
                  placeholder="should search.. default to me"
                  onInput={(event: React.SyntheticEvent<HTMLInputElement>) => {
                    const input = event.target as HTMLInputElement;
                    resetInput(input);
                  }}
                />
              </div>
              {actionData?.errors?.requestedFor && (
                <p className="help is-danger">
                  {actionData.errors.requestedFor}
                </p>
              )}
            </div>

            <div className="field">
              <div className="control">
                <label className="checkbox">
                  <input type="checkbox" ref={excelRef} name="excel" />
                  Export To Excel
                </label>
              </div>
            </div>

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
            <div className="field">
              <label className="label">Recipients</label>
              <div className="control">
                <input
                  ref={recipientsRef}
                  name="recipients"
                  aria-invalid={
                    actionData?.errors?.recipients ? true : undefined
                  }
                  aria-errormessage={
                    actionData?.errors?.recipients ? 'is-danger' : undefined
                  }
                  className={`input ${
                    actionData?.errors?.recipients ? 'is-danger' : undefined
                  }`}
                  type="text"
                  placeholder="should search for people when you type"
                  onInput={(event: React.SyntheticEvent<HTMLInputElement>) => {
                    const input = event.target as HTMLInputElement;
                    resetInput(input);
                  }}
                />
              </div>
              {actionData?.errors?.recipients && (
                <p className="help is-danger">{actionData.errors.recipients}</p>
              )}
            </div>
          </div>
        </div>
      </Form>
    </div>
  );
}

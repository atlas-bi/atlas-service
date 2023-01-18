import type { ActionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import * as React from "react";
import { useLoaderData } from "@remix-run/react";

import { authorize } from "~/session.server";
import { getRequestTypes } from "~/models/config.server";

import { createRequest } from "~/models/request.server";
import { getUser } from "~/session.server";

export async function loader({ request }: LoaderArgs) {
  return authorize(request, undefined, async ({ user, session }) => {
    // here we can get the data for this route and return it
    const requestTypes = await getRequestTypes();
     return json({ requestTypes, user });
  });
}

export async function action({ request }: ActionArgs) {
  const user = await getUser(request);
  const userId = user.id;

  const formData = await request.formData();

  const name = formData.get('name')
  const requestedFor = formData.get('requestedFor')
  const type = formData.get('type')
  const recipients = formData.get('recipients')
  const excel = formData.get('excel')
  const initiative = formData.get('initiative')
  const regulatory = formData.get('regulatory')
  const devNotes = formData.get('devNotes')
  const description = formData.get('description')
  const purpose = formData.get('purpose')
  const criteria = formData.get('criteria')
  const parameters = formData.get('parameters')
  const schedule = formData.get('schedule')

  let errors = {};
  if (typeof name !== "string" || name.length === 0) {
    errors.name = "Name is required";
  }
  if (typeof requestedFor !== "string" || requestedFor.length === 0) {
    errors.requestedFor = "Requested for is required";
  }

  if (typeof type !== "string" || type.length === 0) {
    errors.type = "Type is required";
  }
  if (typeof recipients !== "string" || recipients.length === 0) {
    errors.recipients = "Recipients are required";
  }

  if (typeof description !== "string" || description.length === 0) {
    errors.description = "Description is required";
  }
  if (typeof purpose !== "string" || purpose.length === 0) {
    errors.purpose = "Purpose is required";
  }
  if (typeof criteria !== "string" || criteria.length === 0) {
    errors.criteria = "Criteria is required";
  }
  if (typeof parameters !== "string" || parameters.length === 0) {
    errors.parameters = "Parameters is required";
  }
  if (typeof schedule !== "string" || schedule.length === 0) {
    errors.schedule = "Schedule is required";
  }

  if (errors) {
    return json({ errors: errors }, { status: 400 });
  }

  const note = await createNote({ title, body, userId });

  return redirect(`/notes/${note.id}`);
}

export default function NewRequestPage() {
  const { user, requestTypes } = useLoaderData<typeof loader>();

  const actionData = useActionData<typeof action>();

  const requestedForRef = React.useRef<HTMLInputElement>(null);
  const typeRef = React.useRef<HTMLInputElement>(null);
  const nameRef = React.useRef<HTMLInputElement>(null);
  const recipientsRef = React.useRef<HTMLInputElement>(null);
  const excelRef = React.useRef<HTMLInputElement>(null);
  const initiativeRef = React.useRef<HTMLInputElement>(null);
  const regulatoryRef = React.useRef<HTMLInputElement>(null);
  const devNotesRef = React.useRef<HTMLTextAreaElement>(null);
  const descriptionRef = React.useRef<HTMLTextAreaElement>(null);
  const purposeRef = React.useRef<HTMLTextAreaElement>(null);
  const criteriaRef = React.useRef<HTMLTextAreaElement>(null);
  const parametersRef = React.useRef<HTMLTextAreaElement>(null);
  const scheduleRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {

    if (actionData?.errors?.name) {
      nameRef.current?.focus();
    } else if (actionData?.errors?.requestedFor) {
      requestedForRef.current?.focus();
    } else if (actionData?.errors?.type) {
      typeRef.current?.focus();
    } else if (actionData?.errors?.description) {
      descriptionRef.current?.focus();
    }else if (actionData?.errors?.purpose) {
      purposeRef.current?.focus();
    }else if (actionData?.errors?.criteria) {
      criteriaRef.current?.focus();
    }else if (actionData?.errors?.parameters) {
      parametersRef.current?.focus();
    }else if (actionData?.errors?.schedule) {
      scheduleRef.current?.focus();
    }else if (actionData?.errors?.recipients) {
      recipientsRef.current?.focus();
    }
  }, [actionData]);

  const resetInput = function(input) {
    input.classList.remove('is-danger')
    input.closest('div.field').querySelector('p.help').classList.add('is-hidden')
    input.removeAttribute('aria-invalid')
    input.removeAttribute('aria-errormessage')
  }
  return (
    <Form method="post" className="form">
      <div className="field">
        <label className="label">Requested For</label>
        <div className="control">
          <input
            ref={requestedForRef}
            name="requestedFor"
            aria-invalid={actionData?.errors?.requestedFor ? true : undefined}
            aria-errormessage={
              actionData?.errors?.requestedFor ? "is-danger" : undefined
            }
            className={`input ${
              actionData?.errors?.requestedFor ? "is-danger" : undefined
            }`}
            type="text"
            placeholder="should search.. default to me"
            onInput={(event: React.InputEvent<HTMLInputElement>) => {
                let input = event.target as HTMLInputElement;
                resetInput(input);
              }}
          />
        </div>
        {actionData?.errors?.requestedFor && (
          <p className="help is-danger">{actionData.errors.requestedFor}</p>
        )}
      </div>

      <div className="field">
        <label className="label">Type</label>
        <div className="control is-expanded">
          <div className="select is-fullwidth">

          <select name="type"
            ref={typeRef}
            aria-invalid={actionData?.errors?.type ? true : undefined}
            aria-errormessage={
              actionData?.errors?.type ? "is-danger" : undefined
            }
            className={`select ${
              actionData?.errors?.type ? "is-danger" : undefined
            }`}>
            {requestTypes && requestTypes.map((type) => <option key={type.id}>{type.name}</option>)}
          </select>
        </div>
      </div> {actionData?.errors?.type && (
          <p className="help is-danger">{actionData.errors.type}</p>
        )}</div>

      <div className="field">
        <label className="label">Name</label>
        <div className="control">
          <input
            ref={nameRef}
            aria-invalid={actionData?.errors?.name ? true : undefined}
            aria-errormessage={
              actionData?.errors?.name ? "title-error" : undefined
            }
            className={`input ${
              actionData?.errors?.name ? "is-danger" : undefined
            }`}
            name="name"
            type="text"
            placeholder="Text input"
            onInput={(event: React.InputEvent<HTMLInputElement>) => {
                let input = event.target as HTMLInputElement;
                resetInput(input);
              }}
          />
        </div>
        {actionData?.errors?.name && (
          <p className="help is-danger">{actionData.errors.name}</p>
        )}
      </div>
      <div className="field">
        <label className="label">Developer Notes</label>
        <div className="control">
          <textarea
            ref={devNotesRef}
            name="devNotes"
            className="textarea"
            placeholder="Textarea"
            onInput={(event: React.InputEvent<HTMLInputElement>) => {
                let input = event.target as HTMLInputElement;
                resetInput(input);
              }}
          ></textarea>
        </div>
      </div>
      <div className="field">
        <label className="label">Description</label>
        <div className="control">
          <textarea
            ref={descriptionRef}
            name="description"
            aria-invalid={actionData?.errors?.description ? true : undefined}
            aria-errormessage={
              actionData?.errors?.description ? "is-danger" : undefined
            }
            className={`textarea ${
              actionData?.errors?.description ? "is-danger" : undefined
            }`}
            placeholder="Textarea"
            onInput={(event: React.InputEvent<HTMLInputElement>) => {
                let input = event.target as HTMLInputElement;
                resetInput(input);
              }}
          ></textarea>
        </div>
        {actionData?.errors?.description && (
          <p className="help is-danger">{actionData.errors.description}</p>
        )}
      </div>

      <div className="field">
        <label className="label">Purpose</label>
        <div className="control">
          <textarea
            ref={purposeRef}
            name="purpose"
            aria-invalid={actionData?.errors?.purpose ? true : undefined}
            aria-errormessage={
              actionData?.errors?.purpose ? "is-danger" : undefined
            }
            className={`textarea ${
              actionData?.errors?.purpose ? "is-danger" : undefined
            }`}
            placeholder="Textarea"
            onInput={(event: React.InputEvent<HTMLInputElement>) => {
                let input = event.target as HTMLInputElement;
                resetInput(input);
              }}
          ></textarea>
        </div>
        {actionData?.errors?.purpose && (
          <p className="help is-danger">{actionData.errors.purpose}</p>
        )}
      </div>

      <div className="field">
        <label className="label">Criteria</label>
        <div className="control">
          <textarea
            ref={criteriaRef}
            name="criteria"
            aria-invalid={actionData?.errors?.criteria ? true : undefined}
            aria-errormessage={
              actionData?.errors?.criteria ? "is-danger" : undefined
            }
            className={`textarea ${
              actionData?.errors?.criteria ? "is-danger" : undefined
            }`}
            placeholder="Textarea"
            onInput={(event: React.InputEvent<HTMLInputElement>) => {
                let input = event.target as HTMLInputElement;
                resetInput(input);
              }}
          ></textarea>
        </div>
        {actionData?.errors?.criteria && (
          <p className="help is-danger">{actionData.errors.criteria}</p>
        )}
      </div>
      <div className="field">
        <label className="label">Parameters</label>
        <div className="control">
          <textarea
            ref={parametersRef}
            name="parameters"
            aria-invalid={actionData?.errors?.parameters ? true : undefined}
            aria-errormessage={
              actionData?.errors?.parameters ? "is-danger" : undefined
            }
            className={`textarea ${
              actionData?.errors?.parameters ? "is-danger" : undefined
            }`}
            placeholder="Textarea"
            onInput={(event: React.InputEvent<HTMLInputElement>) => {
                let input = event.target as HTMLInputElement;
                resetInput(input);
              }}
          ></textarea>
        </div>
        {actionData?.errors?.parameters && (
          <p className="help is-danger">{actionData.errors.parameters}</p>
        )}
      </div>
      <div className="field">
        <label className="label">Schedule</label>
        <div className="control">
          <textarea
            ref={scheduleRef}
            name="schedule"
            aria-invalid={actionData?.errors?.schedule ? true : undefined}
            aria-errormessage={
              actionData?.errors?.schedule ? "is-danger" : undefined
            }
            className={`textarea ${
              actionData?.errors?.schedule ? "is-danger" : undefined
            }`}
            placeholder="Textarea"
            onInput={(event: React.InputEvent<HTMLInputElement>) => {
                let input = event.target as HTMLInputElement;
                resetInput(input);
              }}
          ></textarea>
        </div>
        {actionData?.errors?.schedule && (
          <p className="help is-danger">{actionData.errors.schedule}</p>
        )}
      </div>
      <div className="field">
        <label className="label">Recipients</label>
        <div className="control">
          <input
            ref={recipientsRef}
            name="recipients"
            aria-invalid={actionData?.errors?.recipients ? true : undefined}
            aria-errormessage={
              actionData?.errors?.recipients ? "is-danger" : undefined
            }
            className={`input ${
              actionData?.errors?.recipients ? "is-danger" : undefined
            }`}
            type="text"
            placeholder="should search for people when you type"
            onInput={(event: React.InputEvent<HTMLInputElement>) => {
                let input = event.target as HTMLInputElement;
                resetInput(input);
              }}
          />
        </div>
        {actionData?.errors?.recipients && (
          <p className="help is-danger">{actionData.errors.recipients}</p>
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
            <input type="checkbox" ref={regulatoryRef} name="regulatory"/>
            Regulatory
          </label>
        </div>
      </div>
      <div className="field">
        <div className="control">
          <label className="checkbox">
            <input type="checkbox" ref={initiativeRef} name="initiative"/>
            Supports an Initiative
          </label>
        </div>
      </div>

      <button type="submit" className="button">
        Save
      </button>
    </Form>
  );
}

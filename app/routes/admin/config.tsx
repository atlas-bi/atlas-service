import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { RequestCategory, RequestType, User } from '@prisma/client';
import {
  type ActionArgs,
  type LoaderArgs,
  type Session,
  json,
} from '@remix-run/node';
import {
  Form,
  useActionData,
  useLoaderData,
  useTransition,
} from '@remix-run/react';
import * as React from 'react';
import RequestTypeEditor from '~/components/RequestTypeEditor';
import {
  createRequestCategory,
  createRequestType,
  deleteRequestCategory,
  deleteRequestType,
  editRequestType,
  getRequestCategories,
  getRequestTypes,
  setRequestCategoryDefault,
} from '~/models/config.server';
import { authorize, requireUser } from '~/session.server';

type Errors = {
  typeName?: string;
  categoryName?: string;
  categoryDefault?: string;
};

export async function loader({ request, params }: LoaderArgs) {
  return authorize(
    request,
    [process.env.ADMIN_GROUP],
    async ({ user, session }: { user: User; session: Session }) => {
      // should authorizeAdmin here...
      const editorFields = [
        { name: 'Description', id: 'showDescription' },
        { name: 'Purpose', id: 'showPurpose' },
        { name: 'Criteria', id: 'showCriteria' },
        { name: 'Parameters', id: 'showParameters' },
        { name: 'Schedule', id: 'showSchedule' },
        { name: 'Requester', id: 'showRequester' },
        { name: 'Recipients', id: 'showRecipients' },
        { name: 'Labels', id: 'showLabels' },
        { name: 'Export to Excel', id: 'showExportToExcel' },
        { name: 'Regulatory', id: 'showRegulatory' },
        { name: 'Supports an Initiative', id: 'showSupportsInitiative' },
      ];

      const requestTypes = await getRequestTypes();
      const requestCategories = await getRequestCategories();
      return json({ requestTypes, requestCategories, user, editorFields });
    },
  );
}

export async function action({ request }: ActionArgs) {
  const user = await requireUser(request);
  const userId = user.id;

  const formData = await request.formData();
  const { _action, ...values } = Object.fromEntries(formData);

  const errors: Errors = {};

  switch (_action) {
    case 'editRequestType': {
      if (typeof values.name !== 'string' || values.name.length === 0) {
        errors.typeEditorName = 'Name is required';
        errors.id = Number(values.id);
      }
      if (Object.keys(errors).length > 0) {
        return json({ errors }, { status: 400 });
      }

      const {
        id,
        name,
        description,
        menuText,
        showSupportsInitiative,
        showRegulatory,
        showExportToExcel,
        showLabels,
        showRecipients,
        showRequester,
        showSchedule,
        showParameters,
        showCriteria,
        showPurpose,
        showDescription,
      } = values;

      await editRequestType({
        id: Number(id),
        name,
        description,
        menuText,
        showSupportsInitiative: showSupportsInitiative === 'on',
        showRegulatory: showRegulatory === 'on',
        showExportToExcel: showExportToExcel === 'on',
        showLabels: showLabels === 'on',
        showRecipients: showRecipients === 'on',
        showRequester: showRequester === 'on',
        showSchedule: showSchedule === 'on',
        showParameters: showParameters === 'on',
        showCriteria: showCriteria === 'on',
        showPurpose: showPurpose === 'on',
        showDescription: showDescription === 'on',
      });

      break;
    }
    case 'createRequestType': {
      if (typeof values.name !== 'string' || values.name.length === 0) {
        errors.typeCreateName = 'Name is required';
      }
      if (Object.keys(errors).length > 0) {
        return json({ errors }, { status: 400 });
      }
      const {
        name,
        description,
        menuText,
        showSupportsInitiative,
        showRegulatory,
        showExportToExcel,
        showLabels,
        showRecipients,
        showRequester,
        showSchedule,
        showParameters,
        showCriteria,
        showPurpose,
        showDescription,
      } = values;

      await createRequestType({
        name,
        description,
        menuText,
        showSupportsInitiative: showSupportsInitiative === 'on',
        showRegulatory: showRegulatory === 'on',
        showExportToExcel: showExportToExcel === 'on',
        showLabels: showLabels === 'on',
        showRecipients: showRecipients === 'on',
        showRequester: showRequester === 'on',
        showSchedule: showSchedule === 'on',
        showParameters: showParameters === 'on',
        showCriteria: showCriteria === 'on',
        showPurpose: showPurpose === 'on',
        showDescription: showDescription === 'on',
        userId: user.id,
      });

      break;
    }
    case 'addRequestCategory': {
      if (typeof values.name !== 'string' || values.name.length === 0) {
        errors.categoryName = 'Name is required';
      }
      const name = values.name as string;

      if (Object.keys(errors).length > 0) {
        return json({ errors }, { status: 400 });
      }
      await createRequestCategory({ name, userId });

      break;
    }
    case 'deleteRequestType': {
      await deleteRequestType({ id: Number(values.id) });
      break;
    }

    case 'deleteRequestCategory': {
      await deleteRequestCategory({ id: Number(values.id) });
      break;
    }
    case 'addRequestCategoryDefault': {
      const categoryId = values.categoryDefault;

      if (typeof categoryId !== 'string' || categoryId.length === 0) {
        errors.categoryDefault = 'Category is required';
      }

      if (Object.keys(errors).length > 0) {
        return json({ errors }, { status: 400 });
      }
      await setRequestCategoryDefault({ id: Number(categoryId) });
      break;
    }
    default: {
      console.log(`Unknown action ${_action}`);
      break;
      // throw new Error(`Unknown action ${_action}`);
    }
  }

  return null;
}

export default function Index() {
  const { requestTypes, requestCategories, editorFields } =
    useLoaderData<typeof loader>();

  type ActionData = { errors?: Errors } | undefined | null;
  const actionData = useActionData<ActionData>();

  const typeNameRef = React.useRef<HTMLInputElement>(null);
  const formTypeAddRef = React.useRef<HTMLFormElement>(null);
  const formCategoryAddRef = React.useRef<HTMLFormElement>(null);
  const categoryNameRef = React.useRef<HTMLInputElement>(null);
  const formCategoryDefaultRef = React.useRef<HTMLFormElement>(null);
  const categoryDefaultRef = React.useRef<HTMLSelectElement>(null);

  const [newTypeHidden, setNewTypeHidden] = React.useState(false);

  const transition = useTransition();

  const isCreatingType =
    transition.state === 'submitting' &&
    transition.submission.formData.get('_action') === 'createRequestType';

  const isAddingCategory =
    transition.state === 'submitting' &&
    transition.submission.formData.get('_action') === 'addRequestCategory';

  const isAddingCategoryDefault =
    transition.state === 'submitting' &&
    transition.submission.formData.get('_action') ===
      'addRequestCategoryDefault';

  React.useEffect(() => {
    if (!isCreatingType) {
      setNewTypeHidden(false);
    }
  }, [isCreatingType]);

  React.useEffect(() => {
    if (!isAddingCategory) {
      formTypeAddRef.current?.reset();
    }
  }, [isAddingCategory]);

  React.useEffect(() => {
    if (actionData?.errors?.typeName) {
      typeNameRef.current?.focus();
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
      <h1 className="title is-1">Site Configuration</h1>
      should ask also if the field is required or not.
      <h2 className="is-2 title">Request Types</h2>
      <div className="columns">
        <div className="column is-narrow pr-0 has-text-right">
          <label className="label py-3 my-0 mr-3">Name</label>
          <label className="label py-2 my-0 mr-3">Description</label>
          <label className="label py-2 my-0 mr-3">Menu Text</label>
          {editorFields &&
            editorFields.map((field) => (
              <React.Fragment key={field.id}>
                <label className="label py-2 my-0 mr-3" key={field.id}>
                  {field.name}
                </label>
                <hr className="m-0" />
              </React.Fragment>
            ))}
        </div>
        {requestTypes.map((rt: RequestType) => (
          <RequestTypeEditor key={rt.id} rt={rt} fields={editorFields} />
        ))}
        <div className="column auto">
          <button
            className="button"
            type="button"
            onClick={(event) => {
              setNewTypeHidden(<RequestTypeEditor fields={editorFields} />);
            }}
          >
            New!
          </button>
          {newTypeHidden}
        </div>
        {/*
             <div className="column is-narrow px-0">
                New Type
                <span className="icon">
                  <FontAwesomeIcon icon={faPlus} />
                </span>
                <input className="input" disabled />
                <input className="input" disabled/>
           
        {editorFields &&
              editorFields.map((field) => (

                <div key={field.id} class="field">
                      <input
                        id={`${field.id}-new`}
                        type="checkbox"
                        name={`${field.id}-new`}
                        className="switch is-rounded"
                        disabled
                      />
                      <label for={`${field.id}-new`}></label>
                      <hr className="m-0" />
                    </div>
                    ))}
              </div>*/}
      </div>
      {requestCategories && (
        <div className="field is-grouped is-grouped-multiline">
          {requestCategories.map((category: RequestCategory) => (
            <div key={category.id} className="control">
              <div className="tags has-addons">
                <span className="tag is-link">{category.name}</span>
                <Form method="post">
                  <input type="hidden" name="id" value={category.id} />
                  <button
                    name="_action"
                    value="deleteRequestCategory"
                    type="submit"
                    aria-label="delete"
                    className="tag button is-delete is-ghost"
                  ></button>
                </Form>
              </div>
            </div>
          ))}
        </div>
      )}
      <h2 className="title is-2">Categories</h2>
      <Form method="post" className="form" ref={formCategoryAddRef}>
        <div className="field">
          <label className="label">New Request Category</label>
          <div className="control">
            <input
              name="name"
              ref={categoryNameRef}
              aria-invalid={actionData?.errors?.categoryName ? true : undefined}
              aria-errormessage={
                actionData?.errors?.categoryName ? 'is-danger' : undefined
              }
              className={`input ${
                actionData?.errors?.categoryName ? 'is-danger' : undefined
              }`}
              type="text"
              placeholder="name"
              onInput={(event: React.SyntheticEvent<HTMLInputElement>) => {
                const input = event.target as HTMLInputElement;
                resetInput(input);
              }}
            />
          </div>
          {actionData?.errors?.categoryName && (
            <p className="help is-danger">{actionData?.errors?.categoryName}</p>
          )}
        </div>
        <button className="button" name="_action" value="addRequestCategory">
          {isAddingCategory ? 'saving..' : 'save'}
        </button>
      </Form>
      <h2 className="title is-2">Default Category</h2>
      <Form method="post" className="form" ref={formCategoryDefaultRef}>
        <div className="field">
          <label className="label">Default Category for New Requests</label>
          <div className="control">
            <select
              name="categoryDefault"
              ref={categoryDefaultRef}
              aria-invalid={
                actionData?.errors?.categoryDefault ? true : undefined
              }
              aria-errormessage={
                actionData?.errors?.categoryDefault ? 'is-danger' : undefined
              }
              className={`select ${
                actionData?.errors?.categoryDefault ? 'is-danger' : undefined
              }`}
            >
              <option value="">None</option>
              {requestCategories &&
                requestCategories.map((category: RequestCategory) => (
                  <option
                    selected={category.isDefault ? true : undefined}
                    key={category.id}
                    value={category.id}
                  >
                    {category.name}
                  </option>
                ))}
            </select>
          </div>
          {actionData?.errors?.categoryDefault && (
            <p className="help is-danger">
              {actionData?.errors?.categoryDefault}
            </p>
          )}
        </div>
        <button
          className="button"
          name="_action"
          value="addRequestCategoryDefault"
        >
          {isAddingCategoryDefault ? 'saving..' : 'save'}
        </button>
      </Form>
      <p className="content">
        <br />
        other config: - category to auto asign to new tickets - default request
        <br />
        type - what groups should admin users have/who is admin?
        <br />
        who is an admin anyways?
      </p>
    </div>
  );
}

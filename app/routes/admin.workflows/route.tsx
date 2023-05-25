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
  useNavigation,
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
      const requestTypes = await getRequestTypes();
      const requestCategories = await getRequestCategories();
      return json({ requestTypes, requestCategories, user });
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

  const transition = useNavigation();

  const isCreatingType =
    transition.state === 'submitting' &&
    transition.formData.get('_action') === 'createRequestType';

  const isAddingCategory =
    transition.state === 'submitting' &&
    transition.formData.get('_action') === 'addRequestCategory';

  const isAddingCategoryDefault =
    transition.state === 'submitting' &&
    transition.formData.get('_action') === 'addRequestCategoryDefault';

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
    <>
      workflow category for new requests: category for cancelled requests:
      category for closed requests:
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
    </>
  );
}

import type { RequestCategory } from '@prisma/client';
import { type ActionArgs, type LoaderArgs, json } from '@remix-run/node';
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
} from '@remix-run/react';
import * as React from 'react';
import {
  getRequestCategories,
  getRequestTypes,
  setRequestCategoryDefault,
} from '~/models/config.server';
import { authenticator } from '~/services/auth.server';
import { requireUser } from '~/services/session.server';

type Errors = {
  typeName?: string;
  categoryName?: string;
  categoryDefault?: string;
};

export async function loader({ request, params }: LoaderArgs) {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: `/auth/?returnTo=${encodeURI(
      new URL(request.url).pathname,
    )}`,
  });

  // check for admin?
  const requestTypes = await getRequestTypes();
  const requestCategories = await getRequestCategories();
  return json({ requestTypes, requestCategories, user });
}

export async function action({ request }: ActionArgs) {
  const user = await requireUser(request);

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
  const { requestCategories } = useLoaderData<typeof loader>();

  type ActionData = { errors?: Errors } | undefined | null;
  const actionData = useActionData<ActionData>();

  const typeNameRef = React.useRef<HTMLInputElement>(null);
  const formTypeAddRef = React.useRef<HTMLFormElement>(null);

  const formCategoryDefaultRef = React.useRef<HTMLFormElement>(null);
  const categoryDefaultRef = React.useRef<HTMLSelectElement>(null);

  const transition = useNavigation();

  const isAddingCategory =
    transition.state === 'submitting' &&
    transition.formData.get('_action') === 'addRequestCategory';

  const isAddingCategoryDefault =
    transition.state === 'submitting' &&
    transition.formData.get('_action') === 'addRequestCategoryDefault';

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

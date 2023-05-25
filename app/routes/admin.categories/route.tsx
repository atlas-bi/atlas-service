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
      // should authorizeAdmin here...
      const requestCategories = await getRequestCategories();
      return json({ requestCategories, user });
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

    case 'deleteRequestCategory': {
      await deleteRequestCategory({ id: Number(values.id) });
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
    </>
  );
}

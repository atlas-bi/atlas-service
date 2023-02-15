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
import {
    createRequestCategory,
    createRequestType,
    deleteRequestCategory,
    deleteRequestType,
    getRequestCategories,
    getRequestTypes,
    setRequestCategoryDefault,
} from '~/models/config.server';
import { authorize, getUser } from '~/session.server';

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

            const requestTypes = await getRequestTypes();
            const requestCategories = await getRequestCategories();
            return json({ requestTypes, requestCategories, user });
        },
    );
}

export async function action({ request }: ActionArgs) {
    const user = await getUser(request);
    const userId = user.id;

    const formData = await request.formData();
    const { _action, ...values } = Object.fromEntries(formData);

    const errors: Errors = {};

    switch (_action) {
        case 'addRequestType': {
            if (typeof values.name !== 'string' || values.name.length === 0) {
                errors.typeName = 'Name is required';
            }

            const name = values.name as string;

            if (Object.keys(errors).length > 0) {
                console.log(
                    'leaving early',
                    Object.keys(errors).length,
                    errors,
                );
                return json(errors, { status: 400 });
            }
            await createRequestType({ name, userId });

            break;
        }
        case 'addRequestCategory': {
            if (typeof values.name !== 'string' || values.name.length === 0) {
                errors.categoryName = 'Name is required';
            }
            const name = values.name as string;

            if (Object.keys(errors).length > 0) {
                console.log(
                    'leaving early',
                    Object.keys(errors).length,
                    errors,
                );
                return json(errors, { status: 400 });
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
                console.log(
                    'leaving early',
                    Object.keys(errors).length,
                    errors,
                );
                return json(errors, { status: 400 });
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
    const { requestTypes, requestCategories } = useLoaderData<typeof loader>();

    type ActionData = { errors?: Errors } | undefined | null;
    const actionData = useActionData<ActionData>();

    const typeNameRef = React.useRef<HTMLInputElement>(null);
    const formTypeAddRef = React.useRef<HTMLFormElement>(null);
    const formCategoryAddRef = React.useRef<HTMLFormElement>(null);
    const categoryNameRef = React.useRef<HTMLInputElement>(null);
    const formCategoryDefaultRef = React.useRef<HTMLFormElement>(null);
    const categoryDefaultRef = React.useRef<HTMLSelectElement>(null);

    const transition = useTransition();

    const isAddingType =
        transition.state === 'submitting' &&
        transition.submission.formData.get('_action') === 'addRequestType';

    const isAddingCategory =
        transition.state === 'submitting' &&
        transition.submission.formData.get('_action') === 'addRequestCategory';

    const isAddingCategoryDefault =
        transition.state === 'submitting' &&
        transition.submission.formData.get('_action') ===
            'addRequestCategoryDefault';

    React.useEffect(() => {
        if (!isAddingType) {
            formTypeAddRef.current?.reset();
        }
    }, [isAddingType]);

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
            <h2 className="is-2 title">Request Types</h2>

            {requestTypes && (
                <div className="field is-grouped is-grouped-multiline">
                    {requestTypes.map((rt: RequestType) => (
                        <div key={rt.id} className="control">
                            <div className="tags has-addons">
                                <span className="tag is-link">{rt.name}</span>
                                <Form method="post">
                                    <input
                                        type="hidden"
                                        name="id"
                                        value={rt.id}
                                    />
                                    <button
                                        name="_action"
                                        value="deleteRequestType"
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

            <Form method="post" className="form" ref={formTypeAddRef}>
                <div className="field">
                    <label className="label">New Request Type</label>
                    <div className="control">
                        <input
                            name="name"
                            ref={typeNameRef}
                            aria-invalid={
                                actionData?.errors?.typeName ? true : undefined
                            }
                            aria-errormessage={
                                actionData?.errors?.typeName
                                    ? 'is-danger'
                                    : undefined
                            }
                            className={`input ${
                                actionData?.errors?.typeName
                                    ? 'is-danger'
                                    : undefined
                            }`}
                            type="text"
                            placeholder="name"
                            onInput={(
                                event: React.SyntheticEvent<HTMLInputElement>,
                            ) => {
                                const input = event.target as HTMLInputElement;
                                resetInput(input);
                            }}
                        />
                    </div>
                    {actionData?.errors?.typeName && (
                        <p className="help is-danger">
                            {actionData?.errors?.typeName}
                        </p>
                    )}
                </div>
                <button
                    className="button"
                    name="_action"
                    value="addRequestType"
                >
                    {isAddingType ? 'saving..' : 'save'}
                </button>
            </Form>

            {requestCategories && (
                <div className="field is-grouped is-grouped-multiline">
                    {requestCategories.map((category: RequestCategory) => (
                        <div key={category.id} className="control">
                            <div className="tags has-addons">
                                <span className="tag is-link">
                                    {category.name}
                                </span>
                                <Form method="post">
                                    <input
                                        type="hidden"
                                        name="id"
                                        value={category.id}
                                    />
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
                            aria-invalid={
                                actionData?.errors?.categoryName
                                    ? true
                                    : undefined
                            }
                            aria-errormessage={
                                actionData?.errors?.categoryName
                                    ? 'is-danger'
                                    : undefined
                            }
                            className={`input ${
                                actionData?.errors?.categoryName
                                    ? 'is-danger'
                                    : undefined
                            }`}
                            type="text"
                            placeholder="name"
                            onInput={(
                                event: React.SyntheticEvent<HTMLInputElement>,
                            ) => {
                                const input = event.target as HTMLInputElement;
                                resetInput(input);
                            }}
                        />
                    </div>
                    {actionData?.errors?.categoryName && (
                        <p className="help is-danger">
                            {actionData?.errors?.categoryName}
                        </p>
                    )}
                </div>
                <button
                    className="button"
                    name="_action"
                    value="addRequestCategory"
                >
                    {isAddingCategory ? 'saving..' : 'save'}
                </button>
            </Form>
            <h2 className="title is-2">Default Category</h2>
            <Form method="post" className="form" ref={formCategoryDefaultRef}>
                <div className="field">
                    <label className="label">
                        Default Category for New Requests
                    </label>
                    <div className="control">
                        <select
                            name="categoryDefault"
                            ref={categoryDefaultRef}
                            aria-invalid={
                                actionData?.errors?.categoryDefault
                                    ? true
                                    : undefined
                            }
                            aria-errormessage={
                                actionData?.errors?.categoryDefault
                                    ? 'is-danger'
                                    : undefined
                            }
                            className={`select ${
                                actionData?.errors?.categoryDefault
                                    ? 'is-danger'
                                    : undefined
                            }`}
                        >
                            <option value="">None</option>
                            {requestCategories &&
                                requestCategories.map(
                                    (category: RequestCategory) => (
                                        <option
                                            selected={
                                                category.isDefault
                                                    ? true
                                                    : undefined
                                            }
                                            key={category.id}
                                            value={category.id}
                                        >
                                            {category.name}
                                        </option>
                                    ),
                                )}
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
                other config: - category to auto asign to new tickets - default
                request type - what groups should admin users have/who is admin?
            </p>
        </div>
    );
}

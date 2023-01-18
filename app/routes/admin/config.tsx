import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { authorize } from "~/session.server";
import { Form, useActionData } from "@remix-run/react";
import * as React from "react";
import { useTransition } from "@remix-run/react";
import {
    getRequestTypes,
    createRequestType,
    deleteRequestType,
    getRequestCategories,
    createRequestCategory,
    deleteRequestCategory
} from "~/models/config.server";
import { getUser } from "~/session.server";

export async function loader({ request, params }: LoaderArgs) {
    return authorize(request, [process.env.ADMIN_GROUP], async ({ user, session }) => {
        // should authorizeAdmin here...

        const requestTypes = await getRequestTypes();
        const requestCategories = await getRequestCategories();
        return json({ requestTypes, requestCategories, user });
    });
}

export async function action({ request }: ActionArgs) {
    const user = await getUser(request);
    const userId = user.id;

    let formData = await request.formData();
    let { _action, ...values } = Object.fromEntries(formData);

    switch (_action) {
        case "addRequestType": {
            const name = values.name;
            let errors = {};
            if (typeof name !== "string" || name.length === 0) {
                errors.typeName = "Name is required";
            }

            if (Object.keys(errors).length > 0) {
                console.log(
                    "leaving early",
                    Object.keys(errors).length,
                    errors
                );
                return json({ errors: errors }, { status: 400 });
            }
            await createRequestType({ name, userId });

            break
        }
    case "addRequestCategory": {

        const name = values.name;
            let errors = {};
            if (typeof name !== "string" || name.length === 0) {
                errors.categoryName = "Name is required";
            }

            if (Object.keys(errors).length > 0) {
                console.log(
                    "leaving early",
                    Object.keys(errors).length,
                    errors
                );
                return json({ errors: errors }, { status: 400 });
            }
            await createRequestCategory({ name, userId });

            break
    }
        case "deleteRequestType": {
            await deleteRequestType(parseInt(values.id));
            break
        }

        case "deleteRequestCategory": {
            await deleteRequestCategory(parseInt(values.id));
            break
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
    const { user, requestTypes, requestCategories } = useLoaderData<typeof loader>();

    const actionData = useActionData<typeof action>();

    const typeNameRef = React.useRef<HTMLInputElement>(null);
    const formTypeAddRef = React.useRef();
    const formCategoryAddRef = React.useRef();
    const categoryNameRef = React.useRef();

    let transition = useTransition();

    let isAddingType =
        transition.state === "submitting" &&
        transition.submission.formData.get("_action") === "addRequestType";

    let isAddingCategory =
        transition.state === "submitting" &&
        transition.submission.formData.get("_action") === "addRequestCategory";

    React.useEffect(() => {
        if (!isAddingType) {
            formTypeAddRef.current.reset();
        }
    }, [isAddingType]);

    React.useEffect(() => {
        if (!isAddingCategory) {
            formTypeAddRef.current.reset();
        }
    }, [isAddingCategory]);

    React.useEffect(() => {
        if (actionData?.errors?.typeName) {
            typeNameRef.current?.focus();
        }
    }, [actionData]);

    const resetInput = function (input) {
        input.classList.remove("is-danger");
        input
            .closest("div.field")
            ?.querySelector("p.help")
            ?.classList.add("is-hidden");
        input.removeAttribute("aria-invalid");
        input.removeAttribute("aria-errormessage");
    };

    return (
        <>
            <h1 className="title is-1">Site Configuration</h1>
            <h2 className="is-2 title">Request Types</h2>

            {requestTypes && (
                <div className="field is-grouped is-grouped-multiline">
                    {requestTypes.map((rt) => (
                        <div key={rt.id} className="control">
                            <div className="tags has-addons">
                                <a className="tag is-link">{rt.name}</a>
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
                                    ? "is-danger"
                                    : undefined
                            }
                            className={`input ${
                                actionData?.errors?.typeName
                                    ? "is-danger"
                                    : undefined
                            }`}
                            type="text"
                            placeholder="name"
                            onInput={(
                                event: React.InputEvent<HTMLInputElement>
                            ) => {
                                let input = event.target as HTMLInputElement;
                                resetInput(input);
                            }}
                        />
                    </div>
                    {actionData?.errors?.typeName && (
                        <p className="help is-danger">
                            {actionData.errors.typeName}
                        </p>
                    )}
                </div>
                <button
                    className="button"
                    name="_action"
                    value="addRequestType"
                >
                    {isAddingType ? "saving.." : "save"}
                </button>
            </Form>

            {requestCategories && (
                <div className="field is-grouped is-grouped-multiline">
                    {requestCategories.map((rt) => (
                        <div key={rt.id} className="control">
                            <div className="tags has-addons">
                                <a className="tag is-link">{rt.name}</a>
                                <Form method="post">
                                    <input
                                        type="hidden"
                                        name="id"
                                        value={rt.id}
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
                                actionData?.errors?.categoryName ? true : undefined
                            }
                            aria-errormessage={
                                actionData?.errors?.categoryName
                                    ? "is-danger"
                                    : undefined
                            }
                            className={`input ${
                                actionData?.errors?.categoryName
                                    ? "is-danger"
                                    : undefined
                            }`}
                            type="text"
                            placeholder="name"
                            onInput={(
                                event: React.InputEvent<HTMLInputElement>
                            ) => {
                                let input = event.target as HTMLInputElement;
                                resetInput(input);
                            }}
                        />
                    </div>
                    {actionData?.errors?.categoryName && (
                        <p className="help is-danger">
                            {actionData.errors.categoryName}
                        </p>
                    )}
                </div>
                <button
                    className="button"
                    name="_action"
                    value="addRequestCategory"
                >
                    {isAddingCategory ? "saving.." : "save"}
                </button>
            </Form>

            <p className="content">
            other config:

            - category to auto asign to new tickets
            - default request type

            - what groups should admin users have/who is admin?
            </p>
        </>
    );
}

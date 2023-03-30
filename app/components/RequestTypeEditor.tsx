import {
  faCheck,
  faCircleNotch,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Form, useActionData, useTransition } from '@remix-run/react';
import React, { useEffect, useRef, useState } from 'react';

const RequestTypeEditor = ({ rt, fields }: { RequestType?; any }) => {
  const [name, setName] = useState(rt?.name || '');
  const [description, setDescription] = useState(rt?.description || '');
  const [menuText, setMenuText] = useState(rt?.menuText || '');
  const [save, setSave] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);

  const transition = useTransition();

  const isEditingType =
    transition.state === 'submitting' &&
    ((transition.submission.formData.get('_action') === 'editRequestType' &&
      transition.submission.formData.get('id') === rt?.id.toString()) ||
      (transition.submission.formData.get('_action') === 'createRequestType' &&
        rt === undefined));

  const hasEditedType =
    (transition.state === 'loading' || transition.state === 'idle') &&
    transition.submission &&
    transition.submission.formData.get('_action') === 'editRequestType' &&
    transition.submission.formData.get('id') === rt?.id.toString();

  useEffect(() => {
    if (isEditingType) {
      setSave(false);

      if (rt === undefined) {
        formRef.current?.reset();
        setName('');
        setDescription('');
        setMenuText('');
      }
    }
  }, [isEditingType, rt]);

  type ActionData = { errors?: Errors } | undefined | null;
  const actionData = useActionData<ActionData>();

  const nameError =
    (actionData?.errors?.typeEditorName && actionData?.errors?.id === rt.id) ||
    (actionData?.errors?.typeCreateName && rt === undefined)
      ? actionData?.errors?.typeEditorName || actionData?.errors?.typeCreateName
      : undefined;

  console.log(nameError);

  return (
    <div className="column is-one-fifth px-0">
      <Form className="typeEditor" method="post" ref={formRef}>
        {rt?.id && <input type="hidden" name="id" value={rt.id} />}
        <div className="is-flex is-justify-content-space-between is-relative">
          <input
            className="editable title is-5 mb-0 is-flex-shrink-1"
            value={name}
            name="name"
            onChange={(e) => {
              setName(e.target.value);
              setSave(true);
            }}
          />

          {isEditingType ? (
            <span className="icon has-text-warning my-auto">
              <FontAwesomeIcon icon={faCircleNotch} size="lg" spin />
            </span>
          ) : nameError && !save ? (
            <div className="icon-text  my-auto has-text-danger is-flex-shrink-0">
              <span className="icon">
                <FontAwesomeIcon icon={faXmark} size="sm" />
              </span>
              <small style={{ whiteSpace: 'nowrap' }}>{nameError}</small>
            </div>
          ) : (
            <>
              <span
                className="icon has-text-success my-auto"
                style={{
                  transition: 'opacity .2s',
                  transitionDelay: '1s',
                  opacity: hasEditedType ? '1' : '0',
                }}
              >
                <FontAwesomeIcon icon={faCheck} size="lg" />
              </span>
              <button
                name="_action"
                value={rt ? 'editRequestType' : 'createRequestType'}
                className="button is-rounded is-success is-short my-auto"
                style={{
                  transition: 'visibility .2s; opacity .2s',
                  visibility: save ? 'visible' : 'hidden',
                  opacity: save ? '1' : '0',
                  right: 0,
                  top: 0,
                  bottom: 0,
                  position: 'absolute',
                }}
              >
                <span className="icon">
                  <FontAwesomeIcon icon={faCheck} />
                </span>
                <span>Save</span>
              </button>
            </>
          )}
        </div>
        <hr className="m-0" />
        <input
          className="editable"
          value={description}
          name="description"
          onChange={(e) => {
            setDescription(e.target.value);
            setSave(true);
          }}
        />
        <hr className="m-0" />
        <input
          className="editable"
          name="menuText"
          value={menuText}
          onChange={(e) => {
            setMenuText(e.target.value);
            setSave(true);
          }}
        />
        <hr className="m-0" />

        {fields &&
          fields.map((field) => (
            <React.Fragment key={field.id}>
              <input
                id={(rt?.id || 'new') + '-' + field.id}
                type="checkbox"
                name={field.id}
                defaultChecked={rt ? rt[field.id] : false}
                className="switch is-rounded is-success"
                onChange={(e) => setSave(true)}
              />
              <label htmlFor={(rt?.id || 'new') + '-' + field.id}></label>
            </React.Fragment>
          ))}
      </Form>
      {rt && (
        <Form method="post">
          <input type="hidden" name="id" value={rt.id} />

          <button name="_action" value="deleteRequestType">
            Delete
          </button>
        </Form>
      )}
    </div>
  );
};

export default RequestTypeEditor;

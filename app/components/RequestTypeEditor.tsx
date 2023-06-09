// import {
//   faCheck,
//   faCircleNotch,
//   faXmark,
// } from '@fortawesome/free-solid-svg-icons';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Form, useActionData, useNavigation } from '@remix-run/react';
import {
  CircleSlash,
  Delete,
  Edit3,
  Eye,
  EyeOff,
  Save,
  Verified,
} from 'lucide-react';
import { MeiliSearch } from 'meilisearch';
import React, { useEffect, useRef, useState } from 'react';

const Field = ({
  id,
  columnName,
  columnGroups,
  columnVisible,
  columnRequired,
  column = '',
  type,
  callback,
}: {
  id: number;
  columnName: string;
  columnVisible: boolean;
  columnRequired?: boolean;
  columnGroups: number[];
  column?: string;
  type: string;
  callback: () => void;
}) => {
  const [editorColumnName, setEditorColumnName] = useState(columnName);
  const [editorColumnVisible, setEditorColumnVisible] = useState(columnVisible);
  const [editorColumnRequired, setEditorColumnRequired] =
    useState(columnRequired);

  const [selectedGroups, setSelectedGroups] = useState(columnGroups);
  const labelModal = useRef<HTMLDivElement>();
  const [showEditModal, setShowEditModal] = useState(false);

  const [groupSearch, setGroupSearch] = useState([]);
  const [groupSearchInput, setGroupSearchInput] = useState('');
  const labelGroupsRef = useRef<HTMLInputElement>();

  useEffect(() => {
    setEditorColumnName(columnName);
  }, [columnName]);
  useEffect(() => {
    setEditorColumnVisible(columnVisible);
  }, [columnVisible]);
  useEffect(() => {
    setEditorColumnRequired(editorColumnRequired);
  }, [editorColumnRequired]);
  useEffect(() => {
    setSelectedGroups(columnGroups);
  }, [columnGroups]);

  const proper = (word: string) =>
    word.charAt(0).toUpperCase() + word.substr(1).toLowerCase();
  const showName = `show${proper(type)}${column && 'Field'}${proper(column)}`;
  const requiredName = `require${proper(type)}${column && 'Field'}${proper(
    column,
  )}`;
  const groupsName = `${proper(type).toLowerCase()}${column && 'Field'}${proper(
    column,
  )}Groups`;
  const titleName = `${proper(type).toLowerCase()}${column && 'Field'}${proper(
    column,
  )}Title`;

  return (
    <div className="is-flex is-flex-wrap-wrap is-clickable">
      <div
        className="is-flex"
        onClick={() => {
          setShowEditModal(true);
        }}
      >
        <div className="is-flex  mr-2 has-text-link">
          <icon className="icon">
            <Edit3 size={14} />
          </icon>
          <span>Edit</span>
        </div>

        <strong>{editorColumnName || '<no name>'}</strong>
        {(!editorColumnVisible || selectedGroups?.length == 0) && (
          <span
            className="has-tooltip-arrow"
            data-tooltip={
              editorColumnVisible ? 'field is visible' : 'field is hidden'
            }
          >
            <icon className="icon">
              {editorColumnVisible ? <Eye size={14} /> : <EyeOff size={14} />}
            </icon>
          </span>
        )}
        {['text', 'user'].includes(type) && (
          <span
            className="has-tooltip-arrow"
            data-tooltip={
              editorColumnRequired ? 'field is required' : 'field is optional'
            }
          >
            <icon className="icon">
              {editorColumnRequired ? (
                <Verified size={14} />
              ) : (
                <CircleSlash size={14} />
              )}
            </icon>
          </span>
        )}
        {editorColumnVisible && (
          <div className="tags mb-0">
            {selectedGroups.map((group) => (
              <span
                key={group.id}
                className="tag"
                data-tooltip={`visible to ${group.name}`}
              >
                <Eye size={14} className="mr-2" />
                <span>{group.name}</span>
              </span>
            ))}
          </div>
        )}
      </div>
      <div
        className={`modal is-light is-top ${showEditModal ? 'is-active' : ''}`}
        ref={labelModal}
      >
        <div
          className="modal-background"
          onClick={() => setShowEditModal(false)}
        ></div>
        <div className="modal-card ">
          <header className="modal-card-head ">
            <p className="modal-card-title is-size-6">
              <strong>Edit Field</strong>
            </p>
            <button
              type="button"
              className="delete is-light is-medium"
              aria-label="close"
              onClick={() => setShowEditModal(false)}
            ></button>
          </header>
          <section className="modal-card-body">
            <div className="field">
              <label className="label">Field Name</label>
              <div className="control">
                <input
                  className="input semi-disabled"
                  placeholder={columnName}
                  value={editorColumnName}
                  name={titleName}
                  onChange={(e) => {
                    setEditorColumnName(e.target.value);
                    callback();
                  }}
                />
              </div>
            </div>
            <div className="field">
              <label className="label">Field is Avialable</label>
              <div className="control">
                <input
                  id={`${id}-${showName}`}
                  type="checkbox"
                  name={showName}
                  checked={editorColumnVisible}
                  className="switch is-rounded is-success"
                  onChange={(e) => {
                    setEditorColumnVisible(e.target.checked);
                    callback();
                  }}
                />
                <label htmlFor={`${id}-${showName}`}> </label>
              </div>
            </div>
            {['text', 'user'].includes(type) && (
              <div className="field">
                <label className="label">Field is Required</label>
                <div className="control">
                  <input
                    id={`${id}-${requiredName}`}
                    type="checkbox"
                    name={requiredName}
                    checked={editorColumnRequired}
                    className="switch is-rounded is-success"
                    onChange={(e) => {
                      setEditorColumnRequired(e.target.checked);
                      callback();
                    }}
                  />
                  <label htmlFor={`${id}-${requiredName}`}></label>
                </div>
              </div>
            )}
            <div className="field">
              <label className="label">Limit visibility to groups</label>
              {selectedGroups?.length > 0 && (
                <div className="field is-grouped is-grouped-multiline">
                  {selectedGroups.map((group) => (
                    <div className="control" key={group.id}>
                      <input type="hidden" name={groupsName} value={group.id} />
                      <div className="tags has-addons">
                        <a className="tag is-link">{group.name}</a>
                        <a
                          className="tag is-delete"
                          onClick={() => {
                            setSelectedGroups(
                              selectedGroups.filter(
                                (x: Group | any) => x !== group,
                              ),
                            );
                            callback();
                          }}
                        ></a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="control is-relative">
                <input
                  ref={labelGroupsRef}
                  className="input semi-disabled"
                  placeholder="type to search.."
                  value={groupSearchInput}
                  onChange={async (e) => {
                    // setSelectedGroups({...labelGroups, e.target.value});
                    setGroupSearchInput(e.target.value);
                    if (e.target.value == '') {
                      setGroupSearch([]);
                    } else {
                      // const matches = await client
                      //   .index(searchIndex)
                      //   .search(e.target.value, { limit: 20 });
                      // setGroupSearch(matches.hits);
                    }
                  }}
                />
                {groupSearch?.length > 0 && (
                  <div
                    className="is-absolute"
                    style={{ zIndex: 9999, bottom: '-5px', left: 0, right: 0 }}
                  >
                    <div
                      style={{
                        position: 'fixed',
                        maxHeight: '300px',
                        overflowY: 'scroll',
                      }}
                      className="has-background-white has-shadow has-border-grey-lighter"
                    >
                      {groupSearch.map((group) => (
                        <div
                          key={group.id}
                          className=" is-clickable py-2 my-0 px-2 is-clickable has-background-white  has-background-hover-white-bis has-border-none"
                          style={{ height: '35px' }}
                          onClick={() => {
                            if (!selectedGroups.includes(group)) {
                              setSelectedGroups([...selectedGroups, group]);
                            }
                            setGroupSearchInput('');
                            setGroupSearch([]);
                            callback();
                          }}
                        >
                          {group.name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>{' '}
            </div>
            <button
              className="button"
              type="button"
              onClick={() => {
                setShowEditModal(false);
              }}
            >
              Done
            </button>
          </section>
        </div>
      </div>
    </div>
  );
};

const RequestTypeEditor = ({ rt }: { RequestType?; any }) => {
  const [name, setName] = useState(rt?.name || '');
  const [description, setDescription] = useState(rt?.description || '');
  const [menuText, setMenuText] = useState(rt?.menuText || '');
  const [save, setSave] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);

  const transition = useNavigation();

  const isEditingType =
    transition.state === 'submitting' &&
    ((transition.formData.get('_action') === 'editRequestType' &&
      transition.formData.get('id') === rt?.id.toString()) ||
      (transition.formData.get('_action') === 'createRequestType' &&
        rt === undefined));

  const hasEditedType =
    (transition.state === 'loading' || transition.state === 'idle') &&
    transition.formData?.get('_action') === 'editRequestType' &&
    transition.formData?.get('id') === rt?.id.toString();

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

  return (
    <div className="is-rounded has-shadow has-background-white-bis my-5 p-3">
      <div className="is-flex is-justify-content-space_between mb-2">
        <h3 className="title is-4">{rt ? name : 'New Request Type'}</h3>
        <span className="is-flex is-flex-grow-1 is-justify-content-end">
          <span className="mr-2">
            {isEditingType ? (
              <span className="icon has-text-warning my-auto">
                {/*<FontAwesomeIcon icon={faCircleNotch} size="lg" spin />*/}
              </span>
            ) : nameError && !save ? (
              <div className="icon-text  my-auto has-text-danger is-flex-shrink-0">
                <span className="icon">
                  {/*<FontAwesomeIcon icon={faXmark} size="sm" />*/}
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
                  {/*<FontAwesomeIcon icon={faCheck} size="lg" />*/}
                </span>
                <button
                  form={`${rt?.id || 'new'}-form`}
                  name="_action"
                  value={rt ? 'editRequestType' : 'createRequestType'}
                  className="button is-rounded is-success is-short my-auto"
                  style={{
                    transition: 'visibility .2s; opacity .2s',
                    visibility: save ? 'visible' : 'hidden',
                    opacity: save ? '1' : '0',
                  }}
                >
                  <span className="icon">
                    <Save />
                  </span>
                  <span>Save</span>
                </button>
              </>
            )}
          </span>
          {rt && (
            <Form method="post">
              <input type="hidden" name="id" value={rt.id} />

              <button
                name="_action"
                value="deleteRequestType"
                className="button is-rounded is-short my-auto"
              >
                <icon className="icon">
                  <Delete size={14} />
                </icon>
                <span>Delete</span>
              </button>
            </Form>
          )}
        </span>
      </div>
      <Form
        id={`${rt?.id || 'new'}-form`}
        className="typeEditor"
        method="post"
        ref={formRef}
      >
        {rt?.id && <input type="hidden" name="id" value={rt.id} />}

        <div className="field is-horizontal">
          <div className="field-label is-normal">
            <label className="label">Name</label>
          </div>
          <div className="field-body is-flex-grow-7">
            <div className="field">
              <div className="control">
                <input
                  className="input semi-disabled"
                  value={name}
                  name="name"
                  onChange={(e) => {
                    setName(e.target.value);
                    setSave(true);
                  }}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="field is-horizontal">
          <div className="field-label is-normal">
            <label className="label">Description</label>
          </div>
          <div className="field-body">
            <div className="field">
              <div className="control">
                <input
                  className="input semi-disabled"
                  value={description}
                  name="description"
                  onChange={(e) => {
                    setDescription(e.target.value);
                    setSave(true);
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="field is-horizontal">
          <div className="field-label is-normal">
            <label className="label">Menu Text</label>
          </div>

          <div className="field-body">
            <div className="field">
              <div className="control">
                <input
                  className="input semi-disabled"
                  name="menuText"
                  value={menuText}
                  onChange={(e) => {
                    setMenuText(e.target.value);
                    setSave(true);
                  }}
                />{' '}
              </div>
            </div>
          </div>
        </div>

        <h5 className="title is-5">Avialable Fields</h5>
        <div className="columns is-multiline is-bordered">
          {/* 5 text fields, 3 boolean fields, 3 user fields, labels, requester */}
          <div className="column">
            <h6 className="title is-6">Named Fields</h6>
            <Field
              id={rt?.id}
              columnName={rt?.requesterTitle || 'Requester'}
              columnGroups={rt?.requesterGroups || []}
              columnVisible={
                rt?.showRequester === undefined ? true : rt?.showRequester
              }
              type="requester"
              callback={() => setSave(true)}
            />
            <Field
              id={rt?.id}
              columnName={rt?.labelsTitle || 'Labels'}
              columnGroups={rt?.labelsGroups || []}
              columnVisible={
                rt?.showLabels === undefined ? true : rt?.showLabels
              }
              type="labels"
              callback={() => setSave(true)}
            />
          </div>
          <div className="column">
            <h6 className="title is-6">Text Fields</h6>
            <Field
              id={rt?.id}
              columnName={rt?.textFieldOneTitle || 'Description'}
              columnGroups={rt?.textFieldOneGroups || []}
              columnVisible={
                rt?.showTextFieldOne === undefined ? true : rt?.showTextFieldOne
              }
              columnRequired={rt?.requireTextFieldOne || false}
              column="one"
              type="text"
              callback={() => setSave(true)}
            />
            <Field
              id={rt?.id}
              columnName={rt?.textFieldTwoTitle || 'Purpose'}
              columnGroups={rt?.textFieldTwoGroups || []}
              columnVisible={
                rt?.showTextFieldTwo === undefined ? true : rt?.showTextFieldTwo
              }
              columnRequired={rt?.requireTextFieldTwo || false}
              column="two"
              type="text"
              callback={() => setSave(true)}
            />
            <Field
              id={rt?.id}
              columnName={rt?.textFieldThreeTitle || 'Criteria'}
              columnGroups={rt?.textFieldThreeGroups || []}
              columnVisible={
                rt?.showTextFieldThree === undefined
                  ? true
                  : rt?.showTextFieldThree
              }
              columnRequired={rt?.requireTextFieldThree || false}
              column="three"
              type="text"
              callback={() => setSave(true)}
            />
            <Field
              id={rt?.id}
              columnName={rt?.textFieldFourTitle || 'Parameters'}
              columnGroups={rt?.textFieldFourGroups || []}
              columnVisible={
                rt?.showTextFieldFour === undefined
                  ? true
                  : rt?.showTextFieldFour
              }
              columnRequired={rt?.requireTextFieldFour || false}
              column="four"
              type="text"
              callback={() => setSave(true)}
            />
            <Field
              id={rt?.id}
              columnName={rt?.textFieldFiveTitle || 'Schedule'}
              columnGroups={rt?.textFieldFiveGroups || []}
              columnVisible={
                rt?.showTextFieldFive === undefined
                  ? true
                  : rt?.showTextFieldFive
              }
              columnRequired={rt?.requireTextFieldFive || false}
              column="five"
              type="text"
              callback={() => setSave(true)}
            />
          </div>
          <div className="column">
            <h6 className="title is-6">Boolean Fields</h6>
            <Field
              id={rt?.id}
              columnName={rt?.booleanFieldOneTitle || 'Export To Excel'}
              columnGroups={rt?.booleanFieldOneGroups || []}
              columnVisible={
                rt?.showBooleanFieldOne === undefined
                  ? true
                  : rt?.showBooleanFieldOne
              }
              columnRequired={rt?.requireBooleanFieldOne || false}
              column="one"
              type="boolean"
              callback={() => setSave(true)}
            />
            <Field
              id={rt?.id}
              columnName={rt?.booleanFieldTwoTitle || 'Regulatory'}
              columnGroups={rt?.booleanFieldTwoGroups || []}
              columnVisible={
                rt?.showBooleanFieldTwo === undefined
                  ? true
                  : rt?.showBooleanFieldTwo
              }
              columnRequired={rt?.requireBooleanFieldTwo || false}
              column="two"
              type="boolean"
              callback={() => setSave(true)}
            />
            <Field
              id={rt?.id}
              columnName={rt?.booleanFieldThreeTitle || 'Supports Initiative'}
              columnGroups={rt?.booleanFieldThreeGroups || []}
              columnVisible={
                rt?.showBooleanFieldThree === undefined
                  ? true
                  : rt?.showBooleanFieldThree
              }
              columnRequired={rt?.requireBooleanFieldThree || false}
              column="three"
              type="boolean"
              callback={() => setSave(true)}
            />
          </div>
          <div className="column">
            <h6 className="title is-6">User Fields</h6>
            <Field
              id={rt?.id}
              columnName={rt?.userFieldOneTitle || 'Export To Excel'}
              columnGroups={rt?.userFieldOneGroups || []}
              columnVisible={
                rt?.showUserFieldOne === undefined ? true : rt?.showUserFieldOne
              }
              columnRequired={rt?.requireUserFieldOne || false}
              column="one"
              type="user"
              callback={() => setSave(true)}
            />
            <Field
              id={rt?.id}
              columnName={rt?.userFieldTwoTitle || 'Regulatory'}
              columnGroups={rt?.userFieldTwoGroups || []}
              columnVisible={
                rt?.showUserFieldTwo === undefined ? true : rt?.showUserFieldTwo
              }
              columnRequired={rt?.requireUserFieldTwo || false}
              column="two"
              type="user"
              callback={() => setSave(true)}
            />
            <Field
              id={rt?.id}
              columnName={rt?.userFieldThreeTitle || 'Supports Initiative'}
              columnGroups={rt?.userFieldThreeGroups || []}
              columnVisible={
                rt?.showUserFieldThree === undefined
                  ? true
                  : rt?.showUserFieldThree
              }
              columnRequired={rt?.requireUserFieldThree || false}
              column="three"
              type="user"
              callback={() => setSave(true)}
            />
          </div>
        </div>
      </Form>
    </div>
  );
};

export default RequestTypeEditor;

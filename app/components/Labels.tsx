import {
  faCheck,
  faCircleNotch,
  faPalette,
  faPencil,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Form,
  useActionData,
  useLoaderData,
  useSubmit,
  useTransition,
} from '@remix-run/react';
import { type MutableRefObject, type RefObject, forwardRef } from 'react';
import { Fragment, useEffect, useRef, useState } from 'react';
import { SketchPicker } from 'react-color';

import CheckRemove from './CheckRemove';
import { MiniUser } from './User';

const Color = require('color');
const { MeiliSearch } = require('meilisearch');

export const WhiteLabel = ({ label, onClick, paddingLeft = true }) => (
  <div
    onClick={onClick}
    className={` py-2 ${
      paddingLeft && 'pl-2'
    } pr-2 my-0 is-clickable has-background-white `}
  >
    <Label label={label} />
  </div>
);

export const Label = ({ label, onClick }) => {
  const parts = label.name.split('::');
  let luminosity = 1;
  if (label.color) {
    luminosity = Color(label.color).luminosity();
  }
  return (
    <div
      onClick={onClick}
      className="tag is-rounded"
      style={{ backgroundColor: label.color || 'none' }}
    >
      <span
        className={`${
          luminosity < 0.5
            ? 'has-text-white has-text-weight-bold'
            : 'has-text-black'
        }`}
      >
        {parts[0]}
      </span>
      {parts[1] && <span>{parts[1]}</span>}
    </div>
  );
};

export const LabelSelector = forwardRef(
  (
    { labels, actionData, MEILISEARCH_URL, onChange, searchIndex, action },
    ref,
  ) => {
    const [watchState, setWatchState] = useState(false);
    const [labelList, setLabelList] = useState(labels || []);
    const [showLabelSearch, setShowLabelSearch] = useState(false);
    const labelPopout = useRef<HTMLDivElement>();
    const labelModal = useRef<HTMLDivElement>();
    const client = new MeiliSearch({ host: MEILISEARCH_URL });
    const [labelSearchResults, setLabelSearchResults] = useState(null);

    const [showNewLabelModal, setShowNewLabelModal] = useState(false);
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [labelColor, setLabelColor] = useState('');
    const defaultColor = {
      r: '241',
      g: '112',
      b: '19',
      a: '1',
    };
    const [colorPickerColor, setColorPickerColor] = useState(defaultColor);

    const inputReference = useRef<HTMLInputElement>(null);
    const colorPicker = useRef(null);
    const [inputValue, setInputValue] = useState('');
    const [descriptionValue, setDescriptionValue] = useState('');

    const [previewLabel, setPreviewLabel] = useState({
      color: undefined,
      name: undefined,
    });

    const submitNewLabel = useSubmit();

    useEffect(() => {
      (async () => await resetLabelSearch())();
    }, [labelList]);

    const resetLabelSearch = async () => {
      const matches = await client.index(searchIndex).search('', { limit: 10 });

      setLabelSearchResults(
        <>
          {matches.hits.map((label) => (
            <WhiteLabel
              key={label.id}
              label={label}
              onClick={() => {
                if (labelList.filter((x) => x.id === label.id).length === 0) {
                  setLabelList([...labelList, label]);
                }

                setInputValue('');
              }}
            />
          ))}
        </>,
      );
      return;
    };

    useEffect(() => {
      if (actionData?.newLabel) {
        setLabelList([...labelList, actionData.newLabel]);
      }
    }, [actionData]);

    useEffect(() => {
      (async () => await resetLabelSearch())();

      window.addEventListener(
        'click',
        (e) => {
          if (
            labelModal.current &&
            !labelModal.current.contains(event.target as Node)
          ) {
            setShowNewLabelModal(false);
          }
        },
        { capture: true },
      );

      window.addEventListener(
        'click',
        (e) => {
          if (
            colorPicker.current &&
            !colorPicker.current.contains(event.target as Node)
          ) {
            setShowColorPicker(false);
          }
        },
        { capture: true },
      );

      window.addEventListener(
        'click',
        (e) => {
          if (
            labelPopout.current &&
            !labelPopout.current.contains(event.target as Node)
          ) {
            setShowLabelSearch(false);
          }
        },
        { capture: true },
      );
      window.addEventListener('keydown', (event) => {
        const e = event || window.event;
        if (e.key === 'Esc' || e.key === 'Escape') {
          setShowLabelSearch(false);
        }
      });
    }, []);

    useEffect(() => {
      if (onChange) {
        if (watchState === false) {
          setWatchState(true);
          return;
        }
        onChange();
      }
    }, [labelList]);

    const transition = useTransition();

    const isSaving =
      transition.state === 'submitting' &&
      transition.submission.formData.get('_action') === action;

    const hasSaved =
      (transition.state === 'loading' || transition.state === 'idle') &&
      transition.submission &&
      transition.submission.formData.get('_action') === action;

    useEffect(() => {
      inputReference.current?.focus();
    }, [showLabelSearch, labelList]);

    return (
      <>
        <div className="popout" ref={labelPopout}>
          <label
            className="popout-trigger"
            onClick={(e) => {
              setShowLabelSearch(!showLabelSearch);
            }}
          >
            <span>Labels</span>
            <span className="icon mr-2">
              <FontAwesomeIcon icon={faPencil} />
            </span>
          </label>
          {showLabelSearch && (
            <div className="popout-menu">
              <div className="popout-content has-background-light">
                <div className="py-2 px-3 is-flex is-justify-content-space-between">
                  <strong className="my-auto">
                    Add labels to this request
                  </strong>
                  {isSaving ? (
                    <span className="icon has-text-warning my-auto is-pulled-right">
                      <FontAwesomeIcon icon={faCircleNotch} size="lg" spin />
                    </span>
                  ) : (
                    <span
                      className="icon has-text-success my-auto is-pulled-right"
                      style={{
                        transition: 'opacity .2s',
                        transitionDelay: '1s',
                        opacity: hasSaved ? '1' : '0',
                      }}
                    >
                      <FontAwesomeIcon icon={faCheck} size="lg" />
                    </span>
                  )}
                </div>
                <hr />
                <div className="py-2 px-3 has-background-white">
                  <input
                    ref={inputReference}
                    className="input"
                    placeholder="filter labels"
                    value={inputValue}
                    onChange={async (e) => {
                      const searchInput = e.target;
                      setInputValue(e.target.value);
                      setPreviewLabel({
                        ...previewLabel,
                        name: e.target.value,
                      });
                      if (searchInput.value == '') {
                        await resetLabelSearch();
                      } else {
                        const matches = await client
                          .index(searchIndex)
                          .search(searchInput.value, { limit: 20 });

                        if (matches.hits.length > 0) {
                          setLabelSearchResults(
                            <>
                              {matches.hits.map((label) => (
                                <WhiteLabel
                                  key={label.id}
                                  label={label}
                                  onClick={() => {
                                    if (!labelList.includes(label)) {
                                      setLabelList([...labelList, label]);
                                    }
                                    setLabelSearchResults(null);
                                    setInputValue('');
                                  }}
                                />
                              ))}
                            </>,
                          );
                        } else {
                          setLabelSearchResults(
                            <strong className="py-2 px-3 is-block ">
                              No matches.
                            </strong>,
                          );
                        }
                      }
                    }}
                  />
                </div>
                <hr />

                {labelList.length > 0 && (
                  <>
                    <div
                      onClick={() => {
                        setLabelList([]);
                      }}
                      className="is-flex has-background-white is-clickable"
                      style={{ height: '35px' }}
                    >
                      <span className="icon my-auto has-text-grey mx-2">
                        <FontAwesomeIcon icon={faXmark} />
                      </span>
                      <span className="my-auto">Clear List</span>
                    </div>
                    {labelList.map((label) => (
                      <CheckRemove
                        key={label.id}
                        onClick={() => {
                          setLabelList(labelList.filter((x) => x !== label));
                          setLabelSearchResults(null);
                        }}
                      >
                        <WhiteLabel paddingLeft={false} label={label} />
                      </CheckRemove>
                    ))}
                    <hr />
                  </>
                )}
                {labelSearchResults}

                {inputValue && (
                  <>
                    <hr />
                    <strong
                      className="has-background-white py-2 px-3 my-auto is-clickable is-block "
                      onClick={() => {
                        setShowNewLabelModal(true);
                      }}
                    >
                      Create new label "{inputValue}"
                    </strong>

                    <hr />
                  </>
                )}
                <hr />
                <div
                  className="has-background-white py-2 px-3 my-auto is-clickable "
                  onClick={() => {
                    console.log('blah');
                  }}
                >
                  <span className="icon my-auto has-text-grey mx-2">
                    <FontAwesomeIcon icon={faPencil} />
                  </span>
                  <span>Edit labels</span>
                </div>
              </div>
            </div>
          )}

          {labelList &&
            labelList.map((label) => (
              <div key={label.id}>
                <input type="hidden" name="labels" value={label.id} />
                <WhiteLabel label={label} />
              </div>
            ))}

          {(!labelList || labelList?.length === 0) && 'None yet'}

          {actionData?.errors?.requestedFor && (
            <p className="help is-danger">{actionData.errors.requestedFor}</p>
          )}
        </div>
        <hr />
        {/*new label modal*/}
        <div
          className={`modal is-light is-top ${
            showNewLabelModal ? 'is-active' : ''
          }`}
          ref={labelModal}
        >
          <div
            className="modal-background"
            onClick={() => setShowNewLabelModal(false)}
          ></div>

          <div className="modal-card ">
            <header className="modal-card-head ">
              <p className="modal-card-title is-size-6">
                <strong>Create a new label</strong>
              </p>
              <button
                type="button"
                className="delete is-light is-medium"
                aria-label="close"
                onClick={() => setShowNewLabelModal(false)}
              ></button>
            </header>
            <section className="modal-card-body">
              {previewLabel.name && (
                <div className="field">
                  <label className="label">Preview</label>
                  <Label label={previewLabel} />
                </div>
              )}

              <div className="field">
                <label className="label">Label name</label>
                <div className="control">
                  <input
                    className="input semi-disabled"
                    placeholder="label name"
                    value={inputValue}
                    onChange={(e) => {
                      setInputValue(e.target.value);
                      setPreviewLabel({
                        ...previewLabel,
                        name: e.target.value,
                      });
                    }}
                  />
                </div>
              </div>
              <div className="field">
                <label className="label">Description</label>
                <div className="control">
                  <input
                    className="input semi-disabled"
                    placeholder="optional description"
                    value={descriptionValue}
                    onChange={(e) => {
                      setDescriptionValue(e.target.value);
                    }}
                  />
                </div>
              </div>

              <div className="field  is-relative">
                {showColorPicker && (
                  <div
                    style={{ position: 'absolute', top: '73px', zIndex: 2 }}
                    ref={colorPicker}
                  >
                    {' '}
                    <div style={{ position: 'fixed' }}>
                      <SketchPicker
                        color={colorPickerColor}
                        disableAlpha={true}
                        onChange={(color) => {
                          setLabelColor(color.hex);
                          setColorPickerColor(color);
                          setPreviewLabel({
                            ...previewLabel,
                            color: color.hex,
                          });
                        }}
                      />
                    </div>
                  </div>
                )}
                <label className="label">Color</label>
                <div className="field is-grouped">
                  <div className="control">
                    <button
                      className={`button ${
                        labelColor ? '' : 'has-background-light'
                      } `}
                      type="button"
                      style={{ backgroundColor: labelColor || 'initial' }}
                      onClick={() => setShowColorPicker(true)}
                    >
                      <span className="icon">
                        <FontAwesomeIcon icon={faPalette} />
                      </span>
                    </button>
                  </div>
                  <div className="control">
                    <input
                      className="input semi-disabled"
                      placeholder="#1b1"
                      value={labelColor}
                      onChange={(e) => {
                        setLabelColor(e.target.value);
                        setPreviewLabel({
                          ...previewLabel,
                          color: e.target.value,
                        });
                        setColorPickerColor(e.target.value);
                      }}
                      onClick={() => setShowColorPicker(false)}
                    />
                  </div>
                </div>
              </div>
              <hr />
              <div className="pt-4 pb-2 px-2 my-auto">
                <button
                  className="button is-success"
                  type="button"
                  onClick={() => {
                    let formData = new FormData();
                    formData.append('_action', action);
                    formData.append('name', inputValue);
                    if (labelColor) {
                      formData.append('color', labelColor);
                    }
                    if (descriptionValue) {
                      formData.append('description', descriptionValue);
                    }
                    submitNewLabel(formData, { replace: true, method: 'post' });
                    setLabelSearchResults(null);
                    setInputValue('');
                    setShowNewLabelModal(false);
                    setDescriptionValue('');
                    setColorPickerColor(defaultColor);
                    setShowLabelSearch(true);
                  }}
                >
                  Save
                </button>
              </div>
            </section>
          </div>
        </div>
      </>
    );
  },
);

LabelSelector.displayName = 'Label List';

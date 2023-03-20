import {
  faCheck,
  faCircleNotch,
  faPalette,
  faPencil,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { Label } from '@prisma/client';
import { useSubmit, useTransition } from '@remix-run/react';
import Color from 'color';
import { MeiliSearch } from 'meilisearch';
import React, {
  Fragment,
  forwardRef,
  useEffect,
  useRef,
  useState,
} from 'react';
import { SketchPicker } from 'react-color';
import { EmojiFinder } from '~/components/Emoji';

import CheckRemove from './CheckRemove';

export const WhiteLabel = ({
  label,
  onClick,
  paddingLeft = true,
}: {
  label: Label;
  onClick: React.MouseEventHandler<HTMLDivElement>;
  paddingLeft: boolean;
}) => (
  <div
    onClick={onClick}
    className={` py-2 ${
      paddingLeft && 'pl-2'
    } pr-2 my-0 is-clickable has-background-white `}
  >
    <LabelTag label={label} />
  </div>
);

export const LabelTag = ({
  label,
  onClick,
}: {
  label: Label;
  onClick: React.MouseEventHandler<HTMLDivElement>;
}) => {
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

export const LabelCreator = ({
  action,
  name,
  show,
  onClose,
  label,
}: {
  action: any;
  name: string | undefined;
  show: boolean;
  label?: Label;
}) => {
  const [showNewLabelModal, setShowNewLabelModal] = useState(show);
  const [labelDescription, setLabelDescription] = useState<string>(
    label?.description || '',
  );
  const [showColorPicker, setShowColorPicker] = useState<boolean>(false);
  const [idValue, setIdValue] = useState<string>(label?.id || '');
  const [labelColor, setLabelColor] = useState<string>(label?.color || '');
  const [labelName, setLabelName] = useState<string>(label?.name || name || '');
  const defaultColor = {
    r: '241',
    g: '112',
    b: '19',
    a: '1',
  };
  const [colorPickerColor, setColorPickerColor] = useState(defaultColor);
  const colorPicker = useRef(null);
  const labelNameRef = useRef<HTMLInputElement>();
  const labelDescriptionRef = useRef<HTMLInputElement>();
  const labelModal = useRef<HTMLDivElement>();
  const [previewLabel, setPreviewLabel] = useState({
    color: undefined,
    name,
  });

  const submitNewLabel = useSubmit();
  useEffect(() => {
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
  }, []);

  useEffect(() => {
    setShowNewLabelModal(show);
  }, [show]);
  useEffect(() => {
    if (name) {
      setLabelName(name);
    }
    setPreviewLabel({ ...previewLabel, name });
  }, [name]);

  useEffect(() => {
    if (label) {
      setLabelName(label.name || '');
      setIdValue(label.id);
      setLabelDescription(label.description || '');
      setColorPickerColor(label.color || '');
      setLabelColor(label.color || '');
      setPreviewLabel(label);
    }
  }, [label]);

  return (
    <div
      className={`modal is-light is-top ${
        showNewLabelModal ? 'is-active' : ''
      }`}
      ref={labelModal}
    >
      <div className="modal-background" onClick={() => onClose()}></div>

      <div className="modal-card ">
        <header className="modal-card-head ">
          <p className="modal-card-title is-size-6">
            <strong>Create a new label</strong>
          </p>
          <button
            type="button"
            className="delete is-light is-medium"
            aria-label="close"
            onClick={() => onClose()}
          ></button>
        </header>
        <section className="modal-card-body">
          {previewLabel.name && (
            <div className="field">
              <label className="label">Preview</label>
              <LabelTag label={previewLabel} />
            </div>
          )}

          <div className="field">
            <label className="label">Label name</label>
            <div className="control">
              <input
                ref={labelNameRef}
                className="input semi-disabled"
                placeholder="label name"
                value={labelName}
                onChange={(e) => {
                  setLabelName(e.target.value);
                  setPreviewLabel({
                    ...previewLabel,
                    name: e.target.value,
                  });
                }}
              />
              <EmojiFinder
                input={labelNameRef.current}
                value={labelName}
                setter={setLabelName}
              />
            </div>
          </div>
          <div className="field">
            <label className="label">Description</label>
            <div className="control">
              <input
                ref={labelDescriptionRef}
                className="input semi-disabled"
                placeholder="optional description"
                value={labelDescription}
                onChange={(e) => {
                  setLabelDescription(e.target.value);
                }}
              />
              <EmojiFinder
                input={labelDescriptionRef.current}
                value={labelDescription}
                setter={setLabelDescription}
              />
            </div>
          </div>

          <div className="field  is-relative">
            {showColorPicker && (
              <div
                style={{ position: 'absolute', top: '73px', zIndex: 2 }}
                ref={colorPicker}
              >
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
        </section>
        <hr className="m-0" />
        <section className="modal-card-body">
          <div className="p-0 my-auto">
            <button
              className="button is-success is-short"
              type="button"
              onClick={() => {
                const formData = new FormData();
                formData.append('_action', action);
                formData.append('name', labelName);
                if (labelColor) {
                  formData.append('color', labelColor);
                }
                if (labelDescription) {
                  formData.append('description', labelDescription);
                }
                if (idValue) {
                  formData.append('id', idValue);
                }
                submitNewLabel(formData, { replace: true, method: 'post' });
                setLabelName('');
                onClose();
                setLabelDescription('');
                setColorPickerColor(defaultColor);
              }}
            >
              Save
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export const LabelSelector = forwardRef(
  (
    {
      labels,
      actionData,
      MEILISEARCH_URL,
      onChange,
      searchIndex,
      action,
    }: {
      labels?: Label[];
      actionData: any;
      MEILISEARCH_URL: string;
      onChange?: React.ChangeEvent<HTMLInputElement>;
      searchIndex: string;
      action: string;
    },
    ref,
  ) => {
    const [showNewLabelModal, setShowNewLabelModal] = useState(false);
    const [watchState, setWatchState] = useState(false);
    const [labelList, setLabelList] = useState(labels || []);
    const [showLabelSearch, setShowLabelSearch] = useState(false);
    const labelPopout = useRef<HTMLDivElement>();

    const client = new MeiliSearch({ host: MEILISEARCH_URL });
    const [labelSearchResults, setLabelSearchResults] = useState(null);

    const inputReference = useRef<HTMLInputElement>(null);

    const [labelName, setLabelName] = useState('');

    const resetLabelSearch = async () => {
      const matches = await client.index(searchIndex).search('', { limit: 10 });

      setLabelSearchResults(
        <>
          {matches &&
            matches.hits.map((label) => (
              <WhiteLabel
                key={label.id}
                label={label}
                onClick={() => {
                  if (labelList.filter((x) => x.id === label.id).length === 0) {
                    setLabelList([...labelList, label]);
                  }

                  setLabelName('');
                }}
              />
            ))}
        </>,
      );
      return;
    };

    useEffect(() => {
      (async () => resetLabelSearch())();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [labelList]);

    useEffect(() => {
      if (actionData?.newLabel) {
        setLabelList([...labelList, actionData.newLabel]);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [actionData]);

    useEffect(() => {
      (async () => resetLabelSearch())();

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
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
      if (onChange) {
        if (watchState === false) {
          setWatchState(true);
          return;
        }
        onChange();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
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
                    value={labelName}
                    onChange={async (e) => {
                      const searchInput = e.target;
                      setLabelName(e.target.value);

                      if (searchInput.value === '') {
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
                                    setLabelName('');
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
                  <EmojiFinder
                    input={inputReference.current}
                    value={labelName}
                    setter={setLabelName}
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

                {labelName && (
                  <>
                    <hr />
                    <strong
                      className="has-background-white py-2 px-3 my-auto is-clickable is-block "
                      onClick={() => {
                        setShowNewLabelModal(true);
                      }}
                    >
                      Create new label "{labelName}"
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

        <LabelCreator
          action={action}
          name={labelName}
          show={showNewLabelModal}
          onClose={() => {
            setShowNewLabelModal(false);
            setShowLabelSearch(true);
          }}
        />
      </>
    );
  },
);

LabelSelector.displayName = 'Label List';

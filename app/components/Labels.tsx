// import {
//   fa1,
//   faCheck,
//   faCircleNotch,
//   faPalette,
//   faXmark,
// } from '@fortawesome/free-solid-svg-icons';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { SketchPicker } from '@hello-pangea/color-picker';
import type { Label } from '@prisma/client';
import { useNavigation, useSubmit } from '@remix-run/react';
import { Link } from '@remix-run/react';
import Color from 'color';
import { Edit3, Palette } from 'lucide-react';
import React, {
  Fragment,
  forwardRef,
  useEffect,
  useRef,
  useState,
} from 'react';
import { EmojiFinder } from '~/components/Emoji';
import { Badge } from '~/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog';

import CheckRemove from './CheckRemove';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label as UiLabel } from './ui/label';

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
  onClick?: React.MouseEventHandler<HTMLDivElement>;
}) => {
  const parts = label.name.split('::');
  let luminosity = 1;
  if (label.color) {
    luminosity = Color(label.color).luminosity();
  }
  // position: relative;
  //   margin-right: 2px;
  //   padding-right: 1px;
  //   &:after {
  //     position: absolute;
  //     content: '';
  //     top: 0;
  //     bottom: 0;
  //     @extend .has-background-white;
  //     border-bottom-right-radius: 99999px;
  //     border-top-right-radius: 99999px;
  //     height: 100%;
  //     aspect-ratio: 1 / 2;
  //   }

  return (
    <Badge
      className="bordered border-slate-400 space-x-1"
      onClick={onClick}
      style={{ backgroundColor: label.color || '#fff' }}
    >
      <span
        className={`${
          luminosity < 0.5 ? 'text-white font-bold' : 'text-slate-900'
        }`}
      >
        {parts[0]}
      </span>
      {parts[1] && (
        <span
          className="bg-white text-slate-900 pl-1 relative after:absolute after:content-[''] after:top-0 after:bottom-0
      after:bg-white after:rounded-tr-full after:rounded-br-full after:h-full after:aspect-[1/2] after:pl-[1px] after:ml-[-1px]"
        >
          {parts[1]}
        </span>
      )}
    </Badge>
  );
};

function isColor(strColor) {
  var s = new Option().style;
  s.color = strColor;
  return s.color == strColor;
}

export const LabelCreator = ({
  action,
  name,
  show,
  onClose,
  label,
}: {
  action: string;
  name?: string;
  show: boolean;
  label?: Label;
  onClose: () => void;
}) => {
  console.log('show', show);
  const [showNewLabelModal, setShowNewLabelModal] = useState(show);
  const [labelDescription, setLabelDescription] = useState<string>(
    label?.description || '',
  );
  const [labelGroups, setLabelGroups] = useState(label?.groups || []);
  const [groupSearch, setGroupSearch] = useState([]);
  const [groupSearchInput, setGroupSearchInput] = useState('');
  const [showColorPicker, setShowColorPicker] = useState<boolean>(false);
  const [idValue, setIdValue] = useState<string>(label?.id || '');
  const [labelColor, setLabelColor] = useState<string>(label?.color || '');
  const [luminosity, setLuminosity] = useState(1);
  const [labelName, setLabelName] = useState<string>(label?.name || name || '');
  const defaultColor = '#F17013';
  const [colorPickerColor, setColorPickerColor] =
    useState<string>(defaultColor);
  const colorPicker = useRef(null);
  const labelNameRef = useRef<HTMLInputElement>();
  const labelDescriptionRef = useRef<HTMLInputElement>();
  const labelGroupsRef = useRef<HTMLInputElement>();
  const labelModal = useRef<HTMLDivElement>();
  const [previewLabel, setPreviewLabel] = useState({
    color: undefined,
    name,
  });
  // const client = new MeiliSearch({
  //   host: MEILISEARCH_URL,
  //   apiKey: MEILISEARCH_KEY,
  // });

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
    console.log(show);
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
      setIdValue(label.id.toString());
      setLabelDescription(label.description || '');
      setColorPickerColor(label.color || '');
      setLabelColor(label.color || '');
      setPreviewLabel(label);
      setLabelGroups(label.groups || []);
    }
  }, [label]);

  useEffect(
    () => setLuminosity(Color(colorPickerColor).luminosity()),
    [colorPickerColor],
  );

  return (
    <Dialog open={showNewLabelModal} onOpenChange={onClose} ref={labelModal}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Label Builder</DialogTitle>
          <DialogDescription>Create and edit labels.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <UiLabel className="block">Preview</UiLabel>
            <div>{previewLabel.name && <LabelTag label={previewLabel} />}</div>
          </div>

          <div className="space-y-2">
            <UiLabel>Label name</UiLabel>
            <div>
              <Input
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

          <div className="space-y-2">
            <UiLabel>Description</UiLabel>
            <div className="control">
              <Input
                ref={labelDescriptionRef}
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

          <div className="space-y-2">
            <UiLabel>Visible To</UiLabel>
            <small className="block text-muted-foreground">
              Limit visiblity to users in specific groups.
            </small>
            {labelGroups?.length > 0 && (
              <div className="field is-grouped is-grouped-multiline">
                {labelGroups.map((group) => (
                  <div className="control" key={group.id}>
                    <div className="tags has-addons">
                      <a className="tag is-link">{group.name}</a>
                      <a
                        className="tag is-delete"
                        onClick={() => {
                          setLabelGroups(
                            labelGroups.filter((x: Group | any) => x !== group),
                          );
                        }}
                      ></a>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="control is-relative">
              <Input
                ref={labelGroupsRef}
                placeholder="type to search.."
                value={groupSearchInput}
                onChange={async (e) => {
                  // setLabelGroups({...labelGroups, e.target.value});
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
                          if (!labelGroups.includes(group)) {
                            setLabelGroups([...labelGroups, group]);
                          }
                          setGroupSearchInput('');
                          setGroupSearch(<></>);
                        }}
                      >
                        {group.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2 relative">
            {showColorPicker && (
              <div
                style={{ position: 'absolute', top: '75px', zIndex: 2 }}
                ref={colorPicker}
              >
                <div style={{ position: 'fixed' }}>
                  <SketchPicker
                    color={colorPickerColor}
                    disableAlpha={true}
                    onChange={(color) => {
                      setLabelColor(color.hex);
                      setColorPickerColor(color.hex);
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
            <div className="flex space-x-2">
              <Button
                variant="outline"
                className={`px-2 ${
                  luminosity < 0.5
                    ? 'text-slate-100 hover:text-slate-200'
                    : 'text-slate-800 hover:text-slate-900'
                }`}
                type="button"
                style={{ backgroundColor: colorPickerColor || 'initial' }}
                onClick={() => setShowColorPicker(true)}
              >
                <Palette />
              </Button>

              <Input
                className="input semi-disabled"
                placeholder="#1b1"
                value={labelColor}
                onChange={(e) => {
                  setLabelColor(e.target.value);
                  const color = isColor(e.target.value) ? e.target.value : '';

                  setPreviewLabel({
                    ...previewLabel,
                    color,
                  });
                  setColorPickerColor(color || '#fff');
                }}
                onClick={() => setShowColorPicker(false)}
              />
            </div>
          </div>

          <div className="p-0 my-auto">
            <Button
              variant="secondary"
              className=""
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
                if (labelGroups.length > 0) {
                  formData.append(
                    'groups',
                    JSON.stringify(labelGroups.map((x) => x.id)),
                  );
                }
                submitNewLabel(formData, { replace: true, method: 'post' });
                setLabelName('');
                onClose();
                setLabelDescription('');
                setColorPickerColor(defaultColor);
              }}
            >
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const LabelSelector = forwardRef(
  (
    {
      labels,
      actionData,
      onChange,
      action,
    }: {
      labels?: Label[];
      actionData: any;
      onChange?: React.ChangeEvent<HTMLInputElement>;
      action: string;
    },
    ref,
  ) => {
    const [showNewLabelModal, setShowNewLabelModal] = useState(false);
    const [watchState, setWatchState] = useState(false);
    const [labelList, setLabelList] = useState(labels || []);
    const [showLabelSearch, setShowLabelSearch] = useState(false);
    const labelPopout = useRef<HTMLDivElement>();

    const [labelSearchResults, setLabelSearchResults] = useState(null);

    const inputReference = useRef<HTMLInputElement>(null);

    const [labelName, setLabelName] = useState('');

    const resetLabelSearch = async () => {
      // const matches = await client.index(searchIndex).search('', { limit: 10 });

      // setLabelSearchResults(
      //   <>
      //     {matches &&
      //       matches.hits.map((label) => (
      //         <WhiteLabel
      //           key={label.id}
      //           label={label}
      //           onClick={() => {
      //             if (labelList.filter((x) => x.id === label.id).length === 0) {
      //               setLabelList([...labelList, label]);
      //             }

      //             setLabelName('');
      //           }}
      //         />
      //       ))}
      //   </>,
      // );
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

    const transition = useNavigation();

    const isSaving =
      transition.state === 'submitting' &&
      transition.formData?.get('_action') === action;

    const hasSaved =
      (transition.state === 'loading' || transition.state === 'idle') &&
      transition.formData?.get('_action') === action;

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
              <Edit3 size={16} />
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
                      {/*<FontAwesomeIcon icon={faCircleNotch} size="lg" spin />*/}
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
                      {/*<FontAwesomeIcon icon={faCheck} size="lg" />*/}
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
                        // const matches = await client
                        //   .index(searchIndex)
                        //   .search(searchInput.value, { limit: 20 });
                        // if (matches.hits.length > 0) {
                        //   setLabelSearchResults(
                        //     <>
                        //       {matches.hits.map((label) => (
                        //         <WhiteLabel
                        //           key={label.id}
                        //           label={label}
                        //           onClick={() => {
                        //             if (!labelList.includes(label)) {
                        //               setLabelList([...labelList, label]);
                        //             }
                        //             setLabelSearchResults(null);
                        //             setLabelName('');
                        //           }}
                        //         />
                        //       ))}
                        //     </>,
                        //   );
                        // } else {
                        //   setLabelSearchResults(
                        //     <strong className="py-2 px-3 is-block ">
                        //       No matches.
                        //     </strong>,
                        //   );
                        // }
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
                        {/*<FontAwesomeIcon icon={faXmark} />*/}
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
                <Link
                  className="has-background-white py-2 px-3 my-auto is-clickable is-block "
                  to="/admin/labels"
                >
                  <span className="icon my-auto has-text-grey mx-2">
                    <Edit3 size={16} />
                  </span>
                  <span className="has-text-grey">Edit labels</span>
                </Link>
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

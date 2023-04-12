import {
  faCheck,
  faCircleNotch,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { User } from '@prisma/client';
import { useTransition } from '@remix-run/react';
import { MeiliSearch } from 'meilisearch';
import React, {
  Fragment,
  forwardRef,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Edit3 } from 'react-feather';

import CheckRemove from './CheckRemove';
import { MiniUser } from './User';

export const AssigneeSelector = forwardRef(
  (
    {
      me,
      assignees,
      actionData,
      MEILISEARCH_URL,
      MEILISEARCH_KEY,
      onChange,
      action,
      searchIndex,
    }: {
      me: User;
      assignees?: User[] | string | any;
      MEILISEARCH_URL: string;
      MEILISEARCH_KEY: string;
      actionData: any;
      onChange?: React.ChangeEvent<HTMLInputElement>;
      action: string;
      searchIndex: string;
    },
    ref,
  ) => {
    const [watchState, setWatchState] = useState(false);
    const [assigneeList, setAssigneeList] = useState(assignees || []);
    const [showAssigneeSearch, setShowAssigneeSearch] = useState(false);
    const assigneePopout = useRef<HTMLDivElement>(null);
    const client = new MeiliSearch({
      host: MEILISEARCH_URL,
      apiKey: MEILISEARCH_KEY,
    });

    const [assigneeSearchResults, setAssigneeSearchResults] = useState(<></>);

    const inputReference = useRef<HTMLInputElement>(null);

    useEffect(() => {
      window.addEventListener(
        'click',
        (event) => {
          if (
            assigneePopout.current &&
            !assigneePopout.current.contains(event.target as Node)
          ) {
            setShowAssigneeSearch(false);
          }
        },
        { capture: true },
      );
      window.addEventListener('keydown', (event) => {
        const e = event || window.event;
        if (e.key === 'Esc' || e.key === 'Escape') {
          setShowAssigneeSearch(false);
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
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [assigneeList]);

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
    }, [showAssigneeSearch, assigneeList]);

    return (
      <>
        <div className="popout" ref={assigneePopout}>
          <label
            className="popout-trigger"
            onClick={(e) => {
              setShowAssigneeSearch(!showAssigneeSearch);
            }}
          >
            <span>Assigned Analysts</span>
            <span className="icon mr-2">
              <Edit3 size={16} />
            </span>
          </label>
          {showAssigneeSearch && (
            <div className="popout-menu">
              <div className="popout-content has-background-light">
                <div className="py-2 px-3 is-flex is-justify-content-space-between">
                  <strong className="my-auto">
                    Add subscribers to this report
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
                    placeholder="filter users"
                    ref={inputReference}
                    className="input"
                    onChange={async (e) => {
                      const searchInput = e.target;
                      if (searchInput.value.length === 0) {
                        setAssigneeSearchResults(<></>);
                      } else {
                        const matches = await client
                          .index(searchIndex)
                          .search(searchInput.value, { limit: 20 });

                        if (matches.hits.length > 0) {
                          setAssigneeSearchResults(
                            <>
                              {matches.hits.map((user) => (
                                <MiniUser
                                  key={user.id}
                                  user={user}
                                  onClick={() => {
                                    if (!assigneeList.includes(user)) {
                                      setAssigneeList([...assigneeList, user]);
                                    }
                                    setAssigneeSearchResults(<></>);
                                    searchInput.value = '';
                                    // setShowAssigneeSearch(false)
                                  }}
                                  linkToUser={false}
                                />
                              ))}
                            </>,
                          );
                        } else {
                          setAssigneeSearchResults(
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
                {assigneeList.length > 0 && (
                  <>
                    <div
                      onClick={() => setAssigneeList([])}
                      className="is-flex has-background-white is-clickable"
                      style={{ height: '35px' }}
                    >
                      <span className="icon my-auto has-text-grey mx-2">
                        <FontAwesomeIcon icon={faXmark} />
                      </span>
                      <span className="my-auto">Clear List</span>
                    </div>
                    {assigneeList.map((assignee: User | any) => (
                      <CheckRemove
                        key={assignee.id}
                        onClick={() => {
                          setAssigneeList(
                            assigneeList.filter(
                              (x: User | any) => x !== assignee,
                            ),
                          );
                          setAssigneeSearchResults(<></>);
                        }}
                      >
                        <MiniUser
                          key={assignee.id}
                          user={assignee}
                          linkToUser={false}
                        />
                      </CheckRemove>
                    ))}
                    <hr />
                  </>
                )}

                {assigneeSearchResults || (
                  <>
                    <strong className="py-2 px-3 is-block ">Suggestions</strong>
                    <hr />
                    <MiniUser
                      user={me}
                      onClick={() => {
                        if (
                          assigneeList.filter((x: User | any) => x.id === me.id)
                            .length === 0
                        ) {
                          setAssigneeList([...assigneeList, me]);
                        }
                        setAssigneeSearchResults(<></>);
                      }}
                    />
                    ... boss or others?
                  </>
                )}
              </div>
            </div>
          )}

          {assigneeList &&
            assigneeList.map((assignee: User | any) => (
              <div key={assignee.id}>
                <input type="hidden" name="assignees" value={assignee.id} />
                <MiniUser user={assignee}></MiniUser>
              </div>
            ))}

          {(!assigneeList || assigneeList?.length === 0) && (
            <>
              {'No one—'}
              <span
                className="has-text-link is-clickable"
                onClick={(event) => {
                  event.stopPropagation();
                  if (!assigneeList.includes(me)) {
                    setAssigneeList([...assigneeList, me]);
                  }
                }}
              >
                add yourself
              </span>
            </>
          )}

          {actionData?.errors?.requestedFor && (
            <p className="help is-danger">{actionData.errors.requestedFor}</p>
          )}
        </div>
        <hr />
      </>
    );
  },
);

AssigneeSelector.displayName = 'Assignee List';

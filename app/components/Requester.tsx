// import { faCheck, faCircleNotch } from '@fortawesome/free-solid-svg-icons';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useNavigation } from '@remix-run/react';
import { Edit3 } from 'lucide-react';
import { MeiliSearch } from 'meilisearch';
import React, { forwardRef, useEffect, useRef, useState } from 'react';

import { MiniUser } from './User';

export const RequesterSelector = forwardRef(
  (
    {
      me,
      user,
      actionData,
      MEILISEARCH_URL,
      MEILISEARCH_KEY,
      onChange,
      action,
      searchIndex,
    }: {
      me: User;
      user?: User;
      actionData: any;
      MEILISEARCH_URL: string;
      MEILISEARCH_KEY: string;
      onChange?: React.ChangeEvent<HTMLInputElement>;
      action: string;
      searchIndex: string;
    },
    ref,
  ) => {
    const [watchState, setWatchState] = useState(false);
    const [requester, setRequester] = useState(user);
    const [showRequesterSearch, setShowRequesterSearch] = useState(false);
    const requesterPopout = useRef<HTMLDivElement>();
    const client = new MeiliSearch({
      host: MEILISEARCH_URL,
      apiKey: MEILISEARCH_KEY,
    });

    const [requesterSearchResults, setRequesterSearchResults] = useState(null);

    const inputReference = useRef<HTMLInputElement>(null);

    useEffect(() => {
      window.onclick = (event) => {
        if (
          requesterPopout.current &&
          !requesterPopout.current.contains(event.target as Node)
        ) {
          setShowRequesterSearch(false);
        }
      };
      window.addEventListener('keydown', (event) => {
        const e = event || window.event;
        if (e.key === 'Esc' || e.key === 'Escape') {
          setShowRequesterSearch(false);
        }
      });
    }, []);

    useEffect(() => {
      if (onChange) {
        if (watchState === false) {
          console.log('returning');
          setWatchState(true);
          return;
        }
        onChange();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [requester]);

    const transition = useNavigation();

    const isSaving =
      transition.state === 'submitting' &&
      transition.formData?.get('_action') === action;

    const hasSaved =
      (transition.state === 'loading' || transition.state === 'idle') &&
      transition.formData?.get('_action') === action;

    useEffect(() => {
      inputReference.current?.focus();
    }, [showRequesterSearch]);

    return (
      <>
        <div className="popout" ref={requesterPopout}>
          <label
            className="popout-trigger"
            onClick={(e) => {
              setShowRequesterSearch(!showRequesterSearch);
            }}
          >
            <span>Requester</span>
            <span className="icon mr-2">
              <Edit3 size={16} />
            </span>
          </label>
          {showRequesterSearch && (
            <div className="popout-menu">
              <div className="popout-content has-background-light">
                <strong className="py-2 px-3 is-block ">
                  Request this on the behalf of
                </strong>
                <hr />
                <div className="py-2 px-3 has-background-white">
                  <input
                    placeholder="filter users"
                    ref={inputReference}
                    className="input"
                    onChange={async (e) => {
                      const searchInput = e.target;
                      if (searchInput.value.length === 0) {
                        setRequesterSearchResults(null);
                      } else {
                        const matches = await client
                          .index(searchIndex)
                          .search(searchInput.value, { limit: 20 });

                        if (matches.hits.length > 0) {
                          setRequesterSearchResults(
                            <>
                              {matches.hits.map((user) => (
                                <MiniUser
                                  key={user.id}
                                  user={user}
                                  onClick={() => {
                                    setRequester(user);
                                    setRequesterSearchResults(null);
                                    searchInput.value = '';
                                    setShowRequesterSearch(false);
                                  }}
                                  linkToUser={false}
                                />
                              ))}
                            </>,
                          );
                        } else {
                          setRequesterSearchResults(
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

                {requesterSearchResults || (
                  <>
                    <strong className="py-2 px-3 is-block ">Suggestions</strong>
                    <hr />
                    <MiniUser
                      user={me}
                      onClick={() => {
                        setRequester(me);
                        setRequesterSearchResults(null);
                        setShowRequesterSearch(false);
                      }}
                    />
                    ... boss or others?
                  </>
                )}
              </div>
            </div>
          )}

          <input
            type="hidden"
            ref={ref}
            name="requestedFor"
            value={requester.id}
          />
          <MiniUser user={requester}>
            <>
              {requester.id !== me.id && (
                <>
                  —
                  <span
                    className="has-text-link"
                    onClick={(event) => {
                      event.stopPropagation();
                      setRequester(me);
                    }}
                  >
                    set back to me
                  </span>
                </>
              )}

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
            </>
          </MiniUser>

          {actionData?.errors?.requestedFor && (
            <p className="help is-danger">{actionData.errors.requestedFor}</p>
          )}
        </div>
        <hr />
      </>
    );
  },
);

RequesterSelector.displayName = 'Requester Selector';

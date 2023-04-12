import { faCheck, faCircleNotch } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { User } from '@prisma/client';
import { useSubmit, useTransition } from '@remix-run/react';
import React, { Fragment, forwardRef, useEffect, useState } from 'react';
import { Bell, BellOff } from 'react-feather';

import { MiniUser } from './User';

export const WatcherList = forwardRef(
  (
    {
      me,
      watchers,
      action,
    }: {
      me: User;
      watchers?: User[];
      action: string;
    },
    ref,
  ) => {
    const [watcherList, setWatcherList] = useState(watchers || []);

    const [watching, setWatching] = React.useState(
      (watchers || []).filter((x) => x.id === me.id).length > 0,
    );

    const submitWatch = useSubmit();

    useEffect(() => {
      setWatcherList(watchers || []);
      setWatching((watchers || []).filter((x) => x.id === me.id).length > 0);
    }, [watchers, me]);

    const transition = useTransition();

    const isSaving =
      transition.state === 'submitting' &&
      transition.submission.formData.get('_action') === action;

    const hasSaved =
      (transition.state === 'loading' || transition.state === 'idle') &&
      transition.submission &&
      transition.submission.formData.get('_action') === action;

    return (
      <>
        <strong className="is-block has-text-grey  is-flex is-justify-content-space-between">
          Watchers
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
        </strong>

        {watcherList &&
          watcherList.map((watcher) => (
            <div key={watcher.id}>
              <input type="hidden" name="watchers" value={watcher.id} />
              <MiniUser user={watcher}></MiniUser>
            </div>
          ))}

        {(!watcherList || watcherList?.length === 0) && (
          <div className="is-block my-2">No one</div>
        )}
        <button
          className="button is-fullwidth"
          type="button"
          onClick={() => {
            const formData = new FormData();
            formData.append('_action', action);
            formData.append('watch', (!watching).toString());

            submitWatch(formData, { replace: true, method: 'post' });
          }}
        >
          <span className="icon">
            {watching ? <BellOff size={16} /> : <Bell size={16} />}
          </span>
          <span>{watching && 'un'}subscribe</span>
        </button>

        <hr />
      </>
    );
  },
);

WatcherList.displayName = 'Watcher List';

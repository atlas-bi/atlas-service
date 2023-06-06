import type { Request } from '@prisma/client';
import { json } from '@remix-run/node';
import { NavLink, useLoaderData } from '@remix-run/react';
import type { LoaderArgs } from '@remix-run/server-runtime';
import { Activity, AtSign, Bell, Filter, User as UserIcon } from 'lucide-react';
import { useState } from 'react';
import { LabelTag } from '~/components/Labels';
import { getRequests } from '~/models/request.server';
import { authenticator } from '~/services/auth.server';

export async function loader({ request }: LoaderArgs) {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: `/auth/?returnTo=${encodeURI(
      new URL(request.url).pathname,
    )}`,
  });

  const myRequests = await getRequests({ userId: user.id });
  const assignedRequests = await getRequests({ assigneeId: user.id });
  const watchedRequests = await getRequests({ watcherId: user.id });
  const mentionedRequests = await getRequests({ mentionedId: user.id });
  return json({
    user,
    myRequests,
    assignedRequests,
    watchedRequests,
    mentionedRequests,
  });
}

export default function Index() {
  const {
    user,
    myRequests,
    assignedRequests,
    watchedRequests,
    mentionedRequests,
  } = useLoaderData<typeof loader>();
  const [showTab, setShowTab] = useState('myRequests');

  return (
    <div>
      <div className="field has-addons">
        <p className="control">
          <button
            className="button"
            type="button"
            onClick={() => setShowTab('myRequests')}
          >
            <span className="icon is-small">
              <UserIcon size={16} />
            </span>
            <span>My Requests</span>
          </button>
        </p>
        {assignedRequests.length > 0 && (
          <p className="control">
            <button
              className="button"
              type="button"
              onClick={() => setShowTab('assignedRequests')}
            >
              <span className="icon is-small">
                <Activity size={16} />
              </span>
              <span>Assigned to Me</span>
            </button>
          </p>
        )}
        {mentionedRequests.length > 0 && (
          <p className="control">
            <button
              className="button"
              type="button"
              onClick={() => setShowTab('mentionedRequests')}
            >
              <span className="icon is-small">
                <AtSign size={16} />
              </span>
              <span>Mentions</span>
            </button>
          </p>
        )}
        <p className="control">
          <button
            className="button"
            type="button"
            onClick={() => setShowTab('watchedRequests')}
          >
            <span className="icon is-small">
              <Bell size={16} />
            </span>
            <span>Watching</span>
          </button>
        </p>
      </div>
      <div className="field">
        <p className="control has-icons-left">
          <input className="input" type="text" placeholder="type to filter" />
          <span className="icon is-small is-left">
            <Filter size={16} />
          </span>
        </p>
      </div>
      - open/close/other status - Requester - Label - Project - Assigee - Sort
      <h3 className="title is-3">yo {user.firstName}</h3>
      {showTab === 'myRequests' && (
        <>
          {myRequests.length === 0 ? (
            <p className="p-4">No requests yet</p>
          ) : (
            <>
              {', '}
              you have some requests:
              <div
                className="list has-hoverable-list-items  has-overflow-ellipsis"
                style={{ '--length': 25 }}
              >
                {myRequests.map((request: Request) => (
                  <div className="list-item" key={request.id}>
                    <NavLink to={`/request/` + request.id.toString()}>
                      <div className="list-item-content">
                        <div className="list-item-title">
                          📝 {request.name} {request.id}
                        </div>
                        <div className="list-item-description">
                          {request.descriptionText}
                        </div>
                        {request.labels && (
                          <div className="tags">
                            {request.labels.map((label) => (
                              <LabelTag key={label.id} label={label} />
                            ))}
                          </div>
                        )}
                      </div>
                    </NavLink>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
      {showTab === 'assignedRequests' && (
        <>
          {assignedRequests.length === 0 ? (
            <p className="p-4">No assigned requests yet</p>
          ) : (
            <>
              {', '}
              you have some assigned requests:
              <div
                className="list has-hoverable-list-items  has-overflow-ellipsis"
                style={{ '--length': 25 }}
              >
                {assignedRequests.map((request: Request) => (
                  <div className="list-item" key={request.id}>
                    <NavLink to={`/request/` + request.id.toString()}>
                      <div className="list-item-content">
                        <div className="list-item-title">
                          📝 {request.name} {request.id}
                        </div>
                        <div className="list-item-description">
                          {request.descriptionText}
                        </div>
                      </div>
                    </NavLink>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
      {showTab === 'mentionedRequests' && (
        <>
          {mentionedRequests.length === 0 ? (
            <p className="p-4">No mentioned requests yet</p>
          ) : (
            <>
              {', '}
              you have some mentioned requests:
              <div
                className="list has-hoverable-list-items  has-overflow-ellipsis"
                style={{ '--length': 25 }}
              >
                {mentionedRequests.map((request: Request) => (
                  <div className="list-item" key={request.id}>
                    <NavLink to={`/request/` + request.id.toString()}>
                      <div className="list-item-content">
                        <div className="list-item-title">
                          📝 {request.name} {request.id}
                        </div>
                        <div className="list-item-description">
                          {request.descriptionText}
                        </div>
                      </div>
                    </NavLink>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
      {showTab === 'watchedRequests' && (
        <>
          {watchedRequests.length === 0 ? (
            <p className="p-4">No watched requests yet</p>
          ) : (
            <>
              {', '}
              you are watching some requests:
              <div
                className="list has-hoverable-list-items  has-overflow-ellipsis"
                style={{ '--length': 25 }}
              >
                {watchedRequests.map((request: Request) => (
                  <div className="list-item" key={request.id}>
                    <NavLink to={`/request/` + request.id.toString()}>
                      <div className="list-item-content">
                        <div className="list-item-title">
                          📝 {request.name} {request.id}
                        </div>
                        <div className="list-item-description">
                          {request.descriptionText}
                        </div>
                      </div>
                    </NavLink>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

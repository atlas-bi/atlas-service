import { faBarsProgress } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { Request, User } from '@prisma/client';
import { type Session, json } from '@remix-run/node';
import { NavLink, useLoaderData } from '@remix-run/react';
import type { LoaderArgs } from '@remix-run/server-runtime';
import { useState } from 'react';
import { getRequests } from '~/models/request.server';
import { authorize } from '~/session.server';

export async function loader({ request }: LoaderArgs) {
  return authorize(
    request,
    undefined,
    async ({ user, session }: { user: User; session: Session }) => {
      const myRequests = await getRequests({ userId: user.id });
      const assignedRequests = await getRequests({ assigneeId: user.id });
      const watchedRequests = await getRequests({ watcherId: user.id });
      return json({ user, myRequests, assignedRequests, watchedRequests });
    },
  );
}

export default function Index() {
  const { user, myRequests, assignedRequests, watchedRequests } =
    useLoaderData<typeof loader>();

  const [showTab, setShowTab] = useState('myRequests');

  return (
    <div className="container ">
      <div className="field has-addons">
        <p className="control">
          <button
            className="button"
            type="button"
            onClick={() => setShowTab('myRequests')}
          >
            <span className="icon is-small">
              <i className="fas fa-align-left"></i>
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
                <FontAwesomeIcon icon={faBarsProgress} />
              </span>
              <span>Assigned to Me</span>
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
              <FontAwesomeIcon icon={faBarsProgress} />
            </span>
            <span>Watching</span>
          </button>
        </p>
      </div>

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

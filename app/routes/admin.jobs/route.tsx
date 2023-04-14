import { faMagnifyingGlass, faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  type ActionArgs,
  type LoaderArgs,
  type Session,
  json,
} from '@remix-run/node';
import {
  Form,
  useActionData,
  useFetcher,
  useLoaderData,
  useSubmit,
} from '@remix-run/react';
import { UserCog } from 'lucide-react';
import { Activity, CheckCheck, ScreenShareOff, Slash } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { namedAction } from 'remix-utils';
import { EmojiFinder } from '~/components/Emoji';
import { LabelCreator, LabelTag } from '~/components/Labels';
import { MiniUser } from '~/components/User';
import { getLogs } from '~/models/joblog.server';
import {
  createLabel,
  deleteLabel,
  getLabels,
  updateLabel,
} from '~/models/label.server';
import userRefreshQueue from '~/queues/user_refresh.server';
import { authorize, requireUser } from '~/session.server';

export async function loader({ request, params }: LoaderArgs) {
  return authorize(
    request,
    [process.env.ADMIN_GROUP],
    async ({ user, session }: { user: User; session: Session }) => {
      return json({ user, jobLogs: await getLogs() });
    },
  );
}

export async function action({ request }: ActionArgs) {
  const user = await requireUser(request);

  return namedAction(request, {
    async userData() {
      await userRefreshQueue.enqueue(user);
      return null;
    },
    async refreshLogs() {
      console.log('refreshing');
      return json({ jobLogs: await getLogs() });
    },
  });
}

export default function Index() {
  const { user, jobLogs } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [logs, setLogs] = useState(jobLogs);

  useEffect(() => {
    if (actionData?.jobLogs) {
      setLogs(actionData.jobLogs);
    }
  }, [actionData]);

  const submitForm = useSubmit();
  const filterInput = useRef();
  // const fetcher = useFetcher();

  return (
    <>
      <h3 className="title is-3">Run Jobs</h3>
      <div className="buttons">
        <button
          type="button"
          className="button"
          onClick={() => {
            const formData = new FormData();
            formData.append('_action', 'userData');
            submitForm(formData, {
              replace: true,
              method: 'post',
            });
          }}
        >
          <span className="icon">
            <UserCog size={14} />
          </span>
          <span>Load Users</span>
        </button>
      </div>
      {logs.length > 0 && (
        <>
          <h3 className="title is-3">Job History</h3>
          <button
            type="button"
            className="button"
            onClick={() => {
              const formData = new FormData();
              formData.append('_action', 'refreshLogs');
              const x = submitForm(formData, {
                replace: true,
                method: 'post',
              });
              console.log(x);
            }}
          >
            refresh
          </button>
          <table className="table">
            <tbody>
              <tr>
                <th></th>
                <th>Job</th>
                <th>Id</th>
                <th>Status</th>
                <th>Message</th>
                <th>Run By</th>
              </tr>
              {logs.map((log) => (
                <tr key={log.id} className={`{log.fail ? 'is-danger' : ''`}>
                  <td>
                    <span className="icon">
                      {log.fail || log.status === 'failed' ? (
                        <Slash size={14} color="red" />
                      ) : log.status === 'started' ? (
                        <Activity size={14} color="green" />
                      ) : log.status === 'completed' ? (
                        <CheckCheck size={14} color="blue" />
                      ) : (
                        <ScreenShareOff size={14} />
                      )}
                    </span>
                  </td>
                  <td>{log.name}</td>
                  <td>{log.quirrelId}</td>
                  <td>{log.status}</td>
                  <td>{log.message}</td>
                  <td>
                    {log.runBy ? <MiniUser user={log.runBy} /> : 'system'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </>
  );
}

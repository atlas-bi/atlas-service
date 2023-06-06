import { type ActionArgs, type LoaderArgs, json } from '@remix-run/node';
import {
  Form,
  useActionData,
  useFetcher,
  useLoaderData,
  useSubmit,
} from '@remix-run/react';
import { UserCog } from 'lucide-react';
import {
  Activity,
  CheckCheck,
  ScreenShareOff,
  Search,
  Slash,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { namedAction } from 'remix-utils';
import { MiniUser } from '~/components/User';
import { getLogs } from '~/models/joblog.server';
import searchRefreshQueue from '~/queues/search_refresh.server';
import userRefreshQueue from '~/queues/user_refresh.server';
import { authenticator } from '~/services/auth.server';

export async function loader({ request, params }: LoaderArgs) {
  await authenticator.isAuthenticated(request, {
    failureRedirect: `/auth/?returnTo=${encodeURI(
      new URL(request.url).pathname,
    )}`,
  });
  return json({ jobLogs: await getLogs() });
}

export async function action({ request }: ActionArgs) {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: `/auth/?returnTo=${encodeURI(
      new URL(request.url).pathname,
    )}`,
  });

  return namedAction(request, {
    async userData() {
      await userRefreshQueue.enqueue(user);
      return null;
    },
    async searchData() {
      await searchRefreshQueue.enqueue(user);
      return null;
    },
    async refreshLogs() {
      return json({ jobLogs: await getLogs() });
    },
  });
}

export default function Index() {
  const { jobLogs } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [logs, setLogs] = useState(jobLogs);
  const [count, setCount] = useState(0);
  const fetcher = useFetcher();

  useEffect(() => {
    const timer = setTimeout(() => {
      setCount(count + 1);
      const formData = new FormData();
      formData.append('_action', 'refreshLogs');
      const x = fetcher.submit(formData, {
        replace: true,
        method: 'post',
      });
    }, 1e3);
    return () => clearTimeout(timer);
  }, [count, actionData]);

  useEffect(() => {
    if (fetcher?.data?.jobLogs) {
      setLogs(fetcher.data.jobLogs);
    }
  }, [fetcher]);

  const submitForm = useSubmit();

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

        <button
          type="button"
          className="button"
          onClick={() => {
            const formData = new FormData();
            formData.append('_action', 'searchData');
            submitForm(formData, {
              replace: true,
              method: 'post',
            });
          }}
        >
          <span className="icon">
            <Search size={14} />
          </span>
          <span>Refresh Search</span>
        </button>
      </div>

      {logs.length > 0 && (
        <>
          <h3 className="title is-3">Job History</h3>
          <table className="table">
            <tbody>
              <tr>
                <th></th>
                <th>Job</th>
                <th>Id</th>
                <th>Status</th>
                <th>Message</th>
                <th>Run By</th>
                <th>Date</th>
              </tr>
              {logs.map((log) => (
                <tr key={log.id} className={`{log.fail ? 'is-danger' : ''`}>
                  <td>
                    <span className="icon">
                      {log.fail ||
                      (new Date(log.createdAt) <
                        new Date(new Date().getTime() - 24 * 60 * 60 * 1000) &&
                        log.status === 'started') ||
                      log.status === 'failed' ? (
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
                  <td>
                    {new Date(log.createdAt) <
                      new Date(new Date().getTime() - 24 * 60 * 60 * 1000) &&
                    log.status === 'started'
                      ? 'failed'
                      : log.status}
                  </td>
                  <td>{log.message}</td>
                  <td>
                    {log.runBy ? <MiniUser user={log.runBy} /> : 'system'}
                  </td>
                  <td>{log.completed || log.started || log.created}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </>
  );
}

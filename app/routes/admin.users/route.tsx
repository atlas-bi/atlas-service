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
import {
  Activity,
  CheckCheck,
  ScreenShareOff,
  Search,
  Slash,
} from 'lucide-react';
import { Queue } from 'quirrel/remix';
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
import searchRefreshQueue from '~/queues/search_refresh.server';
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

export default function Index() {
  const { user } = useLoaderData<typeof loader>();

  return (
    <>
      Users admin type - what groups should admin users have/who is admin? who
      is an admin anyways?
    </>
  );
}

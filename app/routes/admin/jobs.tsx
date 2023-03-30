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
  useLoaderData,
  useSubmit,
  useTransition,
} from '@remix-run/react';
import { useEffect, useRef, useState } from 'react';
import { namedAction } from 'remix-utils';
import { EmojiFinder } from '~/components/Emoji';
import { LabelCreator, LabelTag } from '~/components/Labels';
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
      return json({ user });
    },
  );
}

export async function action({ request }: ActionArgs) {
  const user = await requireUser(request);

  return namedAction(request, {
    async userData() {
      await userRefreshQueue.enqueue(null);
      return null;
    },
  });
}

export default function Index() {
  const { user } = useLoaderData<typeof loader>();

  const submitForm = useSubmit();
  const filterInput = useRef();

  return (
    <div className="container ">
      <div className="is-flex is-justify-content-space-between pt-5">
        <button
          type="button"
          onClick={() => {
            const formData = new FormData();
            formData.append('_action', 'userData');
            submitForm(formData, {
              replace: true,
              method: 'post',
            });
          }}
        >
          Load Users
        </button>
      </div>
    </div>
  );
}

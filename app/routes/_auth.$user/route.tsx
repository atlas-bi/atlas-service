import type { User } from '@prisma/client';
import {
  type ActionArgs,
  type LoaderArgs,
  json,
  redirect,
} from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { MeiliSearch } from 'meilisearch';
import { useEffect, useState } from 'react';
import { namedAction } from 'remix-utils';
import invariant from 'tiny-invariant';
import { getUserBySlug } from '~/models/user.server';
import { updateBio as updateUserBio } from '~/models/user.server';
import { userIndex } from '~/search.server';
import { authenticator } from '~/services/auth.server';

import { Sidebar } from './sidebar';

export async function action({ request }: ActionArgs) {
  console.log('in action');
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: `/auth/saml/?returnTo=${encodeURI(request.url)}`,
  });

  return namedAction(request, {
    async updateBio() {
      const formData = await request.formData();
      const { bio, id } = Object.fromEntries(formData);
      if (Number(id) === user.id) updateUserBio({ id: user.id, bio });
      return null;
    },
  });
}

export async function loader({ request, params }: LoaderArgs) {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: `/auth/saml/?returnTo=${encodeURI(request.url)}`,
  });

  const { user: slug } = params;
  const profile = await getUserBySlug(slug);

  if (!profile) {
    return redirect('/does-not-exist');
  }

  invariant(process.env.MEILISEARCH_URL);

  const client = new MeiliSearch({
    host: process.env.MEILISEARCH_URL,
    apiKey: process.env.MEILI_MASTER_KEY,
  });
  const keys = await client.getKeys();

  return json({
    user,
    profile,
    MEILISEARCH_URL: process.env.MEILISEARCH_URL,
    MEILISEARCH_KEY: keys.results.filter(
      (x) => x.name === 'Default Search API Key',
    )[0].key,
    search: { userIndex },
  });
}

export default function Index() {
  const { user, profile } = useLoaderData<typeof loader>();
  const [activeProfile, setActiveProfile] = useState<User>(profile);
  const [activeUser, setActiveUser] = useState<User>(user);

  useEffect(() => setActiveUser(user), [user]);
  useEffect(() => setActiveProfile(profile), [profile]);

  return (
    <div className="pt-10 flex space-x-4">
      <div className="w-1/4">
        <Sidebar profile={activeProfile} user={activeUser} />
      </div>
      <div>
        hey {activeProfile.firstName}
        <br />
      </div>
    </div>
  );
}

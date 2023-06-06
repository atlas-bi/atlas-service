import type { User } from '@prisma/client';
import { useEffect, useState } from 'react';
import { FullUserFields, SlimUserFields } from '~/models/user.server';

import { Editor } from './edit';
import { Meta } from './meta';

export function Sidebar({
  profile,
  user,
}: {
  profile: FullUserFields;
  user: SlimUserFields;
}) {
  const [editing, setEditing] = useState(false);
  const [activeUser, setActiveUser] = useState<SlimUserFields>(user);
  const [activeProfile, setActiveProfile] = useState<FullUserFields>(profile);

  useEffect(() => setActiveProfile(profile), [profile]);
  useEffect(() => setActiveUser(user), [user]);

  return (
    <>
      {editing ? (
        <Editor
          profile={activeProfile}
          editingSetter={setEditing}
          userSetter={setActiveProfile}
        />
      ) : (
        <Meta profile={activeProfile} user={activeUser} setter={setEditing} />
      )}
    </>
  );
}

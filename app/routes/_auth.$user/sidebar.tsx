import type { User } from '@prisma/client';
import { useEffect, useState } from 'react';

import { Editor } from './edit';
import { Meta } from './meta';

export function Sidebar({ profile, user }: { profile: User; user: User }) {
  const [editing, setEditing] = useState(false);
  const [activeUser, setActiveUser] = useState<User>(user);
  const [activeProfile, setActiveProfile] = useState<User>(profile);

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

import type { User } from '@prisma/client';
import { Link } from '@remix-run/react';
import { Mail } from 'lucide-react';
import { Dispatch, useEffect, useState } from 'react';
import SlimEditor from '~/components/editor/SlimEditor';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { Button } from '~/components/ui/button';
import { Separator } from '~/components/ui/separator';
import { H1, H3 } from '~/components/ui/typography';
import { FullUserFields, SlimUserFields } from '~/models/user.server';

const initials = (user: User | FullUserFields | SlimUserFields) => {
  return (
    (user.firstName?.slice(0, 1) || 'U') + (user.lastName?.slice(0, 1) || '')
  );
};

export function Meta({
  user,
  profile,
  setter,
}: {
  user: SlimUserFields;
  profile: FullUserFields;
  setter: Dispatch<boolean>;
}) {
  const [activeUser, setActiveUser] = useState<SlimUserFields>(user);
  const [activeProfile, setActiveProfile] = useState<FullUserFields>(profile);

  useEffect(() => setActiveProfile(profile), [profile]);
  useEffect(() => setActiveUser(user), [user]);

  return (
    <div className="space-y-10">
      <div>
        <H1 className="text-slate-600">
          {activeProfile.firstName} {activeProfile.lastName}
        </H1>
        <div className="flex space-x-4 content-center">
          <Avatar className="border outline outline-2 outline-offset-1 outline-blueBase w-10 h-10">
            <AvatarImage
              src={`data:image/*;base64,${activeProfile.profilePhoto}`}
              alt={activeProfile.slug}
            />
            <AvatarFallback>{initials(profile)}</AvatarFallback>
          </Avatar>
          <H3 className="my-auto">@{activeProfile.slug}</H3>
        </div>
      </div>

      <div className="space-y-5 flex flex-col">
        <div className="flex flex-col space-y-4">
          {activeProfile.bio && (
            <SlimEditor value={activeProfile.bio} readonly={true} />
          )}
          {activeUser.id === activeProfile.id && (
            <Button variant="secondary" onMouseUp={() => setter(true)}>
              Edit Profile
            </Button>
          )}
        </div>

        <Separator className="my-5" />
        <Link
          className="flex space-x-2 content-center"
          to={`mailto:${activeProfile.email}`}
        >
          <Mail size={14} className="my-auto" />
          <span>{activeProfile.email}</span>
        </Link>
      </div>
    </div>
  );
}

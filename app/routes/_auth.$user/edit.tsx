import type { User } from '@prisma/client';
import { useSubmit } from '@remix-run/react';
import { type EditorState } from 'lexical';
import { useEffect, useRef, useState } from 'react';
import SlimEditor from '~/components/editor/SlimEditor';
import { Button } from '~/components/ui/button';
import { Label } from '~/components/ui/label';

export function Editor({
  profile,
  editingSetter,
  userSetter,
}: {
  profile: User;
}) {
  const [activeProfile, setActiveProfile] = useState<User>(profile);
  const [editedBio, setEditedBio] = useState<string | null>(activeProfile.bio);
  const submit = useSubmit();

  useEffect(() => setActiveProfile(profile), [profile]);

  const bioEditor = useRef<HTMLDivElement>();
  const bioRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-2">
      <Label className="">Bio</Label>
      <SlimEditor
        ref={bioEditor}
        placeholder="Add a bio"
        value={activeProfile.bio || undefined}
        onChange={(editorState: EditorState) => {
          setEditedBio(JSON.stringify(editorState));
        }}
      />

      <div className="text-sm text-slate-600">
        You can <strong>@mention</strong> other users to link to them.
      </div>

      <Button
        onClick={(event) => {
          let formData = new FormData();
          formData.append('_action', 'updateBio');
          formData.append('bio', editedBio || '');
          formData.append('id', activeProfile.id.toString());
          submit(formData, { replace: true, method: 'post' });
          userSetter({ ...activeProfile, bio: editedBio });
          editingSetter(false);
        }}
      >
        Save
      </Button>
      <Button onClick={() => editingSetter(false)}>Cancel</Button>
    </div>
  );
}

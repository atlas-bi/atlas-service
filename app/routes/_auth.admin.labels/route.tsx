import type { Group, Label, User } from '@prisma/client';
import { type ActionArgs, type LoaderArgs, json } from '@remix-run/node';
import { useLoaderData, useSubmit } from '@remix-run/react';
import { Filter, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { namedAction } from 'remix-utils';
import { EmojiFinder } from '~/components/Emoji';
import { LabelCreator, LabelTag } from '~/components/Labels';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Separator } from '~/components/ui/separator';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';
import {
  createLabel,
  deleteLabel,
  getLabels,
  updateLabel,
} from '~/models/label.server';
import { authenticator } from '~/services/auth.server';
import { requireUser } from '~/services/session.server';

type LabelCount = Label & { _count: { requests: number }; groups: Group[] };

export async function loader({ request, params }: LoaderArgs) {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: `/auth/?returnTo=${encodeURI(
      new URL(request.url).pathname,
    )}`,
  });
  const labels = await getLabels();

  return json({
    labels,
    user,
  });
}

export async function action({ request }: ActionArgs) {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: `/auth/?returnTo=${encodeURI(
      new URL(request.url).pathname,
    )}`,
  });

  return namedAction(request, {
    async create() {
      const formData = await request.formData();
      const { name, description, color, groups } = Object.fromEntries(formData);
      console.log(name, description, color, groups);
      await createLabel({
        userId: user.id,
        name: name as string,
        description: description as string | null,
        color: (color as string) || null,
        groups: JSON.parse((groups || '[]').toString()),
      });
      return null;
    },
    async update() {
      const formData = await request.formData();
      const { id, name, description, color, groups } =
        Object.fromEntries(formData);
      await updateLabel({
        id: Number(id),
        name: name as string,
        description: description as string | null,
        color: (color as string) || null,
        groups: JSON.parse((groups || '[]').toString()),
      });
      return null;
    },
    async delete() {
      const formData = await request.formData();
      const { id } = Object.fromEntries(formData);
      await deleteLabel({ id: Number(id) });
      return null;
    },
  });
}

export default function Index() {
  const { labels } = useLoaderData<typeof loader>();

  const [labelList, setLabelList] = useState(labels);
  const [filter, setFilter] = useState('');
  const [showNewLabelModal, setShowNewLabelModal] = useState(false);
  const [showEditLabelModal, setShowEditLabelModal] = useState(false);
  const [editLabel, setEditLabel] = useState<LabelCount | undefined>(undefined);
  const [emojiBox, setEmojiBox] = useState(null);
  const submitDelete = useSubmit();
  const filterInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLabelList(labels);
  }, [labels]);
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Labels</h3>
        <p className="text-sm text-muted-foreground">Manage request labels.</p>
      </div>
      <Separator />

      <div className="flex justify-between">
        <div className="flex space-x-4">
          <Input
            ref={filterInput}
            className="input semi-disabled pl-7"
            placeholder="filter labels"
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              setLabelList(
                labels.filter(
                  (label: Label) =>
                    label.name
                      .toLowerCase()
                      .indexOf(e.target.value.toLowerCase()) !== -1,
                ),
              );
            }}
            icon={
              <div className="absolute left:1 top-1 bottom-1 text-muted-foreground flex">
                <Filter className="my-auto mx-2" size={16} />
              </div>
            }
          />
          <EmojiFinder
            input={filterInput.current}
            value={filter}
            setter={setFilter}
          />

          {filter && (
            <span
              className="text-sm span cursor-pointer flex my-auto content-center"
              onClick={() => {
                setFilter('');
                setLabelList(labels);
              }}
            >
              <X size={14} className="my-auto" />
              <span>Clear Filter</span>
            </span>
          )}
        </div>

        <Button
          variant="secondary"
          type="button"
          onClick={() => setShowNewLabelModal(true)}
        >
          New label
        </Button>
      </div>
      <Table>
        <TableCaption>A list of current labels.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">
              {labelList.length} labels
            </TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Open Requests</TableHead>
            <TableHead>Visible To</TableHead>
            <TableHead className="text-right">
              <span style={{ visibility: 'hidden' }}>
                <span className="mr-5">Edit</span>Delete
              </span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {labelList &&
            labelList.map((label: LabelCount) => (
              <TableRow key={label.id}>
                <TableCell className="font-medium">
                  <LabelTag label={label} />
                </TableCell>
                <TableCell className="font-medium">
                  {label.description}
                </TableCell>
                <TableCell className="font-medium">
                  {label._count?.requests > 0 &&
                    `${label._count?.requests} open request${
                      label._count?.requests > 1 ? 's' : ''
                    } with this tag`}
                </TableCell>

                <TableCell className="font-medium">
                  {label.groups?.length > 0 ? (
                    <div className="tags">
                      {label.groups.map((group: Group) => (
                        <span key={group.id} className="tag">
                          {group.name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    'all users'
                  )}
                </TableCell>

                <TableCell className="font-medium">
                  <span
                    className="cursor-pointer mr-5 hover:underline"
                    onClick={() => {
                      setEditLabel(label);
                      setShowEditLabelModal(true);
                    }}
                  >
                    Edit
                  </span>

                  <span
                    className="cursor-pointer hover:underline"
                    onClick={() => {
                      const formData = new FormData();
                      formData.append('_action', 'delete');
                      formData.append('id', label.id.toString());
                      submitDelete(formData, {
                        replace: true,
                        method: 'post',
                      });
                    }}
                  >
                    Delete
                  </span>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
      <LabelCreator
        action="create"
        show={showNewLabelModal}
        onClose={() => setShowNewLabelModal(false)}
        name={filter}
      />
      <LabelCreator
        action="update"
        show={showEditLabelModal}
        onClose={() => setShowEditLabelModal(false)}
        label={editLabel}
      />
    </div>
  );
}

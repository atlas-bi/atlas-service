import { faMagnifyingGlass, faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { Group, Label, User } from '@prisma/client';
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
} from '@remix-run/react';
import { MeiliSearch } from 'meilisearch';
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
import { groupIndex } from '~/search.server';
import { authorize, requireUser } from '~/session.server';

type LabelCount = Label & { _count: { requests: number }; groups: Group[] };

export async function loader({ request, params }: LoaderArgs) {
  return authorize(
    request,
    [process.env.ADMIN_GROUP],
    async ({ user, session }: { user: User; session: Session }) => {
      const labels = await getLabels();
      const client = new MeiliSearch({
        host: process.env.MEILISEARCH_URL || '',
        apiKey: process.env.MEILI_MASTER_KEY,
      });
      const keys = await client.getKeys();

      return json({
        labels,
        user,
        MEILISEARCH_URL: process.env.MEILISEARCH_URL,
        MEILISEARCH_KEY: keys.results.filter(
          (x) => x.name === 'Default Search API Key',
        )[0].key,
        search: { groupIndex },
      });
    },
  );
}

export async function action({ request }: ActionArgs) {
  const user = await requireUser(request);

  return namedAction(request, {
    async create() {
      const formData = await request.formData();
      const { name, description, color, groups } = Object.fromEntries(formData);
      await createLabel({
        userId: user.id,
        name: name as string,
        description: description as string | null,
        color: color as string | null,
        groups: JSON.parse(groups.toString() || '[]'),
      });
      return null;
    },
    async update() {
      const formData = await request.formData();
      const { id, name, description, color, groups } =
        Object.fromEntries(formData);
      await updateLabel({
        id: Number(id),
        name,
        description,
        color,
        groups: JSON.parse(groups.toString() || '[]'),
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
  const { labels, MEILISEARCH_URL, MEILISEARCH_KEY, search } =
    useLoaderData<typeof loader>();

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
    <div className="container ">
      <div className="is-flex is-justify-content-space-between pt-5">
        <div className="is-flex">
          <div className="field mb-0">
            <p className="control has-icons-left">
              <input
                ref={filterInput}
                className="input semi-disabled"
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
              />
              <EmojiFinder
                input={filterInput.current}
                value={filter}
                setter={setFilter}
              />
              <span className="icon is-small is-left">
                <FontAwesomeIcon icon={faMagnifyingGlass} />
              </span>
            </p>
          </div>
          {filter && (
            <span
              className="icon-text is-clickable ml-5 my-auto"
              onClick={() => {
                setFilter('');
                setLabelList(labels);
              }}
            >
              <span className="icon">
                <FontAwesomeIcon icon={faXmark} />
              </span>
              <span>Clear Filter</span>
            </span>
          )}
        </div>

        <button
          className="button is-success"
          type="button"
          onClick={() => setShowNewLabelModal(true)}
        >
          New label
        </button>
      </div>
      <div className="has-border-grey-lighter my-5">
        <div className="columns is-flex-grow-1 m-0 has-background-white-ter">
          <div className="column">
            <strong>{labelList.length} labels</strong>
          </div>
          <div className="column">
            <strong>Description</strong>
          </div>
          <div className="column">
            <strong>Open Requests</strong>
          </div>
          <div className="column">
            <strong>Visible To</strong>
          </div>
          <div className="column is-narrow">
            <span style={{ visibility: 'hidden' }}>
              <span className="mr-5">Edit</span>Delete
            </span>
          </div>
        </div>
        <hr className="m-0" />
        {labelList &&
          labelList.map((label: LabelCount) => (
            <div className="list-item" key={label.id}>
              <div className="columns is-flex-grow-1">
                <div className="column">
                  <LabelTag label={label} />
                </div>

                <div className="column">{label.description}</div>

                <div className="column">
                  {label._count?.requests > 0 &&
                    `${label._count?.requests} open request${
                      label._count?.requests > 1 ? 's' : ''
                    } with this tag`}
                </div>
                <div className="column">
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
                </div>

                <div className="column is-narrow">
                  <span
                    className="is-clickable mr-5"
                    onClick={() => {
                      setEditLabel(label);
                      setShowEditLabelModal(true);
                    }}
                  >
                    Edit
                  </span>

                  <span
                    className="is-clickable"
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
                </div>
              </div>
            </div>
          ))}
      </div>
      <LabelCreator
        action="create"
        show={showNewLabelModal}
        onClose={() => setShowNewLabelModal(false)}
        MEILISEARCH_URL={MEILISEARCH_URL}
        MEILISEARCH_KEY={MEILISEARCH_KEY}
        searchIndex={search.groupIndex}
        name={filter}
      />
      <LabelCreator
        action="update"
        show={showEditLabelModal}
        onClose={() => setShowEditLabelModal(false)}
        searchIndex={search.groupIndex}
        label={editLabel}
        MEILISEARCH_URL={MEILISEARCH_URL}
        MEILISEARCH_KEY={MEILISEARCH_KEY}
      />
    </div>
  );
}

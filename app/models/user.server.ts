import type { Group, User } from '@prisma/client';
import { MeiliSearch } from 'meilisearch';
import slugify from 'slugify';
import invariant from 'tiny-invariant';
import { ProfilePhoto } from '~/components/Photo';
import { prisma } from '~/db.server';
// export type { User, Group } from '@prisma/client';
import { loadGroup, loadUser } from '~/search.server';

const userIndex = 'atlas-requests-users';

invariant(process.env.MEILISEARCH_URL, 'MEILISEARCH_URL not found');

const client = new MeiliSearch({
  host: process.env.MEILISEARCH_URL,
  apiKey: process.env.MEILI_MASTER_KEY,
});

export type SlimUserFields = {
  id: number;
  email: string;
  lastName: string | null;
  firstName: string | null;
  slug: string;
};

// used for the auth user
const slimUserFields = {
  id: true,
  email: true,
  lastName: true,
  firstName: true,
  slug: true,
};

export type FullUserFields = SlimUserFields & {
  profilePhoto: string | null;
  bio: string | null;
};
export const fullUserFields = {
  ...slimUserFields,
  profilePhoto: true,
  bio: true,
};

const slugger = (email: string) => {
  return slugify(email.substring(0, email.indexOf('@')).replace('.', '-'), {
    lower: true, // convert to lower case, defaults to `false`
    strict: true,
  });
};

export async function getUserById(id: User['id']) {
  return prisma.user.findUnique({ where: { id }, include: { groups: true } });
}

async function getUserByEmail(email: User['email']) {
  return prisma.user.findUnique({ where: { email }, select: slimUserFields });
}

async function createUser(email: User['email']) {
  const user = await prisma.user.create({
    data: {
      email,
      slug: slugger(email),
    },
    select: slimUserFields,
  });

  await loadUser(user);

  return user;
}

export const updateBio = async ({
  id,
  bio,
}: {
  id: User['id'];
  bio: User['bio'];
}) =>
  prisma.user.update({
    where: { id },
    data: { bio },
  });

async function createGroup(name: Group['name']) {
  const group = await prisma.group.create({
    data: {
      name,
    },
    select: {
      id: true,
      name: true,
    },
  });

  await loadGroup(group);
  return group;
}
async function getGroupByName(name: Group['name']) {
  return prisma.group.findUnique({ where: { name } });
}

export async function getUserBySlug(slug: User['slug']) {
  return prisma.user.findUnique({ where: { slug }, select: fullUserFields });
}

async function getOrCreateGroup(name: Group['name']) {
  const group = await getGroupByName(name);

  if (group) return group;

  return createGroup(name);
}

async function getOrCreateUser(email: User['email']) {
  const user = await getUserByEmail(email);
  if (user) return user;

  return createUser(email);
}

export async function updateUserProps(
  email: User['email'],
  firstName: User['firstName'],
  lastName: User['lastName'],
  groups: Group['name'][],
  profilePhoto: User['profilePhoto'],
): Promise<SlimUserFields> {
  await getOrCreateUser(email);

  const groupModels = groups
    ? await Promise.all(groups?.map(async (group) => getOrCreateGroup(group)))
    : undefined;

  const user = await prisma.user.update({
    where: { email },
    data: {
      firstName,
      lastName,
      profilePhoto,
      groups: {
        set: groupModels
          ? groupModels.map((group: { id: number }) => ({
              id: Number(group.id),
            }))
          : [],
      },
      slug: slugger(email),
    },
    select: slimUserFields,
  });
  await client
    .index(userIndex)
    .addDocuments([user])
    .then((res) => console.log(res));
  return user;
}

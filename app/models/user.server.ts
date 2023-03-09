import type { Group, User } from '@prisma/client';
import { MeiliSearch } from 'meilisearch';
import { prisma } from '~/db.server';
// export type { User, Group } from '@prisma/client';
import { loadGroup, loadUser } from '~/search.server';

const userIndex = 'atlas-requests-users';

const client = new MeiliSearch({ host: process.env.MEILISEARCH_URL });
export async function getUserById(id: User['id']) {
  return prisma.user.findUnique({ where: { id }, include: { groups: true } });
}

async function getUserByEmail(email: User['email']) {
  return prisma.user.findUnique({ where: { email } });
}

async function createUser(email: User['email']) {
  const user = await prisma.user.create({
    data: {
      email,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      profilePhoto: true,
    },
  });

  await loadUser(user);

  return user;
}

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
) {
  await getOrCreateUser(email);

  const groupModels = await Promise.all(
    groups.map(async (group) => getOrCreateGroup(group)),
  );

  const existingGroups = await prisma.user.findUnique({
    where: { email },
    select: { groups: { select: { id: true } } },
  });

  const newGroupIds = groupModels.map((group: Group) => Number(group.id));
  const removedGroups = existingGroups?.groups
    .filter((group) => !newGroupIds.includes(group.id))
    ?.map(({ id }) => ({ id }));

  const user = await prisma.user.update({
    where: { email },
    data: {
      firstName,
      lastName,
      profilePhoto,
      groups: {
        connect: groupModels.map((group: Group) => ({
          id: Number(group.id),
        })),
        disconnect: removedGroups,
      },
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      profilePhoto: true,
    },
  });
  await client
    .index(userIndex)
    .addDocuments([user])
    .then((res) => console.log(res));
  return user;
}

import type { Group, User } from '@prisma/client';
import { prisma } from '~/db.server';

export type { User, Group } from '@prisma/client';

export async function getUserById(id: User['id']) {
  return prisma.user.findUnique({ where: { id }, include: { groups: true } });
}

async function getUserByEmail(email: User['email']) {
  return prisma.user.findUnique({ where: { email } });
}

async function createUser(email: User['email']) {
  return prisma.user.create({
    data: {
      email,
    },
  });
}

async function createGroup(name: Group['name']) {
  return prisma.group.create({
    data: {
      name,
    },
  });
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
) {
  // create group if not existing
  // let groupDetails = []
  // let x = await groups.forEach(async (group) => groupDetails.push(await getOrCreateGroup(group)))
  // // console.log('x', groupDetails)
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
    .map(({ id }) => ({ id }));

  return prisma.user.update({
    where: { email },
    data: {
      firstName,
      lastName,
      groups: {
        connect: groupModels.map((group: Group) => ({
          id: Number(group.id),
        })),
        disconnect: removedGroups,
      },
    },
  });

  // console.log(email, firstName, lastName);
  // console.log(groups);
}

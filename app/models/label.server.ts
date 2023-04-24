import type { Label, User } from '@prisma/client';
import { prisma } from '~/db.server';
import { loadLabel } from '~/search.server';

export const getLabels = async () => {
  return prisma.label.findMany({
    select: {
      id: true,
      name: true,
      color: true,
      description: true,
      groups: {
        select: {
          id: true,
          name: true,
        },
      },

      _count: {
        select: { requests: true },
      },
    },
    orderBy: {
      id: 'asc',
    },
  });
};

export const createLabel = async ({
  name,
  description,
  color,
  userId,
  groups,
}: Pick<Label, 'name' | 'description' | 'color' | 'groups'> & {
  userId: User['id'];
}) => {
  const label = await prisma.label.create({
    data: {
      name,
      description,
      color,
      creator: {
        connect: {
          id: userId,
        },
      },
      groups: {
        connect: groups.map((x) => {
          return { id: Number(x) };
        }),
      },
    },
    select: {
      id: true,
      name: true,
      color: true,
      description: true,
    },
  });

  await loadLabel(label);
  return label;
};

export const deleteLabel = async ({ id }: Pick<Label, 'id'>) =>
  prisma.label.delete({
    where: { id },
  });

export const updateLabel = async ({ id, name, description, color, groups }) =>
  prisma.label.update({
    where: { id },
    data: {
      name,
      description,
      color,
      groups: {
        set: groups.map((x) => {
          return { id: Number(x) };
        }),
      },
    },
  });

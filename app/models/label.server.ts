import type { Label, User } from '@prisma/client';
import { prisma } from '~/db.server';
import { loadLabel } from '~/search.server';

export type { Label } from '@prisma/client';

export const createLabel = async ({
  name,
  description,
  color,
  userId,
}: Pick<Label, 'name'> & {
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

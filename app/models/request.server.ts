import type { Request, User } from '@prisma/client';
import { prisma } from '~/db.server';
import smtpQueue from '~/queues/smtp.server';

export type { Request } from '@prisma/client';

export function getRequest({
  id,
  userId,
}: Pick<Request, 'id'> & {
  userId: User['id'];
}) {
  return prisma.request.findFirst({
    select: { id: true, name: true },
    where: { creatorId: userId },
  });
}

export function getRequestListItems({ userId }: { userId: User['id'] }) {
  return prisma.request.findMany({
    where: { requesterId: userId },
    select: { id: true, name: true },
    orderBy: { updatedAt: 'desc' },
  });
}

export async function createRequest({
  name,
  userId,
}: Pick<Request, 'name'> & {
  userId: User['id'];
}) {
  const defaultCategory = await prisma.requestCategory.findFirst({
    where: { isDefault: true },
    select: { id: true },
  });
  const request = await prisma.request.create({
    data: {
      name,
      creator: {
        connect: {
          id: userId,
        },
      },
      requester: {
        connect: {
          id: userId,
        },
      },
      category: {
        connect: {
          id: defaultCategory?.id,
        },
      },
      type: {
        connect: {
          id: 2,
        },
      },
    },
  });

  await smtpQueue.enqueue(null); //"me","message");
  return request;
}

export function deleteRequest({
  id,
  userId,
}: Pick<Request, 'id'> & { userId: User['id'] }) {
  // should authenticate as admin. only admins should have delete button.
  return prisma.request.deleteMany({
    where: { id },
  });
}

import type { Request, User } from '@prisma/client';
import { prisma } from '~/db.server';
import smtpQueue from '~/queues/smtp.server';

export type { Request } from '@prisma/client';

export function getRequest({ id }: Pick<Request, 'id'>) {
  return prisma.request.findUnique({
    select: {
      id: true,
      name: true,

      purpose: true,
      schedule: true,
      parameters: true,
      criteria: true,
      description: true,
      exportToExcel: true,
      supportsInitiative: true,
      regulatory: true,
    },
    where: { id: id },
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
  purpose,
  schedule,
  parameters,
  criteria,
  description,
  type,
  excel,
  initiative,
  regulatory,
}: Pick<
  Request,
  | 'name'
  | 'purpose'
  | 'schedule'
  | 'parameters'
  | 'criteria'
  | 'description'
  | 'regulatory'
> & {
  userId: User['id'];
  type: string;
  excel: Request['exportToExcel'];
  initiative: Request['supportsInitiative'];
}) {
  console.log(type);
  const defaultCategory = await prisma.requestCategory.findFirst({
    where: { isDefault: true },
    select: { id: true },
  });
  const request = await prisma.request.create({
    data: {
      name,
      purpose,
      schedule,
      parameters,
      criteria,
      description,
      exportToExcel: excel,
      supportsInitiative: initiative,
      regulatory,
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
          id: type ? Number(type) : undefined,
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

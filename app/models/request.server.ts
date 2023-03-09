import type { Request, User } from '@prisma/client';
import { prisma } from '~/db.server';
import smtpQueue from '~/queues/smtp.server';
import { loadReport } from '~/search.server';

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
      requester: {
        select: {
          firstName: true,
          lastName: true,
          id: true,
          email: true,
          profilePhoto: true,
        },
      },
      recipients: {
        select: {
          firstName: true,
          lastName: true,
          id: true,
          email: true,
          profilePhoto: true,
        },
      },
      labels: {
        select: {
          id: true,
          color: true,
          name: true,
          description: true,
        },
      },
    },
    where: { id: id },
  });
}

export const editRequester = async ({
  userId,
  requestedFor,
  id,
}: Pick<Request, 'requestedFor'> & { userId: User['id'] }) => {
  console.log(userId, requestedFor);

  await prisma.request.update({
    where: { id },
    data: {
      requester: {
        connect: {
          id: requestedFor,
        },
      },
    },
  });
  return;
};

export const editLabels = async ({
  userId,
  labels,
  id,
}: Pick<Request, 'labels'> & { userId: User['id'] }) => {
  console.log(userId, labels);

  await prisma.request.update({
    where: { id },
    data: {
      labels: {
        set: labels.map((x) => ({ id: Number(x) })),
      },
    },
  });
  return;
};

export const editRecipients = async ({
  userId,
  recipients,
  id,
}: Pick<Request, 'recipients'> & { userId: User['id'] }) => {
  await prisma.request.update({
    where: { id },
    data: {
      recipients: {
        set: recipients.map((x) => ({ id: Number(x) })),
      },
    },
  });
  return;
};

export function getRequests({ userId }: { userId: User['id'] }) {
  return prisma.request.findMany({
    where: { OR: [{ requesterId: userId }, { creatorId: userId }] },
    select: {
      id: true,
      name: true,
      requester: {
        select: {
          firstName: true,
          lastName: true,
          id: true,
          email: true,
          profilePhoto: true,
        },
      },
      descriptionText: true,
      labels: {
        select: {
          id: true,
          color: true,
          name: true,
          description: true,
        },
      },
    },
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
  purposeText,
  scheduleText,
  parametersText,
  criteriaText,
  descriptionText,
  type,
  excel,
  initiative,
  regulatory,
  requestedFor,
  recipients,
  labels,
}: Pick<
  Request,
  | 'name'
  | 'purpose'
  | 'schedule'
  | 'parameters'
  | 'criteria'
  | 'description'
  | 'regulatory'
  | 'requestedFor'
  | 'purposeText'
  | 'scheduleText'
  | 'parametersText'
  | 'criteriaText'
  | 'descriptionText'
> & {
  userId: User['id'];
  type: string;
  excel: Request['exportToExcel'];
  initiative: Request['supportsInitiative'];
  recipients: Request['recipients'][];
  labels: Request['labels'][];
}) {
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
      purposeText,
      scheduleText,
      parametersText,
      criteriaText,
      descriptionText,
      creator: {
        connect: {
          id: userId,
        },
      },
      requester: {
        connect: {
          id: requestedFor || userId,
        },
      },
      recipients: recipients
        ? {
            connect: recipients.map((x) => ({ id: Number(x) })),
          }
        : undefined,

      labels: labels
        ? {
            connect: labels.map((x) => ({ id: Number(x) })),
          }
        : undefined,

      category: defaultCategory?.id
        ? {
            connect: {
              id: defaultCategory.id,
            },
          }
        : undefined,
      type: type
        ? {
            connect: {
              id: Number(type),
            },
          }
        : undefined,
    },
  });

  await smtpQueue.enqueue(null); //"me","message");

  // send to search
  await loadReport(request);
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

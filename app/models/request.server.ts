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
      createdAt: true,
      purpose: true,
      schedule: true,
      parameters: true,
      criteria: true,
      description: true,
      exportToExcel: true,
      supportsInitiative: true,
      regulatory: true,
      creator: {
        select: {
          firstName: true,
          lastName: true,
          id: true,
          email: true,
          profilePhoto: true,
        },
      },
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
      assignees: {
        select: {
          firstName: true,
          lastName: true,
          id: true,
          email: true,
          profilePhoto: true,
        },
      },
      watchers: {
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
      comments: {
        select: {
          id: true,
          comment: true,
          createdAt: true,
          updatedAt: true,
          creator: {
            select: {
              firstName: true,
              lastName: true,
              id: true,
              email: true,
              profilePhoto: true,
            },
          },
        },
      },
      labelHistory: {
        select: {
          id: true,
          label: {
            select: {
              id: true,
              color: true,
              name: true,
              description: true,
            },
          },
          creator: {
            select: {
              firstName: true,
              lastName: true,
              id: true,
              email: true,
              profilePhoto: true,
            },
          },
          createdAt: true,
          added: true,
        },
      },
      assigneeHistory: {
        select: {
          id: true,
          assignee: {
            select: {
              firstName: true,
              lastName: true,
              id: true,
              email: true,
              profilePhoto: true,
            },
          },
          creator: {
            select: {
              firstName: true,
              lastName: true,
              id: true,
              email: true,
              profilePhoto: true,
            },
          },
          createdAt: true,
          added: true,
        },
      },
      recipientHistory: {
        select: {
          id: true,
          recipient: {
            select: {
              firstName: true,
              lastName: true,
              id: true,
              email: true,
              profilePhoto: true,
            },
          },
          creator: {
            select: {
              firstName: true,
              lastName: true,
              id: true,
              email: true,
              profilePhoto: true,
            },
          },
          createdAt: true,
          added: true,
        },
      },
      requesterHistory: {
        select: {
          id: true,
          requester: {
            select: {
              firstName: true,
              lastName: true,
              id: true,
              email: true,
              profilePhoto: true,
            },
          },
          creator: {
            select: {
              firstName: true,
              lastName: true,
              id: true,
              email: true,
              profilePhoto: true,
            },
          },
          createdAt: true,
          added: true,
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
  const currentRequester = await prisma.request.findUnique({
    where: { id },
    select: {
      requester: {
        select: {
          id: true,
        },
      },
    },
  });

  if (Number(requestedFor) !== currentRequester.requester.id) {
    await prisma.requestRequesterHistory.create({
      data: {
        requestId: id,
        requesterId: Number(requestedFor),
        creatorId: userId,
        added: true,
      },
    });
  }

  return prisma.request.update({
    where: { id },
    data: {
      requester: {
        connect: {
          id: requestedFor,
        },
      },
    },
  });
};

export const editLabels = async ({
  userId,
  labels,
  id,
}: Pick<Request, 'labels'> & { userId: User['id'] }) => {
  const currentLabels = await prisma.label.findMany({
    where: {
      requests: {
        some: { id },
      },
    },
    select: {
      id: true,
    },
  });

  // added labels
  labels
    .filter((x) => !currentLabels.map(({ id }) => id).includes(Number(x)))
    .map(async (labelId) =>
      prisma.requestLabelHistory.create({
        data: {
          requestId: id,
          labelId: Number(labelId),
          creatorId: userId,
          added: true,
        },
      }),
    );

  // removed labels
  currentLabels
    .filter(({ id }) => !labels.includes(id.toString()))
    .map(async (label) =>
      prisma.requestLabelHistory.create({
        data: {
          requestId: id,
          labelId: label.id,
          creatorId: userId,
          added: false,
        },
      }),
    );

  return prisma.request.update({
    where: { id },
    data: {
      labels: {
        set: labels.map((x) => ({ id: Number(x) })),
      },
    },
  });
};

export const editRecipients = async ({
  userId,
  recipients,
  id,
}: Pick<Request, 'recipients'> & { userId: User['id'] }) => {
  const currentRecipients = await prisma.user.findMany({
    where: {
      recievingReports: {
        some: { id },
      },
    },
    select: {
      id: true,
    },
  });

  // added recipient
  recipients
    .filter((x) => !currentRecipients.map(({ id }) => id).includes(Number(x)))
    .map(async (recipientId) =>
      prisma.requestRecipientHistory.create({
        data: {
          requestId: id,
          recipientId: Number(recipientId),
          creatorId: userId,
          added: true,
        },
      }),
    );

  // removed recipient
  currentRecipients
    .filter(({ id }) => !recipients.includes(id.toString()))
    .map(async (recipient) =>
      prisma.requestRecipientHistory.create({
        data: {
          requestId: id,
          recipientId: recipient.id,
          creatorId: userId,
          added: false,
        },
      }),
    );

  return prisma.request.update({
    where: { id },
    data: {
      recipients: {
        set: recipients.map((x) => ({ id: Number(x) })),
      },
    },
  });
};

export const editWatch = async ({
  watch,
  userId,
  id,
}: Pick<Request, 'assignees'> & { userId: User['id']; watch: boolean }) => {
  if (watch) {
    return prisma.request.update({
      where: { id },
      data: {
        watchers: {
          connect: [{ id: userId }],
        },
      },
    });
  }
  return prisma.request.update({
    where: { id },
    data: {
      watchers: {
        disconnect: [{ id: userId }],
      },
    },
  });
};
export const editAssignees = async ({
  userId,
  assignees,
  id,
}: Pick<Request, 'assignees'> & { userId: User['id'] }) => {
  const currentAssignees = await prisma.user.findMany({
    where: {
      myAssignedRequests: {
        some: { id },
      },
    },
    select: {
      id: true,
    },
  });

  // added assignee
  assignees
    .filter((x) => !currentAssignees.map(({ id }) => id).includes(Number(x)))
    .map(async (assigneeId) =>
      prisma.requestAssigneeHistory.create({
        data: {
          requestId: id,
          assigneeId: Number(assigneeId),
          creatorId: userId,
          added: true,
        },
      }),
    );

  // removed assignee
  currentAssignees
    .filter(({ id }) => !assignees.includes(id.toString()))
    .map(async (assignee) =>
      prisma.requestAssigneeHistory.create({
        data: {
          requestId: id,
          assigneeId: assignee.id,
          creatorId: userId,
          added: false,
        },
      }),
    );

  return prisma.request.update({
    where: { id },
    data: {
      assignees: {
        set: assignees.map((x) => ({ id: Number(x) })),
      },
    },
  });
};

export function getRequests({
  userId,
  assigneeId,
  watcherId,
}: {
  userId?: User['id'];
  assigneeId?: User['id'];
  watcherId?: User['id'];
}) {
  return prisma.request.findMany({
    where: userId
      ? { OR: [{ requesterId: userId }, { creatorId: userId }] }
      : assigneeId
      ? { assignees: { some: { id: assigneeId } } }
      : { watchers: { some: { id: watcherId } } },
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
  assignees,
  labels,
  watchers,
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
  watchers: Request['watchers'][];
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

      assignees: assignees
        ? {
            connect: assignees.map((x) => ({ id: Number(x) })),
          }
        : undefined,

      watchers: watchers
        ? {
            connect: watchers.map((x) => ({ id: Number(x) })),
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

export function addComment({
  requestId,
  comment,
  userId,
}: Pick<RequestComments, 'requestId' | 'comment'> & { userId: User['id'] }) {
  return prisma.requestComments.create({
    data: {
      requestId,
      comment,
      creatorId: userId,
    },
  });
}

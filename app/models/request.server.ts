import type { Request, User } from '@prisma/client';
import { prisma } from '~/db.server';
import { getUserById } from '~/models/user.server';
import AssignedRequestEmail from '~/queues/email/request_assigned.server';
import CommentRequestEmail from '~/queues/email/request_comment.server';
import CommentMentionEmail from '~/queues/email/request_mention.server';
import NewRequestEmail from '~/queues/email/request_new.server';
import ChangedRequesterEmail from '~/queues/email/request_requester.server';
import { loadReport } from '~/search.server';

export type { Request } from '@prisma/client';

const defaultReportFields = {
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
  updater: {
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
};

export function getRequest({ id }: Pick<Request, 'id'>) {
  return prisma.request.findUnique({
    select: defaultReportFields,
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

  const request = await prisma.request.update({
    where: { id },
    data: {
      requester: {
        connect: {
          id: requestedFor,
        },
      },
      updater: {
        connect: {
          id: userId,
        },
      },
    },
    select: defaultReportFields,
  });

  console.log(request);

  if (request.updater.id !== request.requester.id) {
    await ChangedRequesterEmail.enqueue(
      { request },
      {
        id: `change-request-requester-${id.toString()}-${Number(requestedFor)}`,
      },
    );
  }
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
      updater: {
        connect: {
          id: userId,
        },
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
      updater: {
        connect: {
          id: userId,
        },
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
    .map(async (assigneeId) => {
      await prisma.requestAssigneeHistory.create({
        data: {
          requestId: id,
          assigneeId: Number(assigneeId),
          creatorId: userId,
          added: true,
        },
      });
      return AssignedRequestEmail.enqueue(
        {
          request: await getRequest({ id }),
          user: await getUserById(Number(assigneeId)),
        },
        { id: `assigned-request-${id.toString()}-${assigneeId}` },
      );
    });

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
      updater: {
        connect: {
          id: userId,
        },
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
    select: {
      name: true,
      id: true,
      creator: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          profilePhoto: true,
          email: true,
        },
      },
      requester: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          profilePhoto: true,
          email: true,
        },
      },
      assignees: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          profilePhoto: true,
          email: true,
        },
      },
    },
    select: defaultReportFields,
  });

  if (request.creator.id !== request.requester.id) {
    await NewRequestEmail.enqueue(
      { request },
      { id: `new-request-${request.id.toString()}` },
    );
  }

  request.assignees
    .filter((x) => request.creator.id !== x.id)
    .map(async (user) => {
      await AssignedRequestEmail.enqueue(
        { request, user },
        {
          id: `assigned-request-${request.id.toString()}-${user.id.toString()}`,
        },
      );
    });

  [purpose, schedule, parameters, criteria, description]
    .filter((x) => x !== null)
    .map((comment) =>
      // notify mentions
      allNodes(JSON.parse(comment)?.root?.children, 'type', 'mention').forEach(
        async (mention) =>
          CommentMentionEmail.enqueue(
            {
              request,
              user: request.creator,
              mention: await getUserById(mention.userId),
            },
            {
              id: `comment-request-mention-${request.id.toString()}-${userId.toString()}-${mention.userId.toString()}`,
            },
          ),
      ),
    );

  // send to search
  await loadReport(request);
  return request;
}

export async function deleteRequest({
  id,
  userId,
}: Pick<Request, 'id'> & { userId: User['id'] }) {
  // should authenticate as admin. only admins should have delete button.
  // remove comments

  await prisma.requestComments.deleteMany({
    where: { requestId: id },
  });

  return prisma.request.deleteMany({
    where: { id },
  });
}

function allNodes(obj, key, value, array) {
  array = array || [];
  if ('object' === typeof obj) {
    for (let k in obj) {
      if (k === key && obj[k] === value) {
        array.push(obj);
      } else {
        allNodes(obj[k], key, value, array);
      }
    }
  }
  return array;
}

export async function addComment({
  requestId,
  comment,
  userId,
}: Pick<RequestComments, 'requestId' | 'comment'> & { userId: User['id'] }) {
  const newComment = await prisma.requestComments.create({
    data: {
      requestId,
      comment,
      creatorId: userId,
    },
  });

  const request = await getRequest({ id: requestId });
  const user = await getUserById(userId);
  // notify mentions
  allNodes(JSON.parse(comment).root?.children, 'type', 'mention').forEach(
    async (mention) =>
      CommentMentionEmail.enqueue(
        {
          request,
          user,
          mention: await getUserById(mention.userId),
        },
        {
          id: `comment-request-mention-${requestId.toString()}-${userId.toString()}-${newComment.id.toString()}-${
            mention.userId
          }`,
        },
      ),
  );

  // notify requester
  await CommentRequestEmail.enqueue(
    {
      request,
      user,
    },
    {
      id: `comment-request-${requestId.toString()}-${userId.toString()}-${newComment.id.toString()}`,
    },
  );
}

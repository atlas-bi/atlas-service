import type { RequestCategory, RequestType, User } from '@prisma/client';
import { prisma } from '~/db.server';

export type { Note, RequestType } from '@prisma/client';

const defaultRequestTypeFields = {
  id: true,
  name: true,
  menuText: true,
  description: true,
  createdAt: true,
  updatedAt: true,
  showRequester: true,
  requesterGroups: { select: { id: true, name: true } },
  requesterTitle: true,
  showLabels: true,
  labelsTitle: true,
  labelsGroups: { select: { id: true, name: true } },

  showTextFieldOne: true,
  requireTextFieldOne: true,
  textFieldOneTitle: true,
  textFieldOneGroups: { select: { id: true, name: true } },

  showTextFieldTwo: true,
  requireTextFieldTwo: true,
  textFieldTwoTitle: true,
  textFieldTwoGroups: { select: { id: true, name: true } },

  showTextFieldThree: true,
  requireTextFieldThree: true,
  textFieldThreeTitle: true,
  textFieldThreeGroups: { select: { id: true, name: true } },

  showTextFieldFour: true,
  requireTextFieldFour: true,
  textFieldFourTitle: true,
  textFieldFourGroups: { select: { id: true, name: true } },

  showTextFieldFive: true,
  requireTextFieldFive: true,
  textFieldFiveTitle: true,
  textFieldFiveGroups: { select: { id: true, name: true } },

  showBooleanFieldOne: true,
  booleanFieldOneTitle: true,
  booleanFieldOneGroups: { select: { id: true, name: true } },

  showBooleanFieldTwo: true,
  booleanFieldTwoTitle: true,
  booleanFieldTwoGroups: { select: { id: true, name: true } },

  showBooleanFieldThree: true,
  booleanFieldThreeTitle: true,
  booleanFieldThreeGroups: { select: { id: true, name: true } },

  showUserFieldOne: true,
  requireUserFieldOne: true,
  userFieldOneTitle: true,
  userFieldOneGroups: { select: { id: true, name: true } },

  showUserFieldTwo: true,
  requireUserFieldTwo: true,
  userFieldTwoTitle: true,
  userFieldTwoGroups: { select: { id: true, name: true } },

  showUserFieldThree: true,
  requireUserFieldThree: true,
  userFieldThreeTitle: true,
  userFieldThreeGroups: { select: { id: true, name: true } },
};

export async function getRequestTypes() {
  return prisma.requestType.findMany({
    select: defaultRequestTypeFields,
    orderBy: {
      id: 'asc',
    },
  });
}

export async function getRequestType({ id }) {
  return prisma.requestType.findUnique({
    where: { id },
    select: defaultRequestTypeFields,
  });
}

export async function getRequestTypesLite() {
  return prisma.requestType.findMany({
    select: { id: true, name: true, menuText: true },
  });
}
export async function getRequestCategories() {
  return prisma.requestCategory.findMany({
    select: { id: true, name: true, isDefault: true },
  });
}

export async function createRequestType(
  props: Pick<RequestType, 'name'> & {
    userId: User['id'];
  },
) {
  const userId = props.userId;
  delete props.userId;
  return prisma.requestType.create({
    data: {
      ...props,
      creator: {
        connect: {
          id: userId,
        },
      },
    },
  });
}

export async function editRequestType(props) {
  await prisma.requestType.update({
    where: {
      id: props.id,
    },
    data: {
      ...props,
    },
  });
}

export async function createRequestCategory({
  name,
  userId,
}: Pick<RequestCategory, 'name'> & {
  userId: User['id'];
}) {
  return prisma.requestCategory.create({
    data: {
      name,
      creator: {
        connect: {
          id: userId,
        },
      },
    },
  });
}

export async function setRequestCategoryDefault({
  id,
}: Pick<RequestCategory, 'id'>) {
  await prisma.requestCategory.updateMany({
    data: {
      isDefault: false,
    },
  });

  return prisma.requestCategory.update({
    where: {
      id,
    },
    data: {
      isDefault: true,
    },
  });
}

export async function deleteRequestType({ id }: Pick<RequestType, 'id'>) {
  return prisma.requestType.delete({
    where: { id },
  });
}

export async function deleteRequestCategory({
  id,
}: Pick<RequestCategory, 'id'>) {
  return prisma.requestCategory.delete({
    where: { id },
  });
}

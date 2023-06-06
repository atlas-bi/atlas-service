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

export type requestTypeLite = {
  id: number;
  name: string;
  menuText: string;
};

export const getRequestTypesLite = async (): Promise<requestTypeLite[]> =>
  prisma.requestType.findMany({
    select: { id: true, name: true, menuText: true },
  });

export async function getRequestCategories() {
  return prisma.requestCategory.findMany({
    select: { id: true, name: true, isDefault: true },
  });
}

export async function createRequestType(
  props: Pick<
    RequestType,
    | 'name'
    | 'id'
    | 'description'
    | 'menuText'
    | 'showRequester'
    | 'showLabels'
    | 'showTextFieldOne'
    | 'showTextFieldTwo'
    | 'showTextFieldThree'
    | 'showTextFieldFour'
    | 'showTextFieldFive'
    | 'showBooleanFieldOne'
    | 'showBooleanFieldTwo'
    | 'showBooleanFieldThree'
    | 'showUserFieldOne'
    | 'showUserFieldTwo'
    | 'showUserFieldThree'
    | 'requireTextFieldOne'
    | 'requireTextFieldTwo'
    | 'requireTextFieldThree'
    | 'requireTextFieldFour'
    | 'requireTextFieldFive'
    | 'requireUserFieldOne'
    | 'requireUserFieldTwo'
    | 'requireUserFieldThree'
    | 'textFieldOneTitle'
    | 'textFieldTwoTitle'
    | 'textFieldThreeTitle'
    | 'textFieldFourTitle'
    | 'textFieldFiveTitle'
    | 'booleanFieldOneTitle'
    | 'booleanFieldTwoTitle'
    | 'booleanFieldThreeTitle'
    | 'userFieldOneTitle'
    | 'userFieldTwoTitle'
    | 'userFieldThreeTitle'
    | 'labelsTitle'
    | 'requesterTitle'
  > & {
    userId: User['id'];
    textFieldOneGroups: string[];
    textFieldTwoGroups: string[];
    textFieldThreeGroups: string[];
    textFieldFourGroups: string[];
    textFieldFiveGroups: string[];
    booleanFieldOneGroups: string[];
    booleanFieldTwoGroups: string[];
    booleanFieldThreeGroups: string[];
    userFieldOneGroups: string[];
    userFieldTwoGroups: string[];
    userFieldThreeGroups: string[];
    labelsGroups: string[];
    requesterGroups: string[];
  },
) {
  const {
    id,
    name,
    description,
    menuText,
    textFieldOneGroups,
    textFieldTwoGroups,
    textFieldThreeGroups,
    textFieldFourGroups,
    textFieldFiveGroups,
    booleanFieldOneGroups,
    booleanFieldTwoGroups,
    booleanFieldThreeGroups,
    userFieldOneGroups,
    userFieldTwoGroups,
    userFieldThreeGroups,
    labelsGroups,
    requesterGroups,
    showRequester,
    showLabels,
    showTextFieldOne,
    showTextFieldTwo,
    showTextFieldThree,
    showTextFieldFour,
    showTextFieldFive,
    showBooleanFieldOne,
    showBooleanFieldTwo,
    showBooleanFieldThree,
    showUserFieldOne,
    showUserFieldTwo,
    showUserFieldThree,
    requireTextFieldOne,
    requireTextFieldTwo,
    requireTextFieldThree,
    requireTextFieldFour,
    requireTextFieldFive,
    requireUserFieldOne,
    requireUserFieldTwo,
    requireUserFieldThree,
    textFieldOneTitle,
    textFieldTwoTitle,
    textFieldThreeTitle,
    textFieldFourTitle,
    textFieldFiveTitle,
    booleanFieldOneTitle,
    booleanFieldTwoTitle,
    booleanFieldThreeTitle,
    userFieldOneTitle,
    userFieldTwoTitle,
    userFieldThreeTitle,
    labelsTitle,
    requesterTitle,
    userId,
  } = props;
  return prisma.requestType.create({
    data: {
      name,
      description,
      menuText,
      textFieldOneGroups: textFieldOneGroups
        ? {
            connect: textFieldOneGroups.map((x: string) => ({ id: Number(x) })),
          }
        : undefined,
      textFieldTwoGroups: textFieldTwoGroups
        ? {
            connect: textFieldTwoGroups.map((x: string) => ({ id: Number(x) })),
          }
        : undefined,
      textFieldThreeGroups: textFieldThreeGroups
        ? {
            connect: textFieldThreeGroups.map((x: string) => ({
              id: Number(x),
            })),
          }
        : undefined,
      textFieldFourGroups: textFieldFourGroups
        ? {
            connect: textFieldFourGroups.map((x: string) => ({
              id: Number(x),
            })),
          }
        : undefined,
      textFieldFiveGroups: textFieldFiveGroups
        ? {
            connect: textFieldFiveGroups.map((x: string) => ({
              id: Number(x),
            })),
          }
        : undefined,
      booleanFieldOneGroups: booleanFieldOneGroups
        ? {
            connect: booleanFieldOneGroups.map((x: string) => ({
              id: Number(x),
            })),
          }
        : undefined,
      booleanFieldTwoGroups: booleanFieldTwoGroups
        ? {
            connect: booleanFieldTwoGroups.map((x: string) => ({
              id: Number(x),
            })),
          }
        : undefined,
      booleanFieldThreeGroups: booleanFieldThreeGroups
        ? {
            connect: booleanFieldThreeGroups.map((x: string) => ({
              id: Number(x),
            })),
          }
        : undefined,
      userFieldOneGroups: userFieldOneGroups
        ? {
            connect: userFieldOneGroups.map((x: string) => ({ id: Number(x) })),
          }
        : undefined,
      userFieldTwoGroups: userFieldTwoGroups
        ? {
            connect: userFieldTwoGroups.map((x: string) => ({ id: Number(x) })),
          }
        : undefined,
      userFieldThreeGroups: userFieldThreeGroups
        ? {
            connect: userFieldThreeGroups.map((x: string) => ({
              id: Number(x),
            })),
          }
        : undefined,
      labelsGroups: labelsGroups
        ? {
            connect: labelsGroups.map((x: string) => ({ id: Number(x) })),
          }
        : undefined,
      requesterGroups: requesterGroups
        ? {
            connect: requesterGroups.map((x: string) => ({ id: Number(x) })),
          }
        : undefined,
      showRequester,
      showLabels,
      showTextFieldOne,
      showTextFieldTwo,
      showTextFieldThree,
      showTextFieldFour,
      showTextFieldFive,
      showBooleanFieldOne,
      showBooleanFieldTwo,
      showBooleanFieldThree,
      showUserFieldOne,
      showUserFieldTwo,
      showUserFieldThree,
      requireTextFieldOne,
      requireTextFieldTwo,
      requireTextFieldThree,
      requireTextFieldFour,
      requireTextFieldFive,
      requireUserFieldOne,
      requireUserFieldTwo,
      requireUserFieldThree,
      textFieldOneTitle,
      textFieldTwoTitle,
      textFieldThreeTitle,
      textFieldFourTitle,
      textFieldFiveTitle,
      booleanFieldOneTitle,
      booleanFieldTwoTitle,
      booleanFieldThreeTitle,
      userFieldOneTitle,
      userFieldTwoTitle,
      userFieldThreeTitle,
      labelsTitle,
      requesterTitle,
      creator: {
        connect: {
          id: userId,
        },
      },
    },
  });
}

export async function editRequestType(props) {
  console.log(props);
  const {
    id,
    name,
    description,
    menuText,
    textFieldOneGroups,
    textFieldTwoGroups,
    textFieldThreeGroups,
    textFieldFourGroups,
    textFieldFiveGroups,
    booleanFieldOneGroups,
    booleanFieldTwoGroups,
    booleanFieldThreeGroups,
    userFieldOneGroups,
    userFieldTwoGroups,
    userFieldThreeGroups,
    labelsGroups,
    requesterGroups,
    showRequester,
    showLabels,
    showTextFieldOne,
    showTextFieldTwo,
    showTextFieldThree,
    showTextFieldFour,
    showTextFieldFive,
    showBooleanFieldOne,
    showBooleanFieldTwo,
    showBooleanFieldThree,
    showUserFieldOne,
    showUserFieldTwo,
    showUserFieldThree,
    requireTextFieldOne,
    requireTextFieldTwo,
    requireTextFieldThree,
    requireTextFieldFour,
    requireTextFieldFive,
    requireUserFieldOne,
    requireUserFieldTwo,
    requireUserFieldThree,
    textFieldOneTitle,
    textFieldTwoTitle,
    textFieldThreeTitle,
    textFieldFourTitle,
    textFieldFiveTitle,
    booleanFieldOneTitle,
    booleanFieldTwoTitle,
    booleanFieldThreeTitle,
    userFieldOneTitle,
    userFieldTwoTitle,
    userFieldThreeTitle,
    labelsTitle,
    requesterTitle,
    userId,
  } = props;
  await prisma.requestType.update({
    where: {
      id,
    },
    data: {
      name,
      description,
      menuText,
      textFieldOneGroups: textFieldOneGroups
        ? {
            set: textFieldOneGroups.map((x: string) => ({ id: Number(x) })),
          }
        : undefined,
      textFieldTwoGroups: textFieldTwoGroups
        ? {
            set: textFieldTwoGroups.map((x: string) => ({ id: Number(x) })),
          }
        : undefined,
      textFieldThreeGroups: textFieldThreeGroups
        ? {
            set: textFieldThreeGroups.map((x: string) => ({ id: Number(x) })),
          }
        : undefined,
      textFieldFourGroups: textFieldFourGroups
        ? {
            set: textFieldFourGroups.map((x: string) => ({ id: Number(x) })),
          }
        : undefined,
      textFieldFiveGroups: textFieldFiveGroups
        ? {
            set: textFieldFiveGroups.map((x: string) => ({ id: Number(x) })),
          }
        : undefined,
      booleanFieldOneGroups: booleanFieldOneGroups
        ? {
            set: booleanFieldOneGroups.map((x: string) => ({ id: Number(x) })),
          }
        : undefined,
      booleanFieldTwoGroups: booleanFieldTwoGroups
        ? {
            set: booleanFieldTwoGroups.map((x: string) => ({ id: Number(x) })),
          }
        : undefined,
      booleanFieldThreeGroups: booleanFieldThreeGroups
        ? {
            set: booleanFieldThreeGroups.map((x: string) => ({
              id: Number(x),
            })),
          }
        : undefined,
      userFieldOneGroups: userFieldOneGroups
        ? {
            set: userFieldOneGroups.map((x: string) => ({ id: Number(x) })),
          }
        : undefined,
      userFieldTwoGroups: userFieldTwoGroups
        ? {
            set: userFieldTwoGroups.map((x: string) => ({ id: Number(x) })),
          }
        : undefined,
      userFieldThreeGroups: userFieldThreeGroups
        ? {
            set: userFieldThreeGroups.map((x: string) => ({ id: Number(x) })),
          }
        : undefined,
      labelsGroups: labelsGroups
        ? {
            set: labelsGroups.map((x: string) => ({ id: Number(x) })),
          }
        : undefined,
      requesterGroups: requesterGroups
        ? {
            set: requesterGroups.map((x: string) => ({ id: Number(x) })),
          }
        : undefined,
      showRequester,
      showLabels,
      showTextFieldOne,
      showTextFieldTwo,
      showTextFieldThree,
      showTextFieldFour,
      showTextFieldFive,
      showBooleanFieldOne,
      showBooleanFieldTwo,
      showBooleanFieldThree,
      showUserFieldOne,
      showUserFieldTwo,
      showUserFieldThree,
      requireTextFieldOne,
      requireTextFieldTwo,
      requireTextFieldThree,
      requireTextFieldFour,
      requireTextFieldFive,
      requireUserFieldOne,
      requireUserFieldTwo,
      requireUserFieldThree,
      textFieldOneTitle,
      textFieldTwoTitle,
      textFieldThreeTitle,
      textFieldFourTitle,
      textFieldFiveTitle,
      booleanFieldOneTitle,
      booleanFieldTwoTitle,
      booleanFieldThreeTitle,
      userFieldOneTitle,
      userFieldTwoTitle,
      userFieldThreeTitle,
      labelsTitle,
      requesterTitle,
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

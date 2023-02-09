import type { User, Note, RequestType } from "@prisma/client";

import { prisma } from "~/db.server";

export type { Note } from "@prisma/client";

export async function getRequestTypes() {
  return await prisma.requestType.findMany({
    select: { id: true, name: true },
  });
}

export async function getRequestCategories() {
  return await prisma.requestCategory.findMany({
    select: { id: true, name: true, isDefault: true },
  });
}

export async function createRequestType({
  name,
  userId,
}: Pick<RequestType, "name"> & {
  userId: User["id"];
}) {
  return await prisma.requestType.create({
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

export async function createRequestCategory({
  name,
  userId,
}: Pick<RequestCategory, "name"> & {
  userId: User["id"];
}) {
  return await prisma.requestCategory.create({
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

export async function setRequestCategoryDefault(
  id: Pick<RequestCategory, "id">
) {
  await prisma.requestCategory.updateMany({
    data: {
      isDefault: false,
    },
  });

  return await prisma.requestCategory.update({
    where: {
      id,
    },
    data: {
      isDefault: true,
    },
  });
}

export async function deleteRequestType(id: Pick<RequestType, "id">) {
  return await prisma.requestType.delete({
    where: { id: id },
  });
}

export async function deleteRequestCategory(id: Pick<RequestType, "id">) {
  return await prisma.requestCategory.delete({
    where: { id: id },
  });
}

export function getNote({
  id,
  userId,
}: Pick<Note, "id"> & {
  userId: User["id"];
}) {
  return prisma.note.findFirst({
    select: { id: true, body: true, title: true },
    where: { id, userId },
  });
}

export function getNoteListItems({ userId }: { userId: User["id"] }) {
  return prisma.note.findMany({
    where: { userId },
    select: { id: true, title: true },
    orderBy: { updatedAt: "desc" },
  });
}

export function createNote({
  body,
  title,
  userId,
}: Pick<Note, "body" | "title"> & {
  userId: User["id"];
}) {
  return prisma.note.create({
    data: {
      title,
      body,
      user: {
        connect: {
          id: userId,
        },
      },
    },
  });
}

export function deleteNote({
  id,
  userId,
}: Pick<Note, "id"> & { userId: User["id"] }) {
  return prisma.note.deleteMany({
    where: { id, userId },
  });
}

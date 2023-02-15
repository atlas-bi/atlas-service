import type { RequestCategory, RequestType, User } from '@prisma/client';
import { prisma } from '~/db.server';

export type { Note, RequestType } from '@prisma/client';

export async function getRequestTypes() {
    return prisma.requestType.findMany({
        select: { id: true, name: true },
    });
}

export async function getRequestCategories() {
    return prisma.requestCategory.findMany({
        select: { id: true, name: true, isDefault: true },
    });
}

export async function createRequestType({
    name,
    userId,
}: Pick<RequestType, 'name'> & {
    userId: User['id'];
}) {
    return prisma.requestType.create({
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

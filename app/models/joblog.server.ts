import type { JobLog } from '@prisma/client';
import { prisma } from '~/db.server';

export const createLog = async ({
  name,
  runById,
  fail,
  message,
  started,
  completed,
  status,
  quirrelId,
}: {
  name?: JobLog['name'];
  runById: JobLog['runById'];
  fail?: JobLog['fail'];
  message?: JobLog['message'];
  started?: JobLog['started'];
  completed?: JobLog['completed'];
  status?: JobLog['status'];
  quirrelId: JobLog['quirrelId'];
}) =>
  prisma.jobLog.create({
    data: {
      name,
      fail,
      message,
      started,
      completed,
      status,
      quirrelId,
      completed,
      runById,
    },
  });

export const updateLog = async ({
  name,
  fail,
  message,
  started,
  completed,
  status,
  quirrelId,
}: {
  name?: JobLog['name'];
  fail?: JobLog['fail'];
  message?: JobLog['message'];
  started?: JobLog['started'];
  completed?: JobLog['completed'];
  status?: JobLog['status'];
  quirrelId: JobLog['quirrelId'];
}) =>
  prisma.jobLog.updateMany({
    where: { quirrelId },
    data: {
      name,
      fail,
      message,
      started,
      completed,
      status,
      quirrelId,
      completed,
    },
  });

export const getLogs = async () =>
  prisma.jobLog.findMany({
    select: {
      id: true,
      runBy: {
        select: {
          firstName: true,
          lastName: true,
          id: true,
          email: true,
          profilePhoto: true,
        },
      },
      name: true,
      fail: true,
      message: true,
      started: true,
      completed: true,
      status: true,
      createdAt: true,
      quirrelId: true,
    },
    orderBy: {
      id: 'desc',
    },
  });

import type { User } from '@prisma/client';
import { Queue } from 'quirrel/remix';
import { createLog, updateLog } from '~/models/joblog.server';
import {
  clearSearch,
  loadGroups,
  loadLabels,
  loadUsers,
  searchSettings,
} from '~/search.server';

// triggered by user refresh when it completes.
export default Queue('/queues/search_refresh', async (user?: User, meta) => {
  const log = await createLog({
    started: new Date(),
    status: 'started',
    name: '/queues/search_refresh',
    runById: user ? user.id : undefined,
    quirrelId: meta.id,
  });
  try {
    await clearSearch();
    await searchSettings();

    await loadUsers();
    await loadGroups();
    await loadLabels();

    await updateLog({
      quirrelId: meta.id,
      status: 'completed',
      completed: new Date(),
    });
  } catch (e) {
    await updateLog({
      quirrelId: meta.id,
      fail: 1,
      status: 'failed',
      message: e,
    });
  }
});

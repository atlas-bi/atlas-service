import { Queue } from 'quirrel/remix';
import { prisma } from '~/db.server';

const { MeiliSearch } = require('meilisearch');
// triggered by user refresh when it completes.
export default Queue('/queues/search_refresh', async (job) => {
  console.log('loading search');
  const userIndex = 'atlas-requests-users';
  const client = new MeiliSearch({ host: process.env.MEILISEARCH_URL });
  client.index(userIndex).deleteAllDocuments();
  client
    .index(userIndex)
    .updateSearchableAttributes(['firstname', 'lastname', 'email']);
  const chunkSize = 50;

  let chunk = await prisma.user.findMany({
    take: chunkSize,
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      profilePhoto: true,
    },
    orderBy: {
      id: 'asc',
    },
  });

  while (chunk.length) {
    client
      .index(userIndex)
      .addDocuments(chunk)
      .then((res) => console.log(res));

    const cursor = chunk[chunk.length - 1].id;

    chunk = await prisma.user.findMany({
      take: chunkSize,
      skip: 1, // Skip the cursor
      cursor: {
        id: cursor,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        profilePhoto: true,
      },
      orderBy: {
        id: 'asc',
      },
    });
  }
});

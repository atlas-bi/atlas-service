import { Queue } from 'quirrel/remix';

// triggered by user refresh when it completes.
export default Queue('/queues/search_refresh', async (job) => {
  console.log('loading search');

  //   const client = new MeiliSearch({ host: process.env.MEILISEARCH_URL })
  // client.index('movies').addDocuments(movies)
  //   .then((res) => console.log(res))
});

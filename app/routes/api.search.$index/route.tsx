import { LoaderArgs, json } from '@remix-run/node';
import { MeiliSearch } from 'meilisearch';
import invariant from 'tiny-invariant';
import { userIndex } from '~/search.server';
import { authenticator } from '~/services/auth.server';

export const action = async ({ request, params }: LoaderArgs) => {
  let user = await authenticator.isAuthenticated(request);
  if (!user) return json({});

  let index = userIndex;
  switch (params.index) {
    case 'user':
      index = userIndex;
      break;
  }
  const { q, l = 5 } = await request.json();

  invariant(process.env.MEILISEARCH_URL);
  invariant(process.env.MEILI_MASTER_KEY);

  const client = new MeiliSearch({
    host: process.env.MEILISEARCH_URL,
    apiKey: process.env.MEILI_MASTER_KEY,
  });

  const results = await client
    .index(index)
    .search(q.toString(), { limit: Number(l) });
  return json(results);
};

import type { Group, Label, Request, User } from '@prisma/client';
import { MeiliSearch } from 'meilisearch';
import { medicalSynonyms } from 'meilisearch-medical-synonyms';
import { nameSynonyms } from 'meilisearch-name-synonyms';
import invariant from 'tiny-invariant';
import { prisma } from '~/db.server';

export const userIndex = 'atlas-requests-users';
export const requestIndex = 'atlas-requests-requests';
export const groupIndex = 'atlas-requests-groups';
export const labelIndex = 'atlas-requests-labels';

invariant(process.env.MEILISEARCH_URL, 'MEILISEARCH_URL not found');

const client = new MeiliSearch({
  host: process.env.MEILISEARCH_URL,
  apiKey: process.env.MEILI_MASTER_KEY,
});

// default batch size to send to meillisearch
const chunkSize = 50;

export const clearSearch = async () => {
  await client.index(userIndex).deleteAllDocuments();
  await client.index(groupIndex).deleteAllDocuments();
  await client.index(labelIndex).deleteAllDocuments();
};

export const searchSettings = async () => {
  /* user index */

  await client
    .index(userIndex)
    .updateSearchableAttributes(['firstName', 'lastName', 'email']);

  await client.index(userIndex).updateSynonyms(nameSynonyms);

  /* group index */
  await client.index(groupIndex).updateSearchableAttributes(['name']);

  /* label index */
  await client.index(labelIndex).updateSearchableAttributes(['name']);

  await client.index(requestIndex).updateSynonyms(medicalSynonyms);
};

export const loadReport = async (request: Request) =>
  client
    .index(requestIndex)
    .addDocuments([
      {
        name: request.name,
        purposeText: request.purposeText,
        descriptionText: request.descriptionText,
        parametersText: request.parametersText,
        scheduleText: request.scheduleText,
        criteriaText: request.criteriaText,
        labels: request.labels,
      },
    ])
    .then((res) => console.log(res));

export const loadLabels = async () => {
  let chunk = await prisma.label.findMany({
    take: chunkSize,
    select: {
      id: true,
      name: true,
      color: true,
      description: true,
    },
    orderBy: {
      id: 'asc',
    },
  });

  await client
    .index(labelIndex)
    .addDocuments(chunk)
    .then((res) => console.log(res));

  while (chunk.length) {
    const cursor = chunk[chunk.length - 1].id;

    chunk = await prisma.label.findMany({
      take: chunkSize,
      skip: 1, // Skip the cursor
      cursor: {
        id: cursor,
      },
      select: {
        id: true,
        name: true,
        color: true,
        description: true,
      },
      orderBy: {
        id: 'asc',
      },
    });

    await client
      .index(labelIndex)
      .addDocuments(chunk)
      .then((res) => console.log(res));
  }
};
export const loadLabel = async (label: Label) =>
  client
    .index(labelIndex)
    .addDocuments([label])
    .then((res) => console.log(res));

export const loadUser = async (user: User) =>
  client
    .index(userIndex)
    .addDocuments([user])
    .then((res) => console.log(res));

export const loadGroup = async (group: Group) =>
  client
    .index(groupIndex)
    .addDocuments([group])
    .then((res) => console.log(res));

export const loadUsers = async () => {
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
  await client
    .index(userIndex)
    .addDocuments(chunk)
    .then((res) => console.log(res));

  while (chunk.length) {
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
    await client
      .index(userIndex)
      .addDocuments(chunk)
      .then((res) => console.log(res));
  }
};

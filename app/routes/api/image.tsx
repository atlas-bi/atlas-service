import type { ActionArgs, LoaderFunction } from '@remix-run/node';
import { sharpTransformer } from 'remix-image-sharp';
import { MemoryCache, imageLoader } from 'remix-image/server';

const config = {
  selfUrl: 'http://localhost:3000',
  cache: new MemoryCache(),
  transformer: sharpTransformer,
};

export const loader: LoaderFunction = ({ request }: ActionArgs) =>
  imageLoader(config, request);

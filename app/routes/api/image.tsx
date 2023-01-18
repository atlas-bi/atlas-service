import type { LoaderFunction } from "remix";
import { imageLoader, MemoryCache } from "remix-image/server";
import { sharpTransformer } from "remix-image-sharp";

const config = {
  selfUrl: "http://localhost:3000",
  cache: new MemoryCache(),
  transformer: sharpTransformer,
};

export const loader: LoaderFunction = ({ request }) => {
  return imageLoader(config, request);
};

/**
 * @type {import('@remix-run/dev').AppConfig}
 */
module.exports = {
  // cacheDirectory: "./node_modules/.cache/remix",
  ignoredRouteFiles: ['**/.*', '**/*.test.{js,jsx,ts,tsx}'],
  serverDependenciesToBundle: ['react-markdown', 'lodash-es'],
  serverModuleFormat: 'cjs',
  tailwind: true,
  future: {
    v2_errorBoundary: true,
    v2_normalizeFormMethod: true,
    v2_meta: true,
    v2_routeConvention: true,
  },
};

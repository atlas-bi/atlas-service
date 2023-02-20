// eslint-disable-next-line @typescript-eslint/no-var-requires
const postcss = require('@fullhuman/postcss-purgecss');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const cssnano = require('cssnano');

module.exports = {
  plugins: [
    require('autoprefixer'),
    require('postcss-preset-env'),
    postcss({
      content: ['./app/**/*.{ts,tsx,jsx,js}'],
      safelist: {
        greedy: [/svg$/, /icon$/],
      },
    }),
    cssnano({
      preset: 'default',
    }),
  ],
};

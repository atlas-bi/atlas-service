module.exports = {
  plugins: [
    require('autoprefixer'),
    require('postcss-preset-env'),
    require('@fullhuman/postcss-purgecss')({
      content: ["./app/**/*.{ts,tsx,jsx,js}"]
    }),
    require('cssnano')({
            preset: 'default',
        }),
  ],
};

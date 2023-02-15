import postcss from '@fullhuman/postcss-purgecss';
import cssnano from 'cssnano';

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

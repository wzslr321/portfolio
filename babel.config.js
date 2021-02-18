module.exports = {
    presets: [
        [
            '@babel/preset-env',
            {
                loose: true,
                modules: false,
                debug: false,
                forceAllTransforms: true,
                useBuiltIns: 'usage',
                corejs: { version: 3, proposals: true },
                // exclude any polyfill you don't need
                exclude: [
                    'es.string.anchor',
                    'es.regexp.*',
                    'es.array.concat',
                    'es.array.filter',
                    'es.array.for-each',
                    'es.array.index-of',
                    'es.array.join',
                    'es.array.map',
                    'es.array.reduce',
                    'es.array.splice',
                    'es.array.some',
                    'es.array.slice',
                    'es.object.keys',
                    'es.object.freeze',
                    'es.date.to-string',
                    'es.object.to-string',
                    'es.string.split',
                    'es.string.replace',
                ],
            },
        ],
    ],
    plugins: ['@babel/plugin-syntax-dynamic-import'],
};

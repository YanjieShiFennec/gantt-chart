const path = require('path');

module.exports = {
    // 模式: development or production
    mode: 'development',
    entry: './src/index.js',
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'dist'),
        library: {
            name: 'Gantt',
            type: 'umd',
        },
    },
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader'],
            },
        ],
    },
    // externals: {
    //     lodash: {
    //         commonjs: 'dayjs',
    //         commonjs2: 'dayjs',
    //         amd: 'dayjs',
    //         root: 'dayjs',
    //     },
    // },
};

const webpack = require("webpack");
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const devMode = process.env.NODE_ENV !== "production";
const path = require('path')

const plugins =
    [
        new CopyWebpackPlugin({
            patterns: [
                { from: path.resolve(__dirname, '../static') }
            ]
        }),
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, '../src/index.html'),
            filename: "index.html",
            minify: true
        }),
        // Tes autres pages sont déclarés ici mais c pas la bonne maniére de faire 
        // new HtmlWebpackPlugin({
        //     template: path.resolve(__dirname, '../src/contact.html'),
        //     filename: 'contact.html',
        //     minify: true
        // }),
        // new HtmlWebpackPlugin({
        //     template: path.resolve(__dirname, '../src/work.html'),
        //     filename: 'work.html',
        //     minify: true
        // }),
        new MiniCssExtractPlugin({
            filename: '[name].css'
        }),
    ]

if (devMode) {
    // only enable hot in development
    plugins.push(new webpack.HotModuleReplacementPlugin());
}

module.exports = {
    entry: path.resolve(__dirname, '../src/script.js'),
    output:
    {
        filename: 'bundle.[contenthash].js',
        path: path.resolve(__dirname, '../dist')
    },
    devtool: 'source-map',
    plugins,

    module:
    {
        rules:
            [
                // HTML
                {
                    test: /\.(html)$/,
                    use: [
                        {
                            loader: 'html-loader',
                            options: { // Disables attributes processing 
                                sources: false,
                            },
                        }
                    ],
                },

                // JS
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    use:
                        [
                            'babel-loader'
                        ]
                },

                // SCSS
                {
                    test: /\.scss$/i,
                    use: [
                        {
                            loader: MiniCssExtractPlugin.loader,
                            // options: {
                            //     hot: process.env.NODE_ENV === 'development'
                            // }
                        },
                        "css-loader",
                        "postcss-loader",
                        "sass-loader",
                    ],
                },

                // CSS
                {
                    test: /\.css$/,
                    use:
                        [
                            'css-loader'
                        ]
                },

                // Images
                {
                    test: /\.(jpg|png|gif|svg)$/,
                    use:
                        [
                            {
                                loader: 'file-loader',
                                options:
                                {
                                    outputPath: 'images/'
                                }
                            }
                        ]
                },

                // Videos
                {
                    test: /\.(mp4|webm)$/,
                    use: [
                        {
                            loader: 'file-loader',
                            options: {
                                outputPath: 'assets/videos/'
                            }
                        },
                    ]
                },

                // Fonts
                {
                    test: /\.(ttf|otf|eot|woff|woff2|json)$/,
                    use:
                        [
                            {
                                loader: 'file-loader',
                                options:
                                {
                                    outputPath: 'fonts/'
                                }
                            }
                        ]
                },

                // Shaders
                {
                    test: /\.(glsl|vs|fs|vert|frag)$/,
                    exclude: /node_modules/,
                    use: [
                        'raw-loader'
                    ]
                }
            ]
    },
}

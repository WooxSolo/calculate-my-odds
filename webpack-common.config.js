const isDevMode = process.env.NODE_ENV === "development";
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = env => ({
    entry: {
        "app": "./index.tsx"
    },
    module: {
        rules: [
            {
                test: /\.worker\.js$/,
                use: {
                    loader: 'worker-loader',
                },
            },
            {
                test: /\.tsx?$/i,
                use: "ts-loader",
                exclude: /node_modules/
            },
            {
                test: /\.(css|sass|scss)$/i,
                use: [
                    "style-loader",
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                            esModule: false,
                        }
                    },
                    "css-loader",
                    {
                        loader: "sass-loader",
                        options: {
                            sourceMap: isDevMode,
                            implementation: require("sass"),
                            sassOptions: {
                                fiber: require("fibers")
                            }
                        }
                    }
                ]
            },
            {
                test: /\.(jpg|png|svg)$/,
                use: {
                    loader: "url-loader"
                }
            }
        ]
    },
    resolve: {
        extensions: [ ".tsx", ".ts", ".jsx", ".js" ]
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: "[name].css",
            chunkFilename: "[id].css"
        })
    ]
});


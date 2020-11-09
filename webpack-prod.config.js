const path = require("path");
const merge = require("webpack-merge");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const common = require("./webpack-common.config");

module.exports = env => (merge(common(env)), {
    module: {
        rules: [
            {
                test: /\.m?js$/,
                exclude: [
                    /node_modules/
                ],
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: [
                            [
                                "@babel/preset-env",
                                {
                                    corejs: 3,
                                    targets: [">0.2%", "not dead", "last 2 versions"],
                                    useBuiltIns: "entry"
                                }
                            ]
                        ]
                    }
                }
            }
        ]
    },
    plugins: [
        new CleanWebpackPlugin()
    ],
    output: {
        filename: "[name].bundle.js",
        path: path.resolve(__dirname, "build")
    }
});

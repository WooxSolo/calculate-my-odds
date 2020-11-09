const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");
const webpack = require("webpack");
const { merge } = require("webpack-merge");
const common = require("./webpack-common.config");

module.exports = env => merge(common(env), {
    mode: "development",
    devServer: {
        hot: true,
        port: 7373
    },
    devtool: "source-map",
    plugins: [
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, "src", "app", "template", "index.html")
        })
    ],
    output: {
        filename: "[name].js"
    }
});

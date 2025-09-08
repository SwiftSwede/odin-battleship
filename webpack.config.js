// webpack.config.js
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: "./src/index.js", // Entry point
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"), // Output to dist/
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"], // For importing CSS
      },
      {
        test: /\.js$/, // Apply babel-loader to .js files
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "src/index.html", // your HTML template (optional)
      title: "Odin Battleship", // Page title
    }),
  ],
  devServer: {
    static: "./dist", // Serve from dist/
    open: true, // Auto open browser
  },
  mode: "development",
};

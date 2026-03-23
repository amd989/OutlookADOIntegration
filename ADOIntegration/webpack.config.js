const fs = require("fs");
const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

// Load .env file if it exists
const envPath = path.join(__dirname, ".env");
const envVars = {};
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, "utf-8").split("\n").forEach((line) => {
    const match = line.match(/^\s*([\w]+)\s*=\s*(.*)\s*$/);
    if (match) envVars[match[1]] = match[2];
  });
}

const devCertsDir = path.join(require("os").homedir(), ".office-addin-dev-certs");
const hasDevCerts = fs.existsSync(path.join(devCertsDir, "localhost.key"));

module.exports = (env, argv) => {
  const isDev = argv.mode === "development";

  const config = {
    entry: {
      taskpane: "./src/taskpane/index.tsx",
      commands: "./src/commands/commands.ts",
    },
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "[name].bundle.js",
      clean: true,
    },
    resolve: {
      extensions: [".ts", ".tsx", ".js", ".jsx"],
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: "ts-loader",
          exclude: /node_modules/,
        },
        {
          test: /\.css$/,
          use: ["style-loader", "css-loader"],
        },
        {
          test: /\.(png|jpg|gif|svg)$/,
          type: "asset/resource",
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: "./src/taskpane/index.html",
        filename: "taskpane.html",
        chunks: ["taskpane"],
      }),
      new HtmlWebpackPlugin({
        template: "./src/commands/commands.html",
        filename: "commands.html",
        chunks: ["commands"],
      }),
      new CopyWebpackPlugin({
        patterns: [
          { from: "assets", to: "assets" },
          { from: "public", to: "." },
        ],
      }),
      new webpack.DefinePlugin({
        "process.env.ENTRA_CLIENT_ID": JSON.stringify(envVars.ENTRA_CLIENT_ID || ""),
      }),
    ],
    devtool: isDev ? "source-map" : false,
  };

  if (isDev) {
    config.devServer = {
      static: {
        directory: path.join(__dirname, "assets"),
        publicPath: "/assets",
      },
      port: 44366,
      host: "localhost",
      server: hasDevCerts
        ? {
            type: "https",
            options: {
              key: fs.readFileSync(path.join(devCertsDir, "localhost.key")),
              cert: fs.readFileSync(path.join(devCertsDir, "localhost.crt")),
              ca: fs.readFileSync(path.join(devCertsDir, "ca.crt")),
            },
          }
        : "https",
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    };
  }

  return config;
};

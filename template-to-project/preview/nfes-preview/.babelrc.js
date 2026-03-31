let exprtsObj = {};

if (process.env["NODEENV"] && process.env["NODEENV"].toLowerCase() === "test") {
  let path = require("path");
  const presets = [
    require.resolve(
      path.join(process.env["CLIPATH"], "@babel/preset-typescript"),
    ),
    require.resolve(path.join(process.env["CLIPATH"], "@babel/preset-env")),
    require.resolve(path.join(process.env["CLIPATH"], "@babel/preset-react")),
    "@ctrip/nfes-next/babel",
  ];
  const plugins = [
    [
      path.join(process.env["CLIPATH"], "babel-plugin-module-resolver"),
      {
        alias: {
          enzyme: path.join(process.env["CLIPATH"], "enzyme"),
          "enzyme-adapter-react-16": path.join(
            process.env["CLIPATH"],
            "enzyme-adapter-react-16",
          ),
        },
        cwd: "babelrc",
      },
    ],

    [
      require.resolve(
        path.join(
          process.env["CLIPATH"],
          "@babel/plugin-proposal-class-properties",
        ),
      ),
    ],
    [
      require.resolve(
        path.join(
          process.env["CLIPATH"],
          "@babel/plugin-proposal-function-bind",
        ),
      ),
    ],
    [
      require.resolve(
        path.join(
          process.env["CLIPATH"],
          "@babel/plugin-proposal-export-default-from",
        ),
      ),
    ],
    [
      path.join(process.env["CLIPATH"], "babel-plugin-wrap-in-js"),
      {
        extensions: ["css$", "scss$"],
      },
    ],
    [path.join(process.env["CLIPATH"], "babel-plugin-jsx-svg-inject")],
  ];
  const compact = true;
  exprtsObj = { presets, plugins, compact };
}

module.exports = exprtsObj;

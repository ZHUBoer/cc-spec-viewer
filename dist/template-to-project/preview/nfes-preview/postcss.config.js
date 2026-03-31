module.exports = {
  plugins: [
    "postcss-easy-import", // keep this first
    "autoprefixer", // so imports are auto-prefixed too
    "@ctrip/postcss-zxtaro-px-multiple",
    [
      "postcss-pxtorem",
      {
        rootValue: 40,
        unitPrecision: 5,
        propList: ["*"],
        selectorBlackList: [],
        replace: true,
        mediaQuery: false,
        minPixelValue: 1,
        exclude: /node_modules/i,
      },
    ],
  ],
};

const BASE_FONT_SIZE = 40;
const withTaro = (_designWidth, autoprefixerOption) => (config) => {
  const plugins = config.plugins || [];

  plugins.push([
    require.resolve("postcss-pxtorem"),
    {
      // options.rootValue = (input) => (baseFontSize / options.deviceRatio[designWidth(input)]) * 2
      rootValue: BASE_FONT_SIZE,
      propWhiteList: [],
    },
  ]);

  plugins.push([
    require.resolve("postcss-pxtorem"),
    {
      rootValue: BASE_FONT_SIZE,
      propWhiteList: [],
    },
  ]);

  if (autoprefixerOption) {
    plugins.push([require.resolve("autoprefixer"), autoprefixerOption]);
  }

  return {
    ...config,
    plugins,
  };
};

module.exports = withTaro(750, { flexbox: "no-2009" })({
  plugins: [],
});

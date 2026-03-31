const { util } = require("@ctrip/function-nfes-helper/server");
const { AppID, abTestKeys } = require("./app.config");
const packageConfig = require("./package.json");

module.exports = {
  ///<!--Expression generation area, please do not modify-->
  // cdn-start
  // cdn-end

  // vd-start
  vd: "",
  // vd-end
  ///<!--Expression generation area, please do not modify-->
  experimental: {
    appDir: true,
    esmExternals: "loose",
  },

  // launch page
  main: "demo",
  buildId: "xxx",
  port: packageConfig.config.port,
  mpaasAppID: 700041,
  captainOptions: {
    appid: AppID,
    site: "ares.i18n",
    resVD: "ztrip",
    useAres2: true,
  },
  isNotUseServiceWorker: true,
  compatibleStyleSetInnerHTML: true,
  openI18nResource: true,
  openUBTI18n: true,
  openPolyfillsI18n: true,
  openLibsI18n: true,
  isAddCrossOrigin: true,
  injectCssInHtml: true,
  noCommonsChunk: true,
  removeBridgeJs: true, // 去除携程bridge,防止携程bridge执行后native无法注入智行bridge
  beforeStartCallback: async function (server, app, expRouter) {
    await util.initQConfig();
    if (abTestKeys) {
      const ABTest = require("ctriputil").ABTest2;
      abTestKeys.forEach((key) => {
        new ABTest(key);
      });
    }
  },
  webpack(nfesConfig) {
    return Object.assign({}, nfesConfig, {
      webpack: function (config, options) {
        config.externals.push(...["ctriputil", "tripcore"]);
        return config;
      },
    });
  },
  transpilePackages: [
    // 这些 npm 包需要编译
    (res) =>
      [
        /function-nfes-helper/,
        /ztrip-util/,
        /@ctrip\/xtaro(?:-[^/]+)*-h5\//,
      ].some((e) => e.test(res)),
  ],
  nfesBabel: {
    presets: ["@ctrip/babel-preset-xtaro-nfes/nfes"],
    plugins: [
      "@ctrip/babel-plugin-zxtaro-import",
      require.resolve("./babel-inject-corehash.js"),
    ],
  },
  GUIDDomainHook: (host) => {
    if (host.includes("suanya")) return ".suanya.com";
    if (host.includes("tieyou")) return ".tieyou.com";
  },
};

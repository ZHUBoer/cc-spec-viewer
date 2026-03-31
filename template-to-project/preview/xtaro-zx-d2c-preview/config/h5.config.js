/**
 * @description H5配置文件
 *
 * @doc https://pages.release.ctripcorp.com/xtaro/xtaro/docs/project/configuration_h5
 *
 * @type {import('@ctrip/xtaro-types/types/config/config_h5').H5Config}
 */
module.exports = {
  templateFolder: "./nfes", //默认替换NFES项目中的文件
  transformSassName: true,
  extraPackageJson: {
    //合并NFES产物中的package.json
    dependencies: {},
  },
  customExtraPlatform: process.env.XTARO_EXTRA || "", // 直接使用process.env.XTARO_EXTRA 作为配置,由package.json 里面命令行--extra trip（优先级更高） 或者 -T 传入
  appId: "1000012345",
  pipeline: {
    Build: {
      appId: "1000012345",
    },
  },
  transpilePackages: [
    "nfes-ui-icons",
    "CitySelector",
    "@ctrip/xtaro",
    "@ctrip/xtaro-zx",
    "@ctrip/xtaro-h5",
    "@ctrip/xtaro-zx-h5",
    "@ctrip/xtaro-trip-h5",
    "@ctrip/trip-component-platform-h5-header",
    "@ctrip/trip-component-helper",
  ],
  enbaleDefaultXtaroPxToRem: true, // 是否开启新版本的，默认的xtaro组件库px转rem，建议打开
  enbaleAllXtaroPxToRem: true, // 是否开启全局的xtaro组件库px转rem，建议打开
  plugins: [require.resolve("../babel-inject-corehash.js")],
};

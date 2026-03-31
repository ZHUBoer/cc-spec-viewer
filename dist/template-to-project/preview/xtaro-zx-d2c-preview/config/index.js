/**
 * @description 项目配置文件
 *
 * @doc https://pages.release.ctripcorp.com/xtaro/xtaro/docs/project/configuration_common
 *
 * @type {import('@ctrip/xtaro-types/types/config/config').Config}
 */
const config = {
  useRNFlexStyle: true,
  alias: {},
  // 设计稿尺寸 designWidth与baseWidth务必保持一致
  designWidth: 750,
  // 基准宽度
  baseWidth: 750,
  // 设计稿尺寸换算规则
  deviceRatio: {
    640: 2.34 / 2,
    750: 1,
    828: 1.81 / 2,
  },
  routes: [
    {
      path: "pages/xtarozxDemo/index", //默认src下文件路径
      crnRouterName: "index", //crn 路由别名
      h5RouterName: "/index",
      platform: ["h5", "crn"], //会减少单端构建的产物
    },
  ],
};

//XTARO_ENV在各端build时会自动设置
module.exports = (merge) => {
  if (process.env.XTARO_ENV === "crn") {
    return merge({}, config, require("./crn.config.js"));
  }
  if (process.env.XTARO_ENV === "h5") {
    return merge({}, config, require("./h5.config.js"));
  }
  return config;
};

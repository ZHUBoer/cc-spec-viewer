const packageConfig = require("./package.json");
function standardEnv(env) {
  const ENV_MAP = {
    dev: "fws",
    fat: "fws",
    fws: "fws",
    uat_nt: "uat",
    uat: "uat",
    lpt: "lpt",
    pro: "pro",
    prod: "pro",
    prd: "pro",
  };
  env = env && env.toLowerCase();
  return ENV_MAP[env] || env;
}

module.exports = {
  "vi.ignite": true,
  Env: standardEnv(packageConfig.config.env),
  AppID: "310002290",
  // qconfigKeys: ['test.json'],
  // abTestKeys: [],
};

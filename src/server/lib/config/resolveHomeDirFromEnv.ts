import path from "node:path";

export const resolveHomeDirFromEnv = (): string => {
  // biome-ignore lint/style/noProcessEnv: 需要读取系统主目录环境变量
  const homeDir = process.env.HOME?.trim();
  if (homeDir) {
    return homeDir;
  }

  // biome-ignore lint/style/noProcessEnv: Windows 用户目录变量
  const userProfile = process.env.USERPROFILE?.trim();
  if (userProfile) {
    return userProfile;
  }

  // biome-ignore lint/style/noProcessEnv: Windows 回退组合变量
  const homeDrive = process.env.HOMEDRIVE?.trim();
  // biome-ignore lint/style/noProcessEnv: Windows 回退组合变量
  const homePath = process.env.HOMEPATH?.trim();
  if (homeDrive && homePath) {
    // 使用 path.join 正确处理路径拼接，避免双反斜杠问题
    return path.join(homeDrive, homePath);
  }

  throw new Error(
    "Unable to resolve home directory from HOME, USERPROFILE, or HOMEDRIVE/HOMEPATH",
  );
};

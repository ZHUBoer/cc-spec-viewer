import path from "node:path";

export const encodeProjectId = (fullPath: string) => {
  return Buffer.from(fullPath, "utf-8").toString("base64url");
};

export const decodeProjectId = (id: string) => {
  return Buffer.from(id, "base64url").toString("utf-8");
};

export const encodeProjectIdFromSessionFilePath = (sessionFilePath: string) => {
  // 使用 path.dirname 跨平台获取父目录
  return encodeProjectId(path.dirname(sessionFilePath));
};

import path from "node:path";
import { decodeProjectId } from "../../project/functions/id";

export const encodeSessionId = (jsonlFilePath: string) => {
  // 使用 path.basename 跨平台获取文件名
  const fileName = path.basename(jsonlFilePath);
  return fileName.endsWith(".jsonl")
    ? fileName.slice(0, -".jsonl".length)
    : fileName;
};

export const decodeSessionId = (projectId: string, sessionId: string) => {
  const projectPath = decodeProjectId(projectId);
  // 使用 path.join 跨平台拼接路径
  return path.join(projectPath, `${sessionId}.jsonl`);
};

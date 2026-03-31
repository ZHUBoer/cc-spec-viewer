/**
 * 飞书链接检测与内容替换工具函数
 */

/** 飞书链接前缀 */
const FEISHU_URL_PREFIXES = [
  "https://trip.larkenterprise.com/wiki/",
  "https://trip.larkenterprise.com/docx/",
] as const;

/** 匹配飞书链接的正则（支持 wiki 和 docx 两种前缀，只匹配合法 URL 字符，避免误匹配中文） */
const FEISHU_URL_REGEX =
  /https:\/\/trip\.larkenterprise\.com\/(wiki|docx)\/[a-zA-Z0-9_\-/?#&=%.~+:@;,]+/g;

/**
 * 检测文本中的飞书链接，返回去重后的 URL 数组
 */
export const detectFeishuUrls = (text: string): string[] => {
  const matches = text.match(FEISHU_URL_REGEX);
  if (!matches) return [];
  // 去重
  return [...new Set(matches)];
};

/**
 * 判断 URL 是否是飞书文档链接
 */
export const isFeishuUrl = (url: string): boolean => {
  return FEISHU_URL_PREFIXES.some((prefix) => url.startsWith(prefix));
};

/**
 * 将飞书链接替换为格式化的 markdown 内容块
 *
 * 替换规则：
 * - 使用 --- 分隔线 + 引用块标题包裹每个飞书文档内容，与用户原始消息清晰区分
 * - 同一链接多次出现时，只替换第一次，后续替换为简短引用
 *
 * @param text 原始消息文本
 * @param urlContentMap 飞书链接 → markdown 内容的映射（只包含成功解析的链接）
 * @returns 替换后的消息文本
 */
export const replaceFeishuUrls = (
  text: string,
  urlContentMap: Map<string, string>,
): string => {
  // 记录每个 URL 是否已被替换过（用于处理同一链接多次出现）
  const replacedUrls = new Set<string>();

  // 使用正则逐个替换
  const result = text.replace(FEISHU_URL_REGEX, (matchedUrl) => {
    const content = urlContentMap.get(matchedUrl);

    // 该链接解析失败，保留原始 URL
    if (content === undefined) {
      return matchedUrl;
    }

    // 同一链接第二次及以后出现，使用简短引用
    if (replacedUrls.has(matchedUrl)) {
      return `（同上飞书文档: ${matchedUrl}）`;
    }

    replacedUrls.add(matchedUrl);

    // 首次出现，替换为格式化的内容块
    return formatFeishuContentBlock(matchedUrl, content);
  });

  return result;
};

/**
 * 格式化单个飞书文档内容块
 * 使用代码块包裹 markdown 内容，与用户原始消息清晰区分
 */
const formatFeishuContentBlock = (url: string, content: string): string => {
  return `

> 📄 **飞书文档内容** (来源: ${url})

\`\`\`markdown
${content.trim()}
\`\`\`

`;
};

export const SPECFORGE_MARKER_BLOCK_PATTERN =
  /_specforge:\s*\r?\n([\s\S]*?)(?=\r?\n[a-zA-Z_][\w-]*:\s*|\r?\n$|$)/;

export const SPECFORGE_MARKER_BLOCK_REPLACE_PATTERN =
  /_specforge:\s*\r?\n[\s\S]*?(?=\r?\n[a-zA-Z_][\w-]*:\s*|\r?\n$|$)/;

export const extractSpecforgeMarkerBlock = (
  content: string,
): string | undefined => {
  const matched = content.match(SPECFORGE_MARKER_BLOCK_PATTERN);
  return matched?.[1];
};

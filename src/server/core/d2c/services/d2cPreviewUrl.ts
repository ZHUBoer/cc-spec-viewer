const PREVIEW_URL_DEFAULT = "http://localhost:8123/demo";

export const resolvePreviewUrl = (env: NodeJS.ProcessEnv): string =>
  env.NFES_PREVIEW_URL || env.XTARO_PREVIEW_URL || PREVIEW_URL_DEFAULT;

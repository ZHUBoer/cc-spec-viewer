import { configDefaults, defineConfig } from "vitest/config";

const config = defineConfig({
  test: {
    globals: true,
    setupFiles: ["src/testing/setup/vitest.setup.ts"],
    exclude: [...configDefaults.exclude, "**/.worktrees/**"],
    env: {
      ENVIRONMENT: "local",
    },
  },
});

export default config;

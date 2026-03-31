export const getSessionDetailRefetchInterval = (options: {
  isSseConnected: boolean;
  sessionProcessStatus: "running" | "paused" | undefined;
}): number | false => {
  if (options.sessionProcessStatus === "running") {
    return 1000;
  }

  if (options.sessionProcessStatus === "paused") {
    return 1000;
  }

  if (!options.isSseConnected) {
    return 3000;
  }

  return false;
};

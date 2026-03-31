export const ensureStartNewChatConfigured = ({
  isConfigured,
  handleGoToInit,
}: {
  isConfigured: boolean | null | undefined;
  handleGoToInit: () => void;
}): boolean => {
  if (isConfigured === false) {
    handleGoToInit();
    return false;
  }

  return true;
};

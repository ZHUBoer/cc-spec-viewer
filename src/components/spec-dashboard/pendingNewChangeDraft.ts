export interface PendingNewChangeDraft {
  id: string;
  text: string;
}

const getStorageKey = (projectId: string) =>
  `specforge:pending-new-change-draft:${projectId}`;

export const pendingNewChangeDraftEvent = "specforge:pending-new-change-draft";

export const savePendingNewChangeDraft = (
  projectId: string,
  draft: PendingNewChangeDraft,
) => {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(
    getStorageKey(projectId),
    JSON.stringify(draft),
  );
  window.dispatchEvent(
    new CustomEvent(pendingNewChangeDraftEvent, {
      detail: {
        projectId,
        draft,
      },
    }),
  );
};

export const loadPendingNewChangeDraft = (
  projectId: string,
): PendingNewChangeDraft | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.sessionStorage.getItem(getStorageKey(projectId));
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "id" in parsed &&
      "text" in parsed &&
      typeof parsed.id === "string" &&
      typeof parsed.text === "string"
    ) {
      return parsed;
    }
  } catch {
    return null;
  }

  return null;
};

export const clearPendingNewChangeDraft = (projectId: string) => {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.removeItem(getStorageKey(projectId));
};

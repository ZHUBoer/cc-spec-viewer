export interface D2CArtifactSummary {
  id: string;
  title: string;
  description?: string;
}

interface ArtifactEntry {
  name: string;
  isDir: boolean;
  hasTsx: boolean;
  hasScss: boolean;
  description?: string;
}

export const listArtifactsFromEntries = (options: {
  entries: ArtifactEntry[];
}): D2CArtifactSummary[] =>
  options.entries
    .filter((entry) => entry.isDir && entry.hasTsx && entry.hasScss)
    .map((entry) => ({
      id: entry.name,
      title: entry.name,
      description: entry.description,
    }))
    .sort((a, b) => a.title.localeCompare(b.title));

import z from "zod";

const pathSeparator = String.raw`[/\\]`;
const sessionFileRegExp = new RegExp(
  `(?<projectId>.+)${pathSeparator}(?<sessionId>[^/\\\\]+)\\.jsonl$`,
);
const agentFileRegExp = new RegExp(
  `(?<projectId>.+)${pathSeparator}agent-(?<agentSessionId>[^/\\\\]+)\\.jsonl$`,
);

const sessionFileGroupSchema = z.object({
  projectId: z.string().min(1),
  sessionId: z.string().min(1),
});

const agentFileGroupSchema = z.object({
  projectId: z.string().min(1),
  agentSessionId: z.string().min(1),
});

export type SessionFileMatch = {
  type: "session";
  projectId: string;
  sessionId: string;
};

export type AgentFileMatch = {
  type: "agent";
  projectId: string;
  agentSessionId: string;
};

export type FileMatch = SessionFileMatch | AgentFileMatch | null;

/**
 * Parses a file path to determine if it's a regular session file or an agent session file.
 * Agent files take precedence in matching (checked first).
 *
 * @param filePath - The relative file path from the claude projects directory
 * @returns FileMatch object with type and extracted IDs, or null if not a recognized file
 */
export const parseSessionFilePath = (filePath: string): FileMatch => {
  // Check for agent file first (more specific pattern)
  const agentMatch = filePath.match(agentFileRegExp);
  const agentGroups = agentFileGroupSchema.safeParse(agentMatch?.groups);
  if (agentGroups.success) {
    return {
      type: "agent",
      projectId: agentGroups.data.projectId,
      agentSessionId: agentGroups.data.agentSessionId,
    };
  }

  // Check for regular session file
  const sessionMatch = filePath.match(sessionFileRegExp);
  const sessionGroups = sessionFileGroupSchema.safeParse(sessionMatch?.groups);
  if (sessionGroups.success) {
    return {
      type: "session",
      projectId: sessionGroups.data.projectId,
      sessionId: sessionGroups.data.sessionId,
    };
  }

  return null;
};

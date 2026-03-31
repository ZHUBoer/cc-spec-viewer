import { useQuery } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { featureFlagsQuery } from "../lib/api/queries";
import type { FlagName } from "../server/core/feature-flag/models/flag";

export const useFeatureFlags = () => {
  const { data } = useQuery({
    queryKey: featureFlagsQuery.queryKey,
    queryFn: featureFlagsQuery.queryFn,
  });
  const flags = data?.flags ?? [];

  const enabledFlags = useMemo(() => {
    return new Set(
      flags.filter((flag) => flag.enabled).map((flag) => flag.name),
    );
  }, [flags]);

  const isFlagEnabled = useCallback(
    (flagName: FlagName) => {
      return enabledFlags.has(flagName);
    },
    [enabledFlags],
  );

  return {
    flags,
    isFlagEnabled,
  } as const;
};

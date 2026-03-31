import type { ReactNode } from "react";
import { SSEEventListeners } from "../app/components/SSEEventListeners";
import { SyncSessionProcess } from "../app/components/SyncSessionProcess";
import { SSEProvider } from "../lib/sse/components/SSEProvider";
import { useAuth } from "./AuthProvider";
import { SearchProvider } from "./SearchProvider";
import { ConfigCheckProvider } from "./spec-dashboard/ConfigCheckProvider";

interface AuthenticatedProvidersProps {
  children: ReactNode;
}

/**
 * Wraps children with SSE providers only when authenticated.
 * This prevents SSE connections and API calls when the user is not logged in.
 */
export function AuthenticatedProviders({
  children,
}: AuthenticatedProvidersProps) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <SearchProvider>
        <ConfigCheckProvider>{children}</ConfigCheckProvider>
      </SearchProvider>
    );
  }

  return (
    <SearchProvider>
      <ConfigCheckProvider>
        <SSEProvider>
          <SSEEventListeners>
            <SyncSessionProcess>{children}</SyncSessionProcess>
          </SSEEventListeners>
        </SSEProvider>
      </ConfigCheckProvider>
    </SearchProvider>
  );
}

import { useGetCurrentUser } from "@workspace/api-client-react";

export function useAuth() {
  const { data: user, isLoading, isFetched } = useGetCurrentUser();
  const isAuthenticated = Boolean(user && (user as { email?: string }).email);
  return { user, isAuthenticated, isLoading, isFetched };
}

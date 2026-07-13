import { useQuery } from "@tanstack/react-query";
import { restClient } from "@/app/services/http/rest";
import { QUERY_KEYS } from "@/app/constants/query-keys";
import type { IDashboardStats } from "@/app/types/api";

export function useDashboard() {
  return useQuery({
    queryKey: QUERY_KEYS.dashboard(),
    queryFn: () =>
      restClient.get<{ data: IDashboardStats }>("/dashboard/stats"),
    staleTime: 30_000,
  });
}

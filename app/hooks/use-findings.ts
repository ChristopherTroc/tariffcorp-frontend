import { useQuery } from "@tanstack/react-query";
import { restClient } from "@/app/services/http/rest";
import { QUERY_KEYS } from "@/app/constants/query-keys";
import type {
  IFindingFilters,
  IPaginatedResponse,
  IFinding,
} from "@/app/types/api";

export function useFindings(filters?: IFindingFilters) {
  return useQuery({
    queryKey: QUERY_KEYS.findings(filters),
    queryFn: () =>
      restClient.get<IPaginatedResponse<IFinding>>("/findings", {
        params: filters as Record<string, string | number | boolean | undefined | null>,
      }),
    staleTime: 30_000,
  });
}

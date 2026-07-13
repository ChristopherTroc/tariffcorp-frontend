import { useQuery } from "@tanstack/react-query";
import { restClient } from "@/app/services/http/rest";
import { QUERY_KEYS } from "@/app/constants/query-keys";
import type {
  ITransactionFilters,
  IPaginatedResponse,
  ITransaction,
  ITransactionDetail,
} from "@/app/types/api";

export function useTransactions(filters?: ITransactionFilters) {
  return useQuery({
    queryKey: QUERY_KEYS.transactions(filters),
    queryFn: () =>
      restClient.get<IPaginatedResponse<ITransaction>>("/transactions", {
        params: filters as Record<string, string | number | boolean | undefined | null>,
      }),
    staleTime: 30_000,
  });
}

export function useTransactionDetail(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.transactionDetail(id),
    queryFn: () =>
      restClient.get<{ data: ITransactionDetail }>(`/transactions/${id}`),
    staleTime: 30_000,
    enabled: Boolean(id),
  });
}

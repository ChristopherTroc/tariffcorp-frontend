import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { restClient } from "@/app/services/http/rest";
import { QUERY_KEYS } from "@/app/constants/query-keys";
import type {
  IProductFilters,
  IPaginatedResponse,
  IProductWithCount,
  IProductDetail,
  IProduct,
  IUpdateProductDto,
} from "@/app/types/api";

export function useProducts(filters?: IProductFilters) {
  return useQuery({
    queryKey: QUERY_KEYS.products(filters),
    queryFn: () =>
      restClient.get<IPaginatedResponse<IProductWithCount>>("/products", {
        params: filters as Record<string, string | number | boolean | undefined | null>,
      }),
    staleTime: 30_000,
  });
}

export function useProductDetail(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.productDetail(id),
    queryFn: () =>
      restClient.get<{ data: IProductDetail }>(`/products/${id}`),
    staleTime: 30_000,
    enabled: Boolean(id),
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: IUpdateProductDto }) =>
      restClient.patch<{ data: IProduct }>(`/products/${id}`, dto),
    onSuccess: (_, { id }) => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.productDetail(id),
      });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.findings(),
      });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.products(),
      });
    },
  });
}

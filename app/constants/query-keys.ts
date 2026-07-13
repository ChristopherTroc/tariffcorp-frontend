import type {
  ITransactionFilters,
  IProductFilters,
  IFindingFilters,
} from "@/app/types/api";

export const QUERY_KEYS = {
  dashboard: () => ["dashboard", "stats"] as const,

  transactions: (filters?: ITransactionFilters) =>
    ["transactions", filters] as const,
  transactionDetail: (id: string) => ["transactions", id] as const,

  products: (filters?: IProductFilters) => ["products", filters] as const,
  productDetail: (id: string) => ["products", id] as const,

  findings: (filters?: IFindingFilters) => ["findings", filters] as const,
} as const;

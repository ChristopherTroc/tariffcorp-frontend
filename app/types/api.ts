// ─── Primitives ──────────────────────────────────────────────────────────────

export type TProductType =
  | "electronics"
  | "consumable"
  | "apparel"
  | "furniture"
  | "raw_material";

// ─── Core domain shapes ───────────────────────────────────────────────────────

export interface ITransaction {
  id: string;
  date: string; // ISO datetime
  importer: string;
  broker: string;
  portOfEntry: string;
  importCode: string;
  countryOfOrigin: string;
  units: number;
  unitValue: number;
  totalValue: number;
  dutyDeclared: number;
  productId: string | null; // null = unmatched
  /** Optional list enrichment — absent today; UI must not invent values. */
  findingExposure?: number | null;
}

export interface IProduct {
  id: string;
  name: string;
  type: TProductType;
  importCode: string;
  countryOfOrigin: string;
  value: number;
  weight: number;
  unit: string;
}

export interface IProductWithCount extends IProduct {
  openFindingsCount: number;
}

export interface IFinding {
  id: string;
  ruleId: "R1" | "R2" | "R3" | null;
  ruleName: string | null;
  dutyComputed: number;
  exposure: number; // negative = overpaid
  transactionId: string;
  productId: string | null;
}

// ─── Detail / composite shapes ────────────────────────────────────────────────

export interface ITransactionDetail {
  transaction: ITransaction;
  product: IProduct | null;
  finding: IFinding | null;
}

export interface IProductDetail {
  product: IProduct;
  transactions: ITransaction[];
  findings: IFinding[];
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export interface ITopOffenderItem {
  name: string;
  totalExposure: number;
}

export interface ITopOffenderProduct {
  id: string;
  name: string;
  totalExposure: number;
}

export interface IDashboardStats {
  totalExposure: number;
  totalDutyDeclared: number;
  totalDutyComputed: number;
  openFindingsCount: number;
  unmatchedTransactionsCount: number;
  topOffenders: {
    byBroker: ITopOffenderItem[];
    byPort: ITopOffenderItem[];
    byProduct: ITopOffenderProduct[];
  };
}

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface IPaginatedMeta {
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface IPaginatedResponse<T> {
  data: T[];
  meta: IPaginatedMeta;
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export interface IUpdateProductDto {
  importCode?: string;
  countryOfOrigin?: string;
  type?: TProductType;
  value?: number;
  weight?: number;
  unit?: string;
}

// ─── Filter shapes ────────────────────────────────────────────────────────────

export interface ITransactionFilters {
  page?: number;
  per_page?: number;
  status?: "matched" | "unmatched";
  broker?: string;
  port_of_entry?: string;
  sort?: string;
  dir?: "asc" | "desc";
}

export interface IProductFilters {
  page?: number;
  per_page?: number;
  type?: TProductType;
  has_findings?: boolean;
}

export interface IFindingFilters {
  page?: number;
  per_page?: number;
}

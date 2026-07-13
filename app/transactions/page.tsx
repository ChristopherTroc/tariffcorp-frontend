import { Suspense } from "react";
import { ViewTransactions } from "@/app/views/transactions/transactions";
import { SkeletonTable } from "@/app/components/ui/skeleton";

export default function TransactionsPage() {
  return (
    <Suspense fallback={<SkeletonTable rows={8} />}>
      <ViewTransactions />
    </Suspense>
  );
}

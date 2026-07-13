import { Suspense } from "react";
import { ViewProducts } from "@/app/views/products/products";
import { SkeletonTable } from "@/app/components/ui/skeleton";

export default function ProductsPage() {
  return (
    <Suspense fallback={<SkeletonTable rows={8} />}>
      <ViewProducts />
    </Suspense>
  );
}

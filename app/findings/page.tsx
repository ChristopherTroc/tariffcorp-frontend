import { Suspense } from "react";
import { ViewFindings } from "@/app/views/findings/findings";
import { SkeletonTable } from "@/app/components/ui/skeleton";

export default function FindingsPage() {
  return (
    <Suspense fallback={<SkeletonTable rows={10} />}>
      <ViewFindings />
    </Suspense>
  );
}

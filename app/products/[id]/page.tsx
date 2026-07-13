import { ViewProductDetail } from "@/app/views/products/product-detail";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;
  return <ViewProductDetail id={id} />;
}

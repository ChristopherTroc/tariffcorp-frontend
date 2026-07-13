import { ViewTransactionDetail } from "@/app/views/transactions/transaction-detail";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function TransactionDetailPage({ params }: Props) {
  const { id } = await params;
  return <ViewTransactionDetail id={id} />;
}

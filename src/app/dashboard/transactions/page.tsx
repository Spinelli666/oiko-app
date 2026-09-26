import Link from "next/link";
import { parseMonthReference } from "@/lib/transactions";
import { TransactionsContent } from "./transactions-content";

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ mes?: string }>;
}) {
  const { mes } = await searchParams;
  const monthReference = parseMonthReference(mes);

  return (
    <div className="flex flex-1 flex-col px-4 py-16">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
        <div className="flex justify-end">
          <Link
            href="/dashboard"
            className="w-fit rounded-md bg-primary px-4 py-2 font-medium text-white transition hover:bg-primary/90 active:scale-95"
          >
            Voltar
          </Link>
        </div>
        <TransactionsContent monthReference={monthReference} withMonthNav />
      </div>
    </div>
  );
}

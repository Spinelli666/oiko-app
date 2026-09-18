import Link from "next/link";
import { TransactionsContent } from "./transactions-content";

export default function TransacoesPage() {
  return (
    <div className="flex flex-1 flex-col px-4 py-16">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
        <div className="flex justify-end">
          <Link href="/dashboard" className="text-sm text-primary">
            Voltar ao dashboard
          </Link>
        </div>
        <TransactionsContent />
      </div>
    </div>
  );
}

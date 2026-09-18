import Link from "next/link";
import { OrcamentoContent } from "./orcamento-content";

export default function OrcamentoPage() {
  return (
    <div className="flex flex-1 flex-col px-4 py-16">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
        <div className="flex justify-end">
          <Link href="/dashboard" className="text-sm text-primary">
            Voltar ao dashboard
          </Link>
        </div>
        <OrcamentoContent />
      </div>
    </div>
  );
}

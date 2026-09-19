import Link from "next/link";
import { CategoriesContent } from "./categories-content";

export default function CategoriasPage() {
  return (
    <div className="flex flex-1 flex-col px-4 py-16">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <div className="flex justify-end">
          <Link href="/dashboard" className="text-sm text-primary">
            Voltar ao dashboard
          </Link>
        </div>
        <CategoriesContent />
      </div>
    </div>
  );
}

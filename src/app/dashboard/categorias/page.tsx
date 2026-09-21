import Link from "next/link";
import { CategoriesContent } from "./categories-content";

export default function CategoriasPage() {
  return (
    <div className="flex flex-1 flex-col px-4 py-16">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <div className="flex justify-end">
          <Link
            href="/dashboard"
            className="w-fit rounded-md bg-primary px-4 py-2 font-medium text-white hover:bg-primary/90"
          >
            Voltar
          </Link>
        </div>
        <CategoriesContent />
      </div>
    </div>
  );
}

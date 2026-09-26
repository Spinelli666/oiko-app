import Link from "next/link";
import { CategoriesContent } from "./categories-content";

export default function CategoriesPage() {
  return (
    <div className="flex flex-1 flex-col px-4 py-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4">
        <div className="flex justify-end">
          <Link
            href="/dashboard"
            className="w-fit rounded-md bg-primary px-4 py-2 font-medium text-white transition hover:bg-primary/90 active:scale-95"
          >
            Voltar
          </Link>
        </div>
        <CategoriesContent />
      </div>
    </div>
  );
}

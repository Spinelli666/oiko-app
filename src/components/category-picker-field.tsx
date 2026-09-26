"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { CategoryModel } from "@/generated/prisma/models/Category";
import { Dialog } from "@/components/dialog";

export function CategoryPickerField({
  id,
  name,
  categories,
  defaultCategoryId,
}: {
  id?: string;
  name: string;
  categories: CategoryModel[];
  defaultCategoryId?: string;
}) {
  const initialId = defaultCategoryId ?? categories[0]?.id ?? "";
  const [selectedId, setSelectedId] = useState(initialId);
  const [isOpen, setIsOpen] = useState(false);
  const hiddenRef = useRef<HTMLInputElement>(null);

  // Um <input type="hidden"> controlado não volta ao valor inicial quando o
  // form nativo é resetado (form.reset() não dispara re-render do React),
  // então escuta o evento "reset" do próprio form para sincronizar o estado.
  useEffect(() => {
    const form = hiddenRef.current?.form;
    if (!form) return;
    function handleReset() {
      setSelectedId(initialId);
    }
    form.addEventListener("reset", handleReset);
    return () => form.removeEventListener("reset", handleReset);
  }, [initialId]);

  const selected = categories.find((category) => category.id === selectedId);
  const receitas = categories.filter((category) => category.kind === "RECEITA");
  const despesas = categories.filter((category) => category.kind === "DESPESA");

  function select(categoryId: string) {
    setSelectedId(categoryId);
    setIsOpen(false);
  }

  return (
    <>
      <input ref={hiddenRef} type="hidden" name={name} value={selectedId} readOnly />
      <button
        type="button"
        id={id}
        onClick={() => setIsOpen(true)}
        className="flex cursor-pointer items-center justify-between rounded-md border border-text-secondary/30 bg-surface px-3 py-2 text-left outline-none transition hover:bg-text-secondary/10 focus:border-primary active:scale-[0.99]"
      >
        {selected ? (
          <span className={selected.kind === "RECEITA" ? "text-success" : "text-alert"}>
            {selected.name}
          </span>
        ) : (
          <span className="text-text-secondary">Selecione uma categoria</span>
        )}
        <Image
          src="/icon-chevron.svg"
          alt=""
          width={12}
          height={12}
          className="shrink-0 opacity-60"
        />
      </button>

      {isOpen && (
        <Dialog onClose={() => setIsOpen(false)}>
          <h2 className="mb-4 text-lg font-semibold">Categoria</h2>
          <div className="flex flex-col gap-4">
            {receitas.length > 0 && (
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium text-text-secondary">Receitas</p>
                <ul className="flex flex-col">
                  {receitas.map((category) => (
                    <li key={category.id}>
                      <button
                        type="button"
                        onClick={() => select(category.id)}
                        className={`w-full cursor-pointer rounded-md px-3 py-2 text-left text-success transition hover:bg-success/10 active:scale-[0.99] ${
                          category.id === selectedId ? "bg-success/10 font-medium" : ""
                        }`}
                      >
                        {category.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {despesas.length > 0 && (
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium text-text-secondary">Despesas</p>
                <ul className="flex flex-col">
                  {despesas.map((category) => (
                    <li key={category.id}>
                      <button
                        type="button"
                        onClick={() => select(category.id)}
                        className={`w-full cursor-pointer rounded-md px-3 py-2 text-left text-alert transition hover:bg-alert/10 active:scale-[0.99] ${
                          category.id === selectedId ? "bg-alert/10 font-medium" : ""
                        }`}
                      >
                        {category.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Dialog>
      )}
    </>
  );
}

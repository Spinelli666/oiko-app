"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

export function Modal({ children }: { children: ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        router.back();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [router]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
      <button
        type="button"
        aria-label="Fechar"
        onClick={() => router.back()}
        className="fixed inset-0 bg-black/50"
      />
      <div className="relative z-10 max-h-full w-full max-w-2xl overflow-y-auto rounded-lg border border-text-secondary/20 bg-surface p-6 shadow-lg">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Fechar"
          className="absolute right-4 top-4 text-text-secondary hover:text-foreground"
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}

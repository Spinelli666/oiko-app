"use client";

import { useEffect, type ReactNode } from "react";

export function Dialog({
  children,
  onClose,
}: {
  children: ReactNode;
  onClose: () => void;
}) {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
      <button
        type="button"
        aria-label="Fechar"
        onClick={onClose}
        className="fixed inset-0 bg-black/50"
      />
      <div className="relative z-10 max-h-full w-full max-w-md overflow-y-auto rounded-lg border border-text-secondary/20 bg-surface p-6 shadow-lg">
        <button
          type="button"
          onClick={onClose}
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

"use client";

import { useActionState } from "react";
import Link from "next/link";
import { submitFormOnEnter } from "@/lib/forms";
import { registerAction } from "./actions";

export function RegisterForm() {
  const [state, formAction, isPending] = useActionState(
    registerAction,
    undefined
  );

  return (
    <form action={formAction} className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="name" className="text-sm font-medium">
          Nome
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          autoComplete="name"
          onKeyDown={submitFormOnEnter}
          className="rounded-md border border-text-secondary/30 bg-surface px-3 py-2 outline-none focus:border-primary"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm font-medium">
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          onKeyDown={submitFormOnEnter}
          className="rounded-md border border-text-secondary/30 bg-surface px-3 py-2 outline-none focus:border-primary"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-sm font-medium">
          Senha
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          onKeyDown={submitFormOnEnter}
          className="rounded-md border border-text-secondary/30 bg-surface px-3 py-2 outline-none focus:border-primary"
        />
        <span className="text-xs text-text-secondary">Mínimo 8 caracteres.</span>
      </div>

      {state?.error && (
        <p className="text-sm text-alert" role="alert">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="mt-2 rounded-md bg-primary px-4 py-2 font-medium text-white transition-opacity disabled:opacity-60"
      >
        {isPending ? "Criando conta..." : "Criar conta"}
      </button>

      <p className="text-center text-sm text-text-secondary">
        Já tem conta?{" "}
        <Link href="/login" className="font-medium text-primary">
          Entrar
        </Link>
      </p>
    </form>
  );
}

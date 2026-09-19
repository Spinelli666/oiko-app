"use client";

import { useActionState } from "react";
import Link from "next/link";
import { submitFormOnEnter } from "@/lib/forms";
import { loginAction } from "./actions";

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(
    loginAction,
    undefined
  );

  return (
    <form action={formAction} className="flex w-full flex-col gap-4">
      <input type="hidden" name="redirectTo" value="/dashboard" />

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
          autoComplete="current-password"
          onKeyDown={submitFormOnEnter}
          className="rounded-md border border-text-secondary/30 bg-surface px-3 py-2 outline-none focus:border-primary"
        />
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
        {isPending ? "Entrando..." : "Entrar"}
      </button>

      <p className="text-center text-sm text-text-secondary">
        Ainda não tem conta?{" "}
        <Link href="/cadastro" className="font-medium text-primary">
          Cadastre-se
        </Link>
      </p>
    </form>
  );
}

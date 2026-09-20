import Image from "next/image";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm rounded-lg border border-text-secondary/20 bg-surface p-8 shadow-sm">
        <Image
          src="/logo.svg"
          alt="Oiko"
          width={350}
          height={120}
          className="mx-auto mb-6 h-20 w-auto"
          priority
        />
        <h1 className="mb-1 text-2xl font-semibold">Entrar</h1>
        <p className="mb-6 text-sm text-text-secondary">
          Controle suas finanças pessoais.
        </p>
        <LoginForm />
      </div>
    </div>
  );
}

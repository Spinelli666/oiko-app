import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { OikoLogo } from "@/components/oiko-logo";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm rounded-lg border border-text-secondary/20 bg-surface p-8 shadow-sm">
        <OikoLogo className="mx-auto mb-6 h-20 w-auto text-primary" />
        <h1 className="mb-1 text-2xl font-semibold">Entrar</h1>
        <p className="mb-6 text-sm text-text-secondary">
          Controle suas finanças pessoais.
        </p>
        <LoginForm />
      </div>
    </div>
  );
}

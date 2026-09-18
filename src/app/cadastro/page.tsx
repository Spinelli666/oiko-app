import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { OikoLogo } from "@/components/oiko-logo";
import { RegisterForm } from "./register-form";

export default async function CadastroPage() {
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm rounded-lg border border-text-secondary/20 bg-surface p-8 shadow-sm">
        <OikoLogo className="mx-auto mb-6 h-20 w-auto text-primary" />
        <h1 className="mb-1 text-2xl font-semibold">Criar conta</h1>
        <p className="mb-6 text-sm text-text-secondary">
          Comece a controlar suas finanças pessoais.
        </p>
        <RegisterForm />
      </div>
    </div>
  );
}

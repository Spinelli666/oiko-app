import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function Home() {
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4 text-center">
      <Image src="/logo.svg" alt="Oiko" width={350} height={120} className="h-20 w-auto" priority />
      <p className="max-w-md text-text-secondary">
        Controle de receitas, despesas e orçamento — de um jeito simples,
        evoluindo aos poucos.
      </p>
      <div className="flex gap-4">
        <Link
          href="/login"
          className="rounded-md bg-primary px-5 py-2 font-medium text-white"
        >
          Entrar
        </Link>
        <Link
          href="/register"
          className="rounded-md border border-text-secondary/30 px-5 py-2 font-medium"
        >
          Criar conta
        </Link>
      </div>
    </div>
  );
}

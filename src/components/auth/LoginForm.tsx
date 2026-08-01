"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction } from "@/server/auth/actions";
import { Input } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { FormError } from "@/components/ui/FormError";

export function LoginForm() {
  const [state, formAction] = useActionState(loginAction, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <Input label="Email" name="email" type="email" autoComplete="email" required />
      <Input label="Senha" name="password" type="password" autoComplete="current-password" required />
      <FormError message={state?.error} />
      <SubmitButton className="w-full" pendingText="Entrando...">
        Entrar
      </SubmitButton>
      <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
        Não tem conta?{" "}
        <Link href="/signup" className="font-medium text-indigo-600 hover:underline dark:text-indigo-400">
          Criar conta
        </Link>
      </p>
    </form>
  );
}

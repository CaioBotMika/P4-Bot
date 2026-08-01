"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signupAction } from "@/server/auth/actions";
import { Input } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { FormError } from "@/components/ui/FormError";

export function SignupForm() {
  const [state, formAction] = useActionState(signupAction, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <Input label="Nome" name="name" type="text" autoComplete="name" required />
      <Input label="Email" name="email" type="email" autoComplete="email" required />
      <Input
        label="Senha"
        name="password"
        type="password"
        autoComplete="new-password"
        minLength={6}
        required
      />
      <FormError message={state?.error} />
      <SubmitButton className="w-full" pendingText="Criando conta...">
        Criar conta
      </SubmitButton>
      <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
        Já tem conta?{" "}
        <Link href="/login" className="font-medium text-indigo-600 hover:underline dark:text-indigo-400">
          Entrar
        </Link>
      </p>
    </form>
  );
}

import { Card } from "@/components/ui/Card";
import { SignupForm } from "@/components/auth/SignupForm";

export default function SignupPage() {
  return (
    <Card>
      <h1 className="mb-1 text-xl font-semibold text-zinc-900 dark:text-zinc-50">Criar conta</h1>
      <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
        Sua conta terá acesso aos espaços compartilhados Pessoal e Empresa, geridos em conjunto por
        todos os usuários do sistema.
      </p>
      <SignupForm />
    </Card>
  );
}

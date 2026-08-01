import { Card } from "@/components/ui/Card";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <Card>
      <h1 className="mb-1 text-xl font-semibold text-zinc-900 dark:text-zinc-50">Entrar</h1>
      <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
        Acesse suas contas pessoais e da empresa.
      </p>
      <LoginForm />
    </Card>
  );
}

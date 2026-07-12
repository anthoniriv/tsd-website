import { Suspense } from "react";
import { LoginForm } from "@/components/admin/login-form";

export default function LoginPage() {
  return (
    <div className="grid min-h-screen place-items-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="text-center text-2xl font-black tracking-tight text-text-main">
          TDS <span className="text-brand">Panel</span>
        </h1>
        <p className="mt-1 text-center text-sm text-text-muted">
          Acceso restringido al equipo de TDS.
        </p>

        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}

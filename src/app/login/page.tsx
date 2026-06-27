import { AuthPanel } from "@/components/auth-panel";
import { LoginForm } from "@/components/auth/login-form";
import Link from "next/link";

export default function LoginPage() {
  return (
    <AuthPanel
      eyebrow="Acceso interno"
      title="Ingresa a tu espacio documental"
      description="Accede al panel para revisar tu organizacion, atender clientes y mantener cada solicitud documental bajo control."
      footer={
        <>
          No tienes cuenta?{" "}
          <Link className="font-medium text-cyan-100 hover:text-white" href="/register">
            Crear cuenta
          </Link>
        </>
      }
    >
      <LoginForm />
    </AuthPanel>
  );
}

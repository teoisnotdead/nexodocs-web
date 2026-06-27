import { AuthPanel } from "@/components/auth-panel";
import { RegisterForm } from "@/components/auth/register-form";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <AuthPanel
      eyebrow="Nueva organizacion"
      title="Crea tu cuenta"
      description="Abre el espacio de trabajo de tu organizacion y comienza a ordenar la recepcion, revision y entrega de documentos."
      footer={
        <>
          Ya tienes cuenta?{" "}
          <Link className="font-medium text-cyan-100 hover:text-white" href="/login">
            Ingresar
          </Link>
        </>
      }
    >
      <RegisterForm />
    </AuthPanel>
  );
}

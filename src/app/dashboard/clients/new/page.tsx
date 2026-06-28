import { ClientForm } from "@/components/clients/client-form";
import { DashboardShell } from "@/components/dashboard-shell";
import { getCurrentUser } from "@/lib/api/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function NewClientPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <DashboardShell
      organizationName={user.organization.name}
      userName={user.name}
      userEmail={user.email}
      activePath="/dashboard/clients"
      breadcrumbs={[
        { label: "Inicio", href: "/dashboard" },
        { label: "Clientes", href: "/dashboard/clients" },
        { label: "Nuevo" },
      ]}
    >
      <section className="mx-auto max-w-5xl space-y-6">
        <div>
          <p className="text-sm font-medium text-cyan-100">Clientes</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-normal text-balance md:text-3xl">
            Nuevo cliente
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/60">
            Crea el cliente con lo minimo y completa los datos comerciales o
            contactos cuando los necesites.
          </p>
        </div>

        <ClientForm mode="create" />
      </section>
    </DashboardShell>
  );
}

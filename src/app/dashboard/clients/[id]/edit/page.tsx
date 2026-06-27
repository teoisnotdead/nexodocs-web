import { ClientForm } from "@/components/clients/client-form";
import { DashboardShell } from "@/components/dashboard-shell";
import { getCurrentUser, serverApiFetch } from "@/lib/api/server";
import type { Client } from "@/lib/api/types";
import { notFound, redirect } from "next/navigation";

export const dynamic = "force-dynamic";

type EditClientPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditClientPage({ params }: EditClientPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const { id } = await params;
  const client = await getClient(id);

  if (!client) {
    notFound();
  }

  return (
    <DashboardShell
      organizationName={user.organization.name}
      userName={user.name}
      userEmail={user.email}
      activePath="/dashboard/clients"
    >
      <section className="mx-auto max-w-5xl space-y-6">
        <div>
          <p className="text-sm font-medium text-cyan-100">Clientes</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-normal text-balance md:text-3xl">
            Editar {client.name}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/60">
            Actualiza los datos comerciales y el contacto principal.
          </p>
        </div>

        <ClientForm mode="edit" client={client} />
      </section>
    </DashboardShell>
  );
}

async function getClient(id: string) {
  try {
    return await serverApiFetch<Client>(`/clients/${id}`);
  } catch {
    return null;
  }
}

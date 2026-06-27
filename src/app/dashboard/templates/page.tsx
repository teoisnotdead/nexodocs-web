import { ChecklistTemplateForm } from "@/components/checklist-templates/checklist-template-form";
import { DashboardShell } from "@/components/dashboard-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser, serverApiFetch } from "@/lib/api/server";
import type {
  ChecklistTemplate,
  ChecklistTemplateListResponse,
} from "@/lib/api/types";
import { BookTemplate, CheckCircle2, ClipboardList } from "lucide-react";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function TemplatesPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const data = await serverApiFetch<ChecklistTemplateListResponse>(
    "/checklist-templates",
  );

  const totalItems = data.items.reduce(
    (total, template) => total + template._count.items,
    0,
  );

  return (
    <DashboardShell
      organizationName={user.organization.name}
      userName={user.name}
      userEmail={user.email}
      activePath="/dashboard/templates"
    >
      <section className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-medium text-cyan-100">Plantillas</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-normal text-balance md:text-3xl">
              Listas reutilizables
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/60">
              Estandariza solicitudes frecuentes y prepara nuevos procesos con
              menos pasos manuales.
            </p>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <Summary
            icon={BookTemplate}
            label="Plantillas"
            value={data.items.length}
          />
          <Summary icon={ClipboardList} label="Documentos base" value={totalItems} />
          <Summary
            icon={CheckCircle2}
            label="Aplicaciones"
            value={data.items.reduce(
              (total, template) => total + template._count.checklists,
              0,
            )}
          />
        </div>

        <div className="grid gap-5 lg:grid-cols-[1fr_24rem]">
          <Card className="glass-card rounded-md">
            <CardHeader>
              <CardTitle className="text-base tracking-normal text-white">
                Biblioteca de plantillas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TemplateList templates={data.items} />
            </CardContent>
          </Card>

          <ChecklistTemplateForm />
        </div>
      </section>
    </DashboardShell>
  );
}

function TemplateList({ templates }: { templates: ChecklistTemplate[] }) {
  if (templates.length === 0) {
    return (
      <div className="rounded-md border border-white/10 bg-white/[0.04] p-8 text-center">
        <p className="text-sm font-medium text-white">Aun no hay plantillas</p>
        <p className="mt-2 text-sm text-white/60">
          Guarda una primera lista para reutilizarla en tus procesos.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {templates.map((template) => (
        <article
          key={template.id}
          className="rounded-md border border-white/10 bg-white/[0.04] p-4"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-white">
                {template.name}
              </h2>
              <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/60">
                {template.description ??
                  "Lista preparada para iniciar solicitudes recurrentes."}
              </p>
            </div>
            <Badge className="w-fit rounded-md border-cyan-200/20 bg-cyan-200/10 text-cyan-100">
              {template._count.items} documentos
            </Badge>
          </div>

          <div className="mt-4 grid gap-2">
            {template.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 rounded-md bg-white/[0.04] px-3 py-2"
              >
                <span className="truncate text-sm text-white/75">
                  {item.title}
                </span>
                <span className="shrink-0 text-xs text-white/45">
                  {item.required ? "Requerido" : "Opcional"}
                </span>
              </div>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}

function Summary({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof BookTemplate;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-md border border-white/10 bg-white/[0.05] px-4 py-3">
      <div className="flex items-center gap-2 text-xs uppercase text-white/45">
        <Icon className="size-4 text-cyan-100/70" />
        <span>{label}</span>
      </div>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}

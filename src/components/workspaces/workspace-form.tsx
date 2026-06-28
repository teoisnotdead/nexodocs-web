"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  workspaceStatusOptions,
  workspaceTypeOptions,
} from "@/components/workspaces/workspace-status";
import { ApiError, apiFetch } from "@/lib/api/client";
import type { Client, Workspace } from "@/lib/api/types";
import {
  type WorkspaceFormInput,
  workspaceFormSchema,
} from "@/lib/schemas/workspace.schema";
import { cn } from "@/lib/utils";

const inputClassName =
  "h-11 w-full rounded-md border border-white/12 bg-white/[0.07] px-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-cyan-300/60 focus:ring-3 focus:ring-cyan-300/20";
const textareaClassName =
  "min-h-28 w-full rounded-md border border-white/12 bg-white/[0.07] px-3 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-cyan-300/60 focus:ring-3 focus:ring-cyan-300/20";

type WorkspaceFormProps = {
  mode: "create" | "edit";
  clients: Client[];
  workspace?: Workspace;
};

export function WorkspaceForm({ mode, clients, workspace }: WorkspaceFormProps) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<WorkspaceFormInput>({
    resolver: zodResolver(workspaceFormSchema),
    defaultValues: {
      clientId: workspace?.clientId ?? clients[0]?.id ?? "",
      name: workspace?.name ?? "",
      description: workspace?.description ?? "",
      workspaceType: workspace?.workspaceType ?? "GENERIC_PROCESS",
      periodYear: workspace?.periodYear ? String(workspace.periodYear) : "",
      periodMonth: workspace?.periodMonth ? String(workspace.periodMonth) : "",
      dueDate: workspace?.dueDate ? workspace.dueDate.slice(0, 10) : "",
      status: workspace?.status ?? "DRAFT",
    },
  });

  async function onSubmit(values: WorkspaceFormInput) {
    setFormError(null);

    try {
      const saved = await apiFetch<Workspace>(
        mode === "create" ? "/workspaces" : `/workspaces/${workspace!.id}`,
        {
          method: mode === "create" ? "POST" : "PATCH",
          body: toWorkspacePayload(values),
        },
      );
      router.replace(`/dashboard/workspaces/${saved.id}`);
      router.refresh();
    } catch (error) {
      setFormError(
        error instanceof ApiError
          ? error.message
          : "No pudimos guardar el proceso.",
      );
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
      <div className="glass-card rounded-md p-5">
        <div className="mb-5">
          <h2 className="text-base font-semibold text-white">
            Datos del proceso
          </h2>
          <p className="mt-1 text-sm text-white/60">
            Define el espacio de trabajo y el cliente asociado.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Cliente" error={errors.clientId?.message}>
            <select className={inputClassName} {...register("clientId")}>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Estado" error={errors.status?.message}>
            <select className={inputClassName} {...register("status")}>
              {workspaceStatusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Nombre del proceso" error={errors.name?.message}>
            <input className={inputClassName} {...register("name")} />
          </Field>
          <Field label="Tipo de proceso" error={errors.workspaceType?.message}>
            <select className={inputClassName} {...register("workspaceType")}>
              {workspaceTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>
          <Field
            className="md:col-span-2"
            label="Descripcion"
            error={errors.description?.message}
          >
            <textarea className={textareaClassName} {...register("description")} />
          </Field>
        </div>
      </div>

      <div className="glass-card rounded-md p-5">
        <div className="mb-5">
          <h2 className="text-base font-semibold text-white">
            Seguimiento
          </h2>
          <p className="mt-1 text-sm text-white/60">
            Agrega periodo y fecha limite solo cuando aporten contexto.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Anio" error={errors.periodYear?.message}>
            <input
              className={inputClassName}
              inputMode="numeric"
              placeholder="2026"
              {...register("periodYear")}
            />
          </Field>
          <Field label="Mes" error={errors.periodMonth?.message}>
            <input
              className={inputClassName}
              inputMode="numeric"
              placeholder="4"
              {...register("periodMonth")}
            />
          </Field>
          <Field label="Fecha limite" error={errors.dueDate?.message}>
            <input className={inputClassName} type="date" {...register("dueDate")} />
          </Field>
        </div>
      </div>

      {formError ? (
        <div className="rounded-md border border-rose-300/20 bg-rose-300/10 px-4 py-3 text-sm text-rose-100">
          {formError}
        </div>
      ) : null}

      <div className="flex justify-end">
        <Button type="submit" className="h-10 rounded-md" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          Guardar proceso
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  error,
  children,
  className,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("grid gap-2", className)}>
      <span className="text-sm font-medium text-white/70">{label}</span>
      {children}
      {error ? <span className="text-xs text-rose-200">{error}</span> : null}
    </label>
  );
}

function toWorkspacePayload(values: WorkspaceFormInput) {
  return {
    clientId: values.clientId,
    name: values.name,
    description: values.description,
    workspaceType: values.workspaceType,
    periodYear: values.periodYear ? Number(values.periodYear) : undefined,
    periodMonth: values.periodMonth ? Number(values.periodMonth) : undefined,
    dueDate: values.dueDate,
    status: values.status,
  };
}

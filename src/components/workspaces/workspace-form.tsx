"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
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
const selectTriggerClassName =
  "h-11 w-full rounded-md border-white/12 bg-white/[0.07] px-3 text-white hover:bg-white/[0.1] focus-visible:border-cyan-300/60 focus-visible:ring-cyan-300/20";
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
    control,
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
  const clientItems = clients.map((client) => ({
    value: client.id,
    label: client.name,
  }));

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
            <Controller
              control={control}
              name="clientId"
              render={({ field }) => (
                <Select
                  items={clientItems}
                  name={field.name}
                  value={field.value}
                  onValueChange={(nextValue) => {
                    if (nextValue) {
                      field.onChange(nextValue);
                    }
                  }}
                >
                  <SelectTrigger className={selectTriggerClassName}>
                    <SelectValue placeholder="Selecciona un cliente" />
                  </SelectTrigger>
                  <SelectContent align="start">
                    {clientItems.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>
          <Field label="Estado" error={errors.status?.message}>
            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <Select
                  items={workspaceStatusOptions}
                  name={field.name}
                  value={field.value}
                  onValueChange={(nextValue) => {
                    if (nextValue) {
                      field.onChange(nextValue);
                    }
                  }}
                >
                  <SelectTrigger className={selectTriggerClassName}>
                    <SelectValue placeholder="Selecciona un estado" />
                  </SelectTrigger>
                  <SelectContent align="start">
                    {workspaceStatusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>
          <Field label="Nombre del proceso" error={errors.name?.message}>
            <Input className={inputClassName} {...register("name")} />
          </Field>
          <Field label="Tipo de proceso" error={errors.workspaceType?.message}>
            <Controller
              control={control}
              name="workspaceType"
              render={({ field }) => (
                <Select
                  items={workspaceTypeOptions}
                  name={field.name}
                  value={field.value}
                  onValueChange={(nextValue) => {
                    if (nextValue) {
                      field.onChange(nextValue);
                    }
                  }}
                >
                  <SelectTrigger className={selectTriggerClassName}>
                    <SelectValue placeholder="Selecciona un tipo" />
                  </SelectTrigger>
                  <SelectContent align="start">
                    {workspaceTypeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>
          <Field
            className="md:col-span-2"
            label="Descripcion"
            error={errors.description?.message}
          >
            <Textarea className={textareaClassName} {...register("description")} />
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
            <Input
              className={inputClassName}
              inputMode="numeric"
              placeholder="2026"
              {...register("periodYear")}
            />
          </Field>
          <Field label="Mes" error={errors.periodMonth?.message}>
            <Input
              className={inputClassName}
              inputMode="numeric"
              placeholder="4"
              {...register("periodMonth")}
            />
          </Field>
          <Field label="Fecha limite" error={errors.dueDate?.message}>
            <Controller
              control={control}
              name="dueDate"
              render={({ field }) => (
                <DatePicker
                  value={field.value}
                  onChange={field.onChange}
                  className={inputClassName}
                />
              )}
            />
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

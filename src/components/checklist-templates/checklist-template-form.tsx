"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { FilePlus2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ApiError, apiFetch } from "@/lib/api/client";
import type { ChecklistTemplate } from "@/lib/api/types";
import {
  checklistTemplateFormSchema,
  type ChecklistTemplateFormInput,
} from "@/lib/schemas/checklist-template.schema";
import { cn } from "@/lib/utils";

const inputClassName =
  "h-11 w-full rounded-md border border-white/12 bg-white/[0.07] px-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-cyan-300/60 focus:ring-3 focus:ring-cyan-300/20";
const textareaClassName =
  "min-h-32 w-full rounded-md border border-white/12 bg-white/[0.07] px-3 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-cyan-300/60 focus:ring-3 focus:ring-cyan-300/20";

export function ChecklistTemplateForm() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChecklistTemplateFormInput>({
    resolver: zodResolver(checklistTemplateFormSchema),
    defaultValues: {
      name: "",
      description: "",
      items: "",
    },
  });

  async function onSubmit(values: ChecklistTemplateFormInput) {
    setFormError(null);

    try {
      await apiFetch<ChecklistTemplate>("/checklist-templates", {
        method: "POST",
        body: {
          name: values.name,
          description: values.description,
          items: values.items
            .split("\n")
            .map((item) => item.trim())
            .filter(Boolean)
            .map((title) => ({ title, required: true })),
        },
      });
      reset();
      router.refresh();
    } catch (error) {
      setFormError(
        error instanceof ApiError
          ? error.message
          : "No pudimos guardar la plantilla.",
      );
    }
  }

  return (
    <form className="glass-card rounded-md p-5" onSubmit={handleSubmit(onSubmit)}>
      <div className="mb-5">
        <h2 className="text-base font-semibold text-white">Nueva plantilla</h2>
        <p className="mt-1 text-sm leading-6 text-white/60">
          Guarda una lista reutilizable para iniciar solicitudes con mayor
          consistencia.
        </p>
      </div>

      <div className="grid gap-4">
        <Field label="Nombre" error={errors.name?.message}>
          <Input
            className={inputClassName}
            placeholder="Cierre mensual"
            {...register("name")}
          />
        </Field>

        <Field label="Descripcion" error={errors.description?.message}>
          <Textarea
            className={cn(textareaClassName, "min-h-24")}
            placeholder="Uso recomendado de esta lista"
            {...register("description")}
          />
        </Field>

        <Field label="Documentos" error={errors.items?.message}>
          <Textarea
            className={textareaClassName}
            placeholder={"Facturas de compra\nFacturas de venta\nCartola bancaria"}
            {...register("items")}
          />
        </Field>
      </div>

      {formError ? (
        <div className="mt-4 rounded-md border border-rose-300/20 bg-rose-300/10 px-4 py-3 text-sm text-rose-100">
          {formError}
        </div>
      ) : null}

      <div className="mt-5 flex justify-end">
        <Button type="submit" className="h-10 rounded-md" disabled={isSubmitting}>
          {isSubmitting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <FilePlus2 className="size-4" />
          )}
          Guardar plantilla
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-white/70">{label}</span>
      {children}
      {error ? <span className="text-xs text-rose-200">{error}</span> : null}
    </label>
  );
}

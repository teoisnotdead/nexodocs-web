"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus } from "lucide-react";
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
import { ApiError, apiFetch } from "@/lib/api/client";
import type { ClientContact, DocumentRequest } from "@/lib/api/types";
import {
  type DocumentRequestFormInput,
  documentRequestFormSchema,
} from "@/lib/schemas/document-request.schema";
import { cn } from "@/lib/utils";

const inputClassName =
  "h-11 w-full rounded-md border border-white/12 bg-white/[0.07] px-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-cyan-300/60 focus:ring-3 focus:ring-cyan-300/20";
const selectTriggerClassName =
  "h-11 w-full rounded-md border-white/12 bg-white/[0.07] px-3 text-white hover:bg-white/[0.1] focus-visible:border-cyan-300/60 focus-visible:ring-cyan-300/20";
const textareaClassName =
  "min-h-24 w-full rounded-md border border-white/12 bg-white/[0.07] px-3 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-cyan-300/60 focus:ring-3 focus:ring-cyan-300/20";

type DocumentRequestFormProps = {
  workspaceId: string;
  contacts: ClientContact[];
};

export function DocumentRequestForm({
  workspaceId,
  contacts,
}: DocumentRequestFormProps) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DocumentRequestFormInput>({
    resolver: zodResolver(documentRequestFormSchema),
    defaultValues: {
      title: "",
      description: "",
      dueDate: "",
      assignedClientContactId: "",
    },
  });
  const contactItems = [
    { value: "", label: "Sin contacto asignado" },
    ...contacts.map((contact) => ({
      value: contact.id,
      label: contact.name,
    })),
  ];

  async function onSubmit(values: DocumentRequestFormInput) {
    setFormError(null);

    try {
      await apiFetch<DocumentRequest>(
        `/workspaces/${workspaceId}/document-requests`,
        {
          method: "POST",
          body: {
            title: values.title,
            description: values.description,
            required: true,
            dueDate: values.dueDate,
            assignedClientContactId: values.assignedClientContactId,
          },
        },
      );
      reset({
        title: "",
        description: "",
        dueDate: "",
        assignedClientContactId: "",
      });
      router.refresh();
    } catch (error) {
      setFormError(
        error instanceof ApiError
          ? error.message
          : "No pudimos crear la solicitud.",
      );
    }
  }

  return (
    <form
      className="rounded-md border border-white/10 bg-white/[0.04] p-4"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-white">Nueva solicitud</h3>
        <p className="mt-1 text-sm text-white/60">
          Pide un documento o antecedente puntual para este proceso.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Titulo" error={errors.title?.message}>
          <Input className={inputClassName} {...register("title")} />
        </Field>
        <Field label="Contacto asignado" error={errors.assignedClientContactId?.message}>
          <Controller
            control={control}
            name="assignedClientContactId"
            render={({ field }) => (
              <Select
                items={contactItems}
                name={field.name}
                value={field.value ?? ""}
                onValueChange={(nextValue) => field.onChange(nextValue ?? "")}
              >
                <SelectTrigger className={selectTriggerClassName}>
                  <SelectValue placeholder="Sin contacto asignado" />
                </SelectTrigger>
                <SelectContent align="start">
                  {contactItems.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
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
        <Field
          className="md:col-span-2"
          label="Descripcion"
          error={errors.description?.message}
        >
          <Textarea className={textareaClassName} {...register("description")} />
        </Field>
      </div>

      {formError ? (
        <div className="mt-4 rounded-md border border-rose-300/20 bg-rose-300/10 px-4 py-3 text-sm text-rose-100">
          {formError}
        </div>
      ) : null}

      <div className="mt-4 flex justify-end">
        <Button type="submit" className="h-10 rounded-md" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
          Crear solicitud
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
    <label className={cn("grid content-start gap-2", className)}>
      <span className="text-sm font-medium text-white/70">{label}</span>
      {children}
      {error ? <span className="text-xs text-rose-200">{error}</span> : null}
    </label>
  );
}

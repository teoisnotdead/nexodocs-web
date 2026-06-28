"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarDays, Loader2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { ApiError, apiFetch } from "@/lib/api/client";
import type { ClientContact, DocumentRequest } from "@/lib/api/types";
import {
  type DocumentRequestFormInput,
  documentRequestFormSchema,
} from "@/lib/schemas/document-request.schema";
import { cn } from "@/lib/utils";

const inputClassName =
  "h-11 w-full rounded-md border border-white/12 bg-white/[0.07] px-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-cyan-300/60 focus:ring-3 focus:ring-cyan-300/20";
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
  const [dueDate, setDueDate] = useState("");
  const dueDateInputRef = useRef<HTMLInputElement | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DocumentRequestFormInput>({
    resolver: zodResolver(documentRequestFormSchema),
    defaultValues: {
      title: "",
      description: "",
      required: true,
      dueDate: "",
      assignedClientContactId: "",
    },
  });
  const dueDateRegistration = register("dueDate", {
    onChange: (event) => setDueDate(event.target.value),
  });

  function openDueDatePicker() {
    const input = dueDateInputRef.current;

    if (input?.showPicker) {
      input.showPicker();
      return;
    }

    input?.focus();
  }

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
            required: values.required,
            dueDate: values.dueDate,
            assignedClientContactId: values.assignedClientContactId,
          },
        },
      );
      reset({
        title: "",
        description: "",
        required: true,
        dueDate: "",
        assignedClientContactId: "",
      });
      setDueDate("");
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
          <input className={inputClassName} {...register("title")} />
        </Field>
        <Field label="Contacto asignado" error={errors.assignedClientContactId?.message}>
          <select className={inputClassName} {...register("assignedClientContactId")}>
            <option value="">Sin contacto asignado</option>
            {contacts.map((contact) => (
              <option key={contact.id} value={contact.id}>
                {contact.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Fecha limite" error={errors.dueDate?.message}>
          <input
            {...dueDateRegistration}
            ref={(element) => {
              dueDateRegistration.ref(element);
              dueDateInputRef.current = element;
            }}
            className="sr-only"
            tabIndex={-1}
            type="date"
          />
          <Button
            type="button"
            variant="outline"
            className={cn(
              inputClassName,
              "justify-start gap-2 border-white/12 bg-white/[0.07] text-left font-normal text-white hover:bg-white/[0.1]",
              !dueDate && "text-white/80",
            )}
            onClick={openDueDatePicker}
          >
            <CalendarDays className="size-4 text-cyan-100" />
            {dueDate ? formatDateInput(dueDate) : "dd-mm-yyyy"}
          </Button>
        </Field>
        <label className="flex min-h-11 items-center gap-3 text-sm text-white/75 md:mt-7">
          <input
            className="size-4 accent-cyan-200"
            type="checkbox"
            {...register("required")}
          />
          Requerido para completar el proceso
        </label>
        <Field
          className="md:col-span-2"
          label="Descripcion"
          error={errors.description?.message}
        >
          <textarea className={textareaClassName} {...register("description")} />
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

function formatDateInput(value: string) {
  const [year, month, day] = value.split("-");

  return year && month && day ? `${day}-${month}-${year}` : value;
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

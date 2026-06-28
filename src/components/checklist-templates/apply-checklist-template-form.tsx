"use client";

import { BookTemplate, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ApiError, apiFetch } from "@/lib/api/client";
import type {
  AppliedChecklist,
  ChecklistTemplate,
  ClientContact,
} from "@/lib/api/types";

const selectClassName =
  "h-10 w-full rounded-md border-white/12 bg-white/[0.07] px-3 text-white hover:bg-white/[0.1] focus-visible:border-cyan-300/60 focus-visible:ring-cyan-300/20";

type ApplyChecklistTemplateFormProps = {
  workspaceId: string;
  templates: ChecklistTemplate[];
  contacts: ClientContact[];
};

export function ApplyChecklistTemplateForm({
  workspaceId,
  templates,
  contacts,
}: ApplyChecklistTemplateFormProps) {
  const router = useRouter();
  const [templateId, setTemplateId] = useState(templates[0]?.id ?? "");
  const [assignedClientContactId, setAssignedClientContactId] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const templateItems =
    templates.length === 0
      ? [{ value: "", label: "Sin plantillas disponibles" }]
      : templates.map((template) => ({
          value: template.id,
          label: template.name,
        }));
  const contactItems = [
    { value: "", label: "Sin contacto asignado" },
    ...contacts.map((contact) => ({
      value: contact.id,
      label: contact.name,
    })),
  ];

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!templateId) {
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      await apiFetch<AppliedChecklist>(
        `/workspaces/${workspaceId}/apply-template`,
        {
          method: "POST",
          body: {
            templateId,
            assignedClientContactId: assignedClientContactId || undefined,
          },
        },
      );
      router.refresh();
    } catch (error) {
      setFormError(
        error instanceof ApiError
          ? error.message
          : "No pudimos aplicar la plantilla.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      className="rounded-md border border-cyan-200/15 bg-cyan-200/[0.06] p-4"
      onSubmit={onSubmit}
    >
      <div className="grid gap-3 lg:grid-cols-[1.2fr_1fr_auto] lg:items-end">
        <label className="grid gap-2">
          <span className="text-sm font-medium text-white/70">
            Aplicar plantilla
          </span>
          <Select
            items={templateItems}
            value={templateId}
            onValueChange={(nextValue) => setTemplateId(nextValue ?? "")}
            disabled={templates.length === 0 || isSubmitting}
          >
            <SelectTrigger className={selectClassName}>
              <SelectValue placeholder="Sin plantillas disponibles" />
            </SelectTrigger>
            <SelectContent align="start">
              {templateItems.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-white/70">
            Contacto para solicitudes
          </span>
          <Select
            items={contactItems}
            value={assignedClientContactId}
            onValueChange={(nextValue) =>
              setAssignedClientContactId(nextValue ?? "")
            }
            disabled={isSubmitting}
          >
            <SelectTrigger className={selectClassName}>
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
        </label>

        <Button
          type="submit"
          className="h-10 rounded-md"
          disabled={!templateId || isSubmitting}
        >
          {isSubmitting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <BookTemplate className="size-4" />
          )}
          Aplicar
        </Button>
      </div>

      {formError ? (
        <p className="mt-3 text-sm text-rose-100">{formError}</p>
      ) : null}
    </form>
  );
}

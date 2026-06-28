"use client";

import { BookTemplate, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { ApiError, apiFetch } from "@/lib/api/client";
import type {
  AppliedChecklist,
  ChecklistTemplate,
  ClientContact,
} from "@/lib/api/types";

const selectClassName =
  "h-10 w-full rounded-md border border-white/12 bg-white/[0.07] px-3 text-sm text-white outline-none transition focus:border-cyan-300/60 focus:ring-3 focus:ring-cyan-300/20";

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
          <select
            className={selectClassName}
            value={templateId}
            onChange={(event) => setTemplateId(event.target.value)}
            disabled={templates.length === 0 || isSubmitting}
          >
            {templates.length === 0 ? (
              <option value="">Sin plantillas disponibles</option>
            ) : null}
            {templates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-white/70">
            Contacto para solicitudes
          </span>
          <select
            className={selectClassName}
            value={assignedClientContactId}
            onChange={(event) => setAssignedClientContactId(event.target.value)}
            disabled={isSubmitting}
          >
            <option value="">Sin contacto asignado</option>
            {contacts.map((contact) => (
              <option key={contact.id} value={contact.id}>
                {contact.name}
              </option>
            ))}
          </select>
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

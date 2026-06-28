"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown, ChevronRight, Loader2, Plus, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
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
import type { Client, ClientStatus } from "@/lib/api/types";
import {
  type ClientFormInput,
  clientFormSchema,
} from "@/lib/schemas/client.schema";
import { cn } from "@/lib/utils";

const inputClassName =
  "h-11 w-full rounded-md border border-white/12 bg-white/[0.07] px-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-cyan-300/60 focus:ring-3 focus:ring-cyan-300/20";
const selectTriggerClassName =
  "h-11 w-full rounded-md border-white/12 bg-white/[0.07] px-3 text-white hover:bg-white/[0.1] focus-visible:border-cyan-300/60 focus-visible:ring-cyan-300/20";
const textareaClassName =
  "min-h-28 w-full rounded-md border border-white/12 bg-white/[0.07] px-3 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-cyan-300/60 focus:ring-3 focus:ring-cyan-300/20";
const clientStatusOptions: Array<{ value: ClientStatus; label: string }> = [
  { value: "ACTIVE", label: "Activo" },
  { value: "PAUSED", label: "Pausado" },
  { value: "ARCHIVED", label: "Archivado" },
];

type ClientFormProps = {
  mode: "create" | "edit";
  client?: Client;
};

export function ClientForm({ mode, client }: ClientFormProps) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [showCommercialDetails, setShowCommercialDetails] = useState(
    mode === "edit",
  );
  const [showPrimaryContact, setShowPrimaryContact] = useState(mode === "edit");
  const primary = client?.contacts.find((contact) => contact.isPrimary);
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ClientFormInput>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      name: client?.name ?? "",
      legalName: client?.legalName ?? "",
      taxId: client?.taxId ?? "",
      industry: client?.industry ?? "",
      email: client?.email ?? "",
      phone: client?.phone ?? "",
      website: client?.website ?? "",
      notes: client?.notes ?? "",
      status: client?.status ?? "ACTIVE",
      primaryContactName: primary?.name ?? "",
      primaryContactEmail: primary?.email ?? "",
      primaryContactPhone: primary?.phone ?? "",
      primaryContactRole: primary?.role ?? "",
    },
  });

  async function onSubmit(values: ClientFormInput) {
    setFormError(null);
    const payload = toClientPayload(values);

    try {
      const saved = await apiFetch<Client>(
        mode === "create" ? "/clients" : `/clients/${client!.id}`,
        {
          method: mode === "create" ? "POST" : "PATCH",
          body: payload,
        },
      );
      router.replace(`/dashboard/clients/${saved.id}`);
      router.refresh();
    } catch (error) {
      setFormError(
        error instanceof ApiError
          ? error.message
          : "No pudimos guardar el cliente.",
      );
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
      <div className="glass-card rounded-md p-5">
        <div className="mb-5">
          <h2 className="text-base font-semibold text-white">
            {mode === "create" ? "Alta rapida" : "Datos comerciales"}
          </h2>
          <p className="mt-1 text-sm text-white/60">
            {mode === "create"
              ? "Solo necesitas un nombre para crear el cliente. Luego puedes completar el perfil."
              : "Informacion principal para identificar y atender al cliente."}
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Nombre cliente" error={errors.name?.message}>
            <Input className={inputClassName} {...register("name")} />
          </Field>
          {mode === "create" ? (
            <div className="flex items-end">
              <ToggleSectionButton
                isOpen={showCommercialDetails}
                label="Datos opcionales"
                onClick={() => setShowCommercialDetails((current) => !current)}
              />
            </div>
          ) : null}
          {showCommercialDetails ? (
            <>
              <Field label="Razon social" error={errors.legalName?.message}>
                <Input className={inputClassName} {...register("legalName")} />
              </Field>
              <Field label="RUT / identificador" error={errors.taxId?.message}>
                <Input className={inputClassName} {...register("taxId")} />
              </Field>
              <Field label="Industria" error={errors.industry?.message}>
                <Input className={inputClassName} {...register("industry")} />
              </Field>
              <Field label="Correo general" error={errors.email?.message}>
                <Input
                  className={inputClassName}
                  type="email"
                  {...register("email")}
                />
              </Field>
              <Field label="Telefono general" error={errors.phone?.message}>
                <Input className={inputClassName} {...register("phone")} />
              </Field>
              <Field label="Sitio web" error={errors.website?.message}>
                <Input
                  className={inputClassName}
                  placeholder="https://empresa.cl"
                  {...register("website")}
                />
              </Field>
              <Field label="Estado" error={errors.status?.message}>
                <Controller
                  control={control}
                  name="status"
                  render={({ field }) => (
                    <Select
                      items={clientStatusOptions}
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
                        {clientStatusOptions.map((option) => (
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
                label="Notas internas"
                error={errors.notes?.message}
              >
                <Textarea className={textareaClassName} {...register("notes")} />
              </Field>
            </>
          ) : null}
        </div>
      </div>

      <div className="glass-card rounded-md p-5">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-white">
              Contacto principal
            </h2>
            <p className="mt-1 text-sm text-white/60">
              {mode === "create"
                ? "Puedes agregarlo ahora o dejarlo para cuando necesites enviar mensajes, correos o compartir el portal."
                : "Persona de referencia para solicitudes y seguimiento."}
            </p>
          </div>
          {mode === "create" ? (
            <ToggleSectionButton
              isOpen={showPrimaryContact}
              label="Agregar contacto"
              onClick={() => setShowPrimaryContact((current) => !current)}
            />
          ) : null}
        </div>
        {showPrimaryContact ? (
          <div className="grid gap-4 md:grid-cols-2">
            <Field
              label="Nombre contacto"
              error={errors.primaryContactName?.message}
            >
              <Input
                className={inputClassName}
                {...register("primaryContactName")}
              />
            </Field>
            <Field label="Cargo / rol" error={errors.primaryContactRole?.message}>
              <Input
                className={inputClassName}
                {...register("primaryContactRole")}
              />
            </Field>
            <Field
              label="Correo contacto"
              error={errors.primaryContactEmail?.message}
            >
              <Input
                className={inputClassName}
                type="email"
                {...register("primaryContactEmail")}
              />
            </Field>
            <Field
              label="Telefono contacto"
              error={errors.primaryContactPhone?.message}
            >
              <Input
                className={inputClassName}
                {...register("primaryContactPhone")}
              />
            </Field>
          </div>
        ) : (
          <div className="rounded-md border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/55">
            Sin contacto por ahora. Podras agregarlo desde el perfil del cliente.
          </div>
        )}
      </div>

      {formError ? (
        <div className="rounded-md border border-rose-300/20 bg-rose-300/10 px-4 py-3 text-sm text-rose-100">
          {formError}
        </div>
      ) : null}

      <div className="flex justify-end">
        <Button type="submit" className="h-10 rounded-md" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          Guardar cliente
        </Button>
      </div>
    </form>
  );
}

function ToggleSectionButton({
  isOpen,
  label,
  onClick,
}: {
  isOpen: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      className="h-9 rounded-md border-white/12 bg-white/[0.06] text-white hover:bg-white/[0.12]"
      onClick={onClick}
    >
      {isOpen ? (
        <ChevronDown className="size-4" />
      ) : label === "Agregar contacto" ? (
        <Plus className="size-4" />
      ) : (
        <ChevronRight className="size-4" />
      )}
      {label}
    </Button>
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

function toClientPayload(values: ClientFormInput) {
  const primaryContact = values.primaryContactName
      ? {
          name: values.primaryContactName,
          email: values.primaryContactEmail,
          phone: values.primaryContactPhone,
          role: values.primaryContactRole,
          isPrimary: true,
        }
      : undefined;

  return {
    name: values.name,
    legalName: values.legalName,
    taxId: values.taxId,
    industry: values.industry,
    email: values.email,
    phone: values.phone,
    website: values.website,
    notes: values.notes,
    status: values.status,
    primaryContact,
  };
}

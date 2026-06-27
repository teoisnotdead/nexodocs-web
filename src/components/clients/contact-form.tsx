"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { ApiError, apiFetch } from "@/lib/api/client";
import {
  type ContactFormInput,
  contactFormSchema,
} from "@/lib/schemas/client.schema";

const inputClassName =
  "h-10 w-full rounded-md border border-white/12 bg-white/[0.07] px-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-cyan-300/60 focus:ring-3 focus:ring-cyan-300/20";

export function ContactForm({ clientId }: { clientId: string }) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormInput>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      role: "",
      isPrimary: false,
    },
  });

  async function onSubmit(values: ContactFormInput) {
    setFormError(null);

    try {
      await apiFetch(`/clients/${clientId}/contacts`, {
        method: "POST",
        body: values,
      });
      reset();
      router.refresh();
    } catch (error) {
      setFormError(
        error instanceof ApiError
          ? error.message
          : "No pudimos agregar el contacto.",
      );
    }
  }

  return (
    <form className="glass-card rounded-md p-5" onSubmit={handleSubmit(onSubmit)}>
      <div className="mb-4">
        <h2 className="text-base font-semibold text-white">Agregar contacto</h2>
        <p className="mt-1 text-sm text-white/60">
          Suma personas clave para coordinar solicitudes y respuestas.
        </p>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="grid gap-2">
          <span className="text-sm font-medium text-white/70">Nombre</span>
          <input className={inputClassName} {...register("name")} />
          {errors.name ? (
            <span className="text-xs text-rose-200">{errors.name.message}</span>
          ) : null}
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-medium text-white/70">Rol</span>
          <input className={inputClassName} {...register("role")} />
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-medium text-white/70">Correo</span>
          <input className={inputClassName} type="email" {...register("email")} />
          {errors.email ? (
            <span className="text-xs text-rose-200">{errors.email.message}</span>
          ) : null}
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-medium text-white/70">Telefono</span>
          <input className={inputClassName} {...register("phone")} />
        </label>
      </div>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex items-center gap-2 text-sm text-white/70">
          <input
            type="checkbox"
            className="size-4 rounded border-white/20 bg-white/10"
            {...register("isPrimary")}
          />
          Marcar como contacto principal
        </label>
        <Button type="submit" className="h-10 rounded-md" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
          Agregar
        </Button>
      </div>
      {formError ? (
        <div className="mt-4 rounded-md border border-rose-300/20 bg-rose-300/10 px-3 py-2 text-sm text-rose-100">
          {formError}
        </div>
      ) : null}
    </form>
  );
}

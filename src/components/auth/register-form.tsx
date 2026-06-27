"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { useAuthRedirect } from "@/components/auth/auth-redirect";
import { Button } from "@/components/ui/button";
import { ApiError, apiFetch } from "@/lib/api/client";
import type { AuthResponse } from "@/lib/api/types";
import {
  type RegisterInput,
  registerSchema,
} from "@/lib/schemas/auth.schema";

const inputClassName =
  "h-11 w-full rounded-md border border-white/12 bg-white/[0.07] px-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-cyan-300/60 focus:ring-3 focus:ring-cyan-300/20";

export function RegisterForm() {
  const [formError, setFormError] = useState<string | null>(null);
  const redirectAfterAuth = useAuthRedirect();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      organizationName: "",
      name: "",
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: RegisterInput) {
    setFormError(null);

    try {
      await apiFetch<AuthResponse>("/auth/register", {
        method: "POST",
        body: values,
      });
      await redirectAfterAuth();
    } catch (error) {
      setFormError(
        error instanceof ApiError
          ? error.message
          : "No pudimos crear la cuenta.",
      );
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <label className="grid gap-2">
        <span className="text-sm font-medium text-white/70">
          Nombre completo
        </span>
        <input
          autoComplete="name"
          aria-invalid={Boolean(errors.name)}
          className={inputClassName}
          placeholder="Alfredo Saavedra"
          {...register("name")}
        />
        {errors.name ? (
          <span className="text-xs text-rose-200">{errors.name.message}</span>
        ) : null}
      </label>
      <label className="grid gap-2">
        <span className="text-sm font-medium text-white/70">Organizacion</span>
        <input
          aria-invalid={Boolean(errors.organizationName)}
          className={inputClassName}
          placeholder="TYT Tech Solutions"
          {...register("organizationName")}
        />
        {errors.organizationName ? (
          <span className="text-xs text-rose-200">
            {errors.organizationName.message}
          </span>
        ) : null}
      </label>
      <label className="grid gap-2">
        <span className="text-sm font-medium text-white/70">Correo</span>
        <input
          type="email"
          autoComplete="email"
          aria-invalid={Boolean(errors.email)}
          className={inputClassName}
          placeholder="correo@empresa.cl"
          {...register("email")}
        />
        {errors.email ? (
          <span className="text-xs text-rose-200">{errors.email.message}</span>
        ) : null}
      </label>
      <label className="grid gap-2">
        <span className="text-sm font-medium text-white/70">Contrasena</span>
        <input
          type="password"
          autoComplete="new-password"
          aria-invalid={Boolean(errors.password)}
          className={inputClassName}
          placeholder="Minimo 8 caracteres"
          {...register("password")}
        />
        {errors.password ? (
          <span className="text-xs text-rose-200">
            {errors.password.message}
          </span>
        ) : null}
      </label>
      {formError ? (
        <div className="rounded-md border border-rose-300/20 bg-rose-300/10 px-3 py-2 text-sm text-rose-100">
          {formError}
        </div>
      ) : null}
      <Button
        type="submit"
        className="h-11 w-full rounded-md"
        disabled={isSubmitting}
      >
        {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
        Crear cuenta
        <ArrowRight className="size-4" />
      </Button>
    </form>
  );
}

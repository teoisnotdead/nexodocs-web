"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { useAuthRedirect } from "@/components/auth/auth-redirect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApiError, apiFetch } from "@/lib/api/client";
import type { AuthResponse } from "@/lib/api/types";
import { type LoginInput, loginSchema } from "@/lib/schemas/auth.schema";

const inputClassName =
  "h-11 w-full rounded-md border border-white/12 bg-white/[0.07] px-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-cyan-300/60 focus:ring-3 focus:ring-cyan-300/20";

export function LoginForm() {
  const [formError, setFormError] = useState<string | null>(null);
  const redirectAfterAuth = useAuthRedirect();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "alfredo.ssm@gmail.com",
      password: "nexodocs123",
    },
  });

  async function onSubmit(values: LoginInput) {
    setFormError(null);

    try {
      await apiFetch<AuthResponse>("/auth/login", {
        method: "POST",
        body: values,
      });
      await redirectAfterAuth();
    } catch (error) {
      setFormError(
        error instanceof ApiError
          ? error.message
          : "No pudimos iniciar sesion.",
      );
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <label className="grid gap-2">
        <span className="text-sm font-medium text-white/70">Correo</span>
        <Input
          type="email"
          autoComplete="email"
          aria-invalid={Boolean(errors.email)}
          className={inputClassName}
          {...register("email")}
        />
        {errors.email ? (
          <span className="text-xs text-rose-200">{errors.email.message}</span>
        ) : null}
      </label>
      <label className="grid gap-2">
        <span className="text-sm font-medium text-white/70">Contrasena</span>
        <Input
          type="password"
          autoComplete="current-password"
          aria-invalid={Boolean(errors.password)}
          className={inputClassName}
          {...register("password")}
        />
        {errors.password ? (
          <span className="text-xs text-rose-200">
            {errors.password.message}
          </span>
        ) : null}
      </label>
      <div className="flex flex-col gap-2 text-sm text-white/60 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            className="size-4 rounded border-white/20 bg-white/10"
          />
          Recordarme
        </label>
        <a className="font-medium text-cyan-100 hover:text-white" href="#">
          Recuperar acceso
        </a>
      </div>
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
        Ingresar
        <ArrowRight className="size-4" />
      </Button>
    </form>
  );
}

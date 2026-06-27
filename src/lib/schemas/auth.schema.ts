import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email("Ingresa un email valido."),
  password: z.string().min(8, "La contrasena debe tener al menos 8 caracteres."),
});

export const registerSchema = loginSchema.extend({
  organizationName: z
    .string()
    .trim()
    .min(2, "Ingresa el nombre de la organizacion."),
  name: z.string().trim().min(2, "Ingresa tu nombre."),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

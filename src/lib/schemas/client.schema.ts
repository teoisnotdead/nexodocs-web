import { z } from "zod";

const optionalText = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value : undefined));

const optionalEmail = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value : undefined))
  .pipe(z.string().email("Ingresa un correo valido.").optional());

const optionalWebsite = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value : undefined))
  .pipe(z.string().url("Ingresa una URL valida con https://").optional());

export const clientFormSchema = z.object({
  name: z.string().trim().min(2, "Ingresa el nombre del cliente."),
  legalName: optionalText,
  taxId: optionalText,
  industry: optionalText,
  email: optionalEmail,
  phone: optionalText,
  website: optionalWebsite,
  notes: optionalText,
  status: z.enum(["ACTIVE", "PAUSED", "ARCHIVED"]),
  primaryContactName: optionalText,
  primaryContactEmail: optionalEmail,
  primaryContactPhone: optionalText,
  primaryContactRole: optionalText,
});

export const contactFormSchema = z.object({
  name: z.string().trim().min(2, "Ingresa el nombre del contacto."),
  email: optionalEmail,
  phone: optionalText,
  role: optionalText,
  isPrimary: z.boolean(),
});

export type ClientFormInput = z.infer<typeof clientFormSchema>;
export type ContactFormInput = z.infer<typeof contactFormSchema>;

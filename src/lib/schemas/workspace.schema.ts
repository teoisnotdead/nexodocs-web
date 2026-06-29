import { z } from "zod";

const optionalText = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value : undefined));

const optionalYear = optionalText.refine(
  (value) => !value || (/^\d{4}$/.test(value) && Number(value) >= 1900 && Number(value) <= 2200),
  "Ingresa un año valido.",
);

const optionalMonth = optionalText.refine(
  (value) => !value || (/^\d{1,2}$/.test(value) && Number(value) >= 1 && Number(value) <= 12),
  "Ingresa un mes entre 1 y 12.",
);

export const workspaceFormSchema = z.object({
  clientId: z.string().trim().min(1, "Selecciona un cliente."),
  name: z.string().trim().min(2, "Ingresa el nombre del proceso."),
  description: optionalText,
  workspaceType: z.enum([
    "GENERIC_PROCESS",
    "MONTHLY_CLOSURE",
    "LEGAL_CASE",
    "ONBOARDING",
    "DOCUMENT_REVIEW",
  ]),
  periodYear: optionalYear,
  periodMonth: optionalMonth,
  dueDate: optionalText,
});

export type WorkspaceFormInput = z.infer<typeof workspaceFormSchema>;

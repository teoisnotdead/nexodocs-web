import { z } from "zod";

const optionalText = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value : undefined));

export const checklistTemplateFormSchema = z.object({
  name: z.string().trim().min(2, "Ingresa el nombre de la plantilla."),
  description: optionalText,
  items: z
    .string()
    .trim()
    .min(2, "Agrega al menos un documento.")
    .refine(
      (value) =>
        value
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean).length > 0,
      "Agrega al menos un documento.",
    ),
});

export type ChecklistTemplateFormInput = z.infer<
  typeof checklistTemplateFormSchema
>;

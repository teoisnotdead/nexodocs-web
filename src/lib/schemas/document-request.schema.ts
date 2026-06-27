import { z } from "zod";

const optionalText = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value : undefined));

export const documentRequestFormSchema = z.object({
  title: z.string().trim().min(2, "Ingresa el nombre de la solicitud."),
  description: optionalText,
  required: z.boolean(),
  dueDate: optionalText,
  assignedClientContactId: optionalText,
});

export type DocumentRequestFormInput = z.infer<
  typeof documentRequestFormSchema
>;

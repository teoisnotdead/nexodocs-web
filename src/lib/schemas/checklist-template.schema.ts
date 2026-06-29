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
    .array(
      z.object({
        title: z.string().trim(),
      }),
    )
    .superRefine((items, context) => {
      const completedItems = items.filter((item) => item.title.length > 0);

      if (completedItems.length === 0) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Agrega al menos un documento.",
          path: [0, "title"],
        });
      }

      items.forEach((item, index) => {
        if (item.title.length > 0 && item.title.length < 2) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Ingresa un nombre mas descriptivo.",
            path: [index, "title"],
          });
        }
      });
    }),
});

export type ChecklistTemplateFormInput = z.infer<
  typeof checklistTemplateFormSchema
>;

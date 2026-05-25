import { z } from "zod";

/**
 * @module projects/types/projectSchema
 * Zod validation schema for project creation.
 */

export const projectSchema = z.object({
  name: z.string().min(1, "Project name is required").max(100, "Name must be 100 characters or less"),
  description: z.string().max(500, "Description must be 500 characters or less").optional().default(""),
  scrumTeam: z.string().optional().default(""),
  color: z.string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color format")
    .optional()
    .default("#6B5CFF"),
  icon: z.instanceof(File).optional(),
});

export type ProjectFormValues = z.infer<typeof projectSchema>;
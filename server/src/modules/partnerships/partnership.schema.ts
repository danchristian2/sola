import { z } from "zod";

export const applyPartnershipSchema = z.object({
  schoolName: z.string().min(2).max(160),
  location: z.string().min(1).max(160),
  contactEmail: z.string().email(),
  contactPhone: z.string().max(40).optional(),
  adminFirstName: z.string().min(1).max(80),
  adminLastName: z.string().min(1).max(80),
  adminEmail: z.string().email(),
  message: z.string().max(1000).optional()
});

export const reviewPartnershipSchema = z.object({
  note: z.string().max(500).optional()
});

export type ApplyPartnershipInput = z.infer<typeof applyPartnershipSchema>;

import { z } from "zod";

/** سطوح اطمینان داده — §۶ سند ساخت */
export const confidenceSchema = z.enum([
  "declared",
  "observed",
  "reported",
  "unknown",
]);

export const fieldMetaSchema = z.object({
  confidence: confidenceSchema,
  source: z.string().optional(),
  observedAt: z.string().optional(),
});

export const seedFeeSchema = z.object({
  method: z.string().min(2),
  buyFeePct: z.number().nonnegative().nullable(),
  sellFeePct: z.number().nonnegative().nullable(),
  minBuyToman: z.number().int().nonnegative().nullable(),
  withdrawalFeeToman: z.number().int().nonnegative().nullable(),
  physicalDelivery: z.boolean().nullable(),
  fieldMeta: z.record(z.string(), fieldMetaSchema).default({}),
  observedAt: z.string().optional(),
});

export const seedLicenseSchema = z.object({
  type: z.string().min(2),
  issuer: z.string().optional(),
  status: z.enum(["verified", "pending", "unverified"]).default("pending"),
  sourceUrl: z.string().optional(),
  checkedAt: z.string().optional(),
});

export const seedPlatformSchema = z.object({
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/, "slug فقط حروف کوچک انگلیسی، عدد و خط تیره"),
  nameFa: z.string().min(2),
  domain: z.string().min(3),
  methods: z.array(z.string()).min(1),
  status: z.enum(["active", "suspended", "closed"]).default("active"),
  isDemo: z.boolean().default(false),
  fees: z.array(seedFeeSchema).default([]),
  licenses: z.array(seedLicenseSchema).default([]),
});

export type SeedPlatform = z.infer<typeof seedPlatformSchema>;

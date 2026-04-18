import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(3000),
  // Legacy deployments use DATABASE_URL. New merged deployments use DATABASE_POSTGRES_PRISMA_URL.
  DATABASE_URL: z.string().optional(),
  DATABASE_POSTGRES_PRISMA_URL: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().optional(),
  R2_ACCOUNT_ID: z.string().optional(),
  R2_ACCESS_KEY_ID: z.string().optional(),
  R2_SECRET_ACCESS_KEY: z.string().optional(),
  R2_BUCKET: z.string().optional(),
  R2_PUBLIC_BASE_URL: z.string().optional(),
  USDA_API_KEY: z.string().optional(),
  FATSECRET_CLIENT_ID: z.string().optional(),
  FATSECRET_CLIENT_SECRET: z.string().optional(),
}).refine(
  (data) => data.DATABASE_URL || data.DATABASE_POSTGRES_PRISMA_URL,
  { message: "Either DATABASE_URL or DATABASE_POSTGRES_PRISMA_URL is required" }
);

export const env = envSchema.parse(process.env);

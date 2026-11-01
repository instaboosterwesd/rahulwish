import { z } from "zod";

// Parse only public display fields: never pass arbitrary database fields to pages.
const templateSchema = z.object({
  id: z.string().uuid(), slug: z.string().min(1).max(100),
  title: z.string().max(200), tagline: z.string().max(500), description: z.string().max(10000),
  category: z.string().max(100), cover_image: z.string().max(2000),
  badge: z.string().max(100), style: z.string().max(100),
  price_inr: z.number().int().nonnegative(), original_price_inr: z.number().int().nonnegative(),
  rating: z.number().min(0).max(5), active: z.boolean(), featured: z.boolean(),
  created_at: z.string(), updated_at: z.string(),
});

export function parseFirebaseCatalog(value: unknown) {
  if (value === null) return null;
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Invalid Firebase catalog");
  return Object.values(value).map((row) => templateSchema.parse(row)).filter((row) => row.active)
    .sort((a, b) => Number(b.featured) - Number(a.featured) || a.created_at.localeCompare(b.created_at));
}

export async function readFirebaseCatalog(databaseURL: string) {
  const response = await fetch(`${databaseURL}/catalog.json`, { signal: AbortSignal.timeout(5000) });
  if (!response.ok) throw new Error("Firebase public catalog is unavailable");
  return parseFirebaseCatalog(await response.json());
}
import { createServerFn } from "@tanstack/react-start";
import { queryOptions } from "@tanstack/react-query";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

export type Template = Database["public"]["Tables"]["templates"]["Row"];

function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
          headers.delete("Authorization");
        }
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });
}

export const listTemplates = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await publicClient()
    .from("templates")
    .select("*")
    .eq("active", true)
    .order("featured", { ascending: false })
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const getTemplate = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => z.object({ slug: z.string().min(1).max(100) }).parse(d))
  .handler(async ({ data }) => {
    const { data: row, error } = await publicClient()
      .from("templates")
      .select("*")
      .eq("slug", data.slug)
      .eq("active", true)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row;
  });

export const getSurprise = createServerFn({ method: "GET" })
  .inputValidator((d: { code: string }) => z.object({ code: z.string().min(4).max(32) }).parse(d))
  .handler(async ({ data }) => {
    const { data: rows, error } = await publicClient().rpc("get_surprise", { _code: data.code });
    if (error) throw new Error(error.message);
    const row = rows?.[0];
    if (!row) return null;
    let photoUrls: string[] = [];
    if (row.photos.length) {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: signed } = await supabaseAdmin.storage
        .from("photos")
        .createSignedUrls(row.photos, 60 * 60 * 24);
      photoUrls = (signed ?? []).map((s) => s.signedUrl).filter(Boolean) as string[];
    }
    return { ...row, photoUrls };
  });

export const templatesQuery = () =>
  queryOptions({ queryKey: ["templates"], queryFn: () => listTemplates() });
export const templateQuery = (slug: string) =>
  queryOptions({ queryKey: ["template", slug], queryFn: () => getTemplate({ data: { slug } }) });
export const surpriseQuery = (code: string) =>
  queryOptions({ queryKey: ["surprise", code], queryFn: () => getSurprise({ data: { code } }) });

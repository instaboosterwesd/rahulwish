import { createFileRoute } from "@tanstack/react-router";
import { templatePhotoTypes } from "@/lib/template-upload";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Public template cover photos uploaded from the admin panel.
export const Route = createFileRoute("/media/cover/$templateId")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        if (!UUID.test(params.templateId)) return new Response("Not found", { status: 404 });
        const { dbGet } = await import("@/lib/firebase-db.server");
        const cover = await dbGet<{ type?: string; data?: string }>(`coverImages/${params.templateId}`).catch(() => null);
        if (!cover?.data || !cover.type || !templatePhotoTypes.includes(cover.type)) return new Response("Not found", { status: 404 });
        const bytes = Uint8Array.from(atob(cover.data), (c) => c.charCodeAt(0));
        return new Response(bytes, { headers: { "Content-Type": cover.type, "Cache-Control": "public, max-age=31536000, immutable", "X-Content-Type-Options": "nosniff" } });
      },
    },
  },
});

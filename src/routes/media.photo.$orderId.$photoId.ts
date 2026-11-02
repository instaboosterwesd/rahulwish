import { createFileRoute } from "@tanstack/react-router";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DATA_URL = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/]+=*)$/;

// Serves a surprise photo by its two unguessable IDs (the same photos the shared link shows).
export const Route = createFileRoute("/media/photo/$orderId/$photoId")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        if (!UUID.test(params.orderId) || !UUID.test(params.photoId)) return new Response("Not found", { status: 404 });
        const { dbGet } = await import("@/lib/firebase-db.server");
        const value = await dbGet<string>(`photos/${params.orderId}/${params.photoId}`).catch(() => null);
        const match = typeof value === "string" ? DATA_URL.exec(value) : null;
        if (!match) return new Response("Not found", { status: 404 });
        const bytes = Uint8Array.from(atob(match[2] ?? ""), (c) => c.charCodeAt(0));
        return new Response(bytes, { headers: { "Content-Type": match[1] ?? "image/jpeg", "Cache-Control": "private, max-age=86400", "X-Content-Type-Options": "nosniff" } });
      },
    },
  },
});

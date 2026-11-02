import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { currentFirebaseUser } from "@/lib/firebase-browser";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const user = await currentFirebaseUser().catch(() => null);
    if (!user) throw redirect({ to: "/auth" });
  },
  component: () => <Outlet />,
});

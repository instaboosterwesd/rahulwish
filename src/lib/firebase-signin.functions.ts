import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { firebaseGoogleIdentity } from "@/lib/firebase-access";

// Exchanges a verified Firebase Google sign-in for the app's account session,
// so existing orders, wallet and profile keep working during the Firebase move.
export const firebaseGoogleSignIn = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ idToken: z.string().min(100).max(4096) }).parse(d))
  .handler(async ({ data }) => {
    const { verifyFirebaseToken } = await import("@/lib/firebase.server");
    let claims: Record<string, unknown>;
    try {
      ({ claims } = await verifyFirebaseToken(data.idToken));
    } catch {
      throw new Error("Google sign-in could not be verified. Please try again.");
    }
    const identity = firebaseGoogleIdentity(claims);

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: identity.email,
      email_confirm: true,
      user_metadata: { full_name: identity.name, avatar_url: identity.picture },
      app_metadata: { firebase_uid: String(claims["sub"]) },
    });
    if (createError && !/already|exists|registered/i.test(createError.message)) {
      console.error("firebaseGoogleSignIn createUser failed", createError.message);
      throw new Error("Could not create your account. Please try again.");
    }

    const { data: link, error: linkError } = await supabaseAdmin.auth.admin.generateLink({ type: "magiclink", email: identity.email });
    const tokenHash = link?.properties?.hashed_token;
    if (linkError || !tokenHash) {
      console.error("firebaseGoogleSignIn generateLink failed", linkError?.message);
      throw new Error("Could not sign you in. Please try again.");
    }
    return { tokenHash };
  });

<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Wallet top-ups and template purchases both go through FamGateway UPI orders recorded at payments/{orderId} (kind wallet|template); credit or the order is granted only after server-side verify-order succeeds and the payment is claimed once by transaction, so UI interactions never grant unverified credit.
- Keep the landing page at the index route and the catalog at its existing templates route; shared navigation links directly to the catalog without duplicating or replacing the index route.
- Uploaded templates reuse matching source/media rather than duplicating archives; 3D scenes load project dependencies in browser effects, and converted love animations use CDN asset pointers to avoid remote executable dependencies and video-codec failures.
- Copied migration history is reset only after confirming the remix has no applied entries; preserve the copied SQL outside the active migration directory so existing tables are not replayed.
- GitHub updates go through the saved `GITHUB_FINE_GRAINED_PERSONAL_ACCESS_TOKEN` via the GitHub API, never by printing or storing the token in code, and exclude `.git`, `.env`, dependencies, and build output from what is uploaded.
- All app data lives in the Firebase Realtime Database; private reads/writes go through server functions using the FIREBASE_SERVICE_ACCOUNT_JSON service account (REST + Worker-compatible token signing), because the browser must never write balances, orders or roles.
- Server functions authenticate with the Firebase ID token attached by the global client middleware and verified server-side; admin checks read users/{uid}/role ("admin"|"user"; rules let users only keep it unchanged or create it as "user", so only the server can grant admin), and banned/removed flags live in accounts/{uid}, server-written only.
- Wallet balance is the server-kept wallets/{uid}/balance, changed only by compare-and-set transactions (purchase, deposit approval, refund), so concurrent requests cannot double-spend.
- Database rules are deny-by-default (public catalog/publicSettings, owner-only reads elsewhere) and are kept in firebase/database.rules.json as the published source of truth.
- No Firebase Storage bucket exists: surprise photos and admin cover uploads are stored as compressed base64 in the database and served by the /media/* server routes.
- Accounts live only in Firebase Authentication (email/password or Google popup); profiles are stored at users/{uid} in the Realtime Database under owner-only validated rules, and the role is stored at users/{uid}/role, which users cannot raise, so no account data depends on the old database.
- Public Firebase catalog reads validate and project display fields only; purchases always re-read prices from the server-side catalog, never from the browser.
- Site icons are custom generated 3D clay images rendered through one shared icon component, and glass surfaces use shared glass utilities with only the standard backdrop-filter property, because hand-written prefixes make the production build drop the blur.

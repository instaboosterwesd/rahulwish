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

- Wallet top-up uses the shared dialog and button controls; payment initiation remains unavailable until the provider contract is supplied, so UI interactions never grant unverified credit.
- Keep the landing page at the index route and the catalog at its existing templates route; shared navigation links directly to the catalog without duplicating or replacing the index route.
- Uploaded templates reuse matching source/media rather than duplicating archives; 3D scenes load project dependencies in browser effects, and converted love animations use CDN asset pointers to avoid remote executable dependencies and video-codec failures.
- Copied migration history is reset only after confirming the remix has no applied entries; preserve the copied SQL outside the active migration directory so existing tables are not replayed.
- GitHub updates go through the saved `GITHUB_FINE_GRAINED_PERSONAL_ACCESS_TOKEN` via the GitHub API, never by printing or storing the token in code, and exclude `.git`, `.env`, dependencies, and build output from what is uploaded.
- Firebase migration uses browser-safe lazy SDK initialization and Worker-compatible token verification/REST helpers; keep the existing app connection until credentials, deny-by-default rules, ownership imports and critical flows are verified, so a partial migration cannot lose working access or balances.
- Sign-in uses Firebase Google popup; the server verifies the Firebase ID token (Google provider, verified email) and exchanges it for the existing app session by email, so accounts, orders and balances keep working until the data cutover.
- Public Firebase catalog reads validate and project display fields only, with existing-catalog fallback while uninitialized; never use public catalog prices or client writes to authorize purchases or credit wallets.
- Customer dashboard reads ensure the caller's profile through an authenticated, insert-only RPC; signup also creates it, preserving existing account restrictions and balances.

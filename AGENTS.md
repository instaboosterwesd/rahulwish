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

- Keep the remixed project's migration baseline empty until its first schema change; use the Lovable migration tool to generate journal and snapshot metadata so copied history is never replayed.
- Admin pages live under the authenticated layout and every admin server function checks the caller's protected role before loading a privileged client; public admin access would expose customer data.
- Deposits and purchases use restricted database functions with a locked profile row for spending; balance is approved deposits minus paid orders, preventing double spending and client-forged approvals.
- Removing a customer soft-deletes their profile and disables access while preserving financial records.
- Dispatch uploaded Proposal, Birthday, Love and Your Surprise categories to dedicated React presentations using shared saved props across demos, editor previews and recipient links; never execute uploaded scripts or embed standalone documents.
- Template audio uses bundled supplied tracks or buyer-owned signed storage URLs, starts only after user interaction, and pauses on unmount; the original loop remains available as a fallback.
- Proposal's recipient-name unlock is only a playful presentation reveal, never an access-control boundary; share its flow rules across all presentations to keep demos and live surprises consistent.
- The connected Supabase owns sign-in; use its OAuth flow instead of the Lovable Cloud broker so accounts and data stay on the same backend.
- Keep restricted security-definer RPCs for credit mutations and capability-link reads; they intentionally bypass direct table writes while validating active accounts, ownership and approved status.
- Bundle supplied template media as project asset imports for portable deployments; resolve legacy catalog cover pointers to bundled defaults while preserving admin replacements.
- Store admin cover uploads in private template-covers storage through role-checked server functions; resolve only database-selected cover paths to expiring signed URLs, since public buckets are blocked.
- Use the shared reduced-motion-aware celebration helper for template bursts so all presentations respect accessibility preferences.
- FamGateway UPI payments: server functions create and verify orders with the secret key; database RPCs check a hash of that key so only the server can record payments, and a paid order becomes an approved deposit plus a paid surprise in one locked step.

- Uploaded canvas templates (Animated Garden, 3D Hearts) run as ported engines in `src/lib/engines/`, scoped to a root element, loaded via dynamic import in `useEffect`, and return a cleanup — so they never touch the global page and stay SSR-safe.
- Uploaded categories beyond the original four map to presentations in `src/lib/new-templates.ts`; that file owns their media, covers, demo photos and the Secret Birthday passcode rule.
- The 5 uploaded templates (sweet-birthday, apology, secret-birthday, garden, heart-universe) are served unchanged from public/templates-src/<slug>/ in a full-screen iframe, because the owner wants the original code used as-is; the React ports in NewExperiences/CanvasExperiences are no longer dispatched.

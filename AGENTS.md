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
- Dispatch Proposal experiences to their dedicated presentation component while preserving the shared content props across demo, editor preview and live surprises; keep other categories unchanged.
- Proposal audio is an original bundled loop played only after user interaction, with pause and unmount cleanup; avoid third-party music licensing and autoplay failures.
- Proposal's recipient-name unlock is only a playful presentation reveal, never an access-control boundary; share its flow rules across all presentations to keep demos and live surprises consistent.

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

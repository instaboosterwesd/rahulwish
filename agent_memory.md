# Always4you — project context

Updated: 2026-10-19 UTC. This document contains project context, not credentials. Refresh it when behavior or verification changes. `AGENTS.md` remains the authoritative architecture/security rules file; `roadmap.md` tracks outstanding work.

## What we are doing now

- The user originally requested cloning and showing `https://github.com/instaboosterwesd/remix-of-remix-of-remix-of-remix-of-remix-of-always-you-delight.git` in Lovable. Its compatible React/TanStack Start source was copied without the old credentials file; an optional `audioUrl` type issue was corrected.
- The user subsequently supplied public Supabase connection settings, then connected their own Supabase project and requested moving accessible old data onto it.
- The current request is to create this root `agent_memory.md`, recording project logic, preferences, rules, and current context, and export the current source to `https://github.com/instaboosterwesd/rahulwish` using an already securely saved GitHub credential. Never place that credential in this document, source, logs, or exports.
- The user wants the existing `rahulwish` repository, not a new repository. Lovable's native Git connection always creates a new repository and cannot be redirected by editing `.git`. A one-off GitHub API export does not establish automatic two-way Lovable sync.
- Preserve existing GitHub history and unrelated repository files; exclude credentials, managed Lovable metadata, dependencies, and generated build output. Do not change Lovable's managed Git remote or force-push.

## Product and preferences

- Product name: Always4you. It sells personalized surprise websites, with INR pricing and romantic/celebration presentations.
- The user communicates primarily in Hindi/Hinglish and asks for direct practical action; explanations should be short and accessible.
- Use the existing visual system and supplied/generated project assets rather than replacing the design without a request.
- No other explicit personal visual preferences have been established in this conversation. Do not invent them.

## Current application

- React 19 with TanStack Start and TanStack Router file-based routes, Vite, Tailwind CSS v4, existing shadcn-style UI controls, Supabase, and Vitest.
- `/`: branded home page with featured templates and exploration links.
- `/templates`: active catalog. `/templates/$slug`: template details, price, demo, and purchase/customize actions.
- `/demo/$slug`: sample presentation. `/surprise/$code`: recipient-facing saved surprise.
- `/auth`: Supabase email/password signup/sign-in and Google OAuth. Google uses the connected Supabase's `signInWithOAuth`, not the Lovable broker.
- Authenticated `/my`: customer profile, deposits, purchases and surprises. `/customize/$id`: buyer editing. `/admin`: protected administration.
- Public functions read active templates/settings and resolve capability links. Authenticated customer functions load profile, deposits, purchases, and saved customization; media reads generate time-limited signed URLs.
- Admin functions manage templates, deposits, surprises, profiles and settings after verifying the caller's admin role.
- Announcement and maintenance overlays use saved public settings; announcement eligibility has a 24-hour local-storage cooldown.
- `SurpriseExperience` dispatches category-specific Proposal, Birthday, Love and Your Surprise React presentations. Demo, editor and recipient rendering should share saved props and presentation logic.
- Proposal includes name-based playful reveal, story, quiz, reasons, future/countdown, and letter/scratch/ring moments. Existing components do not by themselves prove every saved customization flow works end-to-end.

## Supabase migration context

- Current connected external Supabase project: `igsmyzczvdsqaqrqyrru`, displayed as `deveshbaghel7830@gmail.com's Project`.
- Previous source project: `ncxhxoziwnebkaedfset`. Public data accessible from it consisted of one active `Proposal Surprise` template priced at INR 499, and settings `announcement=""` and `maintenance_mode="off"`. These were copied to the newly connected project.
- Source public reads returned no profiles, deposits or surprises; this does not prove the old private tables were empty. Private migration requires an authorized source export.
- Restored schema includes `app_role`, `profiles`, `user_roles`, `templates`, `deposits`, `surprises`, and `settings`, with RLS and restricted security-definer RPCs.
- RPCs include `has_role`, `request_deposit`, `purchase_template`, `save_surprise`, `save_surprise_photos`, `save_proposal_config`, `get_surprise`, and `get_proposal_config`.
- Private storage buckets: `photos` (10 MB) and `proposal-audio` (20 MB), with owner-scoped upload/read/delete. New auth users receive a profile through `handle_new_user`.
- The connected project's privileged service-role credential was not supplied during migration; admin privileged actions must not be assumed operational until credential availability is verified securely.
- A linter previously reported ten function-execution warnings; restricted RPC grants are intentional where ownership, active-account and approved-status checks are enforced. Do not weaken them simply to silence warnings.
- Keep the remixed migration baseline empty until the first schema change; generate migration journal/snapshot metadata through the Lovable migration tool. Copied history must not replay against a new backend. The current project now has its first restored-schema migration.
- `drizzle/schema.ts` is intentionally blank; review checked-in migrations and live schema rather than inferring schema from that file.

## Non-negotiable logic and security rules

- Roles belong in protected `user_roles`, never writable profile/user fields.
- Admin pages remain under the authenticated layout. Every admin server function verifies the caller's protected role before loading a privileged client.
- Deposits and purchases use restricted database functions. Lock the profile row while spending; balance equals approved deposits minus paid orders. Do not trust client approval/balance values or permit double spending.
- Customer removal soft-deletes/disables access while preserving financial records.
- Restricted capability-link and credit RPCs intentionally bypass direct table writes while enforcing active-account, ownership and approved-status checks.
- Proposal's recipient-name unlock is only a playful reveal, not authorization. Share its behavior across presentations.
- Uploaded templates are handled by dedicated React presentations; never execute uploaded scripts or embed standalone uploaded documents.
- Audio uses uploaded asset pointers or buyer-owned signed storage URLs; playback starts only after user interaction, pauses on unmount, and retains the original loop as fallback.
- Supabase owns authentication and data. Keep service credentials server-only, and do not send them to browsers, recipient pages, or GitHub.
- App-internal server logic uses TanStack server functions. Protected calls carry the Supabase Bearer session; validate caller claims and apply user-scoped access.

## Verification established earlier

- The home page rendered Always4you, and `/templates/proposal` rendered `Proposal Surprise` with INR 499 after rebinding the new Supabase.
- Signed-out checks blocked profile/deposit/surprise/role table access and purchases. Existing Bun/Vitest tests were previously run; the preview build was reported OK.
- Unit tests cover routing, INR formatting, approved-credit arithmetic, announcement cooldown, and Proposal reveal/quiz/config validation. A route unit test deliberately does not exercise network loaders.
- These prior checks are not proof of authenticated admin, OAuth, private storage migration, or buyer-to-recipient save/read flows. Re-verify those separately before claiming they work.

## Outstanding work and blockers

- Import old private customer, deposit, surprise and storage records: needs an authorized source export.
- Verify Google/email sign-in and hosted provider settings: external unmanaged Supabase cannot use a Lovable-managed browser session. Configure the Google provider and allowed callback/redirect URLs for the actual preview/published origins; do not assume hosted settings from source code.
- Assign the site owner's admin role: needs the owner to create and identify their account.
- Complete/verify uploaded category presentations, scratch/typed-letter/ring interactions, buyer quiz choices/audio persistence, and recipient readback. Some presentation elements already exist, so reconcile roadmap entries with source and actual behavior before rebuilding anything.
- App is not published. Current preview: `https://id-preview--bdee9262-1054-4fc6-ae61-1ec55f47c2af.lovable.app`. No custom domain or published URL is established.

## GitHub export boundaries

- Export requested destination is `instaboosterwesd/rahulwish`, current default branch `main` (checked on 2026-10-19).
- A securely saved fine-grained token provided repository read access. Write access must be established by the actual export result; do not claim a successful push beforehand.
- Export source and public assets, not database contents, auth accounts or private storage objects. Hosting outside Lovable requires separately configured environment settings and Supabase access.
- Record success or any blocker in `roadmap.md`; never include secret values in project notes.
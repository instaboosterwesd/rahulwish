# Migrate RGX4YOU to Firebase

## Result
Use your `rahul-wish` Firebase project for Google sign-in, templates, profiles, orders, wallet records and photo uploads. Keep the existing pages and navigation. No private keys will be written into source files or `env.txt`.

The Firebase public Web App API key you supplied will be used only for Firebase initialization. The saved `GOOGLE_API_KEY` will not be exposed to visitors. Analytics is optional and will stay disabled unless its public measurement ID is configured safely.

## Implementation
1. Add Firebase configuration and browser-safe initialization using your supplied project settings.
2. Replace Google sign-in, session tracking and protected-page checks with Firebase Auth. New Google accounts receive a profile automatically.
3. Replace application database calls with Firebase Realtime Database operations, including catalog/search, profiles, orders, customization, public surprise links and admin controls.
4. Keep roles in a protected role store. Verify identity and admin privileges on the server; never accept client-supplied roles, balances or payment success.
5. Preserve wallet approval and purchase rules using atomic, auditable transactions. Keep top-up payment initiation unavailable until the payment documentation arrives; never grant unverified credit.
6. Replace uploads and saved media references with Firebase Storage. Keep bundled template media intact.
7. Prepare an import for existing app data and uploaded media, preserving ownership through an explicit old-user-ID to Firebase-UID mapping. Do not assume that matching email addresses proves account ownership.
8. Switch application traffic only once required Firebase settings, permissions and checks pass. Remove application references to the old provider without editing integration-managed files. Do not remove the Cloud database or delete old data automatically.

## Setup needed before a complete cutover
- Enable Google sign-in in Firebase Authentication and authorize the app's preview and eventual published domains.
- Supply dedicated Firebase server credentials through a secure form for privileged operations and data import; never paste a private key into chat.
- Deploy restrictive Realtime Database and Storage rules to your Firebase project. This workspace does not currently have verified Firebase project administration access.
- An authorized export is needed for private legacy data that this project cannot read. Existing users and balances must not be silently dropped or reassigned.

If these prerequisites cannot be verified, keep the current working app connected until they are resolved rather than presenting a broken or partly migrated application as complete.

## Technical details
- Keep TanStack Start and its server functions; use Worker-compatible Firebase REST access and verified Firebase ID tokens for privileged operations, not a Node-only server SDK.
- Firebase SDK code initializes behind browser-safe boundaries; server secrets are read only inside server handlers.
- Security rules default to deny; public catalog/surprise reads are narrow, private records are owner-scoped, and ledger/admin writes are server-controlled.
- Keep managed Cloud integration files untouched; removing Cloud itself is a separate irreversible action that permanently deletes its database, storage and functions.

## Verification
- Tests for ownership, admin denial, banned accounts, price/balance validation, concurrent purchases and duplicate approvals.
- Exercise Google sign-in, automatic profile creation, catalog/search, orders, wallet and uploads against the configured Firebase project.
- Verify private data cannot be read by another account and public surprise pages reveal only intended fields.
- Report any Firebase setup or legacy import that remains unverified; do not claim full migration from configuration alone.
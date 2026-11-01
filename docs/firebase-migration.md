# Firebase migration setup

Status: foundations added; application cutover has NOT happened. The existing application still uses its current connection to avoid losing working sign-in, orders and wallet access.

## Configuration

Public Firebase Web App configuration lives in `src/lib/firebase-config.ts` and initializes only in browser effects/events via `getFirebaseServices`. Do not add service-account JSON or other private keys to it. No plaintext `env.txt` is required. Analytics is not enabled; saved Google secrets are not returned to the browser.

## Required Firebase administration

1. In Firebase Console, select **rahul-wish** and enable Google in Authentication → Sign-in method.
2. In Authentication → Settings → Authorized domains, add the app's preview hostname and later its published/custom hostname. Check Google popup/redirect behavior from the actual app.
3. Configure a dedicated service account with narrowly scoped database/storage permissions. Store its JSON using the secure `FIREBASE_SERVICE_ACCOUNT_JSON` secret form, not in source or chat.
4. Deploy the initial deny-by-default rules with Firebase CLI after signing into the intended project: `firebase deploy --only database,storage --project rahul-wish`. Do not use test-mode rules.
5. Import validated catalog and private records using a controlled server-side migration. Map legacy user IDs explicitly to verified Firebase identities before importing ownership, roles or balances.

## Proposed database layout

- `catalog/{templateId}`: active public catalog projection only; inactive templates remain in server-private source data.
- `publicSettings`: announcement/maintenance projection only; no payment API keys.
- `profiles/{uid}`: private profile and server-controlled ban/deletion flags.
- `roles/{uid}`: server-controlled role, never profile metadata.
- `accounts/{uid}`: private orders, deposits and immutable wallet ledger; privileged mutations use atomic transactions.
- `migration`: server-only readiness state and legacy identity mapping.

Public surprises will be served through narrow server functions that check order status and owner availability before exposing recipient fields and signed media. No direct public private-order reads are allowed. Storage initially denies all client access until authenticated server upload/delivery paths are implemented.

## Cutover gate

Verify Firebase credentials, Google provider/domains, deployed rules, imports/ownership, admin denial, bans, wallet atomicity, duplicate approval protection, surprise delivery and uploads before changing existing page calls. Do not remove the Cloud database automatically: removal permanently deletes its database, storage and functions. Payment initiation remains unavailable pending provider documentation.
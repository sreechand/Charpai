# Signup notifications — 2026-10-14

## Live and verified — 2026-10-14

Trigger inventory clarified to user: new unique launch-update signup and new app account → owner; successful new login session, story generation started, ready, or failed → account user. Duplicate contacts, session refresh/page reload, and transcription-only stages do not trigger emails. No payment receipts or signup welcome emails are currently implemented. Setup-check email is admin-only and manually triggered.

User approved the grouped setup. Saved all three Resend DNS records in Infomaniak; its existing mailbox and website records remain unchanged. Resend confirms `mail.charpai.sreechand.pm` is Verified. Created a sending-only key restricted to that domain and stored the full key privately in production Convex, along with the webhook signing secret. Sender: `Charpai <notifications@mail.charpai.sreechand.pm>`. Signup alerts go to the configured owner inbox; login and story events go to the account user (`EMAIL_USER_EVENTS_TO=user`). `EMAIL_ENABLED=true` in `elegant-mosquito-650`.

Published the notification hooks and official Resend component to production after a successful dry run and TypeScript check; no indexes deleted. The webhook listens for delivered, bounced, complained, delivery_delayed, failed, sent and suppressed events. A setup email and one controlled launch-update signup alert both reached **delivered**, confirmed by Resend and the signed callback recorded in Convex. Repeating the same signup returned the same record and produced exactly one notification/email. The test uses a reserved example.test address and must be excluded from customer counts. Existing contacts were not retroactively emailed; development fixtures remain unsent.

The first credential capture was a shortened preview; its test failed with an invalid-key error. Replaced it with the full 36-character sending key and verified delivery. An unused first restricted key named `Charpai production` remains in Resend; the active key is `Charpai production sender`. Remove the unused key during credential housekeeping. No secrets appear in this document or source.

Validation limits: production signup delivery and duplicate suppression are verified end to end. Login and generation event wiring passed the earlier development/auth and automated checks; a new production customer login/generation was not performed for this setup. Historical setup notes below describe earlier states and are superseded by this section.

Next: observe a real customer signup/login/story event during the upcoming session and check delivery; optionally remove the unused restricted key.

## Resend email services implemented — 2026-10-14

### Account and sender setup in progress

User completed Resend and Infomaniak sign-in. Verified `sreechand.pm` uses Infomaniak nameservers and has an existing Infomaniak mailbox; keep its MX/SPF/DKIM and website records intact. Created `mail.charpai.sreechand.pm` in Resend (ID `9347bbe2-e321-4120-9406-747f6364df4f`, Tokyo region), currently Not Started/unverified. Resend provides three required new records for this subdomain only:

- TXT at `resend._domainkey.mail.charpai.sreechand.pm`, containing Resend's generated public DKIM value shown in its domain detail page.
- CNAME at `rsend.mail.charpai.sreechand.pm` pointing to `rsend-apne1.forge.rmta.net`.
- CNAME at `send.mail.charpai.sreechand.pm` pointing to `send.forge.rmta.net`.

Infomaniak DNS search confirmed no existing `mail.charpai` records. Prepared the TXT form but did not save it. The computer-use tool requires action-time approval for granting new sending access/creating a persistent API credential; asked one grouped approval for these three verification records, the sending-only key and private Convex connection. No existing DNS records changed and no API key created yet. Keep sending disabled until this approval, verification, key setup and real delivery test are complete.

Prepared ignored, private `.env.resend.local` with an empty API-key slot, proposed sender `notifications@mail.charpai.sreechand.pm`, chosen owner inbox, default user recipient mode and sending disabled. `scripts/configure-resend.mjs --deployment <explicit target>` securely copies these settings into the named Convex deployment, masking all values; `--enable` is a separate explicit activation step. Do not enter keys into chat or commit this private file. Browser tabs are held for continuation.

User explicitly approved Resend and expanded scope to signup alerts, login alerts and story-generation updates. Implemented the official `@convex-dev/resend` component (0.2.9) with shared templates and a server-only notification module. Current assumed routing, disclosed while awaiting the optional preference reply: signup alerts go to the owner; login and story updates go to the account user. `EMAIL_USER_EVENTS_TO=user|owner|both` changes the latter routing without code changes. Identical owner/user addresses are deduplicated.

Events: new unique launch-update contact and new app account notify the owner; new successful authentication session triggers a login alert (token refresh/page reload do not); server-authorized compose/full generation triggers started and ready/failed updates. Transcription-only stages do not send story-generation alerts. Retry events are deduplicated per story and outcome. No transcript, recording, private story prose, password or provider key is sent in these emails.

The `emailNotifications` table stores event references, deduplication keys and queue state; the Resend component supplies provider queuing/retries. Notifications are scheduled after the originating transaction commits. Missing sender configuration leaves events pending and does not block signup, login or generation. Duplicate signup submissions do not overwrite contacts or trigger another alert. There is no public generic email-send API; recipient addresses come from trusted configuration or the authenticated user record. Signup template HTML escapes supplied fields. The signed Resend webhook endpoint is `/resend-webhook`; it rejects configuration-less requests and delegates signature checks/status updates to the official component.

Verification: 22 tests pass, TypeScript passes, lint has no errors (three warnings in the unrelated customer-flow script observed during an earlier pass). Tests cover contact/notification duplicates, user routing, same-address owner deduplication, unauthorized/unpaid generation rejection, failure-to-success retries, disabled/missing configuration and queue failure preserving signup data. On development `qualified-bullfrog-386`, real password signup/sign-in and duplicate waitlist submission produced exactly one account event, two login events and one waitlist event; all remain pending with delivery disabled. A real client call to an internal notification endpoint was refused. The component and hooks are pushed to development.

**Not completed:** no Resend API key or sender is configured, no real email has been sent or delivered, and this email work has not been promoted to production. Opened Resend setup in Chrome for user sign-in; last observed page is a login flow. No authentication credentials or API key were copied into documentation. The earlier provider-permission question below is historical and has now been resolved by explicit user approval.

### Activation settings (Convex deployment secrets)

- `RESEND_API_KEY`: Resend sending key; never a public frontend variable.
- `EMAIL_FROM`: an allowed/verified Resend sender, e.g. a Charpai address on a verified mail subdomain. The onboarding sender is limited by Resend's account restrictions and is not a production sender for customer emails.
- `EMAIL_OWNER_TO`: owner's chosen inbox for signup notifications and setup check.
- `EMAIL_USER_EVENTS_TO`: `user` by default; optional `owner` or `both`.
- `EMAIL_ENABLED`: `true` only after checking the sender and a controlled real test; unset/false holds events pending.
- `RESEND_WEBHOOK_SECRET`: signing secret for the Resend webhook at `https://elegant-mosquito-650.convex.site/resend-webhook` in production. Enable email lifecycle events in Resend to confirm delivery and bounce status.

Admin-only helpers: `notifications:sendTestEmail` sends a fixed setup-check message to the configured owner only; `notifications:emailStatus` checks the component status; `notifications:deliveryStatus` checks provider status for an event; `notifications:flushPending` schedules up to 50 pending notifications after activation. Do not flush development fixtures to real recipients. Existing pre-integration waitlist records are not retroactively emailed.

Next: user completes Resend sign-in or securely saves its API key in an ignored local file; configure an allowed sender and webhook, test a real owner email and its delivery, confirm recipient preference if supplied, review unrelated pending payment work before any whole-backend production deploy, release this integration to production and enable sending. Preserve existing app/launch settings and credits. No website release is inherently needed for these backend-only hooks.

## Initial request and count

User requested an email with each new signup's information and the current signup count. Scope is the homepage launch-update form, which saves to production Convex `waitlist`; both public homepages use that same backend.

Verified production count on `elegant-mosquito-650`: five waitlist records, two using reserved test email domains, three genuine launch-update signups. This counts launch-update contacts, not app authentication accounts. No contact details were printed or copied into this document.

Follow-up: user requested the three contacts. Retrieved genuine signup emails, the one available phone number, and signup timestamps for display in chat. Names were not supplied. Contact details remain out of project documentation/source. No records changed. Automatic email alerts still await provider approval.

No email-delivery setting exists in production Convex or the local environment files. Current Convex documentation recommends the official Resend component for queued delivery and retries. The latest user-supplied project instructions require asking before adding another service; implementation awaits permission to use this email provider.

Concrete proposed behavior: on a successful new waitlist insertion, queue one email to the owner's existing login email address with available name, email, optional phone, optional note, and signup time. Duplicate submissions must not send another email or overwrite stored contacts. Notification delivery must not delay or break signup saving; use the official Convex Resend component's queued delivery. Do not send welcome emails to signups or retroactively email all existing records unless requested.

Next: obtain provider permission, connect a Resend account/API key and allowed sender, implement the queued notification on new inserts, test duplicate suppression and delivery using fictional data, deploy to production, and verify one alert arrives. Do not store API keys or unnecessary signup information in source or documentation.

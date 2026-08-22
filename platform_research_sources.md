# Platform Research Sources

## Supabase

- Pricing: https://supabase.com/pricing
  - Free plan currently lists 50,000 monthly active users, 500 MB database storage, 1 GB storage, 500,000 Edge Function invocations, and pauses free projects after one week of inactivity.
  - Free plan has no automatic backups and one-day API/database log retention.
- Auth: https://supabase.com/docs/guides/auth
  - Supports password, magic-link, OTP, social login, and phone-auth integrations through third-party providers.
  - Auth uses JWTs and works with Postgres Row Level Security for per-row authorization.
- Scheduled Functions: https://supabase.com/docs/guides/functions/schedule-functions
  - Hosted Supabase supports `pg_cron` and `pg_net` to invoke Edge Functions on a recurring schedule.
  - Supabase recommends Vault for securely storing function-call credentials.
- pg_cron: https://supabase.com/docs/guides/database/extensions/pg_cron
  - Provides recurring jobs with cron syntax in Postgres.

## Indian communication providers

- MSG91 developer portal: https://msg91.com/developers
  - Provides APIs for SMS, OTP verification, Text, Voice and Email and includes message logs/webhooks.
- Exotel Voice v1: https://developer.exotel.com/docs/voice-v1/overview
  - Provides API-based call automation, number-to-number connection, IVR flows, call-status callbacks, and HTTP Basic Auth.
  - Documents a rate limit of 200 voice calls/minute and states including queued, in-progress, completed, failed, busy, and no-answer statuses.

## Voice generation

- Google Cloud Text-to-Speech pricing: https://cloud.google.com/text-to-speech/pricing
  - Billing must be enabled.
  - Legacy Standard voices list up to 4 million free characters/month; latest model free allocations vary and should be checked before launch.
  - Pricing is character-based and usage monitoring is recommended.

## Python model hosting

- Google Cloud Run pricing: https://cloud.google.com/run/pricing
  - Request-based services list a free tier of 2 million requests/month plus CPU and RAM allowances; billing is still required.
  - Supports Mumbai (`asia-south1`) as a Tier 1 listed region.
- Render free plan: https://render.com/docs/free
  - Free web services may spin down after 15 minutes idle, can take about one minute to return, and are not recommended for production.
  - Free PostgreSQL expires after 30 days and has no backups.
- Hugging Face Spaces: https://huggingface.co/docs/hub/en/spaces-overview
  - Static Spaces are free; Gradio/Docker compute Spaces require a paid plan except specified ZeroGPU cases.
  - Free compute can sleep when unused, so it is not a reliable production ML API.

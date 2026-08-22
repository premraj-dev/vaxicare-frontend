# VaxiCare Backend: Platform and API Selection Guide

## Decision Summary

For the current VaxiCare project, use a **two-layer backend**. Keep the public-health data, role access, areas, children, vaccination records, intervention logs, and reminder-event records in **Supabase Postgres**. Use a small **FastAPI service on Google Cloud Run** only for the Python Logistic Regression model and the business workflow that needs the exported `.joblib` model. Use **MSG91** for Indian SMS and OTP delivery, **Google Cloud Text-to-Speech** for the Marathi/Hindi/English audio file, and **Exotel** for actual automated calls or ASHA/calling-agent flows.

> **Free is suitable for development and demonstration; it is not the same as free live delivery.** SMS and telephone calls consume telecom-provider resources and should be budgeted as paid production services. The safest approach is to use free tiers for the database, frontend, test messages, and model API, then activate paid message/call delivery only when the core workflow is verified.

| Layer | Recommended platform | Why it fits VaxiCare | Prototype cost position |
|---|---|---|---|
| Current frontend | Existing VaxiCare frontend | The user interface, mock flows, dashboards, and role navigation already exist | Already built |
| Core database, auth, storage | **Supabase** | Managed Postgres, JWT auth, Row Level Security, storage, generated APIs, Edge Functions, and database cron in one platform | Free tier available; free projects pause after one week of inactivity [1] |
| Python model API | **Google Cloud Run + FastAPI** | Serves the exported Logistic Regression `.joblib` model without rewriting it in JavaScript | Free usage allowances exist, but billing must be enabled [8] |
| Optional no-Python model alternative | Supabase Edge Function | A later option if Logistic Regression coefficients are exported to JSON and scored in TypeScript | Uses the Supabase platform |
| Parent OTP and SMS reminders | **MSG91** | India-oriented messaging/OTP APIs, logs, and webhooks | Test/quote dependent; live SMS is not a permanently free service [5] |
| Voice audio generation | **Google Cloud Text-to-Speech** | Produces stable Marathi, Hindi, and English MP3/WAV reminder audio | Character-based usage; legacy Standard TTS includes a free monthly allowance, billing is required [7] |
| Automated calls and calling-agent flow | **Exotel Voice API** | Supports call automation, IVR, call-status callbacks, and call flows | Paid/quote dependent for live calling [6] |
| Daily reminder scheduler | **Supabase Cron + Edge Function** | Runs the D−4 to D−1 and overdue jobs without relying on a user opening the web app | Included platform capability; validate active-plan limits before launch [3] |
| Prototype-only ML hosting alternative | Render Free | Can host a FastAPI demo quickly | Not suitable for production because free services can spin down after 15 minutes idle [9] |

## 1. Choose One of These Two Platform Paths

### Path A — Recommended for this VaxiCare project

Keep the website in its existing managed project, upgrade it to a full-stack project when implementation begins, and use the project backend/database for the VaxiCare APIs. Attach only the communication and voice providers as external services. This is the simplest operational path because the frontend, authentication, database, storage, routes, and secret management stay in one project.

| Component | Platform decision | What you implement |
|---|---|---|
| Project backend | Existing project upgraded to full-stack | Backend routes, database tables, authenticated APIs, secure secrets |
| Communication | MSG91 + Exotel | SMS/OTP delivery and voice/call workflows |
| Voice audio | Google Cloud Text-to-Speech | Generate stored audio for reminders before calling |
| ML model | FastAPI service, initially on Cloud Run | `POST /predict` using the exported model files |
| Scheduler | Project schedule or Supabase Cron equivalent | Daily 08:00 Asia/Kolkata reminder job |

This is the preferred path if the goal is a coherent application rather than a collection of separate student-demo services.

### Path B — Free-first independent prototype

Use **Supabase Free** as database/auth/storage/cron and **Cloud Run** for FastAPI model serving. Supabase’s free plan currently includes 500 MB database storage, 50,000 monthly active users, 1 GB storage, and free Edge Function invocations, but projects pause after one week of inactivity and the free plan has no automatic backups. [1] Cloud Run lists free request, CPU, and memory allowances, although a billing account is still required. [8]

| Use this for | Do not use this for |
|---|---|
| Hackathon, classroom demo, pilot with synthetic data, portfolio build | Guaranteed live reminders, production patient records, long-term audit requirements, legally accountable service delivery |

Do **not** select Render Free as the permanent reminder backend. Render explicitly documents that free web services spin down after 15 minutes idle, may take around a minute to return, and are not recommended for production. [9]

## 2. Exact Service Selection

| Requirement | Best choice | API/service to use | Why | Fallback |
|---|---|---|---|---|
| Parent OTP | MSG91 | OTP/Verify API | Same provider can manage OTP and message logs | Supabase phone auth with a configured third-party SMS provider |
| Parent SMS reminder | MSG91 | Transactional SMS API + delivery webhook | Better fit for India-specific message delivery and operational logs | Another approved Indian transactional SMS provider after procurement review |
| Parent voice reminder file | Google Cloud Text-to-Speech | Text-to-Speech API | Supports stable server-side synthesis; generate and save audio before call | Continue gTTS only for the demo, not as the operational provider |
| Outbound voice call | Exotel | Voice v1 call/flow API | Programmatic call flows and status callbacks are available; it documents a 200 calls/minute API rate limit [6] | Human calling-agent task only during initial pilot |
| ASHA task alert | VaxiCare in-app task + optional SMS | Internal `/interventions` API | The dashboard should be the source of truth for field work | Add push notifications after core workflow works |
| Parent/ASHA login | Supabase Auth or project Auth | OTP/password/JWT/RLS | Supports JWTs and Row Level Security for scoped access [2] | Custom auth only if an existing government identity system must be integrated |
| Area/Panchayat database | Supabase Postgres or project DB | Database API / server routes | Relationship-heavy data suits relational Postgres | Do not use a spreadsheet as production source of truth |
| Daily scheduling | Supabase Cron + Edge Function | `pg_cron` + scheduled function | Supabase documents scheduled Edge Functions using `pg_cron` and `pg_net` [3] | Cloud Scheduler + Cloud Run job |
| Model API | FastAPI on Cloud Run | `POST /api/v1/ml/predict` | Directly loads the existing `.joblib` and feature JSON | Supabase Edge Function after coefficient conversion |

## 3. What Is Actually Free and What Is Not

| Component | Can start free? | Important condition |
|---|---:|---|
| Supabase database/auth/storage | Yes | Free plan is suitable for the prototype but pauses after inactivity and does not include automatic backups [1] |
| Supabase cron/Edge Functions | Usually yes for prototype usage | Confirm current account/project limits before going live; secrets must be stored safely [3] |
| Cloud Run FastAPI model API | Yes, within free allowances | Google requires a billing account; usage over the allowance is chargeable [8] |
| Google TTS | Partly | Billing must be enabled; free monthly character allowance is limited and model dependent [7] |
| MSG91 SMS/OTP | Test/quote dependent | Live SMS normally has a provider/carrier cost; verify current plan and messaging compliance before launch [5] |
| Exotel voice calls | No permanent free live plan assumption | Budget for real calls and use the provider’s test/sandbox process first [6] |
| gTTS | Good for Colab demo | Not the recommended production delivery platform for a health reminder service |
| Render Free FastAPI | Yes for a demo | Service sleeps after inactivity and is not reliable for daily automated reminders [9] |

## 4. API Integration Map

### VaxiCare Frontend to Backend

| Frontend screen | Backend endpoint | Backend action |
|---|---|---|
| Parent login | `POST /auth/otp/send`, `POST /auth/otp/verify` | Send/verify OTP and create parent session |
| ASHA login | `POST /auth/login` | Validate credentials and return role/area assignment |
| Area Registration | `POST /api/v1/areas` | Create Gram Panchayat, village, taluka, or municipal area record |
| Register Child | `POST /api/v1/children` | Link child to parent, area, ASHA worker, and vaccination baseline |
| Child vaccination timeline | `GET /api/v1/children/:childId/vaccinations` | Return past records and calculated next dose |
| Parent reminders | `GET /api/v1/parents/me/reminders` | Return scheduled, sent, overdue, and completed reminder events |
| Vaccination entry | `POST /api/v1/vaccinations` | Save actual dose, update next due date, recalculate risk, and queue reminders |
| ASHA risk queue | `GET /api/v1/asha/me/priority-queue` | Return High → Medium → Low → Normal cases with action reason |
| ASHA intervention | `POST /api/v1/interventions` | Record call, reminder, visit, follow-up, outcome, and next action |
| Analytics dashboard | `GET /api/v1/areas/:areaId/analytics` | Return risk counts, coverage, overdue cases, and intervention performance |

### Communication Providers to Backend

| Provider event | Backend webhook endpoint | Required handling |
|---|---|---|
| MSG91 message delivery update | `POST /webhooks/msg91/delivery` | Validate signature, update `notification_deliveries`, mark reminder as delivered/failed |
| MSG91 OTP event | Provider callback or direct verify result | Update OTP request verification state |
| Exotel call status | `POST /webhooks/exotel/call-status` | Store queued, in-progress, completed, busy, no-answer, or failed state [6] |
| Google TTS generation result | Internal job result | Save protected audio path in `reminder_events.audio_url` |

## 5. Daily Reminder Implementation

The reminder scheduler is the critical backend component. It should run **once each morning in the Asia/Kolkata timezone**, not in the browser and not only when an ASHA opens the dashboard.

### Daily Job Algorithm

| Step | Backend operation |
|---|---|
| 1 | Find all active children with a valid `next_dose_due_date` and a parent communication preference |
| 2 | Calculate the fixed level from `missed_dose_count`: 0 Normal, 1 Low, 2 Medium, 3+ High |
| 3 | Match the current date to D−1, D−2, D−3, D−4, due today, or overdue |
| 4 | Create the proper `reminder_event` only if it does not already exist for that child, due date, sequence, and channel |
| 5 | Render the reminder message in Marathi, Hindi, or English according to `preferred_language` |
| 6 | Send SMS; optionally generate the audio file and start the Exotel call/flow |
| 7 | For Medium, High, due-today, or overdue cases, create an ASHA intervention/task with the recommended action |
| 8 | Store provider response; retry only safe failed states and show delivery status in Parent and ASHA interfaces |

### Rule Table to Implement Exactly

| Condition | Level | Schedule | Parent delivery | ASHA task |
|---|---|---|---|---|
| 0 missed doses | Normal | D−1 | One SMS or voice reminder | No urgent task; visible in routine monitoring |
| 1 missed dose | Low | D−2, D−1 | Two reminders | Monitoring queue |
| 2 missed doses | Medium | D−3, D−2, D−1 | Three reminders | Calling-agent/ASHA follow-up task |
| 3+ missed doses | High | D−4, D−3, D−2, D−1 | Four reminders | Home-visit plus call task |
| Due today or overdue | Any | Immediate | Immediate message/voice | Urgent ASHA task |

## 6. Exact Implementation Order

### Stage 1 — Create accounts and project secrets

1. Create the primary database/auth project in Supabase or enable the integrated full-stack backend for the existing VaxiCare project.
2. Create a Google Cloud project and enable Cloud Run plus Text-to-Speech. A billing account is needed even if you stay below the free allowance. [7] [8]
3. Create MSG91 and Exotel development accounts. Do not place API keys in the frontend; keep them only in server secrets.
4. Decide the one initial area: for example, `AREA-MH-PUNE-001`, then create the first ASHA worker and one test parent/child.

### Stage 2 — Build persistent data and access

1. Create the tables from the backend checklist: users, areas, ASHAs, parents, children, vaccinations, risk assessments, reminders, interventions, and deliveries.
2. Add parent, ASHA, and supervisor roles.
3. Add Row Level Security or server authorization checks so parents can see only their own children and ASHAs can see only their assigned area. Supabase Auth uses JWTs and supports RLS for this scoped access pattern. [2]
4. Connect the existing Area Registration form to `POST /areas` and replace its prototype success message with a real database response.

### Stage 3 — Build child and vaccination workflows

1. Connect Parent Register Child to `POST /children`.
2. Connect ASHA Record Dose to `POST /vaccinations`.
3. After every vaccination save, compute the next vaccination date and current missed-dose count.
4. Write the new `risk_assessments` record and regenerate only future reminder events for the changed child.

### Stage 4 — Deploy the ML service

1. Package the Colab model file `final_logistic_model.joblib` and `model_feature_columns.json` inside a FastAPI service.
2. Add a protected endpoint: `POST /api/v1/ml/predict`.
3. In the service, build exactly the approved 17 raw features, one-hot encode them, align to the saved 25-feature schema, and return probability and class.
4. Deploy the container to Cloud Run. For prototype traffic, its published free allowance may be enough, but billing still needs to be enabled. [8]
5. Call this service only from backend code, never directly from the browser.

### Stage 5 — Build the scheduler and reminder-event engine

1. Implement the fixed rule table in a backend function called `build_reminder_plan()`.
2. Create an idempotent event creator that will not duplicate an event when the daily job is rerun.
3. Schedule the job at 08:00 Asia/Kolkata through Supabase Cron plus an Edge Function, or through Cloud Scheduler plus a protected Cloud Run endpoint. Supabase documents recurring Edge Function calls using `pg_cron` and `pg_net`. [3]
4. Test a Tuesday due date: Normal sends Monday; Low sends Sunday/Monday; Medium sends Saturday/Sunday/Monday; High sends Friday through Monday.
5. Test overdue dates to prove immediate actions are created only once.

### Stage 6 — Add live SMS, voice, and call delivery

1. Integrate MSG91 OTP first so Parent login works with a real mobile number.
2. Add MSG91 transactional reminder SMS with the reminder-event ID as metadata.
3. Store message provider IDs and delivery updates through webhooks.
4. Use Google Text-to-Speech to generate the voice file in the parent’s preferred language. The current Google service is character-billed, so set quota alerts. [7]
5. Use Exotel call/flow APIs only after the text and audio flow works. Record call callbacks and translate final states into intervention outcomes. [6]

### Stage 7 — Connect the frontend

1. Replace every `mockApi.ts` call with an authenticated backend service call.
2. Keep loading, empty, error, retry, and success states in the frontend.
3. Show reminder delivery status to parents without exposing provider keys or unrelated child records.
4. Show only the logged-in ASHA worker’s area queue, interventions, and analytics.
5. Add an admin/supervisor screen only after access rules are proven.

## 7. Minimum Viable Live Demonstration

A good live demonstration does not need every provider activated at once. Build this first:

| Demo action | Live result to show |
|---|---|
| ASHA registers `AREA-MH-PUNE-001` | Area is stored in the database and visible only to authorised ASHAs |
| Parent registers child | Child is linked to parent and area |
| ASHA records a vaccine | Next dose is calculated and child dashboard refreshes |
| Scheduler is run manually once | Correct Normal/Low/Medium/High reminder event rows are generated |
| Test SMS is sent | Backend stores provider ID and delivery state |
| High/overdue child created | ASHA queue shows immediate follow-up task |
| Parent opens dashboard | Shows next dose, reminder history, and current risk state |

## 8. Do Not Do These Things

| Avoid | Why |
|---|---|
| Sending SMS/call API keys to React code | Any user could extract and misuse them |
| Using free Render as the daily reminder engine | It can sleep and is explicitly not intended for production use [9] |
| Making the frontend decide the final reminder schedule | Browser data is editable and runs only while a user is present |
| Letting ML probability override the approved missed-dose policy | The fixed policy is the operational rule; ML is a secondary priority signal |
| Treating the 100-child synthetic dataset as clinical evidence | It validates the workflow, not real-world prediction performance |
| Creating duplicate reminders on every scheduler run | Use unique idempotency keys and delivery status checks |

## 9. Final Recommendation

Start with **Supabase + FastAPI on Cloud Run + MSG91 sandbox/testing + Google TTS test output**. This gives you a mostly free prototype path while keeping the real architecture close to production. Introduce **Exotel only after the SMS and reminder-event state machine is proven**. Before using real parent data or real automated calls, move to a plan with dependable uptime, backups, delivery-provider approval, security review, and operating budget.

## References

[1]: https://supabase.com/pricing "Supabase Pricing"
[2]: https://supabase.com/docs/guides/auth "Supabase Auth Documentation"
[3]: https://supabase.com/docs/guides/functions/schedule-functions "Supabase Scheduled Edge Functions"
[4]: https://supabase.com/docs/guides/database/extensions/pg_cron "Supabase pg_cron Documentation"
[5]: https://msg91.com/developers "MSG91 Developer Platform"
[6]: https://developer.exotel.com/docs/voice-v1/overview "Exotel Voice v1 API"
[7]: https://cloud.google.com/text-to-speech/pricing "Google Cloud Text-to-Speech Pricing"
[8]: https://cloud.google.com/run/pricing "Google Cloud Run Pricing"
[9]: https://render.com/docs/free "Render Free Instances"

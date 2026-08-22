# VaxiCare Backend Implementation Checklist

## Purpose

The current VaxiCare project has a working frontend and a validated Colab prototype for ML prediction, fixed risk rules, reminders, voice-message generation, and ASHA ranking. The backend is the next layer that makes these workflows persistent, secure, and automatic.

> **Important:** The live backend must own the child records, calculate reminder jobs, record delivery results, and expose dashboard APIs. The frontend should never decide the final reminder schedule by itself.

## 1. Backend Foundation

| Work item | What to build | Completion condition |
|---|---|---|
| Full-stack project capability | Upgrade the static frontend to a backend/database-enabled project | Server routes, database access, user sessions, and secrets are available |
| Environment configuration | Store database, SMS, calling-agent, and model settings as secrets | No provider key or personal data is hard-coded in frontend code |
| API convention | Use versioned JSON endpoints such as `/api/v1/...` | Frontend services have a stable API contract |
| Background worker | Add a secure scheduled job runner for daily reminder generation | Reminder jobs execute without a user opening the website |
| File storage | Create protected storage for voice reminders and model artifacts | Generated audio and the ML model can be accessed by authorised workflows only |

## 2. Database Schema

The backend should use a relational database, such as PostgreSQL, because the project has clear relationships among parents, children, ASHA workers, areas, vaccinations, reminders, and interventions.

| Table | Required fields | Purpose |
|---|---|---|
| `users` | `id`, `role`, `phone`, `password_hash`, `is_active`, timestamps | Login identity for Parent, ASHA worker, supervisor/admin |
| `parent_profiles` | `user_id`, `name`, verified phone, preferred language, address/location fields | Parent account details and communication preference |
| `asha_profiles` | `user_id`, `asha_id`, name, phone, `area_id`, status | ASHA assignment and dashboard access control |
| `areas` | `area_id`, type, state, district, taluka, village, pin code | Gram Panchayat, village, taluka, or municipal-area data |
| `children` | `child_id`, parent ID, `area_id`, ASHA ID, DOB, gender, QR ID | Child identity and area assignment; do not pass PII to ML inputs |
| `vaccination_records` | child ID, vaccine, dose, scheduled date, actual date, status, delay days, recorder ID | Dose history and next-dose calculation source |
| `risk_assessments` | child ID, risk level, probability, model version, features snapshot, created time | Stores each generated ML/rule result for explanation and audit |
| `reminder_events` | child ID, risk level, sequence, scheduled time, channel, status, message, audio URL | Durable record of every SMS, voice, or calling reminder |
| `interventions` | child ID, ASHA ID, type, note, scheduled time, completed time, result | Calls, visits, follow-ups, and resolution tracking |
| `notification_deliveries` | reminder event ID, provider message ID, sent time, delivery result, failure reason | Provider-level delivery audit and retry support |
| `otp_requests` | phone, OTP hash, expiry, verification state, attempt count | Secure parent phone verification |
| `audit_logs` | actor, action, entity type, entity ID, timestamp, context | Records high-impact changes and protects programme accountability |

Create indexes for `children.area_id`, `children.asha_id`, `vaccination_records.child_id`, `reminder_events.scheduled_at`, `reminder_events.status`, and `interventions.asha_id` so dashboard queries remain fast.

## 3. Authentication and Access Control

| Module | API endpoints | Required behavior |
|---|---|---|
| Parent OTP login | `POST /auth/otp/send`, `POST /auth/otp/verify` | Send, validate, expire, and rate-limit OTPs; create a parent session only after verification |
| ASHA login | `POST /auth/login`, `POST /auth/logout`, `GET /auth/me` | Authenticate worker ID/password, return role and assigned `area_id` |
| Registration | `POST /parents`, `POST /asha-workers` | Validate phone uniqueness, Area ID validity, and role-specific fields |
| Role guards | Middleware for Parent, ASHA, supervisor/admin | Parents see only linked children; ASHAs see only their assigned area; supervisors see permitted aggregate records |
| Sessions | Secure HTTP-only cookies or short-lived access token plus refresh token | Logout removes/revokes session; idle session expiry is enforced |

## 4. Area, Parent, Child, and Vaccination APIs

| API group | Core endpoints |
|---|---|
| Area / Gram Panchayat | `POST /areas`, `GET /areas/:areaId`, `PUT /areas/:areaId`, `GET /areas/:areaId/dashboard` |
| ASHA assignment | `GET /areas/:areaId/asha-workers`, `PUT /asha-workers/:id/area` |
| Parent profile | `GET /parents/me`, `PUT /parents/me` |
| Child profile | `POST /children`, `GET /children/:childId`, `PUT /children/:childId`, `GET /parents/me/children` |
| QR identity | `POST /children/:childId/qr`, `GET /children/by-qr/:qrCodeId` |
| Vaccination records | `POST /vaccinations`, `GET /children/:childId/vaccinations`, `PUT /vaccinations/:id` |
| Next dose calculation | `GET /children/:childId/next-dose` | Return vaccine name, dose number, `next_dose_due_date`, overdue status, and allowed reminder schedule |

Every vaccination write should recalculate or queue recalculation of the child’s next dose, missed-dose count, risk assessment, and reminder schedule.

## 5. ML Prediction Service

The backend should load the final Logistic Regression model and encoded-feature schema exported from Colab. The model service must use only approved, non-PII features.

| Work item | Required implementation |
|---|---|
| Model storage | Store `final_logistic_model.joblib` and `model_feature_columns.json` in protected server storage or model registry |
| Prediction endpoint | `POST /ml/predict-child-risk` returns dropout probability, predicted class, model version, and explanation inputs |
| Feature builder | Derive `age_months`, encode allowed categorical values, and preserve exact feature order from `model_feature_columns.json` |
| Trigger point | Re-score after a vaccination entry, relevant child-history update, scheduled nightly review, or manual ASHA refresh |
| Audit result | Create a `risk_assessments` record with probability, risk level, model version, and timestamp |
| Safety rule | The ML result supports ASHA ranking; fixed reminder intensity remains controlled by missed-dose rules unless your programme policy changes |

## 6. Reminder Rules Engine

The backend must generate reminders for **all children with an upcoming dose**. The fixed schedule below is the current approved programme logic.

| Child condition | Risk level | Reminder dates relative to due date | Backend work |
|---|---|---|---|
| `missed_dose_count = 0` | Normal | D−1 | Create one scheduled SMS/voice event |
| `missed_dose_count = 1` | Low | D−2 and D−1 | Create two events and include in ASHA monitoring |
| `missed_dose_count = 2` | Medium | D−3, D−2, D−1 | Create three events and a calling-agent task |
| `missed_dose_count >= 3` | High | D−4, D−3, D−2, D−1 | Create four events, a calling task, and ASHA home-visit task |
| Due today or overdue | Any | Immediate | Send immediate reminder and create urgent ASHA follow-up |

### Required Job Design

1. Run a daily scheduler at a defined local time, for example 08:00 Asia/Kolkata.
2. Query active children with a future, due-today, or overdue `next_dose_due_date`.
3. Calculate fixed risk from `missed_dose_count`.
4. Generate required event dates from D−4 through D−1, or an immediate overdue event.
5. Insert reminder events idempotently, using a unique key such as child ID + due date + reminder sequence + channel.
6. Send only events that are due and still have `Pending` status.
7. Record provider response, delivery result, retry count, and failure reason.
8. Create/upgrade ASHA intervention tasks for Medium, High, and overdue cases.

## 7. Communication Delivery Integrations

| Channel | Backend responsibility |
|---|---|
| SMS | Generate language-appropriate text, submit to the SMS provider, store provider ID, update delivery status, and retry failed non-terminal messages |
| Voice reminder | Generate or retrieve a Marathi, Hindi, or English audio file; store protected file URL; submit to calling workflow if needed |
| Calling agent | Create a call task containing child name, due date, risk, parent contact, script, and escalation instruction |
| ASHA notification | Create in-app task, push notification, and/or daily queue entry for Medium, High, and overdue children |
| Parent preference | Respect preferred language and allowed channel preference; retain delivery opt-out/legal-consent handling as required by programme policy |

## 8. ASHA Dashboard APIs

| Need | Endpoint / response |
|---|---|
| Priority queue | `GET /asha/me/priority-queue` sorted High → Medium → Low → Normal, then overdue days and priority score |
| Dashboard cards | `GET /asha/me/dashboard-summary` returns total children, vaccinated, pending, overdue, high risk, and interventions due |
| Child list | `GET /asha/me/children?risk=High&status=overdue` with pagination and search |
| Action logging | `POST /interventions` for call, reminder, visit, and follow-up tasks |
| Intervention completion | `PATCH /interventions/:id` records completed time, note, and outcome |
| Area analytics | `GET /areas/:areaId/analytics` returns coverage, risk counts, overdue counts, and intervention performance |

The priority score should include fixed risk rank first, then overdue days, missed-dose count, and the ML dropout probability as a secondary signal.

## 9. Security, Privacy, and Quality Controls

| Control | Required action |
|---|---|
| PII protection | Encrypt sensitive fields at rest where appropriate; never expose Aadhaar/raw phone data to the ML feature payload |
| Transport security | Enforce HTTPS, secure cookies, CORS allow-list, and CSRF strategy when using cookie authentication |
| Authorization | Verify every child, area, ASHA, and intervention query against the authenticated user’s role and area assignment |
| Input validation | Validate every API payload with a schema library such as Zod or Pydantic; reject invalid dates, missing identifiers, and invalid risk values |
| Auditability | Log vaccination edits, reminder changes, ASHA assignments, manual risk overrides, and intervention outcomes |
| Scheduler reliability | Use idempotency, retries, dead-letter/error logging, and monitoring so reminders are not duplicated or silently skipped |
| Model governance | Version the ML model, preserve assessment history, and show that the model is prototype evidence until validated on real data |

## 10. Testing Checklist

| Test category | Must prove |
|---|---|
| Unit tests | Risk-rule calculation, D−1/D−2/D−3/D−4 scheduling, overdue handling, priority scoring, feature encoding |
| API tests | Authorization, validation errors, parent-to-child access boundaries, ASHA area restrictions |
| Scheduler tests | Idempotent event creation, retry behavior, timezone correctness, no duplicate sends |
| Integration tests | Vaccination entry updates next dose, recalculates risk, and creates/updates reminders |
| Provider sandbox tests | SMS, voice, and call task payloads send correctly and delivery callbacks update status |
| End-to-end tests | Parent login → child profile → vaccination update → reminder → ASHA action → resolved intervention |
| Load and security tests | Area queue pagination, login/OTP rate limits, session expiry, access attempts across different areas |

## 11. Recommended Build Order

| Phase | Build first | Why it comes first |
|---|---|---|
| 1 | Full-stack capability, database, auth, and role guards | All later data must be secure and scoped to the correct user |
| 2 | Areas, ASHA profiles, parent profiles, and children APIs | Establishes the core relationship model |
| 3 | Vaccination records and next-dose calculation | Provides the factual source for reminders and dashboard state |
| 4 | Fixed reminder engine and scheduled jobs | Makes the Normal/Low/Medium/High workflow actually run daily |
| 5 | ASHA queue and intervention APIs | Converts reminders into operational frontline work |
| 6 | SMS, voice, and calling-agent integrations | Enables real delivery after event creation is reliable |
| 7 | ML model service and risk-assessment history | Adds probability-based prioritisation without replacing programme rules |
| 8 | Analytics, audit logs, monitoring, and production hardening | Makes the system supportable at programme scale |

## Completion Definition

The backend is fully working when a new or updated child record can be securely saved, the next due date can be computed, the correct Normal/Low/Medium/High reminder events are generated automatically, delivery is logged, the parent receives the selected channel notification, and the ASHA dashboard shows the correct queued action for authorised workers.

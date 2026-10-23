# VaxiCare — Frontend

**VaxiCare** is an AI-powered child vaccination dropout-risk platform. It helps ASHA workers identify and prioritize children at risk of missing upcoming vaccinations, and gives parents a simple way to track their child's immunisation journey.

This repo is the **frontend** (Parent Portal + ASHA Portal). It connects to [`vaxicare-ml-api`](https://github.com/premraj-dev/vaxicare-ml-api), the ML/backend engine that predicts dropout risk and drives reminders.

---

## ✨ Key Features

### For Parents
- **Dashboard** — circular vaccination-progress ring, "what's next" dose card, risk status at a glance
- **Visual vaccine timeline** — color-coded dose status (completed / scheduled / action needed)
- **Reminder plans** — API-generated schedule for upcoming doses with language options
- **Digital health card** — QR-based child health pass

### For ASHA Workers
- **Risk queue** — assigned children sorted by latest stored ML priority score
- **Village workload** — assigned children grouped by their village
- **Explainable risk reasons** — top 2–3 human-readable drivers per flagged child
- **Live dashboard counts** — vaccination, overdue, risk, and intervention counts from Supabase
- **Action modal** — record a call, reminder, follow-up, or home visit in one flow

---

## 🧠 How Risk Scoring Works

Dropout risk is predicted by a Logistic Regression model (via `vaxicare-ml-api`) trained on historical dose adherence, seasonal factors, and geography — not just missed-dose count. ML probability is the primary ranking signal; missed doses act only as a minimum risk floor, so a child with zero missed doses but a high predicted risk still surfaces early.

| Metric | Score |
|---|---|
| PR-AUC | 0.9982 |
| Precision | 91.8% |
| Recall | 100% |
| Recall@Top-10% | 88.9% |
| Recall@Top-20% | 100% |

---

## 🛠 Tech Stack

- **Frontend:** React + TypeScript + Vite
- **UI:** shadcn/ui, Tailwind CSS
- **Backend (this repo):** Node / Express (`server/`)
- **ML Engine:** FastAPI + scikit-learn ([`vaxicare-ml-api`](https://github.com/premraj-dev/vaxicare-ml-api))

---

## 📁 Project Structure

```
vaxicare-frontend/
├── client/          # React app (Parent + ASHA portals)
├── server/          # Express backend
├── shared/          # Shared types/schemas
├── patches/         # Dependency patches
└── vite.config.ts
```

---

## 🚀 Getting Started

```bash
# Clone
git clone https://github.com/premraj-dev/vaxicare-frontend.git
cd vaxicare-frontend

# Install
pnpm install

# Frontend .env.local settings. The anon key is public; never use a service-role key here.
# VITE_API_URL=http://127.0.0.1:8000
# VITE_SUPABASE_URL=https://your-project.supabase.co
# VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Run
pnpm run dev
```

For local Supabase-backed dashboards and password auth, set the frontend variables above, configure the backend `.env` using [`vaxicare-ml-api/.env.example`](../vaxicare-ml-api/.env.example), apply the migrations in `vaxicare-ml-api/migrations/` in Supabase SQL Editor, and start the API at `http://127.0.0.1:8000`.

---

## 🔐 Authentication

Email/password signup and login use the Supabase JavaScript client. Enable email confirmations in Supabase Auth; signup stores the selected `parent` or `asha` role in user metadata and the UI asks users to verify their email before logging in. The ASHA role selector is self-selected, so production deployments should add invite or administrator approval before granting ASHA access. The Supabase anon key is safe for browser use when Row Level Security is configured; never expose the service-role key. Authenticated dashboard requests carry the user's Supabase bearer token to the FastAPI backend.

## Demo data commands

From this frontend folder, with backend `.env` configured. `seed:demo` also requires the API to be running:

```powershell
pnpm run seed:demo
pnpm run seed:clear
```

The commands use the service-role key from `vaxicare-ml-api/.env`; `seed:demo` calls the local model API, while `seed:clear` does not. Clear removes only rows/accounts marked `is_demo = true`. Never put the service-role key in frontend environment variables.

## Validation

```powershell
pnpm run check
pnpm run build
```

---

## 📍 Core Demo Flow

```
Login → ASHA Dashboard → Risk Queue (assigned-child priority) → Action log
```

---

## 📄 License

This project was built as part of a hackathon submission. License TBD.

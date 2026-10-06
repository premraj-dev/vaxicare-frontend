# VaxiCare — Frontend

**VaxiCare** is an AI-powered child vaccination dropout-risk platform. It helps ASHA workers identify and prioritize children at risk of missing upcoming vaccinations, and gives parents a simple way to track their child's immunisation journey.

This repo is the **frontend** (Parent Portal + ASHA Portal). It connects to [`vaxicare-ml-api`](https://github.com/premraj-dev/vaxicare-ml-api), the ML/backend engine that predicts dropout risk and drives reminders.

---

## ✨ Key Features

### For Parents
- **Dashboard** — circular vaccination-progress ring, "what's next" dose card, risk status at a glance
- **Visual vaccine timeline** — color-coded dose status (completed / scheduled / action needed)
- **Smart reminders** — automated reminder plan with SMS + voice playback (Marathi / Hindi / English)
- **Digital health card** — QR-based child health pass

### For ASHA Workers
- **Risk queue** — children ranked by ML-predicted dropout probability, not just missed-dose count
- **Village-level capacity queue** — visit lists grouped by village and capped to daily visit capacity
- **Explainable risk reasons** — top 2–3 human-readable drivers per flagged child
- **Daily automated scoring** — one-tap batch re-scoring of all active children
- **Action modal** — call, send reminder, or schedule a home visit in one flow

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
npm install

# Configure environment
cp .env.example .env
# set VITE_API_BASE_URL and VITE_API_KEY to point at your vaxicare-ml-api instance

# Run
npm run dev
```

Requires [`vaxicare-ml-api`](https://github.com/premraj-dev/vaxicare-ml-api) running (locally or deployed) for live predictions, risk queue, and reminders.

---

## 🔐 Authentication

API requests to `vaxicare-ml-api` require an `X-API-Key` header in production. Set `VITE_API_KEY` in your `.env`.

---

## 📍 Core Demo Flow

```
Login → ASHA Dashboard → Risk Queue (village capacity view) → Action (call / reminder / visit)
```

---

## 📄 License

This project was built as part of a hackathon submission. License TBD.

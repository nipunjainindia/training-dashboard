# Training Dashboard

A full-stack analytics dashboard for employee training data, with an AI-powered chatbot that converts natural language questions into SQL queries.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   React Frontend (port 3000)            │
│  • Dashboard: KPI cards + 6 Recharts visualizations     │
│  • AI Chatbot: natural language → SQL → results table   │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP / REST
┌──────────────────────▼──────────────────────────────────┐
│               NestJS Backend (port 3001)                 │
│  GET /api/analytics/*   — chart data endpoints           │
│  GET /api/trainings     — filtered record list           │
│  POST /api/chatbot/query — AI query processing           │
└──────────┬───────────────────────────┬──────────────────┘
           │ TypeORM / mssql           │ OpenAI SDK
┌──────────▼──────────┐   ┌───────────▼──────────────────┐
│  SQL Server DB       │   │  OpenAI Chat Completions API  │
│  dbo.Trainings       │   │  GPT-4o (generates T-SQL)    │
└─────────────────────┘   └──────────────────────────────┘
```

## Project Structure

```
training-dashboard/
├── backend/                    # NestJS API
│   ├── src/
│   │   ├── main.ts
│   │   ├── app.module.ts
│   │   ├── trainings/          # CRUD + filter options
│   │   ├── analytics/          # All chart/KPI endpoints
│   │   └── chatbot/            # OpenAI → SQL → results
│   ├── .env.example
│   └── package.json
├── frontend/                   # React + Recharts
│   ├── src/
│   │   ├── pages/Dashboard.tsx # Main page with sidebar nav
│   │   ├── components/
│   │   │   ├── KpiCards.tsx
│   │   │   ├── Charts.tsx      # All 6 chart components
│   │   │   ├── TopTrainingsTable.tsx
│   │   │   └── Chatbot.tsx     # AI chatbot UI
│   │   └── services/api.ts     # Axios API calls
│   └── package.json
└── database/
    └── setup.sql               # Table DDL + indexes
```

## Setup Instructions

### 1. Database

1. Create a database named `TrainingDB` in SQL Server
2. Run `database/setup.sql` to create the `Trainings` table with indexes
3. Import data from `Trainings_POC_5000_Records.xlsx`:
   - In SSMS: Right-click database → Tasks → Import Data → Excel source
   - Map to `dbo.Trainings` table

### 2. Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your SQL Server credentials and OpenAI API key
npm install
npm run start:dev
```

Backend runs on **http://localhost:3001**

Key environment variables:
| Variable | Description |
|---|---|
| `DB_HOST` | SQL Server hostname |
| `DB_PORT` | SQL Server port (default 1433) |
| `DB_USERNAME` | SQL Server username |
| `DB_PASSWORD` | SQL Server password |
| `DB_DATABASE` | Database name (TrainingDB) |
| `OPENAI_API_KEY` | Your OpenAI API key |
| `OPENAI_MODEL` | Model to use (default: gpt-4o) |

### 3. Frontend

```bash
cd frontend
npm install
npm start
```

Frontend runs on **http://localhost:3000** and proxies `/api/*` to port 3001.

## API Endpoints

### Analytics
| Endpoint | Description |
|---|---|
| `GET /api/analytics/kpis` | Summary KPI cards |
| `GET /api/analytics/status-breakdown` | Status distribution |
| `GET /api/analytics/category-breakdown` | By training category |
| `GET /api/analytics/business-unit-breakdown` | By business unit |
| `GET /api/analytics/country-breakdown` | By country |
| `GET /api/analytics/enrollment-trend` | Monthly trend |
| `GET /api/analytics/score-by-category` | Avg scores |
| `GET /api/analytics/provider-breakdown` | By provider |
| `GET /api/analytics/top-trainings` | Top 10 trainings |

### Chatbot
| Endpoint | Body | Description |
|---|---|---|
| `POST /api/chatbot/query` | `{ "prompt": "..." }` | AI query → SQL → results |

## Dashboard Features

### Charts
- **Status Donut** — Completed / In Progress / Not Started / Overdue
- **Category Bar** — Total vs Completed by training category
- **Enrollment Trend** — Monthly enrollment & completion line chart
- **Business Unit Bar** — Horizontal stacked bar (completed + overdue)
- **Provider Pie** — Distribution by training provider
- **Score Radar** — Average assessment scores by category

### KPI Cards (8 metrics)
Total Enrollments · Completion Rate · Completed · In Progress · Not Started · Overdue · Avg Score · Total Hours

### AI Chatbot
- Type any question in plain English
- OpenAI generates a T-SQL SELECT query
- Query executes against SQL Server
- Results render in a paginated table
- SQL is shown/hidden via a toggle
- Only SELECT queries are allowed (injection prevention)

## Security Notes

- The chatbot enforces SELECT-only queries — no INSERT/UPDATE/DELETE/DROP
- Dangerous keywords are blocklisted server-side
- Configure `CORS_ORIGIN` to your frontend domain in production
- Use a read-only SQL user for the DB connection in production
- Store secrets in environment variables, never in code

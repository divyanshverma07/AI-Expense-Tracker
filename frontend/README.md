# AI Expense Tracker Frontend

A React + Vite frontend for the AI Expense Tracker FastAPI backend.

## Backend API

Default:
`http://127.0.0.1:8000`

Create `.env` from `.env.example` if your backend runs somewhere else:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

## Run

```bash
npm install
npm run dev
```

## Backend endpoints used

- `POST /users/`
- `POST /users/login` (OAuth2 form)
- `GET /me`
- `GET/POST /expenses/`
- `GET/PUT/DELETE /expenses/{expense_id}`
- `GET/POST /income/`
- `GET/PUT/DELETE /income/{income_id}`
- `GET/POST /budget/`
- `GET/PUT/DELETE /budget/{budget_id}`
- `GET /dashboard/`

The UI is intentionally organized so API calls are isolated in `src/lib/api.js` and authentication state lives in `src/context/AuthContext.jsx`.

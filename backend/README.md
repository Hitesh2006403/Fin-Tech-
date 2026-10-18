# Uncertain Income Planner — Backend API Architecture

This directory houses the complete backend service for **Uncertain Income Planner**, built with Node.js and Express.js with full user isolation, cryptographic session management, and Supabase PostgreSQL readiness.

---

## 1. Directory Structure

```text
backend/
├── server.js          # Express API server entry point, CORS, session middleware, and REST endpoints
├── index.js           # Module alias forwarding to server.js
├── auth.js            # Authentication logic, Google OAuth verification, password hashing (scrypt)
├── db.js              # User-isolated persistence engine, benchmark demo datasets, and ledger mutations
├── README.md          # Backend documentation and API reference
└── data/              # Local isolated data store partitions
    ├── financials.json # User-scoped financial datasets (incomes, bills, savings, scenarios)
    ├── sessions.json   # Active cryptographic sessions
    └── users.json      # Registered users, credential hashes, and OAuth IDs
```

---

## 2. Core Modules

### `backend/server.js` (or `backend/index.js`)
The main server application running on `http://localhost:3001` (proxied by Vite at `/api`).
- **CORS & Credentials**: Allows credentials from `http://localhost:5174` and `http://localhost:5173`.
- **Authentication Middleware**: Supports both HttpOnly `session_token` cookies and `Authorization: Bearer <token>` headers.
- **REST Endpoints**:
  - `GET /api/health` — Service health check.
  - `GET /api/database/status` — Operational status and Supabase connection state.
  - `GET /api/financials` — Current user's isolated financial dataset.
  - `PUT /api/preferences` — Updates starting balance, safety buffer, and horizon.
  - `POST /api/incomes`, `PUT /api/incomes/:id`, `DELETE /api/incomes/:id` — Income management.
  - `POST /api/expenses`, `PUT /api/expenses/:id`, `DELETE /api/expenses/:id` — Bills & cash expenses.
  - `PUT /api/savings`, `POST /api/savings/deposit` — Lean-week savings goals & deposits.
  - `PUT /api/notifications/:id/read`, `POST /api/notifications/read-all`, `DELETE /api/notifications` — Alert management.
  - `POST /api/scenarios` — Preserves hypothetical payment delay simulations.
  - `POST /api/demo/reset` — Resets current account to benchmark demo data.
  - `POST /api/demo/clear` — Clears all records for a clean fresh start.

### `backend/auth.js`
- **Google OAuth**: Verifies Google Identity Services ID tokens via official `google-auth-library` `OAuth2Client`.
- **Account Linking**: Securely links Google identities with existing local passwords.
- **Password Security**: Zero plaintext storage; hashes passwords with Node `crypto.scryptSync` with random 16-byte salts.
- **Sanitization**: Filters out password hashes, tokens, and sensitive keys from API responses.

### `backend/db.js`
- **Data Isolation**: Partitioned per `userId`. User A's incomes, bills, and balances are physically segregated from User B.
- **Benchmark Demo Dataset**: High-fidelity freelance milestone records (`usr_alex_01`).
- **Atomic File Persistence**: Thread-safe JSON file synchronization with automatic directory bootstrapping.

---

## 3. Running the Backend

From project root:
```bash
# Using npm scripts:
npm run backend
# or
npm run server
# or
npm start

# Directly with Node:
node backend/server.js
```

From inside the `backend` folder:
```bash
cd backend
node server.js
```
The server will automatically bind to port `3001` (or `process.env.PORT`) and output:
```text
[FinSight Auth Server] Running on http://localhost:3001
[FinSight Auth Server] Authorized origin: http://localhost:5174
```

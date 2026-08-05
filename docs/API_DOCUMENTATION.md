# REST API Reference - PFIS

Interactive Swagger UI OpenAPI docs are served at `http://localhost:8000/docs`.

## Endpoint Summary

### Authentication (`/api/auth`)
- `POST /api/auth/register`: Register new user account
- `POST /api/auth/login`: Authenticate & obtain JWT access token
- `GET /api/auth/me`: Fetch current authenticated user info

### Income Management (`/api/income`)
- `GET /api/income`: Fetch incomes with optional `category` / `source` filters
- `POST /api/income`: Create new income record
- `PUT /api/income/{id}`: Edit existing income record
- `DELETE /api/income/{id}`: Delete income record

### Expense Management (`/api/expense`)
- `GET /api/expense`: Fetch expenses with `category`, `merchant`, `min_amount`, `max_amount`, `start_date`, `end_date` filters
- `POST /api/expense`: Create expense (triggers real-time ML fraud check)
- `PUT /api/expense/{id}`: Edit expense record
- `DELETE /api/expense/{id}`: Delete expense record

### Budget Management (`/api/budgets`)
- `GET /api/budgets`: Fetch category budgets with calculated spent, remaining, utilization %, and status
- `POST /api/budgets`: Create or update category limit
- `PUT /api/budgets/{id}`: Update budget limit
- `DELETE /api/budgets/{id}`: Remove budget category

### AI Intelligence & Analytics (`/api/ai`)
- `GET /api/ai/predict`: Next-month expense ML forecasts and budget depletion velocity
- `GET /api/ai/analytics`: Overall cash flow, Financial Health Score, spending persona, and top merchants
- `GET /api/ai/fraud-alerts`: Fetch flagged suspicious transactions
- `POST /api/ai/fraud-alerts/{id}/resolve`: Review and resolve fraud alert status
- `GET /api/ai/recommendations`: Fetch dynamic AI savings recommendations

### Reports & PDF Export (`/api/reports`)
- `GET /api/reports/summary`: Monthly financial report metrics
- `GET /api/reports/download-pdf`: Download print-ready PDF financial report

### User Settings & Security (`/api/user`)
- `GET /api/user/profile`: Get profile preferences
- `PUT /api/user/profile`: Update name, currency, alert threshold
- `PUT /api/user/password`: Update security password
- `GET /api/user/audit-logs`: Fetch security audit trail

# Database Documentation & ER Diagram - PFIS

## Entity Relationship Schema

```
 [Users] 1 ---- * [Incomes]
    |    1 ---- * [Expenses] 1 ---- * [FraudAlerts]
    |    1 ---- * [Budgets]
    |    1 ---- * [Recommendations]
    |    1 ---- * [AuditLogs]
```

## Table Specifications

### 1. `users`
- `id` (INT, PK, Index)
- `name` (VARCHAR, NOT NULL)
- `email` (VARCHAR, UNIQUE, Index)
- `hashed_password` (VARCHAR, NOT NULL)
- `role` (VARCHAR, Default: 'User')
- `currency` (VARCHAR, Default: '₹')
- `alert_threshold` (FLOAT, Default: 80.0)
- `created_at` (DATETIME)

### 2. `incomes`
- `id` (INT, PK, Index)
- `user_id` (INT, FK -> users.id)
- `title` (VARCHAR, NOT NULL)
- `amount` (FLOAT, NOT NULL)
- `category` (VARCHAR, Default: 'Salary')
- `source` (VARCHAR)
- `notes` (TEXT)
- `date` (DATETIME)
- `created_at` (DATETIME)

### 3. `expenses`
- `id` (INT, PK, Index)
- `user_id` (INT, FK -> users.id)
- `title` (VARCHAR, NOT NULL)
- `amount` (FLOAT, NOT NULL)
- `category` (VARCHAR, NOT NULL)
- `merchant` (VARCHAR)
- `payment_method` (VARCHAR, Default: 'UPI')
- `location` (VARCHAR)
- `device` (VARCHAR)
- `notes` (TEXT)
- `date` (DATETIME)
- `is_suspicious` (BOOLEAN, Default: False)
- `anomaly_score` (FLOAT, Default: 0.0)
- `created_at` (DATETIME)

### 4. `budgets`
- `id` (INT, PK, Index)
- `user_id` (INT, FK -> users.id)
- `category` (VARCHAR, NOT NULL)
- `monthly_limit` (FLOAT, NOT NULL)
- `created_at` (DATETIME)

### 5. `fraud_alerts`
- `id` (INT, PK, Index)
- `user_id` (INT, FK -> users.id)
- `expense_id` (INT, FK -> expenses.id)
- `risk_score` (FLOAT, NOT NULL)
- `reason` (TEXT, NOT NULL)
- `status` (VARCHAR, Default: 'Pending')
- `timestamp` (DATETIME)

### 6. `recommendations`
- `id` (INT, PK, Index)
- `user_id` (INT, FK -> users.id)
- `category` (VARCHAR, NOT NULL)
- `recommendation_text` (TEXT, NOT NULL)
- `estimated_savings` (FLOAT, NOT NULL)
- `priority` (VARCHAR, Default: 'Medium')
- `status` (VARCHAR, Default: 'Active')
- `created_at` (DATETIME)

### 7. `audit_logs`
- `id` (INT, PK, Index)
- `user_id` (INT, FK -> users.id)
- `action` (VARCHAR, NOT NULL)
- `details` (TEXT)
- `timestamp` (DATETIME)

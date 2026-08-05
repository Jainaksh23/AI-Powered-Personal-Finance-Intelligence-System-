# System Architecture - Personal Finance Intelligence System (PFIS)

## Overview & Layer Separation

PFIS follows a modular Clean Architecture separating presentation, REST API endpoints, business logic, machine learning pipelines, and data persistence layers:

```
+-----------------------------------------------------------------------+
|                         React + Vite Frontend                         |
|  (Landing Page, Dashboard, Income, Expenses, Budgets, Reports, AI)    |
+-----------------------------------------------------------------------+
                                   |
                             HTTP / REST (JWT)
                                   v
+-----------------------------------------------------------------------+
|                           FastAPI Backend                             |
|  routers: auth_router, income_router, expense_router, budget_router   |
|           ai_router, reports_router, user_router                      |
+-----------------------------------------------------------------------+
        |                                                 |
        v                                                 v
+-----------------------+                       +-----------------------+
|   SQLAlchemy ORM      |                       |    ML Intelligence    |
| (PostgreSQL / SQLite) |                       | (IsolationForest, RF) |
+-----------------------+                       +-----------------------+
```

## Machine Learning Pipeline Design

1. **Expense Forecasting Pipeline (`ml/forecaster.py`)**:
   - Aggregates transaction data into monthly time-series per category.
   - Fits `RandomForestRegressor` and trend estimators to project next month spending.
   - Computes confidence scores and budget depletion dates.

2. **Fraud & Anomaly Detection (`ml/anomaly_detector.py`)**:
   - Uses `IsolationForest(contamination=0.1)` on amount and hour features.
   - Combines ML output with contextual rules (Location mismatch, Device ID, Late night transactions, Extreme amount multiplier).

3. **Habit Persona Classifier (`ml/analyzer.py`)**:
   - Computes category share percentages and classifies spending behavior into personas (`Food Lover`, `Heavy Shopper`, `Weekend Spender`, `Disciplined Saver`).

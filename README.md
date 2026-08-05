# AI-Powered Personal Finance Intelligence System (PFIS)

[![Python](https://img.shields.io/badge/Backend-FastAPI-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB.svg)](https://reactjs.org/)
[![Machine Learning](https://img.shields.io/badge/ML-Scikit--Learn%20%2B%20IsolationForest-F7931E.svg)](https://scikit-learn.org/)
[![Docker](https://img.shields.io/badge/Deployment-Docker%20%2B%20Compose-2496ED.svg)](https://www.docker.com/)

> **Project Vision**: "We are not building an expense tracker. We are building an AI-powered financial decision support system."

---

## Key Features

1. **AI Expense Forecasting (ML Module)**:
   - Uses Scikit-Learn & Random Forest Regressors to predict category-wise next month expenses.
   - Calculates confidence scores, trend direction, and budget depletion velocity.

2. **Real-Time Fraud & Anomaly Detection**:
   - Hybrid Isolation Forest machine learning algorithm + contextual heuristic scoring (Transaction Amount, Time of day, Unregistered Location, New Device).
   - Generates Risk Scores (Low, Medium, High) with explicit detection reasons.

3. **Spending Habit Persona Classifier**:
   - Classifies user behavior into personas: `Food Lover`, `Heavy Shopper`, `Weekend Spender`, `Disciplined Saver`, `High Entertainment Spender`.

4. **Dynamic AI Recommendation Engine**:
   - Generates personalized, explainable savings advice and estimated monthly savings targets.

5. **Category-wise Budget Management**:
   - Real-time progress bars, budget utilization percentages, and over-budget alert status (`Safe`, `Warning`, `Exceeded`).

6. **Financial Reports & PDF Export**:
   - Downloadable print-ready PDF reports containing monthly summaries, category spend distribution, and budget compliance tables.

7. **Full Security & Audit Logging**:
   - JWT authentication, bcrypt password hashing, input validation, and security audit log tracking.

---

## Tech Stack

- **Backend**: FastAPI (Python 3.11), SQLAlchemy ORM, Pydantic v2, Pytest, ReportLab (PDF Generator)
- **Database**: SQLite (dev) / PostgreSQL (production-ready)
- **Frontend**: React, Vite, Tailwind CSS, Lucide Icons, Recharts, Chart.js, Axios
- **Machine Learning**: Scikit-Learn (RandomForestRegressor, IsolationForest), Pandas, NumPy, XGBoost
- **DevOps**: Docker, Docker Compose, Nginx Reverse Proxy

---

## Quick Start Guide

### 1. Local Development Setup

#### Backend:
```bash
cd backend
python -m venv venv
# On Windows:
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
API Documentation (Swagger UI) available at: `http://localhost:8000/docs`

#### Frontend:
```bash
cd frontend
npm install
npm run dev
```
Web Application UI available at: `http://localhost:5173`

---

### 2. Docker Deployment

Launch PostgreSQL, FastAPI backend, and Nginx frontend in containerized environment:
```bash
docker-compose up --build -d
```

---

## System Documentation

Detailed technical architecture, database ER diagrams, API specs, and deployment guides can be found in the `docs/` directory:
- [System Architecture](docs/SYSTEM_ARCHITECTURE.md)
- [Database Documentation](docs/DATABASE_DOCUMENTATION.md)
- [API Documentation](docs/API_DOCUMENTATION.md)
- [Deployment Guide](docs/DEPLOYMENT_GUIDE.md)

---

## License & Credits
Developed as an industry-grade graduation project for AI-Driven Personal Finance Intelligence.

import os
import sys
import pytest
from fastapi.testclient import TestClient

# Ensure backend folder is in sys.path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from main import app
from seed_data import seed_database

# Ensure seed data is initialized for test execution
seed_database()

client = TestClient(app)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert "Personal Finance Intelligence System" in data["system"]

def test_demo_login():
    response = client.post(
        "/api/auth/login",
        json={"email": "demo@pfis.com", "password": "password123"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "demo@pfis.com"

def test_unauthorized_access():
    response = client.get("/api/expense/")
    assert response.status_code == 401

def test_authenticated_workflows():
    # Login as demo
    login_res = client.post(
        "/api/auth/login",
        json={"email": "demo@pfis.com", "password": "password123"}
    )
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Fetch Expenses
    exp_res = client.get("/api/expense/", headers=headers)
    assert exp_res.status_code == 200
    assert isinstance(exp_res.json(), list)

    # 2. Fetch Incomes
    inc_res = client.get("/api/income/", headers=headers)
    assert inc_res.status_code == 200
    assert isinstance(inc_res.json(), list)

    # 3. Fetch Budgets
    bud_res = client.get("/api/budgets", headers=headers)
    assert bud_res.status_code == 200
    assert isinstance(bud_res.json(), list)

    # 4. Fetch AI Analytics & Health Score
    ana_res = client.get("/api/ai/analytics", headers=headers)
    assert ana_res.status_code == 200
    assert "financial_health_score" in ana_res.json()

    # 5. Fetch AI Predictions
    pred_res = client.get("/api/ai/predict", headers=headers)
    assert pred_res.status_code == 200
    assert "total_predicted_expense" in pred_res.json()

    # 6. Fetch Reports Summary
    rep_res = client.get("/api/reports/summary", headers=headers)
    assert rep_res.status_code == 200
    assert "savings_rate" in rep_res.json()

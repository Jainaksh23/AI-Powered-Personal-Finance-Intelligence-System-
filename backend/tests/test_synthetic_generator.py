import os
import sys
import uuid
import pytest
from fastapi.testclient import TestClient

backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from main import app
from seed_data import seed_database
from ml.synthetic_generator import SyntheticDataGenerator, generate_user_persona_transactions

seed_database()
client = TestClient(app)

def test_synthetic_data_generator_output():
    generator = SyntheticDataGenerator(num_records=500)
    dataset = generator.generate_dataset()
    assert len(dataset) == 500
    
    sample = dataset[0]
    required_keys = [
        "transaction_id", "user_id", "date", "time", "amount",
        "merchant_name", "category", "payment_mode", "transaction_type",
        "city", "day_of_week", "month", "weekend_flag", "festival_flag",
        "recurring_flag", "location_type", "fraud_label", "notes"
    ]
    for k in required_keys:
        assert k in sample

def test_persona_transaction_generation():
    persona_txs = generate_user_persona_transactions(user_id=99, persona_name="Food Lover", count=20)
    assert len(persona_txs) >= 22 # 2 Incomes + 20 Expenses
    assert any(t["category"] == "Food" for t in persona_txs)

def test_cold_start_registration_demo_vs_empty():
    uid = str(uuid.uuid4())[:8]
    demo_email = f"alex.student.{uid}@pfis.com"
    empty_email = f"clean.slate.{uid}@pfis.com"

    # 1. Register with Demo Data (Persona: Student)
    reg_demo = client.post("/api/auth/register", json={
        "name": "Alex Student",
        "email": demo_email,
        "password": "password123",
        "cold_start_option": "demo",
        "selected_persona": "Student"
    })
    assert reg_demo.status_code == 200

    # Login and check analytics
    login_demo = client.post("/api/auth/login", json={
        "email": demo_email,
        "password": "password123"
    })
    token_demo = login_demo.json()["access_token"]
    headers_demo = {"Authorization": f"Bearer {token_demo}"}

    analytics_demo = client.get("/api/ai/analytics", headers=headers_demo)
    assert analytics_demo.status_code == 200
    data_demo = analytics_demo.json()
    assert data_demo["total_income"] > 0
    assert data_demo["total_expense"] > 0

    # 2. Register with Empty Account
    reg_empty = client.post("/api/auth/register", json={
        "name": "Clean Slate",
        "email": empty_email,
        "password": "password123",
        "cold_start_option": "empty"
    })
    assert reg_empty.status_code == 200

    login_empty = client.post("/api/auth/login", json={
        "email": empty_email,
        "password": "password123"
    })
    token_empty = login_empty.json()["access_token"]
    headers_empty = {"Authorization": f"Bearer {token_empty}"}

    analytics_empty = client.get("/api/ai/analytics", headers=headers_empty)
    assert analytics_empty.status_code == 200
    data_empty = analytics_empty.json()
    assert data_empty["total_income"] == 0.0
    assert data_empty["total_expense"] == 0.0

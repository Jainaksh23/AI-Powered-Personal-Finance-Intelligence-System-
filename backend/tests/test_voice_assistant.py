import os
import sys
import pytest
from fastapi.testclient import TestClient

backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from main import app
from seed_data import seed_database
from ml.voice_parser import parse_voice_command

seed_database()
client = TestClient(app)

def test_voice_parser_nlp_intents():
    # 1. Expense Intent
    r1 = parse_voice_command("I spent 450 rupees at Starbucks on Coffee via UPI")
    assert r1["intent"] == "LOG_EXPENSE"
    assert r1["amount"] == 450.0
    assert r1["category"] == "Food"
    assert "Starbucks" in r1["merchant"]

    # 2. Income Intent
    r2 = parse_voice_command("Added 25000 salary from employer")
    assert r2["intent"] == "LOG_INCOME"
    assert r2["amount"] == 25000.0

    # 3. Budget Query Intent
    r3 = parse_voice_command("What is my remaining food budget?")
    assert r3["intent"] == "QUERY_BUDGET"

    # 4. Analytics Intent
    r4 = parse_voice_command("How much did I spend this month?")
    assert r4["intent"] == "QUERY_ANALYTICS"

def test_voice_process_command_api():
    login_res = client.post(
        "/api/auth/login",
        json={"email": "demo@pfis.com", "password": "password123"}
    )
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Test expense voice log endpoint
    res1 = client.post(
        "/api/voice/process-command",
        json={"command_text": "I spent 350 rupees at Domino's on Pizza via UPI"},
        headers=headers
    )
    assert res1.status_code == 200
    data1 = res1.json()
    assert data1["action_taken"] == "EXPENSE_LOGGED"
    assert "Domino's" in data1["spoken_response"]

    # Test budget query voice endpoint
    res2 = client.post(
        "/api/voice/process-command",
        json={"command_text": "What is my remaining food budget?"},
        headers=headers
    )
    assert res2.status_code == 200
    data2 = res2.json()
    assert data2["action_taken"] == "BUDGET_QUERIED"

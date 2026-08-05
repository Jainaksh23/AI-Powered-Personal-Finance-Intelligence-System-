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
from services.providers.sms_provider import SMSProvider
from ml.merchant_categorizer import classify_merchant_category

seed_database()
client = TestClient(app)

def test_sms_provider_parsing():
    provider = SMSProvider()
    
    # Domino's SMS
    sms1 = "Rs.350 debited from A/C XXXX1234 via UPI. Paid to Domino's. Ref 992812."
    res1 = provider.parse_transaction(sms1)
    assert res1["amount"] == 350.0
    assert "Domino's" in res1["merchant"]
    assert res1["payment_method"] == "UPI"
    assert res1["transaction_reference"] == "992812"

    # Uber SMS
    sms2 = "Rs 420 spent at Uber India via Paytm UPI. Ref 998231."
    res2 = provider.parse_transaction(sms2)
    assert res2["amount"] == 420.0
    assert "Uber" in res2["merchant"]
    assert res2["payment_method"] == "UPI"

def test_merchant_classification():
    cat1 = classify_merchant_category("Domino's")
    assert cat1["category"] == "Food"
    assert cat1["confidence_score"] >= 0.90

    cat2 = classify_merchant_category("Uber India")
    assert cat2["category"] == "Travel"

    cat3 = classify_merchant_category("Apollo Pharmacy")
    assert cat3["category"] == "Medical"

def test_auto_detection_api_workflow():
    # Login as demo
    login_res = client.post(
        "/api/auth/login",
        json={"email": "demo@pfis.com", "password": "password123"}
    )
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Parse SMS via API
    sms_text = "Rs.350 debited from A/C XXXX1234 via UPI. Paid to Domino's. Ref 992812."
    parse_res = client.post(
        "/api/auto-detection/parse-sms",
        json={"sms_text": sms_text},
        headers=headers
    )
    assert parse_res.status_code == 200
    detected_item = parse_res.json()
    assert detected_item["amount"] == 350.0
    assert detected_item["verification_status"] == "Pending"
    detection_id = detected_item["id"]

    # 2. Get Pending List
    pending_res = client.get("/api/auto-detection/pending", headers=headers)
    assert pending_res.status_code == 200
    assert any(d["id"] == detection_id for d in pending_res.json())

    # 3. Confirm Transaction
    confirm_res = client.post(f"/api/auto-detection/{detection_id}/confirm", headers=headers)
    assert confirm_res.status_code == 200
    confirmed_exp = confirm_res.json()
    assert confirmed_exp["amount"] == 350.0
    assert confirmed_exp["category"] == "Food"

    # 4. Verify no longer pending
    pending_res_after = client.get("/api/auto-detection/pending", headers=headers)
    assert not any(d["id"] == detection_id for d in pending_res_after.json())

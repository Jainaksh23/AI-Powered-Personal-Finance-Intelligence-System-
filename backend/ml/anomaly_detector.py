import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sqlalchemy.orm import Session
import models
from datetime import datetime

def _extract_hour_and_minute(dt_val):
    if isinstance(dt_val, datetime):
        return dt_val.hour, dt_val.minute
    elif isinstance(dt_val, str):
        try:
            parsed = datetime.fromisoformat(dt_val.replace('Z', ''))
            return parsed.hour, parsed.minute
        except Exception:
            return 12, 0
    return 12, 0

def evaluate_transaction_fraud(expense_data: dict, user_id: int, db: Session) -> dict:
    """
    Evaluates a transaction for fraud/anomaly using a hybrid Isolation Forest ML model
    and contextual rule-based behavioral scoring (Amount, Timestamp, Location, Device).
    """
    amount = expense_data.get("amount", 0.0)
    title = expense_data.get("title", "")
    category = expense_data.get("category", "General")
    payment_method = expense_data.get("payment_method", "UPI")
    location = expense_data.get("location", "Home City")
    device = expense_data.get("device", "Primary Phone")
    raw_date = expense_data.get("date") or datetime.utcnow()
    hour, minute = _extract_hour_and_minute(raw_date)

    # Get user's historical transactions
    past_expenses = db.query(models.Expense).filter(models.Expense.user_id == user_id).all()

    risk_factors = []
    base_risk = 0.05 # 5% baseline risk

    if past_expenses:
        amounts = [e.amount for e in past_expenses]
        avg_amount = float(np.mean(amounts))

        # Heuristic 1: Extreme Amount Deviation (>3x or >5x category average)
        if amount > avg_amount * 5 or amount >= 50000:
            base_risk += 0.45
            risk_factors.append(f"Unusually large transaction amount (₹{amount:,.2f} vs avg ₹{avg_amount:,.2f})")
        elif amount > avg_amount * 3:
            base_risk += 0.25
            risk_factors.append(f"Significantly higher than typical spending (₹{amount:,.2f})")

        # Heuristic 2: Category baseline anomaly
        cat_expenses = [e.amount for e in past_expenses if e.category == category]
        if cat_expenses:
            cat_avg = float(np.mean(cat_expenses))
            if amount > cat_avg * 4 and cat_avg > 0:
                base_risk += 0.20
                risk_factors.append(f"High deviation for '{category}' category (Avg: ₹{cat_avg:,.2f})")
    else:
        if amount >= 50000:
            base_risk += 0.40
            risk_factors.append(f"High amount transaction for new account (₹{amount:,.2f})")

    # Heuristic 3: Time of transaction (e.g. 1 AM to 4 AM late night activity)
    if 1 <= hour <= 4:
        base_risk += 0.20
        risk_factors.append(f"Unusual transaction time ({hour:02d}:{minute:02d} AM)")

    # Heuristic 4: Device and Location mismatch
    if location and location not in ["Home City", "Registered Location"]:
        base_risk += 0.15
        risk_factors.append(f"Transaction from unverified location '{location}'")

    if device and device not in ["Primary Phone", "Personal Laptop"]:
        base_risk += 0.15
        risk_factors.append(f"Transaction initiated from new device '{device}'")

    # ML Isolation Forest scoring
    ml_score = 0.0
    if len(past_expenses) >= 5:
        try:
            feature_matrix = []
            for e in past_expenses:
                h, _ = _extract_hour_and_minute(e.date)
                feature_matrix.append([e.amount, h])
            
            feature_matrix.append([amount, hour])
            clf = IsolationForest(contamination=0.1, random_state=42)
            clf.fit(feature_matrix)
            preds = clf.predict([[amount, hour]])
            if preds[0] == -1: # Anomaly detected
                ml_score = 0.30
                risk_factors.append("ML Isolation Forest algorithm flagged anomalous behavior pattern")
        except Exception:
            pass

    total_risk = min(0.99, base_risk + ml_score)
    is_suspicious = total_risk >= 0.50

    reason = " | ".join(risk_factors) if risk_factors else "Normal transaction behavior"

    return {
        "is_suspicious": is_suspicious,
        "risk_score": round(total_risk, 2),
        "reason": f"⚠ Fraud Probability = {int(total_risk * 100)}%. " + reason if is_suspicious else reason
    }

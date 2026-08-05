from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Dict, Any
import database, models, schemas, auth
from ml.voice_parser import parse_voice_command
from ml.anomaly_detector import evaluate_transaction_fraud
from ml.analyzer import calculate_spending_analytics

router = APIRouter(prefix="/api/voice", tags=["AI Voice Copilot Assistant"])

class VoiceCommandRequest(BaseModel):
    command_text: str

class VoiceCommandResponse(BaseModel):
    intent: str
    action_taken: str
    spoken_response: str
    extracted_data: Dict[str, Any]
    details: Optional[Dict[str, Any]] = None

@router.post("/process-command", response_model=VoiceCommandResponse)
def process_voice_command(
    req: VoiceCommandRequest,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    text = req.command_text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="Voice command text cannot be empty")

    parsed = parse_voice_command(text)
    intent = parsed["intent"]
    amount = parsed["amount"]
    category = parsed["category"]
    merchant = parsed["merchant"]
    payment_method = parsed["payment_method"]
    title = parsed["title"]

    # 1. LOG EXPENSE
    if intent == "LOG_EXPENSE":
        if amount <= 0:
            return VoiceCommandResponse(
                intent=intent,
                action_taken="CLARIFICATION_NEEDED",
                spoken_response="I recognized your request to log an expense, but couldn't detect the amount. Please say for example: Log 450 rupees at Starbucks.",
                extracted_data=parsed
            )

        fraud_eval = evaluate_transaction_fraud(
            expense_data={
                "amount": amount,
                "title": title,
                "category": category,
                "merchant": merchant,
                "payment_method": payment_method,
                "location": "Home City",
                "device": "AI Voice Copilot",
                "date": datetime.utcnow()
            },
            user_id=current_user.id,
            db=db
        )

        new_expense = models.Expense(
            user_id=current_user.id,
            title=title,
            amount=amount,
            category=category,
            merchant=merchant,
            payment_method=payment_method,
            location="Home City",
            device="AI Voice Copilot",
            date=datetime.utcnow(),
            is_suspicious=fraud_eval["is_suspicious"],
            anomaly_score=fraud_eval["risk_score"]
        )
        db.add(new_expense)
        db.commit()
        db.refresh(new_expense)

        if fraud_eval["is_suspicious"]:
            alert = models.FraudAlert(
                user_id=current_user.id,
                expense_id=new_expense.id,
                risk_score=fraud_eval["risk_score"],
                reason=fraud_eval["reason"],
                status="Pending"
            )
            db.add(alert)

        audit = models.AuditLog(
            user_id=current_user.id,
            action="VOICE_LOG_EXPENSE",
            details=f"Voice logged expense: ₹{amount} at {merchant} ({category})"
        )
        db.add(audit)
        db.commit()

        spoken = f"Successfully logged expense of ₹{amount:,.0f} for {merchant} under {category} category."
        if fraud_eval["is_suspicious"]:
            spoken += " Note: This transaction has been flagged for fraud review due to unusual amount or device context."

        return VoiceCommandResponse(
            intent=intent,
            action_taken="EXPENSE_LOGGED",
            spoken_response=spoken,
            extracted_data=parsed,
            details={"expense_id": new_expense.id, "amount": amount, "category": category}
        )

    # 2. LOG INCOME
    elif intent == "LOG_INCOME":
        if amount <= 0:
            return VoiceCommandResponse(
                intent=intent,
                action_taken="CLARIFICATION_NEEDED",
                spoken_response="I heard your request to add income, but couldn't detect the amount. Please say for example: Added 25000 salary.",
                extracted_data=parsed
            )

        new_income = models.Income(
            user_id=current_user.id,
            title=title,
            amount=amount,
            category=category,
            source=merchant,
            notes="Logged via AI Voice Copilot",
            date=datetime.utcnow()
        )
        db.add(new_income)
        db.commit()
        db.refresh(new_income)

        audit = models.AuditLog(
            user_id=current_user.id,
            action="VOICE_LOG_INCOME",
            details=f"Voice logged income: ₹{amount} ({category})"
        )
        db.add(audit)
        db.commit()

        return VoiceCommandResponse(
            intent=intent,
            action_taken="INCOME_LOGGED",
            spoken_response=f"Successfully recorded income of ₹{amount:,.0f} under {category}.",
            extracted_data=parsed,
            details={"income_id": new_income.id, "amount": amount}
        )

    # 3. QUERY BUDGET
    elif intent == "QUERY_BUDGET":
        budget = db.query(models.Budget).filter(
            models.Budget.user_id == current_user.id,
            models.Budget.category == category
        ).first()

        if not budget:
            all_budgets = db.query(models.Budget).filter(models.Budget.user_id == current_user.id).all()
            if all_budgets:
                spoken = f"Your total monthly budget limit across {len(all_budgets)} categories is ₹{sum(b.monthly_limit for b in all_budgets):,.0f}."
            else:
                spoken = "You have not set any active category budgets yet."
        else:
            expenses = db.query(models.Expense).filter(
                models.Expense.user_id == current_user.id,
                models.Expense.category == category
            ).all()
            spent = sum(e.amount for e in expenses)
            rem = max(0.0, budget.monthly_limit - spent)
            spoken = f"Your remaining {category} budget is ₹{rem:,.0f} out of your monthly limit of ₹{budget.monthly_limit:,.0f} (Spent: ₹{spent:,.0f})."

        return VoiceCommandResponse(
            intent=intent,
            action_taken="BUDGET_QUERIED",
            spoken_response=spoken,
            extracted_data=parsed
        )

    # 4. QUERY FRAUD
    elif intent == "QUERY_FRAUD":
        alerts = db.query(models.FraudAlert).filter(
            models.FraudAlert.user_id == current_user.id,
            models.FraudAlert.status == "Pending"
        ).all()
        count = len(alerts)
        if count == 0:
            spoken = "Great news! You have no active fraud or anomaly security alerts requiring attention."
        else:
            spoken = f"Attention: You have {count} active fraud alerts flagged by AI IsolationForest requiring your review."

        return VoiceCommandResponse(
            intent=intent,
            action_taken="FRAUD_QUERIED",
            spoken_response=spoken,
            extracted_data=parsed,
            details={"pending_fraud_count": count}
        )

    # 5. QUERY ANALYTICS (Default)
    else:
        analytics = calculate_spending_analytics(user_id=current_user.id, db=db)
        tot_exp = analytics["total_expense"]
        tot_inc = analytics["total_income"]
        health_score = analytics["financial_health_score"]
        status_txt = analytics["health_status"]

        spoken = f"This month you have spent ₹{tot_exp:,.0f} out of ₹{tot_inc:,.0f} income. Your Financial Health Score is {health_score} out of 100 ({status_txt})."

        return VoiceCommandResponse(
            intent=intent,
            action_taken="ANALYTICS_QUERIED",
            spoken_response=spoken,
            extracted_data=parsed,
            details=analytics
        )

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import database, models, schemas, auth
from ml.forecaster import predict_next_month_expenses
from ml.analyzer import calculate_spending_analytics
from ml.recommender import generate_personalized_recommendations

router = APIRouter(prefix="/api/ai", tags=["AI Intelligence & Analytics"])

@router.get("/predict", response_model=schemas.ExpensePredictionResponse)
def get_expense_prediction(db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    return predict_next_month_expenses(current_user.id, db)

@router.get("/analytics", response_model=schemas.SpendingAnalyticsResponse)
def get_analytics(db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    return calculate_spending_analytics(current_user.id, db)

@router.get("/fraud-alerts", response_model=List[schemas.FraudAlertResponse])
def get_fraud_alerts(db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    alerts = db.query(models.FraudAlert).filter(models.FraudAlert.user_id == current_user.id).order_by(models.FraudAlert.timestamp.desc()).all()
    results = []
    for a in alerts:
        exp = db.query(models.Expense).filter(models.Expense.id == a.expense_id).first()
        results.append({
            "id": a.id,
            "expense_id": a.expense_id,
            "risk_score": a.risk_score,
            "reason": a.reason,
            "status": a.status,
            "timestamp": a.timestamp,
            "expense_title": exp.title if exp else "Unknown Transaction",
            "expense_amount": exp.amount if exp else 0.0
        })
    return results

@router.post("/fraud-alerts/{alert_id}/resolve")
def resolve_fraud_alert(alert_id: int, status_update: str = "Dismissed", db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    alert = db.query(models.FraudAlert).filter(models.FraudAlert.id == alert_id, models.FraudAlert.user_id == current_user.id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    alert.status = status_update
    db.commit()
    return {"message": f"Fraud alert status updated to {status_update}"}

@router.get("/recommendations", response_model=List[schemas.RecommendationResponse])
def get_recommendations(db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    recs = generate_personalized_recommendations(current_user.id, db)
    # Sync with DB recommendations
    db_recs = db.query(models.Recommendation).filter(models.Recommendation.user_id == current_user.id).all()
    if not db_recs:
        for r in recs:
            rec_obj = models.Recommendation(
                user_id=current_user.id,
                category=r["category"],
                recommendation_text=r["recommendation_text"],
                estimated_savings=r["estimated_savings"],
                priority=r["priority"],
                status=r["status"]
            )
            db.add(rec_obj)
        db.commit()
        db_recs = db.query(models.Recommendation).filter(models.Recommendation.user_id == current_user.id).all()

    return db_recs

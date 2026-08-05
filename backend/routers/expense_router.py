from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import database, models, schemas, auth
from ml.anomaly_detector import evaluate_transaction_fraud

router = APIRouter(prefix="/api/expense", tags=["Expense"])

@router.get("", response_model=List[schemas.ExpenseResponse])
@router.get("/", response_model=List[schemas.ExpenseResponse])
def get_expenses(
    category: Optional[str] = None,
    merchant: Optional[str] = None,
    min_amount: Optional[float] = None,
    max_amount: Optional[float] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    query = db.query(models.Expense).filter(models.Expense.user_id == current_user.id)

    if category and category != "All":
        query = query.filter(models.Expense.category == category)

    if merchant:
        query = query.filter(models.Expense.merchant.ilike(f"%{merchant}%"))

    if min_amount is not None:
        query = query.filter(models.Expense.amount >= min_amount)

    if max_amount is not None:
        query = query.filter(models.Expense.amount <= max_amount)

    if start_date:
        try:
            sd = datetime.fromisoformat(start_date)
            query = query.filter(models.Expense.date >= sd)
        except ValueError:
            pass

    if end_date:
        try:
            ed = datetime.fromisoformat(end_date)
            query = query.filter(models.Expense.date <= ed)
        except ValueError:
            pass

    return query.order_by(models.Expense.date.desc()).all()

@router.post("", response_model=schemas.ExpenseResponse)
@router.post("/", response_model=schemas.ExpenseResponse)
def add_expense(expense: schemas.ExpenseCreate, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    exp_date = expense.date or datetime.utcnow()
    
    # Run AI Fraud / Anomaly Check before saving
    fraud_eval = evaluate_transaction_fraud(
        expense_data={
            "amount": expense.amount,
            "title": expense.title,
            "category": expense.category,
            "merchant": expense.merchant,
            "payment_method": expense.payment_method,
            "location": expense.location,
            "device": expense.device,
            "date": exp_date
        },
        user_id=current_user.id,
        db=db
    )

    new_expense = models.Expense(
        user_id=current_user.id,
        title=expense.title,
        amount=expense.amount,
        category=expense.category,
        merchant=expense.merchant or "General Store",
        payment_method=expense.payment_method or "UPI",
        location=expense.location or "Home City",
        device=expense.device or "Primary Phone",
        notes=expense.notes,
        date=exp_date,
        is_suspicious=fraud_eval["is_suspicious"],
        anomaly_score=fraud_eval["risk_score"]
    )
    db.add(new_expense)
    db.commit()
    db.refresh(new_expense)

    # If flagged as suspicious, create FraudAlert entry
    if fraud_eval["is_suspicious"]:
        alert = models.FraudAlert(
            user_id=current_user.id,
            expense_id=new_expense.id,
            risk_score=fraud_eval["risk_score"],
            reason=fraud_eval["reason"],
            status="Pending"
        )
        db.add(alert)
        db.commit()

    # Audit log
    audit = models.AuditLog(
        user_id=current_user.id,
        action="ADD_EXPENSE",
        details=f"Expense '{new_expense.title}' ({new_expense.category}): {new_expense.amount}"
    )
    db.add(audit)
    db.commit()

    return new_expense

@router.put("/{expense_id}", response_model=schemas.ExpenseResponse)
def update_expense(expense_id: int, expense_in: schemas.ExpenseUpdate, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    exp = db.query(models.Expense).filter(models.Expense.id == expense_id, models.Expense.user_id == current_user.id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Expense entry not found")

    if expense_in.title is not None:
        exp.title = expense_in.title
    if expense_in.amount is not None:
        exp.amount = expense_in.amount
    if expense_in.category is not None:
        exp.category = expense_in.category
    if expense_in.merchant is not None:
        exp.merchant = expense_in.merchant
    if expense_in.payment_method is not None:
        exp.payment_method = expense_in.payment_method
    if expense_in.location is not None:
        exp.location = expense_in.location
    if expense_in.notes is not None:
        exp.notes = expense_in.notes
    if expense_in.date is not None:
        exp.date = expense_in.date

    db.commit()
    db.refresh(exp)
    return exp

@router.delete("/{expense_id}")
def delete_expense(expense_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    exp = db.query(models.Expense).filter(models.Expense.id == expense_id, models.Expense.user_id == current_user.id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Expense entry not found")
    db.delete(exp)
    db.commit()
    return {"message": "Expense deleted successfully"}

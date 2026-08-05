from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
import database, models, schemas, auth

router = APIRouter(prefix="/api/budgets", tags=["Budgets"])

@router.get("", response_model=List[schemas.BudgetResponse])
def get_budgets(db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    budgets = db.query(models.Budget).filter(models.Budget.user_id == current_user.id).all()
    
    # Calculate spending for current month for each category
    now = datetime.utcnow()
    current_year = now.year
    current_month = now.month

    expenses = db.query(models.Expense).filter(
        models.Expense.user_id == current_user.id
    ).all()

    category_spent = {}
    for exp in expenses:
        if exp.date and exp.date.year == current_year and exp.date.month == current_month:
            category_spent[exp.category] = category_spent.get(exp.category, 0.0) + exp.amount

    response = []
    alert_thresh = current_user.alert_threshold or 80.0

    for b in budgets:
        spent = category_spent.get(b.category, 0.0)
        limit = b.monthly_limit if b.monthly_limit > 0 else 1.0
        util_pct = round((spent / limit) * 100.0, 1)
        remaining = max(0.0, limit - spent)
        
        status_val = "Safe"
        if util_pct >= 100.0:
            status_val = "Exceeded"
        elif util_pct >= alert_thresh:
            status_val = "Warning"

        response.append(schemas.BudgetResponse(
            id=b.id,
            user_id=b.user_id,
            category=b.category,
            monthly_limit=b.monthly_limit,
            spent=round(spent, 2),
            remaining=round(remaining, 2),
            utilization_percentage=util_pct,
            status=status_val
        ))

    return response

@router.post("", response_model=schemas.BudgetResponse)
def create_budget(budget: schemas.BudgetCreate, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    existing = db.query(models.Budget).filter(
        models.Budget.user_id == current_user.id,
        models.Budget.category == budget.category
    ).first()

    if existing:
        existing.monthly_limit = budget.monthly_limit
        db.commit()
        db.refresh(existing)
        target_budget = existing
    else:
        target_budget = models.Budget(
            user_id=current_user.id,
            category=budget.category,
            monthly_limit=budget.monthly_limit
        )
        db.add(target_budget)
        db.commit()
        db.refresh(target_budget)

    # Log audit
    audit = models.AuditLog(
        user_id=current_user.id,
        action="CREATE_OR_UPDATE_BUDGET",
        details=f"Category: {budget.category}, Limit: {budget.monthly_limit}"
    )
    db.add(audit)
    db.commit()

    # Compute spent
    now = datetime.utcnow()
    expenses = db.query(models.Expense).filter(
        models.Expense.user_id == current_user.id,
        models.Expense.category == budget.category
    ).all()
    spent = sum(e.amount for e in expenses if e.date and e.date.year == now.year and e.date.month == now.month)
    util_pct = round((spent / (target_budget.monthly_limit or 1.0)) * 100.0, 1)

    return schemas.BudgetResponse(
        id=target_budget.id,
        user_id=target_budget.user_id,
        category=target_budget.category,
        monthly_limit=target_budget.monthly_limit,
        spent=round(spent, 2),
        remaining=max(0.0, target_budget.monthly_limit - spent),
        utilization_percentage=util_pct,
        status="Exceeded" if util_pct >= 100 else ("Warning" if util_pct >= 80 else "Safe")
    )

@router.put("/{budget_id}", response_model=schemas.BudgetResponse)
def update_budget(budget_id: int, budget_in: schemas.BudgetUpdate, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    budget_obj = db.query(models.Budget).filter(models.Budget.id == budget_id, models.Budget.user_id == current_user.id).first()
    if not budget_obj:
        raise HTTPException(status_code=404, detail="Budget not found")

    if budget_in.category is not None:
        budget_obj.category = budget_in.category
    if budget_in.monthly_limit is not None:
        budget_obj.monthly_limit = budget_in.monthly_limit

    db.commit()
    db.refresh(budget_obj)

    now = datetime.utcnow()
    expenses = db.query(models.Expense).filter(
        models.Expense.user_id == current_user.id,
        models.Expense.category == budget_obj.category
    ).all()
    spent = sum(e.amount for e in expenses if e.date and e.date.year == now.year and e.date.month == now.month)
    util_pct = round((spent / (budget_obj.monthly_limit or 1.0)) * 100.0, 1)

    return schemas.BudgetResponse(
        id=budget_obj.id,
        user_id=budget_obj.user_id,
        category=budget_obj.category,
        monthly_limit=budget_obj.monthly_limit,
        spent=round(spent, 2),
        remaining=max(0.0, budget_obj.monthly_limit - spent),
        utilization_percentage=util_pct,
        status="Exceeded" if util_pct >= 100 else ("Warning" if util_pct >= 80 else "Safe")
    )

@router.delete("/{budget_id}")
def delete_budget(budget_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    budget_obj = db.query(models.Budget).filter(models.Budget.id == budget_id, models.Budget.user_id == current_user.id).first()
    if not budget_obj:
        raise HTTPException(status_code=404, detail="Budget not found")
    
    db.delete(budget_obj)
    db.commit()
    return {"message": "Budget deleted successfully"}

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import database, models, schemas, auth

router = APIRouter(prefix="/api/income", tags=["Income"])

@router.get("", response_model=List[schemas.IncomeResponse])
@router.get("/", response_model=List[schemas.IncomeResponse])
def get_incomes(
    category: Optional[str] = None,
    source: Optional[str] = None,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    query = db.query(models.Income).filter(models.Income.user_id == current_user.id)
    if category and category != "All":
        query = query.filter(models.Income.category == category)
    if source:
        query = query.filter(models.Income.source.ilike(f"%{source}%"))

    return query.order_by(models.Income.date.desc()).all()

@router.post("", response_model=schemas.IncomeResponse)
@router.post("/", response_model=schemas.IncomeResponse)
def add_income(income: schemas.IncomeCreate, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    new_income = models.Income(
        user_id=current_user.id,
        title=income.title,
        amount=income.amount,
        category=income.category or "Salary",
        source=income.source or "Main Employer",
        notes=income.notes,
        date=income.date or datetime.utcnow()
    )
    db.add(new_income)
    db.commit()
    db.refresh(new_income)

    audit = models.AuditLog(
        user_id=current_user.id,
        action="ADD_INCOME",
        details=f"Income '{new_income.title}' ({new_income.category}): {new_income.amount}"
    )
    db.add(audit)
    db.commit()

    return new_income

@router.put("/{income_id}", response_model=schemas.IncomeResponse)
def update_income(income_id: int, income_in: schemas.IncomeUpdate, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    inc = db.query(models.Income).filter(models.Income.id == income_id, models.Income.user_id == current_user.id).first()
    if not inc:
        raise HTTPException(status_code=404, detail="Income entry not found")

    if income_in.title is not None:
        inc.title = income_in.title
    if income_in.amount is not None:
        inc.amount = income_in.amount
    if income_in.category is not None:
        inc.category = income_in.category
    if income_in.source is not None:
        inc.source = income_in.source
    if income_in.notes is not None:
        inc.notes = income_in.notes
    if income_in.date is not None:
        inc.date = income_in.date

    db.commit()
    db.refresh(inc)
    return inc

@router.delete("/{income_id}")
def delete_income(income_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    inc = db.query(models.Income).filter(models.Income.id == income_id, models.Income.user_id == current_user.id).first()
    if not inc:
        raise HTTPException(status_code=404, detail="Income entry not found")
    db.delete(inc)
    db.commit()
    return {"message": "Income deleted successfully"}

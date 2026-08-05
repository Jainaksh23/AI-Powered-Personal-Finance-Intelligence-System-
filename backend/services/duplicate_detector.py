from sqlalchemy.orm import Session
import models
from datetime import datetime, timedelta

def check_duplicate_transaction(
    amount: float,
    merchant: str,
    date_val: datetime,
    ref_no: str,
    user_id: int,
    db: Session
) -> bool:
    """
    Checks if a newly detected transaction is a potential duplicate against existing
    Expense ledger records or pending DetectedTransaction entries within a 24-hour window.
    """
    # 1. Reference number match
    if ref_no:
        existing_exp_ref = db.query(models.Expense).filter(
            models.Expense.user_id == user_id,
            models.Expense.transaction_reference == ref_no
        ).first()
        if existing_exp_ref:
            return True

        existing_det_ref = db.query(models.DetectedTransaction).filter(
            models.DetectedTransaction.user_id == user_id,
            models.DetectedTransaction.transaction_reference == ref_no
        ).first()
        if existing_det_ref:
            return True

    # 2. Amount & Merchant match within 24 hours
    start_window = date_val - timedelta(hours=24)
    end_window = date_val + timedelta(hours=24)

    exp_duplicate = db.query(models.Expense).filter(
        models.Expense.user_id == user_id,
        models.Expense.amount == amount,
        models.Expense.merchant == merchant,
        models.Expense.date >= start_window,
        models.Expense.date <= end_window
    ).first()

    if exp_duplicate:
        return True

    det_duplicate = db.query(models.DetectedTransaction).filter(
        models.DetectedTransaction.user_id == user_id,
        models.DetectedTransaction.amount == amount,
        models.DetectedTransaction.merchant == merchant,
        models.DetectedTransaction.date >= start_window,
        models.DetectedTransaction.date <= end_window
    ).first()

    if det_duplicate:
        return True

    return False

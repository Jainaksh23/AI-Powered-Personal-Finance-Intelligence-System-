from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import json
import database, models, schemas, auth
from services.providers.sms_provider import SMSProvider
from services.providers.bank_api_provider import BankAPIProvider
from ml.merchant_categorizer import classify_merchant_category
from services.duplicate_detector import check_duplicate_transaction
from ml.anomaly_detector import evaluate_transaction_fraud

router = APIRouter(prefix="/api/auto-detection", tags=["Smart Auto Detection Engine"])

sms_provider = SMSProvider()
bank_provider = BankAPIProvider()

@router.post("/parse-sms", response_model=schemas.DetectedTransactionResponse)
def parse_and_detect_sms(
    req: schemas.SMSParseRequest,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    # 1. Parse SMS via SMSProvider
    parsed_data = sms_provider.parse_transaction(req.sms_text)

    # 2. AI Merchant Categorization
    cat_result = classify_merchant_category(parsed_data["merchant"])
    category = cat_result["category"]
    confidence_score = cat_result["confidence_score"]
    ai_category = cat_result["ai_category"]

    # 3. Duplicate Detection
    is_duplicate = check_duplicate_transaction(
        amount=parsed_data["amount"],
        merchant=parsed_data["merchant"],
        date_val=parsed_data["date"],
        ref_no=parsed_data["transaction_reference"],
        user_id=current_user.id,
        db=db
    )

    # 4. Fraud Detection Check
    fraud_eval = evaluate_transaction_fraud(
        expense_data={
            "amount": parsed_data["amount"],
            "title": parsed_data["title"],
            "category": category,
            "merchant": parsed_data["merchant"],
            "payment_method": parsed_data["payment_method"],
            "location": "Home City",
            "device": "SMS Engine Auto-Detector",
            "date": parsed_data["date"]
        },
        user_id=current_user.id,
        db=db
    )

    # 5. Create Pending DetectedTransaction entry
    detected = models.DetectedTransaction(
        user_id=current_user.id,
        amount=parsed_data["amount"],
        title=parsed_data["title"],
        category=category,
        merchant=parsed_data["merchant"],
        payment_method=parsed_data["payment_method"],
        transaction_source="SMS",
        transaction_reference=parsed_data["transaction_reference"],
        confidence_score=confidence_score,
        verification_status="Pending",
        duplicate_flag=is_duplicate,
        ai_category=ai_category,
        raw_data=req.sms_text,
        is_suspicious=fraud_eval["is_suspicious"],
        risk_score=fraud_eval["risk_score"],
        fraud_reason=fraud_eval["reason"],
        date=parsed_data["date"]
    )
    db.add(detected)
    db.commit()
    db.refresh(detected)

    # Audit log
    audit = models.AuditLog(
        user_id=current_user.id,
        action="SMS_AUTO_DETECTED",
        details=f"Parsed SMS: ₹{detected.amount} at {detected.merchant} ({detected.category}). Duplicate: {is_duplicate}"
    )
    db.add(audit)
    db.commit()

    return detected

@router.get("/pending", response_model=List[schemas.DetectedTransactionResponse])
def get_pending_detections(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    return db.query(models.DetectedTransaction).filter(
        models.DetectedTransaction.user_id == current_user.id,
        models.DetectedTransaction.verification_status == "Pending"
    ).order_by(models.DetectedTransaction.created_at.desc()).all()

@router.post("/{detection_id}/confirm", response_model=schemas.ExpenseResponse)
def confirm_detected_transaction(
    detection_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    detected = db.query(models.DetectedTransaction).filter(
        models.DetectedTransaction.id == detection_id,
        models.DetectedTransaction.user_id == current_user.id
    ).first()

    if not detected:
        raise HTTPException(status_code=404, detail="Detected transaction not found")

    # Update verification status
    detected.verification_status = "Confirmed"

    # Promote into Expense ledger
    new_expense = models.Expense(
        user_id=current_user.id,
        title=detected.title,
        amount=detected.amount,
        category=detected.category,
        merchant=detected.merchant,
        payment_method=detected.payment_method,
        location="Home City",
        device="Auto Detection Engine",
        date=detected.date,
        is_suspicious=detected.is_suspicious,
        anomaly_score=detected.risk_score,
        transaction_source=detected.transaction_source,
        merchant_name=detected.merchant,
        transaction_reference=detected.transaction_reference,
        confidence_score=detected.confidence_score,
        verification_status="Confirmed",
        duplicate_flag=detected.duplicate_flag,
        ai_category=detected.ai_category,
        detection_timestamp=datetime.utcnow()
    )
    db.add(new_expense)
    db.commit()
    db.refresh(new_expense)

    # Create FraudAlert if suspicious
    if detected.is_suspicious:
        alert = models.FraudAlert(
            user_id=current_user.id,
            expense_id=new_expense.id,
            risk_score=detected.risk_score,
            reason=detected.fraud_reason or "Flagged during auto detection",
            status="Pending"
        )
        db.add(alert)

    # Audit log
    audit = models.AuditLog(
        user_id=current_user.id,
        action="CONFIRM_AUTO_DETECTION",
        details=f"User confirmed transaction '{new_expense.title}' (₹{new_expense.amount})"
    )
    db.add(audit)
    db.commit()

    return new_expense

@router.post("/{detection_id}/edit-confirm", response_model=schemas.ExpenseResponse)
def edit_and_confirm_transaction(
    detection_id: int,
    edit_req: schemas.ConfirmTransactionRequest,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    detected = db.query(models.DetectedTransaction).filter(
        models.DetectedTransaction.id == detection_id,
        models.DetectedTransaction.user_id == current_user.id
    ).first()

    if not detected:
        raise HTTPException(status_code=404, detail="Detected transaction not found")

    detected.verification_status = "Confirmed"

    final_title = edit_req.title or detected.title
    final_amount = edit_req.amount if edit_req.amount is not None else detected.amount
    final_category = edit_req.category or detected.category
    final_merchant = edit_req.merchant or detected.merchant
    final_payment = edit_req.payment_method or detected.payment_method

    new_expense = models.Expense(
        user_id=current_user.id,
        title=final_title,
        amount=final_amount,
        category=final_category,
        merchant=final_merchant,
        payment_method=final_payment,
        location="Home City",
        device="Auto Detection Engine",
        date=detected.date,
        is_suspicious=detected.is_suspicious,
        anomaly_score=detected.risk_score,
        transaction_source=detected.transaction_source,
        merchant_name=final_merchant,
        transaction_reference=detected.transaction_reference,
        confidence_score=1.0, # User manually verified
        verification_status="Confirmed",
        duplicate_flag=detected.duplicate_flag,
        ai_category=detected.ai_category,
        detection_timestamp=datetime.utcnow()
    )
    db.add(new_expense)
    db.commit()
    db.refresh(new_expense)

    audit = models.AuditLog(
        user_id=current_user.id,
        action="EDIT_CONFIRM_AUTO_DETECTION",
        details=f"User edited & confirmed transaction '{new_expense.title}' (₹{new_expense.amount})"
    )
    db.add(audit)
    db.commit()

    return new_expense

@router.post("/{detection_id}/ignore")
def ignore_detected_transaction(
    detection_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    detected = db.query(models.DetectedTransaction).filter(
        models.DetectedTransaction.id == detection_id,
        models.DetectedTransaction.user_id == current_user.id
    ).first()

    if not detected:
        raise HTTPException(status_code=404, detail="Detected transaction not found")

    detected.verification_status = "Ignored"
    db.commit()

    audit = models.AuditLog(
        user_id=current_user.id,
        action="IGNORE_AUTO_DETECTION",
        details=f"User ignored detected transaction '{detected.title}' (₹{detected.amount})"
    )
    db.add(audit)
    db.commit()

    return {"message": "Transaction marked as ignored"}

@router.get("/history", response_model=List[schemas.DetectedTransactionResponse])
def get_detection_history(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    return db.query(models.DetectedTransaction).filter(
        models.DetectedTransaction.user_id == current_user.id
    ).order_by(models.DetectedTransaction.created_at.desc()).limit(50).all()

@router.post("/simulate-bank-api", response_model=schemas.DetectedTransactionResponse)
def simulate_bank_api_ingestion(
    req: schemas.BankApiSimulateRequest,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    raw_payload = json.dumps({
        "account_id": req.account_id,
        "amount": req.amount,
        "merchant": req.merchant,
        "payment_method": req.payment_method,
        "reference_number": req.reference_number or f"BANK-{int(datetime.utcnow().timestamp())}"
    })

    parsed_data = bank_provider.parse_transaction(raw_payload)

    cat_result = classify_merchant_category(parsed_data["merchant"])
    category = cat_result["category"]
    confidence_score = cat_result["confidence_score"]

    is_duplicate = check_duplicate_transaction(
        amount=parsed_data["amount"],
        merchant=parsed_data["merchant"],
        date_val=parsed_data["date"],
        ref_no=parsed_data["transaction_reference"],
        user_id=current_user.id,
        db=db
    )

    fraud_eval = evaluate_transaction_fraud(
        expense_data={
            "amount": parsed_data["amount"],
            "title": parsed_data["title"],
            "category": category,
            "merchant": parsed_data["merchant"],
            "payment_method": parsed_data["payment_method"],
            "location": "Open Banking API Sync",
            "device": "Secure Bank Provider API",
            "date": parsed_data["date"]
        },
        user_id=current_user.id,
        db=db
    )

    detected = models.DetectedTransaction(
        user_id=current_user.id,
        amount=parsed_data["amount"],
        title=parsed_data["title"],
        category=category,
        merchant=parsed_data["merchant"],
        payment_method=parsed_data["payment_method"],
        transaction_source="FutureBankAPI",
        transaction_reference=parsed_data["transaction_reference"],
        confidence_score=confidence_score,
        verification_status="Pending",
        duplicate_flag=is_duplicate,
        ai_category=category,
        raw_data=raw_payload,
        is_suspicious=fraud_eval["is_suspicious"],
        risk_score=fraud_eval["risk_score"],
        fraud_reason=fraud_eval["reason"],
        date=parsed_data["date"]
    )
    db.add(detected)
    db.commit()
    db.refresh(detected)

    return detected

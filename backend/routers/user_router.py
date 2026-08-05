from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import database, models, schemas, auth

router = APIRouter(prefix="/api/user", tags=["User Profile & Security"])

@router.get("/profile", response_model=schemas.UserResponse)
def get_user_profile(current_user: models.User = Depends(auth.get_current_user)):
    return current_user

@router.put("/profile", response_model=schemas.UserResponse)
def update_user_profile(
    profile_in: schemas.UserProfileUpdate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    if profile_in.name is not None:
        current_user.name = profile_in.name
    if profile_in.currency is not None:
        current_user.currency = profile_in.currency
    if profile_in.alert_threshold is not None:
        current_user.alert_threshold = profile_in.alert_threshold

    db.commit()
    db.refresh(current_user)

    # Log audit
    audit = models.AuditLog(
        user_id=current_user.id,
        action="UPDATE_PROFILE",
        details=f"Updated profile settings: Currency={current_user.currency}, Threshold={current_user.alert_threshold}%"
    )
    db.add(audit)
    db.commit()

    return current_user

@router.put("/password")
def update_user_password(
    pwd_in: schemas.UserPasswordUpdate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    if not auth.verify_password(pwd_in.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password incorrect")

    current_user.hashed_password = auth.get_password_hash(pwd_in.new_password)
    db.commit()

    # Log audit
    audit = models.AuditLog(
        user_id=current_user.id,
        action="CHANGE_PASSWORD",
        details="Password successfully updated"
    )
    db.add(audit)
    db.commit()

    return {"message": "Password updated successfully"}

@router.get("/audit-logs", response_model=List[schemas.AuditLogResponse])
def get_audit_logs(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    logs = db.query(models.AuditLog).filter(
        models.AuditLog.user_id == current_user.id
    ).order_by(models.AuditLog.timestamp.desc()).limit(50).all()
    return logs

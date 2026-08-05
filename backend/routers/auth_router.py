from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import database, models, schemas, auth
from ml.synthetic_generator import generate_user_persona_transactions

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", response_model=schemas.UserResponse)
def register_user(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_pw = auth.get_password_hash(user.password)
    new_user = models.User(
        name=user.name,
        email=user.email,
        hashed_password=hashed_pw
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Cold Start Strategy Implementation
    if getattr(user, "cold_start_option", "demo") == "demo":
        persona = getattr(user, "selected_persona", "Working Professional") or "Working Professional"
        tx_list = generate_user_persona_transactions(user_id=new_user.id, persona_name=persona, count=40)
        
        for tx in tx_list:
            if tx["type"] == "Income":
                inc = models.Income(
                    user_id=new_user.id,
                    title=tx["title"],
                    amount=tx["amount"],
                    category=tx["category"],
                    source=tx["source"],
                    notes=tx["notes"],
                    date=tx["date"]
                )
                db.add(inc)
            else:
                exp = models.Expense(
                    user_id=new_user.id,
                    title=tx["title"],
                    amount=tx["amount"],
                    category=tx["category"],
                    merchant=tx["merchant"],
                    payment_method=tx["payment_method"],
                    location=tx["location"],
                    device=tx["device"],
                    notes=tx["notes"],
                    date=tx["date"],
                    is_suspicious=False,
                    anomaly_score=0.05
                )
                db.add(exp)
        
        # Seed initial budgets matching persona
        default_budgets = [
            models.Budget(user_id=new_user.id, category="Food", monthly_limit=8000.0),
            models.Budget(user_id=new_user.id, category="Shopping", monthly_limit=6000.0),
            models.Budget(user_id=new_user.id, category="Travel", monthly_limit=4000.0),
            models.Budget(user_id=new_user.id, category="Utilities", monthly_limit=3000.0),
            models.Budget(user_id=new_user.id, category="Entertainment", monthly_limit=2500.0),
        ]
        db.add_all(default_budgets)

        audit = models.AuditLog(
            user_id=new_user.id,
            action="COLD_START_DEMO_DATA",
            details=f"Initialized account with '{persona}' persona synthetic transactions."
        )
        db.add(audit)
        db.commit()
    else:
        audit = models.AuditLog(
            user_id=new_user.id,
            action="COLD_START_EMPTY",
            details="Initialized clean empty account without demo data."
        )
        db.add(audit)
        db.commit()

    return new_user

@router.post("/login", response_model=schemas.Token)
def login(credentials: schemas.UserLogin, db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.email == credentials.email).first()
    if not user or not auth.verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = auth.create_access_token(data={"sub": user.email})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.get("/me", response_model=schemas.UserResponse)
def get_me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user

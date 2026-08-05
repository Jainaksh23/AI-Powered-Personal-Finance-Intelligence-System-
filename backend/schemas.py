from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import List, Optional

# Auth Schemas
class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    cold_start_option: Optional[str] = "demo" # "demo" or "empty"
    selected_persona: Optional[str] = "Working Professional"

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str = "User"
    currency: str = "₹"
    alert_threshold: float = 80.0
    created_at: datetime

    class Config:
        from_attributes = True

class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    currency: Optional[str] = None
    alert_threshold: Optional[float] = None

class UserPasswordUpdate(BaseModel):
    current_password: str
    new_password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

# Income Schemas
class IncomeCreate(BaseModel):
    title: str
    amount: float
    category: Optional[str] = "Salary"
    source: Optional[str] = "Main Employer"
    notes: Optional[str] = None
    date: Optional[datetime] = None

class IncomeUpdate(BaseModel):
    title: Optional[str] = None
    amount: Optional[float] = None
    category: Optional[str] = None
    source: Optional[str] = None
    notes: Optional[str] = None
    date: Optional[datetime] = None

class IncomeResponse(IncomeCreate):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Expense Schemas
class ExpenseCreate(BaseModel):
    title: str
    amount: float
    category: str
    merchant: Optional[str] = "General Store"
    payment_method: Optional[str] = "UPI"
    location: Optional[str] = "Home City"
    device: Optional[str] = "Primary Phone"
    notes: Optional[str] = None
    date: Optional[datetime] = None

class ExpenseUpdate(BaseModel):
    title: Optional[str] = None
    amount: Optional[float] = None
    category: Optional[str] = None
    merchant: Optional[str] = None
    payment_method: Optional[str] = None
    location: Optional[str] = None
    notes: Optional[str] = None
    date: Optional[datetime] = None

class ExpenseResponse(ExpenseCreate):
    id: int
    user_id: int
    is_suspicious: bool
    anomaly_score: float
    created_at: datetime

    class Config:
        from_attributes = True

# Smart Auto Detection Schemas
class SMSParseRequest(BaseModel):
    sms_text: str

class BankApiSimulateRequest(BaseModel):
    account_id: str
    amount: float
    merchant: str
    payment_method: str = "UPI"
    reference_number: Optional[str] = None

class ConfirmTransactionRequest(BaseModel):
    title: Optional[str] = None
    amount: Optional[float] = None
    category: Optional[str] = None
    merchant: Optional[str] = None
    payment_method: Optional[str] = None

class DetectedTransactionResponse(BaseModel):
    id: int
    user_id: int
    amount: float
    title: str
    category: str
    merchant: str
    payment_method: str
    transaction_source: str
    transaction_reference: Optional[str] = None
    confidence_score: float
    verification_status: str
    duplicate_flag: bool
    ai_category: Optional[str] = None
    raw_data: Optional[str] = None
    is_suspicious: bool
    risk_score: float
    fraud_reason: Optional[str] = None
    date: datetime
    created_at: datetime

    class Config:
        from_attributes = True

# Budget Schemas
class BudgetCreate(BaseModel):
    category: str
    monthly_limit: float

class BudgetUpdate(BaseModel):
    category: Optional[str] = None
    monthly_limit: Optional[float] = None

class BudgetResponse(BaseModel):
    id: int
    user_id: int
    category: str
    monthly_limit: float
    spent: float = 0.0
    remaining: float = 0.0
    utilization_percentage: float = 0.0
    status: str = "Safe" # Safe, Warning, Exceeded

    class Config:
        from_attributes = True

# Fraud Alert Schemas
class FraudAlertResponse(BaseModel):
    id: int
    expense_id: int
    risk_score: float
    reason: str
    status: str
    timestamp: datetime
    expense_title: Optional[str] = None
    expense_amount: Optional[float] = None

    class Config:
        from_attributes = True

# Recommendation Schemas
class RecommendationResponse(BaseModel):
    id: int
    category: str
    recommendation_text: str
    estimated_savings: float
    priority: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

# Prediction Response
class CategoryPrediction(BaseModel):
    category: str
    predicted_amount: float
    current_amount: float
    change_percent: float

class ExpensePredictionResponse(BaseModel):
    total_predicted_expense: float
    total_current_income: float
    predicted_savings: float
    savings_status: str # "Sufficient", "Warning", "Critical"
    budget_exhaustion_date: Optional[str] = "24th of the month"
    category_predictions: List[CategoryPrediction]
    confidence_score: float = 0.91
    trend: str = "Stable"
    model_used: str

# Spending Analytics Response
class CategoryBreakdown(BaseModel):
    category: str
    amount: float
    percentage: float

class MerchantBreakdown(BaseModel):
    merchant: str
    amount: float
    count: int

class SpendingAnalyticsResponse(BaseModel):
    total_income: float
    total_expense: float
    net_savings: float
    savings_rate: float
    budget_used: float
    remaining_budget: float
    financial_health_score: int # 0 to 100
    health_status: str # "Excellent", "Good", "Needs Attention", "Critical"
    user_persona: str = "Balanced Spender" # Persona e.g. "Food Lover", "Weekend Spender"
    intelligence_insights: Optional[List[str]] = []
    category_breakdown: List[CategoryBreakdown]
    top_merchants: List[MerchantBreakdown] = []
    monthly_trends: List[dict]

# Audit Log Response
class AuditLogResponse(BaseModel):
    id: int
    user_id: int
    action: str
    details: Optional[str] = None
    ip_address: str
    timestamp: datetime

    class Config:
        from_attributes = True

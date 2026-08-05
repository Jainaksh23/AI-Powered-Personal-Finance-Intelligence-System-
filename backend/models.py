from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="User") # User, Admin
    currency = Column(String, default="₹")
    alert_threshold = Column(Float, default=80.0) # % threshold for budget alerts
    created_at = Column(DateTime, default=datetime.utcnow)

    incomes = relationship("Income", back_populates="user", cascade="all, delete-orphan")
    expenses = relationship("Expense", back_populates="user", cascade="all, delete-orphan")
    budgets = relationship("Budget", back_populates="user", cascade="all, delete-orphan")
    fraud_alerts = relationship("FraudAlert", back_populates="user", cascade="all, delete-orphan")
    recommendations = relationship("Recommendation", back_populates="user", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="user", cascade="all, delete-orphan")
    detected_transactions = relationship("DetectedTransaction", back_populates="user", cascade="all, delete-orphan")

class Income(Base):
    __tablename__ = "incomes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    category = Column(String, default="Salary") # Salary, Freelance, Investment, Business, Other
    source = Column(String, default="Main Employer")
    notes = Column(Text, nullable=True)
    date = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="incomes")

class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    category = Column(String, nullable=False) # Food, Shopping, Travel, Recharge, Movies, Bills, Medical, Maintenance, Other
    merchant = Column(String, default="General Store")
    payment_method = Column(String, default="UPI") # UPI, Credit Card, Debit Card, Cash, Net Banking
    location = Column(String, default="Home City")
    device = Column(String, default="Primary Phone")
    notes = Column(Text, nullable=True)
    date = Column(DateTime, default=datetime.utcnow)
    is_suspicious = Column(Boolean, default=False)
    anomaly_score = Column(Float, default=0.0)

    # Extended Smart Auto Detection Fields
    transaction_source = Column(String, default="Manual") # Manual, SMS, FutureBankAPI
    merchant_name = Column(String, nullable=True)
    transaction_reference = Column(String, nullable=True)
    confidence_score = Column(Float, default=1.0)
    verification_status = Column(String, default="Confirmed") # Confirmed, Manual
    duplicate_flag = Column(Boolean, default=False)
    ai_category = Column(String, nullable=True)
    detection_timestamp = Column(DateTime, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="expenses")
    fraud_alerts = relationship("FraudAlert", back_populates="expense", cascade="all, delete-orphan")

class DetectedTransaction(Base):
    __tablename__ = "detected_transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    amount = Column(Float, nullable=False)
    title = Column(String, nullable=False)
    category = Column(String, nullable=False)
    merchant = Column(String, default="General Store")
    payment_method = Column(String, default="UPI")
    transaction_source = Column(String, default="SMS") # SMS, FutureBankAPI
    transaction_reference = Column(String, nullable=True)
    confidence_score = Column(Float, default=0.90)
    verification_status = Column(String, default="Pending") # Pending, Confirmed, Ignored
    duplicate_flag = Column(Boolean, default=False)
    ai_category = Column(String, nullable=True)
    raw_data = Column(Text, nullable=True)
    is_suspicious = Column(Boolean, default=False)
    risk_score = Column(Float, default=0.0)
    fraud_reason = Column(Text, nullable=True)
    date = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="detected_transactions")

class Budget(Base):
    __tablename__ = "budgets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    category = Column(String, nullable=False)
    monthly_limit = Column(Float, nullable=False)
    period = Column(String, default="Monthly")
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="budgets")

class FraudAlert(Base):
    __tablename__ = "fraud_alerts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    expense_id = Column(Integer, ForeignKey("expenses.id"), nullable=False)
    risk_score = Column(Float, nullable=False) # e.g. 0.95 for 95% probability
    reason = Column(Text, nullable=False)
    status = Column(String, default="Pending") # Pending, Reviewed, Dismissed
    timestamp = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="fraud_alerts")
    expense = relationship("Expense", back_populates="fraud_alerts")

class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    category = Column(String, nullable=False)
    recommendation_text = Column(Text, nullable=False)
    estimated_savings = Column(Float, nullable=False)
    priority = Column(String, default="Medium") # High, Medium, Low
    status = Column(String, default="Active") # Active, Implemented, Dismissed
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="recommendations")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    action = Column(String, nullable=False)
    details = Column(Text, nullable=True)
    ip_address = Column(String, default="127.0.0.1")
    timestamp = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="audit_logs")

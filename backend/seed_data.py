from sqlalchemy.orm import Session
from database import engine, SessionLocal, Base
import models, auth
from datetime import datetime, timedelta

def seed_database():
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    try:
        # Check if demo user exists
        existing_user = db.query(models.User).filter(models.User.email == "demo@pfis.com").first()
        if existing_user:
            print("Database already seeded with demo user.")
            return

        # 1. Create Demo User
        demo_user = models.User(
            name="Rahul Sharma",
            email="demo@pfis.com",
            hashed_password=auth.get_password_hash("password123"),
            role="User",
            currency="₹",
            alert_threshold=80.0
        )
        db.add(demo_user)
        db.commit()
        db.refresh(demo_user)

        # 2. Add Monthly Income (₹25,000)
        income1 = models.Income(
            user_id=demo_user.id,
            title="Monthly Pocket Allowance / Internship Stipend",
            amount=25000.0,
            category="Salary",
            source="TechCorp Inc.",
            notes="Monthly salary deposit",
            date=datetime.utcnow() - timedelta(days=30)
        )
        income2 = models.Income(
            user_id=demo_user.id,
            title="Monthly Stipend",
            amount=25000.0,
            category="Salary",
            source="TechCorp Inc.",
            notes="Monthly salary deposit",
            date=datetime.utcnow()
        )
        db.add_all([income1, income2])
        db.commit()

        # 3. Add Budgets
        budgets = [
            models.Budget(user_id=demo_user.id, category="Food", monthly_limit=8000.0),
            models.Budget(user_id=demo_user.id, category="Shopping", monthly_limit=6000.0),
            models.Budget(user_id=demo_user.id, category="Travel", monthly_limit=3000.0),
            models.Budget(user_id=demo_user.id, category="Movies", monthly_limit=2000.0),
            models.Budget(user_id=demo_user.id, category="Recharge", monthly_limit=1500.0),
        ]
        db.add_all(budgets)
        db.commit()

        # 4. Add Regular Expenses
        regular_expenses = [
            models.Expense(
                user_id=demo_user.id,
                title="Food & Swiggy Orders",
                amount=7000.0,
                category="Food",
                merchant="Swiggy / Zomato",
                payment_method="UPI",
                location="Home City",
                device="Primary Phone",
                notes="Weekend dining and lunches",
                date=datetime.utcnow() - timedelta(days=12),
                is_suspicious=False,
                anomaly_score=0.08
            ),
            models.Expense(
                user_id=demo_user.id,
                title="Myntra & Amazon Clothes",
                amount=5000.0,
                category="Shopping",
                merchant="Myntra Online",
                payment_method="UPI",
                location="Home City",
                device="Primary Phone",
                notes="Summer collection",
                date=datetime.utcnow() - timedelta(days=15),
                is_suspicious=False,
                anomaly_score=0.12
            ),
            models.Expense(
                user_id=demo_user.id,
                title="Uber & Local Metro Fare",
                amount=2500.0,
                category="Travel",
                merchant="Uber India",
                payment_method="UPI",
                location="Home City",
                device="Primary Phone",
                notes="Daily commute",
                date=datetime.utcnow() - timedelta(days=20),
                is_suspicious=False,
                anomaly_score=0.05
            ),
            models.Expense(
                user_id=demo_user.id,
                title="Jio Fiber & Mobile Recharge",
                amount=1000.0,
                category="Recharge",
                merchant="Jio Infocomm",
                payment_method="UPI",
                location="Home City",
                device="Primary Phone",
                notes="Monthly fiber plan",
                date=datetime.utcnow() - timedelta(days=25),
                is_suspicious=False,
                anomaly_score=0.02
            ),
            models.Expense(
                user_id=demo_user.id,
                title="PVR Movie Tickets & Popcorn",
                amount=3000.0,
                category="Movies",
                merchant="PVR Cinemas",
                payment_method="Credit Card",
                location="Home City",
                device="Primary Phone",
                notes="IMAX movie night",
                date=datetime.utcnow() - timedelta(days=8),
                is_suspicious=False,
                anomaly_score=0.15
            ),
        ]

        # Emergency Expense
        unexpected_expense = models.Expense(
            user_id=demo_user.id,
            title="Emergency Laptop Repair",
            amount=12000.0,
            category="Maintenance",
            merchant="TechCare Service Center",
            payment_method="Credit Card",
            location="Home City",
            device="Primary Phone",
            notes="Motherboard replacement",
            date=datetime.utcnow() - timedelta(days=2),
            is_suspicious=False,
            anomaly_score=0.35
        )

        # Fraud Transaction
        fraud_expense = models.Expense(
            user_id=demo_user.id,
            title="Luxury Tea & Cafe Purchase",
            amount=80000.0,
            category="Food",
            merchant="Unregistered Merchant #99",
            payment_method="Credit Card",
            location="Mumbai (Unrecognized City)",
            device="iPhone 15 Pro (Unregistered Device)",
            notes="Suspicious midnight charge",
            date=datetime.utcnow() - timedelta(days=1),
            is_suspicious=True,
            anomaly_score=0.95
        )

        db.add_all(regular_expenses + [unexpected_expense, fraud_expense])
        db.commit()

        # Initial Pending Auto-Detected Transactions
        pending_detections = [
            models.DetectedTransaction(
                user_id=demo_user.id,
                amount=350.0,
                title="Auto: Domino's",
                category="Food",
                merchant="Domino's",
                payment_method="UPI",
                transaction_source="SMS",
                transaction_reference="992812",
                confidence_score=0.98,
                verification_status="Pending",
                duplicate_flag=False,
                ai_category="Food",
                raw_data="Rs.350 debited from A/C XXXX1234 via UPI. Paid to Domino's. Ref 992812.",
                is_suspicious=False,
                risk_score=0.08,
                date=datetime.utcnow() - timedelta(hours=2)
            ),
            models.DetectedTransaction(
                user_id=demo_user.id,
                amount=2450.0,
                title="Auto: Amazon",
                category="Shopping",
                merchant="Amazon",
                payment_method="Credit Card",
                transaction_source="SMS",
                transaction_reference="881920",
                confidence_score=0.97,
                verification_status="Pending",
                duplicate_flag=False,
                ai_category="Shopping",
                raw_data="INR 2,450.00 spent at Amazon via HDFC Credit Card. Ref 881920.",
                is_suspicious=False,
                risk_score=0.12,
                date=datetime.utcnow() - timedelta(hours=5)
            )
        ]
        db.add_all(pending_detections)
        db.commit()

        # Fraud Alert
        fraud_alert = models.FraudAlert(
            user_id=demo_user.id,
            expense_id=fraud_expense.id,
            risk_score=0.95,
            reason="⚠ Fraud Probability = 95%. Unusually large transaction amount (₹80,000.00 vs avg ₹3,700.00) | Unusual transaction time (03:15 AM) | Transaction from unverified location 'Mumbai' | New device 'iPhone 15 Pro'",
            status="Pending",
            timestamp=datetime.utcnow() - timedelta(days=1)
        )

        # Initial Recommendations
        recs = [
            models.Recommendation(
                user_id=demo_user.id,
                category="Food",
                recommendation_text="Food spending accounts for 28% of your income. Reducing food delivery orders by 15% saves ₹1,050/month.",
                estimated_savings=1050.0,
                priority="High",
                status="Active"
            ),
            models.Recommendation(
                user_id=demo_user.id,
                category="Shopping",
                recommendation_text="Shopping takes ₹5,000/month. Setting a ₹3,500 monthly spending limit creates a cushion against emergency costs.",
                estimated_savings=1500.0,
                priority="High",
                status="Active"
            ),
            models.Recommendation(
                user_id=demo_user.id,
                category="Emergency Fund",
                recommendation_text="Auto-transfer ₹2,000 on salary day to a high-yield emergency fund to prepare for unexpected repair costs.",
                estimated_savings=2000.0,
                priority="High",
                status="Active"
            )
        ]

        db.add_all([fraud_alert] + recs)
        db.commit()

        # Audit Log initial entry
        audit = models.AuditLog(
            user_id=demo_user.id,
            action="SYSTEM_INIT",
            details="Demo user account initialized with sample dataset and Smart Auto-Detection queue."
        )
        db.add(audit)
        db.commit()

        print("Successfully seeded demo data!")

    finally:
        db.close()

if __name__ == "__main__":
    seed_database()

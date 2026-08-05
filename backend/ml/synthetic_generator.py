import random
import csv
import os
from datetime import datetime, timedelta

# Merchant Database
MERCHANTS = {
    "Food": ["Domino's", "Pizza Hut", "McDonald's", "KFC", "Starbucks", "Zomato", "Swiggy"],
    "Shopping": ["Amazon", "Flipkart", "Myntra", "Ajio"],
    "Travel": ["Uber", "Ola", "Rapido"],
    "Healthcare": ["Apollo Pharmacy", "MedPlus"],
    "Entertainment": ["BookMyShow", "PVR"],
    "Utilities": ["Electricity Bill", "Water Bill", "Gas Bill", "Broadband"],
    "Salary": ["Company Payroll"],
    "Education": ["Coursera", "Udemy"],
    "Maintenance": ["TechCare Service Center", "Local Workshop"]
}

CITIES = ["Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Pune", "Chennai", "Kolkata"]
PAYMENT_MODES = ["UPI", "Credit Card", "Debit Card", "Net Banking"]

# Persona Profiles defining spending weight distributions & average amounts
PERSONA_PROFILES = {
    "Student": {
        "monthly_income": 15000.0,
        "category_weights": {"Food": 0.40, "Entertainment": 0.20, "Recharge": 0.15, "Shopping": 0.15, "Travel": 0.10},
        "avg_tx_amount": {"Food": 350, "Entertainment": 600, "Recharge": 499, "Shopping": 1200, "Travel": 250}
    },
    "Working Professional": {
        "monthly_income": 65000.0,
        "category_weights": {"Food": 0.25, "Shopping": 0.25, "Travel": 0.20, "Utilities": 0.15, "Entertainment": 0.15},
        "avg_tx_amount": {"Food": 650, "Shopping": 2500, "Travel": 500, "Utilities": 1800, "Entertainment": 1200}
    },
    "Freelancer": {
        "monthly_income": 50000.0,
        "category_weights": {"Food": 0.30, "Shopping": 0.20, "Education": 0.20, "Utilities": 0.15, "Travel": 0.15},
        "avg_tx_amount": {"Food": 500, "Shopping": 1800, "Education": 3000, "Utilities": 1500, "Travel": 400}
    },
    "Family User": {
        "monthly_income": 90000.0,
        "category_weights": {"Utilities": 0.30, "Healthcare": 0.25, "Shopping": 0.20, "Food": 0.15, "Education": 0.10},
        "avg_tx_amount": {"Utilities": 3500, "Healthcare": 2200, "Shopping": 4500, "Food": 1200, "Education": 5000}
    },
    "High Saver": {
        "monthly_income": 80000.0,
        "category_weights": {"Utilities": 0.35, "Healthcare": 0.20, "Food": 0.20, "Shopping": 0.15, "Travel": 0.10},
        "avg_tx_amount": {"Utilities": 2000, "Healthcare": 1500, "Food": 350, "Shopping": 1000, "Travel": 200}
    },
    "Luxury Spender": {
        "monthly_income": 180000.0,
        "category_weights": {"Shopping": 0.40, "Food": 0.25, "Travel": 0.20, "Entertainment": 0.15},
        "avg_tx_amount": {"Shopping": 12000, "Food": 2500, "Travel": 3500, "Entertainment": 4000}
    },
    "Frequent Traveller": {
        "monthly_income": 75000.0,
        "category_weights": {"Travel": 0.45, "Food": 0.25, "Shopping": 0.15, "Utilities": 0.15},
        "avg_tx_amount": {"Travel": 2800, "Food": 900, "Shopping": 2000, "Utilities": 1500}
    },
    "Food Lover": {
        "monthly_income": 45000.0,
        "category_weights": {"Food": 0.55, "Entertainment": 0.15, "Shopping": 0.15, "Utilities": 0.15},
        "avg_tx_amount": {"Food": 750, "Entertainment": 800, "Shopping": 1500, "Utilities": 1200}
    }
}

class SyntheticDataGenerator:
    """
    Generator of realistic financial transaction data to solve the cold-start problem
    and pre-train ML models (Regression Forecasting & IsolationForest Fraud Detection).
    """

    def __init__(self, num_records: int = 6000):
        self.num_records = num_records

    def generate_dataset(self) -> list:
        records = []
        start_date = datetime.utcnow() - timedelta(days=365)

        for i in range(1, self.num_records + 1):
            # Random date within past 1 year
            days_offset = random.randint(0, 365)
            tx_datetime = start_date + timedelta(days=days_offset, minutes=random.randint(0, 1439))
            
            month = tx_datetime.month
            day_of_week = tx_datetime.strftime("%A")
            is_weekend = day_of_week in ["Saturday", "Sunday"]
            is_festival = month in [10, 11, 12] # Festival season surge

            # Pick persona
            persona_name = random.choice(list(PERSONA_PROFILES.keys()))
            persona = PERSONA_PROFILES[persona_name]

            # Income or Expense
            is_income = (tx_datetime.day in [1, 30] and random.random() < 0.08)
            if is_income:
                category = "Salary"
                merchant = "Company Payroll"
                amount = round(persona["monthly_income"] * random.uniform(0.95, 1.05), 2)
                tx_type = "Income"
                is_recurring = True
            else:
                tx_type = "Expense"
                categories = list(persona["category_weights"].keys())
                weights = list(persona["category_weights"].values())
                category = random.choices(categories, weights=weights)[0]
                
                merchants_list = MERCHANTS.get(category, ["General Store"])
                merchant = random.choice(merchants_list)
                
                base_amt = persona["avg_tx_amount"].get(category, 500)
                
                # Multipliers
                multiplier = 1.0
                if is_weekend and category in ["Shopping", "Entertainment", "Food"]:
                    multiplier *= random.uniform(1.2, 1.6)
                if is_festival and category == "Shopping":
                    multiplier *= random.uniform(1.4, 2.0)
                    
                amount = round(max(50.0, random.gauss(base_amt * multiplier, base_amt * 0.3)), 2)
                is_recurring = category in ["Utilities", "Education"]

            # Fraud label simulation (approx 2% anomalies)
            is_fraud = False
            location_type = "Home City"
            city = random.choice(CITIES[:3])

            if not is_income and random.random() < 0.02:
                is_fraud = True
                amount = round(amount * random.uniform(5.0, 12.0), 2)
                location_type = "Unrecognized City"
                city = random.choice(CITIES[4:])

            payment_mode = random.choice(PAYMENT_MODES)
            time_str = tx_datetime.strftime("%H:%M:%S")

            records.append({
                "transaction_id": f"TXN-{100000 + i}",
                "user_id": random.randint(1, 100),
                "date": tx_datetime.strftime("%Y-%m-%d"),
                "time": time_str,
                "amount": amount,
                "merchant_name": merchant,
                "category": category,
                "payment_mode": payment_mode,
                "transaction_type": tx_type,
                "city": city,
                "day_of_week": day_of_week,
                "month": month,
                "weekend_flag": is_weekend,
                "festival_flag": is_festival,
                "recurring_flag": is_recurring,
                "location_type": location_type,
                "fraud_label": 1 if is_fraud else 0,
                "notes": f"Synthetic transaction ({persona_name})"
            })

        return records

    def export_to_csv(self, filepath: str = "synthetic_transactions.csv"):
        data = self.generate_dataset()
        fieldnames = list(data[0].keys())
        with open(filepath, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(data)
        print(f"Exported {len(data)} synthetic transactions to {filepath}")

def generate_user_persona_transactions(user_id: int, persona_name: str = "Working Professional", count: int = 40) -> list:
    """
    Generates tailored initial financial transactions for a newly registered user
    choosing the 'Explore with Demo Data' cold-start option.
    """
    persona = PERSONA_PROFILES.get(persona_name, PERSONA_PROFILES["Working Professional"])
    now = datetime.utcnow()
    transactions = []

    # Add 2 monthly incomes
    transactions.append({
        "user_id": user_id,
        "title": "Monthly Salary",
        "amount": persona["monthly_income"],
        "category": "Salary",
        "source": "Corporate Payroll",
        "type": "Income",
        "date": now - timedelta(days=30),
        "notes": "Salary Deposit"
    })
    transactions.append({
        "user_id": user_id,
        "title": "Monthly Salary",
        "amount": persona["monthly_income"],
        "category": "Salary",
        "source": "Corporate Payroll",
        "type": "Income",
        "date": now,
        "notes": "Salary Deposit"
    })

    # Add expenses across categories
    categories = list(persona["category_weights"].keys())
    weights = list(persona["category_weights"].values())

    for i in range(count):
        days_ago = random.randint(1, 35)
        tx_date = now - timedelta(days=days_ago, hours=random.randint(0, 23))
        cat = random.choices(categories, weights=weights)[0]
        merchants_list = MERCHANTS.get(cat, ["General Store"])
        merchant = random.choice(merchants_list)
        base_amt = persona["avg_tx_amount"].get(cat, 450)
        amt = round(max(60.0, random.gauss(base_amt, base_amt * 0.25)), 2)

        transactions.append({
            "user_id": user_id,
            "title": f"{cat} - {merchant}",
            "amount": amt,
            "category": cat,
            "merchant": merchant,
            "payment_method": random.choice(["UPI", "Credit Card", "Debit Card"]),
            "location": "Home City",
            "device": "Primary Phone",
            "type": "Expense",
            "date": tx_date,
            "notes": f"Auto-generated for {persona_name}"
        })

    return transactions

if __name__ == "__main__":
    generator = SyntheticDataGenerator(num_records=7500)
    generator.export_to_csv("synthetic_transactions.csv")

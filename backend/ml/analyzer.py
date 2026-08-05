from sqlalchemy.orm import Session
import models
from datetime import datetime
import pandas as pd
from typing import Dict, List

def calculate_spending_analytics(user_id: int, db: Session) -> dict:
    """
    Computes total income, expenses, net savings, category breakdown percentages,
    merchant breakdowns, user habit persona classification, behavioral pattern insights,
    and Financial Health Score (0-100).
    """
    incomes = db.query(models.Income).filter(models.Income.user_id == user_id).all()
    expenses = db.query(models.Expense).filter(models.Expense.user_id == user_id).all()
    budgets = db.query(models.Budget).filter(models.Budget.user_id == user_id).all()

    total_income = sum(i.amount for i in incomes) if incomes else 0.0
    total_expense = sum(e.amount for e in expenses) if expenses else 0.0
    net_savings = total_income - total_expense

    savings_rate = (net_savings / total_income * 100) if total_income > 0 else 0.0

    total_budget_limit = sum(b.monthly_limit for b in budgets) if budgets else (total_income * 0.8)
    budget_used = min(total_expense, total_budget_limit)
    remaining_budget = max(0.0, total_budget_limit - total_expense)

    # Category Breakdown
    cat_map = {}
    merchant_map = {}
    weekend_expense = 0.0
    weekday_expense = 0.0
    late_night_food_count = 0

    for e in expenses:
        cat_map[e.category] = cat_map.get(e.category, 0.0) + e.amount
        m_name = e.merchant or "General Store"
        if m_name not in merchant_map:
            merchant_map[m_name] = {"amount": 0.0, "count": 0}
        merchant_map[m_name]["amount"] += e.amount
        merchant_map[m_name]["count"] += 1

        if e.date:
            dt = e.date if isinstance(e.date, datetime) else datetime.fromisoformat(str(e.date).replace('Z', ''))
            if dt.weekday() >= 5: # Saturday or Sunday
                weekend_expense += e.amount
            else:
                weekday_expense += e.amount

            if e.category == "Food" and dt.hour >= 20: # After 8 PM
                late_night_food_count += 1

    category_breakdown = []
    for cat, amt in cat_map.items():
        pct = round((amt / total_expense * 100), 2) if total_expense > 0 else 0.0
        category_breakdown.append({
            "category": cat,
            "amount": round(amt, 2),
            "percentage": pct
        })
    category_breakdown.sort(key=lambda x: x['amount'], reverse=True)

    top_merchants = []
    for m_name, m_info in merchant_map.items():
        top_merchants.append({
            "merchant": m_name,
            "amount": round(m_info["amount"], 2),
            "count": m_info["count"]
        })
    top_merchants.sort(key=lambda x: x['amount'], reverse=True)
    top_merchants = top_merchants[:5]

    # User Spending Persona Classification
    food_spent = cat_map.get("Food", 0.0)
    shopping_spent = cat_map.get("Shopping", 0.0)
    entertainment_spent = cat_map.get("Movies", 0.0) + cat_map.get("Entertainment", 0.0)

    if savings_rate >= 35.0:
        user_persona = "Disciplined Saver"
    elif food_spent / max(1.0, total_expense) > 0.30:
        user_persona = "Food Lover"
    elif shopping_spent / max(1.0, total_expense) > 0.25:
        user_persona = "Heavy Shopper"
    elif weekend_expense / max(1.0, total_expense) > 0.35:
        user_persona = "Weekend Spender"
    elif entertainment_spent / max(1.0, total_expense) > 0.20:
        user_persona = "High Entertainment Spender"
    else:
        user_persona = "Balanced Spender"

    # Dynamic Intelligence Insights Generation
    insights = []
    if category_breakdown:
        top_cat = category_breakdown[0]
        insights.append(f"You spend most on {top_cat['category']} (₹{top_cat['amount']:,.2f} / {top_cat['percentage']}% of total).")

    if weekend_expense > 0 and weekday_expense > 0:
        ratio = round((weekend_expense / weekday_expense) * 100 - 100, 1)
        if ratio > 0:
            insights.append(f"Weekend spending is {ratio}% higher than weekday spending.")
        else:
            insights.append(f"Weekday spending accounts for {round(100 - (weekend_expense/total_expense)*100, 1)}% of your expenses.")

    if late_night_food_count > 0:
        insights.append(f"You frequently order food after 8 PM ({late_night_food_count} late-night dining orders detected).")

    if shopping_spent > 0:
        insights.append(f"Shopping expenses account for {round((shopping_spent/max(1.0, total_expense))*100, 1)}% of your discretionary spending.")

    insights.append(f"Your spending habits classify as '{user_persona}'.")

    # Monthly Trends aggregation
    monthly_trends = []
    if expenses:
        df_list = []
        for e in expenses:
            dt = e.date if isinstance(e.date, datetime) else datetime.fromisoformat(str(e.date).replace('Z', ''))
            df_list.append({"amount": e.amount, "month_year": dt.strftime("%b %Y")})
        df = pd.DataFrame(df_list)
        grouped = df.groupby("month_year", sort=False)["amount"].sum().reset_index()
        for idx, row in grouped.iterrows():
            monthly_trends.append({
                "month": row["month_year"],
                "expense": float(row["amount"]),
                "income": float(total_income / max(1, len(grouped))) if len(grouped) > 0 else total_income
            })
    else:
        monthly_trends = [
            {"month": "May", "income": 25000.0, "expense": 17500.0},
            {"month": "Jun", "income": 25000.0, "expense": 18200.0},
            {"month": "Jul", "income": 25000.0, "expense": 19500.0},
            {"month": "Aug", "income": 25000.0, "expense": total_expense or 18500.0}
        ]

    # Calculate Financial Health Score (0 to 100)
    score = 0
    if savings_rate >= 30:
        score += 50
    elif savings_rate >= 20:
        score += 40
    elif savings_rate >= 10:
        score += 25
    elif savings_rate >= 0:
        score += 10

    exp_ratio = (total_expense / total_income) if total_income > 0 else 1.0
    if exp_ratio <= 0.70:
        score += 30
    elif exp_ratio <= 0.85:
        score += 20
    elif exp_ratio <= 0.95:
        score += 10

    suspicious_count = len([e for e in expenses if e.is_suspicious])
    if suspicious_count == 0:
        score += 20
    else:
        score += max(0, 20 - (suspicious_count * 5))

    score = min(100, max(0, score))

    if score >= 80:
        health_status = "Excellent"
    elif score >= 60:
        health_status = "Good"
    elif score >= 40:
        health_status = "Needs Attention"
    else:
        health_status = "Critical"

    return {
        "total_income": round(total_income, 2),
        "total_expense": round(total_expense, 2),
        "net_savings": round(net_savings, 2),
        "savings_rate": round(savings_rate, 2),
        "budget_used": round(budget_used, 2),
        "remaining_budget": round(remaining_budget, 2),
        "financial_health_score": score,
        "health_status": health_status,
        "user_persona": user_persona,
        "intelligence_insights": insights,
        "category_breakdown": category_breakdown,
        "top_merchants": top_merchants,
        "monthly_trends": monthly_trends
    }

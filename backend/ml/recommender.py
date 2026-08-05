from sqlalchemy.orm import Session
import models

def generate_personalized_recommendations(user_id: int, db: Session) -> list:
    """
    Generates explainable, actionable financial recommendations including
    Savings Opportunity Detection and Dynamic Budget Optimization recommendations.
    """
    expenses = db.query(models.Expense).filter(models.Expense.user_id == user_id).all()
    incomes = db.query(models.Income).filter(models.Income.user_id == user_id).all()
    budgets = db.query(models.Budget).filter(models.Budget.user_id == user_id).all()

    total_income = sum(i.amount for i in incomes) if incomes else 25000.0
    total_expense = sum(e.amount for e in expenses) if expenses else 0.0

    # Aggregate by category
    cat_totals = {}
    for e in expenses:
        cat_totals[e.category] = cat_totals.get(e.category, 0.0) + e.amount

    recommendations = []

    # Savings Opportunity 1: Food Delivery Optimization
    food_spent = cat_totals.get("Food", 7000.0 if not expenses else 0.0)
    if food_spent > 3000:
        savings = round(food_spent * 0.20, 2)
        recommendations.append({
            "category": "Food",
            "recommendation_text": f"You spent ₹{food_spent:,.0f} on food delivery & dining this month. Reducing food delivery by 20% could save ₹{savings:,.0f}/month.",
            "estimated_savings": savings,
            "priority": "High",
            "status": "Active"
        })

    # Savings Opportunity 2: Shopping Cap
    shopping_spent = cat_totals.get("Shopping", 5000.0 if not expenses else 0.0)
    if shopping_spent > 3500:
        est_save = round(shopping_spent * 0.25, 2)
        recommendations.append({
            "category": "Shopping",
            "recommendation_text": f"Shopping takes ₹{shopping_spent:,.0f}/month. Setting a ₹3,500 monthly spending limit creates a safety cushion of ₹{est_save:,.0f}.",
            "estimated_savings": est_save,
            "priority": "High",
            "status": "Active"
        })

    # Budget Optimization Recommendation
    for b in budgets:
        cat_spent = cat_totals.get(b.category, 0.0)
        if cat_spent > b.monthly_limit:
            suggested_limit = round(cat_spent * 0.90, 2)
            recommendations.append({
                "category": f"Budget: {b.category}",
                "recommendation_text": f"Your actual spending in '{b.category}' (₹{cat_spent:,.0f}) exceeded your monthly limit (₹{b.monthly_limit:,.0f}). AI suggests adjusting budget to ₹{suggested_limit:,.0f} or reducing spending by ₹{round(cat_spent - b.monthly_limit, 2):,.0f}.",
                "estimated_savings": round(cat_spent - b.monthly_limit, 2),
                "priority": "High",
                "status": "Active"
            })

    # Savings Opportunity 3: Emergency Fund Transfer
    current_savings = total_income - total_expense
    if current_savings < 5000:
        recommendations.append({
            "category": "Emergency Fund",
            "recommendation_text": "Auto-transfer ₹2,000 on salary day to a high-yield liquid emergency fund to build 3 months of emergency expenses.",
            "estimated_savings": 2000.0,
            "priority": "High",
            "status": "Active"
        })

    # Default fallback if empty
    if not recommendations:
        recommendations.append({
            "category": "Savings Optimization",
            "recommendation_text": "Your current spending habits are balanced. Maintain a minimum 20% savings target into liquid emergency reserves.",
            "estimated_savings": 2000.0,
            "priority": "Low",
            "status": "Active"
        })

    return recommendations

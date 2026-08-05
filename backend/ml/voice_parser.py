import re
from typing import Dict, Any

KNOWN_CATEGORIES = {
    "food": "Food",
    "coffee": "Food",
    "pizza": "Food",
    "burger": "Food",
    "dining": "Food",
    "restaurant": "Food",
    "swiggy": "Food",
    "zomato": "Food",
    "domino": "Food",
    "starbucks": "Food",
    "shopping": "Shopping",
    "clothes": "Shopping",
    "amazon": "Shopping",
    "flipkart": "Shopping",
    "myntra": "Shopping",
    "travel": "Travel",
    "uber": "Travel",
    "ola": "Travel",
    "cab": "Travel",
    "flight": "Travel",
    "recharge": "Recharge",
    "jio": "Recharge",
    "airtel": "Recharge",
    "movies": "Movies",
    "pvr": "Movies",
    "cinema": "Movies",
    "ticket": "Movies",
    "healthcare": "Medical",
    "pharmacy": "Medical",
    "medicine": "Medical",
    "apollo": "Medical",
    "utility": "Utilities",
    "electricity": "Utilities",
    "water": "Utilities",
    "bill": "Utilities"
}

KNOWN_MERCHANTS = [
    "Domino's", "Zomato", "Swiggy", "Starbucks", "Uber", "Ola", 
    "Amazon", "Flipkart", "Myntra", "Apollo Pharmacy", "PVR Cinemas", "Jio", "Airtel"
]

def parse_voice_command(command_text: str) -> Dict[str, Any]:
    """
    Intelligent NLP Voice Command Parser.
    Converts English/Hinglish spoken text into structured intents & attributes.
    """
    text = command_text.strip()
    text_lower = text.lower()

    # 1. Determine Intent
    intent = "QUERY_ANALYTICS" # Default intent

    if any(kw in text_lower for kw in ["spent", "paid", "log expense", "expense of", "bought", "cost", "charged"]):
        intent = "LOG_EXPENSE"
    elif any(kw in text_lower for kw in ["income", "received", "salary", "stipend", "earned", "added income", "deposit"]):
        intent = "LOG_INCOME"
    elif any(kw in text_lower for kw in ["budget", "monthly limit", "remaining limit", "over budget"]):
        intent = "QUERY_BUDGET"
    elif any(kw in text_lower for kw in ["fraud", "suspicious", "alert", "anomaly", "risk"]):
        intent = "QUERY_FRAUD"
    elif any(kw in text_lower for kw in ["spend", "analytics", "total", "health score", "summary", "how much"]):
        intent = "QUERY_ANALYTICS"

    # 2. Extract Amount
    amount = 0.0
    amt_match = re.search(r'(?:rs\.?|inr|₹|rupees?|amount)?\s*([\d,]+(?:\.\d{1,2})?)\s*(?:rs\.?|inr|₹|rupees?)?', text_lower)
    if amt_match:
        try:
            amt_str = amt_match.group(1).replace(',', '')
            val = float(amt_str)
            if val > 0 and val != 2026:
                amount = val
        except ValueError:
            amount = 0.0

    # Fallback amount extraction if number appears standalone
    if amount <= 0:
        nums = re.findall(r'\b\d+(?:\.\d{1,2})?\b', text)
        for n in nums:
            try:
                v = float(n)
                if v > 0 and len(n) <= 6:
                    amount = v
                    break
            except ValueError:
                pass

    # 3. Extract Category
    category = "Food" if intent == "LOG_EXPENSE" else ("Salary" if intent == "LOG_INCOME" else "General")
    for kw, cat in KNOWN_CATEGORIES.items():
        if kw in text_lower:
            category = cat
            break

    # 4. Extract Merchant
    merchant = "General Store"
    for m in KNOWN_MERCHANTS:
        if m.lower() in text_lower:
            merchant = m
            break

    # Dynamic merchant extraction regex
    if merchant == "General Store" and intent == "LOG_EXPENSE":
        m_match = re.search(r'(?:at|to|from|for)\s+([A-Za-z0-9\'\s]+?)(?:\s+on|\s+via|\s+for|\s+rupees|$)', text_lower)
        if m_match:
            raw_m = m_match.group(1).strip().title()
            if len(raw_m) >= 2 and raw_m.lower() not in ["food", "coffee", "pizza", "lunch", "dinner", "shopping"]:
                merchant = raw_m

    # 5. Extract Payment Method
    payment_method = "UPI"
    if "credit card" in text_lower or "card" in text_lower:
        payment_method = "Credit Card"
    elif "debit card" in text_lower:
        payment_method = "Debit Card"
    elif "netbanking" in text_lower or "bank" in text_lower:
        payment_method = "Net Banking"
    elif "cash" in text_lower:
        payment_method = "Cash"

    # 6. Build Title
    title = f"{category} - {merchant}" if intent == "LOG_EXPENSE" else (f"Income: {merchant}" if intent == "LOG_INCOME" else text)

    return {
        "intent": intent,
        "amount": amount,
        "category": category,
        "merchant": merchant,
        "payment_method": payment_method,
        "title": title,
        "raw_text": command_text
    }

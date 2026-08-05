from typing import Dict, Any

MERCHANT_DICTIONARY = {
    # Food & Dining
    "domino's": ("Food", 0.98),
    "dominos": ("Food", 0.98),
    "swiggy": ("Food", 0.98),
    "zomato": ("Food", 0.98),
    "kfc": ("Food", 0.98),
    "mcdonald's": ("Food", 0.98),
    "mcdonalds": ("Food", 0.98),
    "starbucks": ("Food", 0.95),
    "pizza hut": ("Food", 0.98),
    "burger king": ("Food", 0.98),

    # Travel & Rides
    "uber": ("Travel", 0.96),
    "ola": ("Travel", 0.96),
    "rapido": ("Travel", 0.95),
    "metro": ("Travel", 0.95),
    "irctc": ("Travel", 0.98),
    "redbus": ("Travel", 0.96),
    "make my trip": ("Travel", 0.97),

    # Shopping
    "amazon": ("Shopping", 0.97),
    "flipkart": ("Shopping", 0.97),
    "myntra": ("Shopping", 0.97),
    "ajio": ("Shopping", 0.96),
    "shoppers stop": ("Shopping", 0.95),
    "zara": ("Shopping", 0.95),

    # Medical & Healthcare
    "apollo pharmacy": ("Medical", 0.98),
    "apollo": ("Medical", 0.95),
    "pharmeasy": ("Medical", 0.98),
    "netmeds": ("Medical", 0.98),
    "1mg": ("Medical", 0.98),

    # Electronics
    "croma": ("Shopping", 0.94),
    "reliance digital": ("Shopping", 0.94),
    "vijay sales": ("Shopping", 0.94),

    # Entertainment & Movies
    "bookmyshow": ("Movies", 0.96),
    "pvr": ("Movies", 0.96),
    "inox": ("Movies", 0.96),
    "netflix": ("Movies", 0.98),
    "spotify": ("Movies", 0.98),

    # Recharge & Utilities
    "jio": ("Recharge", 0.99),
    "airtel": ("Recharge", 0.99),
    "vi": ("Recharge", 0.99),
    "bsnl": ("Recharge", 0.99),
}

def classify_merchant_category(merchant_name: str) -> Dict[str, Any]:
    """
    Automated AI Merchant Categorizer.
    Returns predicted category and confidence score.
    """
    m_clean = (merchant_name or "").strip().lower()

    # Exact dictionary match
    if m_clean in MERCHANT_DICTIONARY:
        cat, conf = MERCHANT_DICTIONARY[m_clean]
        return {"category": cat, "confidence_score": conf, "ai_category": cat}

    # Partial substring match against dictionary keys
    for key, (cat, conf) in MERCHANT_DICTIONARY.items():
        if key in m_clean or m_clean in key:
            return {"category": cat, "confidence_score": conf * 0.95, "ai_category": cat}

    # Keyword heuristics
    if any(kw in m_clean for kw in ["food", "cafe", "restaurant", "baking", "kitchen", "tea", "coffee", "diner"]):
        return {"category": "Food", "confidence_score": 0.85, "ai_category": "Food"}
    if any(kw in m_clean for kw in ["cab", "auto", "ride", "bus", "travel", "flight", "tour", "rail"]):
        return {"category": "Travel", "confidence_score": 0.85, "ai_category": "Travel"}
    if any(kw in m_clean for kw in ["store", "mart", "shop", "fashion", "apparel", "wear", "bazaar"]):
        return {"category": "Shopping", "confidence_score": 0.85, "ai_category": "Shopping"}
    if any(kw in m_clean for kw in ["pharma", "medical", "hospital", "clinic", "health", "doctor", "chem"]):
        return {"category": "Medical", "confidence_score": 0.85, "ai_category": "Medical"}
    if any(kw in m_clean for kw in ["recharge", "fiber", "telecom", "broadband", "mobile"]):
        return {"category": "Recharge", "confidence_score": 0.85, "ai_category": "Recharge"}

    return {"category": "Other", "confidence_score": 0.70, "ai_category": "Other"}

import re
from datetime import datetime
from typing import Dict, Any
from services.providers.base_provider import TransactionProvider

class SMSProvider(TransactionProvider):
    """
    Intelligent & Bulletproof SMS Transaction Parser capable of extracting amount, merchant,
    payment mode, reference numbers, and transaction type across HDFC, SBI, ICICI, Axis,
    Paytm, PhonePe, Google Pay, Amazon Pay, and all Indian Bank SMS formats.
    """

    def parse_transaction(self, raw_sms: str) -> Dict[str, Any]:
        sms = raw_sms.strip()
        sms_lower = sms.lower()

        # -------------------------------------------------------------
        # 1. EXTRACT AMOUNT
        # -------------------------------------------------------------
        amount = 0.0

        # Pattern A: Standard Currency Prefix (Rs / Rs. / INR / ₹) -> Rs.350, INR 1,200.50, ₹500
        amount_match = re.search(r'(?:Rs\.?|INR|₹|amt:?|amount:?)\s*([\d,]+(?:\.\d{1,2})?)', sms, re.IGNORECASE)
        if amount_match:
            try:
                amount = float(amount_match.group(1).replace(',', ''))
            except ValueError:
                amount = 0.0

        # Pattern B: Currency Suffix -> 350 Rs / 350.00 INR / 350/-
        if amount <= 0:
            suffix_match = re.search(r'([\d,]+(?:\.\d{1,2})?)\s*(?:Rs\.?|INR|₹|\/-)', sms, re.IGNORECASE)
            if suffix_match:
                try:
                    amount = float(suffix_match.group(1).replace(',', ''))
                except ValueError:
                    amount = 0.0

        # Pattern C: General Debited/Spent/Paid numeric pattern -> debited by 350 / paid 350
        if amount <= 0:
            verb_match = re.search(r'(?:debited|spent|paid|transferred|sent)(?:\s+by|\s+of|\s+for)?\s*([\d,]+(?:\.\d{1,2})?)', sms, re.IGNORECASE)
            if verb_match:
                try:
                    amount = float(verb_match.group(1).replace(',', ''))
                except ValueError:
                    amount = 0.0

        # Pattern D: Standalone fallback numeric match if any number > 0 exists
        if amount <= 0:
            any_num = re.findall(r'\b\d+(?:\.\d{1,2})?\b', sms)
            for n in any_num:
                try:
                    val = float(n)
                    # Exclude account numbers (e.g. 1234, 5678) or years 2026
                    if val > 0 and val != 2026 and len(n) <= 6:
                        amount = val
                        break
                except ValueError:
                    pass

        # -------------------------------------------------------------
        # 2. EXTRACT MERCHANT NAME
        # -------------------------------------------------------------
        merchant = "General Merchant"

        # Check known popular merchant dictionary first
        known_merchants = {
            "domino's": "Domino's",
            "dominos": "Domino's",
            "swiggy": "Swiggy",
            "zomato": "Zomato",
            "uber": "Uber",
            "ola": "Ola",
            "rapido": "Rapido",
            "amazon": "Amazon",
            "flipkart": "Flipkart",
            "myntra": "Myntra",
            "ajio": "Ajio",
            "apollo": "Apollo Pharmacy",
            "pharmeasy": "PharmEasy",
            "croma": "Croma",
            "bookmyshow": "BookMyShow",
            "pvr": "PVR Cinemas",
            "netflix": "Netflix",
            "spotify": "Spotify",
            "starbucks": "Starbucks",
            "jio": "Jio",
            "airtel": "Airtel",
            "bigbasket": "BigBasket",
            "zepto": "Zepto",
            "blinkit": "Blinkit",
            "dmart": "DMart"
        }

        for k, v in known_merchants.items():
            if k in sms_lower:
                merchant = v
                break

        # If not found in dictionary, extract dynamically via regex phrases
        if merchant == "General Merchant":
            # Matching: "paid to X", "spent at X", "to VPA X", "vpa X@upi", "info: X"
            merchant_match = re.search(
                r'(?:paid to|sent to|spent at|towards|at|vpa|info:?)\s+([A-Za-z0-9\'\.\s\-&@]+?)(?:\.|\s+via|\s+on|\s+ref|\s+txn|\s+a/c|\s+ac|\s+bank|$)',
                sms, re.IGNORECASE
            )
            if merchant_match:
                raw_m = merchant_match.group(1).strip()
                # Clean VPA handles like dominos@upi -> dominos
                if "@" in raw_m:
                    raw_m = raw_m.split("@")[0]

                # Strip extraneous words
                raw_m = re.sub(r'^(to|at|for|the|vpa)\s+', '', raw_m, flags=re.IGNORECASE)
                raw_m = re.sub(r'\s+(for|debited|credited|via|on|ref|txn|id)$', '', raw_m, flags=re.IGNORECASE)
                raw_m = raw_m.strip().title()

                if len(raw_m) >= 2 and not raw_m.lower().startswith('a/c'):
                    merchant = raw_m

        # -------------------------------------------------------------
        # 3. EXTRACT PAYMENT METHOD
        # -------------------------------------------------------------
        payment_method = "UPI"
        if "credit card" in sms_lower or "cc " in sms_lower or "card end" in sms_lower:
            payment_method = "Credit Card"
        elif "debit card" in sms_lower or "dc " in sms_lower or "atm" in sms_lower:
            payment_method = "Debit Card"
        elif "netbanking" in sms_lower or "net banking" in sms_lower:
            payment_method = "Net Banking"
        elif "upi" in sms_lower or "gpay" in sms_lower or "phonepe" in sms_lower or "paytm" in sms_lower or "@" in sms_lower:
            payment_method = "UPI"

        # -------------------------------------------------------------
        # 4. EXTRACT REFERENCE NUMBER
        # -------------------------------------------------------------
        ref_number = None
        ref_match = re.search(r'(?:ref(?:erence)?|txn|utr|id|num)\s*(?:no\.?|id|num)?\s*[:\.\-]?\s*([A-Za-z0-9]{6,16})', sms, re.IGNORECASE)
        if ref_match:
            ref_number = ref_match.group(1)

        # -------------------------------------------------------------
        # 5. TRANSACTION TYPE
        # -------------------------------------------------------------
        txn_type = "Debit"
        if "credited" in sms_lower or "received" in sms_lower or "deposited" in sms_lower:
            txn_type = "Credit"

        title = f"Auto: {merchant}"

        return {
            "title": title,
            "amount": amount,
            "merchant": merchant,
            "payment_method": payment_method,
            "transaction_type": txn_type,
            "transaction_reference": ref_number,
            "transaction_source": "SMS",
            "date": datetime.utcnow(),
            "raw_data": raw_sms
        }

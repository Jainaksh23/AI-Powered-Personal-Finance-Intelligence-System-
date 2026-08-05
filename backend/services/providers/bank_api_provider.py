import json
from datetime import datetime
from typing import Dict, Any
from services.providers.base_provider import TransactionProvider

class BankAPIProvider(TransactionProvider):
    """
    Open Banking / Direct Bank API Provider abstraction layer.
    Allows future real bank API integration (Plaid, Yodlee, Setu, Account Aggregator)
    without modifying database tables or core application logic.
    """

    def parse_transaction(self, raw_payload: str) -> Dict[str, Any]:
        """
        Parses standardized JSON payload received from Open Banking APIs or Webhooks.
        """
        try:
            data = json.loads(raw_payload)
        except Exception:
            data = {}

        amount = float(data.get("amount", 0.0))
        merchant = data.get("merchant", "Bank Direct Merchant")
        payment_method = data.get("payment_method", "Direct Bank API")
        ref_number = data.get("reference_number") or data.get("account_id")

        return {
            "title": f"Bank API: {merchant}",
            "amount": amount,
            "merchant": merchant,
            "payment_method": payment_method,
            "transaction_type": "Debit",
            "transaction_reference": ref_number,
            "transaction_source": "FutureBankAPI",
            "date": datetime.utcnow(),
            "raw_data": raw_payload
        }

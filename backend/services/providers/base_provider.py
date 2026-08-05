from abc import ABC, abstractmethod
from typing import Dict, Any, Optional

class TransactionProvider(ABC):
    """
    Abstract Base Class for transaction providers (SMS Parsing, Open Banking API, UPI Webhooks).
    Enables swapping ingestion channels without changing database schemas or core business logic.
    """

    @abstractmethod
    def parse_transaction(self, raw_payload: str) -> Dict[str, Any]:
        """
        Parses raw payload (e.g. SMS text string or JSON webhook) into standardized transaction dictionary.
        Returns dict containing: amount, merchant, payment_method, transaction_type, reference_number, date
        """
        pass

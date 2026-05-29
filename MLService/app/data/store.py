"""In-memory raw dataset store (immutable source for replay)."""
from __future__ import annotations

import pandas as pd

_RAW_STORE: dict[str, pd.DataFrame] = {}


def store_key(user_id: int, dataset_id: int) -> str:
    return f"u{user_id}_d{dataset_id}"


def put(user_id: int, dataset_id: int, df: pd.DataFrame) -> None:
    _RAW_STORE[store_key(user_id, dataset_id)] = df.copy()


def get(user_id: int, dataset_id: int) -> pd.DataFrame:
    key = store_key(user_id, dataset_id)
    if key not in _RAW_STORE:
        raise KeyError(f"Dataset not in memory: {key}")
    return _RAW_STORE[key].copy()

from __future__ import annotations

import io

import pandas as pd


def load_file(filename: str, content: bytes) -> pd.DataFrame:
    name = filename.lower()
    buf = io.BytesIO(content)
    if name.endswith(".csv"):
        return pd.read_csv(buf)
    if name.endswith((".xlsx", ".xls")):
        return pd.read_excel(buf)
    if name.endswith(".json"):
        return pd.read_json(buf)
    raise ValueError(f"Unsupported file type: {filename}")

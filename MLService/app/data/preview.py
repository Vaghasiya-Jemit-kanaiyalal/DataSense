from __future__ import annotations

import math

import numpy as np
import pandas as pd


def _sanitize(val):
    if val is None or (isinstance(val, float) and (math.isnan(val) or math.isinf(val))):
        return None
    if isinstance(val, (np.floating, float)) and (np.isnan(val) or np.isinf(val)):
        return None
    if isinstance(val, (np.integer,)):
        return int(val)
    if isinstance(val, (np.floating,)):
        return float(val)
    if pd.isna(val):
        return None
    return val


def dataframe_preview(df: pd.DataFrame, rows: int = 20, offset: int = 0) -> list[dict]:
    sample = df.iloc[offset : offset + rows]
    records = sample.to_dict(orient="records")
    return [{k: _sanitize(v) for k, v in row.items()} for row in records]

from __future__ import annotations

import pandas as pd


def apply(df: pd.DataFrame, params: list) -> pd.DataFrame:
    out = df.copy()
    for p in params:
        col = p.get("column")
        if col not in out.columns:
            continue
        old_value = p.get("old_value")
        new_value = p.get("new_value")
        out[col] = out[col].replace(old_value, new_value)
    return out

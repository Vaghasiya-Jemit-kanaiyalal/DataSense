from __future__ import annotations

import pandas as pd


def apply(df: pd.DataFrame, params: list) -> pd.DataFrame:
    out = df.copy()
    for p in params:
        col = p.get("column")
        if col not in out.columns:
            continue
        strategy = (p.get("strategy") or "mean").lower()
        if strategy == "drop":
            out = out.dropna(subset=[col])
            continue
        if strategy == "median":
            fill = pd.to_numeric(out[col], errors="coerce").median()
        elif strategy == "mode":
            mode = out[col].mode(dropna=True)
            fill = mode.iloc[0] if len(mode) else ""
        else:
            fill = pd.to_numeric(out[col], errors="coerce").mean()
        out[col] = out[col].fillna(fill)
    return out.reset_index(drop=True)

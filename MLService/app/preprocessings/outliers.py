from __future__ import annotations

import pandas as pd


def _bounds(series: pd.Series):
    s = pd.to_numeric(series, errors="coerce").dropna()
    if len(s) < 4:
        return None, None
    q1, q3 = s.quantile(0.25), s.quantile(0.75)
    iqr = q3 - q1
    return q1 - 1.5 * iqr, q3 + 1.5 * iqr


def apply(df: pd.DataFrame, params: list) -> pd.DataFrame:
    out = df.copy()
    for p in params:
        col = p.get("column")
        if col not in out.columns:
            continue
        strategy = (p.get("strategy") or "cap").lower()
        lower, upper = _bounds(out[col])
        if lower is None:
            continue
        numeric = pd.to_numeric(out[col], errors="coerce")
        if strategy == "remove":
            mask = ((numeric >= lower) & (numeric <= upper)) | numeric.isna()
            out = out[mask]
        else:
            out[col] = numeric.clip(lower=lower, upper=upper)
    return out.reset_index(drop=True)

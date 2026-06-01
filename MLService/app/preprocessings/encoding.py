from __future__ import annotations

import pandas as pd


def apply(df: pd.DataFrame, params: list) -> pd.DataFrame:
    out = df.copy()
    for p in params:
        col = p.get("column")
        if col not in out.columns:
            continue
        strategy = (p.get("strategy") or "label").lower()
        if strategy == "onehot":
            dummies = pd.get_dummies(out[col].astype(str), prefix=col)
            out = out.drop(columns=[col])
            out = pd.concat([out, dummies], axis=1)
        else:
            codes, _ = pd.factorize(out[col].astype(str))
            out[col] = codes
    return out.reset_index(drop=True)

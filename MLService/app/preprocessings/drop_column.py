from __future__ import annotations

import pandas as pd


def apply(df: pd.DataFrame, params: list) -> pd.DataFrame:
    cols = [p.get("column") for p in params if p.get("column") in df.columns]
    return df.drop(columns=cols, errors="ignore")

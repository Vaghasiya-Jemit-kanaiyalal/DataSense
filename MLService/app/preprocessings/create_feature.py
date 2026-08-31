from __future__ import annotations

import numpy as np
import pandas as pd


def apply(df: pd.DataFrame, params: list) -> pd.DataFrame:
    out = df.copy()
    for p in params:
        new_col = p.get("new_column") or p.get("name")
        if not new_col:
            continue
        feat_a = p.get("feature_a")
        feat_b = p.get("feature_b")
        op = p.get("operator") or p.get("operation") or "/"

        if feat_a and feat_b and feat_a in out.columns and feat_b in out.columns:
            ser_a = pd.to_numeric(out[feat_a], errors="coerce")
            ser_b = pd.to_numeric(out[feat_b], errors="coerce")
            if op in ("/", "div", "ratio"):
                res = ser_a / ser_b.replace(0, np.nan)
            elif op in ("*", "mul", "product"):
                res = ser_a * ser_b
            elif op in ("+", "add", "sum"):
                res = ser_a + ser_b
            elif op in ("-", "sub", "diff"):
                res = ser_a - ser_b
            else:
                res = ser_a / ser_b.replace(0, np.nan)
            out[new_col] = res.round(4)
        elif p.get("formula") and "/" in p.get("formula"):
            parts = p.get("formula").split("/")
            col_a, col_b = parts[0].strip(), parts[1].strip()
            if col_a in out.columns and col_b in out.columns:
                ser_a = pd.to_numeric(out[col_a], errors="coerce")
                ser_b = pd.to_numeric(out[col_b], errors="coerce")
                out[new_col] = (ser_a / ser_b.replace(0, np.nan)).round(4)
    return out

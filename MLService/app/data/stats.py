from __future__ import annotations

import pandas as pd


def _outlier_count(series: pd.Series) -> int:
    s = pd.to_numeric(series, errors="coerce").dropna()
    if len(s) < 4:
        return 0
    q1, q3 = s.quantile(0.25), s.quantile(0.75)
    iqr = q3 - q1
    lower, upper = q1 - 1.5 * iqr, q3 + 1.5 * iqr
    return int(((s < lower) | (s > upper)).sum())


def dataset_stats(df: pd.DataFrame) -> dict:
    total = len(df)
    stats: dict = {}
    for col in df.columns:
        col_stats: dict = {
            "missing_count": int(df[col].isna().sum()),
            "missing_percentage": round((df[col].isna().sum() / total * 100) if total else 0, 2),
            "unique_count": int(df[col].nunique(dropna=True)),
        }
        numeric = pd.to_numeric(df[col], errors="coerce")
        if numeric.notna().sum() > 0:
            valid = numeric.dropna()
            col_stats["outliers"] = _outlier_count(df[col])
            col_stats["min"] = float(valid.min())
            col_stats["max"] = float(valid.max())
            col_stats["mean"] = round(float(valid.mean()), 4)
            col_stats["std"] = round(float(valid.std()), 4) if len(valid) > 1 else 0.0
        stats[str(col)] = col_stats
    return stats


def column_types(df: pd.DataFrame) -> tuple[list[str], list[str]]:
    numeric_cols: list[str] = []
    categorical_cols: list[str] = []
    for col in df.columns:
        if pd.api.types.is_numeric_dtype(df[col]):
            numeric_cols.append(str(col))
        else:
            categorical_cols.append(str(col))
    return numeric_cols, categorical_cols

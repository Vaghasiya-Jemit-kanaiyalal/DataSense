from __future__ import annotations

import pandas as pd


def apply(df: pd.DataFrame, params: list) -> pd.DataFrame:
    _ = params
    return df.drop_duplicates().reset_index(drop=True)

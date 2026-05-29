from __future__ import annotations

import pandas as pd

from app.preprocessings import drop_column, drop_duplicates, missing_values, outliers, replace_values

_HANDLERS = {
    "drop_duplicates": drop_duplicates.apply,
    "missing_values": missing_values.apply,
    "outliers": outliers.apply,
    "replace_values": replace_values.apply,
    "drop_column": drop_column.apply,
}


class PreprocessingPipeline:
    @staticmethod
    def run(df: pd.DataFrame, steps: list) -> pd.DataFrame:
        out = df.copy()
        ordered = sorted(steps, key=lambda s: s.get("step_index", 0))
        for step in ordered:
            step_type = step.get("type")
            handler = _HANDLERS.get(step_type)
            if not handler:
                raise ValueError(f"Unknown step type: {step_type}")
            params = step.get("params") or []
            out = handler(out, params)
        return out

from __future__ import annotations

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from pydantic import BaseModel

from app.data import loader, preview, stats, store
from app.preprocessings.Preprocessing_pipeline import PreprocessingPipeline

router = APIRouter(prefix="/data", tags=["data"])


class PreprocessRequest(BaseModel):
    user_id: int
    dataset_id: int
    preview_rows: int = 20
    offset: int = 0
    steps: list = []


def _build_response(user_id: int, dataset_id: int, df, preview_rows: int, offset: int = 0) -> dict:
    numeric_cols, categorical_cols = stats.column_types(df)
    total = len(df)
    page_data = preview.dataframe_preview(df, preview_rows, offset)
    return {
        "dataset_id": dataset_id,
        "rows": total,
        "columns": len(df.columns),
        "numerical_columns": numeric_cols,
        "categorical_columns": categorical_cols,
        "data": page_data,
        "statistics": stats.dataset_stats(df),
        "page": (offset // preview_rows) + 1 if preview_rows else 1,
        "page_size": preview_rows,
        "offset": offset,
        "has_more": offset + len(page_data) < total,
    }


@router.post("/upload")
async def upload_dataset(
    file: UploadFile = File(...),
    user_id: int = Form(...),
    dataset_id: int = Form(...),
    preview_rows: int = Form(20),
):
    try:
        content = await file.read()
        df = loader.load_file(file.filename or "data.csv", content)
        store.put(user_id, dataset_id, df)
        return _build_response(user_id, dataset_id, df, preview_rows, 0)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/preprocess")
async def preprocess_dataset(body: PreprocessRequest):
    try:
        df = store.get(body.user_id, body.dataset_id)
        if body.steps:
            df = PreprocessingPipeline.run(df, body.steps)
        return _build_response(
            body.user_id,
            body.dataset_id,
            df,
            body.preview_rows,
            max(0, body.offset),
        )
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

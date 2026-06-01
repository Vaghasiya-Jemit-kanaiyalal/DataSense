import { api } from './api';

export interface PipelineStepInfo {
  step_index: number;
  type: string;
  label: string;
  detail: string;
}

export interface DatasetPayload {
  dataset_id: number;
  rows: number;
  columns: number;
  numerical_columns: string[];
  categorical_columns: string[];
  data: Record<string, unknown>[];
  statistics: Record<string, {
    missing_count: number;
    missing_percentage: number;
    unique_count?: number;
    outliers?: number;
    mean?: number;
    min?: number;
    max?: number;
  }>;
  total_steps?: number;
  pipeline_steps?: PipelineStepInfo[];
  page?: number;
  page_size?: number;
  offset?: number;
  has_more?: boolean;
  original_filename?: string;
  ml_ready?: boolean;
  message?: string;
  status?: string;
  finalized?: boolean;
  pipeline_locked?: boolean;
}

export interface CleanRequest {
  dataset_id: number;
  action: string;
  strategy?: string;
  columns?: string[];
  old_value?: string;
  new_value?: string;
  params?: Record<string, unknown>[];
  offset?: number;
  preview_rows?: number;
}

export function getActiveDataset() {
  return api.get<DatasetPayload>('/data/active');
}

export function activateDataset(datasetId: number) {
  return api.post<DatasetPayload>(`/data/${datasetId}/activate`);
}

export function getPreview(datasetId: number, rows = 20, page = 1) {
  return api.get<DatasetPayload>(
    `/data/preview/${datasetId}?rows=${rows}&page=${page}`,
  );
}

export function cleanDataset(body: CleanRequest) {
  return api.post<DatasetPayload>('/data/clean', body);
}

export function undoStep(datasetId: number, page = 1, rows = 20) {
  return api.post<DatasetPayload>(`/data/${datasetId}/undo?page=${page}&rows=${rows}`);
}

export function finalizeDataset(datasetId: number) {
  return api.post<DatasetPayload>(`/data/${datasetId}/finalize`);
}

export function setActiveDatasetId(id: number) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('activeDatasetId', String(id));
  }
}

export function getActiveDatasetId(): number | null {
  if (typeof window === 'undefined') return null;
  const v = localStorage.getItem('activeDatasetId');
  return v ? Number(v) : null;
}

/** Load active dataset from server (resume after logout/login). */
export async function resumeActiveDataset(): Promise<DatasetPayload | null> {
  try {
    const data = await getActiveDataset();
    setActiveDatasetId(data.dataset_id);
    return data;
  } catch {
    return null;
  }
}

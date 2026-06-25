import { ROUTES } from '@/constants/routes';
import { api, authFetch } from './api';

export interface DatasetListItem {
  id: number;
  name: string;
  mime?: string;
  size?: number;
  uploadedAt?: string;
  rows?: number;
  columns?: number;
  isActive?: boolean;
  cleaningSteps?: number;
  status?: string;
}

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

export interface AnalysisPayload {
  dataset_id: number;
  health_score: number;
  confidence_score: number;
  key_findings: string[];
  rows: number;
  columns: number;
  numerical_columns: number;
  categorical_columns: number;
  strongest_correlation: {
    feature_a: string;
    feature_b: string;
    value: number;
  };
  data_quality: {
    completeness: number;
    consistency: number;
    validity: number;
  };
  feature_importance: {
    name: string;
    importance: number;
    color: string;
  }[];
  anomalies: {
    row_index: number;
    column: string;
    actual: string;
    expected: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    deviation: number;
  }[];
  risk_assessment: {
    overall_score: number;
    categories: {
      name: string;
      score: number;
      icon: string;
    }[];
  };
  processing_summary: {
    missing_values_count: number;
    outliers_count: number;
    duplicates_count: number;
    columns_processed: number;
  };
  recommendations: {
    icon: string;
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
  }[];
  narrative: string;
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

export function getAnalysis(datasetId: number) {
  return api.get<AnalysisPayload>(`/data/${datasetId}/analyze`);
}

export async function deleteDataset(datasetId: number) {
  await api.delete<{ message: string; dataset_id: number }>(`/data/${datasetId}`);
  if (getActiveDatasetId() === datasetId) {
    clearActiveDatasetId();
  }
}

export function setActiveDatasetId(id: number, filename?: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('activeDatasetId', String(id));
    if (filename) {
      localStorage.setItem(`dataset_name_${id}`, filename);
    }
  }
}

export function clearActiveDatasetId() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('activeDatasetId');
  }
}

export function getActiveDatasetId(): number | null {
  if (typeof window === 'undefined') return null;
  const v = localStorage.getItem('activeDatasetId');
  return v ? Number(v) : null;
}

export function getDatasetName(id: number | null): string {
  if (!id) return '';
  if (typeof window !== 'undefined') {
    return localStorage.getItem(`dataset_name_${id}`) || `Dataset #${id}`;
  }
  return `Dataset #${id}`;
}

export function isResumablePayload(payload: DatasetPayload): boolean {
  return !payload.finalized && !payload.pipeline_locked && payload.status !== 'finalized';
}

export function listResumableDatasets() {
  return api.get<{ datasets: DatasetListItem[] }>('/data/mine');
}

export function listFinalizedDatasets() {
  return api.get<{ datasets: DatasetListItem[] }>('/data/mine?scope=finalized');
}

export async function reopenFinalizedDataset(datasetId: number, file: File): Promise<DatasetPayload> {
  const fd = new FormData();
  fd.append('file', file);
  const res = await authFetch(`/data/${datasetId}/reopen`, { method: 'POST', body: fd });
  if (!res.ok) {
    let message = 'Failed to restore dataset';
    try {
      const body = await res.json();
      message = body.message || body.error || message;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }
  const data = (await res.json()) as DatasetPayload;
  setActiveDatasetId(datasetId, data.original_filename);
  return data;
}

export async function resumeActiveDataset(): Promise<DatasetPayload | null> {
  try {
    const data = await getActiveDataset();
    if (!isResumablePayload(data)) {
      clearActiveDatasetId();
      return null;
    }
    setActiveDatasetId(data.dataset_id, data.original_filename);
    return data;
  } catch {
    clearActiveDatasetId();
    return null;
  }
}

/** Pick the dashboard route that matches saved pipeline progress. */
export function getResumeDestination(payload: DatasetPayload): string {
  const id = payload.dataset_id;
  if (payload.finalized || payload.pipeline_locked || payload.status === 'finalized') {
    return `${ROUTES.VISUALIZATION}?datasetId=${id}`;
  }
  const steps = payload.total_steps ?? payload.pipeline_steps?.length ?? 0;
  if (steps > 0) {
    return `${ROUTES.CLEANING}?datasetId=${id}`;
  }
  if (payload.status === 'cleaning') {
    return `${ROUTES.CLEANING}?datasetId=${id}`;
  }
  return `${ROUTES.PREVIEW}?datasetId=${id}`;
}

/** Used after sign-in to land where the user left off. */
export async function resolvePostAuthRoute(): Promise<string> {
  const resumed = await resumeActiveDataset();
  if (resumed?.dataset_id) {
    return getResumeDestination(resumed);
  }
  return ROUTES.UPLOAD;
}

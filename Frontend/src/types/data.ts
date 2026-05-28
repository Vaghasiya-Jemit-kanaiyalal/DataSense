/** Column type classification */
export type ColumnType = 'numeric' | 'categorical';

/** Dataset column metadata */
export interface DatasetColumn {
  name: string;
  type: ColumnType;
  missing?: number;
  alert?: boolean;
}

/** Dataset summary statistics */
export interface DatasetStats {
  totalRows: number;
  totalColumns: number;
  missingValues: number;
  outliers: number;
  numericColumns: number;
  categoricalColumns: number;
}

/** Statistical summary for a column */
export interface ColumnSummary {
  column: string;
  min: string;
  max: string;
  mean: string;
  median: string;
  std: string;
}

/** Uploaded dataset metadata */
export interface Dataset {
  id: number;
  name: string;
  type: string;
  size: string;
  uploadedAt: string;
  rows: string;
  columns: string;
  badgeColor?: string;
}

/** Cleaning action configuration */
export interface CleaningAction {
  icon: string;
  label: string;
}

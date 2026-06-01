import type { DatasetPayload } from '@/services/data';

export type IssueType = 'missing' | 'outliers';

export interface ColumnIssue {
  type: IssueType;
  count: number;
  label: string;
}

export interface ColumnStatus {
  clean: boolean;
  issues: ColumnIssue[];
}

export function getColumnStatus(
  name: string,
  statistics: DatasetPayload['statistics'],
  isNumeric: boolean,
): ColumnStatus {
  const col = statistics[name];
  const missing = col?.missing_count ?? 0;
  const outliers = isNumeric ? (col?.outliers ?? 0) : 0;
  const issues: ColumnIssue[] = [];

  if (missing > 0) {
    issues.push({ type: 'missing', count: missing, label: 'Missing' });
  }
  if (outliers > 0) {
    issues.push({ type: 'outliers', count: outliers, label: 'Outliers' });
  }

  return {
    clean: issues.length === 0,
    issues,
  };
}

export function totalCellCount(rows: number, columns: number) {
  return rows * columns;
}

export type ColMode = 'categorical' | 'numerical';
export type ChartType = 'bar' | 'line' | 'scatter' | 'histogram' | 'pie' | 'heatmap';

export interface RechartsPoint {
  label: string;
  frequency: number;
  share: number;
  value?: number;
  x?: number;
  y?: number;
  residual?: number;
}

export interface ChartSeries {
  labels: string[];
  values: number[];
  points?: { x: number; y: number }[];
  matrix?: number[][];
  rowLabels?: string[];
  colLabels?: string[];
  rechartsData?: RechartsPoint[];
  seriesKeys?: { frequency: string; share: string };
  rowCount?: number;
}

function toNum(value: unknown): number | null {
  if (value == null || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export function detectColumnMode(col: string, numericalColumns: string[]): ColMode {
  return numericalColumns.includes(col) ? 'numerical' : 'categorical';
}

function withShare(labels: string[], frequencies: number[]): RechartsPoint[] {
  const total = frequencies.reduce((a, b) => a + b, 0) || 1;
  return labels.map((label, i) => ({
    label,
    frequency: frequencies[i],
    share: Number(((frequencies[i] / total) * 100).toFixed(2)),
  }));
}

function groupCount(rows: Record<string, unknown>[], col: string, limit = 16) {
  const counts = new Map<string, number>();
  for (const row of rows) {
    const key = String(row[col] ?? '—');
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit);
  return {
    labels: sorted.map(([k]) => k),
    values: sorted.map(([, v]) => v),
  };
}

function groupAggregate(
  rows: Record<string, unknown>[],
  xCol: string,
  yCol: string,
  limit = 16,
) {
  const sums = new Map<string, { sum: number; n: number }>();
  for (const row of rows) {
    const y = toNum(row[yCol]);
    if (y == null) continue;
    const key = String(row[xCol] ?? '—');
    const cur = sums.get(key) ?? { sum: 0, n: 0 };
    cur.sum += y;
    cur.n += 1;
    sums.set(key, cur);
  }
  const sorted = [...sums.entries()]
    .map(([k, v]) => [k, v.sum / v.n] as const)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);
  return {
    labels: sorted.map(([k]) => k),
    values: sorted.map(([, v]) => v),
  };
}

function histogramBins(rows: Record<string, unknown>[], col: string, bins = 12) {
  const nums = rows.map((r) => toNum(r[col])).filter((n): n is number => n != null);
  if (nums.length === 0) return { labels: [] as string[], values: [] as number[] };
  const min = Math.min(...nums);
  const max = Math.max(...nums);
  const span = max - min || 1;
  const counts = Array(bins).fill(0);
  for (const n of nums) {
    let idx = Math.floor(((n - min) / span) * bins);
    if (idx >= bins) idx = bins - 1;
    counts[idx] += 1;
  }
  const labels = counts.map((_, i) => {
    const lo = min + (span * i) / bins;
    const hi = min + (span * (i + 1)) / bins;
    return `${lo.toFixed(2)} - ${hi.toFixed(2)}`;
  });
  return { labels, values: counts };
}

function heatmapMatrix(
  rows: Record<string, unknown>[],
  xCol: string,
  yCol: string,
  limit = 10,
) {
  const xCounts = new Map<string, number>();
  const yCounts = new Map<string, number>();
  for (const row of rows) {
    const x = String(row[xCol] ?? '—');
    const y = String(row[yCol] ?? '—');
    xCounts.set(x, (xCounts.get(x) ?? 0) + 1);
    yCounts.set(y, (yCounts.get(y) ?? 0) + 1);
  }
  const rowLabels = [...xCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit).map(([k]) => k);
  const colLabels = [...yCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit).map(([k]) => k);
  const matrix = rowLabels.map(() => colLabels.map(() => 0));
  for (const row of rows) {
    const xi = rowLabels.indexOf(String(row[xCol] ?? '—'));
    const yi = colLabels.indexOf(String(row[yCol] ?? '—'));
    if (xi >= 0 && yi >= 0) matrix[xi][yi] += 1;
  }
  return { rowLabels, colLabels, matrix, labels: [], values: [] };
}

function numericHeatmap(rows: Record<string, unknown>[], cols: string[]) {
  const nums = cols.map((col) =>
    rows.map((r) => toNum(r[col])).filter((n): n is number => n != null),
  );
  const matrix = cols.map((_, i) =>
    cols.map((__, j) => {
      if (i === j) return 1;
      const a = nums[i];
      const b = nums[j];
      const n = Math.min(a.length, b.length);
      if (n < 2) return 0;
      const meanA = a.slice(0, n).reduce((s, v) => s + v, 0) / n;
      const meanB = b.slice(0, n).reduce((s, v) => s + v, 0) / n;
      let num = 0;
      let denA = 0;
      let denB = 0;
      for (let k = 0; k < n; k += 1) {
        const da = a[k] - meanA;
        const db = b[k] - meanB;
        num += da * db;
        denA += da * da;
        denB += db * db;
      }
      const den = Math.sqrt(denA * denB);
      return den === 0 ? 0 : num / den;
    }),
  );
  return { rowLabels: cols, colLabels: cols, matrix, labels: [], values: [] };
}

export function buildChartSeries(
  rows: Record<string, unknown>[],
  chartType: ChartType,
  xCol: string | null,
  yCol: string | null,
  xMode: ColMode,
  yMode: ColMode,
  numericColumns: string[],
): ChartSeries | null {
  if (!rows.length) return null;
  const rowCount = rows.length;

  const freqLabel = (col: string) => `${col} frequency`;
  const attachRecharts = (
    labels: string[],
    values: number[],
    xName: string,
    useShareFromFreq = true,
  ): ChartSeries => {
    const rechartsData = useShareFromFreq
      ? withShare(labels, values)
      : labels.map((label, i) => ({
          label,
          frequency: values[i],
          share: values[i],
        }));
    return {
      labels,
      values,
      rechartsData,
      rowCount,
      seriesKeys: { frequency: freqLabel(xName), share: 'Share (%)' },
    };
  };

  if (chartType === 'histogram') {
    const col = yMode === 'numerical' && yCol ? yCol : xCol;
    if (!col) return null;
    const binned = histogramBins(rows, col);
    return attachRecharts(binned.labels, binned.values, col);
  }

  if (chartType === 'pie') {
    const col = xCol || yCol;
    if (!col) return null;
    const counted = groupCount(rows, col);
    return attachRecharts(counted.labels, counted.values, col);
  }

  if (chartType === 'heatmap') {
    if (xCol && yCol && xMode === 'categorical' && yMode === 'categorical') {
      return { ...heatmapMatrix(rows, xCol, yCol), rowCount };
    }
    const cols = numericColumns.slice(0, 8);
    if (cols.length < 2) return null;
    return { ...numericHeatmap(rows, cols), rowCount };
  }

  if (!xCol) return null;

  if (chartType === 'scatter') {
    if (!yCol) return null;
    if (!numericColumns.includes(xCol) || !numericColumns.includes(yCol)) {
      return null;
    }
    const points = samplePoints(
      rows
        .map((row) => {
          const x = toNum(row[xCol]);
          const y = toNum(row[yCol]);
          if (x == null || y == null) return null;
          return { x, y };
        })
        .filter((p): p is { x: number; y: number } => p != null),
      600,
    );
    const rechartsData = points.map((p) => ({
      label: '',
      frequency: p.y,
      share: p.x,
      x: p.x,
      y: p.y,
    }));
    return {
      labels: [],
      values: [],
      points,
      rechartsData,
      rowCount,
      seriesKeys: { frequency: yCol, share: xCol },
    };
  }

  if (chartType === 'line') {
    if (yCol && yMode === 'numerical' && xMode === 'numerical') {
      const pairs = samplePoints(
        rows
          .map((row) => {
            const y = toNum(row[yCol]);
            const x = toNum(row[xCol]);
            if (y == null || x == null) return null;
            return { x, y };
          })
          .filter((p): p is { x: number; y: number } => p != null)
          .sort((a, b) => a.x - b.x),
        48,
      );
      const rechartsData = pairs.map((p) => ({
        label: Number(p.x.toFixed(2)).toString(),
        frequency: p.y,
        share: p.x,
        x: p.x,
        y: p.y,
      }));
      return {
        labels: [],
        values: [],
        points: pairs,
        rechartsData,
        rowCount,
        seriesKeys: { frequency: yCol, share: xCol },
      };
    }
    if (yCol && yMode === 'numerical') {
      const agg = groupAggregate(rows, xCol, yCol, 20);
      return {
        ...attachRecharts(agg.labels, agg.values, xCol, false),
        seriesKeys: { frequency: yCol, share: 'Index' },
      };
    }
    const counted = groupCount(rows, xCol, 20);
    return attachRecharts(counted.labels, counted.values, xCol);
  }

  if (chartType === 'bar') {
    if (xMode === 'numerical' && xCol) {
      const binned = histogramBins(rows, xCol);
      return attachRecharts(binned.labels, binned.values, xCol);
    }
    if (yCol && yMode === 'numerical') {
      const agg = groupAggregate(rows, xCol, yCol);
      return {
        ...attachRecharts(agg.labels, agg.values, xCol, false),
        seriesKeys: { frequency: `${yCol} (avg)`, share: 'Share (%)' },
      };
    }
    const counted = groupCount(rows, xCol);
    return attachRecharts(counted.labels, counted.values, xCol);
  }

  return null;
}

export function canGenerateChart(
  chartType: ChartType,
  xCol: string | null,
  yCol: string | null,
): boolean {
  if (chartType === 'histogram' || chartType === 'pie') {
    return Boolean(xCol || yCol);
  }
  if (chartType === 'heatmap') {
    return true;
  }
  if (chartType === 'scatter') {
    return Boolean(xCol && yCol);
  }
  if (chartType === 'line') {
    return Boolean(xCol && yCol);
  }
  return Boolean(xCol);
}

export function scatterRequiresNumeric(
  xCol: string | null,
  yCol: string | null,
  numericalColumns: string[],
): boolean {
  if (!xCol || !yCol) return false;
  return numericalColumns.includes(xCol) && numericalColumns.includes(yCol);
}

function samplePoints<T>(items: T[], max = 48): T[] {
  if (items.length <= max) return items;
  const step = Math.ceil(items.length / max);
  return items.filter((_, i) => i % step === 0);
}

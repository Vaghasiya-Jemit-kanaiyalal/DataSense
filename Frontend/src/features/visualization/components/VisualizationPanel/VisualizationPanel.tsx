'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthHydrated } from '@/hooks';
import visualizationImg from '@/assets/visulization.png';
import {
  getPreview,
  resumeActiveDataset,
  setActiveDatasetId,
  getDatasetName,
  type DatasetPayload,
} from '@/services/data';
import ChartCanvas from '../ChartCanvas/ChartCanvas';
import { ChartTypeIcon } from '../ChartTypeIcon';
import {
  buildChartSeries,
  canGenerateChart,
  detectColumnMode,
  scatterRequiresNumeric,
  type ChartType,
  type ChartSeries,
} from '../../utils/chartUtils';
import styles from './VisualizationPanel.module.css';

const VIZ_ROWS = 500;

const CHART_TYPES: {
  id: ChartType;
  title: string;
  description: string;
  accent: string;
}[] = [
  { id: 'bar', title: 'Bar Chart', description: 'Compare values across categories.', accent: 'purple' },
  { id: 'line', title: 'Line Graph', description: 'Show trends over time.', accent: 'cyan' },
  { id: 'scatter', title: 'Scatter Plot', description: 'Find relationships between variables.', accent: 'violet' },
  { id: 'histogram', title: 'Histogram', description: 'Show distribution of numerical data.', accent: 'amber' },
  { id: 'pie', title: 'Pie Chart', description: 'Show part-to-whole relationships.', accent: 'multi' },
  { id: 'heatmap', title: 'Heat Map', description: 'Visualize data intensity using color gradients.', accent: 'blue' },
];

export default function VisualizationPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hydrated = useAuthHydrated();
  const queryId = searchParams.get('datasetId');

  const [payload, setPayload] = useState<DatasetPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resolvedId, setResolvedId] = useState<number | null>(null);

  const [chartType, setChartType] = useState<ChartType>('bar');
  const [colX, setColX] = useState<string>('');
  const [colY, setColY] = useState<string>('');
  const [chartSeries, setChartSeries] = useState<ChartSeries | null>(null);
  const [generated, setGenerated] = useState(false);
  const outputRef = useRef<HTMLElement>(null);

  const scrollToOutput = () => {
    outputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const datasetId = useMemo(() => {
    if (queryId) return Number(queryId);
    return resolvedId;
  }, [queryId, resolvedId]);

  const allColumns = useMemo(() => {
    if (!payload) return [] as string[];
    return [...payload.categorical_columns, ...payload.numerical_columns];
  }, [payload]);

  const modeX = useMemo(() => {
    if (!payload || !colX) return null;
    return detectColumnMode(colX, payload.numerical_columns);
  }, [payload, colX]);

  const modeY = useMemo(() => {
    if (!payload || !colY) return null;
    return detectColumnMode(colY, payload.numerical_columns);
  }, [payload, colY]);

  const load = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPreview(id, VIZ_ROWS, 1);
      setPayload(data);
      setActiveDatasetId(data.dataset_id, data.original_filename);
      setResolvedId(data.dataset_id);
      const cols = [...data.categorical_columns, ...data.numerical_columns];
      if (cols[0]) setColX(cols[0]);
      if (cols[1]) setColY(cols[1]);
      else if (cols[0]) setColY(cols[0]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load dataset');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    async function init() {
      if (queryId) {
        await load(Number(queryId));
        return;
      }
      const resumed = await resumeActiveDataset();
      if (resumed?.dataset_id) {
        setResolvedId(resumed.dataset_id);
        router.replace(`/visualization?datasetId=${resumed.dataset_id}`);
      }
    }
    init();
  }, [queryId, load, router, hydrated]);

  const generateChart = () => {
    if (!payload?.data?.length) return;
    const x = colX || null;
    const y = colY || null;
    if (!canGenerateChart(chartType, x, y)) {
      setError('Select the required columns for this chart type.');
      return;
    }
    if (chartType === 'scatter' && !scatterRequiresNumeric(x, y, payload.numerical_columns)) {
      setError('Scatter plot requires two numerical columns for X and Y.');
      return;
    }
    const mx = x ? detectColumnMode(x, payload.numerical_columns) : 'categorical';
    const my = y ? detectColumnMode(y, payload.numerical_columns) : mx;
    setError(null);
    const series = buildChartSeries(
      payload.data,
      chartType,
      x,
      y,
      mx,
      my,
      payload.numerical_columns,
    );
    if (!series || (series.labels.length === 0 && !series.points?.length && !series.matrix?.length && !series.rechartsData?.length)) {
      setError('Could not build a chart from the current column selection.');
      setChartSeries(null);
      setGenerated(false);
      return;
    }
    setChartSeries(series);
    setGenerated(true);
  };

  if (!datasetId && !loading) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <p className={styles.muted}>Upload and clean a dataset first, then visualize it here.</p>
          <button type="button" className={styles.btnPrimary} onClick={() => router.push('/upload')}>
            Go to Upload
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <section className={styles.hero}>
          <div className={styles.heroLeft}>
            <span className={styles.kicker}>Interactive Explorer</span>
            <h1 className={styles.heroTitle}>Data Visualization</h1>
            <p className={styles.heroDesc}>
              Analyze, plot, and discover insights from your columns. Build customized charts to understand distributions, trends, and relationships.
              {payload?.original_filename ? ` · ${payload.original_filename}` : (datasetId ? ` · ${getDatasetName(datasetId)}` : '')}
            </p>
            <div className={styles.heroActions}>
              <button
                type="button"
                className={styles.btnPrimary}
                disabled={loading || !payload}
                onClick={() => {
                  generateChart();
                  setTimeout(scrollToOutput, 100);
                }}
              >
                <svg viewBox="0 0 16 16" aria-hidden="true" style={{ width: 14, height: 14, fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, marginRight: 4 }}>
                  <path d="M2 12V4l6 4 6-4v8H2z" />
                </svg>
                Generate Chart
              </button>
              <button type="button" className={styles.btnSecondary} onClick={scrollToOutput}>
                View Chart Output
              </button>
            </div>
          </div>
          <Image
            src={visualizationImg}
            alt="Visualization illustration"
            className={styles.heroArt}
            priority
          />
        </section>

        <div className={styles.layout}>
          <aside className={styles.sidebar}>
            <ColumnPicker
              title="Column - X"
              selectLabel="Select Column X"
              columns={allColumns}
              value={colX}
              detectedType={modeX}
              onColumn={(name) => { setColX(name); setGenerated(false); setError(null); }}
            />
            <ColumnPicker
              title="Column - Y"
              selectLabel="Select Column Y"
              columns={allColumns}
              value={colY}
              detectedType={modeY}
              onColumn={(name) => { setColY(name); setGenerated(false); setError(null); }}
            />
          </aside>

          <div className={styles.main}>
            <section className={styles.chartPicker}>
              <header>
                <h1>Choose Chart Type</h1>
                <p>Select one of the 6 chart types below.</p>
              </header>
              <div className={styles.chartGrid}>
                {CHART_TYPES.map((chart) => (
                  <button
                    key={chart.id}
                    type="button"
                    className={`${styles.chartCard} ${chartType === chart.id ? styles.chartCardActive : ''} ${styles[chart.accent]}`}
                    onClick={() => { setChartType(chart.id); setGenerated(false); setError(null); }}
                  >
                    {chartType === chart.id && (
                      <span className={styles.checkmark} aria-hidden="true">✓</span>
                    )}
                    <strong>{chart.title}</strong>
                    <small>{chart.description}</small>
                    <ChartTypeIcon type={chart.id} />
                  </button>
                ))}
              </div>
            </section>

          </div>
        </div>

        <section className={styles.output} ref={outputRef}>
          <div className={styles.outputHeader}>
            <h2>Chart Output</h2>
            <button
              type="button"
              className={styles.generateBtn}
              disabled={loading || !payload}
              onClick={generateChart}
            >
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <path d="M2 12V4l6 4 6-4v8H2z" stroke="currentColor" strokeWidth="1.2" fill="none" />
              </svg>
              Generate Chart
            </button>
          </div>
          <div className={styles.outputBody}>
            {loading && <p className={styles.muted}>Loading dataset…</p>}
            {!loading && error && (
              <div className={styles.errorState}>
                <div className={styles.errorIcon} aria-hidden="true" />
                <strong>Cannot Generate Chart</strong>
                <p className={styles.errorText}>{error}</p>
              </div>
            )}
            {!loading && !error && generated && chartSeries && (
              <ChartCanvas
                chartType={chartType}
                series={chartSeries}
                xLabel={colX}
                yLabel={colY}
              />
            )}
            {!loading && !error && !generated && (
              <div className={styles.placeholder}>
                <div className={styles.placeholderIcon} aria-hidden="true" />
                <strong>Your visualization will appear here</strong>
                <p>Configure the columns above and select a chart type to generate your visualization.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function ColumnPicker({
  title,
  selectLabel,
  columns,
  value,
  detectedType,
  onColumn,
}: {
  title: string;
  selectLabel: string;
  columns: string[];
  value: string;
  detectedType: 'categorical' | 'numerical' | null;
  onColumn: (v: string) => void;
}) {
  return (
    <div className={styles.columnBlock}>
      <h3>{title}</h3>
      <label className={styles.selectWrap}>
        <span className="sr-only">{selectLabel}</span>
        <select value={value} onChange={(e) => onColumn(e.target.value)}>
          <option value="">{selectLabel}</option>
          {columns.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </label>
      <div className={styles.typeRow} aria-live="polite">
        <span
          className={`${styles.typeBadge} ${detectedType === 'categorical' ? styles.typeActive : styles.typeInactive}`}
        >
          <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 4h10v2H3zm0 4h7v2H3zm0 4h10v2H3z" fill="currentColor" /></svg>
          Categorical
        </span>
        <span
          className={`${styles.typeBadge} ${detectedType === 'numerical' ? styles.typeActive : styles.typeInactive}`}
        >
          <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 12V6h2v6H4zm3-3v3h2V9H7zm3-5v8h2V4h-2z" fill="currentColor" /></svg>
          Numerical
        </span>
      </div>
      {value && detectedType && (
        <p className={styles.typeHint}>
          Detected: <strong>{detectedType === 'numerical' ? 'Numerical' : 'Categorical'}</strong>
        </p>
      )}
    </div>
  );
}

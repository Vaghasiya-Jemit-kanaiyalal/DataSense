'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from 'recharts';
import type { ChartSeries, ChartType } from '../../utils/chartUtils';
import styles from './ChartCanvas.module.css';

const PURPLE = '#a78bfa';
const GREEN = '#34d399';
const GRID = 'rgba(148, 163, 184, 0.12)';
const AXIS = '#94a3b8';

interface ChartCanvasProps {
  chartType: ChartType;
  series: ChartSeries;
  xLabel?: string;
  yLabel?: string;
}

function ChartShell({
  children,
  rowMeta,
  chartHeight,
  expanded,
  onExpand,
  onClose,
}: {
  children: React.ReactNode;
  rowMeta: string | null;
  chartHeight: number;
  expanded: boolean;
  onExpand: () => void;
  onClose: () => void;
}) {
  const chartBlock = (
    <div className={styles.chartFrame} style={{ minHeight: chartHeight }}>
      {children}
    </div>
  );

  return (
    <>
      <div className={styles.wrap}>
        <div className={styles.toolbar}>
          <div className={styles.meta}>
            {rowMeta && <span className={styles.metaPill}>{rowMeta}</span>}
            <span className={styles.metaPill}>Recharts</span>
          </div>
          <button type="button" className={styles.expandBtn} onClick={onExpand} aria-label="Expand chart">
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M3 3h4v2H5v2H3V3zm6 0h4v4h-2V5H9V3zm-6 10v-4h2v2h2v2H3zm10-2h-2v2H9v2h4v-4z" fill="currentColor" />
            </svg>
            Expand
          </button>
        </div>
        {chartBlock}
      </div>

      {expanded && (
        <div className={styles.modalBackdrop} role="dialog" aria-modal="true" aria-label="Expanded chart">
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <div className={styles.meta}>
                {rowMeta && <span className={styles.metaPill}>{rowMeta}</span>}
              </div>
              <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close expanded chart">
                ✕
              </button>
            </div>
            <div className={styles.modalChart} style={{ minHeight: Math.min(720, chartHeight * 1.6) }}>
              {children}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function ChartCanvas({ chartType, series, xLabel, yLabel }: ChartCanvasProps) {
  const [expanded, setExpanded] = useState(false);
  const close = useCallback(() => setExpanded(false), []);

  useEffect(() => {
    if (!expanded) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [expanded, close]);

  const rowMeta = series.rowCount
    ? `${series.rowCount} numeric row${series.rowCount === 1 ? '' : 's'}`
    : null;
  const freqKey = series.seriesKeys?.frequency ?? 'frequency';
  const shareKey = series.seriesKeys?.share ?? 'Share (%)';
  const baseHeight = expanded ? 560 : 400;
  const shell = (content: React.ReactNode, height = baseHeight) => (
    <ChartShell
      rowMeta={rowMeta}
      chartHeight={height}
      expanded={expanded}
      onExpand={() => setExpanded(true)}
      onClose={close}
    >
      {content}
    </ChartShell>
  );

  if (chartType === 'scatter') {
    const pts = (series.rechartsData ?? []).filter(
      (d) => typeof d.x === 'number' && typeof d.y === 'number',
    ) as { x: number; y: number }[];
    if (!pts.length) {
      return (
        <p className={styles.empty}>
          Scatter plot needs two numerical columns (e.g. age and income). Select numeric fields for X and Y.
        </p>
      );
    }
    const xs = pts.map((d) => d.x);
    const ys = pts.map((d) => d.y);
    const xPad = (Math.max(...xs) - Math.min(...xs)) * 0.05 || 1;
    const yPad = (Math.max(...ys) - Math.min(...ys)) * 0.05 || 1;
    const scatterName = xLabel && yLabel ? `${xLabel} vs ${yLabel}` : 'Scatter';

    return shell(
      <ResponsiveContainer width="100%" height={expanded ? 560 : 380}>
        <ScatterChart margin={{ top: 16, right: 24, bottom: 16, left: 8 }}>
          <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
          <XAxis
            type="number"
            dataKey="x"
            name={xLabel}
            stroke={AXIS}
            tick={{ fill: AXIS, fontSize: 11 }}
            domain={[Math.min(...xs) - xPad, Math.max(...xs) + xPad]}
          />
          <YAxis
            type="number"
            dataKey="y"
            name={yLabel}
            stroke={AXIS}
            tick={{ fill: AXIS, fontSize: 11 }}
            domain={[Math.min(...ys) - yPad, Math.max(...ys) + yPad]}
          />
          <ZAxis range={[48, 48]} />
          <Tooltip
            cursor={{ strokeDasharray: '3 3' }}
            contentStyle={{ background: '#0f172a', border: '1px solid rgba(148,163,184,0.2)', borderRadius: 6 }}
            formatter={(value, name) => [value, name === 'x' ? (xLabel ?? 'X') : (yLabel ?? 'Y')]}
          />
          <Legend />
          <Scatter name={scatterName} data={pts} fill={PURPLE} fillOpacity={0.85} />
        </ScatterChart>
      </ResponsiveContainer>,
      expanded ? 560 : 380,
    );
  }

  if (chartType === 'pie' && series.rechartsData?.length) {
    const colors = ['#7c3aed', '#2563eb', '#06b6d4', '#f59e0b', '#10b981', '#ec4899'];
    return shell(
      <ResponsiveContainer width="100%" height={expanded ? 520 : 360}>
        <PieChart>
          <Pie data={series.rechartsData} dataKey="frequency" nameKey="label" cx="50%" cy="50%" outerRadius={expanded ? 160 : 120}>
            {series.rechartsData.map((_, i) => (
              <Cell key={i} fill={colors[i % colors.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(148,163,184,0.2)', borderRadius: 6 }} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>,
    );
  }

  if (chartType === 'line' && series.rechartsData?.length) {
    const useXY = series.rechartsData[0]?.x != null && series.rechartsData[0]?.y != null;
    const h = expanded ? 520 : 380;

    if (useXY) {
      return shell(
        <ResponsiveContainer width="100%" height={h}>
          <LineChart data={series.rechartsData} margin={{ top: 16, right: 24, bottom: 24, left: 12 }}>
            <CartesianGrid stroke={GRID} strokeDasharray="3 3" vertical={false} />
            <XAxis type="number" dataKey="x" stroke={AXIS} tick={{ fill: AXIS, fontSize: 11 }} />
            <YAxis stroke={AXIS} tick={{ fill: AXIS, fontSize: 11 }} />
            <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(148,163,184,0.2)', borderRadius: 6 }} />
            <Legend />
            <Line
              type="monotone"
              dataKey="y"
              name={freqKey}
              stroke={PURPLE}
              strokeWidth={2.5}
              dot={{ r: 4, fill: PURPLE, strokeWidth: 0 }}
              activeDot={{ r: 6 }}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>,
        h,
      );
    }

    return shell(
      <ResponsiveContainer width="100%" height={h}>
        <LineChart data={series.rechartsData} margin={{ top: 16, right: 24, bottom: 56, left: 12 }}>
          <CartesianGrid stroke={GRID} strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="label"
            stroke={AXIS}
            tick={{ fill: AXIS, fontSize: 10 }}
            angle={-30}
            textAnchor="end"
            height={64}
            interval="preserveStartEnd"
            minTickGap={24}
          />
          <YAxis stroke={AXIS} tick={{ fill: AXIS, fontSize: 11 }} />
          <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(148,163,184,0.2)', borderRadius: 6 }} />
          <Legend />
          <Line
            type="monotone"
            dataKey="frequency"
            name={freqKey}
            stroke={PURPLE}
            strokeWidth={2.5}
            dot={{ r: 3 }}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>,
      h,
    );
  }

  if (chartType === 'heatmap' && series.matrix?.length) {
    const rows = series.matrix.length;
    const cols = series.matrix[0]?.length ?? 0;
    const flat = series.matrix.flat();
    const max = Math.max(...flat, 1);
    const cellW = Math.min(56, (expanded ? 640 : 480) / cols);
    const cellH = Math.min(40, 320 / rows);
    return shell(
      <div className={styles.heatmapWrap}>
        <svg width={cols * cellW + 88} height={rows * cellH + 48}>
          {series.matrix.map((row, ri) =>
            row.map((val, ci) => {
              const t = val / max;
              const r = Math.round(37 + t * 88);
              const g = Math.round(99 + t * 60);
              const b = Math.round(235 - t * 40);
              return (
                <rect
                  key={`${ri}-${ci}`}
                  x={80 + ci * cellW}
                  y={12 + ri * cellH}
                  width={cellW - 3}
                  height={cellH - 3}
                  fill={`rgb(${r},${g},${b})`}
                  rx={4}
                />
              );
            }),
          )}
        </svg>
      </div>,
      expanded ? 400 : 320,
    );
  }

  if (!series.rechartsData?.length) {
    return <p className={styles.empty}>No plottable values for this selection.</p>;
  }

  const tickCount = series.rechartsData.length;
  const xInterval = tickCount > 16 ? Math.floor(tickCount / 12) : 0;

  return shell(
    <ResponsiveContainer width="100%" height={expanded ? 520 : 400}>
      <BarChart
        data={series.rechartsData}
        margin={{ top: 16, right: 24, bottom: 72, left: 8 }}
        barCategoryGap="18%"
        barGap={4}
      >
        <CartesianGrid stroke={GRID} strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="label"
          stroke={AXIS}
          tick={{ fill: AXIS, fontSize: 10 }}
          angle={-35}
          textAnchor="end"
          height={80}
          interval={xInterval}
          minTickGap={20}
        />
        <YAxis stroke={AXIS} tick={{ fill: AXIS, fontSize: 11 }} allowDecimals={false} />
        <Tooltip
          contentStyle={{ background: '#0f172a', border: '1px solid rgba(148,163,184,0.2)', borderRadius: 6 }}
          labelStyle={{ color: '#e2e8f0' }}
        />
        <Legend verticalAlign="bottom" height={36} />
        <Bar dataKey="frequency" name={freqKey} fill={PURPLE} radius={[4, 4, 0, 0]} maxBarSize={42} />
        <Bar dataKey="share" name={shareKey} fill={GREEN} radius={[4, 4, 0, 0]} maxBarSize={42} />
      </BarChart>
    </ResponsiveContainer>,
  );
}

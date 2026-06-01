import type { ChartType } from '../../utils/chartUtils';
import styles from './ChartTypeIcon.module.css';

export default function ChartTypeIcon({ type }: { type: ChartType }) {
  return (
    <div className={styles.preview} aria-hidden="true">
      {type === 'bar' && (
        <svg viewBox="0 0 88 48" className={styles.svg}>
          <defs>
            <linearGradient id="barG1" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#5b21b6" />
              <stop offset="100%" stopColor="#a78bfa" />
            </linearGradient>
          </defs>
          <rect x="8" y="22" width="12" height="22" rx="3" fill="url(#barG1)" opacity="0.9" />
          <rect x="26" y="12" width="12" height="32" rx="3" fill="url(#barG1)" />
          <rect x="44" y="18" width="12" height="26" rx="3" fill="url(#barG1)" opacity="0.75" />
          <rect x="62" y="8" width="12" height="36" rx="3" fill="url(#barG1)" opacity="0.95" />
        </svg>
      )}
      {type === 'line' && (
        <svg viewBox="0 0 88 48" className={styles.svg}>
          <defs>
            <linearGradient id="lineG" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#0891b2" />
              <stop offset="100%" stopColor="#22d3ee" />
            </linearGradient>
          </defs>
          <polyline
            points="6,34 22,28 38,30 54,14 70,20 82,10"
            fill="none"
            stroke="url(#lineG)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {[[6, 34], [22, 28], [38, 30], [54, 14], [70, 20], [82, 10]].map(([cx, cy], i) => (
            <circle key={i} cx={cx} cy={cy} r="3" fill="#22d3ee" stroke="#0e7490" strokeWidth="1" />
          ))}
        </svg>
      )}
      {type === 'scatter' && (
        <svg viewBox="0 0 88 48" className={styles.svg}>
          {[
            [14, 30], [24, 18], [34, 26], [44, 12], [52, 22], [62, 16], [72, 28], [78, 10],
          ].map(([cx, cy], i) => (
            <circle key={i} cx={cx} cy={cy} r="4" fill="#a78bfa" opacity={0.65 + (i % 3) * 0.12} />
          ))}
        </svg>
      )}
      {type === 'histogram' && (
        <svg viewBox="0 0 88 48" className={styles.svg}>
          <defs>
            <linearGradient id="histG" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#b45309" />
              <stop offset="100%" stopColor="#fbbf24" />
            </linearGradient>
          </defs>
          {[8, 22, 36, 50, 64].map((x, i) => (
            <rect
              key={x}
              x={x}
              y={10 + i * 2}
              width="10"
              height={34 - i * 2}
              fill="url(#histG)"
              opacity={0.85 + i * 0.03}
            />
          ))}
        </svg>
      )}
      {type === 'pie' && (
        <svg viewBox="0 0 88 48" className={styles.svg}>
          <circle cx="44" cy="24" r="18" fill="#1e293b" />
          <path d="M44 6 A18 18 0 0 1 58 32 L44 24 Z" fill="#7c3aed" />
          <path d="M58 32 A18 18 0 0 1 30 28 L44 24 Z" fill="#2563eb" />
          <path d="M30 28 A18 18 0 0 1 44 6 L44 24 Z" fill="#10b981" />
        </svg>
      )}
      {type === 'heatmap' && (
        <svg viewBox="0 0 88 48" className={styles.svg}>
          {[0, 1, 2, 3].map((row) =>
            [0, 1, 2, 3, 4].map((col) => {
              const t = (row + col) / 6;
              const r = Math.round(30 + t * 100);
              const g = Math.round(60 + t * 80);
              const b = Math.round(180 + t * 50);
              return (
                <rect
                  key={`${row}-${col}`}
                  x={10 + col * 14}
                  y={8 + row * 9}
                  width="12"
                  height="7"
                  rx="2"
                  fill={`rgb(${r},${g},${b})`}
                />
              );
            }),
          )}
        </svg>
      )}
    </div>
  );
}

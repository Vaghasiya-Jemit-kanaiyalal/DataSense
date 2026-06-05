'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import featureAnalysisImg from '@/assets/feature-analysis.jpg';
import logoImg from '@/assets/logo.png';
import { ROUTES } from '@/constants/routes';
import { useAuthHydrated } from '@/hooks';
import {
  getPreview,
  resumeActiveDataset,
  setActiveDatasetId,
  type DatasetPayload,
} from '@/services/data';
import {
  DEMO_ANALYSIS,
  deriveFeatureAnalysis,
  type CorrelationStrength,
  type FeatureAnalysisResult,
} from '../../utils/deriveFeatureAnalysis';
import styles from './FeatureAnalysisPanel.module.css';

const ANALYSIS_ROWS = 500;

function ProgressRing({ value, size = 72, stroke = 6 }: { value: number; size?: number; stroke?: number }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className={styles.ringWrap} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(148, 163, 184, 0.15)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#a78bfa"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <span className={styles.ringLabel}>{value}%</span>
    </div>
  );
}

function strengthClass(strength: CorrelationStrength) {
  if (strength === 'Strong') return styles.strengthStrong;
  if (strength === 'Moderate') return styles.strengthModerate;
  return styles.strengthWeak;
}

const NETWORK_POSITIONS = [
  { top: '8%', left: '50%' },
  { top: '28%', left: '82%' },
  { top: '62%', left: '78%' },
  { top: '78%', left: '42%' },
  { top: '55%', left: '12%' },
  { top: '22%', left: '18%' },
];

export default function FeatureAnalysisPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hydrated = useAuthHydrated();
  const relationshipsRef = useRef<HTMLElement>(null);

  const queryId = searchParams.get('datasetId');
  const [payload, setPayload] = useState<DatasetPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resolvedId, setResolvedId] = useState<number | null>(null);
  const [analyzed, setAnalyzed] = useState(false);

  const datasetId = useMemo(() => {
    if (queryId) return Number(queryId);
    return resolvedId;
  }, [queryId, resolvedId]);

  const load = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPreview(id, ANALYSIS_ROWS, 1);
      setPayload(data);
      setActiveDatasetId(data.dataset_id);
      setResolvedId(data.dataset_id);
      setAnalyzed(true);
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
      if (resumed) {
        setResolvedId(resumed.dataset_id);
        router.replace(`${ROUTES.FEATURE_ANALYSIS}?datasetId=${resumed.dataset_id}`);
      }
    }
    init();
  }, [hydrated, queryId, load, router]);

  const analysis: FeatureAnalysisResult = useMemo(() => {
    if (payload && analyzed) return deriveFeatureAnalysis(payload);
    return DEMO_ANALYSIS;
  }, [payload, analyzed]);

  const isDemo = !payload || !analyzed;

  const scrollToRelationships = () => {
    relationshipsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const runAnalysis = () => {
    if (datasetId) load(datasetId);
    else router.push(ROUTES.UPLOAD);
  };

  const stats = [
    {
      label: 'Total Features',
      value: analysis.totalFeatures,
      hint: 'All columns analyzed',
      tone: 'purple',
      icon: 'grid',
    },
    {
      label: 'Numerical Features',
      value: analysis.numericalFeatures,
      hint: 'Quantitative columns',
      tone: 'blue',
      icon: 'hash',
    },
    {
      label: 'Categorical Features',
      value: analysis.categoricalFeatures,
      hint: 'Qualitative columns',
      tone: 'green',
      icon: 'text',
    },
    {
      label: 'Relationships Found',
      value: analysis.relationshipsFound,
      hint: 'Strong correlations',
      tone: 'cyan',
      icon: 'network',
    },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {isDemo && (
          <p className={styles.demoBanner}>
            Upload and clean a dataset to run live analysis — showing sample insights below.
          </p>
        )}

        {error && <p className={styles.errorBanner}>{error}</p>}

        <section className={styles.hero}>
          <div className={styles.heroLeft}>
            <span className={styles.kicker}>AI-Powered Feature Discovery</span>
            <h1 className={styles.heroTitle}>Feature Analysis</h1>
            <p className={styles.heroDesc}>
              Discover relationships, uncover redundant columns, and identify new AI-generated
              features that unlock deeper insights.
            </p>
            <div className={styles.heroActions}>
              <button type="button" className={styles.btnPrimary} onClick={runAnalysis}>
                {loading ? 'Analyzing…' : 'Start Analysis →'}
              </button>
              <button type="button" className={styles.btnSecondary} onClick={scrollToRelationships}>
                View Relationships
              </button>
            </div>
          </div>
          <Image
            src={featureAnalysisImg}
            alt="Feature analysis illustration"
            className={styles.heroArt}
            priority
          />
        </section>

        <section className={styles.statsGrid} aria-label="Feature analysis metrics">
          {stats.map((stat) => (
            <article key={stat.label} className={styles.statCard}>
              <span className={`${styles.statIcon} ${styles[`statIcon_${stat.tone}`]}`} aria-hidden="true">
                <StatIcon name={stat.icon} />
              </span>
              <div className={styles.statText}>
                <p>{stat.label}</p>
                <strong>{stat.value}</strong>
                <small>{stat.hint}</small>
              </div>
            </article>
          ))}
        </section>

        <section className={styles.midGrid}>
          <article className={styles.panel} ref={relationshipsRef}>
            <div className={styles.panelHeader}>
              <h2>Feature Relationships</h2>
              <span className={styles.panelBadge}>{analysis.relationshipsFound} found</span>
            </div>
            {analysis.relationships.length === 0 ? (
              <p className={styles.emptyNote}>No strong correlations detected yet.</p>
            ) : (
              <div className={styles.relationshipLayout}>
                <div className={styles.relationshipList}>
                  {analysis.relationships.map((rel) => (
                    <div key={`${rel.featureA}-${rel.featureB}`} className={styles.relationshipItem}>
                      <span className={styles.relPair}>
                        {rel.featureA}
                        <span>↔</span>
                        {rel.featureB}
                      </span>
                      <span className={styles.relMeta}>
                        <span className={styles.relScore}>{rel.score}%</span>
                        <span className={`${styles.strengthBadge} ${strengthClass(rel.strength)}`}>
                          {rel.strength}
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
                <div className={styles.networkDiagram} aria-hidden="true">
                  <div className={styles.networkCenter}>
                    <BrainIcon />
                  </div>
                  {NETWORK_POSITIONS.map((pos, i) => (
                    <span
                      key={i}
                      className={styles.networkNode}
                      style={{ top: pos.top, left: pos.left, transform: 'translate(-50%, -50%)' }}
                    />
                  ))}
                </div>
              </div>
            )}
          </article>

          <article className={styles.panel}>
            <div className={styles.panelHeader}>
              <h2>Low Value Features</h2>
              <span className={styles.panelBadge}>{analysis.lowValueFeatures.length} flagged</span>
            </div>
            {analysis.lowValueFeatures.length === 0 ? (
              <p className={styles.emptyNote}>No low-value columns detected.</p>
            ) : (
              <div className={styles.featureList}>
                {analysis.lowValueFeatures.map((feat) => (
                  <div key={feat.name} className={styles.featureItem}>
                    <strong>{feat.name}</strong>
                    <p>{feat.reason}</p>
                  </div>
                ))}
              </div>
            )}
          </article>
        </section>

        <section className={styles.bottomGrid}>
          <article className={styles.panel}>
            <div className={styles.panelHeader}>
              <h2>Redundant Features</h2>
              <span className={styles.panelBadge}>{analysis.redundantFeatures.length} pairs</span>
            </div>
            {analysis.redundantFeatures.length === 0 ? (
              <p className={styles.emptyNote}>No redundant feature pairs found.</p>
            ) : (
              <div className={styles.featureList}>
                {analysis.redundantFeatures.map((pair) => (
                  <div key={`${pair.featureA}-${pair.featureB}`} className={styles.featureItem}>
                    <div className={styles.overlapRow}>
                      <strong>
                        {pair.featureA} ↔ {pair.featureB}
                      </strong>
                      <span className={styles.overlapPct}>{pair.overlap}%</span>
                    </div>
                    <div className={styles.overlapBar}>
                      <div className={styles.overlapFill} style={{ width: `${pair.overlap}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </article>

          <article className={styles.panel}>
            <div className={styles.panelHeader}>
              <h2>AI Feature Suggestions</h2>
              <span className={styles.panelBadge}>AI powered</span>
            </div>
            <div className={styles.suggestionList}>
              {analysis.aiSuggestions.map((suggestion) => (
                <div key={suggestion.name} className={styles.suggestionCard}>
                  <ProgressRing value={suggestion.confidence} />
                  <div className={styles.suggestionInfo}>
                    <strong>{suggestion.name}</strong>
                    <p>{suggestion.description}</p>
                    <button type="button" className={styles.suggestionBtn}>
                      Generate Feature
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className={styles.panel}>
            <div className={styles.panelHeader}>
              <h2>Dataset Readiness</h2>
            </div>
            <div className={styles.readinessLayout}>
              <div className={styles.readinessGauge}>
                <ProgressRing value={analysis.readinessScore} size={100} stroke={8} />
                <strong>{analysis.readinessScore}%</strong>
                <small>ML Readiness Score</small>
              </div>
              <div>
                <div className={styles.checkList}>
                  {analysis.readinessChecks.map((check) => (
                    <div key={check.label} className={styles.checkItem}>
                      <span
                        className={`${styles.checkIcon} ${check.passed ? styles.checkPass : styles.checkFail}`}
                      >
                        {check.passed ? <CheckIcon /> : <DashIcon />}
                      </span>
                      {check.label}
                    </div>
                  ))}
                </div>
                <div className={styles.readinessCta}>
                  <p>
                    {analysis.readinessScore >= 80
                      ? 'Your dataset is ready for AI-powered insights.'
                      : 'Clean and enrich your dataset to improve ML readiness.'}
                  </p>
                  <button
                    type="button"
                    className={styles.btnInsights}
                    onClick={() => router.push(ROUTES.AI_INSIGHTS)}
                  >
                    <Image
                      src={logoImg}
                      alt=""
                      width={88}
                      height={24}
                      className={styles.btnInsightsLogo}
                      aria-hidden
                    />
                    Open AI Insights →
                  </button>
                </div>
              </div>
            </div>
          </article>
        </section>
      </div>
    </div>
  );
}

function StatIcon({ name }: { name: string }) {
  if (name === 'hash') {
    return (
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <path d="M6 2 5 6h6l1-4M4 10l-1 4h6l1-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }
  if (name === 'text') {
    return (
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <text x="2" y="12" fill="currentColor" fontSize="10" fontWeight="700">Aa</text>
      </svg>
    );
  }
  if (name === 'network') {
    return (
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <circle cx="8" cy="8" r="2" fill="currentColor" />
        <circle cx="3" cy="5" r="1.5" fill="currentColor" />
        <circle cx="13" cy="5" r="1.5" fill="currentColor" />
        <circle cx="8" cy="14" r="1.5" fill="currentColor" />
        <path d="M4.2 6 6.5 7.2M11.8 6 9.5 7.2M8 10v3" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <rect x="2" y="2" width="5" height="5" rx="1" fill="currentColor" opacity="0.7" />
      <rect x="9" y="2" width="5" height="5" rx="1" fill="currentColor" opacity="0.7" />
      <rect x="2" y="9" width="5" height="5" rx="1" fill="currentColor" opacity="0.7" />
      <rect x="9" y="9" width="5" height="5" rx="1" fill="currentColor" opacity="0.7" />
    </svg>
  );
}

function BrainIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M9 5a3 3 0 0 0-3 3v1a2 2 0 0 0-2 2 2 2 0 0 0 2 2v1a3 3 0 0 0 3 3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M15 5a3 3 0 0 1 3 3v1a2 2 0 0 1 2 2 2 2 0 0 1-2 2v1a3 3 0 0 1-3 3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 10 10" aria-hidden="true">
      <path d="M2 5.2 4.2 7.5 8 3" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function DashIcon() {
  return (
    <svg viewBox="0 0 10 10" aria-hidden="true">
      <path d="M2 5h6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

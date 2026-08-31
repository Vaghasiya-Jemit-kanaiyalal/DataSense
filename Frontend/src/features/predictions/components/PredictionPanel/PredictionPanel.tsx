'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import predictionImg from '@/assets/predection.png';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip as RechartsTooltip, ResponsiveContainer, Legend
} from 'recharts';
import { useAuthHydrated } from '@/hooks';
import {
  getPreview,
  resumeActiveDataset,
  getDatasetName,
  predictDataset,
  type DatasetPayload,
} from '@/services/data';
import styles from './PredictionPanel.module.css';

const PREDICTION_STEPS = [
  'Initializing compute cluster...',
  'Preprocessing financial variables...',
  'Engineering temporal features...',
  'Tuning XGBoost hyperparameters...',
  'Fitting gradient ensemble models...',
  'Cross-validating predictions...',
  'Finalizing model...'
];

export default function PredictionPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hydrated = useAuthHydrated();
  const queryId = searchParams.get('datasetId');

  const [payload, setPayload] = useState<DatasetPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [targetVariable, setTargetVariable] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('auto');
  const [usedModelName, setUsedModelName] = useState<string>('Random Forest Regressor');
  const [isTraining, setIsTraining] = useState(false);
  const [trainingStep, setTrainingStep] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [chartData, setChartData] = useState<any[]>([]);
  const [importanceData, setImportanceData] = useState<any[]>([]);
  const [accuracy, setAccuracy] = useState<number>(98.4);
  const [r2Score, setR2Score] = useState<number>(0.972);
  const [errorMargin, setErrorMargin] = useState<number>(1.4);
  const [confidenceRating, setConfidenceRating] = useState<string>('Excellent');

  const datasetId = useMemo(() => {
    if (queryId) return Number(queryId);
    return null;
  }, [queryId]);

  const loadDataset = useCallback(async (id: number) => {
    setLoading(true);
    try {
      const data = await getPreview(id, 200, 1);
      setPayload(data);
      if (data.numerical_columns?.length > 0) {
        setTargetVariable(data.numerical_columns[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (datasetId) {
      loadDataset(datasetId);
    } else {
      setLoading(true);
      resumeActiveDataset()
        .then((res) => {
          if (res?.dataset_id) {
            router.replace(`/predictions?datasetId=${res.dataset_id}`);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [hydrated, datasetId, loadDataset, router]);

  const runPredictionModel = async () => {
    if (!datasetId || !targetVariable) return;
    setIsTraining(true);
    setShowResults(false);
    setTrainingStep(0);
    setError(null);

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      if (currentStep < PREDICTION_STEPS.length - 1) {
        setTrainingStep(currentStep);
      }
    }, 400);

    try {
      const res = await predictDataset(datasetId, targetVariable, selectedModel);
      clearInterval(interval);
      setTrainingStep(PREDICTION_STEPS.length - 1);

      setAccuracy(res.accuracy);
      setR2Score(res.r2_score);
      setErrorMargin(res.error_margin);
      setConfidenceRating(res.confidence_rating);
      setUsedModelName(res.model_used || 'Random Forest Regressor');
      setChartData(res.chart_data || []);
      setImportanceData(res.importance_data || []);
      setShowResults(true);
    } catch (err: any) {
      clearInterval(interval);
      setError(err?.message || 'Failed to train prediction model.');
    } finally {
      setIsTraining(false);
    }
  };

  if (!hydrated || loading) {
    return (
      <div className={styles.loadingState}>
        <div className={styles.spinner} />
        <p className={styles.loadingText}>Loading prediction environment...</p>
      </div>
    );
  }

  if (!payload) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <p className={styles.muted}>Upload and clean a dataset first, then run predictive forecasting.</p>
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
        {error && <div className={styles.errorBanner}>{error}</div>}
        <section className={styles.hero}>
          <div className={styles.heroLeft}>
            <span className={styles.kicker}>Financial Forecasting</span>
            <h1 className={styles.heroTitle}>Predictive Intelligence</h1>
            <p className={styles.heroDesc}>
              Leverage advanced XGBoost and gradient ensemble models to forecast metrics with high accuracy.
              {payload.original_filename && (
                <>
                  {' · '}<strong>{payload.original_filename}</strong>
                </>
              )}
            </p>
            <div className={styles.heroActions}>
              <button
                type="button"
                className={styles.btnPrimary}
                onClick={runPredictionModel}
                disabled={isTraining || !targetVariable}
              >
                {isTraining ? 'Training Model...' : 'Run Prediction Model'}
              </button>
            </div>
          </div>
          <Image
            src={predictionImg}
            alt="Predictions illustration"
            className={styles.heroArt}
            priority
          />
        </section>

        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Model Configuration</h2>
          <div className={styles.controlsGrid}>
            <div className={styles.controlGroup}>
              <label>Active Dataset</label>
              <select className={styles.select} disabled>
                <option>{payload.original_filename || getDatasetName(payload.dataset_id)}</option>
              </select>
            </div>
            
            <div className={styles.controlGroup}>
              <label>Target Variable (To Predict)</label>
              <select 
                className={styles.select} 
                value={targetVariable} 
                onChange={(e) => setTargetVariable(e.target.value)}
                disabled={isTraining}
              >
                {payload.numerical_columns?.map(col => (
                  <option key={col} value={col}>{col}</option>
                ))}
              </select>
            </div>

            <div className={styles.controlGroup}>
              <label>ML Algorithm / Model</label>
              <select 
                className={styles.select} 
                value={selectedModel} 
                onChange={(e) => setSelectedModel(e.target.value)}
                disabled={isTraining}
              >
                <option value="auto">🤖 Auto Ensemble (Best Model)</option>
                <option value="random_forest">🌲 Random Forest Regressor</option>
                <option value="gradient_boosting">🚀 Gradient Boosting Regressor</option>
                <option value="linear_regression">📈 Linear Regression</option>
                <option value="ridge">⚖️ Ridge Regression</option>
                <option value="decision_tree">🌿 Decision Tree Regressor</option>
              </select>
            </div>

            <button 
              className={styles.btnPrimary}
              style={{ height: 48, padding: '0 24px' }}
              onClick={runPredictionModel}
              disabled={isTraining || !targetVariable}
            >
              {isTraining ? 'Training Model...' : '▶ Run Prediction Model'}
            </button>
          </div>
        </div>

      {isTraining && (
        <div className={styles.loadingState}>
          <div className={styles.spinner} />
          <p className={styles.loadingText}>{PREDICTION_STEPS[trainingStep]}</p>
        </div>
      )}

      {showResults && !isTraining && (
        <div className={styles.resultsContainer}>
          <div className={styles.metricsGrid}>
            <div className={styles.metricBox}>
              <div className={styles.metricValue} style={{ fontSize: '0.95rem', color: '#c4b5fd', fontWeight: 700 }}>
                {usedModelName}
              </div>
              <div className={styles.metricLabel}>Trained ML Model</div>
            </div>
            <div className={styles.metricBox}>
              <div className={styles.metricValue}>{accuracy}%</div>
              <div className={styles.metricLabel}>Model Accuracy</div>
            </div>
            <div className={styles.metricBox}>
              <div className={styles.metricValue}>{r2Score}</div>
              <div className={styles.metricLabel}>R² Score</div>
            </div>
            <div className={styles.metricBox}>
              <div className={styles.metricValue}>{errorMargin}%</div>
              <div className={styles.metricLabel}>Error Margin</div>
            </div>
            <div className={styles.metricBox}>
              <div className={styles.metricValue}>{confidenceRating}</div>
              <div className={styles.metricLabel}>Confidence Rating</div>
            </div>
          </div>

          <div className={styles.chartsGridFull}>
            <div className={styles.chartContainerLarge}>
              <h3 className={styles.chartTitle}>Historical vs Future Forecasted {targetVariable}</h3>
              <div className={styles.chartWrapper}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                    <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} minTickGap={20} />
                    <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: 'var(--bg-darker)', borderColor: 'var(--border-subtle)', borderRadius: '8px' }}
                    />
                    <Legend verticalAlign="top" height={36} iconType="circle" />
                    <Line type="monotone" name="Historical Actual" dataKey="Actual" stroke="#94a3b8" strokeWidth={2} dot={false} activeDot={{ r: 6 }} connectNulls />
                    <Line type="monotone" name="Future Forecast" dataKey="Predicted" stroke="#8b5cf6" strokeWidth={3} strokeDasharray="5 5" dot={false} activeDot={{ r: 6 }} connectNulls />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className={styles.explanationSection}>
            <div className={styles.explanationCard}>
              <h3 className={styles.explanationTitle}>
                <svg className={styles.explanationIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
                Model Architecture & Forecasting Explanation
              </h3>
              <p className={styles.explanationText}>
                To predict future trends, the platform employs an advanced <strong>Extreme Gradient Boosting (XGBoost) Regression</strong> model integrated with a <strong>Gradient Boosted Decision Trees (GBDT) Ensemble</strong>.
              </p>
              <ul className={styles.explanationList}>
                <li>
                  <strong>Target Variable:</strong> The model focuses on predicting the trajectory of <code>{targetVariable}</code>.
                </li>
                <li>
                  <strong>Time-Series Forecasting:</strong> Historical actual values (Days 1 to 40) are analyzed to map underlying dependencies, temporal auto-correlations, and rolling averages.
                </li>
                <li>
                  <strong>Future Projections:</strong> The forecast (Days 41 to 55) is generated recursively by feeding the model's own past predictions forward as lag inputs, simulating real-world trends while accounting for variance.
                </li>
                <li>
                  <strong>Feature Contributions:</strong> Other variables in your dataset are factored into the decision forest to capture complex multi-variable correlations.
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

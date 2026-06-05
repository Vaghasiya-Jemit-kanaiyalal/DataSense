import type { DatasetPayload } from '@/services/data';

export type CorrelationStrength = 'Strong' | 'Moderate' | 'Weak';

export interface FeatureRelationship {
  featureA: string;
  featureB: string;
  score: number;
  strength: CorrelationStrength;
}

export interface LowValueFeature {
  name: string;
  reason: string;
}

export interface RedundantFeature {
  featureA: string;
  featureB: string;
  overlap: number;
}

export interface AISuggestion {
  name: string;
  description: string;
  confidence: number;
  formula: string;
}

export interface ReadinessCheck {
  label: string;
  passed: boolean;
}

export interface FeatureAnalysisResult {
  totalFeatures: number;
  numericalFeatures: number;
  categoricalFeatures: number;
  relationshipsFound: number;
  relationships: FeatureRelationship[];
  lowValueFeatures: LowValueFeature[];
  redundantFeatures: RedundantFeature[];
  aiSuggestions: AISuggestion[];
  readinessScore: number;
  readinessChecks: ReadinessCheck[];
}

const ID_PATTERN = /(^id$|_id$|^id_|uuid|guid|session|transaction|customer.?id|row.?num)/i;

function toNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function pearson(xs: number[], ys: number[]): number | null {
  if (xs.length < 3 || xs.length !== ys.length) return null;
  const n = xs.length;
  const meanX = xs.reduce((a, b) => a + b, 0) / n;
  const meanY = ys.reduce((a, b) => a + b, 0) / n;
  let num = 0;
  let denX = 0;
  let denY = 0;
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - meanX;
    const dy = ys[i] - meanY;
    num += dx * dy;
    denX += dx * dx;
    denY += dy * dy;
  }
  const den = Math.sqrt(denX * denY);
  if (den === 0) return null;
  return num / den;
}

function strengthFromScore(score: number): CorrelationStrength {
  const abs = Math.abs(score);
  if (abs >= 0.75) return 'Strong';
  if (abs >= 0.5) return 'Moderate';
  return 'Weak';
}

function columnSeries(payload: DatasetPayload, column: string): number[] {
  return payload.data
    .map((row) => toNumber(row[column]))
    .filter((v): v is number => v !== null);
}

function findColumn(columns: string[], patterns: RegExp[]): string | undefined {
  return columns.find((col) => patterns.some((p) => p.test(col)));
}

function buildCorrelations(payload: DatasetPayload): FeatureRelationship[] {
  const numerics = payload.numerical_columns;
  const pairs: FeatureRelationship[] = [];

  for (let i = 0; i < numerics.length; i++) {
    for (let j = i + 1; j < numerics.length; j++) {
      const a = numerics[i];
      const b = numerics[j];
      const seriesA = columnSeries(payload, a);
      const seriesB = columnSeries(payload, b);
      const len = Math.min(seriesA.length, seriesB.length);
      if (len < 5) continue;
      const score = pearson(seriesA.slice(0, len), seriesB.slice(0, len));
      if (score === null || Math.abs(score) < 0.5) continue;
      pairs.push({
        featureA: a,
        featureB: b,
        score: Math.round(Math.abs(score) * 100),
        strength: strengthFromScore(score),
      });
    }
  }

  return pairs.sort((x, y) => y.score - x.score).slice(0, 8);
}

function buildLowValueFeatures(payload: DatasetPayload): LowValueFeature[] {
  const all = [...payload.numerical_columns, ...payload.categorical_columns];
  const results: LowValueFeature[] = [];

  for (const name of all) {
    const stats = payload.statistics[name];
    const unique = stats?.unique_count ?? 0;
    const ratio = payload.rows > 0 ? unique / payload.rows : 0;

    if (ID_PATTERN.test(name)) {
      results.push({ name, reason: 'Unique identifier, not predictive' });
      continue;
    }
    if (ratio >= 0.95) {
      results.push({ name, reason: 'High uniqueness, low relevance' });
      continue;
    }
    if (ratio >= 0.85 && payload.categorical_columns.includes(name)) {
      results.push({ name, reason: 'Near-unique categorical values' });
    }
  }

  return results.slice(0, 6);
}

function buildRedundantFeatures(relationships: FeatureRelationship[]): RedundantFeature[] {
  return relationships
    .filter((r) => r.score >= 80)
    .map((r) => ({
      featureA: r.featureA,
      featureB: r.featureB,
      overlap: r.score,
    }))
    .slice(0, 5);
}

function buildAISuggestions(payload: DatasetPayload): AISuggestion[] {
  const numerics = payload.numerical_columns;
  const income = findColumn(numerics, [/income/i, /salary/i, /earning/i]);
  const debt = findColumn(numerics, [/debt/i, /loan/i, /liability/i]);
  const savings = findColumn(numerics, [/saving/i, /balance/i]);
  const spending = findColumn(numerics, [/spend/i, /expense/i, /cost/i]);
  const suggestions: AISuggestion[] = [];

  if (debt && income) {
    suggestions.push({
      name: 'Debt_to_Income_Ratio',
      description: 'Measures financial leverage relative to earnings.',
      confidence: 97,
      formula: `${debt} / ${income}`,
    });
  }
  if (savings && income) {
    suggestions.push({
      name: 'Savings_Rate',
      description: 'Captures how much income is retained as savings.',
      confidence: 94,
      formula: `${savings} / ${income}`,
    });
  }
  if (spending && income) {
    suggestions.push({
      name: 'Expense_Ratio',
      description: 'Shows spending intensity relative to income.',
      confidence: 91,
      formula: `${spending} / ${income}`,
    });
  }

  if (suggestions.length < 3 && numerics.length >= 2) {
    const [a, b] = numerics;
    suggestions.push({
      name: `${a}_per_${b}`,
      description: `Ratio feature combining ${a} and ${b}.`,
      confidence: 88,
      formula: `${a} / ${b}`,
    });
  }
  if (suggestions.length < 3 && numerics.length >= 3) {
    const [a, b, c] = numerics;
    suggestions.push({
      name: `${a}_x_${b}`,
      description: `Interaction term between ${a} and ${b}.`,
      confidence: 85,
      formula: `${a} * ${b}`,
    });
    if (!suggestions.some((s) => s.formula.includes(c))) {
      suggestions.push({
        name: `${c}_normalized`,
        description: `Normalized transform of ${c} for model stability.`,
        confidence: 82,
        formula: `(${c} - mean) / std`,
      });
    }
  }

  return suggestions.slice(0, 3);
}

function buildReadiness(payload: DatasetPayload, relationships: FeatureRelationship[]): {
  score: number;
  checks: ReadinessCheck[];
} {
  const all = [...payload.numerical_columns, ...payload.categorical_columns];
  let missingPct = 0;
  for (const col of all) {
    missingPct += payload.statistics[col]?.missing_percentage ?? 0;
  }
  const avgMissing = all.length ? missingPct / all.length : 0;

  const checks: ReadinessCheck[] = [
    { label: 'Dataset loaded', passed: payload.rows > 0 },
    { label: 'Relationships found', passed: relationships.length > 0 },
    { label: 'Quality checks passed', passed: avgMissing < 10 },
    { label: 'Numeric features present', passed: payload.numerical_columns.length > 0 },
    { label: 'ML-ready status', passed: Boolean(payload.ml_ready) },
  ];

  let score = 100;
  score -= Math.min(30, Math.round(avgMissing * 2));
  if (!payload.ml_ready) score -= 8;
  if (relationships.length === 0) score -= 12;
  if (payload.numerical_columns.length < 2) score -= 15;
  score = Math.max(42, Math.min(98, score));

  return { score, checks };
}

export function deriveFeatureAnalysis(payload: DatasetPayload): FeatureAnalysisResult {
  const relationships = buildCorrelations(payload);
  const redundantFeatures = buildRedundantFeatures(relationships);
  const { score, checks } = buildReadiness(payload, relationships);

  return {
    totalFeatures: payload.columns,
    numericalFeatures: payload.numerical_columns.length,
    categoricalFeatures: payload.categorical_columns.length,
    relationshipsFound: relationships.length,
    relationships,
    lowValueFeatures: buildLowValueFeatures(payload),
    redundantFeatures,
    aiSuggestions: buildAISuggestions(payload),
    readinessScore: score,
    readinessChecks: checks,
  };
}

export const DEMO_ANALYSIS: FeatureAnalysisResult = {
  totalFeatures: 24,
  numericalFeatures: 11,
  categoricalFeatures: 13,
  relationshipsFound: 17,
  relationships: [
    { featureA: 'Income', featureB: 'Savings', score: 92, strength: 'Strong' },
    { featureA: 'Debt', featureB: 'Risk Score', score: 88, strength: 'Strong' },
    { featureA: 'Age', featureB: 'Spending', score: 76, strength: 'Moderate' },
  ],
  lowValueFeatures: [
    { name: 'Customer_ID', reason: 'High uniqueness, low relevance' },
    { name: 'Transaction_ID', reason: 'Unique identifier, not predictive' },
    { name: 'Session_Number', reason: 'Near-unique categorical values' },
  ],
  redundantFeatures: [
    { featureA: 'Income', featureB: 'Salary', overlap: 89 },
    { featureA: 'Debt', featureB: 'Loan Amount', overlap: 87 },
  ],
  aiSuggestions: [
    {
      name: 'Debt_to_Income_Ratio',
      description: 'Measures financial leverage relative to earnings.',
      confidence: 97,
      formula: 'Debt / Income',
    },
    {
      name: 'Savings_Rate',
      description: 'Captures how much income is retained as savings.',
      confidence: 94,
      formula: 'Savings / Income',
    },
    {
      name: 'Expense_Ratio',
      description: 'Shows spending intensity relative to income.',
      confidence: 91,
      formula: 'Spending / Income',
    },
  ],
  readinessScore: 92,
  readinessChecks: [
    { label: 'Dataset loaded', passed: true },
    { label: 'Relationships found', passed: true },
    { label: 'Quality checks passed', passed: true },
    { label: 'Numeric features present', passed: true },
    { label: 'ML-ready status', passed: true },
  ],
};

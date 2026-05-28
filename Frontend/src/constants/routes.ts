/**
 * Route path constants.
 * Use these instead of hardcoding paths in Link components and redirects.
 */
export const ROUTES = {
  HOME: '/',
  SIGNIN: '/signin',
  SIGNUP: '/signup',
  FORGOT_PASSWORD: '/forgot-password',
  TERMS: '/terms',
  DASHBOARD: '/dashboard',
  UPLOAD: '/upload',
  CLEANING: '/cleaning',
  PREVIEW: '/preview',
  ANALYTICS: '/analytics',
  MODELS: '/models',
  VISUALIZATION: '/visualization',
  AI_INSIGHTS: '/ai-insights',
  FEATURE_ANALYSIS: '/preview',
} as const;

export type Route = (typeof ROUTES)[keyof typeof ROUTES];

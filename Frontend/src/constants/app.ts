/**
 * Application-wide constants and metadata.
 * Single source of truth for values used across multiple features.
 */

export const APP_NAME = 'DataSense';
export const APP_DESCRIPTION = 'AI-Powered Data Analytics';
export const APP_TAGLINE = 'Forge Intelligence From Your Data';

export const APP_METADATA = {
  title: `${APP_NAME} \u2014 ${APP_DESCRIPTION}`,
  description:
    'Upload, clean, analyze, and visualize your data with AI-powered tools. DataSense makes data intelligence accessible to everyone.',
  keywords: [
    'data analytics',
    'AI',
    'data cleaning',
    'data visualization',
    'machine learning',
    'CSV',
    'feature analysis',
  ],
} as const;

export const SOCIAL_LINKS = {
  twitter: '#',
  github: '#',
  linkedin: '#',
} as const;

/** Maximum file upload size in bytes (100 MB) */
export const MAX_UPLOAD_SIZE = 100 * 1024 * 1024;

/** Accepted file extensions for upload */
export const ACCEPTED_FILE_TYPES = '.csv,.xlsx,.xls,.json';

/** Accepted MIME types for upload */
export const ACCEPTED_MIME_TYPES = [
  'text/csv',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'application/json',
] as const;

import type { Metadata } from 'next';
import { TermsConditions } from '@/features/legal';

export const metadata: Metadata = {
  title: 'DataSense — Terms & Conditions',
  description: 'Terms and Conditions for using the DataSense platform.',
};

export default function TermsPage() {
  return <TermsConditions />;
}

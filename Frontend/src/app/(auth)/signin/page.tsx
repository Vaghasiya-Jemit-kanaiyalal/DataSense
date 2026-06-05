import { Suspense } from 'react';
import { SignInForm } from '@/features/auth';

export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <SignInForm />
    </Suspense>
  );
}

import { AppHeader } from '@/components/layout';

export const metadata = { title: 'DataSense — Sign In' };

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppHeader variant="auth" />
      <main style={{ paddingTop: '68px' }}>{children}</main>
    </>
  );
}

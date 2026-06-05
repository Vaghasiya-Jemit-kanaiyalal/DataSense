import { AppHeader, AuthGuard } from '@/components/layout';
import { Footer } from '@/features/marketing';

export const metadata = {
  title: 'DataSense \u2014 Datasets',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AppHeader variant="full" />
      <main className="app-main" style={{ minHeight: '100vh' }}>
        <AuthGuard>{children}</AuthGuard>
      </main>
      <Footer />
    </>
  );
}

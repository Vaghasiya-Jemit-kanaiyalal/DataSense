import { AppHeader, AuthGuard } from '@/components/layout';

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
      <main style={{ paddingTop: '68px', minHeight: '100vh' }}>
        <AuthGuard>{children}</AuthGuard>
      </main>
    </>
  );
}

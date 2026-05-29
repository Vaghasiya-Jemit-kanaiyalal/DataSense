import { AppHeader } from '@/components/layout';
import { Footer } from '@/features/marketing';

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AppHeader variant="full" />
      <main style={{ paddingTop: '68px' }}>{children}</main>
      <Footer />
    </>
  );
}

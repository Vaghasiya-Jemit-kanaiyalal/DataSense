export const metadata = { title: 'DataSense — Sign In' };

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <main>{children}</main>
    </>
  );
}

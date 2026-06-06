import AppNavbar from '@/components/AppNavbar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppNavbar />
      <main className="pt-16" style={{ display: 'block' }}>{children}</main>
    </>
  );
}

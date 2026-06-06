import AppNavbar from '@/components/AppNavbar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppNavbar />
      <main className="pt-[72px]" style={{ display: 'block' }}>{children}</main>
    </>
  );
}

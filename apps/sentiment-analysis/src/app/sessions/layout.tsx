// Force dynamic rendering for all pages in this layout
export const dynamic = 'force-dynamic';

export default function SessionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}


import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ name: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  return {
    title: `${decodeURIComponent(resolvedParams.name)} | AGA`,
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

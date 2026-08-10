import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Valid8 | AI Answer Verification & Hallucination Detection Platform',
  description: 'Enterprise AI Answer Verification, Natural Language Inference, and Visual Fact Analytics Platform.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-dark-950 text-slate-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}

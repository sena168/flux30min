import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Fluke of Flux – FLUX Generator',
  description: 'enjoy while it last, now or never!',
  icons: {
    icon: '/satujamico.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      <body>{children}</body>
    </html>
  );
}

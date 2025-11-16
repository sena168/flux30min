import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Satu Jam Saja – FLUX Generator',
  description: 'one hour only free generator, now or never!',
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

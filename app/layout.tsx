import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import './globals.css';
import { Room } from './Room';

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  weight: ['400', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Canvas Board',
  description: 'Cooperation tool clone using Fabric.js and Liveblocks',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body
        className={`
        ${montserrat.className}
       bg-primary-graphite`}
      >
        <Room>{children}</Room>
      </body>
    </html>
  );
}

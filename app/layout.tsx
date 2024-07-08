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
  description: 'Cooperation tool 🤍',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' className='m-0 p-0'>
      <body
        className={`
        ${montserrat.className}
       bg-primary-graphite p-0  m-0`}
      >
        <Room>{children}</Room>
      </body>
    </html>
  );
}

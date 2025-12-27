
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Link from 'next/link';
import { Upload, Home } from 'lucide-react';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Teacher Assistant',
  description: 'Upload and preview HTML files',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-gray-50 text-gray-900 flex flex-col`}>
        <nav className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl text-blue-600 hover:text-blue-700 transition-colors">
              <Home className="h-6 w-6" />
              <span>Teacher Assistant</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="/upload"
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <Upload className="h-4 w-4" />
                Upload HTML
              </Link>
            </div>
          </div>
        </nav>
        <main className="mx-auto flex-1 w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </main>
        <footer className="border-t border-gray-200 bg-white py-6">
          <div className="mx-auto flex max-w-7xl items-center justify-center px-4 sm:px-6 lg:px-8">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} Teacher Assistant. Design by <span className="font-semibold text-blue-600">Amanda</span>.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}

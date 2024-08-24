'use client';

import { Inter } from "next/font/google";
import "./globals.css";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { ThemeProvider } from "next-themes";
import ErrorBoundary from './components/ErrorBoundary';
import { FirebaseProvider } from './components/FirebaseProvider';

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full">
      <head>
        <title>AI Journal</title>
        <meta name="description" content="An AI-powered journaling app for daily reflections" />
      </head>
      <body className={`${inter.className} h-full`}>
        <ErrorBoundary>
          <FirebaseProvider>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
              {children}
            </ThemeProvider>
          </FirebaseProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
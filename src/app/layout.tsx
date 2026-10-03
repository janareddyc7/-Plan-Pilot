import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
export const metadata: Metadata = {
  title: {
    default: "PlanPilot — Your benefits, clearer.",
    template: "%s | PlanPilot",
  },
  description: "The AI flight simulator for your dental benefits.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="font-sans antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:z-50 focus:bg-card focus:p-4"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}

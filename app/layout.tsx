import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Sidebar } from "./components/structure/sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TariffCorp — Trade Compliance Platform",
  description: "Identify and correct compliance discrepancies by financial exposure.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full bg-background text-foreground">
        <Providers>
          <div className="flex min-h-dvh flex-col md:flex-row">
            <Sidebar />
            <main className="min-w-0 flex-1 overflow-auto px-4 py-6 sm:px-7 sm:py-7">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}

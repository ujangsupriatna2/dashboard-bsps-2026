import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dashboard BSPS 2026 Tahap IV - Kab. Bandung",
  description: "Dashboard interaktif data calon penerima bantuan BSPS 2026 Tahap IV Kabupaten Bandung, Provinsi Jawa Barat.",
  keywords: ["BSPS", "2026", "Kab. Bandung", "Dashboard", "Perumahan", "Perdesaan"],
  authors: [{ name: "Ujang Supriatna" }],
  openGraph: {
    title: "Dashboard BSPS 2026 Tahap IV - Kab. Bandung",
    description: "Dashboard interaktif data calon penerima bantuan BSPS 2026 Tahap IV Kabupaten Bandung",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dashboard BSPS 2026 Tahap IV - Kab. Bandung",
    description: "Dashboard interaktif data calon penerima bantuan BSPS 2026 Tahap IV Kabupaten Bandung",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}

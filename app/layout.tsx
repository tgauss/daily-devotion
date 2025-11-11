import type { Metadata } from "next";
import { DM_Serif_Display, Inter, Cormorant_Garamond } from "next/font/google";
import "./globals.css";

const dmSerifDisplay = DM_Serif_Display({
  weight: "400",
  variable: "--font-dm-serif",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const cormorantGaramond = Cormorant_Garamond({
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "My Daily Bread.faith - Daily nourishment for the soul",
  description: "Feed your faith one day at a time. Daily Bible readings, reflections, and spiritual guidance made simple, beautiful, and personal.",
  icons: {
    icon: '/my-daily-break-logo.png',
    shortcut: '/my-daily-break-logo.png',
    apple: '/my-daily-break-logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${dmSerifDisplay.variable} ${inter.variable} ${cormorantGaramond.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

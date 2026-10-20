import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond } from "next/font/google";
import "./globals.css";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-cormorant",
});

export const metadata: Metadata = {
  title: "Sate Khas Senayan MKG — Bill Split",
  description: "Split the bill and show payment details.",
};

export const viewport: Viewport = {
  themeColor: "#faf7f2",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={display.variable}>
      <body className="bg-paper antialiased">{children}</body>
    </html>
  );
}

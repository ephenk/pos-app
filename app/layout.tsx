import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sate Khas Senayan MKG — Bill Split",
  description: "Split the bill and show payment details.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}

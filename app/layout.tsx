import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Girly Gems | Everyday sparkle",
  description: "Playful, polished jewelry made for your everyday glow.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DataSense — AI-Powered Data Analytics",
  description:
    "Clean, analyze, visualize and generate actionable insights from your data in seconds. Built for analysts, by analysts.",
  keywords: [
    "data analytics",
    "AI analytics",
    "data cleaning",
    "data visualization",
    "machine learning",
    "CSV analysis",
    "feature analysis",
  ],
  openGraph: {
    title: "DataSense — AI-Powered Data Analytics",
    description:
      "Forge intelligence from your data. Clean, analyze, visualize and generate actionable insights in seconds.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}

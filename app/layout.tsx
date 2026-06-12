import type { Metadata } from "next";
import "./globals.css";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = {
  metadataBase: new URL("https://example.com"), // TODO: set to your real domain
  title: {
    default: "Nghia Dang · Software Engineer",
    template: "%s · Nghia Dang",
  },
  description:
    "Software engineer building high-throughput data systems and LLM-powered tools. Distributed systems at scale, moving deeper into AI engineering.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;450;500;600&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <Reveal />
      </body>
    </html>
  );
}

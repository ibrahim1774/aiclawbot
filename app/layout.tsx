import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AIClawBots — Deploy Your AI Assistant in Under 1 Minute",
  description:
    "One-click deploy AI assistants to Telegram, Discord, and WhatsApp. Powered by Claude, GPT, and Gemini.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-bg font-sans antialiased">
        {children}
      </body>
    </html>
  );
}

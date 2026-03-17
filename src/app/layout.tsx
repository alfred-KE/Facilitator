import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Facilitator - Outil de facilitation interactive",
  description:
    "Créez des sessions interactives avec analyse IA, timer et interactions en live",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}

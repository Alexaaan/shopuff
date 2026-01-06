import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "shopuff",
  description: "Découvrez notre sélection de chichas. Stock en temps réel et contact direct.",
  themeColor: "#4CAF50",
  manifest: "/manifest.json",
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>
        {children}
      </body>
    </html>
  );
}

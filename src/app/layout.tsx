import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "shopuff | Chichas Cosmiques",
  description: "Découvrez notre sélection exclusive de chichas premium. Saveurs cosmiques et expériences uniques.",
  manifest: "/manifest.json",
  icons: {
    icon: "/logo.png",
  },
  openGraph: {
    title: "shopuff | Chichas Cosmiques",
    description: "Découvrez notre sélection exclusive de chichas premium",
    type: "website",
  },
};

export const viewport = {
  themeColor: "#8B5CF6",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Poppins:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}

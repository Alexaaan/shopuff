import type { Metadata, Viewport } from "next";
import { Inter, Fredoka, Poppins } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

// Optimisation des fonts avec Next.js
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const fredoka = Fredoka({
  subsets: ["latin"],
  variable: "--font-fredoka",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Shopuff - Saveurs Exclusives",
    template: "%s | Shopuff"
  },
  description: "Découvrez notre sélection exclusive. Saveurs garanties et expériences uniques.",
  keywords: ["shopuff", "saveurs", "exclusif", "expérience"],
  authors: [{ name: "Shopuff Team" }],
  creator: "Shopuff",
  publisher: "Shopuff",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "Shopuff - Saveurs Exclusives",
    description: "Découvrez notre sélection exclusive. Saveurs garanties et expériences uniques.",
    type: "website",
    locale: "fr_FR",
    siteName: "Shopuff",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shopuff - Saveurs Exclusives",
    description: "Découvrez notre sélection exclusive. Saveurs garanties et expériences uniques.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#8B5CF6" },
    { media: "(prefers-color-scheme: dark)", color: "#1e1b4b" },
  ],
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="fr"
      className={`${inter.variable} ${fredoka.variable} ${poppins.variable}`}
      suppressHydrationWarning
    >
      <body className="font-sans antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}

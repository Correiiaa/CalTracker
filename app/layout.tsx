import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap", // Otimização: evita bloqueio de renderização do texto
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "CalTracker - Contador de Calorias com IA",
    template: "%s | CalTracker"
  },
  description: "Monitorize as suas calorias e macronutrientes tirando apenas uma foto do seu prato. Simples, rápido e inteligente com a ajuda de Inteligência Artificial.",
  keywords: ["calorias", "contador de calorias", "nutrição", "dieta", "emagrecer", "ganhar massa", "IA", "inteligência artificial", "CalTracker", "tracker de comida"],
  authors: [{ name: "CalTracker Team" }],
  creator: "CalTracker Team",
  publisher: "CalTracker Team",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "CalTracker",
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "CalTracker - Contador de Calorias com IA",
    description: "Monitorize as suas calorias e macronutrientes tirando apenas uma foto do seu prato. Simples, rápido e inteligente.",
    siteName: "CalTracker",
    locale: "pt_PT",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CalTracker - Contador de Calorias com IA",
    description: "Monitorize as suas calorias e macronutrientes tirando apenas uma foto do seu prato. Simples, rápido e inteligente.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#09090b", // Corresponde ao fundo bg-zinc-950 no mobile
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-100">{children}</body>
    </html>
  );
}

import { GoogleAnalytics } from "@next/third-parties/google";
import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import localFont from "next/font/local";
import { Web3Provider } from "../providers/Web3Provider";
import "./globals.css";

const geistSans = localFont({
  src: "../fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "../fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["800"],
  variable: "--font-manrope",
});

const SITE_URL = "https://eternalmint.xyz";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Eternal Mint",
    template: "%s | Eternal Mint",
  },
  description:
    "Mint Once, Own Forever: Fully Decentralized, Eternally Accessible NFTs.",
  keywords: [
    "NFT",
    "Web3",
    "Blockchain",
    "Eternal Mint",
    "Decentralized",
    "Crypto",
    "Token",
    "Permanent",
    "Autonomys",
  ],
  applicationName: "Eternal Mint",
  authors: [{ name: "Marc-Aurèle Besner", url: "https://eternalmint.xyz" }],
  creator: "Marc-Aurèle Besner",
  publisher: "Eternal Mint",
  openGraph: {
    title: "Eternal Mint",
    description:
      "Mint Once, Own Forever: Fully Decentralized, Eternally Accessible NFTs.",
    images: [
      {
        url: "/share.png",
        width: 1200,
        height: 630,
        alt: "Eternal Mint — Decentralized NFT Minting",
      },
    ],
    url: SITE_URL,
    siteName: "Eternal Mint",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Eternal Mint",
    description:
      "Mint Once, Own Forever: Fully Decentralized, Eternally Accessible NFTs.",
    images: ["/share.png"],
    site: "@eternalmint_xyz",
    creator: "@marcaureleb",
  },
  alternates: {
    canonical: SITE_URL,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1, // no limit
      "max-image-preview": "large",
      "max-snippet": -1, // no limit
    },
  },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/site.webmanifest",
};

// Next.js 14+ requires themeColor to live on a separate `viewport` export.
export const viewport: Viewport = {
  themeColor: "#0b0b0d",
  colorScheme: "dark",
};

// Site-wide structured data. Surfaced to crawlers as a single JSON-LD block
// so search engines can recognise Eternal Mint as a real-world dapp + org.
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "Eternal Mint",
      url: SITE_URL,
      logo: `${SITE_URL}/images/EternalMint-LogoWithText.png`,
      sameAs: [
        "https://github.com/marc-aurele-besner/eternalmint-xyz",
        "https://github.com/marc-aurele-besner",
        "https://www.linkedin.com/in/marc-aurele-besner/",
        "https://x.com/marcaureleb",
        "https://x.com/eternalmint_xyz",
      ],
      founder: {
        "@type": "Person",
        name: "Marc-Aurèle Besner",
        url: "https://github.com/marc-aurele-besner",
      },
    },
    {
      "@type": "WebApplication",
      "@id": `${SITE_URL}/#app`,
      name: "Eternal Mint",
      url: SITE_URL,
      applicationCategory: "FinanceApplication",
      operatingSystem: "Any",
      description:
        "Mint Once, Own Forever: Fully Decentralized, Eternally Accessible NFTs on Autonomys.",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      creator: { "@id": `${SITE_URL}/#organization` },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID && (
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID} />
      )}
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </head>
      <body
        className={`bg-custom-bg bg-no-repeat bg-cover ${geistSans.variable} ${geistMono.variable} ${manrope.variable} antialiased`}
      >
        <Web3Provider>{children}</Web3Provider>
        <div className="h-[10px] bg-gradient-to-r from-[#1E58FC] via-[#D914E4] to-[#F10419]"></div>
      </body>
    </html>
  );
}

import { GoogleAnalytics } from "@next/third-parties/google";
import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "Eternal Mint",
  description:
    "Mint Once, Own Forever: Fully Decentralized, Eternally Accessible NFTs.",
  openGraph: {
    title: "Eternal Mint",
    description:
      "Mint Once, Own Forever: Fully Decentralized, Eternally Accessible NFTs.",
    images: ["/path/to/your/image.jpg"],
    url: "https://yourwebsite.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "Eternal Mint",
    description:
      "Mint Once, Own Forever: Fully Decentralized, Eternally Accessible NFTs.",
    images: ["/path/to/your/image.jpg"],
  },
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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Web3Provider>{children}</Web3Provider>
      </body>
    </html>
  );
}

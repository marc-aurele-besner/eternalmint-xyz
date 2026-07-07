import type { Metadata } from "next";
import { MyNftList } from "@/components/MyNftList";
import { PageShell } from "@/components/PageShell";
import { SITE_URL } from "@/config/app";

// Wallet-bound page: no public content to index and the address query varies
// per visitor, so we explicitly opt out of search-engine indexing.
export const metadata: Metadata = {
  title: "My NFTs",
  description:
    "Manage the NFTs you have minted on Eternal Mint — view balances and transfer tokens.",
  alternates: {
    canonical: `${SITE_URL}/my-nfts`,
  },
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function MyNftsPage() {
  return (
    <PageShell title="My NFTs">
      <MyNftList />
    </PageShell>
  );
}
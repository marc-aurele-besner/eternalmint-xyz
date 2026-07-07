import type { Metadata } from "next";
import { LatestNFTList } from "@/components/LatestNFTList";
import { PageShell } from "@/components/PageShell";
import { SITE_URL } from "@/config/app";
import { fetchAndMapNfts } from "@/lib/subgraph";

export const metadata: Metadata = {
  title: "Browse NFTs",
  description:
    "Discover the latest NFTs minted on Eternal Mint. Browse permanent, decentralized art stored on the Autonomys network.",
  keywords: [
    "browse NFTs",
    "discover NFTs",
    "Eternal Mint gallery",
    "Autonomys NFT gallery",
    "decentralized art",
  ],
  alternates: {
    canonical: `${SITE_URL}/browse`,
  },
  openGraph: {
    title: "Browse NFTs | Eternal Mint",
    description:
      "Discover the latest NFTs minted on Eternal Mint — permanently stored on the Autonomys network.",
    url: `${SITE_URL}/browse`,
  },
};

// Refresh the gallery every 5 minutes so newly minted NFTs surface without a
// redeploy.
export const revalidate = 300;

export default async function BrowsePage() {
  let nfts: Awaited<ReturnType<typeof fetchAndMapNfts>> = [];
  try {
    nfts = await fetchAndMapNfts({ limit: 24 });
  } catch (error) {
    console.error("Failed to load NFTs for browse", error);
  }

  return (
    <PageShell title="Browse NFTs">
      <LatestNFTList nfts={nfts} />
    </PageShell>
  );
}
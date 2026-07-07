import type { Metadata } from "next";
import { CreateNFTForm } from "../components/CreateNFTForm";
import { LatestNFTList } from "../components/LatestNFTList";
import { PageShell } from "../components/PageShell";
import { SITE_URL } from "@/config/app";
import { fetchAndMapNfts } from "@/lib/subgraph";

export const metadata: Metadata = {
  title: "Eternal Mint — Decentralized NFT Minting on Autonomys",
  description:
    "Mint permanent, decentralized NFTs on Autonomys. Eternal Mint stores your art on the Autonomys distributed storage network — never lost, always accessible, owned forever.",
  keywords: [
    "decentralized NFT minting",
    "permanent NFT storage",
    "Autonomys NFT",
    "Eternal Mint",
    "Web3 NFT platform",
    "on-chain NFT",
    "dStorage NFT",
    "crypto art",
  ],
  alternates: {
    canonical: `${SITE_URL}/`,
  },
  openGraph: {
    title: "Eternal Mint — Decentralized NFT Minting",
    description:
      "Mint permanent, decentralized NFTs on Autonomys. Owned forever, never lost.",
    url: `${SITE_URL}/`,
  },
};

// ISR: refresh the latest-NFT list every 5 minutes so freshly minted NFTs
// show up in search results without a redeploy.
export const revalidate = 300;

export default async function Home() {
  let latestNfts: Awaited<ReturnType<typeof fetchAndMapNfts>> = [];
  try {
    latestNfts = await fetchAndMapNfts({ limit: 10 });
  } catch (error) {
    // Subgraph outage should not blank the entire home page — log and render
    // the rest of the content with an empty latest list.
    console.error("Failed to load latest NFTs", error);
  }

  return (
    <PageShell>
      <section
        aria-labelledby="hero-heading"
        className="mx-auto max-w-4xl px-6 pt-2 pb-10 text-center"
      >
        <h1
          id="hero-heading"
          className="text-4xl sm:text-5xl font-manrope font-extrabold tracking-tight"
        >
          Mint Once, Own Forever
        </h1>
        <p className="mt-4 text-lg text-white/80">
          Eternal Mint is a fully decentralized NFT platform built on the
          Autonomys network. Every NFT you mint is stored on a distributed
          storage layer — your art stays online, censorship-resistant, and
          accessible for as long as the chain runs.
        </p>
        <p className="mt-3 text-base text-white/70">
          No central server. No takedowns. No broken links. Just your work,
          pinned to a permanent network you actually own.
        </p>
      </section>

      <CreateNFTForm />
      <LatestNFTList nfts={latestNfts} />

      <section
        aria-labelledby="faq-heading"
        className="mx-auto mt-16 max-w-3xl px-6 text-left"
      >
        <h2
          id="faq-heading"
          className="text-2xl font-bold mb-4 text-center"
        >
          Frequently Asked Questions
        </h2>
        <div className="space-y-6 text-white/80">
          <div>
            <h3 className="text-lg font-semibold text-white">
              What is Eternal Mint?
            </h3>
            <p className="mt-1">
              Eternal Mint is a decentralized NFT minting dapp. It mints ERC-1155
              tokens on Autonomys Chronos Auto EVM and pins both the image and
              metadata to the Autonomys distributed-storage network, so they
              remain permanently retrievable.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              How is my NFT stored permanently?
            </h3>
            <p className="mt-1">
              Each upload is content-addressed on Autonomys Auto-Drive, the
              network&rsquo;s distributed storage layer. The resulting CIDs are
              written into the on-chain NFT metadata, so anyone can resolve the
              asset directly from the token — no off-chain database required.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              Which network does Eternal Mint run on?
            </h3>
            <p className="mt-1">
              Smart contracts live on Autonomys Chronos Auto EVM. The Autonomys
              network uses a proof-of-storage consensus that incentivizes
              long-term data retention, making it ideal for permanent NFTs.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              Do I need to run my own node to view NFTs?
            </h3>
            <p className="mt-1">
              No. Anyone can browse, transfer, and view Eternal Mint NFTs through
              the public Autonomys gateway and the hosted subgraph — the same
              data that on-chain clients resolve.
            </p>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
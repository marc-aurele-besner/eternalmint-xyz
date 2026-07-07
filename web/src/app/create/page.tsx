import type { Metadata } from "next";
import { CreateNFTForm } from "@/components/CreateNFTForm";
import { PageShell } from "@/components/PageShell";
import { SITE_URL } from "@/config/app";

export const metadata: Metadata = {
  title: "Create Eternal NFTs",
  description:
    "Mint your own permanent NFT on Autonomys. Upload an image, add a name and description, and pin it to decentralized storage in seconds.",
  keywords: [
    "create NFT",
    "mint NFT",
    "Autonomys NFT minting",
    "permanent NFT storage",
    "decentralized NFT",
  ],
  alternates: {
    canonical: `${SITE_URL}/create`,
  },
  openGraph: {
    title: "Create Eternal NFTs | Eternal Mint",
    description:
      "Mint your own permanent NFT on Autonomys — stored on decentralized storage, owned forever.",
    url: `${SITE_URL}/create`,
  },
};

export default function CreatePage() {
  return (
    <PageShell>
      <CreateNFTForm />
    </PageShell>
  );
}
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NftContainer } from "@/components/NftContainer";
import { PageShell } from "@/components/PageShell";
import { SITE_URL } from "@/config/app";
import {
  fetchNftMetadata,
  mapNftMintedToNft,
  queryNftMintedByTokenId,
  queryNftMinteds,
} from "@/lib/subgraph";

interface PageParams {
  params: Promise<{ tokenId: string }>;
}

const truncate = (value: string, head: number, tail: number): string => {
  if (!value) return "";
  if (value.length <= head + tail) return value;
  return `${value.slice(0, head)}…${value.slice(-tail)}`;
};

/**
 * Build the per-NFT Metadata object from the on-chain record + resolved
 * metadata JSON. Returns a `notFound()`-equivalent (robots: noindex) when the
 * NFT cannot be resolved so search engines don't index broken detail pages.
 */
export const generateMetadata = async ({
  params,
}: PageParams): Promise<Metadata> => {
  const { tokenId } = await params;

  let nftMinted;
  try {
    nftMinted = await queryNftMintedByTokenId(tokenId);
  } catch {
    return {
      title: `NFT #${tokenId}`,
      robots: { index: false, follow: false },
    };
  }

  if (!nftMinted) {
    return {
      title: `NFT #${tokenId}`,
      robots: { index: false, follow: false },
    };
  }

  const nft = await mapNftMintedToNft(nftMinted);
  const title = `${nft.name} | Eternal Mint`;
  const description =
    nft.description && nft.description !== `Created by ${nft.creator}`
      ? nft.description
      : `${nft.name} — a permanent decentralized NFT minted on Eternal Mint.`;
  const canonical = `${SITE_URL}/nft/${tokenId}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "article",
      images: nft.image
        ? [{ url: nft.image, alt: nft.name }]
        : [{ url: "/share.png", alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: nft.image ? [nft.image] : ["/share.png"],
    },
  };
};

/**
 * Pre-render the most recent 50 NFTs at build time. Anything older or minted
 * after deploy is rendered on demand and cached via `revalidate`.
 */
export const generateStaticParams = async () => {
  try {
    const recent = await queryNftMinteds({ limit: 50 });
    return recent.map((n) => ({ tokenId: String(n.tokenId) }));
  } catch {
    return [];
  }
};

export const revalidate = 300;

const NFTDetailPage = async ({ params }: PageParams) => {
  const { tokenId } = await params;

  let nftMinted;
  try {
    nftMinted = await queryNftMintedByTokenId(tokenId);
  } catch (error) {
    console.error("Failed to load NFT detail", { tokenId, error });
    throw notFound();
  }

  if (!nftMinted) {
    throw notFound();
  }

  const nft = await mapNftMintedToNft(nftMinted);
  // Resolve metadata again here so we can render the raw `external_url`
  // alongside the placeholder fields the mapped NFT carries.
  const rawMetadata = await fetchNftMetadata(nft.cid);
  const externalUrl = rawMetadata?.external_url;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: nft.name,
    description: nft.description,
    image: nft.image || undefined,
    url: `${SITE_URL}/nft/${tokenId}`,
    identifier: nft.id,
    creator: {
      "@type": "Person",
      address: nft.creator,
    },
    dateCreated: new Date(
      Number(nftMinted.blockTimestamp) * 1000,
    ).toISOString(),
    contentUrl: nft.image || undefined,
    ...(externalUrl ? { mainEntityOfPage: externalUrl } : {}),
  };

  return (
    <PageShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article
        aria-labelledby="nft-heading"
        className="mx-auto max-w-3xl"
      >
        <h1
          id="nft-heading"
          className="text-3xl sm:text-4xl font-manrope font-extrabold text-center"
        >
          {nft.name}
        </h1>
        <p className="mt-2 text-center text-white/60 text-sm">
          Token ID #{tokenId} · Minted by {truncate(nft.creator, 6, 4)}
        </p>

        <div className="mt-8">
          <NftContainer nft={nft} />
        </div>

        {externalUrl && (
          <p className="mt-6 text-center text-sm">
            <a
              href={externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
            >
              External link
            </a>
          </p>
        )}

        <p className="mt-8 text-center text-sm text-white/60">
          <a
            href="/browse"
            className="hover:underline text-white/80 hover:text-white"
          >
            ← Back to all NFTs
          </a>
        </p>
      </article>
    </PageShell>
  );
};

export default NFTDetailPage;
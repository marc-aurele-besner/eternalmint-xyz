import type { MetadataRoute } from "next";
import { SITE_URL } from "@/config/app";

// Public routes listed for crawlers. Wallet-only routes (`/my-nfts`) are
// excluded — they're blocked by `robots.ts` and don't make sense to submit.
const PUBLIC_ROUTES: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}> = [
  { path: "/", changeFrequency: "daily", priority: 1 },
  { path: "/create", changeFrequency: "weekly", priority: 0.9 },
  { path: "/browse", changeFrequency: "hourly", priority: 0.9 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = PUBLIC_ROUTES.map(
    ({ path, changeFrequency, priority }) => ({
      url: `${SITE_URL}${path}`,
      lastModified: now,
      changeFrequency,
      priority,
    }),
  );

  // NFT detail pages — long-tail SEO surface for individual tokens. We
  // currently mint via the contract on Autonomys Chronos and index events in
  // The Graph; query that subgraph here so newly minted NFTs are discoverable
  // without a redeploy.
  const subgraphUrl = process.env.NEXT_PUBLIC_SUBGRAPH_API;
  let nftEntries: MetadataRoute.Sitemap = [];
  if (subgraphUrl) {
    try {
      const res = await fetch(subgraphUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `query RecentMints { nftMinteds(first: 100, orderBy: blockTimestamp, orderDirection: desc) { id tokenId blockTimestamp } }`,
        }),
        // Re-generate at most once per hour so we don't hammer the subgraph.
        next: { revalidate: 3600 },
      });
      if (res.ok) {
        const payload = (await res.json()) as {
          data?: {
            nftMinteds: Array<{
              id: string;
              tokenId: string;
              blockTimestamp: string;
            }>;
          };
        };
        nftEntries = (payload.data?.nftMinteds ?? []).map((nft) => ({
          url: `${SITE_URL}/nft/${nft.tokenId}`,
          lastModified: new Date(Number(nft.blockTimestamp) * 1000),
          changeFrequency: "weekly",
          priority: 0.6,
        }));
      }
    } catch {
      // Subgraph unreachable — fall back to the static routes only. Search
      // engines won't penalise us for missing recent mints.
    }
  }

  return [...staticEntries, ...nftEntries];
}
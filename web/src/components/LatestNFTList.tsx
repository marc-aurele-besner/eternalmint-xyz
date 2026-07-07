import { NFT } from "../types";
import { NftContainer } from "./NftContainer";

interface LatestNFTListProps {
  /** Pre-fetched NFTs (server components fetch via `fetchAndMapNfts`). */
  nfts: NFT[];
  /** Override the section heading. Defaults to "Latest NFTs Created". */
  heading?: string;
}

/**
 * Server-renderable list of the latest NFTs. Data is supplied via props so the
 * page can fetch on the server and ship fully-rendered HTML to crawlers /
 * first-paint users. Only the nested `NftContainer` is client-side because it
 * owns the transfer modal.
 */
export const LatestNFTList: React.FC<LatestNFTListProps> = ({
  nfts,
  heading = "Latest NFTs Created",
}) => {
  if (nfts.length === 0) {
    return (
      <section
        aria-labelledby="latest-nfts-heading"
        className="mt-8 mb-4"
      >
        <h2
          id="latest-nfts-heading"
          className="text-2xl font-bold mb-4"
        >
          {heading}
        </h2>
        <p className="text-white/70">
          No NFTs have been minted yet. Be the first to mint one on Eternal
          Mint.
        </p>
      </section>
    );
  }

  return (
    <section
      aria-labelledby="latest-nfts-heading"
      className="mt-8 mb-4"
    >
      <h2 id="latest-nfts-heading" className="text-2xl font-bold mb-4">
        {heading}
      </h2>
      <ul className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {nfts.map((nft) => (
          <NftContainer key={nft.id} nft={nft} />
        ))}
      </ul>
    </section>
  );
};
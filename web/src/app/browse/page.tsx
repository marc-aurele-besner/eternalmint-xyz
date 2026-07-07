import { LatestNFTList } from "@/components/LatestNFTList";
import { PageShell } from "@/components/PageShell";

export default function BrowsePage() {
  return (
    <PageShell title="Browse NFTs">
      <LatestNFTList />
    </PageShell>
  );
}

import { MyNftList } from "@/components/MyNftList";
import { PageShell } from "@/components/PageShell";

export default function MyNftsPage() {
  return (
    <PageShell title="My NFTs">
      <MyNftList />
    </PageShell>
  );
}

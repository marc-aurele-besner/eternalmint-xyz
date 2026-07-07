import { CreateNFTForm } from "../components/CreateNFTForm";
import { LatestNFTList } from "../components/LatestNFTList";
import { PageShell } from "../components/PageShell";

export default function Home() {
  return (
    <PageShell>
      <CreateNFTForm />
      <LatestNFTList />
    </PageShell>
  );
}

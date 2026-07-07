import { CreateNFTForm } from "../components/CreateNFTForm";
import { LatestNFTList } from "../components/LatestNFTList";
import { PageShell } from "../components/PageShell";

export default function Home() {
  return (
    <PageShell className="min-h-screen p-4 pb-12 sm:px-40 text-white">
      <CreateNFTForm />
      <LatestNFTList />
    </PageShell>
  );
}

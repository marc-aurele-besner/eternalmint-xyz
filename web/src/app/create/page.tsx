import { CreateNFTForm } from "@/components/CreateNFTForm";
import { PageShell } from "@/components/PageShell";

export default function CreatePage() {
  return (
    <PageShell title="Create Eternal NFTs">
      <CreateNFTForm />
    </PageShell>
  );
}

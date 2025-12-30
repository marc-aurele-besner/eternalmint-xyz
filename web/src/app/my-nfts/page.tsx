import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { MyNftList } from "@/components/MyNftList";

export default function MyNftsPage() {
  return (
    <div className="min-h-screen p-8 pb-20 sm:p-20 text-white">
      <Header />
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold">My NFTs</h1>
      </div>
      <MyNftList />
      <Footer />
    </div>
  );
}

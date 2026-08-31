import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import "@/styles/studio.css";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="studio min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

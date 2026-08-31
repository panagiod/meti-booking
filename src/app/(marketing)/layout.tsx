import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { LocaleProvider } from "@/components/providers/locale-provider";
import "@/styles/studio.css";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LocaleProvider>
      <div className="studio min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </LocaleProvider>
  );
}

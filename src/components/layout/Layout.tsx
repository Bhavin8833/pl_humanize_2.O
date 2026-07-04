import { Navbar } from "./Navbar";
import { MobileNav } from "./MobileNav";
import { Footer } from "./Footer";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden w-full relative">
      <Navbar />
      <main className="flex-1 pt-14 md:pt-16 pb-20 md:pb-0 w-full">
        {children}
      </main>
      <Footer />
      <MobileNav />
    </div>
  );
}

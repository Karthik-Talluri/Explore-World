import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "Explore World | Premium Escorted Tour Packages",
  description: "Your gateway to luxury escorted tour packages, domestic and international holiday travel itineraries worldwide.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        <AppProvider>
          <Navbar />
          <main className="flex-grow flex flex-col">
            {children}
          </main>
          <Footer />
        </AppProvider>
      </body>
    </html>
  );
}

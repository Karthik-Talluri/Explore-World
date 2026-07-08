import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import ClientLayoutWrapper from "@/components/ClientLayoutWrapper";

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
          <ClientLayoutWrapper>
            {children}
          </ClientLayoutWrapper>
        </AppProvider>
      </body>
    </html>
  );
}

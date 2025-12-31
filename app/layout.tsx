import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "Personal OS",
  description: "A one-stop shop for work and personal tracking",
};

import { NextAuthProvider } from "@/components/providers/NextAuthProvider";

import { BackgroundBlobs } from "@/components/ui/BackgroundBlobs";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${outfit.variable} font-sans`}>
        <NextAuthProvider>
          <div className="min-h-screen bg-background text-white selection:bg-primary/30 relative">
            <BackgroundBlobs />
            <Navbar />
            <main className="pt-20 px-4 md:px-6 max-w-7xl mx-auto h-full min-h-screen">
              {children}
            </main>
          </div>
        </NextAuthProvider>
      </body>
    </html>
  );
}

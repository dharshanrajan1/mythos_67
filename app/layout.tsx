import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { NextAuthProvider } from "@/components/providers/NextAuthProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { ParticleBackground } from "@/components/ui/ParticleBackground";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Personal OS",
  description: "A one-stop shop for work and personal tracking",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${plusJakartaSans.variable} font-sans`} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          <NextAuthProvider>
            <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 relative">
              <ParticleBackground />
              <main className="px-4 md:px-6 max-w-7xl mx-auto min-h-screen pb-28 pt-8">
                {children}
              </main>
              <Navbar />
            </div>
          </NextAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

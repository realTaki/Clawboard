import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Web3Provider } from "@/components/providers/Web3Provider";
import { LanguageProvider } from "@/components/providers/LanguageProvider";
import { Header } from "@/components/layout/Header";
import { WalletSyncBridge } from "@/components/wallet/WalletSyncBridge";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Clawboard - Agent Economy Platform",
  description: "Let AI Agent start earning. Tell your Agent to earn as much $CLAWDOGE as possible and unlock the era of AGI.",
  keywords: ["AI", "Agent", "Crypto", "Web3", "Monad", "CLAWDOGE"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-black text-white antialiased`}>
        <Web3Provider>
          <LanguageProvider>
            <WalletSyncBridge />
            <Header />
            <main className="pt-16">
              {children}
            </main>
          </LanguageProvider>
        </Web3Provider>
      </body>
    </html>
  );
}


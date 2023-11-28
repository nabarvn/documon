import "./globals.css";
import { Inter } from "next/font/google";
import { cn, constructMetadata } from "@/lib/utils";
import { Navbar, Providers } from "@/components";
import { Toaster } from "@/components/ui";

import "simplebar-react/dist/simplebar.min.css";
import "react-loading-skeleton/dist/skeleton.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = constructMetadata();

export const viewport = {
  themeColor: "#FFF",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en' className='light'>
      <body
        className={cn(
          "min-h-screen font-sans antialiased grainy",
          inter.className
        )}
      >
        <Providers>
          <Navbar />
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}

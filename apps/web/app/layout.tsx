import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CafeAtlas AI",
  description: "Discover specialty coffees, producers, and farms through a FastAPI-backed catalog.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full bg-background text-foreground">
        <Script id="theme-init" strategy="beforeInteractive">
          {`
            (function () {
              try {
                var stored = window.localStorage.getItem("cafeatlas-theme");
                var theme = stored === "dark" || stored === "light"
                  ? stored
                  : (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
                document.documentElement.dataset.theme = theme;
                document.documentElement.style.colorScheme = theme;
              } catch (error) {}
            })();
          `}
        </Script>
        <div className="flex min-h-screen flex-col">
          <SiteHeader />
          <div className="flex-1">{children}</div>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}

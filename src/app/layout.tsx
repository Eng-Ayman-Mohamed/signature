import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { AlertModal } from "@/components/ui/alert-modal";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Signature - Your Professional Portfolio Builder",
  description: "Create stunning, personality-based portfolios that showcase your unique professional identity. Built with Next.js, TypeScript, and modern design principles.",
  keywords: ["Portfolio", "Signature", "Professional", "Next.js", "TypeScript", "Tailwind CSS", "shadcn/ui", "React"],
  authors: [{ name: "Signature Team" }],
  icons: {
    icon: [
      { url: "/favicon-generated.png", sizes: "1024x1024", type: "image/png" },
      { url: "/logo.png", sizes: "1024x1024", type: "image/png" },
    ],
    apple: "/logo.png",
  },
  openGraph: {
    title: "Signature",
    description: "Your professional portfolio builder - create stunning, personality-based portfolios",
    url: "https://signature.app",
    siteName: "Signature",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Signature",
    description: "Your professional portfolio builder",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
          <AlertModal />
        </ThemeProvider>
      </body>
    </html>
  );
}


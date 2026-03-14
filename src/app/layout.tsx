import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Cairo } from "next/font/google";
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { cookies } from 'next/headers';
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

// Cairo font for Arabic - only loads when needed
const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  display: "swap", // Prevent layout shift
  weight: ["400", "500", "600", "700"],
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

// RTL locales
const RTL_LOCALES = ['ar'];

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Get locale from cookies or use default
  const cookieStore = await cookies();
  const savedLocale = cookieStore.get('NEXT_LOCALE')?.value || 'en';
  const locale = savedLocale;
  
  // Determine if RTL
  const isRTL = RTL_LOCALES.includes(locale);
  const dir = isRTL ? 'rtl' : 'ltr';
  
  // Get messages for the locale
  const messages = await getMessages();

  return (
    <html 
      lang={locale} 
      dir={dir} 
      suppressHydrationWarning
      className={isRTL ? cairo.variable : ''}
    >
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${isRTL ? 'font-cairo' : ''} antialiased bg-background text-foreground`}
      >
        <NextIntlClientProvider messages={messages}>
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
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

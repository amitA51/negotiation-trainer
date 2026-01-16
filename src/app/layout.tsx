import type { Metadata, Viewport } from "next";
import { Heebo } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const heebo = Heebo({
  variable: "--font-heebo",
  subsets: ["hebrew", "latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "NEGO - מאמן משא ומתן מקצועי",
    template: "%s | NEGO",
  },
  description: "כלי מקצועי ללימוד ותרגול משא ומתן. שפר את יכולות המשא ומתן שלך עם אימון AI אינטראקטיבי, ייעוץ אישי בזמן אמת וניתוח טכניקות מתקדם.",
  keywords: ["משא ומתן", "אימון", "טכניקות", "negotiation", "training", "AI", "לימוד", "עסקים", "משכורת"],
  authors: [{ name: "NEGO" }],
  creator: "NEGO Team",
  publisher: "NEGO",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "NEGO",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "he_IL",
    url: "https://negotiation-trainer-rust.vercel.app",
    title: "NEGO - מאמן משא ומתן מקצועי",
    description: "כלי מקצועי ללימוד ותרגול משא ומתן. אימון עם AI וייעוץ אישי.",
    siteName: "NEGO",
    images: [
      {
        url: "/icons/icon-512.png",
        width: 512,
        height: 512,
        alt: "NEGO Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "NEGO - מאמן משא ומתן מקצועי",
    description: "שפר את יכולות המשא ומתן שלך עם אימון AI אינטראקטיבי.",
    images: ["/icons/icon-512.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#08080A" },
    { media: "(prefers-color-scheme: light)", color: "#FAFAFA" },
  ],
  colorScheme: "dark light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl" className="dark" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icons/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <link rel="mask-icon" href="/icons/icon.svg" color="#C9A227" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="format-detection" content="telephone=no" />
        {/* Register service worker */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js')
                    .then(reg => console.log('SW registered'))
                    .catch(err => console.log('SW failed:', err));
                });
              }
            `,
          }}
        />
      </head>
      <body className={`${heebo.variable} font-sans antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}

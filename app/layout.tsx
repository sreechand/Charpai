import type { Metadata } from "next";
import type { ReactNode } from "react";

import { Providers } from "@/app/providers";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://charpai.sreechand.pm"),
  title: "Charpai",
  description: "Turn a family interview recording into an editable keepsake storybook PDF.",
  openGraph: {
    type: "website",
    siteName: "Charpai",
    images: [{
      url: "/landing/charpai-link-preview.png",
      width: 601,
      height: 161,
      type: "image/png",
      alt: "Charpai — a woven charpai above the word charpai"
    }]
  },
  twitter: {
    card: "summary_large_image",
    images: [{
      url: "/landing/charpai-link-preview.png",
      alt: "Charpai — a woven charpai above the word charpai"
    }]
  }
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

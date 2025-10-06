import { DM_Mono, Rethink_Sans } from "next/font/google";

import type { Metadata } from "next";

import "./globals.css";

const dmMono = DM_Mono({
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["300", "400", "500"],
});

const rethinkSans = Rethink_Sans({
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "CDP Next.js StarterKit",
  description: "The CDP Next.js StarterKit",
};

/**
 * Root layout for the Next.js app
 *
 * @param props - { object } - The props for the RootLayout component
 * @param props.children - { React.ReactNode } - The children to wrap
 * @returns The wrapped children
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${dmMono.className} ${rethinkSans.className}`}>
      <body>
        <div className="root">{children}</div>
      </body>
    </html>
  );
}

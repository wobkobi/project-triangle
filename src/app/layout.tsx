// File: src/app/layout.tsx

import cn from "@/utils/cn";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import React from "react";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Triangle Map App",
  description:
    "An interactive map to manage addresses and compute central locations",
};

/**
 * RootLayout component: wraps every page in <html> and <body>, applying the Inter font.
 * @param params - Props object
 * @param params.children - The page’s content to render inside <body>
 * @returns The HTML structure with head metadata and children inside <body>
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <html lang="en">
      <body className={cn(inter.className)} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}

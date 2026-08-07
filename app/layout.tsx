import type { Metadata } from "next";
import { Geist } from "next/font/google";

import "./globals.css";

// next/font self-hosts the files at build time, so there is no request to
// Google's servers at runtime and no layout shift while the font loads.
const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

export const metadata: Metadata = {
  title: "Task Tracker — stay organised, get things done",
  description:
    "A task tracker built with Next.js: add, complete, filter and delete tasks, with everything saved in your browser.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // The theme is applied to <html> after mount, so React is told not to warn
    // about the attribute differing from the server-rendered markup.
    <html lang="en" className={geist.variable} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}

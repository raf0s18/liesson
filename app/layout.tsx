import type { Metadata, Viewport } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "Liesson — Catch the lie", description: "Micro-lessons with deliberate errors to catch.", manifest: "/manifest.webmanifest" };
export const viewport: Viewport = { themeColor: "#f45d48" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }

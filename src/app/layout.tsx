import type { Metadata } from "next";
import Link from "next/link";
import styles from "./layout.module.css";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Pokédex Resource Explorer",
  description: "Search, filter, sort, and favorite Pokémon using the PokéAPI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <header className={styles.header}>
          <nav className={styles.nav} aria-label="Primary">
            <Link href="/" className={styles.brand} aria-label="Go to home">
              Pokédex
            </Link>
            <div className={styles.navLinks}>
              <Link href="/pokemon" className={styles.navLink}>Pokémon</Link>
              <Link href="/favorites" className={styles.navLink}>Favorites</Link>
            </div>
          </nav>
        </header>
        <main className={styles.main}>{children}</main>
      </body>
    </html>
  );
}

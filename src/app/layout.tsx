/**
 * Root Layout Component
 * 
 * This is the main layout component that wraps all pages in the application.
 * It includes the header with navigation, search bar, and provides the modal slot
 * for intercepting routes. The layout uses CSS modules for styling and includes
 * Google Fonts (Geist Sans and Mono) for typography.
 */

"use client";
import Link from "next/link";
import Image from "next/image";
import styles from "./layout.module.css";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";
import SearchBar from "./search-bar";
import { ErrorBoundary } from "./components/ErrorBoundary";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/pokeball.svg" type="image/svg+xml" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <header className={styles.header}>
          <nav className={styles.nav} aria-label="Primary">
            <Link href="/" className={styles.brand} aria-label="Go to home">
              <Image 
                src="/pokeball.svg" 
                alt="Pokeball" 
                width={24} 
                height={24} 
                className={styles.brandIcon}
              />
              Pokédex Resource Explorer
            </Link>
            <Suspense fallback={<div className={styles.searchWrap}><span className={styles.searchIcon}>🔍</span><input placeholder="Search Pokémon..." className={styles.search} disabled /></div>}>
              <SearchBar />
            </Suspense>
          </nav>
        </header>
        <ErrorBoundary>
          <main className={styles.main}>{children}</main>
          {modal}
        </ErrorBoundary>
      </body>
    </html>
  );
}

"use client";
/**
 * Scroll Restoration Hook
 * 
 * This custom hook manages scroll position preservation for back/forward navigation.
 * It stores scroll positions in sessionStorage and restores them when users navigate
 * back to previously visited pages, providing a better user experience.
 * 
 * Features:
 * - Automatic scroll position saving on navigation
 * - Scroll restoration on back/forward navigation
 * - SessionStorage persistence across page reloads
 * - Cleanup on component unmount
 */

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function useScrollRestoration() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const scrollPositionRef = useRef<{ [key: string]: number }>({});
  const isRestoringRef = useRef(false);

  // Create a unique key for the current page state
  const pageKey = `${pathname}?${searchParams.toString()}`;

  useEffect(() => {
    // Load saved scroll positions from sessionStorage
    const savedPositions = sessionStorage.getItem("scrollPositions");
    if (savedPositions) {
      try {
        scrollPositionRef.current = JSON.parse(savedPositions);
      } catch {
        scrollPositionRef.current = {};
      }
    }

    // Restore scroll position for current page
    const savedPosition = scrollPositionRef.current[pageKey];
    if (savedPosition && !isRestoringRef.current) {
      isRestoringRef.current = true;
      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        window.scrollTo(0, savedPosition);
        isRestoringRef.current = false;
      });
    }
  }, [pageKey]);

  useEffect(() => {
    const saveScrollPosition = () => {
      if (!isRestoringRef.current) {
        scrollPositionRef.current[pageKey] = window.scrollY;
        sessionStorage.setItem("scrollPositions", JSON.stringify(scrollPositionRef.current));
      }
    };

    // Save scroll position before navigation
    const handleBeforeUnload = () => {
      saveScrollPosition();
    };

    // Save scroll position on scroll (debounced)
    let scrollTimeout: NodeJS.Timeout;
    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(saveScrollPosition, 100);
    };

    // Listen for navigation events
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Listen for popstate events (back/forward navigation)
    const handlePopState = () => {
      // Small delay to ensure the page has loaded
      setTimeout(() => {
        const savedPosition = scrollPositionRef.current[pageKey];
        if (savedPosition) {
          isRestoringRef.current = true;
          requestAnimationFrame(() => {
            window.scrollTo(0, savedPosition);
            isRestoringRef.current = false;
          });
        }
      }, 100);
    };

    // Listen for route changes (including modal navigation)
    const handleRouteChange = () => {
      // Save current position before any route change
      saveScrollPosition();
    };

    // Listen for intercepting route navigation
    const handleInterceptingRoute = () => {
      // When navigating to a Pokemon detail page, save current position
      const currentPath = window.location.pathname;
      if (currentPath.includes('/pokemon/') && currentPath !== '/pokemon') {
        saveScrollPosition();
      }
    };

    window.addEventListener("popstate", handlePopState);
    window.addEventListener("beforeunload", handleRouteChange);
    window.addEventListener("click", handleInterceptingRoute);

    return () => {
      clearTimeout(scrollTimeout);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("beforeunload", handleRouteChange);
      window.removeEventListener("click", handleInterceptingRoute);
      saveScrollPosition(); // Save on cleanup
    };
  }, [pageKey]);

  // Function to manually save current scroll position
  const saveCurrentPosition = () => {
    scrollPositionRef.current[pageKey] = window.scrollY;
    sessionStorage.setItem("scrollPositions", JSON.stringify(scrollPositionRef.current));
  };

  // Function to scroll to top (useful for new searches)
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return {
    saveCurrentPosition,
    scrollToTop,
  };
}

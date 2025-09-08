"use client";
/**
 * Focus Management Hook
 * 
 * This custom hook manages focus preservation and restoration for navigation.
 * It ensures that when users navigate back from detail pages, the focus returns
 * to the appropriate element (like the Pokemon card they clicked on).
 * 
 * Features:
 * - Focus preservation on navigation
 * - Automatic focus restoration on back navigation
 * - Keyboard navigation support
 * - Accessibility compliance
 */

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export function useFocusManagement() {
  const pathname = usePathname();
  const lastFocusedElementRef = useRef<string | null>(null);
  const focusTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    // Save the currently focused element's identifier
    const saveFocusedElement = () => {
      const activeElement = document.activeElement;
      if (activeElement && activeElement.id) {
        lastFocusedElementRef.current = activeElement.id;
        sessionStorage.setItem("lastFocusedElement", activeElement.id);
      } else if (activeElement) {
        // Try to find a data attribute or other identifier
        const dataId = activeElement.getAttribute("data-focus-id");
        if (dataId) {
          lastFocusedElementRef.current = dataId;
          sessionStorage.setItem("lastFocusedElement", dataId);
        }
      }
    };

    // Restore focus to previously focused element
    const restoreFocus = () => {
      const savedFocusId = sessionStorage.getItem("lastFocusedElement");
      if (savedFocusId) {
        // Clear the timeout if it exists
        if (focusTimeoutRef.current) {
          clearTimeout(focusTimeoutRef.current);
        }

        // Use a timeout to ensure DOM is ready
        focusTimeoutRef.current = setTimeout(() => {
          let elementToFocus = document.getElementById(savedFocusId);
          
          // If not found by ID, try data-focus-id
          if (!elementToFocus) {
            elementToFocus = document.querySelector(`[data-focus-id="${savedFocusId}"]`);
          }

          if (elementToFocus && typeof elementToFocus.focus === "function") {
            elementToFocus.focus();
            // Clear the saved focus after successful restoration
            sessionStorage.removeItem("lastFocusedElement");
            lastFocusedElementRef.current = null;
          }
        }, 100);
      }
    };

    // Save focus when navigating away
    const handleBeforeUnload = () => {
      saveFocusedElement();
    };

    // Restore focus when returning to a page
    if (pathname.includes("/pokemon") && !pathname.includes("/pokemon/")) {
      // We're on the Pokemon list page, try to restore focus
      restoreFocus();
    }

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      if (focusTimeoutRef.current) {
        clearTimeout(focusTimeoutRef.current);
      }
    };
  }, [pathname]);

  // Function to manually set focus identifier for an element
  const setFocusId = (element: HTMLElement, id: string) => {
    element.setAttribute("data-focus-id", id);
  };

  // Function to manually save current focus
  const saveCurrentFocus = () => {
    const activeElement = document.activeElement;
    if (activeElement && activeElement.id) {
      lastFocusedElementRef.current = activeElement.id;
      sessionStorage.setItem("lastFocusedElement", activeElement.id);
    }
  };

  return {
    setFocusId,
    saveCurrentFocus,
  };
}

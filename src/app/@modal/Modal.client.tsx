"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./modal.module.css";

type ModalProps = {
  children: React.ReactNode;
};

export default function Modal({ children }: ModalProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isClosing, setIsClosing] = useState(false);
  const router = useRouter();

  const handleClose = useCallback(() => {
    setIsClosing(true);
    // Wait for fade-out animation to complete
    setTimeout(() => {
      setIsVisible(false);
      // Restore scroll position before navigating back
      const savedPositions = sessionStorage.getItem("scrollPositions");
      if (savedPositions) {
        try {
          const positions = JSON.parse(savedPositions);
          const currentPath = window.location.pathname + window.location.search;
          const savedPosition = positions[currentPath];
          if (savedPosition) {
            // Restore scroll position after navigation
            setTimeout(() => {
              window.scrollTo(0, savedPosition);
            }, 300);
          }
        } catch {
          // Ignore parsing errors
        }
      }
      router.back();
    }, 200); // Match the CSS animation duration
  }, [router]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (target.classList.contains(styles.backdrop)) {
        handleClose();
      }
    };

    // Calculate scrollbar width to prevent layout shift
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    
    // Prevent body scroll and maintain scrollbar space
    document.body.classList.add("modalOpen");
    document.documentElement.style.setProperty("--scrollbar-width", `${scrollbarWidth}px`);

    document.addEventListener("keydown", handleEscape);
    document.addEventListener("click", handleClickOutside);

    return () => {
      // Restore body scroll
      document.body.classList.remove("modalOpen");
      document.documentElement.style.removeProperty("--scrollbar-width");
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("click", handleClickOutside);
    };
  }, [handleClose]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className={`${styles.backdrop} ${isClosing ? styles.closing : ''}`}>
      <div className={`${styles.modal} ${isClosing ? styles.closing : ''}`}>
        <button className={styles.closeButton} onClick={handleClose} aria-label="Close">
          ×
        </button>
        {children}
      </div>
    </div>
  );
}

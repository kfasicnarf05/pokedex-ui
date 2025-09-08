"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./modal.module.css";

type ModalProps = {
  children: React.ReactNode;
  onClose: () => void;
};

export default function Modal({ children, onClose }: ModalProps) {
  const [isVisible, setIsVisible] = useState(true);
  const router = useRouter();

  const handleClose = useCallback(() => {
    setIsVisible(false);
    // Small delay to allow animation
    setTimeout(() => {
      router.back();
    }, 150);
  }, [router]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains(styles.backdrop)) {
        handleClose();
      }
    };

    // Prevent body scroll
    document.body.style.overflow = "hidden";

    document.addEventListener("keydown", handleEscape);
    document.addEventListener("click", handleClickOutside);

    return () => {
      document.body.style.overflow = "unset";
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("click", handleClickOutside);
    };
  }, [handleClose]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className={`${styles.backdrop} ${isVisible ? styles.visible : styles.hidden}`}>
      <div className={styles.modal}>
        <button className={styles.closeButton} onClick={handleClose} aria-label="Close">
          ×
        </button>
        {children}
      </div>
    </div>
  );
}

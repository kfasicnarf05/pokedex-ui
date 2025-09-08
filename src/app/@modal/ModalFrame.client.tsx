"use client";
import { PropsWithChildren, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./modal.module.css";

type ModalFrameProps = PropsWithChildren<{
  onRequestCloseHref: string;
}>;

export default function ModalFrame({ children, onRequestCloseHref }: ModalFrameProps) {
  const router = useRouter();
  const [visible, setVisible] = useState(true);
  const [isClosing, setIsClosing] = useState(false);

  const close = useCallback(() => {
    if (isClosing) return; // Prevent double-clicks
    
    setIsClosing(true);
    setVisible(false);
    
    // Navigate after animation completes
    setTimeout(() => {
      router.replace(onRequestCloseHref);
    }, 150);
  }, [onRequestCloseHref, router, isClosing]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    
    // Prevent body scroll when modal is open
    document.body.style.overflow = "hidden";
    
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "unset";
    };
  }, [close]);

  return (
    <div 
      className={`${styles.backdrop} ${!visible ? styles.closing : ''}`} 
      aria-hidden={!visible}
    >
      <div className={styles.scrim} onClick={close} />
      <div className={`${styles.modal} ${!visible ? styles.modalClosing : ''}`} role="dialog" aria-modal="true">
        {children}
      </div>
    </div>
  );
}



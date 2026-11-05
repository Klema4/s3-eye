import { ReactNode, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./Popover.module.css";

interface Props {
  anchor: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  align?: "start" | "end";
  matchWidth?: boolean;
  role?: string;
  labelledBy?: string;
}

interface Box {
  top: number;
  left: number;
  width?: number;
}

export function Popover({
  anchor,
  open,
  onClose,
  children,
  align = "end",
  matchWidth = false,
  role = "menu",
  labelledBy,
}: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState<Box | null>(null);

  useLayoutEffect(() => {
    if (!open || !anchor) return;

    const place = () => {
      if (!anchor.isConnected) {
        onClose();
        return;
      }
      const rect = anchor.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) {
        onClose();
        return;
      }
      const panel = panelRef.current;
      const width = matchWidth ? rect.width : (panel?.offsetWidth ?? 160);
      const height = panel?.offsetHeight ?? 0;
      const gap = 8;
      let top = rect.bottom + gap;
      if (height > 0 && top + height > window.innerHeight - gap) {
        top = Math.max(gap, rect.top - gap - height);
      }
      let left = align === "end" ? rect.right - width : rect.left;
      left = Math.min(Math.max(gap, left), window.innerWidth - width - gap);
      setBox({ top, left, width: matchWidth ? rect.width : undefined });
    };

    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [align, anchor, matchWidth, onClose, open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    const onPointer = (event: MouseEvent) => {
      const target = event.target as Node;
      if (panelRef.current?.contains(target) || anchor?.contains(target)) return;
      onClose();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onPointer);
    };
  }, [anchor, onClose, open]);

  if (!open || !anchor) return null;

  return createPortal(
    <div
      ref={panelRef}
      className={styles.panel}
      role={role}
      aria-labelledby={labelledBy}
      style={{
        top: box?.top ?? -9999,
        left: box?.left ?? 0,
        width: box?.width,
        visibility: box ? "visible" : "hidden",
      }}
    >
      {children}
    </div>,
    document.body,
  );
}

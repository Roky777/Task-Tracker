"use client";

import { useEffect, type ReactNode } from "react";

import { CloseIcon } from "./Icons";

type DrawerProps = {
  title: string;
  side: "left" | "right";
  onClose: () => void;
  children: ReactNode;
};

/**
 * Slide-in panel used for both the date menu and the filters. Shared so the two
 * behave identically: Escape closes, clicking the backdrop closes, and the page
 * behind cannot scroll while one is open.
 */
export default function Drawer({
  title,
  side,
  onClose,
  children,
}: DrawerProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return (
    <div className="scrim" onClick={onClose} role="presentation">
      <div
        className={`drawer ${side}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        // Without this, a click inside the panel would bubble to the backdrop
        // and close the drawer immediately.
        onClick={(event) => event.stopPropagation()}>
        <header className="drawer-head">
          <h2>{title}</h2>
          <button
            type="button"
            className="row-button"
            onClick={onClose}
            aria-label="Close">
            <CloseIcon size={18} />
          </button>
        </header>

        <div className="drawer-body">{children}</div>
      </div>
    </div>
  );
}

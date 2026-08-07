"use client";

import { useEffect, type ReactNode } from "react";

import { CloseIcon } from "./Icons";

type ModalProps = {
  title: string;
  onClose: () => void;
  children: ReactNode;
};

/**
 * Shared dialog shell. Handles the two things every modal needs and everyone
 * forgets: Escape to close, and not letting the page scroll behind it.
 */
export default function Modal({ title, onClose, children }: ModalProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // The cleanup runs when the modal unmounts, restoring both the listener and
    // the original scroll behaviour.
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return (
    <div
      className="modal-backdrop"
      // Clicking the backdrop closes; clicks inside the panel must not bubble
      // up to it, hence the stopPropagation below.
      onClick={onClose}
      role="presentation">
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}>
        <header className="modal-head">
          <h2>{title}</h2>
          <button
            type="button"
            className="icon-button ghost"
            onClick={onClose}
            aria-label="Close dialog">
            <CloseIcon size={17} />
          </button>
        </header>

        {children}
      </div>
    </div>
  );
}

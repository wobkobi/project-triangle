import cn from "@/utils/cn";
import React, { useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

/**
 * Modal component: renders a full-screen overlay with centered content.
 * Closes on click outside or pressing the Escape key.
 * @param root0 - Props object
 * @param root0.isOpen - Whether the modal is currently open
 * @param root0.onClose - Callback to close the modal
 * @param root0.children - The content to display inside the modal
 * @returns The modal JSX element (or null if not open)
 */
export default function Modal({
  isOpen,
  onClose,
  children,
}: ModalProps): JSX.Element | null {
  // Close on Escape key
  useEffect(() => {
    /**
     * Handle keydown events and close on Escape.
     * @param e - Keyboard event
     */
    function handleKeyDown(e: KeyboardEvent): void {
      if (e.key === "Escape") {
        onClose();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div
      // Overlay
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      )}
      onClick={onClose}
      role="presentation">
      <div
        // Prevent clicks inside the modal from closing it
        className={cn(
          "relative mx-4 w-full max-w-lg rounded-lg bg-white p-6 shadow-lg"
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(e) => e.stopPropagation()}>
        <div className={cn("flex justify-end")}>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className={cn(
              "text-gray-500 hover:text-gray-700 focus:outline-none"
            )}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={cn("h-6 w-6")}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L12 10.586l6.293-6.293a1 1 0 111.414 1.414L13.414 12l6.293 6.293a1 1 0 01-1.414 1.414L12 13.414l-6.293 6.293a1 1 0 01-1.414-1.414L10.586 12 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
        <div className={cn("mt-4")}>{children}</div>
      </div>
    </div>
  );
}

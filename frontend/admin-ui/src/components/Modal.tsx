import { useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import type { ReactNode, MouseEvent } from "react";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  closeOnOverlayClick?: boolean;
  sizeClassName?: string;
  className?: string;
}

const cn = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

const defaultSize = "max-w-lg";

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  closeOnOverlayClick = true,
  sizeClassName = defaultSize,
  className,
}: ModalProps) {
  const portalTarget = useMemo(() => {
    if (typeof document === "undefined") {
      return null;
    }
    return document.body;
  }, []);

  useEffect(() => {
    if (!open || !portalTarget) {
      return;
    }

    const previousOverflow = portalTarget.style.overflow;
    portalTarget.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      portalTarget.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose, portalTarget]);

  if (!open || !portalTarget) {
    return null;
  }

  const handleOverlayClick = (event: MouseEvent<HTMLDivElement>) => {
    if (!closeOnOverlayClick) {
      return;
    }

    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-950/60"
        onClick={handleOverlayClick}
        role="presentation"
      />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "relative z-10 w-full overflow-hidden rounded-2xl bg-white shadow-2xl",
          sizeClassName,
          className,
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-4">
          <div className="flex flex-col gap-1">
            {title ? <h2 className="text-lg font-semibold text-slate-900">{title}</h2> : null}
            {description ? <p className="text-sm text-slate-600">{description}</p> : null}
          </div>
          <button
            type="button"
            className="rounded-full p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
            onClick={onClose}
            aria-label="Close modal"
          >
            <span aria-hidden="true" className="text-xl leading-none">
              &times;
            </span>
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
        {footer ? <div className="border-t border-slate-200 px-6 py-4">{footer}</div> : null}
      </div>
    </div>,
    portalTarget,
  );
}

export default Modal;

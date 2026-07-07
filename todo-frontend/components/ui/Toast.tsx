"use client";

import { useEffect } from "react";

interface ToastProps {
  message: string;
  onClose: () => void;
  variant?: "success" | "error";
}

const TOAST_STYLES = {
  success: {
    container: "border-emerald-200 bg-emerald-50 text-emerald-800",
    iconWrapper: "bg-emerald-100 text-emerald-700",
    iconPath: "M5 13l4 4L19 7",
    title: "Thành công",
    button: "text-emerald-700 hover:text-emerald-900",
  },
  error: {
    container: "border-rose-200 bg-rose-50 text-rose-800",
    iconWrapper: "bg-rose-100 text-rose-700",
    iconPath:
      "M12 8v4m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4c-.77-1.33-2.69-1.33-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z",
    title: "Có lỗi xảy ra",
    button: "text-rose-700 hover:text-rose-900",
  },
} as const;

export function Toast({ message, onClose, variant = "success" }: ToastProps) {
  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      onClose();
    }, 3000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [message, onClose]);

  const styles = TOAST_STYLES[variant];

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 max-w-sm rounded-xl border px-4 py-3 text-sm shadow-lg ${styles.container}`}
      role={variant === "error" ? "alert" : "status"}
    >
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 flex h-6 w-6 items-center justify-center rounded-full ${styles.iconWrapper}`}>
          <svg
            aria-hidden="true"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d={styles.iconPath} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="font-medium">{styles.title}</p>
          <p className="mt-1">{message}</p>
        </div>
        <button
          aria-label="Đóng thông báo"
          className={`transition ${styles.button}`}
          onClick={onClose}
          type="button"
        >
          ×
        </button>
      </div>
    </div>
  );
}

"use client";

import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useEffect, useState } from "react";

type SlidingAlertProps = {
  message: { type: "error" | "success"; text: string } | null;
  onClose: () => void;
};

export const SlidingAlert: React.FC<SlidingAlertProps> = ({
  message,
  onClose,
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (message) {
      const showTimer = setTimeout(() => setVisible(true), 0); // Delay to avoid synchronous state update
      const hideTimer = setTimeout(() => {
        setVisible(false);
        setTimeout(onClose, 300); // Allow time for sliding out animation
      }, 3000);
      return () => {
        clearTimeout(showTimer);
        clearTimeout(hideTimer);
      };
    }
  }, [message, onClose]);

  if (!message) return null;

  const alertStyles =
    message.type === "error"
      ? "text-[var(--color-danger)] border-[var(--color-danger)]"
      : "text-[var(--color-success)] border-[var(--color-success)]";

  return (
    <div
      className={`fixed top-20 right-4 z-50 transition-transform duration-300 ${
        visible ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <Alert
        className={`${alertStyles} border`}
        variant={message.type === "error" ? "destructive" : "default"}
      >
        <AlertTitle>
          {message.type === "error" ? "Error" : "Success"}
        </AlertTitle>
        <AlertDescription>{message.text}</AlertDescription>
      </Alert>
    </div>
  );
};

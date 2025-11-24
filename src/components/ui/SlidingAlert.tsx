"use client";

import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { createContext, useContext, useState } from "react";
import { createPortal } from "react-dom";

// Context for managing the SlidingAlert globally
const SlidingAlertContext = createContext<{
  showMessage: (message: { type: "error" | "success"; text: string }) => void;
}>({
  showMessage: () => {},
});

export const useSlidingAlert = () => useContext(SlidingAlertContext);

export const SlidingAlertProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [message, setMessage] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);
  const [visible, setVisible] = useState(false);

  const showMessage = (newMessage: {
    type: "error" | "success";
    text: string;
  }) => {
    setMessage(newMessage);
    setVisible(true);
    setTimeout(() => {
      setVisible(false);
      setTimeout(() => setMessage(null), 300); // Allow time for sliding out animation
    }, 3000);
  };

  return (
    <SlidingAlertContext.Provider value={{ showMessage }}>
      {children}
      {message &&
        createPortal(
          <div
            className={`fixed top-20 right-4 z-50 transition-transform duration-300 ${
              visible ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <Alert
              className={`${
                message.type === "error"
                  ? "text-[var(--color-danger)] border-[var(--color-danger)]"
                  : "text-[var(--color-success)] border-[var(--color-success)]"
              } border`}
              variant={message.type === "error" ? "destructive" : "default"}
            >
              <AlertTitle>
                {message.type === "error" ? "Error!" : "Success!"}
              </AlertTitle>
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          </div>,
          document.body
        )}
    </SlidingAlertContext.Provider>
  );
};

import type { Metadata } from "next";

import "../styles/globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { cn } from "@/lib/utils";
import { SlidingAlertProvider } from "@/components/ui/SlidingAlert";
import AuthGuard from "@/lib/AuthGuard";

export const metadata: Metadata = {
  title: "Hack Aware",
  description:
    "An AI powered website to check if your website is vulnerable to common hacks.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("dark", "light")}>
      <body suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SlidingAlertProvider>
            <AuthGuard>{children}</AuthGuard>
          </SlidingAlertProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

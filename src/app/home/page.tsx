"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ModeToggle } from "@/components/mode-toggler";
import { useSlidingAlert } from "@/components/ui/SlidingAlert";
import { useAuth } from "@/lib/useAuth";
import { useRouter } from "next/navigation";
import AuthGuard from "@/lib/AuthGuard";

export default function HomePage() {
  const [url, setUrl] = useState("");
  const { showMessage } = useSlidingAlert();
  const { signOut } = useAuth();
  const router = useRouter();

  const handleCheckVulnerabilities = async () => {
    if (!url) {
      showMessage({ type: "error", text: "Please enter a valid URL." });
      return;
    }

    try {
      // Simulate an API call to check vulnerabilities
      const response = await fetch("/api/check-vulnerabilities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error("Failed to check vulnerabilities.");
      }

      const data = await response.json();
      showMessage({
        type: "success",
        text: `Vulnerabilities found: ${data.vulnerabilities.length}`,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred.";
      showMessage({ type: "error", text: errorMessage });
    }
  };

  const handleLogout = () => {
    signOut();
    showMessage({ type: "success", text: "Logged out successfully." });
    router.push("/");
  };

  return (
    <AuthGuard>
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <div className="absolute top-4 right-4 flex items-center gap-4">
          <ModeToggle />
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>
        <h1 className="text-4xl font-bold mb-6 text-primary">Hack Aware</h1>
        <p className="text-lg text-muted mb-8 text-center max-w-2xl">
          Enter the URL of a website to check for common vulnerabilities and
          ensure your site is secure.
        </p>
        <div className="w-full max-w-md">
          <div className="flex flex-col gap-4">
            <div>
              <Label htmlFor="url" className="mb-4">
                Website URL
              </Label>
              <Input
                id="url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
              />
            </div>
            <Button onClick={handleCheckVulnerabilities} className="w-full">
              Check Vulnerabilities
            </Button>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}

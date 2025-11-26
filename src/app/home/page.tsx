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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage() {
  const [url, setUrl] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const { showMessage } = useSlidingAlert();
  const { signOut } = useAuth();
  const router = useRouter();

  const handleCheckVulnerabilities = async () => {
    if (!url) {
      showMessage({ type: "error", text: "Please enter a valid URL." });
      return;
    }

    setIsScanning(true);
    setAnalysis("");

    try {
      const response = await fetch("/api/check-vulnerabilities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error("Failed to check vulnerabilities.");
      }

      const data = await response.json();
      setAnalysis(data.analysis);
      showMessage({
        type: "success",
        text: `Scan complete. Found ${data.vulnerabilities.length} potential issues.`,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred.";
      showMessage({ type: "error", text: errorMessage });
    } finally {
      setIsScanning(false);
    }
  };

  const handleLogout = () => {
    signOut();
    showMessage({ type: "success", text: "Logged out successfully." });
    router.push("/");
  };

  return (
    <AuthGuard>
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <div className="absolute top-4 right-4 flex items-center gap-4">
          <ModeToggle />
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>
        <h1 className="text-4xl font-bold mb-6 text-primary">Hack Aware</h1>
        <p className="text-lg text-muted-foreground mb-8 text-center max-w-2xl">
          Enter the URL of a website to check for common vulnerabilities and
          ensure your site is secure.
        </p>
        <div className="w-full max-w-md space-y-8">
          <div className="flex flex-col gap-4">
            <div>
              <Label htmlFor="url" className="mb-2 block">
                Website URL
              </Label>
              <Input
                id="url"
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
              />
            </div>
            <Button
              onClick={handleCheckVulnerabilities}
              className="w-full"
              disabled={isScanning}
            >
              {isScanning ? "Scanning & Analyzing..." : "Check Vulnerabilities"}
            </Button>
          </div>

          {analysis && (
            <Card className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
              <CardHeader>
                <CardTitle>Security Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap font-mono text-sm">
                  {analysis}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ModeToggle } from "@/components/mode-toggler";
import { useSlidingAlert } from "@/components/ui/SlidingAlert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

export default function HomePage() {
  const [url, setUrl] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const { showMessage } = useSlidingAlert();

  const handleCheckVulnerabilities = async () => {
    if (!url) {
      showMessage({ type: "error", text: "Please enter a valid URL." });
      return;
    }

    if (!hasPermission) {
      showMessage({
        type: "error",
        text: "You must confirm ownership or permission to scan this URL.",
      });
      return;
    }

    setIsScanning(true);
    setAnalysis("");

    try {
      const response = await fetch("/api/check-vulnerabilities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="absolute top-4 right-4 flex items-center gap-4">
        <ModeToggle />
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

          <div className="flex items-center space-x-2">
            <Checkbox
              id="permission"
              checked={hasPermission}
              onCheckedChange={(checked) =>
                setHasPermission(checked as boolean)
              }
            />
            <Label
              htmlFor="permission"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I confirm that I have permission to scan this website.
            </Label>
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
  );
}

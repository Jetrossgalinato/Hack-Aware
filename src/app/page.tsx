"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ModeToggle } from "@/components/mode-toggler";
import { useSlidingAlert } from "@/components/ui/SlidingAlert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import ReactMarkdown from "react-markdown";
import { Check, Copy } from "lucide-react";

function CopyButton({ text }: { text: string }) {
  const [isCopied, setIsCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-6 w-6 text-zinc-400 hover:text-zinc-50"
      onClick={copy}
    >
      {isCopied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      <span className="sr-only">Copy code</span>
    </Button>
  );
}

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
      <div className="w-full max-w-2xl space-y-8">
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
          <Card className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500 border-primary/20 shadow-lg overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl text-primary">
                Security Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="prose dark:prose-invert max-w-none">
                <ReactMarkdown
                  components={{
                    h1: ({ ...props }) => (
                      <h1
                        className="text-3xl font-bold text-primary mt-6 mb-4 border-b border-primary/20 pb-2"
                        {...props}
                      />
                    ),
                    h2: ({ ...props }) => (
                      <h2
                        className="text-2xl font-semibold text-primary mt-8 mb-4 flex items-center gap-2"
                        {...props}
                      />
                    ),
                    h3: ({ ...props }) => (
                      <h3
                        className="text-xl font-medium text-secondary mt-6 mb-3"
                        {...props}
                      />
                    ),
                    p: ({ ...props }) => (
                      <p
                        className="leading-7 text-muted-foreground mb-4"
                        {...props}
                      />
                    ),
                    ul: ({ ...props }) => (
                      <ul
                        className="list-disc list-inside space-y-2 my-4 ml-4"
                        {...props}
                      />
                    ),
                    ol: ({ ...props }) => (
                      <ol
                        className="list-decimal list-inside space-y-2 my-4 ml-4"
                        {...props}
                      />
                    ),
                    li: ({ ...props }) => (
                      <li className="text-muted-foreground" {...props} />
                    ),
                    strong: ({ ...props }) => (
                      <strong
                        className="font-bold text-foreground bg-primary/10 px-1 rounded"
                        {...props}
                      />
                    ),
                    code: ({ ...props }) => {
                      // @ts-expect-error - inline is not in the types but is passed by react-markdown
                      const { inline, children } = props;
                      if (inline) {
                        return (
                          <code
                            className="bg-primary/10 px-1.5 py-0.5 rounded text-sm font-mono text-primary font-semibold"
                            {...props}
                          />
                        );
                      }
                      return (
                        <div className="relative my-4">
                          <div className="absolute right-2 top-2 z-10">
                            <CopyButton
                              text={String(children).replace(/\n$/, "")}
                            />
                          </div>
                          <code
                            className="block bg-zinc-950 dark:bg-zinc-900 p-4 rounded-lg overflow-x-auto text-sm font-mono text-zinc-50 border border-border/50 shadow-sm"
                            {...props}
                          />
                        </div>
                      );
                    },
                    blockquote: ({ ...props }) => (
                      <blockquote
                        className="border-l-4 border-primary/50 pl-4 italic text-muted-foreground my-4 bg-muted/30 py-2 pr-2 rounded-r"
                        {...props}
                      />
                    ),
                  }}
                >
                  {analysis}
                </ReactMarkdown>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

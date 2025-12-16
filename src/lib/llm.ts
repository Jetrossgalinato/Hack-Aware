import Groq from "groq-sdk";
import { ScanResult } from "./scanner";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "",
});

// Available Groq models to try in order of preference
const MODELS = [
  "llama-3.3-70b-versatile", // Latest and most capable (12k TPM)
  "llama-3.1-8b-instant", // Faster, smaller model
  "gemma2-9b-it", // Alternative fallback
];

// Helper function to wait/delay
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Summarize alerts to reduce token count
function summarizeAlerts(scanResult: ScanResult): string {
  // Prioritize high and medium risk alerts, limit description length
  const priorityAlerts = scanResult.alerts
    .filter((alert) => alert.risk === "High" || alert.risk === "Medium")
    .slice(0, 15); // Increased limit to top 15

  const lowAlerts = scanResult.alerts
    .filter((alert) => alert.risk === "Low" || alert.risk === "Informational")
    .slice(0, 10); // Increased limit to 10

  const limitedAlerts = [...priorityAlerts, ...lowAlerts].map((alert) => ({
    alert: alert.alert,
    risk: alert.risk,
    description: alert.description?.substring(0, 500) || "", // Increased context
    solution: alert.solution?.substring(0, 500) || "",
  }));

  return JSON.stringify(limitedAlerts, null, 2);
}

// Try to generate content with retry logic
async function generateWithRetry(
  modelName: string,
  systemPrompt: string,
  userPrompt: string,
  maxRetries = 2,
  baseDelay = 2000
): Promise<string> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: userPrompt,
          },
        ],
        model: modelName,
        temperature: 0.7,
        max_tokens: 4096,
      });
      return (
        completion.choices[0]?.message?.content || "No analysis generated."
      );
    } catch (error: unknown) {
      const isRateLimitError =
        (error as { status?: number })?.status === 429 ||
        (error as { message?: string })?.message
          ?.toLowerCase()
          .includes("rate") ||
        (error as { message?: string })?.message
          ?.toLowerCase()
          .includes("quota") ||
        (error as { message?: string })?.message?.includes("429");

      if (isRateLimitError && attempt < maxRetries) {
        const waitTime = baseDelay * Math.pow(2, attempt);
        console.log(`Rate limit hit. Retrying in ${waitTime / 1000}s...`);
        await delay(waitTime);
        continue;
      }
      throw error;
    }
  }
  throw new Error("Max retries exceeded");
}

export async function analyzeReport(scanResult: ScanResult): Promise<string> {
  if (!process.env.GROQ_API_KEY) {
    return "Error: GROQ_API_KEY is not configured. Please set it in your environment variables to use the AI analysis.";
  }

  console.log(`Analyzing report for: ${scanResult.url}`);

  const alertsSummary = summarizeAlerts(scanResult);
  const totalAlerts = scanResult.alerts.length;

  const systemPrompt = `You are a senior penetration tester and security expert.
Your goal is to explain security vulnerabilities to developers clearly and provide actionable fixes.
Provide the output in a clear, structured Markdown format.
Use headers (##, ###), bold text (**text**), and code blocks (\`\`\`) for readability.
Use emojis to make the report engaging but professional.`;

  const userPrompt = `I have a security scan report for ${scanResult.url}.
Total alerts found: ${totalAlerts}

Top priority alerts from OWASP ZAP:
${alertsSummary}

Please provide a comprehensive analysis covering:
1. False Positives likelihood (assess if any alerts might be false alarms)
2. Impact Analysis (explain the risks of High/Medium alerts in simple terms)
3. Remediation (provide specific code fixes or configuration changes for a React/Node.js stack)

Keep the tone professional but accessible to developers.`;

  // Try multiple models with retry logic
  for (const modelName of MODELS) {
    try {
      console.log(`Attempting to use model: ${modelName}`);
      const result = await generateWithRetry(
        modelName,
        systemPrompt,
        userPrompt
      );
      console.log(`Successfully generated analysis using ${modelName}`);
      return result;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error(`Failed with ${modelName}:`, errorMessage);
      // Continue to next model
    }
  }

  // If all models fail, use fallback
  console.log(
    "All AI models failed. Falling back to local analysis generation..."
  );
  return generateFallbackAnalysis(scanResult);
}

function generateFallbackAnalysis(scanResult: ScanResult): string {
  let analysis = `Security Analysis for ${scanResult.url}\n\n`;
  analysis += `⚠️  Note: AI-powered analysis is currently unavailable due to API quota limits or connectivity issues.\n`;
  analysis += `Please wait a few minutes for the quota to reset, or check your Groq API configuration.\n`;
  analysis += `Showing local summary based on ZAP scan results:\n\n`;

  if (scanResult.alerts.length === 0) {
    analysis += "✓ No vulnerabilities were found during the scan. Good job!";
    return analysis;
  }

  analysis += `Found ${scanResult.alerts.length} potential security issue(s):\n\n`;

  scanResult.alerts.forEach((alert, index) => {
    analysis += `${index + 1}. ${alert.alert} (${alert.risk} Risk)\n`;
    analysis += `\n   Description:\n   ${alert.description}\n`;
    analysis += `\n   Solution:\n   ${alert.solution}\n`;
    analysis += `\n--------------------------------------------------\n\n`;
  });

  return analysis;
}

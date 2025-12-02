import { GoogleGenerativeAI } from "@google/generative-ai";
import { ScanResult } from "./scanner";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Available models to try in order of preference
const MODELS = [
  "gemini-exp-1206", // Latest experimental model (Dec 2024)
  "gemini-2.0-flash-exp", // Fallback experimental model
];

// Helper function to wait/delay
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Try to generate content with retry logic
async function generateWithRetry(
  model: ReturnType<typeof genAI.getGenerativeModel>,
  prompt: string,
  maxRetries = 2,
  baseDelay = 2000
): Promise<string> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text() || "No analysis generated.";
    } catch (error: unknown) {
      const isRateLimitError =
        (error as { status?: number })?.status === 429 ||
        (error as { message?: string })?.message?.includes("quota") ||
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
  if (!process.env.GEMINI_API_KEY) {
    return "Error: GEMINI_API_KEY is not configured. Please set it in your environment variables to use the AI analysis.";
  }

  console.log(`Analyzing report for: ${scanResult.url}`);

  const prompt = `
    You are a senior penetration tester.
    I have a security scan report for the URL ${scanResult.url}.
    Here are the raw alerts from OWASP ZAP:
    ${JSON.stringify(scanResult.alerts, null, 2)}

    Please analyze this for False Positives, explain the impact of the 'High' severity alerts in simple terms, and provide code fixes for a React/Node.js stack.
    Format the output as clean plain text (no markdown symbols like # or *).
  `;

  // Try multiple models with retry logic
  for (const modelName of MODELS) {
    try {
      console.log(`Attempting to use model: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await generateWithRetry(model, prompt);
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
  analysis += `⚠️  Note: AI-powered analysis is currently unavailable due to API quota limits.\n`;
  analysis += `Please wait a few minutes for the quota to reset, or upgrade your Gemini API plan.\n`;
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

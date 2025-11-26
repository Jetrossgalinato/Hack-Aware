import { GoogleGenerativeAI } from "@google/generative-ai";
import { ScanResult } from "./scanner";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

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

  try {
    // Use 'gemini-2.0-flash' which is the latest model
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text() || "No analysis generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    console.log("Falling back to local analysis generation...");
    return generateFallbackAnalysis(scanResult);
  }
}

function generateFallbackAnalysis(scanResult: ScanResult): string {
  let analysis = `Security Analysis for ${scanResult.url}\n\n`;
  analysis += `Note: AI Analysis failed (Quota/API Error). Showing local summary based on scan results.\n\n`;

  if (scanResult.alerts.length === 0) {
    analysis += "No vulnerabilities were found during the scan. Good job!";
    return analysis;
  }

  analysis += `Found ${scanResult.alerts.length} potential issues:\n\n`;

  scanResult.alerts.forEach((alert, index) => {
    analysis += `${index + 1}. ${alert.alert} - ${alert.risk} Risk\n`;
    analysis += `   Description: ${alert.description}\n`;
    analysis += `   Solution: ${alert.solution}\n\n`;
  });

  return analysis;
}

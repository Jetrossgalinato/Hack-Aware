import { NextResponse } from "next/server";
import { scanUrl } from "@/lib/scanner";
import { analyzeReport } from "@/lib/llm";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // 1. Run the Scan (The "Hands")
    const scanResult = await scanUrl(url);

    // 2. Analyze with AI (The "Brain")
    const analysis = await analyzeReport(scanResult);

    return NextResponse.json({
      vulnerabilities: scanResult.alerts,
      analysis: analysis,
    });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

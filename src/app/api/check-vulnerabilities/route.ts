import { NextResponse } from "next/server";
import { scanUrl } from "@/lib/scanner";
import { analyzeReport } from "@/lib/llm";
import { supabase } from "@/lib/supabaseClient";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url, userId } = body;

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // 1. Run the Scan (The "Hands")
    const scanResult = await scanUrl(url);

    // 2. Analyze with AI (The "Brain")
    const analysis = await analyzeReport(scanResult);

    // 3. Save to Supabase (if userId is provided)
    if (userId) {
      const { error: dbError } = await supabase.from("scans").insert({
        user_id: userId,
        url: url,
        vulnerabilities: scanResult.alerts,
        analysis: analysis,
      });

      if (dbError) {
        console.error("Error saving scan to DB:", dbError);
        // We don't fail the request if saving fails, just log it
      }
    }

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

import { NextResponse } from "next/server";
import { scanUrl } from "@/lib/scanner";
import { analyzeReport } from "@/lib/llm";
import { createClient } from "@supabase/supabase-js";

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
      const authHeader = request.headers.get("Authorization");

      // Create a client with the user's token to respect RLS
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { global: { headers: { Authorization: authHeader || "" } } }
      );

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

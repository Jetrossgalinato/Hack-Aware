export interface ScanAlert {
  alert: string;
  risk: string;
  description: string;
  solution: string;
}

export interface ScanResult {
  url: string;
  alerts: ScanAlert[];
}

const ZAP_API_URL = process.env.ZAP_API_URL || "http://localhost:8080";
const ZAP_API_KEY = process.env.ZAP_API_KEY || "";

export async function scanUrl(url: string): Promise<ScanResult> {
  console.log(`Scanning URL: ${url} via ZAP at ${ZAP_API_URL}`);

  try {
    // 1. Start Spider Scan (The "Hands")
    const spiderUrl = `${ZAP_API_URL}/JSON/spider/action/scan/?url=${encodeURIComponent(
      url
    )}&apikey=${ZAP_API_KEY}`;
    const spiderResponse = await fetch(spiderUrl);

    if (!spiderResponse.ok) {
      throw new Error(`ZAP Spider failed: ${spiderResponse.statusText}`);
    }

    const spiderData = await spiderResponse.json();
    const scanId = spiderData.scan;
    console.log(`Spider started with ID: ${scanId}`);

    // 2. Wait for a short duration (Simulating polling for demo purposes)
    // In a production app, you would poll /JSON/spider/view/status/?scanId=... until 100%
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // 3. Get Alerts
    const alertsUrl = `${ZAP_API_URL}/JSON/core/view/alerts/?baseurl=${encodeURIComponent(
      url
    )}&apikey=${ZAP_API_KEY}`;
    const alertsResponse = await fetch(alertsUrl);

    if (!alertsResponse.ok) {
      throw new Error(`Failed to fetch alerts: ${alertsResponse.statusText}`);
    }

    const alertsData = await alertsResponse.json();

    // Map ZAP alerts to our interface
    const alerts: ScanAlert[] = alertsData.alerts.map((alert: any) => ({
      alert: alert.alert,
      risk: alert.risk,
      description: alert.description,
      solution: alert.solution,
    }));

    return {
      url,
      alerts,
    };
  } catch (error) {
    console.error("ZAP Scanner Error:", error);
    // If ZAP is not reachable, we throw an error to inform the user
    throw new Error(
      "Failed to connect to OWASP ZAP Scanner. Ensure ZAP is running on localhost:8080 (or configured ZAP_API_URL) and ZAP_API_KEY is set if required."
    );
  }
}

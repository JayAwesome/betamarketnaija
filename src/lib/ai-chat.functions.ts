import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { CROPS, CITIES, MARKET, bestCity, recommend, formatNaira } from "./market-data";

const MessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
});

const InputSchema = z.object({
  messages: z.array(MessageSchema).min(1),
});

function buildMarketContext(): string {
  const lines: string[] = [
    "You are AgriSense AI, an assistant for Nigerian farmers and traders.",
    "Answer ONLY using the live market data below. If the user asks about a crop or city not listed, say so.",
    "Always quote prices with the ₦ symbol and mention the unit. Keep answers concise and practical.",
    "",
    "=== LIVE MARKET DATA (this week) ===",
  ];
  for (const crop of CROPS) {
    const d = MARKET[crop];
    const best = bestCity(crop);
    const rec = recommend(crop);
    lines.push(`\n${crop} (per ${d.unit}):`);
    for (const city of CITIES) {
      lines.push(`  - ${city}: ${formatNaira(d.cityPrices[city])}`);
    }
    lines.push(`  This week: ${d.thisWeekDirection}. Next 3 weeks: ${d.nextThreeWeeksDirection}. Volatility ${d.volatility}/100.`);
    lines.push(`  Best market: ${best}. Recommendation: ${rec.action.toUpperCase()} — ${rec.reason}`);
  }
  return lines.join("\n");
}

export const askAssistant = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => InputSchema.parse(data))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    const systemMessage = { role: "system" as const, content: buildMarketContext() };

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": key,
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [systemMessage, ...data.messages],
      }),
    });

    if (!res.ok) {
      if (res.status === 429) throw new Error("Rate limit reached — please wait a moment and try again.");
      if (res.status === 402) throw new Error("AI credits exhausted for this workspace.");
      const t = await res.text();
      throw new Error(`AI gateway error: ${res.status} ${t.slice(0, 200)}`);
    }
    const json = await res.json();
    const content: string = json.choices?.[0]?.message?.content ?? "(no response)";
    return { content };
  });

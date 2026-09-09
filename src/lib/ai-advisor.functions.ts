import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { CROPS, CITIES, MARKET, bestCity, recommend, formatNaira } from "./market-data";

const LangSchema = z.enum(["en", "ig", "ha", "yo"]);

const LANG_NAME: Record<z.infer<typeof LangSchema>, string> = {
  en: "English",
  ig: "Igbo",
  ha: "Hausa",
  yo: "Yoruba",
};

const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "openai/gpt-6-astra";

async function callAI(system: string, user: string): Promise<string> {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("AI is not configured right now. Please try again later.");

  const res = await fetch(GATEWAY, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Lovable-API-Key": key },
    body: JSON.stringify({
      model: MODEL,
      reasoning_effort: "low",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });

  if (!res.ok) {
    if (res.status === 429) throw new Error("Too many requests right now — please wait a moment and try again.");
    if (res.status === 402) throw new Error("AI credits are exhausted for this workspace.");
    const t = await res.text();
    throw new Error(`AI service error (${res.status}): ${t.slice(0, 160)}`);
  }
  const json = await res.json();
  const content: string = json.choices?.[0]?.message?.content?.trim();
  if (!content) throw new Error("The AI could not produce an answer. Please try again.");
  return content;
}

function styleRules(lang: z.infer<typeof LangSchema>) {
  return [
    `Reply ONLY in ${LANG_NAME[lang]}.`,
    "Write 2-4 short sentences maximum. No lists, no headings, no markdown.",
    "Speak plainly to a Nigerian smallholder farmer. Avoid technical jargon.",
    "Prefer inputs, practices and products that are actually available in Nigerian farm markets.",
    "Never invent exact prices that were not given to you.",
  ].join(" ");
}

function cropMarketBrief(crop: string, city?: string | null): string {
  const c = crop as (typeof CROPS)[number];
  const d = MARKET[c];
  if (!d) return "";
  const best = bestCity(c);
  const rec = recommend(c);
  const local =
    city && d.cityPrices[city as (typeof CITIES)[number]]
      ? `Price in ${city}: ${formatNaira(d.cityPrices[city as (typeof CITIES)[number]])} per ${d.unit}. `
      : "";
  return [
    `Crop: ${crop} (sold per ${d.unit}).`,
    `${local}Best paying market: ${best} at ${formatNaira(d.cityPrices[best])}.`,
    `This week prices are ${d.thisWeekDirection}; next three weeks ${d.nextThreeWeeksDirection}. Volatility ${d.volatility}/100.`,
    `Seasonal note: ${d.seasonalInsight}`,
    `App recommendation: ${rec.action.toUpperCase()} — ${rec.reason}`,
  ].join(" ");
}

/* ---------------- 1. AI Crop Doctor ---------------- */

export const diagnoseCrop = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        crop: z.string().min(1),
        city: z.string().min(1),
        symptoms: z.array(z.string()).default([]),
        description: z.string().max(1200).default(""),
        lang: LangSchema.default("en"),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const system = [
      "You are an experienced Nigerian agricultural extension officer diagnosing crop problems in the field.",
      "Given the crop, the farmer's city/agro-ecological zone and the symptoms, name the single most likely disease, pest or nutrient/water problem, say briefly why it fits that crop in that zone, then give one practical treatment or control step using inputs available locally in Nigeria.",
      "If the symptoms are too vague to diagnose, say so and ask one specific follow-up question.",
      styleRules(data.lang),
    ].join(" ");

    const user = [
      `Crop: ${data.crop}.`,
      `Location: ${data.city}, Nigeria.`,
      data.symptoms.length ? `Observed symptoms: ${data.symptoms.join(", ")}.` : "",
      data.description ? `Farmer's own description: ${data.description}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    return { content: await callAI(system, user) };
  });

/* ---------------- 2. AI Market Advisor ---------------- */

export const marketAdvisory = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        crop: z.string().min(1),
        city: z.string().min(1),
        lang: LangSchema.default("en"),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const system = [
      "You are a Nigerian commodity market analyst writing today's short advisory for one farmer.",
      "Use ONLY the market figures supplied. State the likely price direction and give a clear sell / hold / sell soon call with one reason tied to season or supply.",
      "Your call must NOT contradict the supplied trend data.",
      styleRules(data.lang),
    ].join(" ");

    const user = [
      `Farmer's city: ${data.city}.`,
      cropMarketBrief(data.crop, data.city),
      `Today's date: ${new Date().toISOString().slice(0, 10)}.`,
    ].join("\n");

    return { content: await callAI(system, user) };
  });

/* ---------------- 3. Personalized Planting Assistant ---------------- */

export const plantingAdvice = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        question: z.string().min(2).max(1000),
        crop: z.string().optional(),
        city: z.string().min(1),
        lang: LangSchema.default("en"),
        history: z
          .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() }))
          .max(10)
          .default([]),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const system = [
      "You are AgriSense AI, a planting and farm-planning assistant for Nigerian smallholder farmers.",
      "Ground every answer in Nigerian planting calendars, rainfall patterns and the farmer's agro-ecological zone.",
      "Give concrete timing (months / early or late rains) and one practical next step.",
      styleRules(data.lang),
    ].join(" ");

    const context = data.crop ? cropMarketBrief(data.crop, data.city) : "";
    const prior = data.history
      .slice(-6)
      .map((m) => `${m.role === "user" ? "Farmer" : "Assistant"}: ${m.content}`)
      .join("\n");

    const user = [
      `Farmer's city: ${data.city}, Nigeria.`,
      data.crop ? `Main crop: ${data.crop}.` : "",
      context,
      prior ? `Earlier in this conversation:\n${prior}` : "",
      `Farmer's question: ${data.question}`,
    ]
      .filter(Boolean)
      .join("\n");

    return { content: await callAI(system, user) };
  });

/* ---------------- 4. Personalized Farming Tips ---------------- */

export const farmingTips = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        crops: z.array(z.string()).min(1).max(6),
        city: z.string().min(1),
        lang: LangSchema.default("en"),
        pastQuestions: z.array(z.string()).max(5).default([]),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const system = [
      "You are a Nigerian extension officer writing 2 personalised tips for one farmer this week.",
      "Each tip must be specific to their crop, their city's climate zone and the current season — flag a seasonal risk or a money-saving action. Never give generic advice like 'water your plants'.",
      "Return exactly two tips, each on its own line, each starting with '- ' and one short sentence long.",
      styleRules(data.lang),
    ].join(" ");

    const user = [
      `Farmer's city: ${data.city}, Nigeria.`,
      `Crops grown: ${data.crops.join(", ")}.`,
      data.crops.map((c) => cropMarketBrief(c, data.city)).join("\n"),
      data.pastQuestions.length
        ? `Questions this farmer asked recently: ${data.pastQuestions.join(" | ")}`
        : "",
      `Today's date: ${new Date().toISOString().slice(0, 10)}.`,
    ]
      .filter(Boolean)
      .join("\n");

    const content = await callAI(system, user);
    const tips = content
      .split("\n")
      .map((l) => l.replace(/^[-*\d.\s]+/, "").trim())
      .filter(Boolean)
      .slice(0, 2);
    return { tips: tips.length ? tips : [content] };
  });

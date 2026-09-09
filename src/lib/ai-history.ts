import { supabase } from "@/integrations/supabase/client";

export type AiFeature = "crop_doctor" | "market_advisor" | "planting_assistant" | "farming_tips";

export interface AiInteraction {
  id: string;
  feature: string;
  crop: string | null;
  city: string | null;
  lang: string;
  question: string;
  answer: string;
  created_at: string;
}

/** Best-effort logging — never blocks or breaks the UI for guests. */
export async function logAiInteraction(params: {
  userId?: string | null;
  feature: AiFeature;
  crop?: string | null;
  city?: string | null;
  lang: string;
  question: string;
  answer: string;
}) {
  if (!params.userId) return;
  try {
    await supabase.from("ai_interactions").insert({
      user_id: params.userId,
      feature: params.feature,
      crop: params.crop ?? null,
      city: params.city ?? null,
      lang: params.lang,
      question: params.question,
      answer: params.answer,
    });
  } catch {
    /* history is a nice-to-have; ignore failures */
  }
}

export async function fetchAiHistory(userId: string, feature?: AiFeature, limit = 10) {
  let q = supabase
    .from("ai_interactions")
    .select("id, feature, crop, city, lang, question, answer, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (feature) q = q.eq("feature", feature);
  const { data } = await q;
  return (data ?? []) as AiInteraction[];
}

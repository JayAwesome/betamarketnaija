// N-ATLAS (NCAIR1/N-ATLaS) client — Nigeria's multilingual LLM via an OpenAI-compatible gateway.
// Returns null when the gateway is not configured or unreachable so callers can fall back.

const LANG_CODE: Record<string, string> = { en: "en", ig: "ig", ha: "ha", yo: "yo" };

export async function callNatlas(
  system: string,
  user: string,
  lang?: string,
): Promise<string | null> {
  const base = process.env.NATLAS_BASE_URL?.trim();
  if (!base) return null;
  const key = process.env.NATLAS_API_KEY?.trim();
  const model = process.env.NATLAS_MODEL?.trim() || "NCAIR1/N-ATLaS";
  const root = base.replace(/\/+$/, "").replace(/\/v1$/, "");

  try {
    const res = await fetch(`${root}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(key ? { Authorization: `Bearer ${key}` } : {}),
      },
      body: JSON.stringify({
        model,
        temperature: 0.3,
        max_tokens: 400,
        ...(lang && LANG_CODE[lang] ? { language: LANG_CODE[lang] } : {}),
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });
    if (!res.ok) {
      console.error("N-ATLAS error", res.status, (await res.text()).slice(0, 200));
      return null;
    }
    const json = await res.json();
    const content: string | undefined = json.choices?.[0]?.message?.content?.trim();
    return content || null;
  } catch (e) {
    console.error("N-ATLAS unreachable", e);
    return null;
  }
}

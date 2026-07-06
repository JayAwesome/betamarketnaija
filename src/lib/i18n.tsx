import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "en" | "ig" | "ha" | "yo";

// Only static UI strings are translated. Dynamic AI text stays English.
const DICT: Record<string, Record<Lang, string>> = {
  "nav.dashboard": { en: "Dashboard", ig: "Dashboọdụ", ha: "Dashboard", yo: "Dasibodu" },
  "nav.analytics": { en: "Analytics", ig: "Nyocha", ha: "Bincike", yo: "Ìtúpalẹ̀" },
  "nav.chat": { en: "AI Assistant", ig: "Onye Enyemaka AI", ha: "Mataimakin AI", yo: "Olùrànlọ́wọ́ AI" },
  "nav.my": { en: "My Dashboard", ig: "Dashboọdụ M", ha: "Dashboard na", yo: "Dasibodu Mi" },
  "nav.coop": { en: "My Cooperative", ig: "Òtù M", ha: "Ƙungiyar Ta", yo: "Ẹgbẹ́ Mi" },
  "nav.ussd": { en: "USSD Demo", ig: "USSD Ngosipụta", ha: "USSD Zanga", yo: "Àpẹẹrẹ USSD" },
  "nav.signin": { en: "Log in / Sign up", ig: "Banye / Debanye", ha: "Shiga / Rijista", yo: "Wọlé / Forúkọsílẹ̀" },
  "nav.signout": { en: "Sign out", ig: "Pụọ", ha: "Fita", yo: "Jáde" },

  "page.dashboard.title": { en: "Market Dashboard", ig: "Dashboọdụ Ahịa", ha: "Dashboard na Kasuwa", yo: "Dasibodu Ọjà" },
  "page.analytics.title": { en: "Price Analytics", ig: "Nyocha Ọnụahịa", ha: "Bincike Farashi", yo: "Ìtúpalẹ̀ Iye" },
  "page.chat.title": { en: "AI Assistant", ig: "Onye Enyemaka AI", ha: "Mataimakin AI", yo: "Olùrànlọ́wọ́ AI" },
  "page.my.title": { en: "My Dashboard", ig: "Dashboọdụ M", ha: "Dashboard na", yo: "Dasibodu Mi" },
  "page.coop.title": { en: "My Cooperative", ig: "Òtù M", ha: "Ƙungiyar Ta", yo: "Ẹgbẹ́ Mi" },
  "page.ussd.title": { en: "USSD & SMS Demo", ig: "USSD & SMS Ngosipụta", ha: "USSD & SMS Zanga", yo: "USSD & SMS Àpẹẹrẹ" },

  "label.crop": { en: "Crop", ig: "Ihe Ọkụkụ", ha: "Amfani Gona", yo: "Ohun Ọ̀gbìn" },
  "label.city": { en: "City", ig: "Obodo", ha: "Birni", yo: "Ìlú" },
  "label.price": { en: "Price", ig: "Ọnụahịa", ha: "Farashi", yo: "Iye" },
  "label.signal": { en: "Signal", ig: "Akara", ha: "Sigina", yo: "Ìdámí" },

  "card.aiRec": { en: "AI Recommendation", ig: "Ntụnye AI", ha: "Shawarwarin AI", yo: "Àbá AI" },
  "card.thisWeek": { en: "This Week", ig: "Izu A", ha: "Wannan Mako", yo: "Ọ̀sẹ̀ Yìí" },
  "card.next3": { en: "Next 3 Weeks", ig: "Izu 3 Na-abịa", ha: "Makonni 3 Masu Zuwa", yo: "Ọ̀sẹ̀ 3 Tí Ń Bọ̀" },
  "card.confidence": { en: "Data Confidence", ig: "Ntụkwasị Obi Data", ha: "Amincin Bayanai", yo: "Ìgbékẹ̀lé Dátà" },
  "card.priceTable": { en: "City Price Comparison", ig: "Ntụnyere Ọnụahịa Obodo", ha: "Kwatanta Farashin Birni", yo: "Ìfiwéra Iye Ìlú" },
  "card.why": { en: "Why This Matters", ig: "Ihe Kpatara Nke A", ha: "Me Ya Sa Wannan", yo: "Ìdí Tí Ó Fi Ṣe Pàtàkì" },
  "card.alerts": { en: "Price Alerts", ig: "Ọkwa Ọnụahịa", ha: "Faɗakarwar Farashi", yo: "Ìkìlọ̀ Iye" },
  "card.coopTeaser": { en: "Group Selling", ig: "Ire Ọnụ", ha: "Sayarwar Ƙungiya", yo: "Títà Ẹgbẹ́" },

  "btn.save": { en: "Save", ig: "Chekwaa", ha: "Ajiye", yo: "Fi pamọ́" },
  "btn.add": { en: "Add", ig: "Tinye", ha: "Ƙara", yo: "Fikún" },
  "btn.delete": { en: "Delete", ig: "Hichapụ", ha: "Share", yo: "Paarẹ́" },
  "btn.record": { en: "Record Sale", ig: "Depụta Ire", ha: "Rikodin Sayarwa", yo: "Kọ Títà" },
  "btn.setAlert": { en: "Set Alert", ig: "Tọọ Ọkwa", ha: "Saita Faɗakarwa", yo: "Ṣe Ìkìlọ̀" },
  "btn.create": { en: "Create", ig: "Mepụta", ha: "Ƙirƙira", yo: "Dá" },
  "btn.join": { en: "Join", ig: "Sonye", ha: "Shiga", yo: "Dara pọ̀" },

  "status.rising": { en: "Rising", ig: "Na-arị Elu", ha: "Yana Hauhawa", yo: "Ń Gòkè" },
  "status.falling": { en: "Falling", ig: "Na-ada", ha: "Yana Faɗuwa", yo: "Ń Sọ̀kalẹ̀" },
  "status.stable": { en: "Stable", ig: "Kwụsiri Ike", ha: "Barga", yo: "Dúró Ṣinṣin" },
  "status.highest": { en: "Highest", ig: "Kachasị Elu", ha: "Mafi Girma", yo: "Ó Ga Jùlọ" },
  "status.lowest": { en: "Lowest", ig: "Kacha Ala", ha: "Mafi Ƙasa", yo: "Ó Kéré Jùlọ" },
  "status.average": { en: "Average", ig: "Nkezi", ha: "Matsakaici", yo: "Àpapọ̀" },

  "guest.nudge": { en: "Sign up to save your data.", ig: "Debanye ka ị chekwaa data gị.", ha: "Yi rijista don ajiye bayananka.", yo: "Forúkọsílẹ̀ láti fi dátà rẹ pamọ́." },
};

interface I18nCtx { lang: Lang; setLang: (l: Lang) => void; t: (key: string) => string }
const Ctx = createContext<I18nCtx>({ lang: "en", setLang: () => {}, t: (k) => k });

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  useEffect(() => {
    const stored = typeof localStorage !== "undefined" ? (localStorage.getItem("agrisense-lang") as Lang | null) : null;
    if (stored && ["en", "ig", "ha", "yo"].includes(stored)) setLangState(stored);
  }, []);
  const setLang = (l: Lang) => {
    setLangState(l);
    if (typeof localStorage !== "undefined") localStorage.setItem("agrisense-lang", l);
  };
  const t = (key: string) => DICT[key]?.[lang] ?? DICT[key]?.en ?? key;
  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>;
}

export const useT = () => useContext(Ctx);

export const LANGS: { code: Lang; label: string }[] = [
  { code: "en", label: "English" },
  { code: "ig", label: "Igbo" },
  { code: "ha", label: "Hausa" },
  { code: "yo", label: "Yorùbá" },
];

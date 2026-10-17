import { useEffect, useRef, useState } from "react";
import { Bell, Phone, PhoneOff, Volume2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CropPicker } from "@/components/CropPicker";
import { useT } from "@/lib/i18n";
import { CITIES, MARKET, bestCity, formatNaira, type Crop, type City } from "@/lib/market-data";
import { deliverDemoEvent, phoneDemoCopy, type DemoEvent } from "@/lib/phone-demo";

export function PhoneAlertDemo() {
  const { lang, tCrop, tUnit, t } = useT();
  const copy = phoneDemoCopy[lang];
  const [crop, setCrop] = useState<Crop>("Rice");
  const [city, setCity] = useState<City>("Kano");
  const [active, setActive] = useState(false);
  const [reply, setReply] = useState("");
  const [audioUnavailable, setAudioUnavailable] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const [message, setMessage] = useState("");
  const [inbox, setInbox] = useState<DemoEvent[]>([]);
  const [status, setStatus] = useState<"paused" | "delivered" | null>(null);
  const nextId = useRef(0);

  useEffect(() => () => { window.speechSynthesis?.cancel(); }, []);
  useEffect(() => {
    window.speechSynthesis?.cancel();
    setReply("");
    setActive(false);
    setMessage("");
    setStatus(null);
  }, [lang]);

  function speak(text: string) {
    setReply(text);
    const synthesis = window.speechSynthesis;
    if (!synthesis) { setAudioUnavailable(true); return; }
    synthesis.cancel();
    const language = { en: "en-NG", ha: "ha-NG", ig: "ig-NG", yo: "yo-NG" }[lang];
    const voices = synthesis.getVoices();
    const voice = voices.find(v => v.lang.startsWith(lang));
    if (lang !== "en" && !voice) { setAudioUnavailable(true); return; }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    if (voice) utterance.voice = voice;
    utterance.onerror = (event) => { if (event.error !== "canceled" && event.error !== "interrupted") setAudioUnavailable(true); };
    setAudioUnavailable(false);
    synthesis.speak(utterance);
  }

  function end() { window.speechSynthesis?.cancel(); setActive(false); setReply(""); }
  function simulate() {
    const event: DemoEvent = { id: ++nextId.current, crop, city, message: message.trim() || copy.sample };
    setInbox(previous => deliverDemoEvent(enabled, crop, city, event, previous));
    setStatus(enabled ? "delivered" : "paused");
  }

  return (
    <section className="space-y-6">
      <div className="flex items-start gap-3 rounded-md border border-warning/50 bg-warning/5 p-4 text-sm"><Phone className="mt-0.5 h-5 w-5 shrink-0 text-primary" /><p>{copy.note}</p></div>
      <div className="flex flex-wrap items-end gap-4">
        <div className="space-y-2"><Label>{t("label.crop")}</Label><CropPicker value={crop} onChange={setCrop} /></div>
        <div className="min-w-40 space-y-2"><Label>{t("label.city")}</Label><Select value={city} onValueChange={value => { const match = CITIES.find(c => c === value); if (match) setCity(match); }}><SelectTrigger aria-label={t("label.city")}><SelectValue /></SelectTrigger><SelectContent>{CITIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
      </div>
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          <h2 className="flex items-center gap-2 text-xl font-semibold"><Phone className="h-5 w-5 text-primary" />{copy.phone}</h2>
          <div className="mx-auto max-w-sm space-y-5 rounded-lg border-2 border-primary/30 bg-card p-5">
            <div className="min-h-40 space-y-3 rounded-md bg-muted p-4">
              <p className="text-xs font-medium text-muted-foreground">AgriSense · {active ? copy.connected : copy.idle}</p>
              <p aria-live="polite" className="text-sm leading-relaxed">{active ? reply || copy.welcome : copy.phone}</p>
              {audioUnavailable && <p role="status" className="text-xs text-muted-foreground">{copy.unavailable}</p>}
            </div>
            {active ? <>
              <div className="grid grid-cols-3 gap-2">
                {[{ key: "1", label: copy.price, text: `${tCrop(crop)} · ${city}: ${formatNaira(MARKET[crop].cityPrices[city])} / ${tUnit(MARKET[crop].unit)}.` }, { key: "2", label: copy.market, text: `${copy.market}: ${bestCity(crop)} · ${tCrop(crop)}: ${formatNaira(MARKET[crop].cityPrices[bestCity(crop)])} / ${tUnit(MARKET[crop].unit)}.` }, { key: "3", label: copy.advice, text: copy.tips }].map(item => <Button key={item.key} variant="outline" className="h-24 flex-col gap-2 whitespace-normal px-2" onClick={() => speak(item.text)} aria-label={`${item.key}. ${item.label}`}><span className="text-xl">{item.key}</span><span className="text-xs">{item.label}</span></Button>)}
              </div>
              <div className="flex flex-wrap gap-2"><Button variant="outline" size="sm" onClick={() => speak(copy.welcome)}>0 · {copy.menu}</Button><Button variant="ghost" size="sm" onClick={() => speak(reply || copy.welcome)}><Volume2 className="h-4 w-4" />{copy.replay}</Button></div>
              <Button variant="destructive" className="w-full" onClick={end}><PhoneOff className="h-4 w-4" />{copy.end}</Button>
            </> : <Button className="w-full" onClick={() => { setActive(true); speak(copy.welcome); }}><Phone className="h-4 w-4" />{copy.start}</Button>}
          </div>
        </div>
        <div className="space-y-4">
          <h2 className="flex items-center gap-2 text-xl font-semibold"><Bell className="h-5 w-5 text-primary" />{copy.ppr}</h2>
          <div className="flex items-center justify-between gap-3 border-b pb-4"><Label htmlFor="demo-alerts">{copy.enabled}</Label><Switch id="demo-alerts" checked={enabled} onCheckedChange={value => { setEnabled(value); setStatus(null); }} /></div>
          <p className="text-sm text-muted-foreground">{copy.scope}: {tCrop(crop)} · {city}</p>
          <div className="space-y-2"><Label htmlFor="demo-message">{copy.message}</Label><Input id="demo-message" maxLength={300} value={message} onChange={event => setMessage(event.target.value)} placeholder={copy.sample} /></div>
          <Button onClick={simulate} className="h-auto min-h-10 whitespace-normal"><Bell className="h-4 w-4 shrink-0" />{copy.send}</Button>
          <p role="status" className="min-h-5 text-sm text-muted-foreground">{status ? copy[status] : ""}</p>
          <div className="flex items-center justify-between"><h3 className="font-semibold">{copy.inbox} ({inbox.length})</h3><Button variant="ghost" size="icon" aria-label={copy.clear} title={copy.clear} disabled={!inbox.length} onClick={() => { setInbox([]); setStatus(null); }}><Trash2 className="h-4 w-4" /></Button></div>
          <div aria-live="polite" className="max-h-80 space-y-3 overflow-y-auto">{!inbox.length ? <p className="border-y py-6 text-sm text-muted-foreground">{copy.empty}</p> : inbox.map(item => <article key={item.id} className="rounded-md border bg-card p-3"><p className="text-xs font-medium text-primary">PPR · {tCrop(item.crop)} · {item.city}</p><p className="mt-2 break-words text-sm">{item.message}</p></article>)}</div>
          <p className="text-xs text-muted-foreground">{copy.reset}</p>
        </div>
      </div>
    </section>
  );
}
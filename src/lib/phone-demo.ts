import type { City, Crop } from "./market-data";

export interface DemoEvent { id: number; crop: Crop; city: City; message: string }
export function deliverDemoEvent(enabled: boolean, crop: Crop, city: City, event: DemoEvent, inbox: DemoEvent[]): DemoEvent[] {
  if (!enabled || event.crop !== crop || event.city !== city || inbox.some(item => item.id === event.id)) return inbox;
  return [event, ...inbox];
}

export const phoneDemoCopy = {
  en: {
    title: "Phone & PPR Demo", note: "Demo only · No real calls, messages or Cloud Run connection. Replies are scripted; prices are indicative.",
    phone: "Telephone menu", start: "Start demo call", end: "End call", idle: "Call ended", connected: "Demo call active", welcome: "Welcome to AgriSense. Press 1 for today's price, 2 for the best market, or 3 for farming advice.",
    price: "Today's price", market: "Best market", advice: "Farming advice", menu: "Main menu", replay: "Replay audio", unavailable: "Audio is unavailable in this browser. The reply is shown below.",
    tips: "Check your soil moisture before watering. Remove weeds early, and speak to a local extension officer before using pesticides.",
    ppr: "PPR alert preview", enabled: "Receive demo alerts", message: "Sample alert message", sample: "A new advisory is available for your selected crop and city.", send: "Simulate incoming PPR event", inbox: "Demo inbox", empty: "No demo alerts yet", paused: "Alerts are paused", delivered: "Demo alert received", clear: "Clear inbox", scope: "Crop and city", reset: "Clears when you leave this page.",
  },
  ha: {
    title: "Gwajin waya da PPR", note: "Gwaji kawai · Babu kiran waya, saƙonni ko haɗin Cloud Run na gaske. Amsoshi na misali ne; farashi na kimantawa ne.",
    phone: "Zaɓuɓɓukan waya", start: "Fara kiran gwaji", end: "Ƙare kira", idle: "An ƙare kira", connected: "Kiran gwaji yana aiki", welcome: "Barka da zuwa AgriSense. Danna 1 don farashin yau, 2 don kasuwa mafi kyau, ko 3 don shawarar noma.",
    price: "Farashin yau", market: "Kasuwa mafi kyau", advice: "Shawarar noma", menu: "Babban menu", replay: "Sake kunna murya", unavailable: "Ba a samun murya a wannan burauzar. Amsar tana ƙasa.",
    tips: "Duba danshin ƙasa kafin ban ruwa. Cire ciyawa da wuri, kuma tuntuɓi jami'in noma kafin amfani da magungunan kashe ƙwari.",
    ppr: "Gwajin sanarwar PPR", enabled: "Karɓi sanarwar gwaji", message: "Saƙon sanarwar misali", sample: "Akwai sabuwar shawara don amfanin gona da birnin da ka zaɓa.", send: "Kwaikwayi saƙon PPR mai shigowa", inbox: "Akwatin sanarwar gwaji", empty: "Babu sanarwar gwaji tukuna", paused: "An dakatar da sanarwa", delivered: "An karɓi sanarwar gwaji", clear: "Share sanarwa", scope: "Amfanin gona da birni", reset: "Ana sharewa idan ka bar wannan shafin.",
  },
  ig: {
    title: "Ngosipụta ekwentị na PPR", note: "Ngosipụta naanị · Enweghị oku, ozi ma ọ bụ njikọ Cloud Run n'ezie. Azịza bụ ihe atụ; ọnụahịa bụ atụmatụ.",
    phone: "Nhọrọ ekwentị", start: "Malite oku ngosi", end: "Kwụsị oku", idle: "Oku agwụla", connected: "Oku ngosi na-arụ ọrụ", welcome: "Nnọọ na AgriSense. Pịa 1 maka ọnụahịa taa, 2 maka ahịa kacha mma, ma ọ bụ 3 maka ndụmọdụ ọrụ ugbo.",
    price: "Ọnụahịa taa", market: "Ahịa kacha mma", advice: "Ndụmọdụ ọrụ ugbo", menu: "Nhọrọ ndị bụ isi", replay: "Kpọọ ụda ọzọ", unavailable: "Ụda adịghị na ihe nchọgharị a. Azịza dị n'okpuru.",
    tips: "Lelee mmiri dị n'ala tupu ị gbaa mmiri. Wepụ ahịhịa n'oge, kpọtụrụ onye ọrụ ugbo tupu iji ọgwụ ahụhụ.",
    ppr: "Ngosipụta ọkwa PPR", enabled: "Nata ọkwa ngosi", message: "Ozi ọkwa ihe atụ", sample: "Ndụmọdụ ọhụrụ dị maka ihe ọkụkụ na obodo ị họọrọ.", send: "Gosi ozi PPR na-abata", inbox: "Igbe ọkwa ngosi", empty: "Ọkwa ngosi adịghị ugbu a", paused: "Akwụsịla ọkwa", delivered: "Anatala ọkwa ngosi", clear: "Hichapụ ọkwa", scope: "Ihe ọkụkụ na obodo", reset: "Ọ ga-apụ mgbe ị hapụrụ ibe a.",
  },
  yo: {
    title: "Àpẹẹrẹ fóònù àti PPR", note: "Àpẹẹrẹ nìkan · Kò sí ìpè, ìfiránṣẹ́ tàbí ìsopọ̀ Cloud Run gidi. Àwọn ìdáhùn jẹ́ àpẹẹrẹ; iye owó jẹ́ ìṣírò.",
    phone: "Àwọn àṣàyàn fóònù", start: "Bẹ̀rẹ̀ ìpè àpẹẹrẹ", end: "Parí ìpè", idle: "Ìpè ti parí", connected: "Ìpè àpẹẹrẹ ń ṣiṣẹ́", welcome: "Ẹ káàbọ̀ sí AgriSense. Tẹ 1 fún iye owó òní, 2 fún ọjà tó dára jù, tàbí 3 fún ìmọ̀ràn iṣẹ́ àgbẹ̀.",
    price: "Iye owó òní", market: "Ọjà tó dára jù", advice: "Ìmọ̀ràn iṣẹ́ àgbẹ̀", menu: "Àṣàyàn àkọ́kọ́", replay: "Tún ohùn gbọ́", unavailable: "Ohùn kò sí lórí ẹ̀rọ yìí. Ìdáhùn wà ní ìsàlẹ̀.",
    tips: "Ṣàyẹ̀wò ọrinrin ilẹ̀ kí o tó bomi rin. Yọ èpò kúrò ní kutukutu, kí o sì bá òṣìṣẹ́ àgbẹ̀ sọ̀rọ̀ kí o tó lo òògùn kòkòrò.",
    ppr: "Àpẹẹrẹ ìkìlọ̀ PPR", enabled: "Gba ìkìlọ̀ àpẹẹrẹ", message: "Ọ̀rọ̀ ìkìlọ̀ àpẹẹrẹ", sample: "Ìmọ̀ràn tuntun wà fún irúgbìn àti ìlú tí o yàn.", send: "Ṣe àpẹẹrẹ iṣẹlẹ̀ PPR tó wọlé", inbox: "Àpótí ìkìlọ̀ àpẹẹrẹ", empty: "Kò sí ìkìlọ̀ àpẹẹrẹ síbẹ̀", paused: "A ti dá ìkìlọ̀ dúró", delivered: "A ti gba ìkìlọ̀ àpẹẹrẹ", clear: "Pa ìkìlọ̀ rẹ́", scope: "Irúgbìn àti ìlú", reset: "Yóò parẹ́ nígbà tí o bá fi ojú ìwé yìí sílẹ̀.",
  },
};
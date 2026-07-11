import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "en" | "ig" | "ha" | "yo";

/**
 * SCOPE (deliberate):
 *   - Static UI labels, headers, subtitles, captions, buttons → translated.
 *   - AI-generated / data-derived prose (recommendation reason,
 *     seasonalInsight, marketNote, chat replies, buyer names, cities) → English.
 *     Machine-translating financial/agricultural claims risks inaccuracy that
 *     could mislead a farmer, so this stays in English until a native speaker
 *     reviews it.
 */

const DICT: Record<string, Record<Lang, string>> = {
  // -------- Navigation --------
  "nav.dashboard":  { en: "Dashboard",        ig: "Dashboọdụ",           ha: "Dashboard",          yo: "Dasibodu" },
  "nav.analytics":  { en: "Analytics",        ig: "Nyocha",              ha: "Bincike",            yo: "Ìtúpalẹ̀" },
  "nav.chat":       { en: "AI Assistant",     ig: "Onye Enyemaka AI",    ha: "Mataimakin AI",      yo: "Olùrànlọ́wọ́ AI" },
  "nav.my":         { en: "My Dashboard",     ig: "Dashboọdụ M",         ha: "Dashboard Na",       yo: "Dasibodu Mi" },
  "nav.coop":       { en: "My Cooperative",   ig: "Òtù M",               ha: "Ƙungiyar Ta",        yo: "Ẹgbẹ́ Mi" },
  "nav.ussd":       { en: "USSD Demo",        ig: "USSD Ngosipụta",      ha: "USSD Zanga",         yo: "Àpẹẹrẹ USSD" },
  "nav.signin":     { en: "Log in / Sign up", ig: "Banye / Debanye",     ha: "Shiga / Rijista",    yo: "Wọlé / Forúkọsílẹ̀" },
  "nav.signout":    { en: "Sign out",         ig: "Pụọ",                 ha: "Fita",               yo: "Jáde" },
  "nav.menu":       { en: "Menu",             ig: "Menu",                ha: "Manu",               yo: "Àkójọ" },
  "nav.tagline":    { en: "Market Intelligence", ig: "Ọgụgụ Isi Ahịa",   ha: "Bayanan Kasuwa",     yo: "Òye Ọjà" },

  // -------- Page titles --------
  "page.dashboard.title": { en: "Market Dashboard", ig: "Dashboọdụ Ahịa", ha: "Dashboard na Kasuwa", yo: "Dasibodu Ọjà" },
  "page.analytics.title": { en: "Price Analytics",  ig: "Nyocha Ọnụahịa", ha: "Bincike Farashi",     yo: "Ìtúpalẹ̀ Iye" },
  "page.chat.title":      { en: "AI Assistant",     ig: "Onye Enyemaka AI", ha: "Mataimakin AI",     yo: "Olùrànlọ́wọ́ AI" },
  "page.my.title":        { en: "My Dashboard",     ig: "Dashboọdụ M",    ha: "Dashboard Na",        yo: "Dasibodu Mi" },
  "page.coop.title":      { en: "My Cooperative",   ig: "Òtù M",          ha: "Ƙungiyar Ta",         yo: "Ẹgbẹ́ Mi" },
  "page.ussd.title":      { en: "USSD & SMS Demo",  ig: "USSD & SMS Ngosipụta", ha: "USSD & SMS Zanga", yo: "USSD & SMS Àpẹẹrẹ" },

  // -------- Page subtitles (templates: {crop}, {n}, {city}) --------
  "page.dashboard.subtitle": {
    en: "Compare {crop} prices across {n} Nigerian markets.",
    ig: "Tụlee ọnụahịa {crop} n'ahịa Naịjirịa {n}.",
    ha: "Kwatanta farashin {crop} a kasuwannin Najeriya {n}.",
    yo: "Fi iye {crop} wé láàrin ọjà Nàìjíríà {n}.",
  },
  "page.analytics.subtitle": {
    en: "Deeper look at {crop} market behavior.",
    ig: "Nyocha miri emi banyere ahịa {crop}.",
    ha: "Zurfin dubawa a halin kasuwar {crop}.",
    yo: "Ìwo jinlẹ̀ sí ìwà ọjà {crop}.",
  },
  "page.chat.subtitle": {
    en: "Answers use the same live dataset as the Dashboard and Analytics pages.",
    ig: "Azịza na-eji otu dataset ndụ ahụ dị na ibe Dashboọdụ na Nyocha.",
    ha: "Amsoshi suna amfani da bayanan kai tsaye kamar na Dashboard da Bincike.",
    yo: "Ìdáhùn máa ń lo dátà kannáà bíi ti Dasibodu àti Ìtúpalẹ̀.",
  },
  "page.ussd.subtitle": {
    en: "Reach farmers who don't have smartphones or reliable data.",
    ig: "Ruo ndị ọrụ ugbo na-enweghị ekwentị smartphone ma ọ bụ data.",
    ha: "Kai wa manoma masu rashin wayoyin salula ko intanet.",
    yo: "Dé ọ̀dọ̀ àwọn àgbẹ̀ tí kò ní ẹrọ ìbánisọ̀rọ̀ tàbí dátà tó dáa.",
  },
  "page.coop.subtitle": {
    en: "Pool produce with other farmers to reach bigger buyers and better prices.",
    ig: "Chịkọba mkpụrụ gị na ndị ọrụ ugbo ndị ọzọ iji rute ndị ahịa ka ukwuu na ọnụahịa ka mma.",
    ha: "Haɗa amfanin gona da sauran manoma domin isa masu saye masu girma da farashi mafi kyau.",
    yo: "Kó ohun ọ̀gbìn pọ̀ pẹ̀lú àwọn àgbẹ̀ mìíràn láti dé ọ̀dọ̀ àwọn olówó púpọ̀ àti iye tí ó dára.",
  },

  // -------- Common labels --------
  "label.crop":         { en: "Crop",         ig: "Ihe Ọkụkụ",     ha: "Amfani Gona",  yo: "Ohun Ọ̀gbìn" },
  "label.city":         { en: "City",         ig: "Obodo",         ha: "Birni",        yo: "Ìlú" },
  "label.price":        { en: "Price",        ig: "Ọnụahịa",       ha: "Farashi",      yo: "Iye" },
  "label.signal":       { en: "Signal",       ig: "Akara",         ha: "Sigina",       yo: "Ìdámí" },
  "label.qty":          { en: "Qty",          ig: "Ọnụọgụ",        ha: "Yawa",         yo: "Iye" },
  "label.date":         { en: "Date",         ig: "Ụbọchị",        ha: "Kwanan Wata",  yo: "Ọjọ́" },
  "label.vsRec":        { en: "vs Rec.",      ig: "vs Ntụnye",     ha: "vs Shawara",   yo: "vs Àbá" },
  "label.per":          { en: "per",          ig: "kwa",           ha: "kowace",       yo: "fún" },
  "label.name":         { en: "Full name",    ig: "Aha Zuru Oke",  ha: "Cikakken Suna", yo: "Orúkọ Kíkún" },
  "label.phone":        { en: "Phone",        ig: "Ekwentị",       ha: "Waya",         yo: "Ẹrọ Ìbánisọ̀rọ̀" },
  "label.phoneOpt":     { en: "Phone (optional)", ig: "Ekwentị (nhọrọ)", ha: "Waya (na son rai)", yo: "Ẹrọ Ìbánisọ̀rọ̀ (àṣàyàn)" },
  "label.primaryCrop":  { en: "Primary crop", ig: "Ihe Ọkụkụ Isi", ha: "Babban Amfani Gona", yo: "Ohun Ọ̀gbìn Àkọ́kọ́" },
  "label.password":     { en: "Password",     ig: "Paswọdụ",       ha: "Kalmar Sirri", yo: "Ọ̀rọ̀ Aṣínà" },
  "label.email":        { en: "Email",        ig: "Ozi-e",         ha: "Imel",         yo: "Ímeèlì" },
  "label.phoneNumber":  { en: "Phone number", ig: "Nọmba Ekwentị", ha: "Lambar Waya",  yo: "Nọ́mbà Ẹrọ Ìbánisọ̀rọ̀" },

  // -------- Card titles --------
  "card.aiRec":         { en: "AI Recommendation", ig: "Ntụnye AI",     ha: "Shawarwarin AI",     yo: "Àbá AI" },
  "card.personalRec":   { en: "Personalized Recommendation", ig: "Ntụnye Nkeonwe", ha: "Shawara Ta Sirri", yo: "Àbá Aládàáṣe" },
  "card.groupRec":      { en: "Group Recommendation", ig: "Ntụnye Òtù", ha: "Shawarar Ƙungiya",   yo: "Àbá Ẹgbẹ́" },
  "card.thisWeek":      { en: "This Week",         ig: "Izu A",         ha: "Wannan Mako",        yo: "Ọ̀sẹ̀ Yìí" },
  "card.next3":         { en: "Next 3 Weeks",      ig: "Izu 3 Na-abịa", ha: "Makonni 3 Masu Zuwa", yo: "Ọ̀sẹ̀ 3 Tí Ń Bọ̀" },
  "card.confidence":    { en: "Data Confidence",   ig: "Ntụkwasị Obi Data", ha: "Amincin Bayanai", yo: "Ìgbékẹ̀lé Dátà" },
  "card.priceTable":    { en: "City Price Comparison", ig: "Ntụnyere Ọnụahịa Obodo", ha: "Kwatanta Farashin Birni", yo: "Ìfiwéra Iye Ìlú" },
  "card.why":           { en: "Why This Matters",  ig: "Ihe Kpatara Nke A", ha: "Me Ya Sa Wannan", yo: "Ìdí Tí Ó Fi Ṣe Pàtàkì" },
  "card.alerts":        { en: "Price Alerts",      ig: "Ọkwa Ọnụahịa",  ha: "Faɗakarwar Farashi", yo: "Ìkìlọ̀ Iye" },
  "card.coopTeaser":    { en: "Group Selling",     ig: "Ire Ọnụ",       ha: "Sayarwar Ƙungiya",   yo: "Títà Ẹgbẹ́" },
  "card.buyers":        { en: "Buyer Contacts in {city}", ig: "Kọntaktị Ndị Ahịa na {city}", ha: "Lambobin Masu Saye a {city}", yo: "Àwọn Olówó ní {city}" },
  "card.marketSignal":  { en: "Market Signal",     ig: "Akara Ahịa",    ha: "Siginar Kasuwa",     yo: "Ìdámí Ọjà" },
  "card.volatility":    { en: "Price Volatility Index", ig: "Ntụleghachi Ọnụahịa", ha: "Ma'aunin Sauyin Farashi", yo: "Àtọ́ka Ìṣàn Iye" },
  "card.trend4wk":      { en: "4-Week Price Trend", ig: "Usoro Ọnụahịa Izu 4", ha: "Yanayin Farashi Na Makonni 4", yo: "Ìtòsí Iye Ọ̀sẹ̀ 4" },
  "card.seasonal":      { en: "Seasonal Insight",  ig: "Nghọta Oge",    ha: "Fahimtar Lokaci",    yo: "Òye Àkókò" },
  "card.seasonalDesc":  { en: "What to expect over the next 3 weeks", ig: "Ihe ị ga-atụ anya n'izu 3 na-abịa", ha: "Abin da za a sa ran a makonni 3 masu zuwa", yo: "Ohun tí a ó retí ní ọ̀sẹ̀ 3 tí ń bọ̀" },
  "card.myProduce":     { en: "My Produce",        ig: "Mkpụrụ M",      ha: "Amfanin Gonar Ta",   yo: "Ohun Ọ̀gbìn Mi" },
  "card.recordSale":    { en: "Record a Sale",     ig: "Depụta Ire",    ha: "Rikodin Sayarwa",    yo: "Kọ Títà" },
  "card.totalRevenue":  { en: "Total revenue",     ig: "Ego Nlọta Niile", ha: "Jimillar Kudin Shiga", yo: "Àpapọ̀ Owó Wíwọlé" },
  "card.totalVolume":   { en: "Total volume sold", ig: "Ọnụọgụ Niile A Rere", ha: "Jimillar Da Aka Sayar", yo: "Àpapọ̀ Iye Tí À Ta" },
  "card.variance":      { en: "Variance vs recommendation", ig: "Ọdịiche vs Ntụnye", ha: "Bambanci vs Shawara", yo: "Ìyàtọ̀ vs Àbá" },
  "card.favorites":     { en: "Favorite Markets",  ig: "Ahịa Ọkacha Mmasị", ha: "Kasuwannin Da Aka Fi So", yo: "Ọjà Àyànfẹ́" },
  "card.salesHistory":  { en: "Sales History",     ig: "Akụkọ Ire Ahịa", ha: "Tarihin Sayarwa",    yo: "Ìtàn Títà" },
  "card.revenuePerSale":{ en: "Revenue per sale",  ig: "Ego kwa Ire",   ha: "Kudin Shiga kowace Sayarwa", yo: "Owó fún Títà kọ̀ọ̀kan" },
  "card.savings":       { en: "Savings suggestion", ig: "Aro Nchekwa Ego", ha: "Shawarar Ajiya",   yo: "Àbá Ìṣúra" },
  "card.completeProfile":{ en: "Complete your profile", ig: "Mezue profaịlụ gị", ha: "Cika bayananka",  yo: "Parí àkọsílẹ̀ rẹ" },
  "card.updateProfile": { en: "Update profile",    ig: "Melite profaịlụ", ha: "Sabunta bayanai",   yo: "Ṣàtúnṣe àkọsílẹ̀" },
  "card.aggregated":    { en: "Aggregated Produce", ig: "Mkpụrụ Chịkọtara", ha: "Jimillar Amfanin Gona", yo: "Ohun Ọ̀gbìn Àkópọ̀" },
  "card.createCoop":    { en: "Create a cooperative", ig: "Mepụta Òtù",  ha: "Ƙirƙira ƙungiya",    yo: "Dá Ẹgbẹ́ sílẹ̀" },
  "card.joinCoop":      { en: "Join with a code",  ig: "Sonye site na koodu", ha: "Shiga da lamba", yo: "Dara pọ̀ pẹ̀lú kóòdù" },

  // -------- Card descriptions --------
  "desc.alerts": {
    en: "Get notified when {crop} hits your target price.",
    ig: "Nweta ọkwa mgbe {crop} ruru ọnụahịa gị.",
    ha: "Sami sanarwa idan {crop} ya kai farashinka.",
    yo: "Gba ìkìlọ̀ nígbà tí {crop} bá dé iye tí o fẹ́.",
  },
  "desc.coopTeaser": {
    en: "Farmers earn more when they sell together.",
    ig: "Ndị ọrụ ugbo na-enweta karịa mgbe ha na-ere ọnụ.",
    ha: "Manoma suna samun ƙari lokacin da suka sayar tare.",
    yo: "Àwọn àgbẹ̀ ń jẹ púpọ̀ nígbà tí wọ́n bá tà pọ̀.",
  },
  "desc.buyers": {
    en: "Reach out directly once you decide where to sell. Contacts who buy {crop} appear first.",
    ig: "Kpọtụrụ ozugbo ị kpebiri ebe ị ga-ere. Ndị na-azụ {crop} pụtara na mbụ.",
    ha: "Yi tuntuɓar kai tsaye da zarar ka yanke shawarar inda za ka sayar. Masu sayen {crop} sun fara bayyana.",
    yo: "Bá wọn sọ̀rọ̀ tààrà tí o bá pinnu ibi tí wàá tà. Àwọn tí ń ra {crop} yóò farahàn ní àkọ́kọ́.",
  },
  "desc.priceTable": {
    en: "{crop} — price per {unit}. Highest and lowest markets highlighted.",
    ig: "{crop} — ọnụahịa kwa {unit}. Ahịa kacha elu na nke kacha ala ka egosipụtara.",
    ha: "{crop} — farashi kowace {unit}. Kasuwanni mafi girma da mafi ƙasa an nuna.",
    yo: "{crop} — iye fún {unit}. Àwọn ọjà tó ga jùlọ àti tó kéré jùlọ ni a sàmì sí.",
  },
  "desc.trend4wk": {
    en: "National average, {crop} — per {unit}",
    ig: "Nkezi mba, {crop} — kwa {unit}",
    ha: "Matsakaicin ƙasa, {crop} — kowace {unit}",
    yo: "Àpapọ̀ orílẹ̀-èdè, {crop} — fún {unit}",
  },
  "desc.personalRec": {
    en: "Based on your city, primary crop, and current market prices.",
    ig: "Dabere na obodo gị, ihe ọkụkụ isi, na ọnụahịa ahịa ugbu a.",
    ha: "Bisa birninka, babban amfanin gonarka, da farashin kasuwa na yanzu.",
    yo: "Gẹ́gẹ́ bí ìlú rẹ, ohun ọ̀gbìn àkọ́kọ́, àti iye ọjà lọ́wọ́lọ́wọ́.",
  },
  "desc.myProduce": {
    en: "Inventory deducts automatically when you record a sale.",
    ig: "Ngwongwo na-ewepụ onwe ya mgbe ị depụtara ire.",
    ha: "Kayan ajiya na cirewa kai tsaye idan ka yi rikodin sayarwa.",
    yo: "Àkójọ máa dín kù láìṣàníyàn nígbà tí o bá kọ títà.",
  },
  "desc.recordSale": {
    en: "Compare your sale against AgriSense's recommendation.",
    ig: "Tụlee ire gị megide ntụnye AgriSense.",
    ha: "Kwatanta sayarwarka da shawarar AgriSense.",
    yo: "Fi títà rẹ wé àbá AgriSense.",
  },
  "desc.favorites": {
    en: "Star markets to compare against this week's best.",
    ig: "Kpaa ahịa iji tụlee megide nke kachasị mma izu a.",
    ha: "Tauraron kasuwanni domin kwatantawa da mafi kyawun wannan mako.",
    yo: "Fi ìràwọ̀ sí ọjà láti fiwé pẹ̀lú tó dára jùlọ ní ọ̀sẹ̀ yìí.",
  },
  "desc.salesHistory": {
    en: "Your recorded sales.",
    ig: "Ire gị e depụtara.",
    ha: "Sayarwarka da aka yi rikodin.",
    yo: "Àwọn títà tí o ti kọ.",
  },
  "desc.createCoop": {
    en: "You'll get a code to share with other farmers.",
    ig: "Ị ga-enweta koodu ị ga-akerịta ndị ọrụ ugbo ndị ọzọ.",
    ha: "Za ka sami lamba don raba wa sauran manoma.",
    yo: "O óò gba kóòdù láti pín pẹ̀lú àwọn àgbẹ̀ mìíràn.",
  },
  "desc.joinCoop": {
    en: "Enter the 6-character code from your cooperative lead.",
    ig: "Tinye koodu mkpụrụedemede 6 sitere n'aka onye isi òtù gị.",
    ha: "Shigar da lamba mai haruffa 6 daga shugaban ƙungiyarka.",
    yo: "Tẹ kóòdù olónìí-àmì 6 láti ọ̀dọ̀ olóri ẹgbẹ́ rẹ.",
  },
  "desc.aggregated": {
    en: "Total volume across all cooperative members",
    ig: "Ọnụọgụ niile n'etiti ndị òtù",
    ha: "Jimillar yawa a duk membobin ƙungiya",
    yo: "Àpapọ̀ iye láàrin gbogbo ọmọ ẹgbẹ́",
  },

  // -------- Buttons --------
  "btn.save":      { en: "Save",              ig: "Chekwaa",        ha: "Ajiye",       yo: "Fi pamọ́" },
  "btn.saveProfile":{ en: "Save profile",     ig: "Chekwaa profaịlụ", ha: "Ajiye bayanai", yo: "Fi àkọsílẹ̀ pamọ́" },
  "btn.add":       { en: "Add",               ig: "Tinye",          ha: "Ƙara",        yo: "Fikún" },
  "btn.addProduce":{ en: "Add produce",       ig: "Tinye Mkpụrụ",   ha: "Ƙara amfanin gona", yo: "Fi ohun ọ̀gbìn kún" },
  "btn.delete":    { en: "Delete",            ig: "Hichapụ",        ha: "Share",       yo: "Paarẹ́" },
  "btn.record":    { en: "Record Sale",       ig: "Depụta Ire",     ha: "Rikodin Sayarwa", yo: "Kọ Títà" },
  "btn.setAlert":  { en: "Set Alert",         ig: "Tọọ Ọkwa",       ha: "Saita Faɗakarwa", yo: "Ṣe Ìkìlọ̀" },
  "btn.create":    { en: "Create",            ig: "Mepụta",         ha: "Ƙirƙira",     yo: "Dá" },
  "btn.join":      { en: "Join",              ig: "Sonye",          ha: "Shiga",       yo: "Dara pọ̀" },
  "btn.signin":    { en: "Sign in",           ig: "Banye",          ha: "Shiga",       yo: "Wọlé" },
  "btn.createAccount":{ en: "Create account", ig: "Mepụta Akaụntụ", ha: "Ƙirƙiri asusu", yo: "Dá àkántì" },
  "btn.call":      { en: "Call",              ig: "Kpọọ",           ha: "Kira",        yo: "Pè" },
  "btn.whatsapp":  { en: "WhatsApp",          ig: "WhatsApp",       ha: "WhatsApp",    yo: "WhatsApp" },
  "btn.back":      { en: "← Back to market dashboard", ig: "← Laghachi na dashboọdụ ahịa", ha: "← Koma dashboard din kasuwa", yo: "← Padà sí dasibodu ọjà" },
  "btn.open":      { en: "Open My Cooperative →", ig: "Mepee Òtù M →", ha: "Bude Ƙungiyata →", yo: "Ṣí Ẹgbẹ́ Mi →" },

  // -------- Trend/status words --------
  "status.rising":  { en: "Rising",  ig: "Na-arị Elu",     ha: "Yana Hauhawa", yo: "Ń Gòkè" },
  "status.falling": { en: "Falling", ig: "Na-ada",         ha: "Yana Faɗuwa",  yo: "Ń Sọ̀kalẹ̀" },
  "status.stable":  { en: "Stable",  ig: "Kwụsiri Ike",    ha: "Barga",        yo: "Dúró Ṣinṣin" },
  "status.highest": { en: "Highest", ig: "Kachasị Elu",    ha: "Mafi Girma",   yo: "Ó Ga Jùlọ" },
  "status.lowest":  { en: "Lowest",  ig: "Kacha Ala",      ha: "Mafi Ƙasa",    yo: "Ó Kéré Jùlọ" },
  "status.average": { en: "Average", ig: "Nkezi",          ha: "Matsakaici",   yo: "Àpapọ̀" },
  "status.low":     { en: "Low",     ig: "Dị Ala",         ha: "Ƙasa",         yo: "Kéré" },
  "status.medium":  { en: "Medium",  ig: "Etiti",          ha: "Matsakaici",   yo: "Àárín" },
  "status.high":    { en: "High",    ig: "Dị Elu",         ha: "Girma",        yo: "Ga" },

  // -------- Alerts form / actions --------
  "alerts.dir":      { en: "Direction",  ig: "Ntụzịaka",     ha: "Alkibla",  yo: "Ìtọ́sọ́nà" },
  "alerts.above":    { en: "Rises above", ig: "Rịa karịa",   ha: "Ya haura", yo: "Gòkè kọjá" },
  "alerts.below":    { en: "Falls below", ig: "Dịda n'okpuru", ha: "Ya fadi ƙasa", yo: "Sọ̀kalẹ̀ jù" },
  "alerts.target":   { en: "Target ({unit})", ig: "Ebumnobi ({unit})", ha: "Manufa ({unit})", yo: "Àfojúsùn ({unit})" },
  "alerts.cityOpt":  { en: "City (optional)", ig: "Obodo (nhọrọ)", ha: "Birni (na son rai)", yo: "Ìlú (àṣàyàn)" },
  "alerts.anyCity":  { en: "Any city",   ig: "Obodo ọ bụla", ha: "Kowace birni", yo: "Ìlú èyíkéyìí" },

  // -------- Guest / auth --------
  "guest.nudge":   { en: "Sign up to save your data.", ig: "Debanye ka ị chekwaa data gị.", ha: "Yi rijista don ajiye bayananka.", yo: "Forúkọsílẹ̀ láti fi dátà rẹ pamọ́." },
  "auth.subtitle": { en: "Sign in with email or phone number", ig: "Banye site na ozi-e ma ọ bụ nọmba ekwentị", ha: "Shiga da imel ko lambar waya", yo: "Wọlé pẹ̀lú ímeèlì tàbí nọ́mbà ẹrọ" },
  "auth.tab.email":{ en: "Email", ig: "Ozi-e", ha: "Imel", yo: "Ímeèlì" },
  "auth.tab.phone":{ en: "Phone", ig: "Ekwentị", ha: "Waya", yo: "Ẹrọ" },
  "auth.tab.signin":{ en: "Sign in", ig: "Banye", ha: "Shiga", yo: "Wọlé" },
  "auth.tab.signup":{ en: "Create account", ig: "Mepụta Akaụntụ", ha: "Ƙirƙiri asusu", yo: "Dá àkántì" },
  "auth.pwdHint":  { en: "Password (min 6 chars)", ig: "Paswọdụ (opekarịa 6 mkpụrụedemede)", ha: "Kalmar sirri (min haruffa 6)", yo: "Ọ̀rọ̀ Aṣínà (ó kéré tán àmì 6)" },

  // -------- Chat page extras --------
  "chat.send":         { en: "Send message", ig: "Ziga ozi", ha: "Aika saƙo", yo: "Firanṣẹ́ ìránṣẹ́" },
  "chat.errorFallback":{ en: "Something went wrong", ig: "Ihe adịghị mma emere", ha: "Wani abu ya faskara", yo: "Nkan kan ṣàṣìṣe" },

  // -------- My Dashboard extras --------
  "my.revenueTrend":   { en: "Your financial trend over time", ig: "Usoro ego gị n'ime oge", ha: "Yanayin kudinka a kan lokaci", yo: "Ìtòsí owó rẹ ní àkókò" },
  "my.deleteCrop":     { en: "Delete {crop}", ig: "Hichapụ {crop}", ha: "Share {crop}", yo: "Paarẹ́ {crop}" },
  "my.ofCrop":         { en: "of {crop}", ig: "nke {crop}", ha: "na {crop}", yo: "ti {crop}" },
  "my.unitsSuffix":    { en: "units", ig: "iberibe", ha: "raka'oi", yo: "ẹ̀ka" },
  "my.perUnit":        { en: "per unit", ig: "kwa otu", ha: "kowace raka'i", yo: "fún ẹ̀ka" },
  "my.avgPerUnit":     { en: "avg {price}/unit · {qty} units", ig: "nkezi {price}/otu · {qty} iberibe", ha: "matsakaici {price}/raka'i · {qty} raka'oi", yo: "àpapọ̀ {price}/ẹ̀ka · {qty} ẹ̀ka" },
  "ph.qty":            { en: "Qty", ig: "Ọnụọgụ", ha: "Yawa", yo: "Iye" },
  "ph.quantity":       { en: "Quantity", ig: "Ọnụọgụ", ha: "Yawa", yo: "Iye" },
  "ph.unit":           { en: "baskets", ig: "nkata", ha: "kwando", yo: "agbọ̀n" },
  "ph.pricePerUnit":   { en: "Price per unit (₦)", ig: "Ọnụahịa kwa otu (₦)", ha: "Farashi kowace raka'i (₦)", yo: "Iye fún ẹ̀ka (₦)" },
  "ph.name":           { en: "Name", ig: "Aha", ha: "Suna", yo: "Orúkọ" },
  "toast.profileSaved":{ en: "Profile saved", ig: "E chekwara profaịlụ", ha: "An ajiye bayanai", yo: "A fi àkọsílẹ̀ pamọ́" },
  "toast.produceAdded":{ en: "Produce added", ig: "Etinyere mkpụrụ", ha: "An ƙara amfanin gona", yo: "A fi ohun ọ̀gbìn kún" },
  "toast.saleRecorded":{ en: "Sale recorded.", ig: "E depụtara ire.", ha: "An yi rikodin sayarwa.", yo: "A kọ títà." },
  "toast.saleWithRec": {
    en: "Recorded. AgriSense recommended {city} at {price} — {diff} more per {unit}.",
    ig: "E depụtara. AgriSense tụnyere {city} na {price} — {diff} karịa kwa {unit}.",
    ha: "An rikodi. AgriSense ya ba da shawarar {city} akan {price} — {diff} ƙari kowace {unit}.",
    yo: "A kọ. AgriSense dábàá {city} ní {price} — {diff} sí i fún {unit}.",
  },

  // -------- Dashboard misc --------
  "wel.back":     { en: "Welcome, {name}", ig: "Nnọọ, {name}", ha: "Barka da zuwa, {name}", yo: "Káàbọ̀, {name}" },
  "wel.subtitle": { en: "Farming in {city} · Primary crop: {crop}", ig: "Ọrụ ugbo na {city} · Ihe Ọkụkụ Isi: {crop}", ha: "Noma a {city} · Babban amfani: {crop}", yo: "Àgbẹ̀ ní {city} · Ohun Ọ̀gbìn Àkọ́kọ́: {crop}" },
  "empty.produce":{ en: "No produce yet.", ig: "Enweghị mkpụrụ ma.", ha: "Babu amfanin gona tukuna.", yo: "Kò sí ohun ọ̀gbìn síbẹ̀." },
  "empty.sales":  { en: "No sales logged yet.", ig: "Enweghị ire e depụtara.", ha: "Babu sayarwar da aka yi rikodin.", yo: "Kò sí títà tí à ti kọ." },
  "empty.produceHint":{ en: "Add produce below for a total-earnings estimate.", ig: "Tinye mkpụrụ n'okpuru maka atụmatụ nkwụghachi ụgwọ zuru oke.", ha: "Ƙara amfanin gona a ƙasa don ƙididdigar jimillar kudin shiga.", yo: "Fi ohun ọ̀gbìn kún nísàlẹ̀ fún àyẹ̀wò àpapọ̀ owó tí a ó rí." },
  "misc.loading": { en: "Loading…", ig: "Na-ebugote…", ha: "Ana lodawa…", yo: "Ń lo…" },
  "misc.acrossSales": { en: "Across {n} recorded sales", ig: "N'ofe ire e depụtara {n}", ha: "A cikin sayarwa {n} da aka yi rikodin", yo: "Láàrin títà {n} tí à ti kọ" },
  "misc.combined": { en: "Combined units across all crops", ig: "Ọnụọgụ jikọtara ọnụ na ihe ọkụkụ niile", ha: "Yawan haɗe a duk amfanin gona", yo: "Àpapọ̀ iye láàrin gbogbo ohun ọ̀gbìn" },
  "misc.variancePos": { en: "Money left on the table by not selling in the recommended city.", ig: "Ego a hapụrụ n'ihi na erebeghị n'obodo a tụnyere.", ha: "Kudin da aka bari saboda rashin sayarwa a birnin da aka ba da shawara.", yo: "Owó tí a fi sílẹ̀ nítorí àìtà ní ìlú tí a dábàá." },
  "misc.varianceNeg": { en: "You matched or beat the recommendation. Nice.", ig: "I dabara ma ọ bụ merichaa ntụnye ahụ. Ọ dị mma.", ha: "Ka daidaita ko ka wuce shawarar. Yayi kyau.", yo: "O bá àbá mu tàbí kọjá rẹ̀. Ó dára." },
  "misc.savings":   { en: "Consider setting aside {amount} (10% of your recorded revenue) for next season's inputs — seeds, fertilizer, transport.", ig: "Chegodee idobe {amount} (10% nke ego gị e depụtara) maka ihe oge na-abịa — mkpụrụ, fatịlaịza, ụgbọ.", ha: "Yi la'akari da ajiye {amount} (10% na kudin shigarka) don shigar da lokaci mai zuwa — iri, taki, sufuri.", yo: "Ronú láti pa {amount} mọ́ (10% owó tí o rí) fún àkókò tí ń bọ̀ — irúgbìn, ajílẹ̀, ìrìnnà." },
  "misc.bestFor":   { en: "Best market for {crop} this week:", ig: "Ahịa kachasị mma maka {crop} n'izu a:", ha: "Kasuwa mafi kyau ga {crop} wannan mako:", yo: "Ọjà tó dára jùlọ fún {crop} ní ọ̀sẹ̀ yìí:" },
  "misc.byCrop":    { en: "By crop:", ig: "Site na ihe ọkụkụ:", ha: "Ta amfanin gona:", yo: "Ní ohun ọ̀gbìn:" },
  "misc.avg":       { en: "avg", ig: "nkezi", ha: "matsakaici", yo: "àpapọ̀" },
  "misc.best":      { en: "best", ig: "kacha mma", ha: "mafi kyau", yo: "tó dára jùlọ" },
  "misc.vsBest":    { en: "vs best", ig: "vs kacha mma", ha: "vs mafi kyau", yo: "vs tó dára jùlọ" },
  "misc.completeProfileDesc": { en: "Tell us where you farm so we can personalize recommendations.", ig: "Gwa anyị ebe ị na-akọ ka anyị nwee ike ime ntụnye nkeonwe.", ha: "Gaya mana inda kake noma don mu keɓance shawarwari.", yo: "Sọ fún wa ibi tí o ń kọ́ ohun ọ̀gbìn kí a lè ṣe àbá àdámọ́ra." },
  "misc.completeName": { en: "Full name", ig: "Aha zuru oke", ha: "Cikakken suna", yo: "Orúkọ kíkún" },
  "misc.copied":    { en: "Copied", ig: "E depụtara", ha: "An kwafe", yo: "A dì tà" },
  "misc.member":    { en: "member", ig: "onye òtù", ha: "memba", yo: "ọmọ ẹgbẹ́" },
  "misc.members":   { en: "members", ig: "ndị òtù", ha: "membobi", yo: "àwọn ọmọ ẹgbẹ́" },
  "misc.joinCode":  { en: "Join code", ig: "Koodu Nsonye", ha: "Lambar shiga", yo: "Kóòdù ìdara pọ̀" },
  "misc.noAggregated": { en: "No produce logged by members yet. Ask members to add produce in their My Dashboard.", ig: "Ndị òtù edepụtabeghị mkpụrụ. Rịọ ha ka ha tinye mkpụrụ na Dashboọdụ M ha.", ha: "Membobi ba su yi rikodin amfanin gona ba tukuna. Nemi su ƙara amfanin gona a Dashboardinsu.", yo: "Àwọn ọmọ ẹgbẹ́ kò tíì kọ ohun ọ̀gbìn síbẹ̀. Bí wọn kí wọ́n fi kún inú Dasibodu Wọn." },
  "coop.totalVol":  { en: "Total volume",     ig: "Ọnụọgụ niile", ha: "Jimillar yawa", yo: "Àpapọ̀ iye" },
  "coop.contribs":  { en: "Contributors",     ig: "Ndị Tinyere Aka", ha: "Masu bayarwa", yo: "Àwọn olùtọrẹ" },
  "coop.bestMkt":   { en: "Best market",      ig: "Ahịa Kacha Mma", ha: "Kasuwa mafi kyau", yo: "Ọjà tó dára jùlọ" },
  "coop.namePlaceholder":{ en: "Jos Tomato Growers", ig: "Ndị Na-akọ Tomato Jos", ha: "Manoman Tumatir na Jos", yo: "Àwọn Ọ̀gbìn Tòmátì Jos" },
  "coop.namelabel": { en: "Cooperative name", ig: "Aha Òtù", ha: "Sunan ƙungiya", yo: "Orúkọ Ẹgbẹ́" },
  "coop.joinLabel": { en: "Join code",        ig: "Koodu Nsonye", ha: "Lambar shiga", yo: "Kóòdù ìdara pọ̀" },

  // -------- Volatility comments --------
  "vol.low":    { en: "Stable pricing, predictable margins.", ig: "Ọnụahịa kwụsiri ike, uru a na-atụ anya.", ha: "Farashi barga, ribar hasashe.", yo: "Iye dúró ṣinṣin, èrè tí a lè fojúsùn." },
  "vol.medium": { en: "Some week-to-week swing — plan sales carefully.", ig: "Mgbanwe izu na izu — hazie ire nke ọma.", ha: "Ana sauyawa mako-mako — tsara sayarwa a hankali.", yo: "Ìyípadà lati ọ̀sẹ̀ dé ọ̀sẹ̀ — ṣèto títà pẹ̀lú ìṣọ́ra." },
  "vol.high":   { en: "Sharp price movements — time your sale carefully.", ig: "Mgbanwe ọnụahịa dị egwu — họrọ oge ire gị nke ọma.", ha: "Manyan sauye-sauyen farashi — zaɓi lokacin sayarwa a hankali.", yo: "Ìyípadà iye tó lágbára — yan àkókò títà pẹ̀lú ìṣọ́ra." },

  // -------- Data confidence tooltip --------
  "confidence.tip": {
    en: "Confidence is derived from crop-level price volatility. \"High\" = stable weekly trend; \"Limited\" = high volatility, treat as directional guidance only. This prototype uses simulated data.",
    ig: "Ntụkwasị obi sitere na mgbanwe ọnụahịa ihe ọkụkụ. \"Dị Elu\" = usoro izu kwụsiri ike; \"Nwere Oke\" = mgbanwe dị elu, jiri ya dị ka nduzi ntụzịaka nanị. Prototype a na-eji data enyocha.",
    ha: "Amincin ya fito daga sauyin farashi na amfanin gona. \"Girma\" = yanayin makon barga; \"Iyakance\" = sauye-sauye masu yawa, kula da shi a matsayin ja-gora kawai. Wannan samfurin yana amfani da bayanan kwaikwayo.",
    yo: "Ìgbékẹ̀lé wá láti inú ìyípadà iye ohun ọ̀gbìn. \"Ga\" = ìtòsí ọ̀sẹ̀ ó dúró; \"Ó lópin\" = ìyípadà púpọ̀, lo bí ìtọ́ni ìtọ́sọ́nà nìkan. Àpẹẹrẹ yìí ń lo dátà tí a fojú.",
  },

  // -------- "Why this matters" --------
  "why.p1": {
    en: "Smallholder farmers in Nigeria lose an estimated 30–50% of their harvest value each year due to poor market information — selling at the wrong time, in the wrong city, or accepting the first buyer's price.",
    ig: "Ndị obere ọrụ ugbo na Naịjirịa na-atụfu ihe dịka 30–50% nke uru ọrụ ha kwa afọ n'ihi ozi ahịa adịghị mma — na-ere n'oge na-ezighị ezi, n'obodo na-ezighị ezi, ma ọ bụ ịnabata ọnụahịa onye ahịa mbụ.",
    ha: "Ƙananan manoma a Najeriya suna asara kimanin kashi 30–50% na darajar amfanin gonarsu duk shekara saboda rashin bayanin kasuwa — sayarwa a lokacin da bai dace ba, a birnin da bai dace ba, ko karɓar farashin mai saye na farko.",
    yo: "Àwọn àgbẹ̀ kékeré ní Nàìjíríà ń pàdánù nípa 30–50% iye ìkórè wọn lọ́dọọdún nítorí àìní ìwífún ọjà — títà ní àkókò tí kò yẹ, ní ìlú tí kò yẹ, tàbí gbígba iye olówó àkọ́kọ́.",
  },
  "why.p2": {
    en: "AgriSense AI closes that gap by turning raw market data into a clear answer to the only question that matters: where and when should I sell to earn the most?",
    ig: "AgriSense AI na-emechi oghere ahụ site n'ịtụgharị data ahịa n'ime azịza doro anya na ajụjụ nanị ya dị mkpa: ebee na kedu mgbe ka m ga-ere iji nweta karịa?",
    ha: "AgriSense AI yana rufe wannan gibi ta hanyar sauya bayanan kasuwa zuwa amsa a fili ga tambaya ɗaya kaɗai da take da mahimmanci: ina kuma yaushe zan sayar don samun mafi girma?",
    yo: "AgriSense AI ń dí àlàfo yìí nípa ìsàn dátà ọjà di ìdáhùn tó ṣe kedere sí ìbéèrè kan tí ó ṣe pàtàkì: níbo àti nígbà wo ni mo yẹ láti tà kí n rí èrè jùlọ?",
  },

  // -------- Buyers disclaimer + fallbacks --------
  "buyers.disclaimer": {
    en: "Sample contacts for demo purposes. In production this would connect to verified buyers, cooperatives, and commodity exchanges (NBS, AFEX, and state agricultural boards).",
    ig: "Kọntaktị ihe atụ maka ngosipụta. Na mmepụta, nke a ga-ejikọta ndị ahịa akwadoro, òtù, na ndị mgbanwe ngwaahịa (NBS, AFEX, na ndị bọọdụ ọrụ ugbo steeti).",
    ha: "Samfurin lambobi don manufar zanga-zanga. A samarwa wannan zai haɗa da tabbatattun masu saye, ƙungiyoyi, da musanyar kayayyaki (NBS, AFEX, da hukumomin noma na jiha).",
    yo: "Àwọn kọ́ńtákítì àpẹẹrẹ fún ìdí àpẹẹrẹ. Ní ìṣẹ̀dá, èyí yóò darapọ̀ mọ́ àwọn olówó tí a ti fọwọ́ sí, àwọn ẹgbẹ́, àti àwọn pàṣípààrọ̀ ọjà (NBS, AFEX, àti àwọn bọ́ọ̀dì ọ̀gbìn ìpínlẹ̀).",
  },
  "buyers.none": {
    en: "No buyer contacts listed for {crop} in {city} yet.",
    ig: "Enwebeghị kọntaktị ndị ahịa maka {crop} na {city}.",
    ha: "Ba a jera masu saye don {crop} a {city} tukuna.",
    yo: "Kò sí kọ́ńtákítì olówó fún {crop} ní {city} síbẹ̀.",
  },
  "buyers.noSpec": {
    en: "No buyers in {city} list {crop} as a specialty — showing other active buyers here who may still be worth contacting.",
    ig: "Enweghị ndị ahịa na {city} dere {crop} dị ka ọkachamara — na-egosi ndị ahịa ndị ọzọ na-arụ ọrụ ebe a bụ ndị nwere ike ịkpọ.",
    ha: "Babu masu saye a {city} da suka lissafta {crop} a matsayin ƙwarewa — ana nuna sauran masu sayen nan da wataƙila suka cancanci tuntuɓa.",
    yo: "Kò sí olówó ní {city} tí ó tò {crop} gẹ́gẹ́ bí àṣẹ́wè — a ń fi àwọn olówó tí ń ṣiṣẹ́ mìíràn hàn níhìn-ín tí ó tún tọ́ láti bá sọ̀rọ̀.",
  },
  "buyers.buysThis": { en: "Buys this crop", ig: "Na-azụ ihe ọkụkụ a", ha: "Yana sayen wannan gona", yo: "Ń ra ohun ọ̀gbìn yìí" },

  // -------- USSD page strings --------
  "ussd.mockup":    { en: "Concept mockup — not a live telecom integration.", ig: "Ihe atụ echiche — ọ bụghị njikọ telecom dị ndụ.", ha: "Samfurin ra'ayi — ba haɗin telecom ba ne mai aiki.", yo: "Àpẹẹrẹ ìròyìn — kì í ṣe àṣepọ̀ telecom tí ó wà láàyè." },
  "ussd.mockup.rest":{ en: "This screen illustrates how AgriSense AI would deliver market intelligence over USSD/SMS in a production deployment (partnering with a Nigerian telco).", ig: "Ihuenyo a na-egosi otu AgriSense AI ga-esi bunye ọgụgụ isi ahịa site na USSD/SMS na mmepụta (na-akpakọrịta na telco Naịjirịa).", ha: "Wannan allon yana nuna yadda AgriSense AI za ta bayar da bayanan kasuwa ta USSD/SMS a aikace (haɗin gwiwa da telco na Najeriya).", yo: "Àpẹẹrẹ yìí ń fi ọ̀nà tí AgriSense AI yóò gbà firanṣẹ́ ìwífún ọjà nípasẹ̀ USSD/SMS hàn ní ìṣẹ̀dá (àjọṣepọ̀ pẹ̀lú telco Nàìjíríà)." },
  "ussd.dial":      { en: "Dial *347*AGRI#", ig: "Kpọọ *347*AGRI#", ha: "Buga *347*AGRI#", yo: "Tẹ *347*AGRI#" },
  "ussd.featureMenu":{ en: "Feature-phone menu", ig: "Menu ekwentị bụ isi", ha: "Manun wayar salula", yo: "Àkójọ ẹrọ ìbánisọ̀rọ̀" },
  "ussd.smsTitle":  { en: "Sample SMS reply", ig: "Ihe atụ nzaghachi SMS", ha: "Samfurin amsar SMS", yo: "Àpẹẹrẹ ìdáhùn SMS" },
  "ussd.smsDesc":   { en: "After selecting \"1. Today's price\"", ig: "Mgbe ị họrọchara \"1. Ọnụahịa taa\"", ha: "Bayan zaɓar \"1. Farashin yau\"", yo: "Lẹ́yìn yíyàn \"1. Iye òní\"" },
  "ussd.whyTitle":  { en: "Why USSD/SMS matters", ig: "Ihe kpatara USSD/SMS ji dị mkpa", ha: "Me ya sa USSD/SMS ke da mahimmanci", yo: "Ìdí tí USSD/SMS fi ṣe pàtàkì" },
  "ussd.why.p1":    { en: "Over 60% of Nigerian smallholder farmers use feature phones. A web-only app locks them out of the very information they need most.", ig: "Ihe karịrị 60% nke obere ndị ọrụ ugbo Naịjirịa na-eji ekwentị bụ isi. Ngwa naanị weebụ na-akpọchi ha ozi ha kacha chọọ.", ha: "Fiye da kashi 60% na ƙananan manoman Najeriya suna amfani da wayoyin salula. Manhajar yanar gizo kaɗai tana rufe musu bayanan da suka fi buƙata.", yo: "Ju 60% àwọn àgbẹ̀ kékeré Nàìjíríà lo ẹrọ ìbánisọ̀rọ̀ lásán. Ohun èlò wẹ́ẹ̀bù nìkan ń dí wọn kúrò lọ́wọ́ ìwífún tí wọ́n nílò jùlọ." },
  "ussd.why.p2":    { en: "USSD works on every GSM phone, requires no data, and costs cents per session — the right last mile for market intelligence.", ig: "USSD na-arụ ọrụ na ekwentị GSM ọ bụla, achọghị data, ọ dịkwa ọnụ ala kwa oge — ụzọ ikpeazụ ziri ezi maka ọgụgụ isi ahịa.", ha: "USSD yana aiki a kowace wayar GSM, ba ya buƙatar bayanai, kuma yana kashe kudi kaɗan a kowane zama — hanya madaidaiciya ta ƙarshe don bayanan kasuwa.", yo: "USSD ń ṣiṣẹ́ lórí gbogbo ẹrọ GSM, kò nílò dátà, ó sì gbé owó díẹ̀ fún ìpàdé kọ̀ọ̀kan — ọ̀nà tó tọ́ jùlọ fún ìwífún ọjà." },
  "ussd.why.p3":    { en: "Same recommendations. Same live data. Delivered where the farmers actually are.", ig: "Otu ntụnye ahụ. Otu data ndụ ahụ. E bunyere ebe ndị ọrụ ugbo nọ.", ha: "Shawarwari iri ɗaya. Bayanai iri ɗaya kai tsaye. An kai su inda manoma suke.", yo: "Àwọn àbá kannáà. Dátà kannáà lọ́wọ́lọ́wọ́. A firanṣẹ́ sí ibi tí àwọn àgbẹ̀ wà ní ojoojúmọ́." },
  "ussd.seeDashboard": { en: "see dashboard", ig: "lee dashboọdụ", ha: "duba dashboard", yo: "wo dasibodu" },

  // -------- Chat --------
  "chat.assistant":  { en: "AgriSense Assistant", ig: "Onye Enyemaka AgriSense", ha: "Mataimakin AgriSense", yo: "Olùrànlọ́wọ́ AgriSense" },
  "chat.grounded":   { en: "Grounded in this week's market data", ig: "Dabere na data ahịa izu a", ha: "Dogaro da bayanan kasuwar wannan mako", yo: "A gbé kalẹ̀ lórí dátà ọjà ọ̀sẹ̀ yìí" },
  "chat.placeholder":{ en: "Where should I sell maize this week?", ig: "Ebee ka m ga-ere ọka izu a?", ha: "Ina zan sayar da masara wannan mako?", yo: "Níbo ni mo yẹ láti ta àgbàdo ní ọ̀sẹ̀ yìí?" },
  "chat.thinking":   { en: "Thinking…", ig: "Na-eche echiche…", ha: "Ana tunani…", yo: "Ń ronú…" },
  "chat.greeting":   { en: "Hello! I'm AgriSense AI. Ask me things like:\n• Where should I sell maize this week?\n• Which city has the highest price for tomatoes?\n• Should I hold my yam or sell now?",
                       ig: "Ndewo! Abụ m AgriSense AI. Jụọ m ihe ndị dị ka:\n• Ebee ka m ga-ere ọka izu a?\n• Kedu obodo nwere ọnụahịa kacha elu maka tomato?\n• M ga-ejide ji m ka m ree ugbu a?",
                       ha: "Sannu! Ni ne AgriSense AI. Ka tambaye ni abubuwa kamar:\n• Ina zan sayar da masara wannan mako?\n• Wace birni ce ke da farashi mafi girma ga tumatir?\n• In riƙe doyata ko in sayar yanzu?",
                       yo: "Pẹlẹ o! Èmi ni AgriSense AI. Béèrè lọ́wọ́ mi bíi:\n• Níbo ni mo yẹ láti ta àgbàdo ní ọ̀sẹ̀ yìí?\n• Ìlú wo ló ní iye tòmátì tí ó ga jùlọ?\n• Ṣé kí n dì iṣu mú ni tàbí kí n tà báyìí?" },

  // -------- Data disclosure footer --------
  "footer.demo":   { en: "Demo dataset.", ig: "Data ngosipụta.", ha: "Bayanan zanga.", yo: "Dátà àpẹẹrẹ." },
  "footer.demoBody": {
    en: "Prices shown are simulated for the 3MTT Knowledge Showcase prototype. In production this feed would integrate with sources such as the National Bureau of Statistics (NBS), AFEX Commodities Exchange, and state agricultural boards.",
    ig: "Ọnụahịa ndị e gosipụtara bụ nke a mere maka prototype 3MTT Knowledge Showcase. Na mmepụta, nke a ga-ejikọta ọnụ na isi mmalite dị ka National Bureau of Statistics (NBS), AFEX Commodities Exchange, na ndị bọọdụ ọrụ ugbo steeti.",
    ha: "Farashin da aka nuna kwaikwayo ne ga samfurin nunin ilimin 3MTT. A samarwa wannan zai haɗa da tushen kamar Hukumar Kididdiga ta Ƙasa (NBS), Musanyar Kayayyaki na AFEX, da hukumomin noma na jihohi.",
    yo: "Iye tí a fihàn jẹ́ àfarawé fún àpẹẹrẹ 3MTT Knowledge Showcase. Ní ìṣẹ̀dá, èyí yóò darapọ̀ mọ́ àwọn orísun bíi National Bureau of Statistics (NBS), AFEX Commodities Exchange, àti àwọn bọ́ọ̀dì ọ̀gbìn ìpínlẹ̀.",
  },
};

// -------- Crop-name translations --------
const CROP_DICT: Record<string, Record<Lang, string>> = {
  "Tomatoes":     { en: "Tomatoes",    ig: "Tomato",         ha: "Tumatir",  yo: "Tòmátì" },
  "Rice":         { en: "Rice",        ig: "Osikapa",        ha: "Shinkafa", yo: "Ìrẹsì" },
  "Maize":        { en: "Maize",       ig: "Ọka",            ha: "Masara",   yo: "Àgbàdo" },
  "Yam":          { en: "Yam",         ig: "Ji",             ha: "Doya",     yo: "Iṣu" },
  "Cassava":      { en: "Cassava",     ig: "Akpụ",           ha: "Rogo",     yo: "Ẹ̀gẹ́" },
  "Sorghum":      { en: "Sorghum",     ig: "Ọka Guinea",     ha: "Dawa",     yo: "Òkà bàbà" },
  "Millet":       { en: "Millet",      ig: "Achịcha",        ha: "Gero",     yo: "Jero" },
  "Groundnut":    { en: "Groundnut",   ig: "Ahụekere",       ha: "Gyada",    yo: "Ẹ̀pà" },
  "Beans/Cowpea": { en: "Beans/Cowpea", ig: "Agwa",          ha: "Wake",     yo: "Ẹ̀wà" },
  "Plantain":     { en: "Plantain",    ig: "Abrịka",         ha: "Ayaba",    yo: "Ọ̀gẹ̀dẹ̀ àgbagbà" },
  "Onion":        { en: "Onion",       ig: "Yabasị",         ha: "Albasa",   yo: "Àlùbọ́sà" },
  "Pepper":       { en: "Pepper",      ig: "Ose",            ha: "Barkono",  yo: "Ata" },
  "Palm Oil":     { en: "Palm Oil",    ig: "Mmanụ Nkwụ",     ha: "Manja",    yo: "Epo Pupa" },
};

// -------- Crop-category translations --------
const CAT_DICT: Record<string, Record<Lang, string>> = {
  "Grains":     { en: "Grains",     ig: "Mkpụrụ Ọka",      ha: "Hatsi",       yo: "Ọkà" },
  "Tubers":     { en: "Tubers",     ig: "Mkpụrụ Ala",      ha: "Amfanin Zurfi", yo: "Iṣu-jíjẹ" },
  "Vegetables": { en: "Vegetables", ig: "Akwụkwọ Nri",     ha: "Ganyaye",     yo: "Ewébẹ̀" },
  "Cash Crops": { en: "Cash Crops", ig: "Ihe Ọkụkụ Ego",   ha: "Amfani Na Kuɗi", yo: "Ohun Ọ̀gbìn Owó" },
};

// -------- Unit translations (keyed by English unit string from market-data) --------
const UNIT_DICT: Record<string, Record<Lang, string>> = {
  "basket (50kg)":          { en: "basket (50kg)",     ig: "nkata (50kg)",           ha: "kwando (50kg)",       yo: "agbọ̀n (50kg)" },
  "basket (30kg)":          { en: "basket (30kg)",     ig: "nkata (30kg)",           ha: "kwando (30kg)",       yo: "agbọ̀n (30kg)" },
  "50kg bag":               { en: "50kg bag",          ig: "akpa 50kg",              ha: "buhun 50kg",          yo: "àpò 50kg" },
  "100kg bag":              { en: "100kg bag",         ig: "akpa 100kg",             ha: "buhun 100kg",         yo: "àpò 100kg" },
  "100kg bag (fresh)":      { en: "100kg bag (fresh)", ig: "akpa 100kg (ọhụrụ)",     ha: "buhun 100kg (sabo)",  yo: "àpò 100kg (tuntun)" },
  "100kg bag (shelled)":    { en: "100kg bag (shelled)", ig: "akpa 100kg (a wapụrụ)", ha: "buhun 100kg (fesa)", yo: "àpò 100kg (láìsí ìkarahun)" },
  "tuber (medium)":         { en: "tuber (medium)",    ig: "otu ji (etiti)",         ha: "doya (matsakaici)",   yo: "iṣu (àárín)" },
  "bunch (medium)":         { en: "bunch (medium)",    ig: "ụyọkọ (etiti)",          ha: "damin (matsakaici)",  yo: "ìdì (àárín)" },
  "25L jerry can":          { en: "25L jerry can",     ig: "gala 25L",               ha: "gwangwa 25L",         yo: "kèníkàn 25L" },
  // Free-form / user-entered units
  "baskets":                { en: "baskets",           ig: "nkata",                  ha: "kwando",              yo: "agbọ̀n" },
  "basket":                 { en: "basket",            ig: "nkata",                  ha: "kwando",              yo: "agbọ̀n" },
  "units":                  { en: "units",             ig: "iberibe",                ha: "raka'oi",             yo: "ẹ̀ka" },
  "unit":                   { en: "unit",              ig: "otu",                    ha: "raka'i",              yo: "ẹ̀ka kan" },
};

interface I18nCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
  tf: (key: string, params: Record<string, string | number>) => string;
  tCrop: (crop: string) => string;
  tCategory: (cat: string) => string;
  tUnit: (unit: string) => string;
}
const Ctx = createContext<I18nCtx>({
  lang: "en", setLang: () => {},
  t: (k) => k, tf: (k) => k, tCrop: (c) => c, tCategory: (c) => c, tUnit: (u) => u,
});

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
  const tf = (key: string, params: Record<string, string | number>) =>
    t(key).replace(/\{(\w+)\}/g, (_, k) => String(params[k] ?? ""));
  const tCrop = (crop: string) => CROP_DICT[crop]?.[lang] ?? crop;
  const tCategory = (cat: string) => CAT_DICT[cat]?.[lang] ?? cat;
  const tUnit = (unit: string) => UNIT_DICT[unit]?.[lang] ?? unit;
  return <Ctx.Provider value={{ lang, setLang, t, tf, tCrop, tCategory, tUnit }}>{children}</Ctx.Provider>;
}

export const useT = () => useContext(Ctx);

export const LANGS: { code: Lang; label: string }[] = [
  { code: "en", label: "English" },
  { code: "ig", label: "Igbo" },
  { code: "ha", label: "Hausa" },
  { code: "yo", label: "Yorùbá" },
];

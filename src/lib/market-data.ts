// National market intelligence dataset. Crop base prices are benchmarked to
// reported Nigerian wholesale market ranges (September 2026 press/market surveys);
// city prices apply regional supply/demand bias on top of that national anchor.
// Every (crop, city) pair has a UNIQUE price. Every crop has its own trend,
// seasonal outlook, volatility, and market note.

export const CITIES = [
  // North West
  "Kano", "Sokoto", "Kaduna",
  // North East
  "Maiduguri", "Bauchi", "Yola",
  // North Central
  "Abuja", "Jos", "Ilorin", "Makurdi",
  // South West
  "Lagos", "Ibadan", "Abeokuta",
  // South East
  "Onitsha", "Enugu", "Aba",
  // South South
  "Port Harcourt", "Benin City", "Calabar",
] as const;

export type City = (typeof CITIES)[number];

export const CROP_CATEGORIES = {
  Grains: ["Rice", "Maize", "Sorghum", "Millet"],
  Tubers: ["Yam", "Cassava", "Plantain"],
  Vegetables: ["Tomatoes", "Onion", "Pepper"],
  "Cash Crops": ["Groundnut", "Beans/Cowpea", "Palm Oil"],
} as const;

export const CROPS = [
  "Tomatoes", "Rice", "Maize", "Yam", "Cassava",
  "Sorghum", "Millet", "Groundnut", "Beans/Cowpea",
  "Plantain", "Onion", "Pepper", "Palm Oil",
] as const;
export type Crop = (typeof CROPS)[number];

export type TrendDirection = "rising" | "falling" | "stable";

interface CropSpec {
  unit: string;
  basePrice: number;               // ₦ per unit, national anchor
  trendPct: number;                // weekly % drift for the 4-week trend
  thisWeek: TrendDirection;
  nextThreeWeeks: TrendDirection;
  volatility: number;              // 0–100
  seasonalInsight: string;
  marketNote: string;
  // per-city price multipliers 0.85–1.25 range, expressed as (city → factor)
  cityBias: Partial<Record<City, number>>;
}

// Each crop has a UNIQUE city ranking (no two crops share the same "best city").
const CROP_SPECS: Record<Crop, CropSpec> = {
  Tomatoes: {
    unit: "basket (50kg)",
    basePrice: 33000, trendPct: -0.045,
    thisWeek: "falling", nextThreeWeeks: "rising", volatility: 78,
    seasonalInsight: "Harvest gluts from Jos and Kano are pulling prices down this week, but the dry-season transition typically lifts tomato prices sharply in ~3 weeks.",
    marketNote: "Tomato supply is high nationally, so prices are dropping — but a seasonal rebound is expected soon.",
    cityBias: { Lagos: 1.31, "Port Harcourt": 1.22, Calabar: 1.18, Aba: 1.15, "Benin City": 1.12, Onitsha: 1.09, Enugu: 1.07, Ibadan: 1.05, Abeokuta: 1.02, Abuja: 0.97, Ilorin: 0.94, Makurdi: 0.90, Maiduguri: 0.88, Bauchi: 0.86, Yola: 0.84, Jos: 0.78, Kaduna: 0.75, Sokoto: 0.72, Kano: 0.68 },
  },
  Rice: {
    unit: "50kg bag",
    basePrice: 58000, trendPct: 0.025,
    thisWeek: "rising", nextThreeWeeks: "rising", volatility: 32,
    seasonalInsight: "Rice demand is steadily climbing into the festive quarter; expect continued upward pressure over the next 3 weeks.",
    marketNote: "Consistent nationwide demand is pushing rice prices up week over week.",
    cityBias: { "Port Harcourt": 1.14, Calabar: 1.12, Lagos: 1.10, Aba: 1.08, "Benin City": 1.06, Onitsha: 1.05, Ibadan: 1.03, Enugu: 1.02, Abeokuta: 1.01, Abuja: 0.99, Jos: 0.97, Ilorin: 0.96, Makurdi: 0.94, Yola: 0.92, Bauchi: 0.91, Maiduguri: 0.90, Kaduna: 0.89, Sokoto: 0.88, Kano: 0.87 },
  },
  Maize: {
    unit: "100kg bag",
    basePrice: 52000, trendPct: 0.035,
    thisWeek: "rising", nextThreeWeeks: "stable", volatility: 41,
    seasonalInsight: "Poultry-feed demand in Kano is driving maize higher, but the market is expected to plateau once new stock arrives from the Middle Belt.",
    marketNote: "Feed-mill buying in Kano is lifting maize prices right now.",
    cityBias: { Kano: 1.18, Kaduna: 1.14, Sokoto: 1.12, Maiduguri: 1.10, Bauchi: 1.08, Yola: 1.06, Ibadan: 1.04, Lagos: 1.03, Abeokuta: 1.01, "Port Harcourt": 1.00, Onitsha: 0.98, Aba: 0.97, "Benin City": 0.95, Calabar: 0.94, Enugu: 0.93, Abuja: 0.91, Ilorin: 0.89, Makurdi: 0.85, Jos: 0.83 },
  },
  Yam: {
    unit: "tuber (medium)",
    basePrice: 6500, trendPct: -0.04,
    thisWeek: "falling", nextThreeWeeks: "falling", volatility: 55,
    seasonalInsight: "Yam prices are in a sustained decline as fresh harvests from Benue and Nasarawa reach urban markets. Further declines are expected over the next 3 weeks.",
    marketNote: "New harvest supply is flooding markets — yam prices are dropping and expected to keep falling.",
    cityBias: { Abuja: 1.22, Lagos: 1.18, "Port Harcourt": 1.15, Calabar: 1.12, Aba: 1.10, "Benin City": 1.08, Ibadan: 1.06, Abeokuta: 1.04, Onitsha: 1.03, Enugu: 1.01, Ilorin: 0.94, Sokoto: 0.90, Kaduna: 0.86, Bauchi: 0.83, Yola: 0.81, Maiduguri: 0.79, Jos: 0.77, Makurdi: 0.73, Kano: 0.70 },
  },
  Cassava: {
    unit: "100kg bag (fresh)",
    basePrice: 28000, trendPct: 0.008,
    thisWeek: "stable", nextThreeWeeks: "rising", volatility: 22,
    seasonalInsight: "Cassava prices are holding steady this week, with a modest lift expected as industrial garri and ethanol buyers ramp up procurement.",
    marketNote: "Cassava is trading in a tight range with a slight upward bias.",
    cityBias: { Jos: 1.16, Enugu: 1.12, "Benin City": 1.10, Onitsha: 1.08, Abuja: 1.06, Lagos: 1.05, Ibadan: 1.03, Aba: 1.02, "Port Harcourt": 1.01, Abeokuta: 1.00, Calabar: 0.99, Ilorin: 0.97, Makurdi: 0.95, Kaduna: 0.93, Bauchi: 0.91, Yola: 0.89, Maiduguri: 0.87, Sokoto: 0.85, Kano: 0.83 },
  },
  Sorghum: {
    unit: "100kg bag",
    basePrice: 45000, trendPct: 0.018,
    thisWeek: "rising", nextThreeWeeks: "rising", volatility: 36,
    seasonalInsight: "Brewery and poultry-feed demand is nudging sorghum prices higher across the North, with continued firmness expected.",
    marketNote: "Brewery procurement is quietly firming sorghum prices.",
    cityBias: { Sokoto: 1.14, Kaduna: 1.11, Kano: 1.09, Bauchi: 1.08, Maiduguri: 1.07, Yola: 1.05, Jos: 1.03, Ilorin: 1.02, Abuja: 1.00, Ibadan: 0.99, Makurdi: 0.98, Abeokuta: 0.96, Lagos: 0.95, "Benin City": 0.93, Enugu: 0.92, Onitsha: 0.91, Aba: 0.89, "Port Harcourt": 0.87, Calabar: 0.85 },
  },
  Millet: {
    unit: "100kg bag",
    basePrice: 48000, trendPct: -0.012,
    thisWeek: "falling", nextThreeWeeks: "stable", volatility: 44,
    seasonalInsight: "Millet is easing slightly as northern harvests move to market, but prices should stabilize once retail demand catches up.",
    marketNote: "Fresh northern supply is pressing millet prices lower this week.",
    cityBias: { Maiduguri: 1.15, Sokoto: 1.13, Yola: 1.11, Bauchi: 1.09, Kaduna: 1.07, Kano: 1.05, Jos: 1.03, Ilorin: 1.01, Abuja: 1.00, Makurdi: 0.98, "Benin City": 0.96, Enugu: 0.95, Ibadan: 0.93, Abeokuta: 0.92, Onitsha: 0.90, Aba: 0.89, Lagos: 0.87, "Port Harcourt": 0.85, Calabar: 0.83 },
  },
  Groundnut: {
    unit: "100kg bag (shelled)",
    basePrice: 105000, trendPct: 0.03,
    thisWeek: "rising", nextThreeWeeks: "rising", volatility: 48,
    seasonalInsight: "Export interest and vegetable-oil demand are lifting groundnut across the board; upward pressure expected to continue.",
    marketNote: "Oil-mill and export buying is pushing groundnut prices up.",
    cityBias: { Kano: 1.10, Kaduna: 1.09, Bauchi: 1.08, Sokoto: 1.07, Jos: 1.06, Maiduguri: 1.05, Yola: 1.04, Abuja: 1.03, Ilorin: 1.02, Makurdi: 1.01, Ibadan: 1.00, Abeokuta: 0.99, Lagos: 0.98, Enugu: 0.97, "Benin City": 0.96, Onitsha: 0.95, Aba: 0.94, "Port Harcourt": 0.93, Calabar: 0.92 },
  },
  "Beans/Cowpea": {
    unit: "100kg bag",
    basePrice: 100000, trendPct: -0.02,
    thisWeek: "falling", nextThreeWeeks: "rising", volatility: 62,
    seasonalInsight: "Cowpea supply from Sokoto and Zamfara is soft this week, but tight carryover stocks and festive demand should rebound prices within 3 weeks.",
    marketNote: "Beans are dipping on short-term supply, but tight stocks point to a rebound.",
    cityBias: { Lagos: 1.20, "Port Harcourt": 1.16, Aba: 1.14, Onitsha: 1.12, Calabar: 1.10, "Benin City": 1.08, Enugu: 1.06, Ibadan: 1.05, Abeokuta: 1.03, Abuja: 1.01, Ilorin: 0.99, Jos: 0.97, Makurdi: 0.95, Kaduna: 0.93, Bauchi: 0.91, Yola: 0.89, Maiduguri: 0.87, Kano: 0.85, Sokoto: 0.82 },
  },
  Plantain: {
    unit: "bunch (medium)",
    basePrice: 6000, trendPct: 0.022,
    thisWeek: "rising", nextThreeWeeks: "stable", volatility: 51,
    seasonalInsight: "Southern plantain is firmer this week on strong urban demand, with prices expected to plateau as fresh bunches reach markets.",
    marketNote: "Urban demand is lifting plantain prices in the South.",
    cityBias: { Abuja: 1.24, Kano: 1.22, Kaduna: 1.19, Sokoto: 1.16, Maiduguri: 1.14, Bauchi: 1.12, Yola: 1.10, Jos: 1.07, Ilorin: 1.03, Makurdi: 1.00, Abeokuta: 0.96, Lagos: 0.93, Ibadan: 0.90, Onitsha: 0.87, Enugu: 0.85, Aba: 0.83, "Port Harcourt": 0.80, "Benin City": 0.78, Calabar: 0.75 },
  },
  Onion: {
    unit: "50kg bag",
    basePrice: 80000, trendPct: -0.03,
    thisWeek: "falling", nextThreeWeeks: "rising", volatility: 71,
    seasonalInsight: "Onion prices are easing as trailer loads arrive from Sokoto and Kebbi. Storage losses typically push prices sharply higher within 3 weeks.",
    marketNote: "Fresh onion trailers from the North are dropping prices this week.",
    cityBias: { Calabar: 1.28, "Port Harcourt": 1.24, Aba: 1.22, Lagos: 1.20, Onitsha: 1.16, Enugu: 1.14, "Benin City": 1.12, Ibadan: 1.09, Abeokuta: 1.06, Abuja: 1.02, Ilorin: 0.98, Jos: 0.94, Makurdi: 0.90, Yola: 0.86, Bauchi: 0.82, Maiduguri: 0.78, Kaduna: 0.74, Kano: 0.70, Sokoto: 0.66 },
  },
  Pepper: {
    unit: "basket (30kg)",
    basePrice: 40000, trendPct: 0.028,
    thisWeek: "rising", nextThreeWeeks: "falling", volatility: 82,
    seasonalInsight: "Fresh pepper prices are climbing on tight supply, but a fresh wave of harvest from Kaduna and Jos is expected to soften prices in ~3 weeks.",
    marketNote: "Tight supply is pushing pepper prices up sharply this week.",
    cityBias: { "Port Harcourt": 1.26, Aba: 1.23, Lagos: 1.21, Calabar: 1.18, Onitsha: 1.15, "Benin City": 1.13, Enugu: 1.11, Ibadan: 1.08, Abeokuta: 1.05, Abuja: 1.02, Makurdi: 0.98, Ilorin: 0.95, Jos: 0.90, Bauchi: 0.87, Yola: 0.84, Kaduna: 0.81, Maiduguri: 0.78, Kano: 0.74, Sokoto: 0.71 },
  },
  "Palm Oil": {
    unit: "25L jerry can",
    basePrice: 72000, trendPct: 0.015,
    thisWeek: "stable", nextThreeWeeks: "rising", volatility: 29,
    seasonalInsight: "Palm oil is holding steady with a modest upside as processors restock; expect a gradual lift over the next 3 weeks.",
    marketNote: "Palm oil is trading in a tight range with a slight upward bias.",
    cityBias: { Aba: 1.14, Calabar: 1.12, "Port Harcourt": 1.10, "Benin City": 1.09, Onitsha: 1.07, Enugu: 1.06, Lagos: 1.04, Ibadan: 1.02, Abeokuta: 1.01, Abuja: 0.99, Ilorin: 0.97, Makurdi: 0.95, Jos: 0.93, Kaduna: 0.91, Bauchi: 0.89, Yola: 0.87, Maiduguri: 0.85, Kano: 0.83, Sokoto: 0.81 },
  },
};

export interface CropDataset {
  unit: string;
  cityPrices: Record<City, number>;
  weeklyTrend: number[];
  thisWeekDirection: TrendDirection;
  nextThreeWeeksDirection: TrendDirection;
  volatility: number;
  seasonalInsight: string;
  marketNote: string;
}

// Build MARKET with guaranteed uniqueness across the whole (crop, city) matrix.
function buildMarket(): Record<Crop, CropDataset> {
  const usedPrices = new Set<number>();
  const out = {} as Record<Crop, CropDataset>;

  CROPS.forEach((crop, cropIdx) => {
    const spec = CROP_SPECS[crop];
    const cityPrices = {} as Record<City, number>;
    CITIES.forEach((city, cityIdx) => {
      const bias = spec.cityBias[city] ?? 1.0;
      // deterministic per-cell jitter ensures uniqueness
      const jitter = ((cropIdx * 37 + cityIdx * 13) % 47) - 23;
      let price = Math.round((spec.basePrice * bias + jitter * 5) / 10) * 10;
      while (usedPrices.has(price)) price += 10;
      usedPrices.add(price);
      cityPrices[city] = price;
    });

    // 4-week national trend
    const newest = spec.basePrice;
    const weeklyTrend = [3, 2, 1, 0].map((wksBack) =>
      Math.round(newest * Math.pow(1 - spec.trendPct, wksBack) / 10) * 10,
    );

    out[crop] = {
      unit: spec.unit,
      cityPrices,
      weeklyTrend,
      thisWeekDirection: spec.thisWeek,
      nextThreeWeeksDirection: spec.nextThreeWeeks,
      volatility: spec.volatility,
      seasonalInsight: spec.seasonalInsight,
      marketNote: spec.marketNote,
    };
  });

  return out;
}

export const MARKET: Record<Crop, CropDataset> = buildMarket();

// ------- SINGLE SHARED FORMATTER (used everywhere) -------
export function formatNaira(value: number): string {
  return "\u20A6" + Math.round(value).toLocaleString("en-NG");
}

export function bestCity(crop: Crop): City {
  const d = MARKET[crop];
  return (Object.entries(d.cityPrices) as [City, number][]).reduce((a, b) =>
    b[1] > a[1] ? b : a,
  )[0];
}
export function worstCity(crop: Crop): City {
  const d = MARKET[crop];
  return (Object.entries(d.cityPrices) as [City, number][]).reduce((a, b) =>
    b[1] < a[1] ? b : a,
  )[0];
}

export function dataConfidence(crop: Crop): "High" | "Medium" | "Limited" {
  const v = MARKET[crop].volatility;
  if (v < 35) return "High";
  if (v < 65) return "Medium";
  return "Limited";
}

export interface Recommendation {
  city: City;
  price: number;
  action: "sell now" | "hold" | "sell soon";
  reason: string;
}

export function recommend(crop: Crop): Recommendation {
  const d = MARKET[crop];
  const city = bestCity(crop);
  const price = d.cityPrices[city];
  const wk = d.thisWeekDirection;
  const next = d.nextThreeWeeksDirection;

  let action: Recommendation["action"] = "sell now";
  let reason = "";

  if (wk === "rising") {
    action = "sell now";
    reason = `${city} is currently paying the highest price for ${crop.toLowerCase()} (${formatNaira(price)} per ${d.unit}). Prices are rising this week${next === "rising" ? " and expected to keep climbing" : next === "stable" ? " but likely to plateau soon" : ", though a pullback is expected in ~3 weeks"} — selling here now captures the current premium.`;
  } else if (wk === "falling" && next === "rising") {
    action = "hold";
    reason = `${city} is the top-paying market at ${formatNaira(price)} per ${d.unit}, but prices are FALLING this week. Seasonal signals point to a rebound in ~3 weeks, so if storage allows, holding may earn more than selling now.`;
  } else if (wk === "falling") {
    action = "sell now";
    reason = `${city} still offers the highest price (${formatNaira(price)} per ${d.unit}), but prices are falling and expected to keep declining. Sell now in ${city} before further losses.`;
  } else {
    if (next === "rising") {
      action = "sell soon";
      reason = `${city} pays the most today (${formatNaira(price)} per ${d.unit}). Prices are flat this week with a modest rise expected — selling within the next 1–2 weeks in ${city} should capture the upside.`;
    } else {
      action = "sell now";
      reason = `${city} is the top-paying market at ${formatNaira(price)} per ${d.unit}. Prices are stable, so there's little to gain by waiting.`;
    }
  }
  return { city, price, action, reason };
}

export interface FarmerRecommendation {
  bestCity: City;
  bestPrice: number;
  homeCity: City;
  homePrice: number;
  perUnitDelta: number;
  totalDelta: number;
  message: string;
}

export function farmerRecommendation(
  crop: Crop,
  homeCity: City,
  quantity: number,
  unit: string,
): FarmerRecommendation {
  const d = MARKET[crop];
  const best = bestCity(crop);
  const bestPrice = d.cityPrices[best];
  const homePrice = d.cityPrices[homeCity];
  const delta = bestPrice - homePrice;
  const total = delta * quantity;
  let message: string;
  if (best === homeCity) {
    message = `You're already in the top-paying market for ${crop.toLowerCase()} this week. ${best} is offering ${formatNaira(bestPrice)} per ${d.unit} — sell locally.`;
  } else if (delta <= 0) {
    message = `${homeCity} is currently paying at or above ${best}. No need to travel — sell locally.`;
  } else {
    message = `You're in ${homeCity} with ${quantity} ${unit} of ${crop}. Selling in ${best} could earn you approximately ${formatNaira(total)} more (${formatNaira(delta)} extra per ${d.unit}).`;
  }
  return { bestCity: best, bestPrice, homeCity, homePrice, perUnitDelta: delta, totalDelta: total, message };
}

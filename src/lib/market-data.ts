// Simulated market intelligence dataset. Each crop is fully independent:
// city prices, weekly trend, seasonal outlook, and volatility are all
// distinct. Recommendations derive from THIS data — no cross-crop leakage.

export const CROPS = ["Tomatoes", "Rice", "Maize", "Yam", "Cassava"] as const;
export const CITIES = ["Abuja", "Lagos", "Kano", "Jos", "Port Harcourt"] as const;
export type Crop = (typeof CROPS)[number];
export type City = (typeof CITIES)[number];

export type TrendDirection = "rising" | "falling" | "stable";

export interface CropDataset {
  unit: string;
  cityPrices: Record<City, number>;
  weeklyTrend: number[]; // 4 weeks, oldest → newest (national average)
  thisWeekDirection: TrendDirection;
  nextThreeWeeksDirection: TrendDirection;
  volatility: number; // 0–100 index
  seasonalInsight: string;
  marketNote: string; // plain-language explanation of THIS week's signal
}

// Prices in ₦ per stated unit. Numbers are demo-only and were chosen so
// every crop produces a distinct "best city" and a distinct narrative.
export const MARKET: Record<Crop, CropDataset> = {
  Tomatoes: {
    unit: "basket (50kg)",
    cityPrices: {
      Abuja: 22000,
      Lagos: 31500,          // ← highest
      Kano: 15500,           // ← lowest
      Jos: 18000,
      "Port Harcourt": 28500,
    },
    weeklyTrend: [34000, 32500, 31000, 29500], // falling
    thisWeekDirection: "falling",
    nextThreeWeeksDirection: "rising",
    volatility: 78,
    seasonalInsight:
      "Harvest gluts from Jos and Kano are pulling prices down this week, but the dry-season transition typically lifts tomato prices sharply in ~3 weeks.",
    marketNote:
      "Tomato supply is high nationally, so prices are dropping — but a seasonal rebound is expected soon.",
  },

  Rice: {
    unit: "50kg bag",
    cityPrices: {
      Abuja: 62000,
      Lagos: 66000,
      Kano: 58000,           // ← lowest
      Jos: 61000,
      "Port Harcourt": 71000, // ← highest
    },
    weeklyTrend: [65000, 66500, 68000, 69500], // rising
    thisWeekDirection: "rising",
    nextThreeWeeksDirection: "rising",
    volatility: 32,
    seasonalInsight:
      "Rice demand is steadily climbing into the festive quarter; expect continued upward pressure over the next 3 weeks.",
    marketNote:
      "Consistent nationwide demand is pushing rice prices up week over week.",
  },

  Maize: {
    unit: "100kg bag",
    cityPrices: {
      Abuja: 48000,
      Lagos: 51000,
      Kano: 55500,           // ← highest
      Jos: 45000,            // ← lowest
      "Port Harcourt": 52500,
    },
    weeklyTrend: [46000, 48500, 50500, 52000], // rising
    thisWeekDirection: "rising",
    nextThreeWeeksDirection: "stable",
    volatility: 41,
    seasonalInsight:
      "Poultry-feed demand in Kano is driving maize higher, but the market is expected to plateau once new stock arrives from the Middle Belt.",
    marketNote:
      "Feed-mill buying in Kano is lifting maize prices right now.",
  },

  Yam: {
    unit: "tuber (medium)",
    cityPrices: {
      Abuja: 6800,           // ← highest
      Lagos: 6400,
      Kano: 4200,            // ← lowest
      Jos: 5100,
      "Port Harcourt": 6100,
    },
    weeklyTrend: [7200, 7000, 6800, 6500], // falling
    thisWeekDirection: "falling",
    nextThreeWeeksDirection: "falling",
    volatility: 55,
    seasonalInsight:
      "Yam prices are in a sustained decline as fresh harvests from Benue and Nasarawa reach urban markets. Further declines are expected over the next 3 weeks.",
    marketNote:
      "New harvest supply is flooding markets — yam prices are dropping and expected to keep falling.",
  },

  Cassava: {
    unit: "100kg bag (fresh)",
    cityPrices: {
      Abuja: 24000,
      Lagos: 26500,
      Kano: 22000,           // ← lowest
      Jos: 28000,            // ← highest
      "Port Harcourt": 25500,
    },
    weeklyTrend: [25000, 25200, 25500, 25800], // stable/slightly rising
    thisWeekDirection: "stable",
    nextThreeWeeksDirection: "rising",
    volatility: 22,
    seasonalInsight:
      "Cassava prices are holding steady this week, with a modest lift expected as industrial garri and ethanol buyers ramp up procurement.",
    marketNote:
      "Cassava is trading in a tight range with a slight upward bias.",
  },
};

export function formatNaira(value: number): string {
  return "₦" + Math.round(value).toLocaleString("en-NG");
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

export interface Recommendation {
  city: City;
  price: number;
  action: "sell now" | "hold" | "sell soon";
  reason: string;
}

// The reason ALWAYS references thisWeekDirection AND nextThreeWeeksDirection
// so the recommendation can never contradict the trend on the same page.
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
    // stable
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

// Personalized recommendation for an individual farmer.
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
  return {
    bestCity: best,
    bestPrice,
    homeCity,
    homePrice,
    perUnitDelta: delta,
    totalDelta: total,
    message,
  };
}

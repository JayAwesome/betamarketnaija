// Static demo dataset of buyer contacts across all 19 Nigerian cities.
// In production, this would come from a verified-buyer directory (NBS, AFEX,
// state agricultural boards, and vetted cooperatives).

import type { City } from "./market-data";

export type ContactType = "Wholesaler" | "Market Trader" | "Cooperative Buyer" | "Processor";

export interface BuyerContact {
  id: string;
  name: string;
  business_name: string;
  city: City;
  crop_specialty: string[]; // crops this buyer typically purchases
  phone_number: string;     // E.164 format e.g. +2348012345678
  contact_type: ContactType;
}

// Helper: build a demo phone from an index; keeps every number unique + valid-shape.
const p = (n: number) => `+23480${String(20000000 + n).slice(0, 8)}`;

let _i = 0;
const c = (
  city: City,
  name: string,
  business: string,
  type: ContactType,
  specialty: string[],
): BuyerContact => ({
  id: `${city}-${_i}`,
  name,
  business_name: business,
  city,
  crop_specialty: specialty,
  phone_number: p(_i++),
  contact_type: type,
});

export const BUYER_CONTACTS: BuyerContact[] = [
  // --- North West ---
  c("Kano", "Alhaji Musa Ibrahim", "Dawanau Grains Depot", "Wholesaler", ["Maize", "Sorghum", "Millet"]),
  c("Kano", "Hauwa Bello", "Sabon Gari Traders Assoc.", "Market Trader", ["Groundnut", "Beans/Cowpea"]),
  c("Kano", "Kano Feedmillers Ltd", "Kano Feedmillers Ltd", "Processor", ["Maize", "Sorghum"]),

  c("Sokoto", "Aliyu Danladi", "Sokoto Central Market Co-op", "Cooperative Buyer", ["Millet", "Sorghum", "Onion"]),
  c("Sokoto", "Fatima Usman", "Kebbe Onion Traders", "Wholesaler", ["Onion", "Beans/Cowpea"]),
  c("Sokoto", "Northern Oil Mills", "Northern Oil Mills", "Processor", ["Groundnut"]),

  c("Kaduna", "Yakubu Sani", "Kaduna Central Grain Hub", "Wholesaler", ["Maize", "Sorghum", "Rice"]),
  c("Kaduna", "Amina Bala", "Kawo Market Traders", "Market Trader", ["Pepper", "Tomatoes"]),
  c("Kaduna", "Zaria Poultry Feeds", "Zaria Poultry Feeds", "Processor", ["Maize", "Sorghum"]),

  // --- North East ---
  c("Maiduguri", "Modu Kachalla", "Monday Market Grain Assoc.", "Cooperative Buyer", ["Millet", "Sorghum", "Groundnut"]),
  c("Maiduguri", "Hadiza Goni", "Borno Onion Wholesalers", "Wholesaler", ["Onion", "Pepper"]),

  c("Bauchi", "Ibrahim Adamu", "Muda Lawal Market Traders", "Market Trader", ["Maize", "Groundnut"]),
  c("Bauchi", "Bauchi Grains Co-op", "Bauchi Grains Co-op", "Cooperative Buyer", ["Sorghum", "Millet"]),
  c("Bauchi", "Northern Agro Processors", "Northern Agro Processors", "Processor", ["Groundnut", "Maize"]),

  c("Yola", "Adamu Tukur", "Jimeta Modern Market", "Wholesaler", ["Rice", "Maize", "Millet"]),
  c("Yola", "Rebecca Danjuma", "Adamawa Rice Co-op", "Cooperative Buyer", ["Rice", "Sorghum"]),

  // --- North Central ---
  c("Abuja", "Chinedu Okafor", "Utako Fresh Foods", "Wholesaler", ["Tomatoes", "Pepper", "Onion", "Plantain"]),
  c("Abuja", "Grace Adeyemi", "Wuse Market Traders Union", "Market Trader", ["Yam", "Cassava", "Rice"]),
  c("Abuja", "FCT Agro-Aggregators", "FCT Agro-Aggregators Ltd", "Processor", ["Cassava", "Maize"]),

  c("Jos", "Danjuma Pam", "Jos Terminal Market", "Wholesaler", ["Tomatoes", "Pepper", "Cassava"]),
  c("Jos", "Plateau Farmers Co-op", "Plateau Farmers Co-op", "Cooperative Buyer", ["Maize", "Cassava"]),
  c("Jos", "Highland Foods Ltd", "Highland Foods Ltd", "Processor", ["Tomatoes", "Pepper"]),

  c("Ilorin", "Tunde Balogun", "Ipata Market Traders", "Market Trader", ["Yam", "Cassava", "Palm Oil"]),
  c("Ilorin", "Kwara Grain Buyers", "Kwara Grain Buyers Ltd", "Wholesaler", ["Rice", "Maize", "Sorghum"]),

  c("Makurdi", "Terhemen Aondo", "Wurukum Yam Depot", "Wholesaler", ["Yam", "Cassava", "Beans/Cowpea"]),
  c("Makurdi", "Benue Yam Co-op", "Benue Yam Co-op", "Cooperative Buyer", ["Yam", "Rice"]),
  c("Makurdi", "Middle Belt Cassava Ltd", "Middle Belt Cassava Ltd", "Processor", ["Cassava"]),

  // --- South West ---
  c("Lagos", "Segun Adeoye", "Mile 12 International Market", "Wholesaler", ["Tomatoes", "Pepper", "Onion", "Yam"]),
  c("Lagos", "Bola Ajayi", "Daleko Rice Traders", "Market Trader", ["Rice", "Beans/Cowpea"]),
  c("Lagos", "Ojo Foods Processing", "Ojo Foods Processing", "Processor", ["Cassava", "Palm Oil", "Tomatoes"]),

  c("Ibadan", "Femi Ogunleye", "Bodija Market Traders Assoc.", "Market Trader", ["Yam", "Cassava", "Pepper"]),
  c("Ibadan", "Oyo Palm Producers", "Oyo Palm Producers Co-op", "Cooperative Buyer", ["Palm Oil", "Cassava"]),
  c("Ibadan", "Southwest Agro Ltd", "Southwest Agro Ltd", "Processor", ["Maize", "Cassava"]),

  c("Abeokuta", "Wale Sonaike", "Kuto Market Traders", "Market Trader", ["Cassava", "Plantain", "Palm Oil"]),
  c("Abeokuta", "Ogun State Farmers Co-op", "Ogun State Farmers Co-op", "Cooperative Buyer", ["Cassava", "Maize"]),

  // --- South East ---
  c("Onitsha", "Emeka Nwosu", "Onitsha Main Market Wholesalers", "Wholesaler", ["Rice", "Beans/Cowpea", "Palm Oil"]),
  c("Onitsha", "Ngozi Okeke", "Bridge Head Yam Traders", "Market Trader", ["Yam", "Plantain"]),
  c("Onitsha", "Niger Foods Processors", "Niger Foods Processors", "Processor", ["Cassava", "Palm Oil"]),

  c("Enugu", "Ikenna Eze", "New Market Enugu Traders", "Market Trader", ["Yam", "Cassava", "Pepper"]),
  c("Enugu", "Enugu Cassava Growers Co-op", "Enugu Cassava Growers Co-op", "Cooperative Buyer", ["Cassava", "Palm Oil"]),
  c("Enugu", "Coal City Agro Ltd", "Coal City Agro Ltd", "Processor", ["Cassava", "Maize"]),

  c("Aba", "Chidi Okoro", "Ariaria Foodstuff Section", "Wholesaler", ["Rice", "Beans/Cowpea", "Palm Oil"]),
  c("Aba", "Uche Nnamdi", "Abia Palm Oil Merchants", "Market Trader", ["Palm Oil", "Plantain"]),

  // --- South South ---
  c("Port Harcourt", "Ebi Amachree", "Mile 1 Market Wholesalers", "Wholesaler", ["Tomatoes", "Pepper", "Onion", "Rice"]),
  c("Port Harcourt", "Preye Diri", "Rivers Palm Oil Buyers", "Market Trader", ["Palm Oil", "Plantain"]),
  c("Port Harcourt", "Garden City Foods Ltd", "Garden City Foods Ltd", "Processor", ["Cassava", "Palm Oil"]),

  c("Benin City", "Osaro Igbinedion", "New Benin Market Traders", "Market Trader", ["Yam", "Cassava", "Palm Oil"]),
  c("Benin City", "Edo Palm Producers Co-op", "Edo Palm Producers Co-op", "Cooperative Buyer", ["Palm Oil", "Cassava"]),
  c("Benin City", "Bendel Feeds Ltd", "Bendel Feeds Ltd", "Processor", ["Maize", "Cassava"]),

  c("Calabar", "Etim Bassey", "Watt Market Wholesalers", "Wholesaler", ["Onion", "Rice", "Pepper"]),
  c("Calabar", "Mfon Effiong", "Cross River Plantain Traders", "Market Trader", ["Plantain", "Palm Oil"]),
  c("Calabar", "Calabar Agro-Processors", "Calabar Agro-Processors", "Processor", ["Palm Oil", "Cassava"]),
];

export function findBuyerContacts(city: City, crop: string): {
  matches: BuyerContact[];
  others: BuyerContact[];
} {
  const inCity = BUYER_CONTACTS.filter((b) => b.city === city);
  const matches = inCity.filter((b) => b.crop_specialty.includes(crop));
  const others = inCity.filter((b) => !b.crop_specialty.includes(crop));
  return { matches, others };
}

export function waLink(phone: string): string {
  // strip everything but digits for wa.me
  return `https://wa.me/${phone.replace(/\D/g, "")}`;
}

export function telLink(phone: string): string {
  return `tel:${phone.replace(/\s/g, "")}`;
}

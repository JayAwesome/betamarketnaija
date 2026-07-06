# AgriSense AI — Expansion Plan

The existing app already has: Market Dashboard, Analytics, AI Chat, My Dashboard, Supabase auth, and 5 crops × 5 cities of independent data. This plan extends it to meet the full 3MTT showcase spec.

## 1. Remove the login wall
- Delete the auth redirect on `/`, `/analytics`, `/chat`. Guests land directly on the Market Dashboard.
- Keep sidebar links to `My Dashboard` and `My Cooperative` visible for guests; if unauthenticated, render an inline "Sign up to save your data" panel (with CTA to `/auth`), not a redirect.
- Top nav always shows either `Log in / Sign up` or `Account ▾` (with Sign out).

## 2. Data expansion — 18 cities × 13 crops
Rewrite `src/lib/market-data.ts` so every (crop, city) pair has a **unique** price. Each crop keeps its own weekly trend, this-week direction, next-3-week direction, volatility, seasonal insight, and market note. Deterministic per-city variation is generated from a `(cropBase × cityMultiplier) + cropCityJitter` formula, then hand-tuned so no two cells collide.

Crops grouped in the picker:
- Grains: Rice, Maize, Sorghum, Millet
- Tubers: Yam, Cassava, Plantain
- Vegetables: Tomatoes, Onion, Pepper
- Cash Crops: Groundnut, Beans/Cowpea, Palm Oil

Cities: Kano, Sokoto, Kaduna, Maiduguri, Bauchi, Yola, Abuja, Jos, Ilorin, Makurdi, Lagos, Ibadan, Abeokuta, Onitsha, Enugu, Aba, Port Harcourt, Benin City, Calabar.

## 3. Currency singleton
Every `₦` render goes through `formatNaira()` in `src/lib/market-data.ts`. Audit and remove any component-level currency formatting.

## 4. Dashboard additions
- **Data Confidence badge** (High/Medium/Limited) driven by volatility, with a tooltip explaining the simulated dataset.
- **Why This Matters** card (post-harvest loss stat).
- **Price Alerts card** (crop, target price, direction, optional city). Guests see inline sign-up nudge; signed-in users save to the `alerts` table.
- **Cooperative teaser** card linking to `/my-cooperative`.
- **Data source disclosure** footer (simulated demo data, NBS/AFEX-style integration example).

## 5. Analytics redesign
- Signal card background tinted by direction (rising=green, falling=warm red, stable=muted).
- Trend chart gets a gradient area fill under the line.
- Volatility bar colored green/amber/red by band.
- Seasonal Insight card uses the earth accent.

## 6. AI Assistant
Already grounded in `MARKET`. Extend the grounding string to include the expanded dataset (crop list + directions + best-city per crop) so responses reflect the new cities/crops.

## 7. Farmer dashboard + sales tracker
New tables via migration:
- `alerts` (user_id, crop, city nullable, target_price, direction, active)
- `sales_history` gains: `unit`, `revenue`, `recommended_price_at_sale`, `price_difference` (extend existing table)
- `cooperatives` (id, name, join_code unique)
- `cooperative_members` (cooperative_id, user_id) — composite PK

Profiles: add optional `phone`. Auth page supports email OR phone (phone auth via Supabase `signInWithOtp({ phone })` fallback — but to keep this a self-contained prototype, treat phone as an alternate identifier stored on profile; primary auth stays email/password with a phone field on signup). Signup form has a toggle "Email / Phone" — phone mode uses `phone@agrisense.local` synthetic email under the hood so RLS/auth still works without SMS provider setup. Clearly labeled.

Farmer Dashboard sections:
- Profile (name, city, primary crop, phone)
- My Produce (existing) — inventory list
- Personalized recommendation (existing)
- **Record Sale** form → inserts into `sales_history`, decrements matching `produce` row, computes recommended_price_at_sale from current MARKET, shows immediate feedback message.
- **Profit summary**: total revenue, total volume, avg price/crop, total variance vs recommended.
- Small line chart: revenue per sale over time (Recharts).
- Savings nudge card (10% suggestion).

## 8. Cooperative dashboard (`/my-cooperative`)
- If not in a co-op: forms to Create (name → generates 6-char join code) or Join (enter code).
- If in a co-op: show name + join code + member count + aggregated produce (SUM by crop across members) + group recommendation using best-city logic on the aggregate volume.
- RLS: members can read `cooperatives` row + `cooperative_members` rows + members' `produce` **only for their own coop**. Use a `SECURITY DEFINER` function `is_coop_member(coop_id, user_id)` to avoid recursive policies.

## 9. USSD/SMS mockup
New route `/ussd` (or card on Dashboard) rendering a phone-frame mockup:
```
*347*AGRI#
> 1. Tomato price
> 2. Best market
> 3. Set alert
```
Clearly labeled "Concept mockup — not a live telecom integration."

## 10. Dark mode
- Add `next-themes`-style toggle using a small context + `document.documentElement.classList.toggle('dark')`, persisted in `localStorage`.
- Tailwind v4 already supports dark via `.dark` class variants. Add `@custom-variant dark (&:where(.dark, .dark *))` in `styles.css` and dark-tuned token overrides.
- Sun/Moon button in top header.

## 11. i18n toggle (English / Igbo / Hausa / Yoruba)
- Lightweight custom hook `useT()` reading from `src/lib/i18n.ts` (flat key→locale map). No external lib.
- Translate: nav labels, page titles, card headers, button labels, direction/status words (Rising/Falling/Stable/Highest/Lowest/Average).
- **Do NOT** translate: AI recommendation reason strings, chat responses, seasonal insight prose. Those stay English.
- Language selector (globe icon dropdown) in top header, persisted to localStorage.

## Technical notes
- Migration order: alter existing tables → add new tables → GRANTs → RLS → policies → security-definer helpers.
- `handle_new_user()` trigger already creates a `profiles` row; extend to copy phone from `raw_user_meta_data`.
- Sales flow uses a single `createServerFn` with `requireSupabaseAuth` to keep the sale + inventory decrement + recommendation snapshot atomic.
- All new routes (`/my-cooperative`, `/ussd`) added under proper file-based routing; protected personal routes live under existing pattern with inline guest nudge rather than layout gate (per no-login-wall rule).
- Header/sidebar restructured: sidebar for main nav (Dashboard, Analytics, AI Assistant, My Dashboard, My Cooperative, USSD Demo), top bar for language + theme + auth.

## Out of scope (explicit)
- Real SMS/USSD gateway integration.
- Real-time price feeds (NBS/AFEX) — disclosed as future integration.
- Machine translation of dynamic AI text.

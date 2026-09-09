# AgriSense Connect

Build a complete web application called AgriSense AI: a smart agricultural market intelligence platform for Nigerian farmers and traders.

Purpose

Help users compare crop prices across cities, analyze price trends, and get personalized recommendations on the best place and time to sell their produce for maximum profit. Solve a real problem: smallholder farmers in Nigeria lose significant produce value post-harvest due to poor market information.

Core Requirement: Per-Crop Data Independence

Critical: every crop (Tomatoes, Rice, Maize, Yam, Cassava) must have its own independent dataset — city prices, trend direction, seasonal signal, and volatility. Recommendations, charts, and comparisons must recalculate fully when the crop selection changes. Before considering this done, verify that switching between all five crops produces different recommended cities, prices, and trend directions for each one.

1. General Market Dashboard

Crop selection dropdown (Tomatoes, Rice, Maize, Yam, Cassava)

City price comparison table (Abuja, Lagos, Kano, Jos, Port Harcourt) with highest/lowest highlighted

AI-powered recommendation card showing: recommended city, current price, and a plain-language reason

The recommendation must be internally consistent with the trend data — if price is falling, the reasoning must explicitly address that (e.g. "sell now before further decline" or "hold — seasonal rise expected in X weeks"). Never show a "sell here" recommendation that contradicts a falling trend without explanation.

Trend/seasonal signal shown with explicit timeframes, e.g. "This Week: Falling" and "Next 3 Weeks: Rising" — never two unlabeled indicators that appear to conflict

"Why This Matters" card explaining the real-world problem this solves

Data source disclosure footer: state clearly that this is a simulated demo dataset, with a named example of what it could integrate with in production (e.g. National Bureau of Statistics, AFEX)

2. Price Analytics Page

Market signal (rising/falling) with plain-language explanation

4-week price trend line chart, specific to the selected crop

Price volatility index

Seasonal insight text

3. AI Assistant Chat

Simple chatbot that answers questions like "Where should I sell maize this week?" using the same live data as the Dashboard and Analytics pages — not generic or hardcoded answers. If a user asks about a crop, the answer must match what the Dashboard shows for that crop.

4. Individual Farmer Dashboard (requires Supabase authentication and database)

Set up Supabase auth (email/password is fine) and the following tables with Row Level Security so each farmer can only read/write their own rows:

profiles: user_id, name, city, primary_crop

produce: user_id, crop, quantity, unit

sales_history: user_id, crop, city_sold, price, date

favorite_markets: user_id, city

Farmer dashboard should include:

Simple sign up / login

Profile setup (name, city, primary crop)

"My Produce" list (add/view crop, quantity, unit)

Personalized recommendation using the farmer's own city and crop against the general market dataset (e.g. "You're in Jos with 20 baskets of Tomatoes. Selling in Port Harcourt could earn you approximately ₦X more.")

Sales history log (sample entries acceptable for demo)

1-2 saved/favorite markets, compared against "best market this week"

Add "My Dashboard" as a distinct sidebar navigation item alongside Dashboard, Analytics, and AI Assistant.

Design Requirements

Clean, modern, mobile-friendly UI

Green, white, earthy agricultural theme

Sidebar navigation: Dashboard, Analytics, AI Assistant, My Dashboard

Currency must render as proper ₦ symbol everywhere — verify this explicitly, do not use raw Unicode escape strings

Verification Before Marking Complete

Confirm all five crops produce different data across every page

Confirm the ₦ symbol renders correctly, not as escaped text

Confirm a test farmer account can sign up, create a profile, add produce, and see a personalized recommendation

Confirm RLS is active — a second test account should not see the first account's data

Confirm no page shows a recommendation that contradicts its own trend/signal data without explanation

This is a prototype for a national innovation showcase (3MTT Knowledge Showcase). Prioritize clarity, correctness, and internal consistency over visual complexity.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://betamarketnaija.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/2b2170d5-0515-40f5-a306-02ecffce4b35).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

/** Starter data for "New product ideas" and the selling calendar.
 *  IMPORTANT: this is NOT live market data. Prices, margins, competition and the 12-month demand curves are rough starting estimates for the Indian market.
 *  Edit them freely (or replace this file with a real data feed). The pages and the score only read from here. */
export type Level = "Low" | "Medium" | "High";
export type Idea = { slug: string; name: string; cat: string; price: [number, number]; margin: [number, number]; comp: Level; returns: Level; weight: "Light" | "Medium" | "Bulky"; curve: number[]; why: string; tip: string; check?: string };
export const CATS = ["Home & Decor", "Festive & Gifting", "Fashion & Accessories", "Beauty & Care", "Health & Fitness", "Electronics", "Kitchen", "Kids & Stationery", "Pets & Auto"] as const;
const slug = (s: string) => s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const I = (name: string, cat: (typeof CATS)[number], price: [number, number], margin: [number, number], comp: Level, returns: Level, weight: Idea["weight"], curve: number[], why: string, tip: string, check?: string): Idea => ({ slug: slug(name), name, cat, price, margin, comp, returns, weight, curve, why, tip, check });
const BIS = "Often needs BIS (CRS) registration. Confirm for your exact product before you list it.", FSSAI = "Food products need an FSSAI licence or registration.", BISTOY = "Toys sold in India need the BIS (ISI) mark. Confirm for your product.";
export const IDEAS: Idea[] = [
  I("LED string lights", "Home & Decor", [199, 699], [35, 55], "High", "Low", "Light", [4, 4, 4, 3, 3, 3, 3, 4, 6, 9, 10, 7], "Decor staple for Diwali, Christmas and weddings. Light and cheap to ship.", "Sell bundles (2 or 3 strings) to lift the order value. Show it lit up in the first photo.", BIS),
  I("Diyas, candles and festive decor", "Festive & Gifting", [99, 999], [40, 60], "High", "Medium", "Medium", [2, 2, 2, 2, 2, 2, 3, 4, 6, 10, 10, 5], "A big seasonal spike every Diwali, with many small buyers.", "Pack fragile items well. Breakage is the main reason for returns."),
  I("Rakhi sets and gift hampers", "Festive & Gifting", [149, 1499], [40, 60], "High", "Low", "Light", [1, 1, 1, 1, 1, 2, 4, 10, 3, 1, 1, 1], "One very short peak around Raksha Bandhan. Orders arrive late, so stock early.", "List by July and offer delivery-by-date promises. Gift hampers earn more than single rakhis."),
  I("Ethnic wear sets (kurta and festive)", "Fashion & Accessories", [799, 2999], [35, 55], "High", "High", "Light", [7, 5, 4, 4, 5, 4, 4, 6, 7, 9, 10, 8], "Festive and wedding seasons keep demand high from September to February.", "Add a size chart and measurements to cut returns. Show real photos on real people."),
  I("Cotton kurtis", "Fashion & Accessories", [399, 1299], [40, 60], "High", "High", "Light", [6, 6, 6, 6, 6, 5, 5, 6, 7, 8, 8, 7], "Everyday demand all year, with a lift in festive months.", "Size accuracy decides your return rate. Use fabric close-ups and a fit guide."),
  I("Winter wear (hoodies, thermals, mufflers)", "Fashion & Accessories", [399, 1499], [30, 50], "High", "Medium", "Medium", [8, 5, 2, 1, 1, 1, 1, 1, 2, 5, 9, 10], "Strong November to January demand, almost nothing in summer.", "Order by September. Plan to clear leftover stock in February."),
  I("Raincoats and umbrellas", "Fashion & Accessories", [199, 899], [35, 55], "Medium", "Low", "Medium", [1, 1, 1, 2, 4, 9, 10, 9, 5, 2, 1, 1], "Monsoon demand is sharp and predictable.", "Be in stock by May. Kids' sizes and compact umbrellas sell well."),
  I("Artificial jewellery and accessories", "Fashion & Accessories", [99, 999], [55, 75], "High", "Medium", "Light", [6, 7, 6, 6, 6, 5, 6, 8, 8, 10, 10, 9], "High margins, tiny parcels, and demand that rises with every festival and wedding.", "Sets of earrings and necklaces sell better than single pieces. Use clear macro photos."),
  I("Handbags, wallets and sling bags", "Fashion & Accessories", [299, 1499], [40, 60], "High", "Medium", "Light", [6, 6, 6, 6, 6, 6, 6, 7, 8, 9, 9, 8], "Steady all-year demand and a good gifting product.", "Photograph the inside and the size next to a phone."),
  I("Sunscreen and sun care", "Beauty & Care", [199, 699], [30, 45], "High", "Low", "Light", [3, 4, 7, 9, 10, 8, 5, 4, 4, 3, 2, 2], "Peaks in the hot months and repeats as a refill purchase.", "Offer a 2 or 3 pack to encourage repeat buying.", "Cosmetics sold in India must follow CDSCO and labelling rules. Confirm for your product."),
  I("Body lotion and lip balm (winter care)", "Beauty & Care", [99, 499], [35, 55], "High", "Low", "Light", [9, 6, 3, 2, 1, 1, 1, 1, 2, 5, 8, 10], "Winter essentials with repeat buyers.", "Combos and gift sets raise the order value."),
  I("Hair oil and ayurvedic hair care", "Beauty & Care", [149, 699], [35, 55], "High", "Low", "Light", [6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6], "Evergreen demand with strong repeat purchase.", "Trust matters most here. Show ingredients and real reviews.", "Ayurvedic products may need an AYUSH licence. Confirm before you sell."),
  I("Perfumes and body mists", "Beauty & Care", [199, 1499], [40, 65], "High", "Low", "Light", [6, 8, 6, 6, 6, 5, 5, 6, 7, 9, 9, 9], "Top gifting product, with spikes at Valentine's Day and the festive season.", "Gift boxes and mini sets are easy first products."),
  I("Natural soaps and face wash", "Beauty & Care", [149, 799], [40, 60], "High", "Low", "Light", [6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6], "Small niche brands do well with a clear story and good photos.", "Start with 3 hero products. Sample packs help first-time buyers."),
  I("Yoga mats and resistance bands", "Health & Fitness", [299, 1299], [35, 55], "Medium", "Low", "Medium", [10, 7, 5, 5, 5, 6, 5, 5, 5, 5, 5, 7], "A January spike from New Year resolutions, with steady demand after.", "Bundle a mat, a band and a strap as a starter kit."),
  I("Herbal teas and wellness mixes", "Health & Fitness", [199, 899], [30, 50], "High", "Low", "Light", [8, 6, 4, 3, 3, 3, 3, 3, 4, 5, 7, 8], "Winter and January health goals drive demand.", "Sell sample packs first. Repeat orders are the real profit.", FSSAI),
  I("Cooling products (neck fans, cooling towels)", "Health & Fitness", [199, 999], [30, 50], "Medium", "Medium", "Light", [2, 4, 8, 10, 10, 8, 3, 2, 2, 1, 1, 1], "Summer-only demand that arrives fast, with little competition in the early weeks.", "Start selling in February, not April. Buyers search early.", BIS),
  I("Phone cases and screen guards", "Electronics", [99, 599], [50, 70], "High", "Low", "Light", [6, 6, 6, 6, 6, 6, 6, 7, 8, 9, 8, 7], "Very high margin and small parcels, but crowded. New phone launches create spikes.", "Pick niche models and designs. Avoid generic listings."),
  I("Power banks and fast chargers", "Electronics", [499, 1999], [25, 40], "High", "Medium", "Light", [6, 6, 6, 6, 6, 6, 6, 6, 7, 9, 8, 7], "Constant demand and sale-event spikes.", "Quality and warranty are what customers pay for. Avoid cheap clones.", BIS),
  I("Bluetooth speakers and earbuds", "Electronics", [499, 2499], [25, 40], "High", "Medium", "Light", [6, 6, 6, 6, 6, 6, 6, 7, 8, 10, 9, 8], "Big festive and sale-event demand. Competition from known brands is heavy.", "Compete on a bundle or a niche (gaming, kids, sports).", BIS),
  I("Smartwatches and fitness bands", "Electronics", [799, 3999], [20, 35], "High", "Medium", "Light", [6, 6, 6, 6, 6, 6, 6, 7, 8, 10, 9, 8], "Very large category with thin margins. Better as an add-on than a first product.", "Straps and accessories have better margins than the watches.", BIS),
  I("Rechargeable lamps and desk lights", "Electronics", [299, 999], [30, 45], "Medium", "Low", "Light", [5, 5, 5, 5, 5, 5, 5, 6, 7, 8, 8, 7], "Useful for students and for power cuts.", "Show brightness modes clearly in the images.", BIS),
  I("Men's grooming (trimmers, beard oil)", "Beauty & Care", [299, 1999], [30, 50], "High", "Medium", "Light", [6, 6, 6, 6, 6, 6, 6, 7, 8, 9, 9, 8], "Steady demand and strong gifting around festivals.", "Gift kits sell well in October and November.", BIS),
  I("Kitchen organisers and storage containers", "Kitchen", [199, 999], [40, 60], "Medium", "Low", "Medium", [6, 6, 6, 6, 6, 6, 6, 7, 8, 8, 7, 7], "Everyday home demand, with a lift before festivals.", "Sets of 3 to 6 pieces have the best value."),
  I("Portable blenders and kitchen gadgets", "Kitchen", [399, 1499], [30, 45], "High", "Medium", "Light", [5, 5, 6, 7, 8, 8, 6, 5, 5, 6, 6, 6], "Social-media friendly products that sell in summer.", "Short demo videos are the best sales tool.", BIS),
  I("Insulated bottles and lunch boxes", "Kitchen", [249, 999], [35, 55], "High", "Low", "Medium", [4, 5, 6, 8, 8, 7, 9, 9, 6, 5, 5, 5], "Back-to-school plus the summer season.", "Start selling in May for June school openings."),
  I("Cotton bedsheets and home linen", "Home & Decor", [399, 1999], [35, 55], "High", "Medium", "Bulky", [6, 5, 5, 5, 5, 5, 5, 6, 7, 9, 9, 8], "Festive home refresh and wedding gifting drive sales. Bulky to ship.", "Show thread count and fabric. Check shipping cost per parcel before you price."),
  I("Indoor plants, planters and garden tools", "Home & Decor", [149, 899], [40, 60], "Medium", "Medium", "Medium", [5, 6, 8, 9, 8, 9, 10, 8, 6, 5, 5, 5], "Monsoon and spring demand, with a growing home-garden trend.", "Planters and tools ship better than live plants."),
  I("Cleaning gadgets (spin mops, brushes)", "Home & Decor", [299, 1499], [35, 50], "Medium", "Low", "Bulky", [5, 5, 5, 5, 5, 5, 5, 6, 8, 10, 6, 5], "Diwali cleaning creates a sharp seasonal spike.", "Start advertising in September. Bundle refills with the main product."),
  I("Handmade crafts and resin decor", "Home & Decor", [199, 1999], [55, 75], "Low", "Medium", "Medium", [5, 5, 5, 5, 5, 5, 5, 6, 7, 9, 9, 7], "A niche with high margins and little direct competition. Good for D2C brands.", "Tell the maker's story. Offer personalisation."),
  I("Pooja thalis and brass idols", "Festive & Gifting", [199, 2999], [40, 60], "Medium", "Medium", "Medium", [3, 3, 3, 3, 3, 3, 4, 6, 8, 10, 9, 4], "Demand rises through the whole festive season.", "Gift-ready packing helps. Fragile, so check breakage rates."),
  I("Dry fruit and festive gift boxes", "Festive & Gifting", [349, 2499], [20, 35], "High", "Low", "Light", [4, 3, 3, 3, 3, 3, 3, 6, 6, 9, 10, 7], "Corporate and family gifting at Diwali. Lower margin, high order value.", "Chase corporate bulk orders for volume.", FSSAI),
  I("Christmas and New Year decor", "Festive & Gifting", [99, 999], [45, 65], "Medium", "Low", "Medium", [1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 6, 10], "A short, December-only peak.", "List by early November. Ship before December 20."),
  I("Valentine's and personalised gifts", "Festive & Gifting", [199, 1999], [45, 65], "High", "Low", "Light", [6, 10, 3, 2, 2, 2, 2, 2, 2, 2, 3, 5], "Peaks the week before February 14, and personalised items earn the most.", "Set a clear last-order date for custom items."),
  I("Kids' toys and learning kits", "Kids & Stationery", [199, 1299], [40, 60], "High", "Medium", "Medium", [5, 5, 5, 5, 6, 7, 6, 6, 6, 7, 10, 8], "Children's Day and school holidays lift demand, with a steady base.", "Show age range and what is in the box.", BISTOY),
  I("School stationery and art supplies", "Kids & Stationery", [49, 499], [40, 60], "High", "Low", "Light", [4, 4, 6, 10, 10, 9, 6, 5, 5, 4, 4, 4], "Back-to-school demand in April to June.", "Kits and bundles beat single items."),
  I("Baby care essentials", "Kids & Stationery", [199, 1499], [35, 55], "Medium", "Low", "Light", [6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6], "Steady all-year demand from new parents.", "Trust and safety claims matter. Be accurate and show materials."),
  I("Pet accessories (leashes, beds, bowls)", "Pets & Auto", [199, 1499], [40, 60], "Medium", "Low", "Medium", [6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6], "A growing category with loyal repeat buyers.", "Size guides matter for beds and harnesses."),
  I("Car accessories (organisers, phone holders)", "Pets & Auto", [199, 1499], [35, 55], "High", "Medium", "Light", [6, 6, 6, 6, 6, 6, 6, 6, 6, 7, 8, 6], "Constant demand, with gifting before festivals.", "Add a fitment list by car model to cut returns."),
];
export const bySlug = (s: string) => IDEAS.find((i) => i.slug === s);
const LV: Record<Level, number> = { Low: 9, Medium: 6, High: 3 }, WT = { Light: 9, Medium: 6, Bulky: 3 };
export const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
/** Demand for the next 3 months, weighted towards now (sourcing takes weeks, so we look ahead). 0 to 10. */
export const demandAhead = (i: Idea, now = new Date()) => { const m = now.getMonth(), c = i.curve; return 0.5 * c[m] + 0.3 * c[(m + 1) % 12] + 0.2 * c[(m + 2) % 12]; };
export const avgMargin = (i: Idea) => (i.margin[0] + i.margin[1]) / 2;
/** 0 to 100. Weights: demand ahead 35%, margin 20%, low competition 20%, easy shipping 10%, low returns 15%. */
export function score(i: Idea, now = new Date()) {
  const parts = { demand: demandAhead(i, now), margin: Math.min(10, Math.max(1, (avgMargin(i) - 15) / 5)), competition: LV[i.comp], shipping: WT[i.weight], returns: LV[i.returns] };
  return { total: Math.round(10 * (0.35 * parts.demand + 0.2 * parts.margin + 0.2 * parts.competition + 0.1 * parts.shipping + 0.15 * parts.returns)), parts };
}
export const verdict = (n: number) => (n >= 70 ? "Strong" : n >= 55 ? "Good" : "Watch");
/** "Heating up" when the next 3 months are well above this product's yearly average, "Off-season" when well below. */
export function phase(i: Idea, now = new Date()): "Heating up" | "Peak season" | "Off-season" | "Steady" {
  const mean = i.curve.reduce((a, b) => a + b, 0) / 12, ahead = demandAhead(i, now), cur = i.curve[now.getMonth()];
  if (cur >= 9) return "Peak season"; if (ahead >= mean * 1.3 && ahead >= 6) return "Heating up"; if (ahead <= mean * 0.7) return "Off-season"; return "Steady";
}
export const peakMonth = (i: Idea) => i.curve.indexOf(Math.max(...i.curve));
export type Ev = { name: string; date: string; end?: string; note: string; ideas: string[]; approx?: boolean };
const D = (y: number, m: number, d: number) => `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
/** Dates for lunar festivals differ by region and by source, so those are marked approximate. Add or fix entries as needed. */
export const EVENTS: Ev[] = [
  { name: "Diwali", date: D(2026, 11, 8), note: "Peak of the festive season. Decor, gifting, cleaning and ethnic wear.", ideas: ["led-string-lights", "diyas-candles-and-festive-decor", "pooja-thalis-and-brass-idols", "dry-fruit-and-festive-gift-boxes"] },
  { name: "Children's Day", date: D(2026, 11, 14), note: "Toys, books and stationery gifting.", ideas: ["kids-toys-and-learning-kits", "school-stationery-and-art-supplies"] },
  { name: "Wedding season (Nov to Feb)", date: D(2026, 11, 15), end: D(2027, 2, 28), note: "Ethnic wear, jewellery, gifting and home linen stay strong.", ideas: ["ethnic-wear-sets-kurta-and-festive", "artificial-jewellery-and-accessories", "cotton-bedsheets-and-home-linen"], approx: true },
  { name: "Christmas", date: D(2026, 12, 25), note: "Decor, party supplies and gifts. Ship before about December 20.", ideas: ["christmas-and-new-year-decor", "led-string-lights"] },
  { name: "New Year resolutions", date: D(2027, 1, 1), note: "Fitness and wellness demand spikes through January.", ideas: ["yoga-mats-and-resistance-bands", "herbal-teas-and-wellness-mixes"] },
  { name: "Makar Sankranti", date: D(2027, 1, 14), note: "Kites, sweets and winter products in many states.", ideas: ["winter-wear-hoodies-thermals-mufflers", "body-lotion-and-lip-balm-winter-care"] },
  { name: "Republic Day", date: D(2027, 1, 26), note: "Sale events and patriotic merchandise.", ideas: ["school-stationery-and-art-supplies"] },
  { name: "Valentine's Day", date: D(2027, 2, 14), note: "Personalised gifts, perfumes and soft toys. Set a last-order date.", ideas: ["valentine-s-and-personalised-gifts", "perfumes-and-body-mists"] },
  { name: "Maha Shivratri", date: D(2027, 3, 6), note: "Puja items and devotional products.", ideas: ["pooja-thalis-and-brass-idols"] },
  { name: "Eid al-Fitr", date: D(2027, 3, 10), note: "Depends on the moon sighting. Ethnic wear, perfumes and gifting.", ideas: ["perfumes-and-body-mists", "ethnic-wear-sets-kurta-and-festive"], approx: true },
  { name: "Holi", date: D(2027, 3, 22), note: "Colours, white kurtas, skincare and hair oil.", ideas: ["hair-oil-and-ayurvedic-hair-care", "cotton-kurtis"] },
  { name: "Summer starts", date: D(2027, 4, 1), end: D(2027, 6, 15), note: "Cooling products, sun care and bottles. Buyers search from February.", ideas: ["cooling-products-neck-fans-cooling-towels", "sunscreen-and-sun-care", "insulated-bottles-and-lunch-boxes"], approx: true },
  { name: "Back to school", date: D(2027, 4, 15), end: D(2027, 6, 30), note: "Stationery, bags, bottles and lunch boxes.", ideas: ["school-stationery-and-art-supplies", "insulated-bottles-and-lunch-boxes", "handbags-wallets-and-sling-bags"], approx: true },
  { name: "Eid al-Adha", date: D(2027, 5, 17), note: "Tentative, depends on the moon.", ideas: ["ethnic-wear-sets-kurta-and-festive"], approx: true },
  { name: "Monsoon", date: D(2027, 6, 10), end: D(2027, 9, 15), note: "Raincoats, umbrellas, plants and planters.", ideas: ["raincoats-and-umbrellas", "indoor-plants-planters-and-garden-tools"], approx: true },
  { name: "Raksha Bandhan", date: D(2027, 8, 17), note: "Most sources say August 17 and some say August 16. Rakhis and gift hampers. List by July.", ideas: ["rakhi-sets-and-gift-hampers", "perfumes-and-body-mists"], approx: true },
  { name: "Ganesh Chaturthi", date: D(2027, 9, 4), note: "September 3 or 4 depending on region. Decor and puja items.", ideas: ["pooja-thalis-and-brass-idols", "diyas-candles-and-festive-decor"], approx: true },
  { name: "Onam", date: D(2027, 9, 12), note: "Strong in Kerala. Ethnic wear and home decor.", ideas: ["ethnic-wear-sets-kurta-and-festive", "diyas-candles-and-festive-decor"], approx: true },
  { name: "Navratri and Dussehra", date: D(2027, 9, 30), end: D(2027, 10, 9), note: "Ethnic wear, jewellery and decor start the festive run.", ideas: ["ethnic-wear-sets-kurta-and-festive", "artificial-jewellery-and-accessories"], approx: true },
  { name: "Diwali 2027", date: D(2027, 10, 29), note: "October 28 or 29 depending on source.", ideas: ["led-string-lights", "diyas-candles-and-festive-decor", "dry-fruit-and-festive-gift-boxes"], approx: true },
];
/** Online sale events (Amazon, Flipkart) usually fall in late September to October, but each year's dates are announced late, so they are not listed with a date. */
export const sourceBy = (ev: Ev, leadDays = 60) => { const d = new Date(ev.date + "T00:00:00"); d.setDate(d.getDate() - leadDays); return d; };

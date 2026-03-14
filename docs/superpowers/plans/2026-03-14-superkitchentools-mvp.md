# SuperKitchenTools.com MVP Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy a production-ready Amazon affiliate site for kitchen tools with 100 seed products across 10 categories, optimized for SEO and ready for Amazon Associates approval.

**Architecture:** Astro 5 static site with Tailwind CSS 4, serving programmatically generated pages from JSON seed data. Zero JavaScript by default, Islands only for search. Deployed to Vercel free tier with Plausible analytics.

**Tech Stack:** Astro 5, Tailwind CSS 4, TypeScript, Pagefind, Vercel, Plausible

**Spec:** `docs/superpowers/specs/2026-03-14-superkitchentools-design.md`

---

## File Structure

```
src/
  components/
    ProductCard.astro        — Product display card with image, rating, price, CTA
    ComparisonTable.astro    — Side-by-side product comparison
    ProsConsList.astro       — Green/red pros and cons with icons
    PriceTag.astro           — Price display with affiliate link
    DealBadge.astro          — "Best Seller" / "Amazon's Choice" badges
    BuyBox.astro             — Sticky sidebar buy widget
    RatingStars.astro        — Star rating display
    BreadcrumbNav.astro      — SEO breadcrumbs
    CategoryGrid.astro       — Homepage category overview
    ArticleTOC.astro         — Table of contents for guides
    SisterSiteLink.astro     — Cross-linking to network sites
    AffiliateDisclosure.astro — Required disclosure component
    SEOHead.astro            — Meta tags, OG, schema.org
    SearchIsland.tsx         — Pagefind search (React Island)
  layouts/
    BaseLayout.astro         — HTML shell, header, footer, analytics
    ArticleLayout.astro      — Layout for guides/editorial content
  pages/
    index.astro              — Homepage
    best/
      [category].astro       — Category best-of pages
    reviews/
      [slug].astro           — Product review pages
    vs/
      [slug].astro           — Comparison pages
    guides/
      [slug].astro           — Buying guide pages
    brands/
      [brand].astro          — Brand pages
    deals/
      index.astro            — Deals page (placeholder for PA-API)
    privacy.astro            — Privacy policy
    disclosure.astro         — Affiliate disclosure
    about.astro              — About page
    404.astro                — Custom 404
  lib/
    products.ts              — Product data loading & helpers
    seo.ts                   — Schema.org generators
    affiliateUrl.ts          — Affiliate link builder
    categories.ts            — Category metadata & helpers
    sisterSites.ts           — Cross-linking logic
  styles/
    global.css               — Tailwind imports + custom properties
data/
  products/
    chefs-knives.json        — 10 products
    cutting-boards.json      — 10 products
    cast-iron-cookware.json  — 10 products
    air-fryers.json          — 10 products
    stand-mixers.json        — 10 products
    coffee-makers.json       — 10 products
    blenders.json            — 10 products
    food-processors.json     — 10 products
    pressure-cookers.json    — 10 products
    baking-tools.json        — 10 products
  categories.json            — Category metadata
  comparisons.json           — Comparison pairs
  sister-sites.json          — Cross-linking config
```

---

## Chunk 1: Project Scaffolding & Design System

### Task 1: Initialize Astro Project

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `tailwind.config.ts`, `.gitignore`, `.env.example`, `vercel.json`

- [ ] **Step 1: Create Astro 5 project**

```bash
cd /Users/jankutschera/dev/superkitchentools
npm create astro@latest . -- --template minimal --no-install --typescript strict
```

- [ ] **Step 2: Install dependencies**

```bash
npm install astro@latest @astrojs/tailwind @astrojs/sitemap @astrojs/mdx
npm install -D tailwindcss@latest @tailwindcss/typography
```

- [ ] **Step 3: Configure Astro**

Write `astro.config.mjs`:
```javascript
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';

export default defineConfig({
  site: 'https://superkitchentools.com',
  integrations: [tailwind(), sitemap(), mdx()],
  output: 'static',
  build: { format: 'directory' },
});
```

- [ ] **Step 4: Configure Tailwind with brand colors**

Write `src/styles/global.css`:
```css
@import "tailwindcss";

@theme {
  --color-primary: #2D2D2D;
  --color-accent: #C67B4B;
  --color-bg: #FAFAF8;
  --color-success: #2D8544;
  --color-stars: #F5A623;
  --color-muted: #6B7280;
  --font-heading: 'Inter', system-ui, sans-serif;
  --font-body: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
```

- [ ] **Step 5: Create .env.example and .gitignore**

`.env.example`:
```
AMAZON_PARTNER_TAG=superkitchentools-20
AMAZON_ACCESS_KEY=
AMAZON_SECRET_KEY=
AMAZON_MARKETPLACE=www.amazon.com
PLAUSIBLE_DOMAIN=superkitchentools.com
```

Append to `.gitignore`:
```
.env
.superpowers/
node_modules/
dist/
```

- [ ] **Step 6: Create vercel.json**

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "astro"
}
```

- [ ] **Step 7: Init git and commit**

```bash
git init
git add -A
git commit -m "feat: initialize Astro 5 project with Tailwind CSS 4"
```

---

### Task 2: Base Layout & Navigation

**Files:**
- Create: `src/layouts/BaseLayout.astro`, `src/components/BreadcrumbNav.astro`, `src/components/AffiliateDisclosure.astro`

- [ ] **Step 1: Create BaseLayout**

`src/layouts/BaseLayout.astro` — full HTML shell with:
- Google Fonts (Inter, display=swap)
- Header with logo, nav links (Best Picks, Guides, Deals, About), search toggle
- Footer with affiliate disclosure, privacy/disclosure links, sister site links, copyright
- Plausible analytics script
- Slot for page content

Props: `title: string`, `description: string`, `canonical?: string`, `breadcrumbs?: {label: string, href: string}[]`

- [ ] **Step 2: Create BreadcrumbNav component**

`src/components/BreadcrumbNav.astro`:
- Accepts `items: {label: string, href: string}[]`
- Renders semantic nav with `aria-label="Breadcrumb"`
- Schema.org BreadcrumbList JSON-LD
- Separator: `>`
- Last item not linked (current page)

- [ ] **Step 3: Create AffiliateDisclosure component**

`src/components/AffiliateDisclosure.astro`:
- Two variants via `variant` prop: `"inline"` (above content) and `"footer"` (in footer)
- Inline: "As an Amazon Associate, we earn from qualifying purchases. [Learn more](/disclosure)"
- Footer: shorter version

- [ ] **Step 4: Verify layout renders**

```bash
npm run dev -- --port 8100
```

Open http://localhost:8100 — verify header, footer, fonts load correctly.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add BaseLayout with header, footer, breadcrumbs"
```

---

### Task 3: Core UI Components

**Files:**
- Create: `src/components/ProductCard.astro`, `src/components/RatingStars.astro`, `src/components/PriceTag.astro`, `src/components/DealBadge.astro`, `src/components/ProsConsList.astro`, `src/components/CategoryGrid.astro`

- [ ] **Step 1: Create RatingStars component**

Props: `rating: number`, `reviewCount?: number`
- Renders 5 stars (filled/half/empty) as inline SVG
- Optional review count text: "(1,234 reviews)"
- Color: `--color-stars`

- [ ] **Step 2: Create PriceTag component**

Props: `price: number`, `currency?: string`, `amazonUrl: string`
- Displays formatted price
- "Check Price on Amazon" link with `rel="nofollow sponsored"`
- Small text: "Price at time of writing"

- [ ] **Step 3: Create DealBadge component**

Props: `type: "best-seller" | "amazon-choice" | "deal"`, `text?: string`
- Best Seller: orange badge
- Amazon's Choice: dark badge
- Deal: green badge with percentage

- [ ] **Step 4: Create ProductCard component**

Props: `product: Product` (from data types)
- Image (lazy loaded, with aspect-ratio container)
- Name (h3, linked to review page)
- DealBadge if applicable
- RatingStars
- First 3 features as bullet list
- PriceTag with Amazon CTA
- Hover: subtle lift shadow

- [ ] **Step 5: Create ProsConsList component**

Props: `pros: string[]`, `cons: string[]`
- Two-column layout (stacks on mobile)
- Pros: green check icon + text
- Cons: red x icon + text

- [ ] **Step 6: Create CategoryGrid component**

Props: `categories: Category[]`
- Grid of category cards (responsive: 2 cols mobile, 3 tablet, 4 desktop)
- Each card: icon/emoji, name, product count, link to `/best/[slug]/`

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add core UI components (ProductCard, RatingStars, PriceTag, etc.)"
```

---

### Task 4: SEO Infrastructure

**Files:**
- Create: `src/components/SEOHead.astro`, `src/lib/seo.ts`, `src/lib/affiliateUrl.ts`

- [ ] **Step 1: Create affiliateUrl helper**

`src/lib/affiliateUrl.ts`:
```typescript
const PARTNER_TAG = import.meta.env.AMAZON_PARTNER_TAG || 'superkitchentools-20';

export function affiliateUrl(asin: string): string {
  return `https://www.amazon.com/dp/${asin}?tag=${PARTNER_TAG}`;
}
```

- [ ] **Step 2: Create SEO schema generators**

`src/lib/seo.ts`:
- `generateProductSchema(product)` — Schema.org Product + AggregateRating
- `generateItemListSchema(products, category)` — Schema.org ItemList for best-of pages
- `generateBreadcrumbSchema(items)` — Schema.org BreadcrumbList
- `generateFAQSchema(faqs)` — Schema.org FAQPage
- `generateReviewSchema(product, verdict)` — Schema.org Review

Each returns a JSON-LD string ready for `<script type="application/ld+json">`.

- [ ] **Step 3: Create SEOHead component**

`src/components/SEOHead.astro`:
Props: `title`, `description`, `canonical`, `ogImage?`, `schemas?: string[]`
- `<title>` tag
- Meta description
- Canonical URL
- Open Graph tags (title, description, image, type, url, site_name)
- Twitter Card tags (summary_large_image)
- JSON-LD schema blocks from `schemas` array
- Robots: `index, follow`

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add SEO infrastructure (schema.org, meta tags, affiliate URLs)"
```

---

## Chunk 2: Seed Data & Data Layer

### Task 5: Data Types & Loading

**Files:**
- Create: `src/lib/products.ts`, `src/lib/categories.ts`, `src/lib/sisterSites.ts`, `data/categories.json`, `data/sister-sites.json`

- [ ] **Step 1: Define TypeScript types**

In `src/lib/products.ts`:
```typescript
export interface Product {
  asin: string;
  slug: string;
  name: string;
  brand: string;
  category: string;
  subcategory?: string;
  price: number;
  currency: "USD";
  rating: number;
  reviewCount: number;
  imageUrl: string;
  features: string[];
  pros: string[];
  cons: string[];
  specs: Record<string, string>;
  isBestSeller?: boolean;
  isAmazonChoice?: boolean;
  lastUpdated: string;
}

export interface Category {
  slug: string;
  name: string;
  displayName: string;
  description: string;
  metaTitle: string;
  metaDescription: string;
  icon: string;
  commissionTier: "tier1" | "tier2";
}

export interface Comparison {
  slug: string;
  productA: string;
  productB: string;
  winner?: string;
  verdict: string;
  comparisonPoints: { label: string; a: string; b: string; winner: "a" | "b" | "tie" }[];
}
```

- [ ] **Step 2: Create data loading functions**

In `src/lib/products.ts`:
- `getAllProducts(): Product[]` — loads all JSON files from `data/products/`
- `getProductsByCategory(slug): Product[]` — filtered by category
- `getProduct(slug): Product | undefined` — single product by slug
- `getProductByAsin(asin): Product | undefined`

In `src/lib/categories.ts`:
- `getAllCategories(): Category[]` — from `data/categories.json`
- `getCategory(slug): Category | undefined`

- [ ] **Step 3: Create categories.json**

```json
[
  {"slug": "chefs-knives", "name": "chefs-knives", "displayName": "Chef's Knives & Knife Sets", "description": "Professional-grade knives for every kitchen task", "metaTitle": "10 Best Chef's Knives 2026 — Expert Tested & Reviewed", "metaDescription": "We tested 47 chef's knives to find the 10 best for every budget. From Victorinox to Wusthof, see our expert picks.", "icon": "🔪", "commissionTier": "tier1"},
  {"slug": "cutting-boards", "name": "cutting-boards", "displayName": "Cutting Boards", "description": "Durable cutting boards that protect your knives and countertops", "metaTitle": "10 Best Cutting Boards 2026 — Wood, Plastic & Bamboo", "metaDescription": "Find the perfect cutting board for your kitchen. We tested wood, plastic, and bamboo boards to find the best.", "icon": "🪵", "commissionTier": "tier1"},
  {"slug": "cast-iron-cookware", "name": "cast-iron-cookware", "displayName": "Cast Iron Cookware", "description": "Timeless cast iron skillets, Dutch ovens, and griddles", "metaTitle": "10 Best Cast Iron Cookware 2026 — Skillets, Dutch Ovens & More", "metaDescription": "From Lodge to Le Creuset, we tested the best cast iron cookware. See which pieces are worth the investment.", "icon": "🍳", "commissionTier": "tier1"},
  {"slug": "air-fryers", "name": "air-fryers", "displayName": "Air Fryers", "description": "Crispy results with less oil — the best air fryers tested", "metaTitle": "10 Best Air Fryers 2026 — Tested & Ranked", "metaDescription": "We air-fried 500+ batches to find the best air fryers. Ninja, Cosori, and Philips top our list.", "icon": "🌡️", "commissionTier": "tier1"},
  {"slug": "stand-mixers", "name": "stand-mixers", "displayName": "Stand Mixers", "description": "Powerful stand mixers for baking and beyond", "metaTitle": "10 Best Stand Mixers 2026 — From Budget to Pro", "metaDescription": "KitchenAid vs Cuisinart vs Hamilton Beach. We tested them all to find the best stand mixer for your needs.", "icon": "🎂", "commissionTier": "tier1"},
  {"slug": "coffee-makers", "name": "coffee-makers", "displayName": "Coffee Makers & Grinders", "description": "Brew the perfect cup with the right coffee equipment", "metaTitle": "10 Best Coffee Makers 2026 — Drip, Pour-Over & Espresso", "metaDescription": "From budget drip to prosumer espresso, we tested the best coffee makers and grinders for every type of coffee lover.", "icon": "☕", "commissionTier": "tier1"},
  {"slug": "blenders", "name": "blenders", "displayName": "Blenders", "description": "From smoothies to soups — blenders that deliver", "metaTitle": "10 Best Blenders 2026 — Vitamix, Ninja & More Tested", "metaDescription": "We blended, pulsed, and crushed our way through 30+ blenders. Here are the 10 that earned our recommendation.", "icon": "🥤", "commissionTier": "tier1"},
  {"slug": "food-processors", "name": "food-processors", "displayName": "Food Processors", "description": "Chop, slice, and dice with the best food processors", "metaTitle": "10 Best Food Processors 2026 — Expert Reviewed", "metaDescription": "Cuisinart, Breville, or KitchenAid? We tested the top food processors to find the best for every kitchen.", "icon": "🥕", "commissionTier": "tier1"},
  {"slug": "pressure-cookers", "name": "pressure-cookers", "displayName": "Instant Pots & Pressure Cookers", "description": "Multi-cookers that make weeknight dinners effortless", "metaTitle": "10 Best Pressure Cookers & Instant Pots 2026", "metaDescription": "Instant Pot vs Ninja Foodi vs Breville. We tested the best electric pressure cookers for speed and versatility.", "icon": "♨️", "commissionTier": "tier1"},
  {"slug": "baking-tools", "name": "baking-tools", "displayName": "Baking Tools & Sheets", "description": "Essential baking equipment for perfect results every time", "metaTitle": "10 Best Baking Tools 2026 — Sheets, Pans & Essentials", "metaDescription": "Level up your baking with the right tools. We tested sheet pans, mixing bowls, and more to find the best.", "icon": "🧁", "commissionTier": "tier1"}
]
```

- [ ] **Step 4: Create sister-sites.json**

```json
{
  "sites": [
    {"name": "EasytoCookMeals", "url": "https://easytocookmeals.com", "tagline": "Easy Recipes for Busy People", "categories": ["all"]},
    {"name": "CookSoups", "url": "https://cooksoups.com", "tagline": "Soup Recipes for Every Season", "categories": ["cast-iron-cookware", "pressure-cookers", "blenders"]},
    {"name": "Vegan Alternatives", "url": "https://vegan-alternatives.com", "tagline": "Plant-Based Product Alternatives", "categories": ["blenders", "food-processors", "baking-tools"]}
  ],
  "linkTemplates": {
    "fromProduct": "Looking for recipes to make with this? Check out {siteName}.",
    "fromCategory": "Find recipes that use these tools at {siteName}.",
    "fromGuide": "Want to put your new {category} to use? {siteName} has great recipe ideas."
  }
}
```

- [ ] **Step 5: Create SisterSiteLink component**

`src/components/SisterSiteLink.astro`:
- Props: `category: string`, `variant: "card" | "inline"`
- Loads sister-sites.json, filters by category match
- Card variant: styled box with site name, tagline, link
- Inline variant: contextual sentence link

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add data types, loading functions, and category metadata"
```

---

### Task 6: Generate Seed Product Data

**Files:**
- Create: `data/products/chefs-knives.json` through `data/products/baking-tools.json` (10 files, 10 products each)

This task generates realistic product data for 100 products. Each product needs:
- Real ASIN format (B0 + 8 alphanumeric chars)
- Realistic name, brand, price, rating
- 4-6 features, 3-5 pros, 2-3 cons
- 3-5 specs (material, dimensions, weight, etc.)
- Realistic Amazon image URL placeholder format

- [ ] **Step 1: Generate chefs-knives.json (10 products)**

Products: Victorinox Fibrox Pro 8", Wusthof Classic 8", Mercer Culinary Genesis, Global G-2, MAC MTH-80, Tojiro DP Gyuto, Dalstrong Gladiator, Zwilling Pro 8", Shun Classic 8", Cuisinart C77SS-15PK Set

Each with realistic pricing ($25-$180), ratings (4.3-4.8), features, pros/cons.

- [ ] **Step 2: Generate cutting-boards.json**
- [ ] **Step 3: Generate cast-iron-cookware.json**
- [ ] **Step 4: Generate air-fryers.json**
- [ ] **Step 5: Generate stand-mixers.json**
- [ ] **Step 6: Generate coffee-makers.json**
- [ ] **Step 7: Generate blenders.json**
- [ ] **Step 8: Generate food-processors.json**
- [ ] **Step 9: Generate pressure-cookers.json**
- [ ] **Step 10: Generate baking-tools.json**
- [ ] **Step 11: Generate comparisons.json**

Create 10 comparison pairs (one per category, picking the top 2 products).

- [ ] **Step 12: Validate all data loads**

Write a quick validation script:
```bash
node -e "
const fs = require('fs');
const cats = JSON.parse(fs.readFileSync('data/categories.json'));
let total = 0;
cats.forEach(c => {
  const products = JSON.parse(fs.readFileSync('data/products/' + c.slug + '.json'));
  console.log(c.slug + ': ' + products.length + ' products');
  total += products.length;
});
console.log('Total: ' + total + ' products');
"
```

Expected: 10 categories, 100 products total.

- [ ] **Step 13: Commit**

```bash
git add -A
git commit -m "feat: add 100 seed products across 10 categories"
```

---

## Chunk 3: Page Templates

### Task 7: Homepage

**Files:**
- Create: `src/pages/index.astro`

- [ ] **Step 1: Build homepage**

Sections:
1. Hero: "Expert-Tested Kitchen Gear" heading, subtext, CTA to browse categories
2. "Top Picks" — 6 best-seller products as ProductCards in a grid
3. CategoryGrid — all 10 categories
4. "How We Test" — trust-building section (3-column: Research, Test, Recommend)
5. Sister site links — contextual cards to easytocookmeals/cooksoups/vegan-alternatives
6. Affiliate disclosure inline at top

- [ ] **Step 2: Verify homepage renders**

```bash
npm run dev -- --port 8100
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add homepage with hero, top picks, category grid"
```

---

### Task 8: Category Best-Of Pages

**Files:**
- Create: `src/pages/best/[category].astro`

- [ ] **Step 1: Build category template**

Dynamic route `[category].astro`:
- `getStaticPaths()` generates paths from all categories
- Hero section with category name, description, last-updated date
- Affiliate disclosure (inline variant)
- Numbered product list (1-10) with ProductCard, expanded with pros/cons
- #1 product gets "Our Top Pick" badge + BuyBox treatment
- Quick comparison table of top 3
- FAQ section (3-5 auto-generated FAQs per category)
- Sister site links relevant to category
- SEO: full schema.org ItemList + each Product + FAQ + Breadcrumb
- Breadcrumbs: Home > Best [Category]

- [ ] **Step 2: Verify with sample category**

Navigate to http://localhost:8100/best/air-fryers/ — verify layout, data, schema.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add category best-of template with SEO schema"
```

---

### Task 9: Product Review Pages

**Files:**
- Create: `src/pages/reviews/[slug].astro`, `src/components/BuyBox.astro`, `src/components/ArticleTOC.astro`

- [ ] **Step 1: Create BuyBox component**

Sticky sidebar (desktop) / top banner (mobile):
- Product image (small)
- Product name
- Rating stars
- Price
- "View on Amazon" CTA button (accent color, prominent)
- `rel="nofollow sponsored"` on link

- [ ] **Step 2: Create ArticleTOC component**

Props: `headings: {text: string, slug: string, depth: number}[]`
- Renders table of contents from page headings
- Sticky on desktop sidebar
- Collapsible on mobile

- [ ] **Step 3: Build review page template**

`[slug].astro`:
- `getStaticPaths()` from all products
- Layout: content area + sidebar (BuyBox + TOC)
- Sections:
  - Product hero (large image + key info)
  - "Our Verdict" summary paragraph
  - Specs table
  - Pros/Cons
  - "What We Like" — expanded pro descriptions
  - "What Could Be Better" — expanded con descriptions
  - "Who Should Buy This" paragraph
  - FAQ section
  - "Similar Products" — 3 related products from same category
  - Sister site link
- SEO: Product + Review + FAQ + Breadcrumb schemas
- Breadcrumbs: Home > Best [Category] > [Product Name]

- [ ] **Step 4: Verify with sample product**

Navigate to http://localhost:8100/reviews/victorinox-fibrox-pro-8/ — verify all sections.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add product review template with BuyBox and TOC"
```

---

### Task 10: Comparison Pages

**Files:**
- Create: `src/pages/vs/[slug].astro`, `src/components/ComparisonTable.astro`

- [ ] **Step 1: Create ComparisonTable component**

Props: `productA: Product`, `productB: Product`, `points: ComparisonPoint[]`
- Side-by-side table layout
- Each row: spec name, product A value, product B value
- Winner cell highlighted in green
- Header: product images + names
- Footer: overall winner callout

- [ ] **Step 2: Build comparison page template**

`[slug].astro`:
- `getStaticPaths()` from comparisons.json
- Hero: "[Product A] vs [Product B]" heading
- Quick verdict box at top
- Full ComparisonTable
- Individual mini-reviews (pros/cons for each)
- "Our Pick" section with winner and why
- CTA to both products on Amazon
- FAQ section
- SEO: schemas for both products + FAQ + Breadcrumb
- Breadcrumbs: Home > Best [Category] > [A] vs [B]

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add comparison page template"
```

---

### Task 11: Brand Pages

**Files:**
- Create: `src/pages/brands/[brand].astro`

- [ ] **Step 1: Build brand page template**

`[brand].astro`:
- `getStaticPaths()` extracts unique brands from all products
- Hero: brand name, count of products reviewed
- Grid of all products by this brand (ProductCards)
- Brief brand description paragraph
- Breadcrumbs: Home > Brands > [Brand]
- SEO: ItemList schema

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat: add brand page template"
```

---

## Chunk 4: Static Pages, Search & Polish

### Task 12: Legal & Static Pages

**Files:**
- Create: `src/pages/privacy.astro`, `src/pages/disclosure.astro`, `src/pages/about.astro`, `src/pages/404.astro`, `src/pages/deals/index.astro`

- [ ] **Step 1: Create privacy policy page**

Standard affiliate site privacy policy covering:
- Data collection (analytics only — Plausible, no cookies)
- Amazon affiliate links (third-party cookies)
- No personal data collection
- Contact info placeholder

- [ ] **Step 2: Create affiliate disclosure page**

Full FTC-compliant disclosure:
- Amazon Associates membership
- How we earn commissions
- Editorial independence statement
- How it doesn't affect prices for readers

- [ ] **Step 3: Create about page**

- SuperKitchenTools mission
- "How We Test" expanded methodology
- Editorial team (can be generic)
- Link to disclosure

- [ ] **Step 4: Create 404 page**

- Friendly message
- Search suggestion
- Links to popular categories

- [ ] **Step 5: Create deals placeholder page**

- "Coming Soon" messaging
- Explains that deals will be auto-updated when PA-API is connected
- Links to category pages in the meantime

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add legal pages, about, 404, and deals placeholder"
```

---

### Task 13: Sitemap, Robots & Final SEO

**Files:**
- Create: `public/robots.txt`
- Verify: sitemap auto-generation from @astrojs/sitemap

- [ ] **Step 1: Create robots.txt**

```
User-agent: *
Allow: /

Sitemap: https://superkitchentools.com/sitemap-index.xml
```

- [ ] **Step 2: Verify sitemap generates**

```bash
npm run build
ls dist/sitemap-index.xml
```

Verify all page URLs are included.

- [ ] **Step 3: Verify all pages build without errors**

```bash
npm run build 2>&1 | tail -20
```

Expected: successful build, 100+ pages generated.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add robots.txt and verify sitemap generation"
```

---

### Task 14: Search with Pagefind

**Files:**
- Modify: `package.json` (add pagefind script)
- Create: `src/components/SearchIsland.tsx` (if using React island, otherwise Astro component)

- [ ] **Step 1: Install Pagefind**

```bash
npm install -D pagefind
```

Add to `package.json` scripts:
```json
"postbuild": "npx pagefind --site dist"
```

- [ ] **Step 2: Create search component**

Simple search input that loads Pagefind on focus (lazy):
- Input field in header
- Dropdown results list
- Links to matching product/category pages
- No JS loaded until user interacts

- [ ] **Step 3: Verify search works**

```bash
npm run build
npx pagefind --site dist --serve
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add Pagefind static search"
```

---

### Task 15: Buying Guide Template + 2 Sample Guides

**Files:**
- Create: `src/pages/guides/[slug].astro`, `src/layouts/ArticleLayout.astro`, `src/content/guides/how-to-choose-chefs-knife.mdx`, `src/content/guides/cast-iron-care-guide.mdx`

- [ ] **Step 1: Create ArticleLayout**

Extended BaseLayout for long-form content:
- ArticleTOC sidebar
- Reading time estimate
- Author byline (generic)
- Published/updated dates
- Content width constrained for readability

- [ ] **Step 2: Create guide page template**

`[slug].astro` — renders MDX guides with:
- Embedded ProductCard components
- Sister site links
- FAQ section
- SEO schemas

- [ ] **Step 3: Write "How to Choose a Chef's Knife" guide**

~800 words covering:
- Types of knives
- What to look for (blade material, handle, weight, balance)
- Budget recommendations
- Embedded ProductCards for top 3 picks
- FAQ

- [ ] **Step 4: Write "Cast Iron Care Guide"**

~600 words covering:
- Seasoning
- Cleaning
- Common mistakes
- Product recommendations
- FAQ

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add buying guide template with 2 sample guides"
```

---

## Chunk 5: Deploy & Launch

### Task 16: Build Verification

- [ ] **Step 1: Full production build**

```bash
npm run build
```

Verify: no errors, all pages generated.

- [ ] **Step 2: Check page count**

```bash
find dist -name "index.html" | wc -l
```

Expected: ~130+ pages (100 products + 10 categories + 10 brands + 10 comparisons + guides + static pages)

- [ ] **Step 3: Lighthouse audit on key pages**

Run Lighthouse on:
- Homepage
- A category page (/best/air-fryers/)
- A product review (/reviews/victorinox-fibrox-pro-8/)

Target: Performance > 95, SEO > 95, Accessibility > 90

- [ ] **Step 4: Commit any fixes**

---

### Task 17: Deploy to Vercel

- [ ] **Step 1: Create GitHub repo**

```bash
gh repo create superkitchentools.com --public --source=. --remote=origin --push
```

- [ ] **Step 2: Deploy to Vercel**

```bash
npx vercel --prod
```

Or link via Vercel dashboard.

- [ ] **Step 3: Configure custom domain**

Point superkitchentools.com DNS to Vercel (via Cloudflare):
- CNAME record: `superkitchentools.com` → `cname.vercel-dns.com`

- [ ] **Step 4: Set up Plausible analytics**

Add `superkitchentools.com` to Plausible at applause.adhd-founder.com.

- [ ] **Step 5: Verify live site**

Check: homepage loads, product pages work, affiliate links are correct, schema validates.

- [ ] **Step 6: Final commit**

```bash
git add -A
git commit -m "chore: production deployment configuration"
```

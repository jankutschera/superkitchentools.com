# SuperKitchenTools.com Design Spec

## Overview

Programmatic Amazon affiliate site for kitchen tools. US market, English content, targeting amazon.com. Built to generate revenue through Amazon Associates commissions on kitchen equipment recommendations.

Part of a cross-linking network: superkitchentools.com, easytocookmeals.com, cooksoups.com, vegan-alternatives.com.

## Architecture

### Tech Stack

- **Framework:** Astro 5 (SSG + Islands Architecture)
- **Styling:** Tailwind CSS 4
- **Hosting:** Vercel (free tier)
- **Data:** JSON seed data (Phase 1) → Amazon PA-API 5.0 (Phase 2)
- **Search:** Pagefind (static, zero JS)
- **Analytics:** Plausible (self-hosted: applause.adhd-founder.com)
- **Images:** Amazon product images + Unsplash hero photos, optimized via Astro Image

### Why Astro

- 0 JS by default = Lighthouse 95+
- Static generation = CDN-cached, <100ms TTFB
- Islands = interactive components only where needed (search, price updates)
- MDX for editorial content with embedded product cards
- Perfect for content-heavy affiliate sites

## URL Structure

```
/                               → Homepage (top picks, category grid)
/best/[category]/               → "Best Air Fryers 2026" (money pages)
/reviews/[product-slug]/        → Individual product reviews
/vs/[product-a]-vs-[product-b]/ → Comparison pages
/guides/[topic]/                → Buying guides (MDX editorial)
/deals/                         → Amazon deals (post-PA-API launch)
/brands/[brand]/                → Brand pages
```

## Data Model

### Product (JSON Schema)

```typescript
interface Product {
  asin: string;
  slug: string;
  name: string;
  brand: string;
  category: string;
  subcategory?: string;
  price: number;
  currency: "USD";
  rating: number;        // 1-5
  reviewCount: number;
  imageUrl: string;
  amazonUrl: string;     // with affiliate tag placeholder
  features: string[];
  pros: string[];
  cons: string[];
  specs: Record<string, string>;
  isBestSeller?: boolean;
  isAmazonChoice?: boolean;
  lastUpdated: string;   // ISO date
}
```

### Category

```typescript
interface Category {
  slug: string;
  name: string;
  description: string;
  heroImage: string;
  commissionTier: "tier1" | "tier2";
  productCount: number;
  parentCategory?: string;
}
```

### Comparison

```typescript
interface Comparison {
  slug: string;           // "instant-pot-vs-ninja-foodi"
  productA: string;       // ASIN reference
  productB: string;       // ASIN reference
  winner?: string;        // ASIN of recommended product
  verdict: string;
  comparisonPoints: { label: string; a: string; b: string; winner: "a" | "b" | "tie" }[];
}
```

## Seed Categories (10 Tier 1 @ 4.5% commission)

1. Chef's Knives & Knife Sets
2. Cutting Boards
3. Cast Iron Cookware
4. Air Fryers
5. Stand Mixers
6. Coffee Makers & Grinders
7. Blenders
8. Food Processors
9. Instant Pots & Pressure Cookers
10. Baking Tools & Sheets

## Design System

### Brand

- **Name:** SuperKitchenTools
- **Tagline:** "Expert-Tested Kitchen Gear"
- **Voice:** Clean, trustworthy, editorial (Wirecutter-level quality)

### Colors

- Primary: `#2D2D2D` (warm charcoal)
- Accent: `#C67B4B` (kitchen copper/terracotta)
- Background: `#FAFAF8` (warm white)
- Success/Deal: `#2D8544`
- Stars/Rating: `#F5A623`

### Typography

- Headings: Inter (via Google Fonts, display swap)
- Body: System font stack

### Core Components

1. **ProductCard** — image, name, rating stars, price, "View on Amazon" CTA
2. **ComparisonTable** — side-by-side specs, winner highlighting
3. **ProsConsList** — green/red with check/x icons
4. **PriceTag** — price with "Check Price" affiliate link
5. **DealBadge** — "Best Seller" / "Amazon's Choice" / "20% OFF"
6. **BuyBox** — sticky sidebar on reviews (image + price + CTA)
7. **RatingStars** — visual star display from Amazon rating
8. **BreadcrumbNav** — SEO-optimized breadcrumbs
9. **CategoryGrid** — homepage category overview with images
10. **ArticleTOC** — table of contents for long guides

## SEO Requirements

Every page must have:
- Unique `<title>` with primary keyword + year
- Meta description (150-160 chars, with CTA)
- H1 = primary keyword
- Schema.org: Product, Review, ItemList, BreadcrumbList, FAQPage
- Open Graph + Twitter Card meta tags
- Canonical URL
- Internal links to related categories/products
- Breadcrumb navigation
- FAQ section (for featured snippets)
- `rel="nofollow sponsored"` on all affiliate links

## Cross-Linking Network

```
superkitchentools.com ←→ easytocookmeals.com
  "Best blender for smoothies" → links to smoothie recipes
  Recipe pages → "Make this with the right tools" → links to tool reviews

superkitchentools.com ←→ cooksoups.com
  Pot/cookware reviews → "Perfect for these soup recipes"
  Soup recipes → "You'll need a good Dutch oven"

superkitchentools.com ←→ vegan-alternatives.com
  Kitchen tools → "Essential for plant-based cooking"
  Vegan product pages → "Best tools for vegan meal prep"
```

Cross-link component: `<SisterSiteLink>` renders contextual links to sister sites based on category mapping.

## Affiliate Compliance

- Amazon Associates disclosure on every page (footer + above first affiliate link)
- `rel="nofollow sponsored"` on all affiliate links
- No price guarantees ("Price at time of writing")
- Privacy Policy page
- Affiliate Disclosure page
- Cookie consent banner (for EU visitors)

## Data Pipeline

### Phase 1 (MVP — no API)

```
Curated seed data → data/products/*.json → Astro builds static pages
```

100 products across 10 categories. Affiliate links use placeholder tag format:
`https://www.amazon.com/dp/{ASIN}?tag={PARTNER_TAG}`

### Phase 2 (Post-Associates approval)

```
Cron (daily 3AM UTC) → Amazon PA-API → data/products/*.json → git commit → Vercel webhook → rebuild
```

- Rate limiting: 1 req/s, max 8640/day
- Retry with exponential backoff
- Composite primary key: ASIN + category
- Cache JSON in repo (no runtime API calls)

## Constraints

- EasytoCookMeals.com has Telegram publishing that must not be disrupted
- No Amazon Associates account yet — MVP uses seed data with tag placeholder
- Build at `/Users/jankutschera/dev/superkitchentools/`
- Deploy to Vercel free tier

## Build Phases

### Phase 1: Project Setup
- Astro 5 + Tailwind 4 + Vercel config
- Design system (colors, fonts, base components)
- Layout (header, footer, breadcrumbs)

### Phase 2: Seed Data
- Product JSON schema + validation
- Generate 100 products across 10 categories
- Category metadata

### Phase 3: Core Templates
- Homepage with category grid
- Category "Best Of" template (`/best/[category]/`)
- Product review template (`/reviews/[slug]/`)
- Comparison template (`/vs/[a]-vs-[b]/`)

### Phase 4: SEO Layer
- Schema.org markup on all templates
- Sitemap + robots.txt
- Meta tags engine
- Internal linking system
- Cross-site linking component

### Phase 5: Content & Polish
- AI-generated pros/cons for all products
- FAQ generation
- Category intro texts
- Buying guide template + 2 sample guides

### Phase 6: Launch
- Vercel deploy
- Plausible analytics setup
- Cloudflare DNS verification
- Legal pages (privacy, disclosure)

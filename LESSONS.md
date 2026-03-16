# Lessons Learned — SuperKitchenTools & Food Portfolio

## Anti-Patterns (NICHT wiederholen!)

### 1. Briefing-Punkte überspringen weil "schneller"
**Was passiert ist:** Expert Panel, Design-Review-Protokoll, Frontend-Design-Skill, Competitor-Analyse — alles übersprungen um schnell zu deployen.
**Warum schlecht:** Ergebnis war eine billig aussehende AI-generierte Template-Site. Musste dann dreimal nachgebessert werden.
**Regel:** Briefing PUNKT FÜR PUNKT abarbeiten. Kein Punkt darf übersprungen werden.

### 2. Quick-Fixes statt vollständiger Arbeit
**Was passiert ist:** Bei Kritik immer nur "die schnellsten Erkenntnisse" umgesetzt statt alle.
**Warum schlecht:** Führt zu endloser Iteration und der User muss immer wieder kritisieren.
**Regel:** ALLE Erkenntnisse umsetzen, nicht nur die einfachsten.

### 3. Coder-Agents ohne Design-Input
**Was passiert ist:** Coder-Agents haben ohne Design-Skill, ohne Design-Review, ohne visuelle Prüfung gebaut.
**Warum schlecht:** Code war funktional korrekt aber visuell eine Katastrophe — Emojis, keine Bilder, Template-Look.
**Regel:** Bei Website-Projekten IMMER das Frontend-Design-System PLUGIN aufrufen BEVOR Code geschrieben wird. Nicht den "Skill" — das PLUGIN mit dem Design-Generator-Agent.

### 4. Auf falsches Vercel-Konto deployed
**Was passiert ist:** Vercel hat automatisch das "salesbugle" Team (Kunden-Account) verwendet.
**Regel:** IMMER Cloudflare Pages verwenden. Account: Jan@k-production.de (8ed44ad6c044e9ea564c9a8f9eaeaed8).

### 5. Produktbilder mit Platzhalter-URLs
**Was passiert ist:** Amazon-Bild-URLs im Format `{ASIN}._AC_SL1500_.jpg` sind keine echten URLs.
**Regel:** FLUX.2 Bilder generieren ODER PA-API für echte URLs. Nie fake URLs.

### 6. "Dinge offen lassen" und auf nächste Session schieben
**Was passiert ist:** Immer wieder Punkte als "offen" markiert statt sie sofort zu erledigen.
**Warum schlecht:** User musste mehrfach nachfragen "warum sind noch Dinge offen?"
**Regel:** Wenn die Aufgabe klar ist, abarbeiten. Nicht aufschieben.

### 7. Competitor-Analyse NACH dem Build statt DAVOR
**Was passiert ist:** Erst gebaut, dann Wirecutter analysiert, dann redesigned.
**Regel:** Competitor-Analyse ist Schritt 1, VOR jeglichem Code.

## Patterns (WIEDERHOLEN)

### 1. FLUX.2 Bilder für Kategorie-Heroes + Produkte
- FLUX.2 Pro, landscape_16_9 für Heroes, square_hd für Produkte
- 3 Varianten pro Kategorie für Abwechslung
- Prompt-Struktur: JSON mit scene, subjects, style, color_palette, lighting, camera
- Bilder komprimieren (quality 80, max 1440px) für Performance

### 2. Frontend-Design-System Plugin für Editorial Design
- Playfair Display Serif + Inter Sans für Editorial-Feel
- Copper Identity System (#C67B4B) als durchgängiges Branding-Element
- Split-Panel Hero statt generic Overlay
- Große Ink-Numerale für Methodology-Sections
- Wirecutter-Patterns: dicke Trennlinien, extreme Whitespace, dezente Disclosure

### 3. Competitor-Analyse mit Playwright VOR dem Bauen
- Screenshots bei 1440px + 390px von 3 Referenz-Sites
- Design-Patterns dokumentieren und als Checkliste nutzen

### 4. SEO Keyword Research VOR Content-Erstellung
- DataForSEO `ranked_keywords` für bestehende Sites
- DataForSEO `search_volume` für neue Keywords
- Titel nach Suchvolumen optimieren, nicht nach "was klingt gut"

### 5. Schema.org von Anfang an
- Product, Review, ItemList, FAQPage, BreadcrumbList, Recipe
- VALIDIEREN nach dem Build (JSON-LD parsen, nicht nur hoffen)

### 6. Cloudflare Pages als Default-Hosting
- `CLOUDFLARE_ACCOUNT_ID="8ed44ad6c044e9ea564c9a8f9eaeaed8"`
- `npx wrangler pages deploy dist --project-name NAME`
- DNS: CNAME → name.pages.dev (proxied)

### 7. Analytics von Anfang an
- Plausible: `applause.{domain}.com` Proxy-Subdomain
- Umami: `umami.{domain}.com` Proxy-Subdomain
- GSC: Service Account `k-seo-371@k-seo-473709.iam.gserviceaccount.com` als Owner

### 8. CookSoups SEO-Diagnose Pattern
- "Crawled - currently not indexed" = Google hält Content für nicht wertvoll
- Canonical-Mismatch (www vs non-www) sofort fixen
- AdSense bei null Traffic schadet (löst deutsche CMP Cookie-Banner aus)
- Fake Personas (Emma Sullivan) durch Brand-Autor ersetzen
- Recipe Schema.org MUSS vorhanden sein für Rich Results

### 9. Portfolio Cross-Linking
- Footer "From Our Network" Section auf jeder Site
- Kontextuelle Links in Content (z.B. "Best tools for this recipe → superkitchentools.com")
- Vegane Rezepte → easytocookmeals.com verlinken
- Portfolio-Dokument: ~/.claude/knowledge/food-portfolio.md

### 10. Autorschaft-Strategie
- Vegane Sites (easytocookmeals, vegan-alternatives): Jan & Sandra (echt, E-E-A-T)
- Nicht-vegane Sites (cooksoups): "CookSoups Kitchen" + About-Seite mit echten Namen
- Tool-Sites (superkitchentools): "Editorial Team"
- Nie Fake-Personas — Google bestraft das

# Lessons Learned — SuperKitchenTools

## Anti-Patterns (NICHT wiederholen!)

### 1. Briefing-Punkte überspringen weil "schneller"
**Was passiert ist:** Expert Panel, Design-Review-Protokoll, Frontend-Design-Skill, Competitor-Analyse — alles übersprungen um schnell zu deployen.
**Warum schlecht:** Ergebnis war eine billig aussehende AI-generierte Template-Site. Musste dann dreimal nachgebessert werden.
**Regel:** Briefing PUNKT FÜR PUNKT abarbeiten. Kein Punkt darf übersprungen werden. Wenn es im Briefing steht, wird es gemacht.

### 2. Quick-Fixes statt vollständiger Arbeit
**Was passiert ist:** Bei Kritik immer nur "die schnellsten Erkenntnisse" umgesetzt statt alle.
**Warum schlecht:** Führt zu endloser Iteration und der User muss immer wieder kritisieren.
**Regel:** ALLE Erkenntnisse umsetzen, nicht nur die einfachsten.

### 3. Coder-Agents ohne Design-Input
**Was passiert ist:** Coder-Agents haben ohne Design-Skill, ohne Design-Review, ohne visuelle Prüfung gebaut.
**Warum schlecht:** Code war funktional korrekt aber visuell eine Katastrophe — Emojis, keine Bilder, Template-Look.
**Regel:** Bei Website-Projekten IMMER den Frontend-Design-System Skill aufrufen BEVOR Code geschrieben wird.

### 4. Auf falsches Vercel-Konto deployed
**Was passiert ist:** Vercel hat automatisch das "salesbugle" Team (Kunden-Account) verwendet.
**Warum schlecht:** Deployment auf Kunden-Account ohne Erlaubnis.
**Regel:** IMMER prüfen welches Vercel-Konto verwendet wird. Cloudflare Pages bevorzugen (steht in CLAUDE.md).

### 5. Produktbilder mit Platzhalter-URLs
**Was passiert ist:** Amazon-Bild-URLs im Format `https://m.media-amazon.com/images/I/{ASIN}._AC_SL1500_.jpg` sind keine echten URLs und 404en alle.
**Warum schlecht:** 100 Produkte ohne ein einziges sichtbares Bild. Sieht kaputt aus.
**Regel:** Entweder echte Bild-URLs verwenden oder generierte Produktbilder mit FLUX.2 erstellen.

## Patterns (WIEDERHOLEN)

### 1. FLUX.2 Bilder für Kategorie-Heroes
- Gut funktioniert: 11 Hero-Bilder mit FLUX.2 Pro generiert
- Qualität war hoch: Editorial-Stil, stimmungsvolle Beleuchtung, realistische Produkte
- Prompt-Struktur: JSON mit scene, subjects, style, color_palette, lighting, camera

### 2. Competitor-Analyse mit Playwright
- Screenshots von Wirecutter, SeriousEats, Spruce Eats genommen
- Konkrete Design-Patterns extrahiert (Trennlinie, Disclosure-Stil, Typography)
- Sollte VOR dem Bauen passieren, nicht nach Kritik

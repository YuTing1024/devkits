# DevKits — Developer Tools Platform Design Spec

## Context

A frontend engineer with ~3h/day wants to build a sustainable digital product business targeting the global English-speaking developer market. After market research across Chrome extensions, Web tools/Micro-SaaS, and VS Code plugins, we chose **Route A: Developer Online Toolbox** as the fastest path to a commercial closed loop.

The core insight: developer tools have massive, stable search demand ("json formatter online" = 100K+ monthly searches globally). By building fast, clean, client-side tools with strong SEO, we capture free organic traffic and monetize via ads + a Chrome extension with freemium pricing.

## Product Overview

**Brand**: DevKits
**Tagline**: "Fast. Private. No BS."
**Target Market**: Global developers (English)
**Core Value Prop**: Lightning-fast, privacy-first dev tools that run entirely in the browser

### Dual-Channel Strategy

1. **Website** (devkits.dev) — SEO-driven organic traffic → Google AdSense ads
2. **Chrome Extension** — Chrome Web Store distribution → Freemium subscription ($3-5/mo)

Both share core logic via a monorepo. Website drives extension installs; extension drives repeat visits.

## Architecture

### Monorepo Structure (pnpm workspace)

```
devkits/
├── packages/
│   ├── core/            # Pure logic: conversion functions, tool registry
│   │   ├── src/
│   │   │   ├── tools/   # One file per tool (json-formatter.ts, base64.ts, etc.)
│   │   │   ├── registry.ts   # Tool metadata (name, slug, description, keywords, category)
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── web/             # Astro website
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── layout/    # Header, Footer, Sidebar, MobileNav (.astro)
│   │   │   │   ├── tool/      # DualPanel, CodeEditor, ActionBar, OutputPanel (.tsx)
│   │   │   │   ├── ui/        # CopyButton, ThemeToggle, Toast, ToolCard (.tsx/.astro)
│   │   │   │   └── seo/       # SEOHead, JsonLd (.astro)
│   │   │   ├── layouts/       # BaseLayout, ToolPage (.astro)
│   │   │   ├── pages/
│   │   │   │   ├── index.astro
│   │   │   │   └── tools/     # One .astro file per tool
│   │   │   ├── islands/       # React island components per tool
│   │   │   ├── lib/           # url-state, clipboard, keyboard, theme, analytics
│   │   │   └── styles/        # global.css, codemirror overrides
│   │   ├── public/            # favicon, og images, icons, manifest, robots.txt
│   │   ├── astro.config.mjs
│   │   └── package.json
│   └── extension/       # Chrome extension (Phase 2)
│       ├── src/
│       ├── wxt.config.ts
│       └── package.json
├── pnpm-workspace.yaml
├── package.json
└── tsconfig.json
```

### Tech Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Framework | Astro 5 (SSG) | Static HTML output, best SEO, free hosting |
| UI Islands | React 19 | Astro Islands for interactive tools only |
| Styling | Tailwind CSS 4 | Fast UI dev, dark mode via `class` strategy |
| Code Editor | CodeMirror 6 (`@uiwjs/react-codemirror`) | 150KB gzip vs Monaco's 2-4MB; mobile-friendly |
| Extension | WXT | Modern Chrome extension framework, HMR, TypeScript |
| Deploy | Vercel | Free tier, auto-deploy from GitHub |
| Payments | LemonSqueezy | Extension freemium billing |
| Analytics | Google Analytics 4 | Free, sufficient for starting |
| Ads | Google AdSense | Standard choice, apply after 10+ pages |

### Code Editor Strategy

- **JSON/YAML/TS tools**: CodeMirror 6 with language-specific extensions
- **Simple tools** (Base64, URL encode, UUID, Hash): Plain `<textarea>` — saves ~150KB per page
- CodeMirror loaded as a shared chunk via Vite `manualChunks`

## Tool Lineup

### Batch 1 — MVP (Week 1-2)

| Tool | Route | Dependencies | Complexity |
|------|-------|-------------|------------|
| JSON Formatter & Validator | `/tools/json-formatter` | Native `JSON.parse/stringify`, CodeMirror | Low |
| Base64 Encode/Decode | `/tools/base64` | Native `btoa/atob` + `TextEncoder` | Very low |
| URL Encoder/Decoder | `/tools/url-encoder-decoder` | Native `encodeURIComponent` | Very low |
| UUID Generator | `/tools/uuid-generator` | `uuid` package (~3KB) | Low |
| Hash Generator | `/tools/hash-generator` | Native `SubtleCrypto` + `js-md5` (~4KB) | Low |

### Batch 2 — Complete (Week 3-4)

| Tool | Route | Dependencies | Complexity |
|------|-------|-------------|------------|
| JSON to TypeScript | `/tools/json-to-typescript` | `json-to-ts` (~15KB) | Low |
| Timestamp Converter | `/tools/timestamp-converter` | Native `Date` + `Intl` | Low |
| Cron Expression Generator | `/tools/cron-generator` | `cron-parser` (~8KB) | Medium |
| YAML ↔ JSON Converter | `/tools/yaml-json` | `yaml` (~30KB) | Low |
| Image to Base64 | `/tools/image-to-base64` | Native `FileReader` + `Canvas` | Low |

## UI Design

### Style: Minimal & Performant

- Light theme default, dark mode toggle (Tailwind `darkMode: 'class'`)
- Tool fills the viewport — minimal chrome, maximum workspace
- Responsive: side-by-side panels on desktop, stacked on mobile
- Font: system font stack (zero network cost)
- Anti-FOUC inline script in `<head>` for theme detection

### Tool Page Layout

```
┌──────────────────────────────────────────┐
│ Header: Logo | [Tool Search] | [Theme] │
├──────────────────────────────────────────┤
│ Sidebar  │  H1 + Description             │
│ (tools)  │  ┌─────────┬─────────┐        │
│          │  │  Input   │ Output  │        │
│          │  │  Panel   │ Panel   │        │
│          │  │          │         │        │
│          │  ├─────────┴─────────┤        │
│          │  │ Action Bar        │        │
│          │  │ [Execute][Copy][Clear]     │
│          │  └───────────────────┘        │
│          │  FAQ / Usage Guide            │
│          │  [Ad Slot - bottom]           │
├──────────────────────────────────────────┤
│ Footer                                   │
└──────────────────────────────────────────┘
```

### Ad Placement (3 max per page)

1. **Leaderboard (728x90)** — between description and tool, desktop only
2. **Sidebar rectangle (300x250)** — below sidebar nav, sticky, desktop only
3. **Bottom banner (responsive)** — after FAQ, before footer

All ads wrapped in `AdSlot.astro` with `min-height` to prevent CLS.

## SEO Strategy

### Per-Tool Page

- `<title>`: `{Tool Name} - Free Online Tool | DevKits`
- `<meta description>`: `{Description}. Free, private, runs entirely in your browser.`
- Canonical URL: `https://devkits.dev/tools/{slug}`
- Open Graph + Twitter Card meta tags
- JSON-LD `WebApplication` schema
- 150-300 word usage guide + FAQ section (targets featured snippets)

### Site-Level

- Automatic sitemap via `@astrojs/sitemap`
- `robots.txt` allowing all crawlers
- OG images auto-generated at build time (satori + sharp)
- Inter-tool cross-linking ("Related tools" section)
- Submit to Google Search Console on launch

### Initial Promotion

- Product Hunt launch
- dev.to article
- Hacker News Show HN post
- Reddit r/webdev, r/programming, r/SideProject

## Monetization

### Channel 1: Website Ads

- **Platform**: Google AdSense
- **Apply**: After 10+ pages are live and indexed
- **Expected**: $5-15 RPM for developer traffic
- **Target**: $500-1500/mo at 100K monthly UV (6-12 month horizon)

### Channel 2: Chrome Extension Freemium

- **Free tier**: All basic tools (same as website)
- **Pro tier ($3-5/mo via LemonSqueezy)**:
  - Batch processing (bulk UUID, bulk Base64)
  - History & favorites
  - Custom themes
  - Keyboard shortcut customization
- **Distribution**: Chrome Web Store (one-time $5 registration)
- **Cross-promotion**: Website banner → extension install; extension settings → website

## Shared Components (Reusable)

### `@devkits/core` package exports

```typescript
// Each tool exports a pure function
export { formatJson, validateJson } from './tools/json-formatter'
export { encodeBase64, decodeBase64 } from './tools/base64'
export { encodeUrl, decodeUrl } from './tools/url-encoder'
export { generateUuid } from './tools/uuid-generator'
export { generateHash } from './tools/hash-generator'
export { jsonToTypescript } from './tools/json-to-typescript'
export { convertTimestamp } from './tools/timestamp-converter'
export { parseCron, describeCron } from './tools/cron-generator'
export { yamlToJson, jsonToYaml } from './tools/yaml-json'
export { imageToBase64 } from './tools/image-to-base64'

// Tool registry
export { toolRegistry, getToolMeta } from './registry'
```

### URL State Sync

Tools support URL params for sharing: `?d=<base64-encoded-input>`
Using `lz-string` compression for large inputs.

### Keyboard Shortcuts

- `Ctrl/Cmd + Enter`: Execute/convert
- `Ctrl/Cmd + Shift + C`: Copy output
- `Ctrl/Cmd + Shift + X`: Clear input
- `Ctrl/Cmd + K`: Focus search (homepage)

Note: Avoid `Ctrl+L` (browser address bar) and other browser-reserved shortcuts.

## Error Handling

### Input Validation

Each core function returns a `Result<T, Error>` type:

```typescript
type ToolResult<T> = { ok: true; data: T } | { ok: false; error: string }
```

- All core functions are pure and never throw — they return error messages
- Max input size: 1MB for text tools, 5MB for image tools
- URL sharing: max 10KB pre-compression; if exceeded, show toast "Input too large to share via URL"

### UI Error Display

- Errors shown inline in the OutputPanel with red highlight
- React error boundary wraps each tool island — crashes show "Something went wrong, please reload"
- SubtleCrypto unavailable (HTTP): show message "Hash generation requires HTTPS"

## Testing Strategy

### Unit Tests (Vitest)

- Every `@devkits/core` function has unit tests with edge cases
- Test file co-located: `tools/json-formatter.test.ts`
- Run: `pnpm --filter core test`

### Smoke Tests

- Each tool page builds without error (covered by `astro build`)
- Playwright smoke test: load each tool URL, verify no console errors

### CI (GitHub Actions)

- On PR: lint + unit tests + build
- On merge to main: auto-deploy to Vercel

## Privacy & Legal

- **"Privacy-first" scope**: Tool input/output never leaves the browser. GA4 and AdSense do set cookies.
- **Cookie consent**: Simple banner component, loads GA4/AdSense only after consent
- **Privacy policy page**: `/privacy` — explains what data is collected and what isn't
- **GA4 config**: Use cookieless measurement mode where possible

## Development Phases

### Phase 1: Foundation + MVP (Week 1-2)

- Day 1-2: Scaffold monorepo, Astro config, Tailwind, layouts, shared components
- Day 3-4: Implement Batch 1 tools (5 tools) in core + web
- Day 5-6: Homepage, SEO components, OG image generation
- Day 7: Vercel deploy, GitHub repo, Google Search Console submission

### Phase 2: Complete Tools (Week 3-4)

- Week 3: Implement Batch 2 tools (5 tools)
- Week 4: Content (usage guides + FAQ per tool), performance audit, cross-browser testing

### Phase 3: Extension + Monetization (Week 5-8)

- Design Chrome extension spec (separate doc)
- Build extension MVP (JSON formatter, Base64, UUID — the 3 highest-usage tools)
- Chrome Web Store submission ($5 one-time)
- AdSense application (may take 1-3 months for approval)
- LemonSqueezy setup for extension Pro tier
- PWA support deferred to post-launch unless time permits

### Phase 4: Growth (Ongoing)

- Monitor Search Console, iterate on underperforming pages
- Add new tools based on search demand data
- Product Hunt / dev.to / HN launches
- Iterate extension based on user feedback

## Verification

- [ ] All 10 tools work correctly with various inputs (including edge cases)
- [ ] Lighthouse score 95+ on all pages (Performance, SEO, Accessibility, Best Practices)
- [ ] Dark mode works on all pages
- [ ] Mobile responsive on all pages
- [ ] URL sharing works for all tools
- [ ] Keyboard shortcuts work
- [ ] OG images generate correctly
- [ ] Sitemap is complete and valid
- [ ] Chrome extension installs and works
- [ ] AdSense loads without CLS issues

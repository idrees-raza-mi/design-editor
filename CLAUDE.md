# Design Editor – Project Reference

## Purpose
A React-based design editor that compiles to a **single IIFE JS file** (`dist/editor.js` + `dist/editor.css`) and is embedded into a Shopify product page via a `<script>` tag. The editor has **zero built-in designs** — every design is fetched at runtime from Shopify Metaobjects by ID.

---

## Architecture

```
Customer browser
  └── Shopify product page
        ├── <script> loads dist/editor.js  (hosted on Vercel or CDN)
        ├── <link>   loads dist/editor.css
        └── window.__EDITOR_CONFIG__ set before script tag
              └── Editor boots, reads config, fetches design from Storefront API
```

**Deployment path:** `npm run build` → `dist/` → Vercel static → Shopify Script Tag

---

## window.__EDITOR_CONFIG__

Set by Shopify (via Liquid or script tag) **before** `editor.js` loads:

```js
window.__EDITOR_CONFIG__ = {
  designId:     'gid://shopify/Metaobject/123',  // Metaobject GID
  designType:   'canvas',                          // 'canvas' | 'template'
  variantId:    'gid://shopify/ProductVariant/456', // nullable
  productTitle: 'Bear Board 2FT'
}
```

If missing (local dev), `editorConfig.js` falls back to safe defaults so the app doesn't crash.

---

## Key Principle

> All designs come from Shopify Metaobjects by ID.
> Nothing is hard-coded into the editor bundle.

---

## Editor Modes

| designType | Behavior |
|------------|----------|
| `canvas`   | Blank canvas — customer builds from scratch using shapes, text, images |
| `template` | Pre-made design loaded from Metaobject — customer replaces text/images only, layout is locked |

---

## Data Flow

1. Customer opens product page on Shopify
2. Shopify Liquid sets `window.__EDITOR_CONFIG__` with the product's `designId`
3. `editor.js` boots, reads config via `getConfig()`
4. Editor fetches Metaobject data from Shopify Storefront API using `designId`
5. Canvas loads the design (canvas mode: empty canvas; template mode: pre-built layout)
6. Customer edits the design
7. On save: result uploaded to Shopify Files API; design ID stored in cart line item via Metaobject
8. Order is placed with the design ID attached — fulfillment team retrieves it

---

## File Map

| File | Description |
|------|-------------|
| `src/index.jsx` | Entry point — waits for DOM, mounts React into `#design-editor` |
| `src/App.jsx` | Root component — 3-panel layout (tools / canvas / properties) + top bar |
| `src/config/editorConfig.js` | Reads `window.__EDITOR_CONFIG__`, exports `getConfig()` with dev fallback |
| `src/styles/main.css` | CSS variables + dark theme layout styles |
| `vite.config.js` | IIFE build config — **do not change** the `formats: ['iife']` setting |
| `index.html` | Dev entry point for `npm run dev` (not the production embed) |
| `test.html` | Manual test page — loads `dist/editor.js` like Shopify would |
| `.env.local` | Shopify store URL + Storefront API token (never commit this) |

---

## IIFE Build — Why It Matters

Vite's `lib` mode with `formats: ['iife']` compiles everything (React, app code, CSS) into **two self-contained files**:

- `dist/editor.js` — entire app as an IIFE (Immediately Invoked Function Expression)
- `dist/editor.css` — all styles

This is **required** for Shopify Script Tag embeds. ES modules (`type="module"`) are not reliably supported in Shopify theme contexts. The IIFE runs immediately, attaches to `window.DesignEditor`, and mounts itself.

> **Never change `formats: ['iife']` to `['es']` or remove the `lib` config.**

---

## Common Issues

- **Blank page on test.html** — run `npm run build` first; `dist/` must exist
- **Changes not appearing** — always rebuild after editing source files; `test.html` uses `dist/`, not live source
- **`window.__EDITOR_CONFIG__` undefined** — normal in `npm run dev`; dev fallback kicks in automatically
- **CSS not loading** — check `dist/editor.css` exists and the `<link>` tag in `test.html` points to it

---

## Dev Workflow

```bash
npm install          # first time only
npm run dev          # live dev server (uses index.html)
npm run build        # compile to dist/
# open test.html in browser to test the production build
```

---

## Vercel Proxy Function

- File: `api/shopify.js`
- Purpose: proxies all Shopify Admin API calls
- Admin token lives ONLY in Vercel env vars, never in frontend
- Actions: stagedUpload, createFile, saveMetaobject, getMetaobject
- In local dev: proxy runs at http://localhost:3000/api/shopify (via vercel dev)
- Frontend calls it via `src/utils/apiClient.js` callShopifyProxy(action, data)

# dailybible — Progress

## What's been built

Full SvelteKit 5 offline-first Bible app scaffold. Adapts the bibleapp frontend to run entirely in the browser with no backend.

### Stack
- SvelteKit 5 + Svelte 5 + TypeScript
- `adapter-static` (SPA mode, `fallback: index.html`)
- `sql.js` — SQLite WASM for bible data (no SharedArrayBuffer required)
- `idb` — IndexedDB for user data (bookmarks, highlights, notes)
- Tailwind CSS 3 — same design system as bibleapp
- Service worker for full offline support

### Files written

**Config**
- `package.json`, `svelte.config.js`, `vite.config.ts`
- `tailwind.config.js`, `postcss.config.js`, `tsconfig.json`

**Build script**
- `scripts/build-db.ts` — reads `bibleapp/backend/.../bible.json`, builds `static/bible.db` using `better-sqlite3` with FTS5 full-text search index

**Core DB layer** (`src/lib/db/`)
- `sqlite.ts` — initialises sql.js, caches DB blob in IndexedDB (download once, offline forever)
- `scripture.ts` — books, chapters, verses, FTS5 search
- `liturgy.ts` — full Computus algorithm ported from C# (Easter, seasons, colors, titles)
- `study.ts` — IndexedDB CRUD for bookmarks, highlights, notes

**UI** (`src/lib/`)
- `types/index.ts`, `utils.ts` — copied/adapted from bibleapp
- `components/ui/` — Badge, Spinner, EmptyState (copied from bibleapp)

**Routes**
- `/` — Today's liturgy (season, color, title — computed locally)
- `/bible` — Books list (OT/NT)
- `/bible/[bookCode]` — Chapter picker
- `/bible/[bookCode]/[chapter]` — Verse reader with English/Latin toggle + bookmark toggle
- `/bible/search` — Full-text search (FTS5 via sql.js)
- `/liturgy/calendar` — Month calendar with season colors, nav arrows
- `/liturgy/[date]` — Single day liturgical detail
- `/study` — Study hub
- `/study/bookmarks` — Saved verses list
- `/study/highlights` — Highlighted verses list
- `/study/notes` — Verse notes list

**Static assets**
- `static/bible.db` — ✅ Built (14 MB JSON → SQLite with FTS5)
- `static/sql.js/sql-wasm.wasm` — ✅ Copied from node_modules

### Dropped (no backend)
- Auth / login / register
- Community / groups / prayers / discussions
- Reading plans (can be added later with IndexedDB)

---

## What's missing / next steps

### Must-do before first run
- [ ] `src/routes/study/+page.ts` — load file missing (study hub page has no `.ts` loader yet)
- [ ] `src/routes/bible/search/+page.ts` — loader missing (search page is all client-side, just needs `export const load = () => ({})`)
- [ ] Run `pnpm check` to catch any TypeScript errors
- [ ] Run `pnpm dev` and verify the app boots

### Known gaps to fill
- [ ] Highlight UI in chapter reader — `studyDb` highlight methods exist but no UI to apply them in the verse reader yet
- [ ] Note-taking UI in chapter reader — same, backend ready but no inline note editor
- [ ] `bible/search/+page.ts` missing (trivial — empty load)
- [ ] Test FTS5 search query escaping in `scripture.ts` — the current column-filter syntax (`textEnglish:query`) may need adjusting depending on sql.js FTS5 version

### Nice to have
- [ ] PWA manifest (`static/manifest.json`) + icons for installability
- [ ] DB loading progress indicator (14 MB first-load takes a few seconds)
- [ ] Export/import user data (bookmarks/notes/highlights) as JSON backup
- [ ] Reading plans via IndexedDB

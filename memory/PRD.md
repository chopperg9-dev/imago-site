# Buba 3D — PRD

## Original problem statement
Hebrew RTL e-commerce site for Buba 3D selling 3D-printed dolls kids paint at home: before/after hero story (white doll → painted), warm premium style (off-white, terracotta, elegant Hebrew type), shop with categories + product cards + detail pages, cart + checkout, About/FAQ/Contact/Shipping/Returns/Privacy/Terms, and a personalized superhero experience: parent uploads child photos → Meshy-style workflow → on-page preview before ordering, with upload guidance, processing states, preview approval and purchase path. Responsive, mobile-first, accessible, SEO-friendly, Meshy credentials wired securely via env.

## User choices (ask_human skipped → defaults)
- Meshy workflow: mocked pipeline stages, structured for real MESHY_API_KEY (backend/lib/meshy.py)
- Preview image: REAL AI generation via Gemini Nano Banana (EMERGENT_LLM_KEY), fallback sample image
- Checkout: simulated (orders saved, no real charge)
- Language: Hebrew RTL, brand name in Latin
- Uploads: server-side under backend/uploads, served via /api/uploads

## Architecture
- Backend `/app/backend/server.py`: /api/products, /api/products/{id}, /api/categories, /api/orders, /api/contact, /api/superhero/jobs (multipart upload, POST+GET+approve). Products seeded idempotently at lifespan. Superhero pipeline = asyncio background task with staged progress + Nano Banana image-edit preview saved to uploads/previews. `lib/meshy.py` = real Meshy client stub, enabled when MESHY_API_KEY set in backend/.env.
- Frontend: React 19 + Tailwind v4 + motion + lenis. RTL (`dir="rtl"`, lang="he"), Frank Ruhl Libre + Heebo via Google Fonts link. Cart = localStorage context (`src/lib/cart.tsx`). Design tokens per /app/design_guidelines.json (cream #FAF7F2, terra #C85A32, clay #2C221E, sage).

## Personas
- Parent buying a creative screen-free gift
- Parent creating a one-off personalized superhero from their child's photos

## Implemented (2026-09-23)
- Kinetic hero: masked line-by-line reveal, draggable before/after slider (auto-animates), 3D tilt, parallax, floating stat card
- Slow editorial marquee, numbered manifesto chapters (01/02/03), testimonials, CTA bands
- Shop: 9 products, 6 categories, sticky filter chips, quick-add
- Product detail: difficulty badge, kit contents, qty stepper, related products
- Cart + checkout: free-shipping meter (₪199), courier/pickup, order confirmation (B3D-XXXXXX), orders persisted
- Superhero lab: 1–4 photo upload + guidance, cape color + pose pickers, staged processing UI, real AI preview, approve → add to cart (₪349)
- About / FAQ (animated accordion) / Contact (API-backed) / Shipping / Returns / Privacy / Terms
- Verified: curl smoke (all endpoints + 404 case), full superhero job e2e, yarn typecheck clean, screenshots home/shop

- Rebrand (2026-09-23): company renamed to IMAGO ("Color Your Character"), customer-supplied logo in header/footer, order numbers now IMG-XXXXXX, cart storage key imago-cart, emails shalom@imago-dolls.co.il; hero before/after now uses customer's fox character
- Transparent logo (2026-09-23): logo character cut out to transparent PNG at frontend/public/logo-character.png (PIL flood-fill from dark bg), used in header + footer without badge
- Stripe payments live in TEST mode (2026-09-23): Flow B (own-key style) with default sk_test_emergent; endpoints POST /api/payments/checkout, GET /api/payments/status/{session_id}, POST /api/webhook/stripe; payment_transactions collection; order created idempotently on paid; e2e verified with card 4242 (order IMG-CB1414, ₪238 ILS). NOTE: claimable sandbox (Flow A) failed — Stripe doesn't support IL; going live needs user's own Stripe keys in Manage → Secrets, or a local provider (PayPal/Cardcom)

- Bit payments (2026-09-23): checkout now uses Bit ONLY (user request, replaces Stripe in UI). Order created with status "awaiting_payment" + payment_method "bit"; success screen shows 3-step Bit instructions — pay ₪total to business number 050-333-1809 with order number in the payment note (copy button included). Stripe backend endpoints remain but unused. Verified e2e: order IMG-31E92C, ₪134

- Fonts (2026-09-23): switched to Karantina (300/400, headings — trendy tall display) + Assistant (200–700, body) per user request for trendier/delicate Hebrew type; font-synthesis-weight:none keeps headings light

- Fonts v2 (2026-09-23): headings → Suez One (wide, readable, warm trendy Hebrew); logo wordmark restored to Frank Ruhl Libre; body stays Assistant. Product swap: astro-noa replaced by "מלאני" (melanie) — the fox from the hero before/after, ₪119, animals category, featured

- Interactive redesign (2026-09-23): custom paint-drop cursor (dot + spring ring, grows on interactive elements, pointer:fine only), hero paint trail (mouse leaves fading paint drops), giant outlined IMAGO watermark with scroll parallax, spinning circular badge on hero slider, magnetic CTA buttons, brush-stroke animated section titles (SectionTitle), rotated manifesto cards with outlined numbers, horizontal scroll-driven product shelf (sticky 280vh on desktop, snap-scroll on mobile), page transitions (AnimatePresence), product card sticker prices + tilt, marquee pause-on-hover + edge fade

## Standing design guidance
See /app/memory/DESIGN_PRINCIPLES.md — user-provided principles, apply to all future work.
See /app/design_guidelines.json — ACTIVE dark "neon markers" theme (2026-10-04).

- Scroll-paint story (2026-10-04): pinned 360vh section (ScrollPaintStory) — scrolling literally paints Melanie white→colored via scroll-linked clip-path wipe with glowing edge line, spring-smoothed; 3 chapters fade/slide in-out; giant outlined % counter; bg shifts cream→terra-soft; image scales slightly. Marquee now skews with scroll velocity (useVelocity)

- Dark 3D redesign (2026-10-04, user request after rejecting the Swiss/light redesign): restored the interactive design from commit 90bca14 (paint cursor, paint trail, watermark, spin badge, magnetic buttons, horizontal shelf, scroll-paint story, page transitions) and inverted it to black backgrounds with neon accents (magenta #FF2E88 primary, cyan #22E6FF, lime #C6FF3D) by redefining theme tokens in index.css (cream=bg, sand=surface, clay=text, terra=magenta, sage=cyan, mustard=lime). Added real 3D: `FoxModel.tsx` procedural React Three Fiber chibi fox (three/@react-three/fiber/@react-three/drei) with paintable parts, wrapped by `Hero3D.tsx` (acrylic-marker palette, click part to paint, "paint like Melanie", reset, progress x/7). `TiltCard.tsx` perspective tilt + light sheen on product cards, step cards, testimonials, product image. `depth-card`, `glow-terra`, `glow-sage` utilities. All product/hero images regenerated on black studio background with neon rim light. Copy: brushes (מכחולים) → acrylic markers (טושים אקריליים) everywhere incl. backend seed (kit = doll + 6 markers + guide; premium kit = 12 markers). Fixed: motion "target ref not hydrated" (ProductShelf ref on both branches); corrupted PNG upload returned 500 → now 400. Object storage for superhero photos (`lib/storage.py`) confirmed wired. Testing agent iteration_1: all backend (11 pytest) + frontend flows passed (desktop + mobile).

- Intro gate + real Melanie model (2026-10-04, user feedback round 2): removed giant IMAGO watermark, removed grain texture, removed all translucent boxes (depth-card) — model, product dolls (radial mask + float, no card), steps, testimonials, superhero band, kit images now float in space. Added `IntroGate.tsx` (full-screen landing on '/', scroll locked via `lockScroll()` in SmoothScroll.tsx + Lenis stop, "START HERE" button, once per session via sessionStorage `imago_intro_seen`). User uploaded a Meshy STL of Melanie (1.9M tris) → decimated with trimesh/fast-simplification to 48k tris, Y-up, height=1, saved `/app/frontend/public/models/melanie.glb` (0.87MB). `FoxModel.tsx` now loads the GLB (useGLTF) with VERTEX PAINTING: drag on the model paints with the selected acrylic marker (brush radius 0.055, stroke interpolation), apiRef {reset, preset}; preset = heuristic Melanie colouring in `lib/foxColors.ts` (model faces -z). `DepthBackground.tsx` fixed parallax neon orbs + perspective grid. Testing agent iteration_2: all passed (backend 11 + frontend gate/paint/shop/cart/mobile).

- Sharpness pass (2026-10-04): removed 'how it works / 3 steps' section and the running Marquee strip (component deleted); removed all neon halos — text drop-shadows, blurred glow blobs behind the hero model/gate/products, glow rings on buttons/badges/cursor. Kept DepthBackground gradient orbs (user likes gradients). User will send a folder of all 3D models → next: per-product GLB viewers.

- 3D kit scene + scroll marker (2026-10-04): `KitScene.tsx` replaces the flat-lay kit photo — Melanie GLB with a ring of 8 procedural floating acrylic markers (`Marker3D.tsx`: Marker3D, MarkerRing), camera auto-rotates; `ScrollMarker.tsx` fixed full-viewport R3F canvas (desktop only) with one large marker whose position/rotation/scale follow page scroll progress (zoom in/out at stops). FoxModel accepts children + autoRotate. Fix: R3F Canvas wrapper defaults to pointer-events:auto — ScrollMarker Canvas style sets pointerEvents:'none' (iteration_3 caught it, iteration_4 passed).

## Backlog
- P0: real Meshy image-to-3D once MESHY_API_KEY provided
- P1: 3D models for the other 8 dolls (user can upload STL/GLB per product) + paintable viewer on product pages; download/share painted Melanie snapshot; admin orders dashboard; email confirmations (Resend); auto-delete uploaded photos after 14 days (cron)
- P2: bundle offer (3 dolls + free kit), promo codes, product reviews, Instagram feed, 3D viewer on every product page

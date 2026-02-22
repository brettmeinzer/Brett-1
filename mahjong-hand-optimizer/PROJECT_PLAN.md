# Mahjong Hand Optimizer — Project Plan

## Vision

A mobile web app that uses your phone's live camera to see your American Mahjong tiles in real time, instantly identifies them, and returns the **top 5–10 best hands** to pursue from the current year's NMJL card. Lightning fast. No manual tile entry. Point your phone at your rack and go.

---

## Core Principle: No Custom ML. Ship Fast.

Instead of training custom object detection models (months of work), we use **multimodal AI vision APIs** (Claude, OpenAI, Gemini) to identify tiles from camera frames. The card matching engine runs **entirely client-side** so hand suggestions are instant once tiles are recognized.

```
┌─────────────────────────────────────────────────┐
│  PHONE CAMERA (live viewfinder)                 │
│  ┌───────────────────────────────────────────┐  │
│  │  [1B] [3C] [5D] [7B] [R] [R] [J] ...     │  │
│  └───────────────────────────────────────────┘  │
│         │  frame captured every ~1.5s            │
│         ▼                                        │
│  ┌─────────────────────┐                        │
│  │  AI Vision API      │  "I see: 1-Bam,       │
│  │  (Claude/OpenAI)    │   3-Crack, 5-Dot,     │
│  │                     │   7-Bam, Red x2,      │
│  │  ~1-2s per call     │   Joker, ..."         │
│  └─────────┬───────────┘                        │
│            │                                     │
│            ▼                                     │
│  ┌─────────────────────┐                        │
│  │  CLIENT-SIDE        │  Runs in <5ms          │
│  │  MATCHING ENGINE    │  Compares hand against  │
│  │  (JavaScript)       │  all ~50 card hands    │
│  └─────────┬───────────┘                        │
│            │                                     │
│            ▼                                     │
│  ┌─────────────────────────────────────────┐    │
│  │  TOP 5-10 HANDS                          │    │
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │    │
│  │  1. 2025 #14 — Like Numbers (92% match)  │    │
│  │     Need: 5-Bam, 5-Crack                 │    │
│  │  2. Consecutive Run #3 (78% match)       │    │
│  │     Need: 2-Bam, 4-Bam, 6-Bam           │    │
│  │  3. Winds/Dragons #7 (71% match)         │    │
│  │     Need: West, West                     │    │
│  │  ...                                     │    │
│  └─────────────────────────────────────────┘    │
└─────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Frontend** | HTML/CSS/JavaScript (vanilla or React) | Works on any phone browser, no app store needed |
| **Camera** | `navigator.mediaDevices.getUserMedia()` | Native browser camera API, works on iOS Safari + Android Chrome |
| **Tile Recognition** | Claude Vision API (or OpenAI Vision) | No model training needed. Multimodal LLMs already understand mahjong tiles |
| **Card Matching** | Client-side JavaScript | Instant matching, no server round-trip for results |
| **Hosting** | Vercel / Netlify / GitHub Pages + serverless function | Free or near-free, instant deploys |
| **API Proxy** | Serverless function (Vercel/Netlify) | Keeps API key server-side, rate limits, caching |

---

## Phase 1: Foundation (Week 1–2)

### Goal: Card data + matching engine working with manual input

**1.1 — Define the tile data model**
```javascript
// Every tile in American Mahjong
const TILES = {
  // Suits: Crack (Character), Bam (Bamboo), Dot (Circle)
  // Each suit: 1-9, four of each = 108 suit tiles
  cracks: [1,2,3,4,5,6,7,8,9],
  bams:   [1,2,3,4,5,6,7,8,9],
  dots:   [1,2,3,4,5,6,7,8,9],

  // Winds: East, West, North, South (4 each = 16)
  winds: ['E','W','N','S'],

  // Dragons: Red, Green, Soap/White (4 each = 12)
  dragons: ['R','G','Wh'],

  // Flowers: 8 unique flower tiles
  flowers: [1,2,3,4,5,6,7,8],

  // Jokers: 8 joker tiles (wild, usable in groups of 3+)
  jokers: 8
};
```

**1.2 — Encode the NMJL card hands**

The card has ~50 hands across categories. Each hand is a pattern:
```javascript
// Example hand encoding
{
  id: "2025-consecutive-3",
  category: "Consecutive Run",
  name: "#3",
  pattern: [
    { type: "pung", suit: "any", value: "N" },      // NNN
    { type: "pung", suit: "same", value: "N+1" },    // (N+1)(N+1)(N+1)
    { type: "pung", suit: "same", value: "N+2" },    // (N+2)(N+2)(N+2)
    { type: "pair", suit: "same", value: "N+3" }     // (N+3)(N+3)
  ],
  concealed: false,
  jokers_allowed: true,
  value: 25
}
```

> **IMPORTANT — Copyright approach**: The app ships with an empty card. Users enter their own card hands (they bought the physical card from NMJL). We provide a card builder UI. This keeps us legally clean. Alternatively, we can explore NMJL licensing.

**1.3 — Build the matching/scoring engine**
```
Input:  14 tiles in hand (array)
Output: All card hands ranked by:
  1. Number of matching tiles already in hand
  2. Number of tiles still needed
  3. Joker flexibility (how many jokers could substitute)
  4. Dead tile awareness (tiles already discarded — future feature)
```

**1.4 — Build card builder UI**

Simple web form where users can input hand patterns from their physical NMJL card. Store in `localStorage` so they only do it once per year.

### Deliverable: Working matching engine you can test in a browser console

---

## Phase 2: Mobile Web UI (Week 2–3)

### Goal: Usable app with manual tile picker

**2.1 — Tile picker interface**

Visual grid of all tiles. Tap to add to your hand. Shows your 13-14 tiles at top.

```
┌──────────────────────────────────────┐
│  YOUR HAND (13 tiles)                │
│  [1C][3B][5D][7B][R][R][J][N][S]...  │
│──────────────────────────────────────│
│  BEST HANDS TO PURSUE:              │
│  1. ★★★ Consecutive #3 (9/14 tiles) │
│     Need: 2B, 4B, 6B, 8B, 8B       │
│  2. ★★☆ Like Numbers #1 (7/14)      │
│     Need: 5C, 5B, 5D, 5C, ...      │
│  ...                                 │
│──────────────────────────────────────│
│  TAP TO ADD TILES:                   │
│  Cracks: [1][2][3][4][5][6][7][8][9]│
│  Bams:   [1][2][3][4][5][6][7][8][9]│
│  Dots:   [1][2][3][4][5][6][7][8][9]│
│  Winds:  [E][W][N][S]               │
│  Dragons:[R][G][Wh]                  │
│  Other:  [F1-F8][Joker]             │
└──────────────────────────────────────┘
```

**2.2 — Results display**

- Top 5-10 hands with match percentage
- Tiles you have (highlighted green)
- Tiles you need (highlighted red)
- How many jokers could help
- Category label from the card

**2.3 — Mobile-first responsive design**

- Works on iPhone Safari + Android Chrome
- Large tap targets (thumbs, not mouse pointers)
- Dark mode option (many people play at night)

### Deliverable: Fully functional app with manual input, shareable via URL

---

## Phase 3: Camera Integration (Week 3–5)

### Goal: Point phone at tiles, get instant hand recognition

**3.1 — Camera viewfinder**

```javascript
// Access rear camera
const stream = await navigator.mediaDevices.getUserMedia({
  video: { facingMode: 'environment', width: 1280, height: 720 }
});
```

- Full-screen viewfinder with a "scan" overlay guide
- Haptic feedback on successful recognition (if supported)

**3.2 — Frame capture + AI vision pipeline**

```
Camera frame (1280x720 JPEG, ~100KB)
    │
    ▼
Serverless API proxy (/api/recognize)
    │
    ▼
Claude Vision API call:
    Prompt: "Identify all American Mahjong tiles visible in this image.
             Return as JSON array: [{suit, value}]
             Tiles include: Cracks 1-9, Bams 1-9, Dots 1-9,
             Winds (E/W/N/S), Dragons (Red/Green/White),
             Flowers (1-8), Jokers.
             Only include tiles you are confident about."
    │
    ▼
Parse JSON response → feed to matching engine
```

**3.3 — Optimization for speed**

| Technique | Impact |
|-----------|--------|
| **Capture every 1.5s, not every frame** | Reduces API calls dramatically |
| **Diff detection** | Only send new frame if tiles changed (pixel diff threshold) |
| **Streaming responses** | Start showing partial results as API streams back |
| **Response caching** | If same tiles detected, skip re-matching |
| **Optimistic UI** | Show last-known results while new frame processes |
| **Concurrent requests** | Pipeline: while frame N processes, capture frame N+1 |
| **Compressed JPEG** | Send 60% quality JPEG — tiles are high contrast, still readable |
| **Prompt engineering** | Minimal prompt, structured output, reduce token count |

**3.4 — Recognition accuracy improvements**

- Guide overlay: "Place tiles inside the box"
- Lighting detection: warn if too dark/bright
- Zoom guidance: "Move closer" / "Move farther"
- Confidence display: show which tiles the AI is unsure about
- Manual correction: tap a misidentified tile to fix it

### Deliverable: Working camera → hand suggestions pipeline

---

## Phase 4: Speed & Polish (Week 5–7)

### Goal: Make it feel instant

**4.1 — Progressive recognition**

Don't wait for all 14 tiles. Start suggesting hands after recognizing 5-6 tiles. Update suggestions as more tiles are confirmed. This makes it **feel** instant even if full recognition takes 2-3 seconds.

**4.2 — Tile confidence & correction UI**

```
YOUR TILES (tap to correct):
[1C✓] [3B✓] [??] [7B✓] [R✓] [R✓] [J✓] ...
         │
         └─ "Tap the ? tile — I couldn't tell if it's 5D or 6D"
```

**4.3 — Session memory**

- Remember tiles from previous scans
- Track what tiles have been discarded (future: track discards from the table)
- Update hand probabilities as game progresses

**4.4 — Offline card data**

- Card hands stored in `localStorage` / IndexedDB
- Matching engine works fully offline
- Only camera recognition needs network

**4.5 — PWA (Progressive Web App)**

- Add to home screen
- App icon + splash screen
- Feels native, no app store needed

### Deliverable: Polished, fast, feels-like-native app

---

## Phase 5: Advanced Features (Week 7+)

### Goal: Competitive advantage

**5.1 — Discard tracking**
- Second camera mode: scan the table to see discards
- "Dead hand" detection: warn if needed tiles are all discarded

**5.2 — Charleston assistant**
- Before the game starts, suggest which tiles to pass
- Based on which hands you're likely to pursue

**5.3 — Probability engine**
- Given remaining unseen tiles, what's the probability of completing each hand?
- Factor in: tiles in hand, tiles discarded, tiles needed, jokers available

**5.4 — Multi-year card support**
- Archive previous years' cards
- Compare hands across years

**5.5 — Social features**
- Share hand analysis with friends
- "What would you play?" mode

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| AI vision misidentifies tiles | HIGH | HIGH | Manual correction UI, confidence scores, prompt engineering, guide overlay |
| API latency too slow for "real-time" feel | MEDIUM | HIGH | Progressive recognition, optimistic UI, frame diff caching |
| NMJL copyright enforcement | MEDIUM | CRITICAL | User-entered card data, card builder UI, explore licensing |
| Tile set diversity (different designs) | HIGH | MEDIUM | Prompt includes description of all tile types; test across 5+ common sets |
| API costs at scale | MEDIUM | MEDIUM | Frame diff to reduce calls, caching, rate limiting per user |
| Browser camera API inconsistencies | LOW | MEDIUM | Test across iOS Safari, Chrome Android; polyfills as needed |
| User enters card wrong | MEDIUM | LOW | Validation rules, share card configs between users |

---

## Cost Estimate

| Item | Cost |
|------|------|
| Claude Vision API | ~$0.01–0.03 per frame capture (~$0.50–1.50 per game session) |
| Hosting (Vercel free tier) | $0 |
| Domain name | ~$12/year |
| Development | Your time |

---

## Success Metrics

1. **Recognition accuracy**: >90% of tiles correctly identified in good lighting
2. **Time to suggestions**: <3 seconds from camera capture to hand recommendations
3. **Correct hand in top 5**: The hand the player is actually building appears in suggestions >80% of the time
4. **User retention**: Players come back for their next game

---

## What We're NOT Building (Scope Boundaries)

- NOT a full mahjong game
- NOT training a custom ML model
- NOT building a native iOS/Android app (web-first, PWA later)
- NOT reproducing or distributing the NMJL card (users bring their own)
- NOT doing real-time video analysis (periodic frame capture instead)
- NOT tracking other players' hands

---

## Immediate Next Steps

1. **Set up project scaffold** — HTML/CSS/JS, serverless function template
2. **Define card hand data schema** — JSON format for encoding any NMJL hand
3. **Build matching engine** — Core algorithm, tested with hardcoded sample hands
4. **Test AI vision** — Send 5 photos of different tile sets to Claude Vision, evaluate accuracy
5. **Wire up camera** — Basic viewfinder with frame capture

Start with steps 1-3 in parallel. Step 4 runs as an independent spike.

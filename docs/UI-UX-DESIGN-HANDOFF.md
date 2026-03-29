# Iqra' Smart-Journey (ISJ) — UI/UX Design Handoff

**For:** Gemini AI (Frontend Design)
**Project:** Tadika Iqra' learning web PWA for 4-6 year old kids
**Stack:** Next.js 16 + Tailwind CSS 4 + TypeScript
**Reference:** Duolingo (gamification, journey map, engagement patterns)

---

## Design Principles (Cross-referenced with Panzarella's UI/UX)

### 1. Mental Model > Implementation Model
Kids think "adventure with Arnab", not "diagnostic assessment". Every technical concept is reframed:
- Diagnostic → "Pintu Kembara" (Journey Gate)
- Level placement → "Arnab cadangkan Tahap X"
- Error → "Cuba lagi, Arnab percaya kamu boleh!"
- Spaced repetition → "Ulang Kaji" (review) nodes on journey map

### 2. Progressive Disclosure
Information is layered by readiness:
- **Essential:** Current huruf, mic/touch action, immediate feedback
- **Important:** Stars earned, progress indicator, mode dots
- **Hidden:** Analytics, diagnostic history, teacher controls (separate dashboard)

Kids never see admin complexity. Teachers never see kid animations.

### 3. Dominance Hierarchy
Every screen has ONE dominant element — the thing the kid should interact with:
| Screen | Dominant Element |
|--------|-----------------|
| Diagnostic intro | Yellow "Mula!" button |
| Reading test | Pulsing mic button |
| Writing test | Tracing canvas |
| Dengar mode | Huruf card grid |
| Cari mode | Replay audio button |
| Sebut mode | Current huruf display |
| Journey map | Active (glowing) level node |

### 4. Icons Must Have Text Labels
Emojis are used as icons throughout. Every emoji-icon MUST be paired with a text label:
- 📖 Belajar (not just 📖)
- 🎨 Warna (not just 🎨)
- 🏆 Galeri (not just 🏆)
- Exception: avatar emojis (self-explanatory in context)

### 5. Affordance
Interactive elements must look interactive:
- Buttons have shadows (`shadow-md`/`shadow-lg`) and scale on hover/press
- Active level node pulses and glows (ring + scale)
- Tappable cards have hover states
- Locked items are visually distinct (gray, opacity-50, 🔒)

### 6. Consistency Rules
| Pattern | Kid-facing | Teacher-facing |
|---------|-----------|---------------|
| Primary CTA | Yellow bg, rounded-2xl, 64px | Indigo bg, rounded-lg, 44px |
| Success | Green + ⭐ animation | Green badge |
| Error | Red text + encouragement | Red badge/text |
| Cards | White, rounded-2xl, shadow-lg | White, rounded-xl, shadow-sm |
| Navigation | Bottom fixed, icon+label | Top header, text links |

### 7. Trunk Test (Steve Krug)
Drop a kid on any learning screen — they should immediately know:
- **Where am I?** → Gradient background = learning zone. White bg = dashboard.
- **What can I do?** → One dominant action per screen (mic, canvas, huruf cards)
- **Where can I go?** → Bottom nav always visible (3 icons)
- **How do I go back?** → "← Tukar avatar" links, "Kembali 🏠" buttons

### 8. Proximity (Gestalt)
Related elements are grouped:
- Stats (stars + streak) grouped in header
- Huruf cards in tight grid
- Action buttons grouped below content
- Generous whitespace between sections

### 9. No Failure States for Kids
This is a hard rule. Wrong answers are NEVER punished:
- Wrong pronunciation → "Cuba lagi!" + the correct sound plays
- Wrong huruf tapped → Card jiggles + plays its own sound (learning moment)
- Off-path tracing → Red trail (visual feedback) but no penalty
- PIN wrong → Dots reset, "Cuba lagi!" text, can retry immediately

### 10. Color as Communication
Colors carry consistent meaning across the app:
- **Green** = correct, success, approved, go
- **Yellow/Amber** = active, pending, reward, CTA
- **Red** = wrong (gentle), delete, error
- **Indigo/Blue** = navigation, information, admin
- **Gray** = locked, disabled, secondary

---

## Design Tokens

### Color Palette

#### Primary
| Token | Hex | Tailwind | Usage |
|-------|-----|----------|-------|
| `brand-blue` | `#3b82f6` | `blue-500` | Links, interactive elements, info badges |
| `brand-indigo` | `#6366f1` | `indigo-600` | Dashboard headers, nav active state, admin theme |
| `brand-purple` | `#a855f7` | `purple-600` | Celebration gradients, student login accent |
| `brand-green` | `#22c55e` | `green-500` | Success, correct answers, tracing correct path |
| `brand-yellow` | `#fbbf24` | `amber-400` | CTAs, stars, active level, rewards |

#### Semantic
| Token | Hex | Tailwind | Usage |
|-------|-----|----------|-------|
| `success` | `#22c55e` | `green-500` | Approved, correct, completed |
| `warning` | `#f59e0b` | `amber-500` | Pending, attention needed |
| `error` | `#ef4444` | `red-500` | Wrong answer, delete, retry |
| `info` | `#3b82f6` | `blue-500` | Informational badges |

#### Neutrals
| Token | Hex | Tailwind | Usage |
|-------|-----|----------|-------|
| `bg-primary` | `#ffffff` | `white` | Cards, inputs |
| `bg-secondary` | `#f3f4f6` | `gray-100` | Page backgrounds (dashboard/admin) |
| `border-default` | `#e5e7eb` | `gray-200` | Card borders, dividers |
| `text-primary` | `#1f2937` | `gray-900` | Headlines, primary text |
| `text-secondary` | `#6b7280` | `gray-500` | Labels, secondary text |
| `text-muted` | `#9ca3af` | `gray-400` | Placeholders, hints |

#### Gradients
| Token | Value | Usage |
|-------|-------|-------|
| `gradient-login` | `from-blue-500 to-purple-600` | Teacher/admin login background |
| `gradient-student` | `from-green-400 to-blue-500` | Student login background |
| `gradient-learn` | `from-sky-400 to-indigo-600` | All learning screens |
| `gradient-parent` | `from-emerald-50 to-white` | Parent portal |
| `gradient-celebration` | `from-purple-500 to-pink-500` | Celebration text |

### Typography

| Token | Tailwind | Size | Weight | Usage |
|-------|----------|------|--------|-------|
| `heading-xl` | `text-4xl font-extrabold` | 36px | 800 | Celebration titles |
| `heading-lg` | `text-3xl font-bold` | 30px | 700 | Page titles |
| `heading-md` | `text-2xl font-bold` | 24px | 700 | Section headers |
| `heading-sm` | `text-lg font-semibold` | 18px | 600 | Card titles |
| `body` | `text-base` | 16px | 400 | Body text |
| `body-sm` | `text-sm` | 14px | 400 | Secondary text |
| `caption` | `text-xs` | 12px | 400 | Labels, timestamps |
| `button-lg` | `text-2xl font-extrabold` | 24px | 800 | Large CTAs (kids) |
| `button-md` | `text-lg font-bold` | 18px | 700 | Medium buttons |
| `button-sm` | `text-sm font-medium` | 14px | 500 | Small buttons |

**Font:** Geist Sans (default), Georgia (print worksheets)

### Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| `space-1` | 4px | Tight gaps |
| `space-2` | 8px | Icon spacing |
| `space-3` | 12px | Grid gaps |
| `space-4` | 16px | Default padding, card gaps |
| `space-6` | 24px | Section padding |
| `space-8` | 32px | Large section gaps |

### Border Radius

| Token | Tailwind | Value | Usage |
|-------|----------|-------|-------|
| `radius-sm` | `rounded-lg` | 8px | Input fields, small cards |
| `radius-md` | `rounded-xl` | 12px | Buttons, cards |
| `radius-lg` | `rounded-2xl` | 16px | Large buttons, avatar cards, PIN pad |
| `radius-xl` | `rounded-3xl` | 24px | Login container, celebration card |
| `radius-full` | `rounded-full` | 50% | Badges, dots, color circles |

### Shadows

| Token | Tailwind | Usage |
|-------|----------|-------|
| `shadow-card` | `shadow-sm` | Dashboard cards |
| `shadow-button` | `shadow-md` | Interactive buttons |
| `shadow-elevated` | `shadow-lg` | Floating elements, PIN pad buttons |
| `shadow-modal` | `shadow-2xl` | Celebration overlays |

### Touch Targets

| Context | Minimum Size | Notes |
|---------|-------------|-------|
| Kid-facing buttons | **64px x 64px** | PIN pad, avatars, color circles, nav |
| Kid-facing CTAs | **64px height** | Full-width action buttons |
| Teacher/Admin buttons | **44px** | Standard web minimum |

---

## Screen Inventory

### 1. Login — Teacher/Admin (`/login`)

**Background:** `gradient-login` (blue → purple)
**Container:** White card, `max-w-md`, `radius-xl`, `shadow-modal`

**Components:**
- Tab bar: Two tabs (Guru/Admin | Pelajar) in `rounded-2xl bg-gray-100 p-1`
  - Active tab: white bg, colored text, `shadow-sm`
  - Inactive tab: transparent, gray text
- Email input: Full width, `radius-md`, border gray-300, focus ring blue
- Password input: Same as email, type=password
- Submit button: Full width, blue bg, white text, `button-md`, `radius-md`
- Student tab: Shows link to `/login/student`

### 2. Login — Student (`/login/student`)

**Background:** `gradient-student` (green → blue)

**Flow:** Avatar selection → PIN entry

**Step 1 — Avatar Grid:**
- Title: "Pilih Avatar Kamu!" — `heading-lg`, white, drop-shadow
- Grid: 4 columns, gap-4
- Avatar buttons: `radius-lg`, 64px min, emoji `text-4xl` + label `text-xs`
- Selected: `scale-110`, `ring-4 ring-yellow-400`, yellow shadow
- 8 avatars: Arnab 🐰, Kucing 🐱, Burung 🐦, Ikan 🐟, Gajah 🐘, Singa 🦁, Rama-rama 🦋, Bintang ⭐

**Step 2 — PIN Pad:**
- Title: "Masukkan PIN" — `heading-lg`, white, drop-shadow
- 4 dot indicators: `h-5 w-5 rounded-full border-2 border-white`
  - Empty: `bg-white/20`
  - Filled: `bg-yellow-300 scale-110` with yellow glow shadow
- Number grid: 3 columns, gap-3
  - Digit buttons: white, `radius-lg`, 64px, `text-2xl font-bold text-indigo-700`
  - Delete button: red bg, white arrow icon
- Error message: `text-red-200 animate-bounce`
- Back link: "← Tukar avatar", white/70 underline

### 3. Learn — Home / Journey Map (`/learn`)

**Background:** `gradient-learn` (sky → indigo)

**Layout:**
- Header: avatar emoji (left), stars ⭐ + streak 🔥 counters (center), logout button (right)
- Main: Journey map (vertical scroll)
- Bottom nav: Fixed, white/95 backdrop-blur, 3 items

**Journey Map:**
- Vertical path with zigzag layout (nodes alternate left/right)
- Level nodes: `w-16 h-16 rounded-full`
  - Completed: `bg-emerald-500 text-white shadow-lg`
  - Active: `bg-yellow-400 text-yellow-900 ring-4 ring-yellow-300/60 scale-110 animate-pulse`
  - Locked: `bg-gray-300 text-gray-500 opacity-50`
- Review nodes: 🔄 icon, same status coloring
- Connecting lines: `w-0.5 h-8 bg-white/30` between nodes
- Labels: "Tahap X" for levels, "Ulang Kaji" for reviews

**Bottom Nav:**
| Icon | Label | Route |
|------|-------|-------|
| 📖 | Belajar | `/learn` |
| 🎨 | Warna | `/learn/activity` |
| 🏆 | Galeri | `/learn/gallery` |
- Active: `text-indigo-600 font-bold`
- Inactive: `text-gray-500`
- Min height: 64px

### 4. Learn — Diagnostic / Pintu Kembara (`/learn/diagnostic`)

**Background:** `gradient-learn`

**Phase: Intro**
- Mascot: 🐰 `text-8xl animate-bounce`
- Title: "Pintu Kembara!" — `heading-xl`, white
- Subtitle: "Bantu Arnab cari huruf-huruf yang hilang!"
- CTA: "Mula! 🚀" — yellow bg, `button-lg`, 64px height, `hover:scale-105`

**Phase: Reading Test**
- Huruf display: `text-8xl` in white card `w-64 h-64 rounded-3xl shadow-xl`
- Mascot speech bubble: white card, `radius-lg`, encouraging text
- Mic button: `w-24 h-24 rounded-full`
  - Idle: green bg, 🎤 icon
  - Recording: `bg-red-500 animate-pulse scale-110`, ⏹️ icon
- Star animation on correct: `text-6xl animate-bounce`
- Encouragement on miss: "Cuba lagi, Arnab percaya kamu boleh!"

**Phase: Writing Test**
- Tracing canvas: `320x320`, white bg, `radius-lg`
  - Template: dotted gray path (slate-400)
  - Correct stroke: green (`#22c55e`)
  - Wrong stroke: red (`#ef4444`)
  - Start indicator: green circle, 8px
- Instruction: "Ikut titik-titik untuk menulis [huruf]!"
- Direction hint: "Lukis dari kanan ke kiri ➡️ ⬅️"
- Reset button: "Cuba lagi 🔄"

**Phase: Result**
- 🎉 `text-8xl`
- "Tahniah!" — `heading-xl`, white
- Stars row based on suggested level
- CTA: "Mula Belajar! 📖" — green bg, 64px

### 5. Learn — Three-Mode Page (`/learn/page/[level]/[page]`)

**Background:** `gradient-learn`

**Mode Indicator:** 3 dots at top (yellow = active, white/30 = inactive)

**Mode 1 — Dengar (Listen) 👂:**
- Header card: "Dengar 👂" + instruction
- 3-column grid of huruf cards
- Each card: `w-24 h-24`, white, `radius-lg`, `text-4xl font-bold`
- Tapped state: `ring-4 ring-green-400`
- Audio plays on tap via Howler.js

**Mode 2 — Cari (Find) 🔍:**
- Header card: "Cari 🔍" + instruction
- Replay button: `w-16 h-16 rounded-full bg-blue-500` with 🔊
- Shuffled huruf grid (same card style)
- Correct: ⭐ `animate-bounce`
- Wrong: card jiggles, plays its own sound
- Progress counter

**Mode 3 — Sebut (Say) 🗣️:**
- Header card: "Sebut 🗣️" + instruction
- Single huruf display: `text-7xl` in `w-48 h-48` white card
- Mic button: same as diagnostic (green/red pulsing, 96px)
- Correct: ⭐ + advance
- Wrong: encouragement bubble with 🐰
- Progress: "X / Y"

**Completion Screen:**
- 🎉 `text-8xl`
- "Bagus!" + star count
- Mascot break: "🐰 Bagus! Rehat dulu ya!" in white card
- "Kembali 🏠" button (delayed 3-5s)

### 6. Learn — Activity / Coloring (`/learn/activity`)

**Background:** `gradient-learn`
**Title:** "Warnakan Huruf! 🎨"

**Color Palette:**
- Row of color circles: `h-16 w-16 rounded-full`, 64px
- Default: red, blue, green
- Unlocked: gold, purple, pink (earned through progress)
- Locked: gray circle with 🔒
- Selected: `scale-110 border-4 border-white shadow-lg`
- Selecting a color plays huruf audio

**Canvas:** `400x400` (responsive), white bg, rounded, touch-none
- Brush: 12px radius circles
- Finger/mouse painting

**Done Button:** "Siap! ✅" — yellow, 64px height

**Completion:** "Cantiknya!" + gallery link

### 7. Learn — Gallery (`/learn/gallery`)

**Background:** `gradient-learn`
**Title:** "Galeri Saya 🏆"

**Section: Koleksi Warna**
- Grid of color circles (3 columns)
- Unlocked: vibrant color with label
- Locked: gray with 🔒 + "X lagi ⭐" count

**Section: Buku Stiker**
- Sticker pack cards
- Unlocked: shows emoji grid in card
- Locked: gray card with lock icon

**Section: Karya Saya**
- Grid of saved coloring work (images)

**Unlockable Thresholds:**
| Item | Stars Required |
|------|---------------|
| Gold color | 5 ⭐ |
| Purple color | 10 ⭐ |
| Pink color | 15 ⭐ |
| Rainbow color | 25 ⭐ |
| Animal stickers | 8 ⭐ |
| Nature stickers | 16 ⭐ |
| Masjid stickers | 30 ⭐ |

### 8. Dashboard — Class Overview (`/dashboard`)

**Background:** `bg-secondary` (gray-100)
**Header:** White, border-bottom, "ISJ Dashboard" + logout button

**Sort Controls:** 3 buttons (Level, Stars, Activity)
- Active: `bg-indigo-100 text-indigo-700 font-semibold`
- Inactive: `bg-white text-gray-600 hover:bg-gray-50`

**Student Cards:** Responsive grid (1/2/3 cols)
- White card, `radius-md`, `shadow-card`, `hover:shadow-md transition`
- Avatar: `text-4xl` emoji
- Name: `heading-sm`
- Level badge: colored `rounded-full` pill
- Stats: ⭐ count, 🔥 streak
- Last activity: relative time in Malay ("2 jam lalu", "Hari ini")
- Links to student detail

**Empty State:** "Tiada pelajar lagi. Tambah pelajar di Admin."

### 9. Dashboard — Tasmik Queue (`/dashboard/tasmik`)

**Header:** "Tasmik Queue" + pending count badge (red `rounded-full`)

**Tasmik Cards:** Vertical list
- Student: avatar + name
- Type badge: "Reading" / "Writing" — colored pill
- Audio player: play/pause button (green circle), progress bar, time
- Web Speech result: transcript text + confidence %
- Score + suggested level
- **Action buttons:**
  - "Lulus ✅" — green bg
  - "Cuba Lagi 🔄" — amber bg
  - "Tukar Tahap ⬆️" — blue bg (shows level selector 0-6)
- Notes textarea (optional)
- Realtime: auto-refreshes via Supabase Realtime

**Empty State:** "Tiada tasmik menunggu! 🎉"

### 10. Dashboard — Student Detail (`/dashboard/students/[id]`)

**Header:** Large avatar + name, level badge, ⭐ total, 🔥 streak

**Sections:**
- **Kemajuan (Progress):** Visual level bar (0-6), colored gradient fill
- **Sejarah Diagnostik:** Table — date, type, score, status badge
- **Galeri:** Image grid of student's work
- **Masa Aktif:** Last activity timestamp, pages completed count
- Back button → `/dashboard/students`

### 11. Dashboard — Analytics (`/dashboard/analytics`)

**Title:** "Analitik Kelas"

**4 Cards:**

| Card | Title | Visualization |
|------|-------|---------------|
| 1 | Huruf Mencabar | Red horizontal bars (lowest-scoring huruf) |
| 2 | Kadar Penyelesaian | Indigo bars per level completion % |
| 3 | Purata Masa | Amber bars (avg days per level) |
| 4 | Streak | Emerald bars (streak distribution: 0, 1-3, 4-7, 7+) |

All bars: Tailwind colored divs, no charting library. `h-5 rounded-full` with percentage width.

### 12. Dashboard — Worksheets (`/dashboard/worksheets`)

**Print Layout:** A4 max-width (210mm), serif font (Georgia)

**Worksheet Sections:**
1. **Header:** ISJ branding + student name + date
2. **Sambung Titik:** Dashed border box with large gray huruf
3. **Warna:** Huruf as outline only (transparent fill, black stroke)
4. **Tulis:** 6x2 grid of writing boxes, first box has faded guide

**Print button:** "Print Worksheet 🖨️", hidden in print (`print:hidden`)

### 13. Dashboard — Parent Links (`/dashboard/parents`)

**Management Table:**
- Student name, truncated token, created date, active/inactive status
- Copy link button (clipboard icon)
- Deactivate button (red)
- Generate link: student dropdown + "Jana Pautan" button

### 14. Admin — Content Manager (`/admin/content`)

**Header:** Indigo bg, "ISJ Admin" + logout
**Upload Form:** White card with fields:
- Level (0-6), page number, type (huruf/kalimah), label
- File inputs: image, audio, rhythm audio, tracing SVG
- Submit: indigo bg, full width

**Level Selector:** 7 buttons (0-6), active = indigo bg
**Content Table:** page, label, type, asset indicators (🖼️🔊🎵✍️)

### 15. Parent Portal (`/parent/[token]`)

**Background:** `gradient-parent` (emerald-50 → white)
**No auth required** — public shareable link

**Layout:**
- Header: child's avatar + name, ISJ branding
- 3 stat cards in a row:
  - Tahap Semasa (current level) — emerald accent
  - Streak — flame emoji + count + "hari berturut-turut"
  - Bintang — star emoji + total
- Level progress bar
- Aktiviti Terbaru: list of recent activities with dates
- Galeri: image grid

**Invalid token:** Sad emoji + "Link tidak sah atau sudah tamat tempoh"

### 16. Celebration Overlay

**Trigger:** Page completion or level completion

**Structure:**
- Full screen overlay: `fixed inset-0 z-50 bg-black/30`
- Centered card: `rounded-3xl bg-white/90 shadow-2xl`
- Auto-dismisses after 3 seconds

**Page Complete:**
- Single confetti burst from center
- Mascot: 🐰 `text-7xl`
- "Bagus!" text
- Star count

**Level Complete:**
- Continuous confetti from both sides
- Mascot: 🐰 `text-7xl animate-bounce`
- "TAHNIAH!" — gradient text (purple → pink)
- "Level X selesai!"
- Unlock notification if new reward earned

**Confetti Colors:** `["#fbbf24", "#f87171", "#34d399", "#60a5fa", "#a78bfa"]`

---

## Interaction Patterns

### Animations
| Trigger | Animation | Duration |
|---------|-----------|----------|
| Button hover | `scale-105` | 150ms |
| Button press | `scale-95` | 150ms |
| Correct answer | `animate-bounce` (star) | 1s |
| Wrong answer | Jiggle + redirect | 1.5s |
| Loading | `animate-pulse` | Continuous |
| Active level | `animate-pulse` + `scale-110` | Continuous |
| Error message | `animate-bounce` | Continuous |
| Celebration enter | `zoom-in-95 fade-in` | 300ms |

### Audio Cues
| Event | Sound |
|-------|-------|
| Tap huruf card | Qari pronunciation (Howler.js) |
| Select color | Huruf sound of current letter |
| Correct answer | (visual only — star animation) |
| Wrong answer | Tapped letter plays its own sound |
| Toggle mode | Qari vs Nasyid audio |

### Session Limits
- 1 Iqra' page per session max
- Break prompt after completion: "Bagus! Rehat dulu ya!"
- "Next" button delayed 3-5 seconds
- Teacher-visible session timer on dashboard

### Error Handling (Kid-facing)
- **No failure states** — wrong answers get encouragement
- "Cuba lagi, Arnab percaya kamu boleh! 🐰"
- "Cuba sekali lagi!"
- PIN wrong → dots reset, "Cuba lagi!" in red

---

## Responsive Behavior

| Breakpoint | Layout Changes |
|------------|---------------|
| Mobile (<640px) | Single column, full-width cards, stacked nav |
| Tablet (640-1024px) | 2-column grids, side-by-side stats |
| Desktop (1024px+) | 3-4 column grids, wider containers |

Kid-facing screens are **portrait-optimized** (tablets held vertically).
Dashboard/admin are **landscape-friendly** (desktop/laptop).

---

## Accessibility

- All touch targets: **64px minimum** (kid-facing), **44px minimum** (admin)
- Focus rings: `focus:ring-2 focus:ring-blue-500`
- ARIA labels on icon buttons
- High contrast text on gradient backgrounds (drop-shadow)
- RTL content support for Arabic huruf
- Semantic HTML: proper heading hierarchy, form labels
- `data-testid` attributes for testing

---

## File Structure Reference

```
src/
  app/
    layout.tsx              # Root layout (Geist font, metadata, PWA meta)
    page.tsx                # Redirect to /login
    login/
      page.tsx              # Teacher/admin login
      student/
        page.tsx            # Avatar + PIN login
    learn/
      layout.tsx            # Kid-friendly layout (gradient, bottom nav, stats)
      page.tsx              # Journey map home
      diagnostic/
        page.tsx            # Pintu Kembara (4 phases)
        reading-test.tsx    # Speech recognition test
        writing-test.tsx    # Canvas tracing test
      page/[level]/[page]/
        page.tsx            # Three-mode orchestrator
        dengar-mode.tsx     # Listen mode
        cari-mode.tsx       # Find mode
        sebut-mode.tsx      # Say mode
      activity/
        page.tsx            # Digital coloring
      gallery/
        page.tsx            # Unlockables + gallery
    dashboard/
      layout.tsx            # Teacher layout (white header, gray bg)
      page.tsx              # Class overview cards
      tasmik/page.tsx       # Audio review queue
      students/
        page.tsx            # Student list table
        [id]/page.tsx       # Student detail
      worksheets/page.tsx   # Print worksheets
      analytics/page.tsx    # Class analytics
      parents/page.tsx      # Parent link management
    admin/
      layout.tsx            # Admin layout (indigo header)
      content/page.tsx      # Content upload + management
    parent/
      [token]/page.tsx      # Public parent view
  components/
    avatar-grid.tsx         # 8-avatar selection grid
    pin-pad.tsx             # 4-digit PIN entry
    audio-player.tsx        # HTML5 audio with progress
    tracing-canvas.tsx      # SVG template + touch tracing
    coloring-canvas.tsx     # Free-draw coloring canvas
    journey-map.tsx         # Duolingo-style level path
    celebration.tsx         # Confetti + mascot overlay
    worksheet.tsx           # Printable A4 worksheet
    logout-button.tsx       # Sign out component
  lib/
    journey.ts              # Journey node builder (pure logic)
    tracing-analyzer.ts     # Stroke accuracy analyzer (pure logic)
    unlockables.ts          # Reward thresholds (pure logic)
```

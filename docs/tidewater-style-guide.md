# Familiar Guest â "Tidewater" Design System

A style guide for updating the Familiar Guest site (famguest.com). Hand this file to
Claude Code and ask it to apply these tokens and component rules to the
`familiar-guest-portal` project. It is framework-agnostic: CSS custom properties are
the source of truth, with a Tailwind mapping provided for convenience.

---

## 1. Design intent

Familiar Guest is a direct-booking product for vacation-rental owners. It holds guest
payments in escrow, so the design has one job above all: **feel as trustworthy as the
big platforms while feeling warmer and more personal than them.**

The palette is drawn from a Baja beach world â sea and sunset: deep ocean teal, sandy
cream, seaglass, and a single sunset-coral accent. The result should read *premium and
calm*, not playful-loud.

**A note on avoiding a generic look.** Warm-cream background + serif display + coral
accent is a common AI-default combination. What keeps this specific to Familiar Guest:
- **Deep ocean teal (`#0F4D45`) is the true anchor**, not the cream. Teal carries the
  nav, primary surfaces, and most CTAs. Cream is just the page canvas.
- **Coral appears at most once per screen** â reserved for the single most important
  action or a one-word headline emphasis. Never use it twice on the same view.
- Typography does the personality work, not decoration.

---

## 2. Color palette

| Token | Hex | Role |
|---|---|---|
| `--tw-cream` | `#F6F1E8` | Page background / canvas |
| `--tw-cream-deep` | `#EDE6D9` | Subtle dividers, card inner borders |
| `--tw-sand` | `#E4D8C4` | Secondary surfaces, muted fills |
| `--tw-ocean` | `#0F4D45` | **Primary brand** â nav, primary buttons, anchors |
| `--tw-ocean-ink` | `#16302B` | Headings and primary text |
| `--tw-teal` | `#14635A` | Secondary teal â links, secondary buttons, stats |
| `--tw-seaglass` | `#5FB8A4` | Light accent â verified badges, subtle highlights |
| `--tw-coral` | `#D9663F` | **Accent** â one primary CTA or one headline word per screen |
| `--tw-coral-ink` | `#C25A3A` | Coral text on light backgrounds (contrast-safe) |
| `--tw-text` | `#16302B` | Body text |
| `--tw-text-muted` | `#4F605A` | Secondary text, captions |
| `--tw-text-faint` | `#8A9590` | Metadata, placeholder, timestamps |
| `--tw-card` | `#FFFFFF` | Raised card surfaces |
| `--tw-card-border` | `#E0D6C5` | Card borders (0.5px) |

### Usage rules
- **Backgrounds:** cream canvas, white for raised cards. Never pure `#FFF` for the whole
  page â the cream is what makes it feel warm rather than clinical.
- **Text on coral fills:** use white (`#FFFFFF`). Text *in* coral on a light background:
  use `--tw-coral-ink`, never `--tw-coral` (fails contrast at small sizes).
- **Accent discipline:** if a screen already uses coral for a button, the headline emphasis
  word must be teal/ocean instead â and vice versa. Audit every view for this.
- **Verified / trust signals:** seaglass and teal only. Trust cues should feel cool and calm.

---

## 3. Typography

Two families, three roles. Load from Google Fonts.

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,500&family=Inter:wght@400;500;600&display=swap">
```

| Role | Family | Notes |
|---|---|---|
| **Display / headings** | `Fraunces` (serif) | Weights 400â600. Use optical sizing. Headline emphasis can use *italic* (`ital` axis) for warmth. |
| **Wordmark / logo** | `Fraunces` 600 | See Â§4 â this also fixes the current "f" rendering issue. |
| **Body / UI** | `Inter` (sans) | Weights 400/500/600. All controls, labels, paragraphs, data. |

```css
:root {
  --font-display: "Fraunces", Georgia, serif;
  --font-body: "Inter", system-ui, sans-serif;
}
```

### Type scale
| Element | Family | Size (desktop) | Weight | Letter-spacing | Line-height |
|---|---|---|---|---|---|
| H1 / hero | display | 33â40px | 500 | -0.01em | 1.1 |
| H2 / section | display | 24â28px | 500 | -0.005em | 1.2 |
| H3 | display | 18px | 600 | 0 | 1.3 |
| Eyebrow / label | body | 11px | 600 | +0.08em (UPPERCASE) | 1.2 |
| Body | body | 14â16px | 400 | 0 | 1.65 |
| Caption / meta | body | 11â13px | 400/500 | 0 | 1.5 |

- Pull headline tracking in slightly (`-0.01em`) â this is a big tell of intentional vs.
  default type and is part of why the current site reads as templated.
- **Sentence case everywhere** except eyebrows/labels, which are uppercase with positive
  tracking.

---

## 4. Wordmark / logo â fixes the current "f" issue

The current site renders the wordmark in a typeface whose lowercase **f** has an awkward
hook that catches the eye. Set the wordmark in **Fraunces 600** instead â its **f** is
clean and characterful, and the serif gives the brand the premium, hospitality feel the
rest of the system is built around.

```css
.wordmark {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 21px;
  letter-spacing: -0.01em;
  color: var(--tw-ocean);
}
```

If a separate logo lockup is needed later, keep "Familiar Guest" in Fraunces and avoid any
geometric/grotesque sans for the wordmark specifically â that's where the f problem lives.

---

## 5. Spacing & layout

Generous spacing is the single biggest signal of a designed (vs. auto-generated) page.

- **Section vertical padding:** 64â96px desktop, 40â56px mobile.
- **Content max-width:** 1120px; text columns cap at ~380â560px for readability.
- **Card internal padding:** 16â24px.
- **Grid gaps:** 16â24px.
- **Rhythm:** use a 4px base unit (4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96).

Hero should be asymmetric: headline + copy + CTA on the left, a single representative
booking card floated right. Avoid centered-everything layouts â they read as default.

---

## 6. Corners, borders, elevation

- **Border radius:** `6px` for buttons/inputs/badges, `12px` for cards. No fully-rounded
  pills (that belongs to the friendlier "Seaglass" direction, not this one).
- **Borders:** hairline `0.5px solid var(--tw-card-border)`. On dark/ocean surfaces, use
  `rgba(255,255,255,0.12)`.
- **Elevation:** flat. No drop shadows beyond an optional `0 1px 0 rgba(0,0,0,0.02)` hairline
  under cards. The warmth comes from color and type, not shadows.

```css
:root {
  --radius-sm: 6px;
  --radius-md: 12px;
  --border-hairline: 0.5px solid var(--tw-card-border);
}
```

---

## 7. Components

### Nav bar
- Cream or white background, wordmark left (Fraunces), links right in `--font-body` 13px
  `--tw-text-muted`.
- Primary nav CTA: solid ocean button (`--tw-ocean`, white text, radius-sm).

### Buttons
| Variant | Background | Text | Border | Use |
|---|---|---|---|---|
| Primary (action) | `--tw-coral` | `#FFF` | none | The one key conversion CTA per screen |
| Primary (brand) | `--tw-ocean` | `#F6F1E8` | none | Nav CTA, most buttons |
| Secondary | transparent | `--tw-teal` | `1.5px solid --tw-teal` | Lower-priority actions |
| Text link | â | `--tw-teal` | â | Inline "How escrow works â" style links |

Padding `11px 22px`, radius-sm, weight 500. Coral and ocean primaries never appear in the
same row â pick one lead per view.

### Eyebrow label
Uppercase, 11px, weight 600, `+0.08em` tracking, color `--tw-coral-ink` or `--tw-teal`.
Example: `FOR OWNERS, NOT PLATFORMS`.

### Badge / pill (trust signals)
Seaglass or teal. Background `#E7F2EE` style tint, text `--tw-teal`, radius-sm, 11px.
Example: "Verified owner", "Funds held until check-in".

### Listing / booking card
White surface, `--tw-card-border`, radius-md, padding 16px.
- Title in Fraunces 600 `--tw-ocean-ink`.
- Location/meta in `--tw-text-faint` 11px.
- Price in Fraunces 600.
- Reserve action: small ocean button (radius 14px is acceptable here for the inline pill).
- Hairline divider (`--tw-cream-deep`) between header and details.

### Stat / comparison block
Used for the "~8% vs 15.5%" comparison. Numbers in `--tw-teal`, weight 600; the competitor
figure muted/struck-through with a coral strike line. Label captions in `--tw-text-faint`.

---

## 8. Voice & copy (keep, don't fight the design)
- Sentence case, active voice, plain verbs. "Join the waitlist," not "Submit."
- An action keeps its name through the whole flow (button "Reserve" â confirmation "Reserved").
- Trust language stays factual and specific: "Money held in escrow until check-in," not vague
  reassurance.

---

## 9. Accessibility floor
- Body text contrast: `--tw-text` on cream passes AA. Don't drop body text below
  `--tw-text-muted` on cream.
- Visible keyboard focus ring on all interactive elements (e.g. `0 0 0 3px` seaglass at
  low opacity).
- Respect `prefers-reduced-motion`.
- Minimum font size 12px for any real content.

---

## 10. Tailwind mapping (if the portal uses Tailwind)

```js
// tailwind.config â theme.extend
colors: {
  cream:    { DEFAULT: "#F6F1E8", deep: "#EDE6D9" },
  sand:     "#E4D8C4",
  ocean:    { DEFAULT: "#0F4D45", ink: "#16302B" },
  teal:     "#14635A",
  seaglass: "#5FB8A4",
  coral:    { DEFAULT: "#D9663F", ink: "#C25A3A" },
},
fontFamily: {
  display: ['Fraunces', 'Georgia', 'serif'],
  body:    ['Inter', 'system-ui', 'sans-serif'],
},
borderRadius: { sm: '6px', md: '12px' },
```

---

## 11. Change checklist for the current site

Concrete edits to move famguest.com from its current AI-default look to Tidewater:

- [ ] Swap page background to cream `#F6F1E8`; cards to white.
- [ ] Replace the current body/heading fonts with Inter (body/UI) + Fraunces (display).
- [ ] Re-set the wordmark in **Fraunces 600** â resolves the "f" rendering complaint.
- [ ] Recolor: nav + most CTAs â ocean `#0F4D45`; one primary CTA per screen â coral `#D9663F`.
- [ ] Audit every screen: **coral appears at most once.** Move any second coral use to teal.
- [ ] Tighten headline letter-spacing to `-0.01em`; increase section padding to 64â96px.
- [ ] Convert pill/fully-rounded buttons to radius `6px`; cards to radius `12px`.
- [ ] Remove drop shadows; rely on hairline `0.5px` borders.
- [ ] Recolor trust/verified badges to seaglass/teal tints.
- [ ] Make the hero asymmetric (copy left, single booking card right).

---

*This spec captures the "Tidewater" direction. The other two explored directions
("Seaglass" â softer/friendlier, and "Sunset" â warmer/bolder) share the same palette
family but differ in radius, weight, and accent intensity, if a different feel is wanted
later.*

# Design System

<!-- impeccable:design-schema 1 -->

## World

**Meti: Energy and Connection**

Meti lives in the world of **active trust** — where professional wisdom meets accessible technology. It is not corporate or cold; it is vibrant, direct, and human. Meti's world is one of connections that matter: a lawyer clarifying a complex question, a coach transforming a career, a financial advisor bringing confidence to critical decisions.

**Cultural home:** The intersection between modern SaaS (Linear, Notion) and human service platforms (Airbnb Experiences, Masterclass). The energy of a tech startup with the warmth of a personal service.

**Physical scene:** Professionals working from homes and small offices, connecting with clients through screens. The platform should feel like a professional, welcoming, and efficient space — not a cold form or an over-styled app.

## Voice and Tone

- **Direct:** No fluff, clear in actions and prices
- **Trustworthy:** Professional but accessible, never arrogant or generic
- **Empowering:** The advisor feels in control of their business; the client feels confident in their choice
- **Transparent:** No fine print, no surprises, no hidden information

## Color Strategy

**Full Palette — Energetic and Bold**

```
Primary:    #FF6B35 (Vibrant Orange) — Action, energy, primary CTA
Secondary:  #1A1A2E (Deep Blue) — Trust, authority, headers
Accent:     #00D4AA (Turquoise) — Success, confirmation, positivity

Neutral BG:     #FAFAFA
Neutral Surface: #FFFFFF
Neutral Border:  #E5E7EB
Text Primary:    #1A1A2E
Text Muted:      #6B7280

Semantic:
  Success: #10B981
  Warning: #F59E0B
  Error:   #EF4444
  Star:    #FBBF24
```

**Light mode only in MVP** (scene: professionals working indoors, natural light, screens). Dark mode post-MVP.

## Typography

**Headlines:** Plus Jakarta Sans (Bold, Extrabold)
- Reason: Modern, geometric, has presence without being aggressive. Works well at large and small sizes.

**Body:** Inter (Regular, Medium)
- Reason: Excellent readability, broad support, familiar to tech users.

**Monospace (prices, data):** JetBrains Mono
- Reason: Numeric clarity, association with transparency and data.

**Scale:**
```
Display:    3.5rem / 4rem (56px / 64px)
H1:         2.5rem / 3rem (40px / 48px)
H2:         2rem / 2.5rem (32px / 40px)
H3:         1.5rem / 2rem (24px / 32px)
Body Large: 1.125rem (18px)
Body:       1rem (16px)
Small:      0.875rem (14px)
Caption:    0.75rem (12px)
```

## Component Language

**Buttons:**
- Primary: Background #FF6B35, white text, hover #E55A2B
- Secondary: Transparent background, border #1A1A2E, text #1A1A2E
- Ghost: Transparent background, text #FF6B35
- Border radius: 8px (consistent)

**Cards:**
- White background, subtle shadow (0 1px 3px rgba(0,0,0,0.1))
- Hover: slightly stronger shadow
- Border radius: 12px
- Padding: 24px

**Inputs:**
- Border: 1px solid #E5E7EB
- Focus: border #FF6B35, ring 2px rgba(255,107,53,0.2)
- Border radius: 8px
- Height: 44px (minimum for touch targets)

**Navigation:**
- Sticky header, white background with blur backdrop
- Logo on the left, links in the center, CTA on the right
- Mobile: hamburger menu with slide-in

**Rating Stars:**
- Color: #FBBF24
- Size: 16px–20px
- Empty: #E5E7EB

## Spacing and Layout

**Base unit:** 4px

**Spacing scale:**
```
1:  4px
2:  8px
3:  12px
4:  16px
5:  20px
6:  24px
8:  32px
10: 40px
12: 48px
16: 64px
20: 80px
24: 96px
```

**Layout:**
- Max width: 1280px (container)
- Grid: 12 columns, gap 24px
- Responsive breakpoints: 640px (sm), 768px (md), 1024px (lg), 1280px (xl)

## Imagery and Illustration

**Photography:**
- Real people (not generic stock)
- Professionals in real work environments
- Natural colors, soft lighting
- Composition: people as protagonists, not decorative

**Illustrations:**
- Linear style with color accents (#FF6B35, #00D4AA)
- Not cartoon, not 3D renders
- Functional: explain concepts, not decorate

**Icons:**
- Lucide React (consistent, clean)
- Size: 20px–24px in UI, 32px–48px in features
- Color: inherits from text or uses accent

## Motion

**Principles:**
- Functional: guide attention, not entertain
- Fast: 150ms–300ms for state transitions
- Smooth: ease-out for entrances, ease-in-out for movement

**Main animations:**
- Fade in: elements appear with opacity 0 to 1
- Slide up: content enters from below (20px offset)
- Scale: buttons and cards on hover (1.02 scale)
- Skeleton: content loading with shimmer

## Signature Interactions

1. **Video Preview on Hover:** Advisor cards show a preview of the introduction video on mouse hover (auto-play, muted)
2. **Sticky Booking Widget:** On the advisor profile, the booking widget stays visible while scrolling
3. **Animated Slot Selection:** Available time slots appear with a staggered transition
4. **Fee Transparency:** At checkout, the price breakdown is revealed with an animation
5. **Rating Interaction:** Rating stars have a micro-animation on selection

## Accessibility

- Minimum WCAG AA contrast (4.5:1 for text, 3:1 for graphics)
- Visible focus on all interactive elements
- Skip links for keyboard navigation
- ARIA labels on complex components
- Alt text on all images
- Reduced motion: respect prefers-reduced-motion

## Responsive Behavior

**Mobile (0–640px):**
- Vertical content stack
- Bottom navigation for primary actions
- Full-width cards
- Booking widget as bottom sheet

**Tablet (641–1024px):**
- 2-column card grid
- Collapsible sidebar in dashboard

**Desktop (1025px+):**
- 3–4 column card grid
- Permanent sidebar in dashboard
- Sticky booking widget on profile

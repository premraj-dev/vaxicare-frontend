# Child Vaccination Monitoring System — Design Blueprint

## Reference Ground-Truth Specification

The four supplied mobile screens are the structural reference for authentication. Their essential qualities are a generous top margin, an immediate welcome or account-creation heading, a short role-specific subtitle, a segmented Parent/ASHA role switch, a simple Log in/Register tab row, clearly labelled fields with large rounded white controls, an orange active-tab underline, and a wide primary action at the bottom. This structure is retained faithfully for the responsive mobile authentication and registration flow. The reference is used for layout, field order, role choice, and interaction hierarchy—not as a mandate to copy branding or colours.

## Chosen Approach — **Verified Care Console**

### Design Movement

This application uses **quiet clinical modernism**: an approachable public-health interface informed by Indian primary-care workflows, with disciplined SaaS information design rather than consumer-app decoration.

### Core Principles

1. **One action at a time.** Parent screens foreground the next vaccine and the action needed; ASHA screens foreground the next child to help.
2. **Risk must be readable at a glance.** Risk uses both a colour and a text/icon treatment, with numerical context available immediately.
3. **Friendly form structure, operational dashboard density.** Authentication is spacious and reassuring, while worker screens use efficient tables, summary cards, and action queues.
4. **Trust through transparency.** Every generated recommendation displays its evidence: missed doses, overdue days, dropout probability, and proposed action.

### Color Philosophy

The core palette uses a **deep healthcare navy** for authority, a **blue-green clinical teal** for care and progress, and a warm **coral underline** for active form state—honouring the warmth of the supplied references without making the interface look decorative. Fog-blue surfaces soften the dashboard canvas; risk colors remain restrained and semantic: red for immediate action, amber for medium attention, green for routine progress, and blue for pending scheduled work.

### Layout Paradigm

Authentication is a calm vertical “care lane” based on the reference screens: message, role toggle, tab, form, primary action. Authenticated experiences use a **dual-rhythm workspace**: a stable left rail for role navigation, a slim operational top bar, then fluid content zones that alternate between full-width decision panels and responsive data grids. On mobile, the left rail becomes a bottom navigation with task-oriented labels.

### Signature Elements

- **Care line:** a short coral active underline beneath the selected authentication state and key dashboard section headers.
- **Dose trail:** compact timeline dots connected by a teal line, used for a child’s vaccination history and imminent dose status.
- **Priority pulse:** a thin vertical risk bar at the left of ASHA queue rows, paired with a clear action button—not colour alone.

### Interaction Philosophy

Interactions are deliberate and operational. Role selection changes the subtitle and form fields immediately. OTP confirmation, vaccine recording, reminder sending, and intervention completion present compact confirmation states. ASHA actions open focused drawers or modals with child context already loaded.

### Animation

Use a 180–220ms custom ease-out for tab movement, dialogs, toast confirmations, and route content. Cards use only subtle opacity/translate entrance transitions. Buttons compress slightly on press. Risk rows never flash; the visual language is calm and dependable. All nonessential motion respects reduced-motion preferences.

### Typography System

**Manrope** is the display and heading face: compact, clear, and confident. **DM Sans** is used for forms, data tables, and explanatory copy because it remains legible at small operational sizes. Headings use heavy Manrope with tight tracking; metadata uses medium DM Sans in muted blue-grey; numeric risk and dashboard values use tabular figures where possible.

### Brand Essence

**VaxiCare is a clear, action-first immunisation workspace for parents and frontline health workers, turning each child’s next vaccine into an organised follow-up.**

Personality: **reassuring, precise, community-centred**.

### Brand Voice

Headlines are direct and calm. CTAs state the action and outcome rather than using generic prompts.

> “Your child’s next dose is due in 2 days.”

> “Prioritise 7 children who need follow-up today.”

### Wordmark & Logo

The brand mark is a rounded shield containing a three-node dose trail: a protected child, a completed dose, and the next step. It uses a navy field, a teal path, and a small coral signal point. The mark is icon-only in the app header; the VaxiCare wordmark uses the Manrope typography system.

### Signature Brand Color

**Care Teal — #0F766E.** It signals vaccination progress, verified status, and frontline care across the application.

## Data and Screen Vocabulary

The frontend uses the shared vocabulary established in the Colab prototype: `child_id`, `asha_id`, `area_id`, `missed_dose_count`, `days_overdue`, `dropout_probability`, `risk_level`, `priority_score`, `recommended_action`, `reminder_message`, and `reminder_status`. The UI uses these as API-ready fields and shows mock values only until a backend is connected.

## Style Decisions

- Authentication follows the supplied reference structure, with role toggle and Log in/Register tabs retained on mobile.
- Parent interfaces favour a soft public-health look; ASHA interfaces use higher information density with the same visual vocabulary.
- The static frontend intentionally simulates API interactions through central mock services; it does not claim to send real SMS, make calls, validate OTPs against a provider, or run the ML model in-browser.
- Desktop authenticated screens use a persistent left role rail and a slim operational top bar, so the workspace reads as an application rather than a marketing landing page.
- Coral care lines mark active headers, teal dose trails mark vaccination progress, and red/amber/teal priority pulses mark ASHA risk rows before a worker reads the badge.
- Red actions are reserved for immediate high-risk intervention; action labels name the care outcome wherever practical, such as send reminder, arrange home visit, and review vaccination plan.

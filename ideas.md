# Mothdrone — Design Philosophy

## Chosen Approach: "Tactical Precision / Defense-Grade HMI"

**Design Movement:** Military Human-Machine Interface (HMI) meets aerospace engineering documentation.

**Core Principles:**
1. Data density over decoration — every pixel earns its place
2. High-contrast dark environment with surgical accent lighting (Tactical Blue, Emissive Gold)
3. Monospaced telemetry readouts reinforce the "live system" illusion
4. Asymmetric split-panel layout: 3D viewport dominates left, telemetry panel anchors right

**Color Philosophy:**
- Background: Deep Charcoal #121212 / Tactical Slate #1E293B — conveys classified, high-stakes environment
- Primary Accent: Tactical Blue #3B82F6 — system active, data streams, beam indicators
- Secondary Accent: Emissive Gold #F59E0B — energy states, antenna traces, tier highlights
- Danger/Alert: Crimson #EF4444 — target lock, threat indicators
- Text: Off-white #E2E8F0 for readability against dark backgrounds

**Layout Paradigm:**
- Full-viewport split: 65% 3D canvas (left) + 35% mission control sidebar (right)
- Top bar: system status strip with monospaced identifiers
- Bottom bar: timeline/sequence controls
- No centered hero — the 3D model IS the hero

**Signature Elements:**
1. Scanline overlay on the 3D canvas (subtle CSS animation) — CRT/radar aesthetic
2. Corner-bracket UI frames (┌─ ─┐) around telemetry panels — aerospace HUD style
3. Pulsing dot indicators for live system states

**Interaction Philosophy:**
- Every button triggers a visible system response (state change, animation, telemetry update)
- Hover states reveal additional data layers
- Arabic RTL dashboard text with LTR technical terms preserved

**Animation:**
- GSAP for 3D transitions (exploded view, presentation mode orbital scan)
- Framer Motion for UI panel entrances (slide-in from right)
- Three.js clock-driven beam pulse animation
- Smooth opacity transitions for radome ghost mode

**Typography System:**
- Display/Labels: JetBrains Mono — monospaced, technical, defense-grade
- Body/Arabic: IBM Plex Sans Arabic — high legibility RTL support
- Hierarchy: 11px labels → 13px data → 16px section headers → 24px system title

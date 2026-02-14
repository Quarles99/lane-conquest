# Lane Conquest - Design Direction

## Gritty Low-Fantasy Aesthetic

**Design Movement**: Dark Medieval Realism

**Core Principles**:
- Weathered, battle-worn surfaces with visible damage and age
- Muted, desaturated color palette evoking mud, blood, and steel
- Organic, hand-drawn elements that feel crafted, not digital
- Heavy atmospheric effects—fog, dust, shadow

**Color Philosophy**: 
Deep, earthy foundation—charcoal stone (#2a2520), weathered leather (#4a3f35), tarnished bronze (#6b5d4f). Faction accents are subdued: dried blood crimson (#5c1a1a) for Undead, faded banner gold (#8b7355) for Human. Colors feel like natural pigments and oxidized metals, not vibrant paint.

**Layout Paradigm**: 
Asymmetric war table—main battlefield view dominates left/center (65%), weathered control panels anchor the right edge like torn parchment pinned to wood. Diagonal tears and irregular edges throughout. No perfect alignment—elements feel hand-placed on a commander's desk.

**Signature Elements**:
- Torn parchment edges using SVG masks and noise filters
- Rusted metal corner brackets and rivets
- Ink stains, blood splatters, and dirt textures as overlays
- Vignette darkening on edges to focus attention

**Interaction Philosophy**: 
Tactile and weighty. Buttons feel like worn wooden toggles or metal latches—subtle texture shifts on hover, heavy click states with inner shadows. No smooth glows—interactions use texture changes (clean → weathered) and subtle position shifts.

**Animation**: 
Grounded and physical. Unit spawns use dust cloud effects (opacity fade with slight scale). Combat damage shows blood spray particles (dark red dots with gravity). Screen shake on impacts. Transitions are abrupt cuts or quick fades (200ms max)—no elaborate effects.

**Typography System**:
- Display: "Cinzel" (700 weight) for titles—classical but not ornate, weathered nobility
- Body: "Crimson Text" (400/600) for descriptions—readable serif with medieval roots
- UI Labels: "Alegreya Sans" (500/700) for buttons and stats—humanist sans, sturdy
- Numbers: Tabular figures with slight roughness
- Hierarchy: Moderate size jumps (36px → 18px → 14px), generous line-height for readability against textured backgrounds

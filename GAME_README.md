# Lane Conquest

A gritty low-fantasy strategy tug-of-war game inspired by Warcraft 3 Direct Strike. Command the Human Empire against the Undead Legion in intense 1v1 battles where tactical decisions and resource management determine victory.

## Game Overview

**Platform**: PC web browser  
**Graphics**: Isometric 2D with dark medieval aesthetic  
**Match Length**: 15-25 minutes  
**Factions**: Human Empire vs Undead Legion

## How to Play

### Objective

Destroy the enemy fortress while defending your own. Deploy units strategically across two lanes, manage your economy, upgrade your technology, and command your hero to overwhelm your opponent.

### Controls

**Keyboard Hotkeys** (recommended for fast gameplay):
- **North Lane**: Q (Footman), W (Archer), E (Knight), R (Priest)
- **South Lane**: A (Footman), S (Archer), D (Knight), F (Priest)

**Mouse**: Click unit buttons to hire units for your formation (they will spawn automatically every 8 seconds)

### Core Mechanics

**Formation-Based Deployment**: Hire units once to add them to your formation. Each hired unit automatically spawns every 8 seconds, creating a continuous production line. Build your formation strategically to create the perfect army composition.

**Automatic Combat**: Units march forward automatically and engage enemies when in range. Focus on macro strategy rather than micromanagement.

**Two-Lane Warfare**: Deploy units across North and South lanes. Balance your forces to prevent breakthroughs while pushing for advantage.

**Defensive Structures**: Each lane has a defensive tower that automatically attacks nearby enemies. Towers must be destroyed before units can reach the enemy base.

**Hero Units**: Your hero spawns on the battlefield as a powerful unit with unique abilities:
- **Paladin** (Human): Divine Heal - restores health to nearby friendly units
- **Death Knight** (Undead): Death Coil - deals massive damage to a target

Heroes gain experience from kills, leveling up to become stronger. When a hero dies, they respawn after 30 seconds.

**Active Base Defense**: Your fortress isn't defenseless! The main base automatically attacks approaching enemy units within range, providing a last line of defense.

**Gold Economy**: Earn 5 gold per second passively. Control the middle section of the battlefield for bonus income (+3 gold/sec).

**Hero Progression**: Your hero gains experience from unit kills, leveling up from 1 to 10. Each level increases attack power and health.

**Tech Tiers**: Advance through three technology tiers to unlock more powerful units:
- **Tier 1** (Starting): Footman, Archer, Zombie, Skeleton
- **Tier 2** (200 gold): Knight, Priest, Ghoul, Necromancer
- **Tier 3** (400 gold): Advanced strategies and elite units

**Middle Control**: Position units in the center of the battlefield (position 45-55) to gain control. The faction with more units in this zone earns bonus gold income.

## Human Empire Units

### Tier 1
- **Footman** (50 gold): Durable melee infantry with balanced stats
- **Archer** (75 gold): Ranged attacker with high attack speed

### Tier 2
- **Knight** (120 gold): Heavy cavalry with high health and damage
- **Priest** (100 gold): Support unit with ranged attacks

## Undead Legion Units

The AI opponent controls the Undead Legion with equivalent units:

### Tier 1
- **Zombie**: Slow but tanky melee unit
- **Skeleton**: Ranged archer with fragile health

### Tier 2
- **Ghoul**: Fast melee attacker with high damage
- **Necromancer**: Powerful ranged spellcaster

## Strategy Tips

**Early Game** (0-5 minutes):
- Hire basic units (Footman/Archer) to build your formation
- Establish continuous unit production in both lanes
- Save gold for tech tier 2 upgrade
- Keep your hero alive to gain early levels
- Remember: each hire creates permanent auto-spawning

**Mid Game** (5-15 minutes):
- Upgrade to tier 2 when you have 200+ gold
- Add tier 2 units to your formation for variety
- Contest middle control for economic advantage
- Use hero abilities to turn fights
- Adjust formation composition based on enemy strategy

**Late Game** (15+ minutes):
- Deploy tier 2 units for maximum impact
- Push lanes with concentrated forces
- Coordinate hero with unit pushes
- Target enemy towers to open paths to their base

**Defensive Structures**:
- Towers have 800 HP and deal 30 damage per second
- Destroy enemy towers to advance safely
- Your towers protect against early rushes
- Main base deals 50 damage per second to nearby enemies

**Hero Management**:
- Heroes are powerful but have 30-second respawn timers
- Don't overextend your hero into dangerous positions
- Use hero abilities at critical moments
- Heroes gain XP faster in early game

**Unit Composition**:
- Melee units (Footman/Knight) tank damage and protect ranged units
- Ranged units (Archer/Priest) deal consistent damage from safety
- Mix both types for effective armies

**Lane Management**:
- Don't neglect either lane - a breakthrough can end the game
- Use hotkeys to quickly respond to threats
- Balance aggression with defense

## Visual Design

Lane Conquest embraces a **gritty low-fantasy aesthetic** inspired by dark medieval warfare:

- **Weathered textures**: Aged parchment, rusted metal, battle-worn surfaces
- **Muted color palette**: Earthy tones of mud, blood, and steel
- **Asymmetric layout**: War table design with battlefield and control panels
- **Medieval typography**: Classical serif fonts evoking historical manuscripts
- **Distinct unit markers**: Heroes (★), Towers (⚔), Units (letters)

The visual design reinforces the brutal, grounded nature of medieval conflict—no bright colors or clean lines, only the harsh reality of war.

## Technical Details

**Built with**:
- React 19 + TypeScript
- Tailwind CSS 4 for styling
- Custom game engine running at 60 FPS
- AI opponent with strategic decision-making
- Real-time combat simulation with visual feedback

**Performance**:
- Optimized for smooth gameplay
- Real-time combat simulation
- Responsive controls and visual feedback
- Automatic tower and building defense systems

## Credits

Developed with Manus AI as a demonstration of browser-based strategy game mechanics inspired by classic RTS titles.

---

**Begin your conquest. Defend your realm. Crush your enemies.**

# Deutsch Abenteuer

A pixel-art educational adventure game for learning German, inspired by **Mario is Missing**, **Pokémon** (overworld), **Super Mario World** (world map) and **Animal Crossing** (NPC interaction).

## Features

- **4 playable characters**: Enoc, Max, Vera, César — each with their own art style and palette
- **4 cities** to explore: Berlin, Frankfurt, München, Hamburg
- **12 vocabulary themes** (Lektionen 13–24) covering city places, directions, housing, appliances, plans, body parts, chores, appearance, rules, clothing, weather and celebrations
- **4 mini-game types**: Translation Quiz, Matching Game, Sentence Builder, Sign Reading
- **Synthesized audio** via Web Audio API — no external files needed
- **Save system** with 3 slots and persistent settings
- **Bilingual UI**: Deutsch / Español
- **Modular ES6 architecture** — clean separation of concerns
- **Mobile support** with on-screen touch controls

## Quick start

The project is pure ES6 + HTML5 Canvas, no build step required.

```bash
# Option 1: open directly in browser (note: ES6 modules need a server)
# Option 2: use a local server (recommended)
npm start            # uses npx serve
# or
python3 -m http.server 8000
# or
npx http-server -p 8000
```

Then open `http://localhost:8000` in a modern browser (Chrome, Firefox, Edge, Safari).

## Project structure

```
Deutsch-Abenteuer/
├── index.html                  Entry HTML
├── package.json
├── README.md
├── styles/
│   ├── main.css                Base layout
│   ├── menu.css                Touch controls
│   ├── ui.css                  Menu styles
│   └── game.css                In-game HUD styles
├── assets/                     (for future external assets)
└── src/
    ├── main.js                 Bootstrap: creates Game, registers scenes
    ├── core/
    │   ├── Config.js           Constants, tile IDs, character palettes
    │   ├── Engine.js           Game loop, canvas, fixed timestep
    │   ├── Game.js             High-level game coordinator
    │   ├── SceneManager.js     Scene stack
    │   ├── InputManager.js     Keyboard + touch
    │   ├── AudioManager.js     Web Audio synthesis, music + SFX
    │   ├── SaveManager.js      localStorage save slots
    │   ├── LocalizationManager.js  DE/ES translation
    │   └── FontRenderer.js     Pixel font
    ├── data/
    │   ├── vocabulary.js       All 12 Lektionen (13–24)
    │   ├── cityData.js         NPC positions, portals, scene config
    │   └── localization.js     UI strings (DE/ES)
    ├── entities/
    │   ├── Player.js           Pokémon-style 4-direction movement
    │   ├── NPC.js              NPCs with dialogue
    │   ├── InteractiveObject.js  Signs, benches, lamps...
    │   └── Collectible.js      Stars and pickups
    ├── graphics/
    │   ├── SpriteGenerator.js  Procedural character sprites (Enoc/Max/Vera/César)
    │   ├── TilesetGenerator.js Procedural tile sets (ground, walls, water...)
    │   ├── WeatherSystem.js    Rain, snow, leaves particles
    │   └── ParticleSystem.js   Burst effects
    ├── worlds/
    │   ├── WorldMap.js         Holds tiles, NPCs, collectibles, portals
    │   └── TerrainBuilder.js   Per-city terrain functions
    ├── minigames/
    │   ├── TranslationQuiz.js  4-option multiple choice
    │   ├── MatchingGame.js     DE ↔ ES pair matching
    │   ├── SentenceBuilder.js  Drag/select word order
    │   └── SignReading.js      erlaubt / verboten classification
    ├── ui/
    │   ├── Menu.js             Base menu class
    │   └── HUD.js              Top bar, dialogue, minimap
    └── scenes/
        ├── IntroScene.js
        ├── MainMenuScene.js
        ├── SaveSelectScene.js
        ├── CharacterSelectScene.js
        ├── NameInputScene.js
        ├── OptionsScene.js
        ├── WorldMapScene.js
        ├── GameScene.js        Main gameplay
        ├── PauseScene.js
        └── ResultsScene.js
```

## Controls

| Action      | Keyboard      | Touch      |
|-------------|---------------|------------|
| Move        | WASD / Arrows | D-pad      |
| Interact    | Enter / Space | A button   |
| Back/Pause  | Escape        | B button   |

## Game design

### Cities & lessons
- **Berlin** (Brandenburger Tor area) — Lektion 13 (Stadtorte) & 14 (Wege)
- **Frankfurt** (Römer & Bankenviertel) — Lektion 15, 16 & 17 (Wohnen, Geräte, Pläne)
- **München** (Marienplatz & Biergarten) — Lektion 18, 19 & 20 (Körper, Haushalt, Aussehen)
- **Hamburg** (Hafen & Speicherstadt) — Lektion 21, 22, 23 & 24 (Regeln, Kleidung, Wetter, Feste)

### Progression
1. Start in Berlin (always unlocked).
2. Earn stars by completing minigames.
3. Unlock the next city when you collect at least 3 stars in the current one.
4. Berlin → Frankfurt → München → Hamburg (in that order).

## Adding new content

The engine is designed for easy extension:

- **New city**: add a key in `src/data/cityData.js` and a `buildXxxTown()` in `worlds/TerrainBuilder.js`.
- **New lesson**: add a key in `src/data/vocabulary.js` and include it in `WORLD_LESSONS`.
- **New minigame**: create a class in `src/minigames/` and wire it into `GameScene._startMiniGame()`.
- **New character**: add an entry in `src/core/Config.js` `CHARACTERS` and the procedural `SpriteGenerator` will build idle/walk sprites automatically.

## Audio

All audio is synthesized on the fly using the **Web Audio API** with oscillators:
- `Erika` German folk melody on all menu screens.
- Per-city BGM with distinct character:
  - Berlin: energetic electronic-techno
  - Frankfurt: jazzy, financial district
  - München: Bavarian oompah brass
  - Hamburg: sea shanty / port atmosphere
- SFX: footsteps, dialogue blips, correct/wrong chimes, fanfare.

## License

MIT

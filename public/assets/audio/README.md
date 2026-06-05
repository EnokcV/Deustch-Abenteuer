# Audio assets

Esta carpeta contiene los archivos de audio del juego.

## Música

Los archivos de música se generan sintéticamente con Web Audio API en `src/core/AudioManager.js` (Erika melody + BGM por ciudad). Si en el futuro quieres reemplazarlos con archivos reales:

```
public/assets/audio/music/
├── erika.ogg
├── berlin.ogg
├── hamburg.ogg
├── frankfurt.ogg
└── munchen.ogg
```

## Efectos de sonido

También sintetizados. Para reemplazarlos:

```
public/assets/audio/sfx/
├── step.ogg
├── blip.ogg
├── correct.ogg
├── wrong.ogg
├── fanfare.ogg
├── coin.ogg
├── open.ogg
└── select.ogg
```

## Formato recomendado

- `.ogg` Vorbis o `.mp3` (preferentemente `.ogg` por tamaño)
- 44.1 kHz, 16-bit
- Mono para SFX, estéreo para música
- Música en loop (sin silencios al final)

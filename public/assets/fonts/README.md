# Fuentes

Esta carpeta contendría fuentes TTF/WOFF personalizadas si se quisieran añadir al juego.

## Actual

El juego usa una **fuente pixel art procedural** definida en `src/core/FontRenderer.js` con glifos de 5×7 píxeles que se dibujan directamente al canvas.

## Para añadir fuentes reales

```
public/assets/fonts/
├── PressStart2P-Regular.ttf
└── PressStart2P-Bold.ttf
```

Y se referenciarían desde CSS:

```css
@font-face {
  font-family: 'PressStart2P';
  src: url('/assets/fonts/PressStart2P-Regular.ttf') format('truetype');
}
```

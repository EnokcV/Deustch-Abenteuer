# Sprites de personajes

Aquí se almacenan las hojas de sprites de los 4 personajes jugables.

## Archivos actuales

- `characters-enoc-max.png` — Hoja con **ENOC** y **MAX** (1024×1024, tiles 64×64)
- `characters-vera-cesar.png` — Hoja con **VERA** y **CÉSAR** (1024×1024, tiles 64×64)

## Organización interna de cada hoja

Cada hoja contiene 4 filas de animaciones × 4 direcciones:

```
Fila 0: IDLE   (FRONT, BACK, LEFT, RIGHT)
Fila 1: WALK   frame 0-1
Fila 2: WALK   frame 2-3
Fila 3: RUN    frame 0-3
```

## Uso

Las imágenes son referenciadas desde `SpriteGenerator.js`. Si las imágenes existen, el juego las usa directamente; si no, recurre a la generación procedural (canvas drawing) que produce sprites estilo pixel art de 16×24 px.

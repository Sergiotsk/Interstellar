# Quickstart — Validar la feature 011 v2

## 1. Lógica

```bash
pnpm test
```

Tienen que pasar en verde `tests/miller-*.test.js` (caracterización del original), `tests/comun-*.test.js` y `tests/acople-*.test.js`.

## 2. Comparar contra el original

Abrir el juego del Playground y la réplica lado a lado. Recorrer:

1. **Briefing**: título, cita, las dos fases, Iniciar, Manual y Ranking.
2. **Cuenta de 2,5 s y Fase 1**:
   - el océano con cáusticas, los restos, la baliza que pulsa en naranja, CASE, el Ranger estacionado y la ola en diagonal;
   - el astronauta corre, salta (Espacio), hace slide (Shift) y dispara (J o clic);
   - el sonar acelera al acercarse a la baliza.
3. **Baliza**: banner naranja y la ola que acelera. Volver al Ranger y presionar [E].
4. **Fase 2**:
   - las estrellas en warp, el ascenso con su barra, los banners de cada sector y los escuadrones Galaga;
   - las mejoras P, B, celda y misiles, los misiles (Q), la bomba EMP (B) y los asteroides y minas del sector 3;
   - el Dreadnought con su barra a los 8800 m, la Endurance y el acople.
5. **Victoria**: tirada en 5 pasos, sello de rango, guardar el nombre y "RECORD COMMITTED".
6. **Fallo**: dejar que la ola te alcance → "ALCANZADO POR LA OLA", "AUTO RETRY IN" y reintentar con R.
7. **Menú (Esc)**: Resume, SFX, BGM, Restart y Quit.

## 3. Sitio

```bash
python -m http.server 8000
```

- `minijuegos.html`: la bahía 02 aparece disponible, y después de ganar muestra el récord.
- Navegar hub → Miller → hub 10 veces: queda un solo canvas, sin sonidos superpuestos y sin errores en la consola.
- Celular en horizontal (`--bind 0.0.0.0`): D-pad, JUMP, SLIDE y FIRE, y después BOMB, MISSILE y FIRE. En vertical aparece el aviso de giro.

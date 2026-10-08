# Quickstart — validar 010 Simulador de acople jugable en mobile

## Prerrequisitos

- Node para los tests (`node --test`).
- Python para el servidor estático.
- Para la validación real: un iPhone y un Android en la misma red Wi-Fi que la PC.

## 1. Tests automatizados

```bash
cd interstellar
node --test
```

**Esperado**: todos verdes, incluidos los nuevos `acople-dispositivo` (`modoEntrada`, `requiereGiro`), `acople-controles-tactiles`, `acople-nombre-arcade` (`fijarCursor`) y `acople-mision` (`TAP TO DOCK`).

## 2. Modo táctil en desktop (`?entrada=tactil`)

```bash
cd interstellar
python -m http.server 8000
```

Abrir `http://localhost:8000/minijuego-acople.html?entrada=tactil`.

| Paso | Esperado |
|---|---|
| Cargar | Intro con la ayuda de controles táctiles. No aparece el aviso de desktop. |
| Saltear | La cabina tapa header y footer. Se ven ◀ ▶ abajo a la izquierda, ▲ ▼ abajo a la derecha y II arriba. |
| Mantener ◀ con el mouse | La nave rota mientras está apretado y se detiene al soltar o al salir del botón. |
| Llegar a rango | La orden dice `TAP TO DOCK` y al hacerle clic acopla. |
| Entrar al ranking | Aparecen ▲ ▼ ◀ ▶ ⌫ debajo de las casillas, y hacer clic en una casilla mueve el cursor. |

Con DevTools → Device Toolbar (iPhone 14 horizontal, emulación táctil): repetir con toques y probar **dos dedos** (Shift + arrastre en la emulación de Chrome).

## 3. Tamaños sin scroll (iframes)

Desde la consola del navegador, cargar el simulador con `?entrada=tactil` en iframes de **844×390, 915×412, 667×375, 1024×768** y verificar:
- `scrollHeight === innerHeight`;
- la consola muestra los 5 instrumentos;
- ningún control se superpone con la consola.

En **390×844** (vertical) tiene que aparecer el aviso "Girá el dispositivo".

## 4. Dispositivo real (obligatorio para SC-001, SC-004, SC-005 y SC-008)

```bash
cd interstellar
python -m http.server 8000 --bind 0.0.0.0
```

En el teléfono, abrir `http://<ip-de-la-pc>:8000/minijuego-acople.html`. La IP sale de `ipconfig` en Windows.

| Caso | Esperado |
|---|---|
| Abrir sin parámetro | Modo táctil automático e intro (no aparece el aviso de desktop). |
| Iniciar | Android: pantalla completa y horizontal fija. iPhone: cabina a toda la pantalla visible. |
| Muesca | Ningún control queda debajo de la muesca ni de las esquinas. |
| ◀ + ▲ a la vez | Rota y acelera juntos, y soltar uno no suelta el otro. |
| Deslizar el dedo fuera de ▲ | Deja de acelerar. |
| Toque largo y doble toque en los controles | Sin menú, sin selección y sin zoom. |
| Girar a vertical en plena partida | Pausa con el aviso. Al volver a horizontal se ve la pausa y "Seguir" retoma. |
| Girar durante el editor de nombre | Al volver, el nombre a medio cargar sigue ahí. |
| Cargar un nombre de 5 letras | En menos de 30 s (SC-006). |
| Acoplar / rechazo | Vibración breve en Android. |

## 5. Regresión en desktop

Repetir el quickstart de la 009 en desktop sin parámetro:
- teclas, Enter para acoplar, editor con teclado, pantalla completa con Esc;
- los controles táctiles no se ven.

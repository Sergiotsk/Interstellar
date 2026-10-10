# Data Model — Feature 011 v2

La fuente es el `simRef` de `../mini-juego/App.tsx` (líneas 2216-2366) y su reinicio en `initGame` (2646-2850). Los nombres de los campos **se conservan en inglés, tal cual el original**, para poder compararlos línea a línea. Las unidades son px lógicos en 960 × 540, s y px/s.

## `sim` (estado de la simulación)

| Grupo | Campos (iguales al original) |
|---|---|
| Etapa | `stage`: `'MISSION_1_SURFACE' \| 'MISSION_TRANSITION' \| 'MISSION_2_ORBITAL_ASCENT' \| 'VICTORY_ENDURANCE_DOCKED'`, `controlMode`: `'FOOT' \| 'SHIP'`, `phase`: `'COUNTDOWN' \| 'EXPLORATION' \| 'RETRIEVED' \| 'LAUNCHED' \| 'FAILED'`, `countdownTimer`, `elapsedSeconds`, `animTick` |
| Nave | `shipX/Y/Vx/Vy/Angle/Roll`, `shipHealth`, `shipShield`, `shipWeaponCooldown`, `shipMissileCooldown`, `shipBoardPrompt`, `shipBoardAnimTimer`, `missileStock`, `bombStock`, `weaponPowerLevel`, `combo`, `comboTimer` |
| Ascenso | `altitude`, `targetAltitude`, `sector`, `sectorName`, `scrollSpeed`, `stars[]`, `obstacles[]`, `nextObstacleId` |
| Jefe y final | `bossActive`, `bossSpawned`, `enduranceX/Y/Rot`, `enduranceDescending`, `enduranceDocked`, `dockingLerp`, `transitionTimer` |
| Astronauta | `playerX/Y/Z/Vx/Vy/Vz`, `playerFacing`, `isGrounded`, `coyoteTimer`, `jumpBufferTimer`, `playerStunTimer`, `playerHurtTimer`, `playerShieldHp`, `playerShieldRegenDelay`, `state`, `aimAngle`, `crosshairX/Y`, `hasTargetLock`, `lockedEnemyId`, `equippedWeapon`, `fireCooldown`, `shootFlashTimer`, `slideTimer`, `slideCooldown` |
| Muerte | `isDying`, `deathTimer`, `deathMaxTimer`, `deathReason`: `'damage' \| 'wave'` |
| CASE | `caseX/Y/Vx/Vy`, `caseAnim`, `caseAssisting`, `caseBoostTimer` |
| Objetivos | `beaconX/Y`, `beaconAcquired`, `lastSonarTime`, `waveAngle`, `waveDistance`, `waveSpeed`, `debris[]` |
| Entidades | `bullets[]`, `enemies[]`, `drops[]`, `particles[]`, `ripples[]`, `floatingTexts[]`, `hitMarkers[]` |
| Spawners | `enemySpawnTimer`, `wavePatternTimer`, `nextEnemyId`, `nextDropId` |
| Estadísticas | `enemiesDestroyed`, `aerialInterceptorsDowned` |
| Cámara y efectos | `camX/Y`, `screenShake`, `hitStopMsRemaining`, `oneFrameFlash`, `redDamageVignette`, `empFlashTimer`, `banner` |
| Toques | `touchDir {x, y, active}`, `touchShoot`, `touchJump`, `touchSlide` |
| **Nuevos (port)** | `sonidos[]`: cola de `[metodo, ...args]` para el sintetizador. `fin`: `null \| { estado: 'VICTORY' \| 'GAME_OVER', resultado }`, lo que antes eran los `setGameState`/`setMissionStats` |

Los tipos `Bullet`, `Enemy`, `DropItem`, `Obstacle`, `Particle`, `WaterRipple`, `FloatingText`, `HitMarker`, `BannerNotification` y `Star` se conservan con los mismos campos que las interfaces del original (líneas 720-876).

## Entrada (por paso)

`{ left, right, up, down, confirm, tap, pointerDown }`: es el `InputSnapshot` del original (`helper.tsx`) aplanado. Los toques y las teclas de acción del original escriben en los campos `touch*` de `sim`, igual que en el original.

## Resultado (`sim.fin.resultado`)

`{ missionTime, earthYearsLost (texto con 1 decimal), enemiesDestroyed, aerialInterceptorsDowned, finalScore, rank: 'S' | 'A' | 'B' | 'C' | 'FAILED', deathReason }`.

## Hall of Fame

En el almacenamiento: `{ v: 1, entradas: [{ nombre, puntaje, anos, rango }], ultimoNombre }`, con hasta 10 entradas ordenadas por puntaje. En pantalla, si no hay entradas reales, se muestran los 4 pilotos de ejemplo del original.

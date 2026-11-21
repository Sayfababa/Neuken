# Project Eternal Grind – Übergabe für neue Sitzungen

Mobile Dark-Fantasy-Idle-RPG (nur WARRIOR) für iPhone/Safari, Hochformat. Reines HTML/CSS/JS (ES-Module),
kein Framework, kein Build, keine Abhängigkeiten. Die verbindliche Spezifikation liegt vollständig in
`docs/MASTER_PROMPT.md` – zu Beginn jeder Sitzung lesen.

**Test-Link für den Auftraggeber (iPhone):** https://claude.ai/artifact/Vp1qWwemyMHVAaUQYinUHQ (privates Artifact,
Stand Phase 3). Nach jeder Phase aktualisieren: Artifact-Tool, `action: publish`, `url` = dieser Link,
`file_path` = `index.html`, `files` = alle Dateien unter `src/`, `styles/` (später `assets/`) plus `manifest.webmanifest`.
Vorher den Link mit `action: read` lesen (sonst wird die Veröffentlichung abgelehnt).

## Arbeitsweise (aus der Spec, verbindlich)
- Auftraggeber kann nicht programmieren, testet nur im iPhone-Browser. Nie Code erklären, nur was er sieht/testen soll.
- Strikt phasenweise. Nach jeder Phase: Checks (Spec §13) selbst ausführen, Statusmeldung max. 10 Zeilen, auf Freigabe warten.
- Commit pro Phase: `feat(phaseN): …`. Branch: `claude/eternal-grind-phase-1-3qq95i`.
- Keine Extra-Features, keine toten Buttons, keine Spielwerte außerhalb `src/data/`. Fehlende Zahlen: nachfragen.
- Jede Datei < 400 Zeilen. Systeme importieren keine anderen Systeme (Kommunikation über `core/events.js`).
- Nur `src/ui/render.js` schreibt ins DOM. Grafik nur über `src/systems/assets.js` (IDs).

## Stand
- Phase 1 ✅ Grinding-Loop · Phase 2 ✅ Progression · Phase 3 ✅ Feinschliff & Balancing (Abnahme durch Auftraggeber auf dem iPhone steht aus)
- **Nächste: Phase 4** – Audio & finale Assets: `/assets/`-Struktur, Lade-/Fallback-Logik in `assets.js`
  (fehlt eine Datei → Platzhalter), Doku der Maße pro Asset-ID, Audio-Manager (Treffer, Krit, Levelup, Loot, Boss)
  in `src/systems/audio.js` (derzeit Stub). Keine Bilder/Sounds selbst erzeugen. Abnahme: ein PNG in `/assets/`
  ersetzt den Platzhalter ohne Änderung an Spiellogik.
- Danach Phase 5: PWA (Manifest existiert minimal, Service Worker fehlt), Icons, Offline, Gerätetests.

## Vom Auftraggeber bestätigte Annahmen (nicht im Spec)
Start-Stärke/Vitalität 0 · Gegner-Angriffe 0,8/s · HP-Regeneration 1,5 %/s · Affix-Basiswerte in `data/items.js` ·
Affix-Mindestwert 1 · Boss ohne Typ-Multiplikator.

## Phase-3-Balancing (Abweichungen vom Spec, Bestätigung durch Auftraggeber noch offen)
In `data/config.js` (jeweils mit Spec-Wert kommentiert): Gegnerwachstum HP 1,11 / Angriff 1,09 (Spec 1,18/1,15),
Affix-Exponent 0,6 (0,85), xpBase 15 (12), Legendary/Mythic-Gewicht 0,06/0,0067 (0,9/0,1), Respawn 450 ms.
In `data/dungeons.js`: Boss-Stärke je Dungeon (`bossHpMult`/`bossAttackMult`) statt einheitlich 12/2.
Simuliertes Ergebnis (Median 24 Läufe): L10 ≈ 11 min, erstes Rare ≈ 3 min, erstes Legendary ≈ 60 min,
Bosse nach ≈ 14 / 39 / 74 / 164 / 235 min, max. 41 s ohne Belohnung.

## Werkzeuge (`tools/`, nicht Teil des Spiels)
- `node tools/pace.mjs <seed> <minuten> '{"monster.hpGrowth":1.11}'` – Spielersimulation ohne Browser (6 h in < 1 s).
- `tools/tune.sh '<overrides>' [min]` – Median über 8 Läufe. `node tools/autotune.mjs` – Boss-Stärken auf Zielzeiten.
- `node tools/mksave.mjs 10 > tools/mid.json` – Spielstand „Mitte des Spiels“ erzeugen.
- `node tools/layout-check.js` – Screenshots aller Screens (iPhone 13) nach `tools/out/`, prüft Scrollen/Überlauf/Konsolenfehler.
  Vorher `python3 -m http.server 8080` im Projektordner starten.
- Im Browser: `window.__eg = { state, saveGame, emit }` für automatische Checks.

## Architektur-Kurzüberblick
- Ablauf: `core/loop.js` feuert `tick` (100 ms) → Systeme (`combat`, `skills`, `save`, …) reagieren über Events.
- Wichtige Events: `enemy:killed`, `item:created`, `character:levelup`, `boss:defeated`, `equip:request`,
  `equip:auto`, `skill:buy`, `dungeon:select`, `ui:tab`, `ui:navigate`.
- Init-Reihenfolge in `main.js` ist relevant (boss nach loot/itemgen/inventory; save zuletzt).
- Spielstand: `localStorage["eternal_grind_save_v1"]`, `saveVersion` 1, `migrate()` in `systems/save.js`.

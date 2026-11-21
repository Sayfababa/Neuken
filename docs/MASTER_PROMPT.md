# MASTER PROMPT — PROJECT ETERNAL GRIND
### Mobile Dark-Fantasy-Grinding-RPG · Spezifikation für Claude Code

> Originaltext des Auftraggebers (unverändert übernommen). Abweichungen, die der Auftraggeber
> bestätigt hat oder die noch zur Bestätigung offen sind, stehen in `/CLAUDE.md`.

---

## 0. WIE DU (CLAUDE CODE) ARBEITEST

**Rolle:** Du bist der alleinige Entwickler. Der Auftraggeber kann nicht programmieren. Er kann das Spiel nur im Browser seines iPhones testen. Alles, was er tun muss, ist eine Datei öffnen oder einen Befehl kopieren.

**Arbeitsregeln — verbindlich:**

1. Arbeite strikt in den Phasen aus Abschnitt 12. Beginne keine Phase, bevor die vorherige die Abnahmekriterien erfüllt.
2. Nach jeder Phase: stoppe, liefere eine kurze Statusmeldung (max. 10 Zeilen) mit „was läuft / was man jetzt testen kann / was als nächstes kommt" und warte auf Freigabe.
3. Baue nichts, was nicht in diesem Dokument steht. Keine Extra-Features, keine zusätzlichen Klassen, kein Multiplayer, keine Monetarisierung, kein Backend.
4. Schreibe keine toten Buttons und keine Attrappen. Ein sichtbares UI-Element muss funktionieren oder darf nicht existieren. Wenn etwas erst in einer späteren Phase kommt, zeige es nicht an.
5. Rate keine Spielwerte. Alle Zahlen stehen in Abschnitt 6 und in `src/data/`. Wenn eine Zahl fehlt, frage nach, statt dir eine auszudenken.
6. Nach jeder Phase ein Git-Commit mit der Phase im Betreff, z. B. `feat(phase1): spielbarer Grinding-Loop`.
7. Führe nach jeder Phase die Checks aus Abschnitt 13 selbst aus und berichte das Ergebnis, bevor du Freigabe anfragst.
8. Erkläre dem Auftraggeber niemals Code. Erkläre nur, was er sieht und was er testen soll.

**Was du NICHT kannst und daher nicht versprichst:** Du erzeugst keine Bilder, keine Sprites und keine Sounddateien. Alle Grafiken in diesem Projekt sind CSS/SVG-Platzhalter, die du selbst schreibst (Abschnitt 5). Finale Assets kommen später von außen und werden nur eingehängt.

---

## 1. PROJEKTZIEL IN EINEM SATZ

Ein Idle/Auto-Battler-Grinding-RPG für das iPhone, in dem ein einzelner Krieger automatisch kämpft, Gegner Loot fallen lassen, der Spieler mit einem Tap stärker wird — und immer ein nächstes Ziel in Sichtweite hat.

**Arbeitstitel:** Project Eternal Grind
**Spielbare Klasse:** ausschließlich WARRIOR

**Der Kernloop, der funktionieren muss, bevor irgendetwas anderes gebaut wird:**
Gegner erscheint → Krieger schlägt automatisch → Gegner stirbt → XP, Gold, evtl. Item → Item ausrüsten → nächster Gegner stirbt schneller.

Wenn dieser Loop nicht flüssig und befriedigend läuft, ist keine andere Arbeit relevant.

---

## 2. TECH-STACK — VERBINDLICH

| Thema | Entscheidung |
|---|---|
| Sprache | HTML5, CSS3, modernes JavaScript (ES2022, ES-Module) |
| Framework | keines. Kein React, kein Vue, kein Phaser, kein Unity |
| Build-Schritt | keiner. Kein npm, kein Bundler, kein TypeScript-Compiler |
| Rendering | DOM + CSS-Transforms. Kein Canvas, kein WebGL |
| Speichern | `localStorage`, versioniertes JSON |
| Lokaler Test | `python3 -m http.server 8080` im Projektordner |
| Auslieferung | statische Dateien, als PWA installierbar (`manifest.webmanifest` + Service Worker erst in Phase 5) |
| Abhängigkeiten | null. Keine CDN-Links, keine externen Fonts, keine Analytics |

**Begründung, an die du dich hältst:** Der Auftraggeber muss das Spiel ohne Toolchain auf dem iPhone öffnen können. Ein Build-Schritt oder eine fehlende Abhängigkeit macht das Projekt für ihn unbenutzbar.

**Dateistruktur — genau so:**

```
/index.html
/manifest.webmanifest
/styles/
  reset.css
  tokens.css          ← Farben, Abstände, Schriftgrößen als CSS-Variablen
  layout.css          ← das Bildschirmraster aus Abschnitt 4
  components.css
/src/
  main.js             ← Bootstrap, Game-Loop-Start
  core/
    loop.js           ← requestAnimationFrame-Tick, fixe 100ms-Logikschritte
    state.js          ← einziger Ort für den Spielzustand
    events.js         ← Event-Bus (emit/on), keine direkten Querzugriffe
    rng.js            ← seedbarer Zufall, damit Bugs reproduzierbar sind
  systems/
    combat.js
    character.js
    progression.js    ← XP, Level, Attribute
    inventory.js
    equipment.js
    itemgen.js        ← Item-Generator
    loot.js           ← Drop-Tabellen und Wurf
    dungeon.js
    boss.js
    skills.js
    save.js           ← Serialisieren, Laden, Migration
    assets.js         ← Asset-Manager mit IDs (Abschnitt 5)
    audio.js          ← Stub bis Phase 4
  ui/
    screens/home.js  gear.js  skills.js  dungeon.js  hero.js
    hud.js            ← oberer Bereich
    nav.js            ← untere Navigation
    combatview.js
    toast.js          ← Levelup-, Loot- und Boss-Meldungen
    render.js         ← einziger Ort, der ins DOM schreibt
  data/
    config.js         ← ALLE Balancing-Zahlen und Formeln
    items.js          ← Basis-Items und Affix-Pools
    monsters.js
    dungeons.js
    skills.js
```

**Architekturregeln:**
- Kein Spielwert steht in einer UI-Datei oder in CSS. Alles aus `src/data/`.
- Systeme lesen und schreiben Zustand nur über `state.js` und kommunizieren über `events.js`. Kein System importiert ein anderes System direkt.
- Nur `render.js` schreibt ins DOM. Systeme feuern Events, das UI reagiert.
- Die Logik läuft in festen 100-ms-Schritten, unabhängig von der Bildrate. Das Rendern ist davon getrennt.
- Jede Datei unter 400 Zeilen. Wird sie größer, teile sie auf.

---

## 3. GERÄTE UND DISPLAY

**Ziel:** iPhone 13 und neuer, Safari iOS 16+. Ausschließlich Hochformat.

Umsetzung, nicht verhandelbar:

- `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no, maximum-scale=1">`
- Höhen über `100dvh`, niemals `100vh` (sonst springt das Layout, wenn Safaris Leiste ein- und ausfährt).
- Safe Areas über `env(safe-area-inset-top/bottom/left/right)`. Dynamic Island und Home-Indikator dürfen nichts verdecken.
- `overflow: hidden` auf `html` und `body`. `overscroll-behavior: none`. `touch-action: manipulation` auf allen Tap-Zielen (verhindert Doppeltap-Zoom).
- `-webkit-user-select: none` und `-webkit-touch-callout: none` auf dem Spielbereich.
- Keine Scrollcontainer. **Eine Ausnahme:** die Inventarliste in GEAR darf vertikal scrollen, weil sie unbegrenzt wächst. Sie scrollt innerhalb ihres Panels, nie die Seite.
- Tap-Ziele mindestens 44 × 44 CSS-Pixel.
- Querformat: Overlay mit „Bitte Gerät hochkant halten". Kein eigenes Landscape-Layout.

---

## 4. BILDSCHIRM-BUDGET

Der Bildschirm ist in drei feste Zonen geteilt. Die Summe ist immer genau die Bildschirmhöhe. Baue das mit CSS Grid, nicht mit festen Pixelwerten.

```
┌─────────────────────────────┐
│ HUD                   ~12%  │  Level · Name · XP-Balken · Gold · Gems(Platzhalter)
├─────────────────────────────┤
│                             │
│ SPIELFLÄCHE           ~74%  │  Dungeon-Name · Gegner · Gegner-HP · Krieger ·
│                             │  Schadenszahlen · Loot-Effekte · Krieger-HP
│                             │
├─────────────────────────────┤
│ NAVIGATION            ~14%  │  HOME · GEAR · SKILLS · DUNGEON · HERO
└─────────────────────────────┘
```

```css
body {
  height: 100dvh;
  display: grid;
  grid-template-rows:
    calc(env(safe-area-inset-top) + 72px)
    1fr
    calc(72px + env(safe-area-inset-bottom));
  overflow: hidden;
}
```

**Regeln:**
- HUD und Navigation sind auf jedem Screen sichtbar und identisch positioniert.
- Jeder Screen (GEAR, SKILLS, DUNGEON, HERO) ersetzt nur die Spielfläche — als Panel über dem Kampf, nicht als neue Seite. Der Kampf läuft im Hintergrund weiter.
- Kein Screen hat Unterseiten. Item-Details erscheinen als Sheet von unten, mit einem X zum Schließen.
- Der Krieger steht optisch im Zentrum der Spielfläche. Der Gegner darüber oder rechts, deutlich erkennbar.

**Navigation:** 5 gleich breite Buttons, Icon plus Label, aktiver Tab farblich hervorgehoben. Immer sichtbar, nie scrollend.

---

## 5. PLATZHALTER-ASSETS UND ASSET-MANAGER

**Phase 1–3 verwenden ausschließlich Platzhalter.** Du erzeugst sie selbst als CSS-Formen und Inline-SVG: farbige Rechtecke, Kreise, einfache Silhouetten, CSS-Keyframe-Animationen. Keine Bilddateien, keine externen Grafiken.

**Pflicht: zentraler Asset-Manager.** Jedes sichtbare Element wird über eine ID angefragt, nie direkt gezeichnet:

```js
Assets.get('warrior_idle')   // liefert heute CSS-Platzhalter, später ein Sprite
```

Die Spiellogik kennt nur IDs. Sie darf niemals wissen, ob dahinter ein `<div>` oder ein PNG steckt. Ein späterer Austausch darf ausschließlich `assets.js` und ein Asset-Verzeichnis berühren — keine Zeile Spiellogik.

**Asset-Register — diese IDs müssen ab Phase 1 existieren:**

```
warrior_idle  warrior_attack  warrior_hit  warrior_death
monster_slime  monster_goblin  monster_skeleton  monster_demon  monster_wraith
boss_forest  boss_crypt  boss_cavern  boss_castle  boss_fortress
weapon_sword_001  weapon_axe_001  weapon_mace_001
armor_helmet_001  armor_chest_001  armor_gloves_001  armor_boots_001
accessory_shield_001  accessory_ring_001  accessory_amulet_001
bg_forest  bg_crypt  bg_cavern  bg_castle  bg_fortress
fx_hit  fx_crit  fx_levelup  fx_loot_rare  fx_loot_legendary
```

**Namensschema für Erweiterungen:** `kategorie_typ_nnn`, kleingeschrieben, dreistellig nummeriert.

---

## 6. BALANCING — ALLE FORMELN UND ZAHLEN

Diese Werte gehören vollständig nach `src/data/config.js`. Sie sind Startwerte, geprüft auf Plausibilität, und in Phase 3 justierbar.

### Charakter

```
xpBenötigt(level)   = floor(50 * level^1.55)
maxHP               = 100 + 18*(level-1) + vitalität*7      + gearHP
angriff             = 10 + 2.5*(level-1) + stärke*1.2       + gearAngriff
verteidigung        = 5  + 1.2*(level-1)                    + gearVerteidigung
angriffsgeschw.     = 1.00 Angriffe/s                       + gearSpeed   (Obergrenze 5.00)
kritChance          = 5 %                                   + gearKrit    (Obergrenze 75 %)
kritSchaden         = 150 %                                 + gearKritDmg
```

Pro Levelaufstieg: +2 Stärke, +2 Vitalität, HP vollständig auffüllen.

### Schaden

```
roh        = angriff * random(0.90 .. 1.10)
minderung  = zielVerteidigung / (zielVerteidigung + 50 + 10*zielLevel)
schaden    = max(1, floor(roh * (1 - minderung)))
bei Krit   = schaden * kritSchaden/100
```

Dieselbe Formel gilt für Gegner, die auf den Krieger schlagen.

### Gegner

```
gegnerHP      = floor(60  * 1.18^(dungeonLevel-1) * typMultiplikator)
gegnerAngriff = floor(8   * 1.15^(dungeonLevel-1) * typMultiplikator)
gegnerVerteid.= floor(3   * 1.12^(dungeonLevel-1))
gegnerXP      = floor(12  * dungeonLevel^1.20)
gegnerGold    = floor(8   * dungeonLevel^1.15 * random(0.8 .. 1.2))

typMultiplikator:  slime 0.8 · goblin 1.0 · skeleton 1.2 · wraith 1.4 · demon 1.7
```

### Boss

```
bossHP      = gegnerHP * 12
bossAngriff = gegnerAngriff * 2.0
bossXP      = gegnerXP * 15
bossGold    = gegnerGold * 20
Drop-Chance = 100 %, Mindestseltenheit Rare
Erster Sieg je Boss: garantiert ein Epic
```

### Loot

```
Drop-Chance pro normalem Gegner: 22 %
Seltenheitsgewichte (Summe 100):
  Common    60.0
  Uncommon  25.0
  Rare      10.0
  Epic       4.0
  Legendary  0.9
  Mythic     0.1
```

Pro Dungeon-Level verschiebt sich die Tabelle leicht nach oben: `gewicht_i *= (1 + 0.03*(dungeonLevel-1))` für Rare und höher, dann neu normalisieren.

```
itemLevel = clamp(dungeonLevel*3 + random(-2 .. +2), 1, 999)
```

### Item-Generierung

| Seltenheit | Affixe | Wertemultiplikator | Farbe |
|---|---|---|---|
| Common | 1 | 1.00 | `#9aa0a6` grau |
| Uncommon | 2 | 1.15 | `#4ade80` grün |
| Rare | 3 | 1.30 | `#60a5fa` blau |
| Epic | 4 | 1.50 | `#a855f7` violett |
| Legendary | 5 | 1.75 | `#f59e0b` orange |
| Mythic | 6 | 2.00 | `#ef4444` rot |

```
affixWert = floor(basisWert(affixTyp) * itemLevel^0.85 * multiplikator * random(0.85 .. 1.15))
```

Jeder Affix erscheint pro Item nur einmal. Zwei Items derselben Seltenheit sind dadurch praktisch immer unterschiedlich — das ist beabsichtigt und der Motor des Grindings.

**Affix-Typen:** Strength · Vitality · Attack Damage · Defense · Critical Chance · Critical Damage · Attack Speed · HP

**Itemname:** `[Präfix] [Basisname] [Suffix]`, Präfix/Suffix abhängig vom stärksten Affix. Namenslisten in `data/items.js`.

### Erwartetes Tempo (prüfe das in Phase 3)

- Level 1 → 10: etwa 8–12 Minuten
- Erstes Rare: innerhalb der ersten 5 Minuten
- Erstes Legendary: nach etwa 60–90 Minuten
- Dungeon 1 geschafft: etwa 15 Minuten
- Nie länger als 45 Sekunden ohne sichtbare Belohnung (Gold, XP-Tick, Item, Levelup)

---

## 7. AUSRÜSTUNG UND INVENTAR

**Slots:** Helmet · Chest · Gloves · Boots · Weapon · Shield · Ring 1 · Ring 2 · Amulet

**GEAR-Screen:**
- Oben: Kriegersilhouette mit den 9 Slots als antippbare Felder. Belegte Slots in Seltenheitsfarbe gerahmt.
- Unten: Inventarliste, scrollend innerhalb des Panels. Pro Zeile: Icon, Name in Seltenheitsfarbe, itemLevel, und ein Pfeil ↑ / ↓ / = für besser, schlechter oder gleichwertig gegenüber dem aktuell getragenen Item.
- Tap auf ein Item öffnet ein Sheet mit: Name, Seltenheit, itemLevel, allen Affixen, direktem Vergleich zum ausgerüsteten Item (grün/rot pro Wert) und einem Button AUSRÜSTEN.
- **Ein Tap rüstet aus.** Keine Bestätigung, keine Zwischenschritte.

**AUTO EQUIP:** ein Button, der für jeden Slot das stärkste Item nach einer Nutzwertformel anlegt:

```
nutzwert = angriffsGewinn*1.0 + hpGewinn*0.15 + verteidigungsGewinn*0.8
         + kritChance*8 + kritSchaden*0.5 + angriffsgeschw.*40
```

Nach dem Tap: kurze Zusammenfassung, welche Slots sich geändert haben.

**Inventargrenze:** 120 Items. Ist es voll, bricht der Loop nicht ab — das schwächste Common-Item wird automatisch verworfen und eine kurze Meldung erscheint. Verkaufen, Zerlegen und Aufwerten sind nicht Teil dieses Auftrags.

---

## 8. SKILLS

**Passiv** (jeweils Stufe 1–10, Gold-Kosten `100 * 1.6^stufe`):

| Skill | Effekt pro Stufe |
|---|---|
| Increased Damage | +4 % Angriff |
| Increased Health | +5 % max HP |
| Increased Defense | +4 % Verteidigung |
| Increased Critical Chance | +1,5 % Krit-Chance |
| Increased Attack Speed | +3 % Angriffsgeschwindigkeit |

**Aktiv** (Phase 2; feuern automatisch, sobald der Cooldown abgelaufen ist — der Spieler muss nicht tippen):

| Skill | Effekt | Cooldown | Freischaltung |
|---|---|---|---|
| Heavy Strike | 250 % Angriff auf ein Ziel | 6 s | Level 5 |
| Whirlwind | 120 % Angriff, trifft alle anwesenden Gegner | 10 s | Level 12 |
| Shield Bash | 150 % Angriff, Gegner 2 s betäubt | 14 s | Level 20 |
| Berserker Rage | +50 % Angriff und +30 % Tempo für 8 s | 30 s | Level 30 |

Jeder aktive Skill zeigt im Kampfbereich ein kleines Icon mit Cooldown-Ring. Manuelles Antippen löst ihn vorzeitig aus, ist aber nie nötig.

---

## 9. DUNGEONS UND BOSSE

| Nr. | Name | Level | Gegner | Freischaltung |
|---|---|---|---|---|
| 1 | Forgotten Forest | 1 | slime, goblin | von Beginn an |
| 2 | Skeleton Crypt | 8 | skeleton, goblin | Boss 1 besiegt |
| 3 | Dark Caverns | 18 | skeleton, wraith | Boss 2 besiegt |
| 4 | Cursed Castle | 32 | wraith, demon | Boss 3 besiegt |
| 5 | Demon Fortress | 50 | demon | Boss 4 besiegt |

Jeder Dungeon hat eigenen Namen, eigenes Hintergrund-Asset, eigene Gegnerliste, eigene Drop-Tabelle und genau einen Boss.

**Ablauf:** Nach 10 besiegten Gegnern im aktuellen Dungeon erscheint der Boss-Button. Der Spieler tappt und der Bosskampf startet. Verliert der Krieger, kehrt er ohne Verlust zum normalen Grind zurück — der Boss-Zähler bleibt bei 10, man kann sofort wieder antreten. Keine Strafe, keine verlorenen Items.

**Boss-Sieg:** Vollbild-Belohnungsanzeige mit XP-, Gold- und Loot-Aufstellung, dann Freischaltungshinweis für den nächsten Dungeon.

**Tod des Kriegers im normalen Kampf:** 3 Sekunden Pause, dann vollständige HP-Wiederherstellung und weiter. Kein Verlust von XP, Gold oder Items.

---

## 10. PROGRESSION UND RETENTION

Ab Phase 2 sichtbar und funktionsfähig:

- Charakterlevel, Gesamt-XP
- Kill-Counter, gesamt und pro Gegnertyp
- Dungeon- und Boss-Fortschritt
- Item-Sammlung: wie viele Legendaries und Mythics je gefunden
- Achievements: 15 konkrete, z. B. „1.000 Gegner besiegt", „Erstes Legendary", „Alle 5 Bosse"
- Höchstes gefundenes itemLevel

**Prestige:** nur vorbereiten, nicht aktivieren. `progression.js` bekommt eine Funktion `prestigeAvailable()` die bis auf Weiteres `false` liefert, und ein Feld `prestigeCount: 0` im Save. Kein UI dafür.

**Verboten — ausdrücklich:**
- Keine Timer, die den Spieler aussperren. Keine Energie, keine Leben, keine Wartezeiten.
- Keine Verlustmechaniken. Nichts, was der Spieler erarbeitet hat, kann verschwinden.
- Keine irreführenden Belohnungsanzeigen. Was angezeigt wird, wird auch gutgeschrieben.
- Keine Kauf-Hinweise, kein Shop, kein Pay-to-Win. Die Premium-Währung bleibt eine Zahl mit Wert 0 im HUD, ohne jede Funktion.
- Keine künstliche Verlangsamung, um Ungeduld zu erzeugen.

Der Spieler bleibt, weil der Fortschritt echt ist.

---

## 11. SPEICHERSYSTEM

```js
{
  saveVersion: 1,
  savedAt: 1764000000000,
  character: { level, xp, strength, vitality, currentHP },
  currency: { gold, gems },
  equipment: { helmet, chest, gloves, boots, weapon, shield, ring1, ring2, amulet },
  inventory: [ /* Item-Objekte */ ],
  skills:    { passive: {...}, active: {...} },
  dungeons:  { current: 1, unlocked: [1], killsInCurrent: 0, bossesDefeated: [] },
  stats:     { totalKills, killsByType, totalXP, legendariesFound, mythicsFound, highestItemLevel },
  achievements: [],
  prestigeCount: 0,
  settings:  { sfx: true, reducedMotion: false }
}
```

**Anforderungen:**
- Autosave alle 10 Sekunden und bei jedem Levelup, jedem Boss-Sieg und jedem Seltenheits-Drop ab Rare.
- `migrate(save)` erhöht alte Versionen schrittweise auf die aktuelle. Nie einen Spielstand verwerfen, weil die Version alt ist.
- Beschädigtes JSON: in `localStorage` unter `eg_save_corrupt_<timestamp>` sichern, neues Spiel starten, den Spieler mit einer Meldung informieren.
- `eternal_grind_save_v1` als Schlüssel. Ein Schlüssel, kein verstreuter Zustand.
- Im HERO-Screen: ein Button „Spielstand exportieren" (JSON in die Zwischenablage) und „Spielstand importieren". Das ist die Sicherung des Auftraggebers.

---

## 12. ENTWICKLUNGSPHASEN

### PHASE 1 — Spielbarer Grinding-Loop
Layout-Raster, HUD, Navigation (HOME und GEAR aktiv, die übrigen Tabs deaktiviert und sichtbar ausgegraut), Krieger- und Gegner-Platzhalter, automatischer Kampf mit Schadenszahlen, XP, Level, Gold, Drops aus einer einfachen Tabelle, Inventar, Ausrüsten mit einem Tap, Speichern und Laden.

*Abnahme:* 10 Minuten durchspielen auf dem iPhone, ohne Scrollen, ohne Zoom, ohne abgeschnittenes Element. Level 8 ist erreichbar, mindestens 5 Items sind gedroppt, ein Neuladen setzt genau dort fort.

### PHASE 2 — Progression
Alle 5 Dungeons, 5 Gegnertypen, Bosse, alle 6 Seltenheitsstufen, voller Item-Generator mit zufälligen Affixen, Skill-System passiv und aktiv, Item-Vergleich, AUTO EQUIP, Statistiken, Achievements. Alle 5 Tabs aktiv.

*Abnahme:* Dungeon 1 bis 3 durchspielbar, zwei Bosse besiegt, Items derselben Seltenheit sind nachweislich unterschiedlich, AUTO EQUIP legt tatsächlich das beste Gear an.

### PHASE 3 — Feinschliff und Balancing
Trefferanimationen, Todesanimationen, Loot-Animation mit Seltenheitsfarbe, Levelup-Toast, Boss-Belohnungsanzeige, Übergänge zwischen Screens, Balancing gegen die Tempo-Ziele aus Abschnitt 6, Performance-Optimierung.

*Abnahme:* stabile 60 fps auf dem iPhone 13 über 10 Minuten Kampf, kein wachsender Speicherverbrauch, die Tempo-Ziele werden eingehalten.

### PHASE 4 — Audio und finale Assets
Der Asset-Manager wird mit echten Dateien befüllt, sobald sie vorliegen. Du erzeugst sie nicht. Deine Aufgabe hier: Verzeichnisstruktur `/assets/`, Lade- und Fallback-Logik (fehlt eine Datei, greift der Platzhalter), Dokumentation der benötigten Maße pro ID, Audio-Manager mit kurzen Effekten für Treffer, Krit, Levelup, Loot und Boss.

*Abnahme:* ein einzelnes PNG in `/assets/` ersetzt den passenden Platzhalter, ohne dass eine Zeile Spiellogik angefasst wird.

### PHASE 5 — Release-Reife
PWA-Manifest, Icons, Service Worker für Offline-Betrieb, Test auf allen genannten iPhone-Auflösungen, Safe-Area-Test mit und ohne Dynamic Island, Spielstand-Test über App-Neustart, Durchlauf aller Buttons, Bugfixing.

*Abnahme:* über „Zum Home-Bildschirm" installierbar, läuft offline, kein toter Button.

---

## 13. CHECKS, DIE DU SELBST DURCHFÜHRST

Nach jeder Phase prüfe und berichte:

1. **Kein Scrollen:** `document.body.scrollHeight === window.innerHeight` auf jedem Screen.
2. **Keine Überläufe:** kein Element ragt horizontal aus dem Viewport.
3. **Keine toten Buttons:** jedes sichtbare `button` hat einen Listener und bewirkt sichtbar etwas.
4. **Keine Konsolenfehler** während 5 Minuten Spiel.
5. **Keine Spielwerte außerhalb von `src/data/`:** grep nach Zahlenliteralen in `src/ui/` und `src/systems/` — Treffer müssen begründbar sein.
6. **Speicher:** Heap-Größe nach 10 Minuten nicht mehr als 20 % über dem Wert nach 1 Minute.
7. **Save-Rundlauf:** speichern, neu laden, Zustand ist identisch.
8. **Asset-Entkopplung:** grep zeigt keinen direkten Grafikzugriff außerhalb von `assets.js`.

---

## 14. HÄUFIGE FEHLER, DIE DU VERMEIDEST

- `100vh` statt `100dvh` → Layout springt in Safari.
- Spielwerte im UI verteilt → Balancing wird unmöglich.
- Kampflogik an die Bildrate gekoppelt → auf schnellen Geräten läuft das Spiel schneller.
- DOM-Knoten pro Schadenszahl erzeugen und nie aufräumen → Speicherleck nach wenigen Minuten. Nutze einen Pool wiederverwendbarer Elemente.
- Verschachtelte Menüs → der Spieler verliert den Kampf aus den Augen.
- Bestätigungsdialoge beim Ausrüsten → killt den Spielfluss.
- Features aus einer späteren Phase vorziehen → Phase 1 wird nie fertig.
- Grafik direkt in der Spiellogik → der Austausch gegen finale Assets wird zur Neuentwicklung.

---

## 15. START

Beginne mit Phase 1. Erstelle zuerst die Dateistruktur und `src/data/config.js` mit allen Zahlen aus Abschnitt 6. Baue dann das Layout-Raster und prüfe es auf dem iPhone, bevor du eine Zeile Kampflogik schreibst.

Sag mir am Ende von Phase 1 in maximal 10 Zeilen, was ich öffnen und testen soll.

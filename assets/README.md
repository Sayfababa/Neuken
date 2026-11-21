# Assets – finale Grafiken und Sounds

Jede Grafik im Spiel hat eine feste ID. Liegt eine passende Datei hier, zeigt das Spiel sie an.
Fehlt sie, erscheint automatisch der bisherige Platzhalter. Es muss nichts am Spiel geändert werden.

**Regel:** Dateiname = ID + `.png`, im angegebenen Ordner, alles kleingeschrieben.
Beispiel: `assets/monsters/monster_slime.png` ersetzt den grünen Schleim.

## Allgemeine Vorgaben (Grafik)

- Format **PNG**, quadratisch (Ausnahme: Hintergründe), **transparenter Hintergrund** (Ausnahme: Hintergründe).
- Motiv mittig, nach unten ausgerichtet (Figuren stehen auf der Unterkante), ca. 5 % Rand frei lassen.
- Das Bild wird ohne Verzerrung eingepasst. Andere Seitenverhältnisse funktionieren, lassen aber Rand frei.
- Die Maße unten sind Empfehlungen für scharfe Darstellung bis iPhone Pro Max (3-fache Pixeldichte).
  „Anzeige“ = gemessene Größe auf dem iPhone 13 in Bildschirmpunkten.
- Blick-/Laufrichtung: Krieger schaut nach oben/rechts zum Gegner, Gegner schauen nach unten/links.
- Animationen (Wackeln, Aufblitzen, Ausblenden) macht das Spiel selbst – jede ID ist ein Einzelbild.

## Krieger – `assets/warrior/`  (Anzeige 190 × 190, empfohlen **512 × 512**)

| ID | Wann sichtbar |
|---|---|
| `warrior_idle` | Ruhehaltung (meiste Zeit; auch Silhouette im GEAR-Screen) |
| `warrior_attack` | ca. 0,2 s bei jedem Schlag |
| `warrior_hit` | ca. 0,2 s, wenn der Krieger getroffen wird |
| `warrior_death` | während der 3 s Pause nach dem Tod (Spiel graut zusätzlich aus) |

Hinweis: Die vier Posen am besten gemeinsam liefern. Fehlt eine, springt das Bild in diesem Moment auf den Platzhalter.

## Gegner – `assets/monsters/`  (Anzeige 180 × 180, empfohlen **512 × 512**)

`monster_slime` · `monster_goblin` · `monster_skeleton` · `monster_wraith` · `monster_demon`
(auch als kleines Symbol 28 × 28 in der Kill-Statistik im HERO-Screen)

## Bosse – `assets/bosses/`  (Anzeige bis 300 × 300, empfohlen **768 × 768**)

| ID | Dungeon |
|---|---|
| `boss_forest` | Forgotten Forest |
| `boss_crypt` | Skeleton Crypt |
| `boss_cavern` | Dark Caverns |
| `boss_castle` | Cursed Castle |
| `boss_fortress` | Demon Fortress |

Auch in der Sieger-Anzeige (110 × 110).

## Hintergründe – `assets/backgrounds/`  (Anzeige 390 × 520, empfohlen **1290 × 1720**, Hochformat 3:4, ohne Transparenz)

`bg_forest` · `bg_crypt` · `bg_cavern` · `bg_castle` · `bg_fortress`

Das Bild füllt die Spielfläche und wird bei anderen Bildschirmformaten an den Rändern beschnitten.
Wichtiges in die Mitte. Im DUNGEON-Screen erscheint nur ein waagrechter Streifen aus der Bildmitte (364 × 88).
Oben ist Platz für Dungeon-Name und Gegner, unten für den Krieger – ruhige, eher dunkle Bilder sind gut lesbar.

## Gegenstände – `assets/items/`  (Anzeige 36–52, empfohlen **256 × 256**)

`weapon_sword_001` · `weapon_axe_001` · `weapon_mace_001` ·
`armor_helmet_001` · `armor_chest_001` · `armor_gloves_001` · `armor_boots_001` ·
`accessory_shield_001` · `accessory_ring_001` · `accessory_amulet_001`

Die Seltenheitsfarbe (Rahmen) setzt das Spiel selbst – das Symbol bitte neutral, ohne farbigen Rahmen.

## Skills – `assets/skills/`  (Anzeige 28 × 28, empfohlen **256 × 256**)

`skill_heavy_strike_001` · `skill_whirlwind_001` · `skill_shield_bash_001` · `skill_berserker_rage_001`

## Effekte – `assets/fx/`

| ID | Anzeige | Empfohlen | Wann |
|---|---|---|---|
| `fx_hit` | 142 × 142 | 512 × 512 | Funke bei normalem Treffer |
| `fx_crit` | 142 × 142 | 512 × 512 | Funke bei Krit oder Skill-Treffer |
| `fx_levelup` | 70 × 70 | 256 × 256 | Levelaufstieg (auch Sieger-Anzeige) |
| `fx_loot_rare` | 31 × 31 | 128 × 128 | Leuchten hinter fliegender Beute ab Rare |
| `fx_loot_legendary` | 31 × 31 | 128 × 128 | Leuchten hinter fliegender Beute ab Legendary |

## Bedienelemente – `assets/ui/`  (Anzeige 18–44, empfohlen **128 × 128**)

| ID | Wo |
|---|---|
| `ui_gold_001` | Gold im HUD, Preise, Sieger-Anzeige |
| `ui_gem_001` | Gems im HUD |
| `ui_close_001` | X zum Schließen des Item-Fensters |
| `ui_nav_home_001` … `ui_nav_hero_001` | Navigation unten (home, gear, skills, dungeon, hero) |
| `ui_trophy_001` | erreichtes Achievement |
| `ui_lock_001` | noch gesperrtes Achievement |
| `ui_boss_001` | Meldung „Boss bereit“ |

Achtung: Die Navigations-Symbole und das X färbt das Spiel als Platzhalter selbst ein (aktiver Tab hell).
Als PNG bleibt die Farbe fest – deshalb hell auf transparent liefern; der aktive Tab wird weiterhin über Schrift und Hintergrund markiert.

Nicht austauschbar: der Cooldown-Ring um die Skill-Symbole (er zeigt den Fortschritt an).

## Sounds – `assets/audio/`

Format **MP3**, kurz, ohne Stille am Anfang, Lautstärke untereinander ähnlich.

| Datei | Wann | Länge |
|---|---|---|
| `sfx_hit.mp3` | jeder normale Treffer des Kriegers (bis zu 5× pro Sekunde) | 0,1–0,2 s |
| `sfx_crit.mp3` | kritischer Treffer | 0,2–0,4 s |
| `sfx_levelup.mp3` | Levelaufstieg | 0,5–1,5 s |
| `sfx_loot.mp3` | ein Gegenstand fällt | 0,2–0,5 s |
| `sfx_boss.mp3` | Bosskampf beginnt | 1–2 s |

Fehlt eine Datei, bleibt dieser Effekt still. Ton erklingt erst nach der ersten Berührung des Bildschirms
(Vorgabe von iOS) und nicht, wenn das iPhone auf lautlos steht.
Lautstärke je Effekt ist in `src/data/config.js` unter `audio` einstellbar.

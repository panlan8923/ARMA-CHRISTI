# Design: Hero — rivelazione del logo tramite tracciato

## Obiettivo

Sostituire l'immagine statica del logo nella hero della home con il file `arma-christi.svg` animato: il tracciato agisce come finestra che si apre lungo il suo percorso, rivelando la scritta completa. Effetto "penna che rivela", senza mostrare il tratto grigio in movimento.

## Decisioni approvate (brainstorming 2026-06-05)

| Scelta | Valore |
|--------|--------|
| Effetto | Rivelazione tramite maschera (opzione 1) |
| Durata rivelazione | ~2,8 secondi |
| Pausa iniziale | ~0,5 secondi |
| Anteprima fantasma | ~15% opacità, svanisce durante la rivelazione |
| Movimento | Fluido — parte piano, accelera al centro, rallenta alla fine |
| Dopo l'animazione | Scritta ferma al 100%, nessun loop |
| Accessibilità | Con "riduci movimento" attivo: scritta completa subito, senza animazione |
| Ambito | Solo hero della home; resto del sito invariato |

## Esperienza visiva (timeline)

| Momento | Cosa vede l'utente |
|---------|-------------------|
| **0 s** | Sfondo nero, logo in anteprima leggera (~15% opacità) |
| **0 → 0,5 s** | Pausa — l'anteprima resta ferma |
| **0,5 → 3,3 s** | La scritta emerge lungo il percorso del tracciato; l'anteprima svanisce in parallelo |
| **3,3 s+** | Scritta completa e statica |

Il tracciato non appare come linea animata visibile: funziona solo come maschera di rivelazione.

## Struttura del file SVG (`arma-christi.svg`)

Il file va organizzato in tre strati logici:

```
┌─────────────────────────────────┐
│  Strato 1 — Anteprima (fantasma) │  scritta completa, ~15% opacità
├─────────────────────────────────┤
│  Strato 2 — Maschera             │  percorso `#tracciato` come finestra
├─────────────────────────────────┤
│  Strato 3 — Scritta rivelata      │  stessa scritta al 100%, visibile
│                                   │  solo dove la maschera lo permette
└─────────────────────────────────┘
```

### Modifiche al file

1. **Rimuovere** il rettangolo bianco a tutto canvas — sfondo trasparente per fondersi con la hero nera.
2. **Definire la scritta una sola volta** in `<defs>` (es. `#scritta-arma`) e riusarla nei due strati fantasma e rivelato, così restano perfettamente allineati.
3. **Spostare il percorso `#tracciato`** nella definizione della maschera; i valori del attributo `d` restano identici all'originale.
4. **Due gruppi visibili** dentro `#arma-christi`:
   - `#hero-logo-ghost` — anteprima al 15%, `aria-hidden="true"`
   - `#hero-logo-reveal` — scritta mascherata da `url(#mask0_…)`

I path `d` esistenti non vanno semplificati né alterati.

## Animazione (Anime.js v4 `createDrawable`)

- Libreria: `animejs` v4, helper `createDrawable` da `animejs/svg`.
- Target: il path `#tracciato` dentro la maschera.
- Valori `draw`: da `0 0` (niente rivelato) a `0 1` (tutto rivelato).
- Timing:
  - `delay`: 500 ms
  - `duration`: 2800 ms
  - `ease`: `inOutQuad`
- In parallelo: dissolvenza dell'anteprima fantasma da 15% a 0% con stesso delay e durata.
- Una sola esecuzione al mount del componente; nessun replay allo scroll.

### Riduci movimento

Se `prefers-reduced-motion: reduce` è attivo:

- Impostare subito `draw` a `0 1` (stato finale).
- Nascondere il fantasma (opacità 0).
- Nessuna animazione.

## Integrazione nella pagina

| Elemento | Azione |
|----------|--------|
| Hero home (`+page.svelte`) | Sostituire `<img src="lettering.svg">` con componente `HeroLogo` |
| `HeroLogo.svelte` | Incorpora l'SVG inline, avvia l'animazione al caricamento, `role="img"` + `aria-label="ARMA CHRISTI"` |
| `hero-logo-animation.ts` | Costanti di timing e helper per reduced motion (testabili in unit test) |
| Sezione disegno, gallery, resto | Nessuna modifica |

### Dimensioni

Stesse regole attuali della hero: larghezza `min(680px, 90vw)`, altezza massima `58vh`.

## Criteri di accettazione

1. All'apertura: anteprima leggera → pausa ~0,5 s → rivelazione ~2,8 s.
2. Stato finale: scritta `#CCCCCC` completa e leggibile, ferma.
3. Nessun rettangolo bianco intorno al logo su sfondo nero.
4. Layout corretto su viewport mobile.
5. Con "riduci movimento": scritta finale immediata.
6. Nessun riferimento a `lettering.svg` nella hero (solo SVG inline).

## Fuori scope

- Loop o replay dell'animazione.
- Animazione del tratto grigio come linea visibile (opzione 2 scartata).
- Modifiche al percorso del tracciato o alla scritta (solo struttura file + animazione).
- Altre pagine oltre la home hero.

## Rischi e fallback

- **Maschera + `createDrawable`:** validare in Chromium; se la maschera non risponde all'animazione `draw`, clonare `#tracciato` nella maschera con id dedicato per l'animazione mantenendo il path originale statico.
- **Performance:** path complesso accettabile per un'animazione singola al caricamento.

## Riferimenti

- Asset: `src/lib/assets/arma-christi.svg`
- Piano di implementazione esistente: `docs/superpowers/plans/2026-06-04-hero-tracciato-reveal.md`

# Design: Migrazione `old/` al nuovo framework

## Obiettivo

Portare il progetto dentro `old/` nel nuovo framework mantenendo lo stesso risultato visivo e lo stesso comportamento percepito dall'utente finale.

## Decisioni approvate

- Aspetto: uguale al vecchio progetto.
- Ambito: tutte le pagine (`Home` + `Gallery`).
- Dati: mantenere gli stessi disegni gia' salvati.
- Testi UI: restano uguali a ora (`submit trace`, `Gallery`, `Home`, ecc.).
- Strategia: opzione A + C (rifacimento pulito, pagina per pagina).

## Strategia di consegna

### Step 1 - Home

Ricreazione della Home nel nuovo framework, uguale al progetto in `old/`:

- stesso hero iniziale con logo e tagline;
- stessa sezione di disegno su canvas;
- stesso pulsante `submit trace`;
- stessa logica di comparsa pulsante `Gallery`;
- stesso avviso quando si tenta di uscire con disegno non salvato.

### Step 2 - Gallery

Ricreazione della Gallery nel nuovo framework:

- stessa griglia visuale;
- stesso pulsante `Home`;
- caricamento degli stessi disegni esistenti;
- ordinamento dal piu' recente al meno recente.

## Struttura progetto (target)

- Home e Gallery come pagine del nuovo framework.
- Stili separati per Home/Gallery, ma risultato visivo identico.
- Collegamento unico al medesimo archivio disegni attuale.
- Cartella `old/` lasciata intatta finche' non arriva conferma finale.

## Comportamento e gestione errori

### Home

- Disegno libero con effetto ruvido (tratto variabile + piccole particelle).
- Invio disegno con feedback bottone: `submitting...`, `submitted`, `failed`.
- Se esistono modifiche non salvate, conferma prima di entrare in `Gallery`.

### Gallery

- Lettura disegni dall'archivio attuale.
- Render a card in griglia.
- Fallback con messaggio semplice se il caricamento fallisce.

## Verifica prima consegna

- Controllo visivo Home vs `old/index.html`.
- Controllo visivo Gallery vs `old/gallery.html`.
- Test pratici: disegno, invio, navigazione Home/Gallery, conferma uscita.
- Controllo che i disegni storici siano visibili.

## Vincoli

- Linguaggio e messaggi utente non tecnici.
- Nessuna modifica distruttiva ai file `old/`.
- Migrazione incrementale per ridurre rischi.

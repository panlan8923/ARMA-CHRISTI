# Design: Area admin e moderazione galleria

## Obiettivo

Permettere a un piccolo team di admin di accedere a una pagina riservata, entrare in galleria con strumenti extra, e nascondere o ripristinare disegni senza cancellarli definitivamente. I visitatori continuano a vedere solo i disegni visibili.

## Decisioni approvate

- **Nascondere un disegno:** sparisce dalla galleria pubblica, resta in archivio, puo' essere ripristinato.
- **Accesso admin:** pagina riservata separata (`/admin`), indirizzo conosciuto solo dal team.
- **Dopo il login:** reindirizzamento diretto alla galleria con controlli extra (nessuna dashboard separata).
- **Ripristino:** interruttore "Mostra anche i nascosti" in galleria; i nascosti appaiono sbiaditi con etichetta "Nascosto".
- **Autenticazione:** password condivisa per tutti gli admin (2-5 persone), senza username.
- **Approccio scelto:** opzione 2 — stessa esperienza utente dell'opzione semplice, ma verifica password protetta (non esposta nel codice pubblico del sito).

## Due mondi distinti

| Chi           | Cosa vede                                                                |
| ------------- | ------------------------------------------------------------------------ |
| Visitatore    | Home + galleria pubblica. Solo disegni non nascosti. Nessun login.       |
| Admin loggato | Stessa galleria, con barra strumenti admin e azioni nascondi/ripristina. |

## Flusso admin

1. L'admin apre `/admin`.
2. Inserisce la password condivisa.
3. Viene portato in galleria in **modalita' admin**.
4. Modera i disegni (nascondi / ripristina).
5. Esce con "Esci" quando ha finito.

## Pagina login (`/admin`)

### Aspetto

- Stesso stile scuro e minimale di Home e Galleria.
- Al centro: campo password, pulsante "Entra".
- Messaggio di errore se la password e' sbagliata ("Password non corretta").
- Link piccolo "Torna alla home".

### Comportamento

- Password corretta → redirect alla galleria in modalita' admin.
- Password sbagliata → messaggio chiaro, nessun dettaglio su cosa manca.
- Sessione attiva fino a logout esplicito ("Esci") o chiusura browser.

### Sicurezza

- La password non e' visibile nel codice sorgente scaricabile del sito.
- Solo sessioni admin autenticate possono nascondere o ripristinare disegni.

## Galleria in modalita' admin

### Barra in alto (solo admin loggato)

- Indicatore "Modalita' admin" (etichetta discreta).
- Interruttore **"Mostra anche i nascosti"** — spento di default.
- Pulsante **"Esci"** per chiudere la sessione admin.

### Su ogni disegno visibile

- Pulsante **"Nascondi"** (angolo card; al passaggio del mouse su desktop, sempre visibile su mobile).
- Conferma prima di nascondere: "Nascondere questo disegno? I visitatori non lo vedranno piu'."

### Con "Mostra anche i nascosti" attivo

- I disegni nascosti compaiono con opacita' ridotta (~50%) e/o overlay leggero.
- Etichetta **"Nascosto"** sulla card.
- Pulsante **"Ripristina"** al posto di "Nascondi".
- Conferma prima di ripristinare.

### Cosa vede il visitatore normale

- Nessuna barra admin, nessun pulsante, nessun interruttore.
- Solo disegni con stato "visibile", ordinati dal piu' recente.

## Dettagli visivi

- Controlli admin discreti: non devono dominare la card del disegno.
- "Nascondi": tono neutro o leggermente rossastro.
- "Ripristina": tono positivo (es. verde tenue).
- Disegni nascosti (con interruttore attivo): opacita' ~50%, bordo tratteggiato o etichetta "Nascosto" in alto a sinistra.
- Popup di conferma con "Annulla" e "Conferma" prima di ogni azione.

## Comportamento e gestione errori

| Situazione                      | Comportamento                                                                                   |
| ------------------------------- | ----------------------------------------------------------------------------------------------- |
| Admin nasconde un disegno       | Sparisce subito per i visitatori; per l'admin resta visibile solo con "Mostra anche i nascosti" |
| Visitatore ricarica la galleria | Non vede mai i disegni nascosti                                                                 |
| Admin esce ("Esci")             | Galleria torna normale, senza controlli                                                         |
| Password dimenticata            | Reset manuale fuori dal sito (procedura da definire con chi gestisce l'archivio)                |
| Galleria vuota                  | Messaggio vuoto come oggi                                                                       |
| Errore di connessione           | Messaggio chiaro; l'azione non viene applicata                                                  |

## Modello dati

Ogni disegno nell'archivio (`artworks`) acquisisce un campo **stato visibilita'**:

- `visible` (default) — mostrato ai visitatori.
- `hidden` — nascosto ai visitatori, recuperabile dagli admin.

I disegni esistenti senza questo campo vengono trattati come `visible`.

## Fuori scope (per ora)

- Account individuali per admin.
- Dashboard o pannello separato dalla galleria.
- Cancellazione definitiva dei disegni.
- Notifiche su nuovi invii.
- Statistiche o log delle azioni di moderazione.

## Verifica prima consegna

- Login con password corretta e errata.
- Admin in galleria: nascondi un disegno, verifica che sparisca per il visitatore.
- Interruttore "Mostra anche i nascosti": disegno nascosto visibile sbiadito con etichetta.
- Ripristino di un disegno nascosto: torna visibile ai visitatori.
- Logout: controlli admin spariscono.
- Visitatore: nessun controllo admin visibile in nessun caso.
- Stile coerente con Home e Galleria esistenti.

## Vincoli

- Linguaggio UI non tecnico (target: team creativo, non sviluppatori).
- Nessun cambiamento al flusso visitatore (disegno + invio + galleria pubblica).
- Migrazione soft: disegni storici restano visibili senza intervento manuale.

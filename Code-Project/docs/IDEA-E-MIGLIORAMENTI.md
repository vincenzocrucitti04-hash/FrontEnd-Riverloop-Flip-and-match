# Flip & Match — analisi, backlog e qualità del codice

Data dell'analisi: 14 luglio 2026.

## Situazione attuale

L'app è un memory game React/Vite a tema Pokémon. La struttura UI segue bene Atomic Design e la logica è raccolta in `src/hooks/useGameLogic.js`. Il gioco scarica sprite casuali da PokeAPI e supporta griglie 4×4 e 6×6, tema chiaro/scuro, conteggio mosse e modale di vittoria.

Non sono stati modificati i comportamenti dell'app durante questo audit. Il controllo `npm run lint && npm run build` non è stato eseguibile: l'ambiente corrente non dispone di `node`, `npm` o `node_modules`. Va eseguito in una macchina con Node.js installato, preferibilmente nella versione LTS indicata dal progetto.

## Backlog implementabile

Le proposte e le correzioni di questo documento sono ora spezzate in attività indipendenti, con dipendenze e criteri di accettazione: [indice del backlog](backlog/00-indice-e-ordine-di-implementazione.md). La direzione grafica scelta è documentata in [UI Pokémon Adventure](backlog/design/ui-pokemon-adventure.md).

> **Aggiornamento 16 luglio 2026:** la direzione UI Pokémon Adventure e il
> successivo redesign Expedition Journal restano come cronologia dell'audit, ma
> sono stati superati dalla specifica
> [Pokédex Control Center](superpowers/specs/2026-07-15-pokedex-control-center-redesign.md).

## Priorità consigliata

| Priorità | Obiettivo | Perché conta |
| --- | --- | --- |
| P0 | Rendere la partita corretta e robusta | Evita partite impossibili o concluse prematuramente e stati corrotti da richieste/timeout vecchi. |
| P1 | Accessibilità e responsive | Permette di giocare bene con tastiera, screen reader e su dispositivi piccoli. |
| P2 | Esperienza di gioco | Aumenta rigiocabilità, motivazione e chiarezza del feedback. |
| P3 | Qualità ingegneristica e prodotto | Rende il sito più affidabile, verificabile e facile da mantenere. |

## Criticità trovate

### P0 — logica e affidabilità

1. **Pokémon non garantiti univoci.** `useGameLogic` estrae ID casuali con reinserimento. Se lo stesso Pokémon compare due volte, ci sono quattro carte con la stessa immagine; al match, il codice marca tutte le carte con quell'immagine come abbinate. Questo può chiudere la partita in anticipo. Generare ID univoci e usare un `pairId` per ogni coppia.
2. **Race condition nelle richieste.** Restart o cambio griglia possono avviare più `fetch`; una risposta della vecchia partita può arrivare dopo e sovrascrivere lo stato della nuova. Usare `AbortController` e/o un identificatore di partita per ignorare risposte obsolete.
3. **Timeout non cancellati.** Il timeout per carte non abbinate e quello della vittoria restano attivi dopo restart/unmount. Possono aggiornare carte della nuova partita. Conservare gli ID dei timeout in `useRef` e pulirli nell'effetto di cleanup e prima di un nuovo gioco.
4. **Gestione HTTP incompleta.** Si invoca `res.json()` senza verificare `res.ok`. Errori 4xx/5xx o una risposta malformata diventano un messaggio solo in console. Introdurre stato `error`, testo chiaro e pulsante “Riprova”.
5. **Shuffle non uniforme.** `array.sort(() => Math.random() - 0.5)` non è uno shuffle corretto. Sostituirlo con Fisher–Yates puro e testabile.

### P1 — accessibilità e UI

1. **Carte non accessibili da tastiera.** Le carte sono `div` con `onClick`; non ricevono focus né rispondono a Enter/Spazio. Renderizzare un `button` per ogni carta, con nome accessibile e stato `aria-pressed`/`aria-disabled`.
2. **Modale incompleta.** Manca semantica dialog, gestione focus ed Escape. Implementare una modale accessibile e impedire l'interazione col background.
3. **Selettore griglia senza stato comunicato.** I pulsanti 4×4/6×6 non indicano quale griglia è attiva. Usare `aria-pressed`, stile attivo e disabilitare/segnalare l'opzione già selezionata.
4. **Alternative text generico.** `alt="pokemon"` non comunica il soggetto. Salvare anche il nome da PokeAPI e usarlo per l'immagine quando è scoperta; per il dorso usare testo decorativo/accessibile coerente.
5. **Lingua documento errata.** La UI è italiana ma `index.html` dichiara `lang="en"`; impostare `lang="it"`.
6. **Feedback di caricamento e errore non annunciato.** Applicare `role="status"` o `aria-live="polite"` agli stati dinamici.

### P1 — CSS e responsive

1. **Regole CSS non valide.** `filter: blur(20%)` e `padding: 1 0 auto` non hanno valori validi e vengono ignorate dal browser.
2. **Collisione di `.theme-toggle`.** La stessa classe è definita sia in `Header.css` sia in `Button.css`; quest'ultima imposta `position: absolute` e `left: 3rem`, in conflitto con il layout flex dell'header. Separare gli stili dell'atomo dai modificatori del componente oppure usare nomi con namespace.
3. **Temi troppo invasivi.** `body.light *` e `body.dark *` forzano il colore di tutti i discendenti, sovrascrivendo potenzialmente icone, link e stati specifici. Definire custom properties CSS sul `body` e consumarle localmente.
4. **Layout fragile.** Game board e griglia dipendono da `position: absolute`, percentuali verticali e grandi margini in `vh`; sui telefoni compatti può sovrapporsi a header/footer. Passare a un layout normale con grid/flex, dimensioni `clamp()` e area di gioco responsiva.
5. **Footer fisso invasivo.** Può coprire contenuti o controlli; l'animazione dipende dallo scroll. Valutare footer nel flusso del documento o riservare in modo esplicito lo spazio reale che occupa.
6. **Animazioni senza preferenza utente.** Aggiungere `@media (prefers-reduced-motion: reduce)` e limitare transizioni alla proprietà necessaria.

### P2/P3 — manutenzione e prodotto

1. **Nessun test automatico.** Aggiungere Vitest + React Testing Library per hook/componenti e Playwright per il percorso “inizia → abbina → vittoria”.
2. **README vuoto.** Documentare setup, requisiti Node, script, architettura, fonte dati, accessibilità e deploy.
3. **Mancano formattazione e controlli CI.** Introdurre Prettier, `lint-staged`/Husky facoltativi e una GitHub Action con install, lint, test e build.
4. **Nome pacchetto generico.** Rinominare `app-zero` in `flip-and-match` quando non rompe flussi esterni.
5. **Doppio favicon.** Il primo tag favicon ha `href` vuoto e il secondo contiene il data URI: mantenerne uno solo, preferibilmente il file `public/favicon.svg` già presente.
6. **Dipendenze non sfruttate.** Tailwind è dichiarato ma lo stile è CSS vanilla. O adottarlo coerentemente oppure rimuoverlo per ridurre manutenzione e ambiguità.

## Idee implementabili

### Migliorare il gioco

- Timer di partita, record personale e numero minimo teorico di mosse.
- Difficoltà: 2×2 per onboarding, 4×4 standard, 6×6 difficile; velocità di preview iniziale configurabile.
- Sistema punteggio: tempo, mosse, combo di match consecutivi e stelle.
- Pausa/riprendi e restart con conferma solo a partita avviata.
- Anteprima iniziale di tutte le carte per 2–3 secondi, con impostazione disattivabile.
- Modalità giornaliera: seed del giorno condiviso, senza bisogno di backend per la prima versione.
- Modalità allenamento: mostra il nome Pokémon e una breve curiosità dopo ogni coppia.
- Deck a tema selezionabile: Kanto, starter, evoluzioni, tipi Pokémon, oppure set locali per gioco offline.
- Suoni opzionali, vibrazione aptica su mobile e animazioni di match rispettose di `prefers-reduced-motion`.

### Progresso e rigiocabilità

- Salvataggio in `localStorage` di tema, miglior punteggio per difficoltà, impostazioni e partita interrotta.
- Profilo locale leggero con statistiche: partite, accuratezza, serie di vittorie e Pokémon scoperti.
- Badge/achievement, ad esempio “10 partite”, “zero errori” e “6×6 completata”.
- Condivisione del risultato tramite Web Share API con fallback copia negli appunti.
- Classifica locale; una classifica globale richiede un backend e regole anti-abuso, quindi è una fase distinta.

### Esperienza e design

- Schermata iniziale con istruzioni concise e selezione difficoltà/deck.
- Stato di rete curato: skeleton delle carte, errore con retry e fallback a immagini locali.
- Feedback visivo e testuale su match/errore; contatore mosse e timer sempre leggibili.
- Migliore contrasto dei colori, outline tastiera e supporto completo light/dark/system.
- PWA: installazione, asset cache e deck locale per una partita offline.
- Metadati SEO/social: descrizione, Open Graph, manifest, favicon coerente e titolo con stato della partita solo se utile.

### Evoluzione tecnica

- Estrarre funzioni pure: `createDeck`, `shuffle`, `isMatch`, `getGridConfig`; coprirle con test unitari.
- Modellare lo stato con `useReducer` o state machine leggera: `loading`, `preview`, `playing`, `resolvingPair`, `won`, `error`.
- Introdurre un layer `services/pokemonApi.js` con cache, validazione dati, timeout e fallback.
- Definire costanti configurabili per griglie, timeout e sprite; evitare magic number nel hook.
- Aggiungere PropTypes o migrare gradualmente a TypeScript per props, carte e stati.
- Configurare CI e una preview deploy (GitHub Pages, Netlify o Vercel).

## Roadmap pragmatico

1. **Fondamenta (P0):** deck univoco con `pairId`, Fisher–Yates, cancellation/cleanup, error/retry e test del hook.
2. **Accessibilità e responsive (P1):** carte button, modale accessibile, tema a token CSS, correzione regole CSS e layout game board.
3. **Core UX (P2):** selettore difficoltà con stato attivo, timer, record locale, pausa e feedback di fine partita.
4. **Polish (P2):** onboarding, preview iniziale, suoni/haptic opzionali, riduzione movimento e PWA.
5. **Crescita (P3):** statistiche, deck tematici, sfida giornaliera, condivisione e solo poi backend/classifiche.

## Criteri di qualità per le prossime modifiche

- Nessuna azione di gioco soltanto col mouse: deve funzionare da tastiera e touch.
- Ogni stato asincrono presenta loading, successo ed errore comprensibili.
- Restart, cambio difficoltà e unmount non possono far aggiornare una partita vecchia.
- Ogni nuova logica di game state ha test deterministici; l'intero progetto passa `npm run lint`, test e `npm run build`.
- Ogni feature deve essere utilizzabile su desktop e mobile, tema chiaro/scuro e riduzione movimento.

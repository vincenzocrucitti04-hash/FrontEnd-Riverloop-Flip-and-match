# Flip & Match

Flip & Match è un memory game sviluppato con React e Vite. Ogni partita
carica Pokémon univoci da PokeAPI, crea due carte per Pokémon e richiede di
completare tutte le coppie con il minor numero possibile di mosse.

## Requisiti

- Node.js `^20.19.0` oppure `>=22.12.0`.
- npm, incluso nell'installazione di Node.js.
- Connessione a Internet per caricare i Pokémon da PokeAPI.

## Avvio locale

```bash
npm install
npm run dev
```

Vite mostra nel terminale l'indirizzo locale dell'applicazione, normalmente
`http://localhost:5173`.

## Comandi disponibili

| Comando                 | Descrizione                                   |
| ----------------------- | --------------------------------------------- |
| `npm run dev`           | Avvia il server di sviluppo Vite.             |
| `npm run build`         | Genera la build di produzione in `dist/`.     |
| `npm run preview`       | Serve localmente la build di produzione.      |
| `npm run lint`          | Esegue ESLint sull'intero progetto.           |
| `npm test`              | Esegue una volta tutti i test Vitest.         |
| `npm run test:coverage` | Esegue i test e genera il report di coverage. |

## Architettura

Il progetto segue Atomic Design e mantiene separati presentazione, stato del
gioco e accesso alla rete:

```text
src/
├── components/
│   ├── atoms/       componenti visuali di base
│   ├── molecule/    piccoli gruppi di controlli
│   ├── organisms/   sezioni autonome dell'interfaccia
│   └── templates/   composizione della schermata di gioco
├── config/          griglie, tempi e limiti configurabili
├── hooks/           orchestrazione del flusso di gioco
├── reducers/        stati e transizioni della partita
├── services/        accesso, cache e validazione di PokeAPI
├── test/            configurazione condivisa dei test
└── utils/           funzioni pure e deterministiche
```

`App` conserva tema e statistiche trasversali. `GameBoard` collega la UI a
`useGameLogic`; l'hook gestisce richieste e timeout e invia ogni transizione al
reducer. I componenti visuali ricevono dati e callback tramite props.

## Punteggio e valutazione

Il punteggio usa una formula deterministica e versionata configurata in
`src/config/gameConfig.js`: assegna punti per ogni coppia, aggiunge un bonus
progressivo alle combo e applica penalità per tempo e mosse oltre il minimo.
Un mismatch azzera la combo corrente senza cancellare il bonus già ottenuto.
La schermata finale mostra punteggio, combo massima, formula applicata e soglie
da una a tre stelle specifiche per la difficoltà selezionata.

La modalità allenamento è facoltativa: dopo una coppia mostra una curiosità
richiudibile senza bloccare le carte. Le descrizioni vengono richieste a
PokeAPI e degradano a un testo locale quando la rete o il contenuto non sono
disponibili.

I mazzi selezionabili limitano gli ID estratti a Kanto, starter/evoluzioni,
linee evolutive o tipo Acqua. Il deck locale contiene 18 badge SVG distinti e
permette di iniziare anche senza rete; la relativa licenza è descritta in
[`docs/assets/offline-deck-license.md`](./docs/assets/offline-deck-license.md).

All'apertura viene mostrata una schermata iniziale con istruzioni, selettori e
riepilogo. La griglia e le sue richieste vengono create soltanto dopo la CTA
"Inizia avventura"; difficoltà, deck e anteprima ripartono dalle preferenze
salvate nel browser.

Durante la partita una barra compatta mantiene visibili tempo, mosse, minimo,
combo e record. L'esito dell'ultimo tentativo è mostrato sia come testo sia
sulle due carte coinvolte, con descrizioni accessibili che non dipendono dal
solo colore o dall'animazione.

Il profilo locale raccoglie esclusivamente dopo vittorie valide il numero di
partite, i dati necessari all'accuratezza (coppie corrette diviso tentativi),
la serie di vittorie e i Pokémon scoperti. Lo storage versionato migra i dati
precedenti e il pannello consente di azzerare profilo e record con conferma;
nessun dato lascia il browser.

## Direzione visuale

L'interfaccia segue la direzione "Pokédex Control Center": una console
rossa e grafite racchiude il centro di configurazione, la HUD di partita,
l'archivio allenatore e il rapporto finale. Le carte hanno un dorso ispirato
alla geometria classica della Poké Ball e un fronte tecnico con sprite, nome,
numero e stato di registrazione. Le decorazioni sono costruite con CSS locale e
non imitano interfacce software ufficiali. I token semantici supportano tema
chiaro e scuro e le coppie principali hanno un test automatico di contrasto
WCAG AA.

## PokeAPI e gestione degli errori

Il layer `src/services/pokemonApi.js` normalizza ogni risposta nel formato
`{ id, name, image }`, verifica status HTTP e payload, applica un timeout e
mantiene una cache in memoria per la sessione. Richieste superate da restart o
cambi griglia vengono annullate. In caso di errore l'interfaccia mostra un
messaggio comprensibile e consente di riprovare.

Durante il caricamento la griglia mantiene le dimensioni selezionate con uno
skeleton rispettoso della riduzione del movimento. Offline, timeout, errore del
server e problemi di rete hanno messaggi distinti; dall'errore si può scegliere
tra un nuovo tentativo e il passaggio esplicito al deck locale.

## Test e qualità

La suite usa Vitest, React Testing Library e JSDOM. Comprende test per utility,
reducer, service, hook e componenti. Prima di proporre una modifica eseguire:

```bash
npm run lint
npm test
npm run build
```

I test che dipendono dal caso usano generatori casuali iniettati e fake timer,
così il risultato resta deterministico.

## Accessibilità

L'accessibilità viene sviluppata progressivamente seguendo il backlog: elementi
semantici, utilizzo da tastiera, focus delle modali, annunci degli stati
dinamici, contrasto e riduzione del movimento sono verificati nelle rispettive
correzioni. Non considerare completata una modifica UI senza controllo da
tastiera e con tema chiaro/scuro.

## Build e deploy

`npm run build` produce un sito statico nella cartella `dist/`. La cartella può
essere pubblicata su qualsiasi hosting statico; il server deve reindirizzare le
richieste dell'applicazione a `index.html` se in futuro vengono introdotte rotte
client-side.

## Contribuire

Prima di modificare il progetto leggere [AGENTS.md](./AGENTS.md) e
l'[indice del backlog](./docs/backlog/00-indice-e-ordine-di-implementazione.md).
Ogni voce del backlog descrive scope, dipendenze e criteri di accettazione e va
implementata nell'ordine indicato.

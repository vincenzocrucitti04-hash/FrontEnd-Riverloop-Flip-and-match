# Rifiniture UI del Centro di controllo e della partita

## Obiettivo

Correggere le incoerenze visive introdotte dal redesign del Centro di controllo e rendere più chiari il caricamento, lo stato della partita e i controlli della schermata finale, senza modificare le regole del gioco o introdurre nuove dipendenze.

## Ambito

La modifica comprende:

- resa corretta delle Poké Ball decorative nel tema chiaro e scuro;
- rimozione degli indicatori verdi con testo "Sistema pronto" dalla schermata iniziale e dal footer;
- visualizzazione affidabile di immagine, numero e nome del Pokémon sul fronte delle carte;
- sostituzione del messaggio di stato vuoto durante la partita;
- spinner per ogni caricamento del mazzo, visibile per almeno un secondo;
- aggiornamento del pulsante della modale di vittoria;
- indicatore visivo di espansione per i dettagli del punteggio.

Non sono comprese modifiche alle regole di punteggio, alla selezione del mazzo, alla persistenza o alle chiamate PokéAPI.

## Design visuale e componenti

### Poké Ball decorative

Il componente atomico `PokeBall` non userà più il token della superficie per la metà inferiore e il pulsante centrale. Queste parti saranno bianche in entrambi i temi, mentre la metà superiore resterà rossa e contorni e fascia centrale manterranno il contrasto previsto dal design.

### Indicatori di sistema

Gli elementi "Sistema pronto" e il relativo pallino verde saranno rimossi dal markup di `StartScreen` e `Footer`, insieme agli stili non più utilizzati. Nel footer resteranno l'attribuzione a PokéAPI e gli altri contenuti già presenti.

Durante una partita, quando non è presente un annuncio più specifico, `GameStatus` mostrerà: "Partita in corso: trova tutte le coppie." Gli annunci di caricamento, coppia trovata, errore e vittoria continueranno ad avere priorità.

### Carte di gioco

Il fronte continuerà a mostrare numero Pokédex, sprite e nome. Fronte e retro avranno stati di visibilità espliciti collegati allo stato rivelato della carta, così il retro non potrà coprire lo sprite a causa delle differenze di rendering 3D tra browser. L'animazione di scoperta sarà mantenuta, così come gli stati matched, disabled e focus-visible.

### Caricamento

Il caricamento della griglia sarà rappresentato da un solo spinner accessibile, senza testo "Sincronizzazione" e senza scheletro delle carte. Lo spinner apparirà a ogni generazione del mazzo: primo avvio, riavvio, cambio configurazione e nuovo tentativo dopo un errore.

Ogni caricamento resterà nello stato visivo di attesa per almeno 1.000 ms dall'avvio. Il caricamento terminerà solo quando sono trascorsi sia il tempo minimo sia il tempo necessario a ottenere o recuperare le carte. Operazioni superate da un nuovo caricamento, restart o unmount non potranno aggiornare lo stato corrente.

Lo spinner sarà annunciato come stato di caricamento alle tecnologie assistive e rispetterà `prefers-reduced-motion`, sostituendo la rotazione con un indicatore statico quando il movimento è ridotto.

### Modale di vittoria

Il pulsante "Nuova scansione" diventerà "Nuova partita". Il riepilogo "Dettagli punteggio" avrà un chevron a destra; il chevron ruoterà quando il pannello è aperto e non sarà letto separatamente dagli screen reader. L'animazione sarà disabilitata con movimento ridotto.

## Flusso dati e concorrenza

`useGameLogic` resta il proprietario dello stato di caricamento. La generazione del mazzo attenderà in parallelo il recupero dei dati e il ritardo minimo, evitando di aggiungere stato duplicato nei componenti visuali. Il meccanismo esistente di identificazione delle richieste e pulizia di timeout/request impedirà che caricamenti obsoleti completino una partita più recente.

I componenti presentazionali continueranno a ricevere lo stato tramite props; non verranno introdotte chiamate di rete o timer nei componenti della griglia e della modale.

## Errori e accessibilità

- Gli errori PokéAPI continueranno a mostrare l'interfaccia di retry esistente dopo il tempo minimo di caricamento.
- Le carte resteranno pulsanti utilizzabili da tastiera, con etichette accessibili aggiornate allo stato.
- Lo spinner avrà `role="status"` e un nome accessibile non necessariamente visibile.
- Il controllo dei dettagli continuerà a usare gli elementi nativi `details` e `summary`.
- I touch target e gli stati `focus-visible` esistenti saranno preservati.

## Verifica

I test automatici copriranno:

- l'assenza dei due indicatori "Sistema pronto" rimossi;
- il nuovo messaggio predefinito durante la partita;
- la presenza dello sprite sul fronte rivelato e gli stati espliciti dei due lati;
- lo spinner al posto dello skeleton e della stringa "Sincronizzazione";
- il caricamento minimo di 1.000 ms anche con dati già disponibili;
- il completamento dopo più di 1.000 ms quando il recupero dati è più lento;
- il testo "Nuova partita" e l'indicatore espandibile dei dettagli punteggio.

Al termine saranno eseguiti test, `npm run lint` e `npm run build`. La verifica manuale comprenderà tema chiaro/scuro, desktop/mobile, tastiera, caricamento, errore, partita e modale di vittoria.

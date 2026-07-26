# Pokédex Control Center — specifica del redesign

## Obiettivo

Ricostruire da zero l'intero strato presentazionale di Flip & Match con una
direzione visiva Pokédex Control Center. Il redesign deve rendere immediatamente
comprensibili configurazione, partita e risultato, mantenendo integralmente la
logica e le funzionalità esistenti.

Il nuovo design non deve riutilizzare il linguaggio visivo corrente basato su
diario, spedizione, cartoline o taccuino. Deve invece usare una console digitale
ricca, robusta e riconoscibilmente Pokémon, con Poké Ball dall'aspetto classico.

## Ambito

### Funzionalità da preservare

- Difficoltà 2×2, 4×4 e 6×6.
- Mazzi Kanto, starter, evoluzioni, tipo Acqua e fallback locale.
- Anteprima configurabile.
- Modalità allenamento e curiosità sui Pokémon.
- Timer, mosse, minimo teorico, combo, record, punteggio e stelle.
- Profilo locale, statistiche e Pokémon scoperti.
- Tema chiaro, scuro e di sistema.
- Loading, errori di rete, retry e fallback offline.
- Conferma prima di lasciare una partita avviata.
- Risultato finale e possibilità di iniziare una nuova partita o tornare alla
  home.

### Fuori ambito

- Modifiche alle regole del memory game, al reducer o alla formula di punteggio.
- Nuove modalità, nuovi mazzi, autenticazione o backend.
- Nuove dipendenze UI, font remoti o librerie CSS.
- Loghi Pokémon ufficiali o falsi marchi ufficiali. Il prodotto conserva il
  nome Flip & Match.

## Architettura dell'esperienza

L'applicazione mantiene tre stati visivi distinti.

### Home — Centro di controllo

La home è una console di preparazione a due colonne su schermi ampi e a colonna
singola su mobile.

- L'area principale contiene identità del gioco, istruzione essenziale e CTA
  per avviare la sfida.
- La difficoltà è la scelta primaria ed è sempre esposta.
- Mazzo, durata dell'anteprima e modalità allenamento sono raggruppati in un
  modulo di parametri, visibile ma gerarchicamente secondario.
- Un riepilogo mostra chiaramente la configurazione che verrà avviata.
- I dati del profilo sono presentati come archivio Pokédex, senza competere con
  l'azione principale.

### Partita — Modalità scansione

La griglia è l'elemento dominante.

- Una toolbar compatta offre ritorno alla home, contesto del mazzo e restart.
- Una HUD stabile espone tempo, mosse, minimo teorico, combo e record.
- Le impostazioni di partita sono disponibili in un pannello richiudibile.
- Annunci, feedback, loading, errore e scheda allenamento occupano regioni
  dedicate e non causano spostamenti improvvisi della griglia.
- Il layout supporta tutte le difficoltà senza scorrimento orizzontale.

### Vittoria — Rapporto completato

Il risultato appare in una finestra modale simile a una registrazione Pokédex.

- Punteggio e stelle costituiscono il risultato principale.
- Tempo, mosse e combo massima formano il riepilogo secondario.
- I Pokémon scoperti sono mostrati come una raccolta visiva.
- Formula e soglie sono raccolte in dettagli secondari richiudibili.
- Le azioni finali sono “Nuova partita” e “Torna alla home”.

## Sistema visivo

### Colore e superfici

- Rosso Pokédex per la struttura principale della console.
- Bianco freddo e grafite per pannelli e aree dati.
- Nero per bordi, separatori e costruzione delle Poké Ball.
- Giallo Pokémon per azioni primarie e risultati positivi.
- Blu elettrico per indicatori, focus e dati attivi.
- Il tema scuro usa superfici grafite e illuminazione blu/rossa senza limitarsi a
  invertire i colori del tema chiaro.

I colori sono esposti come token CSS semantici e consumati localmente dai
componenti. Non sono ammessi selettori globali che forzino lo stile di tutti i
discendenti.

### Forme e dettagli

- Le Poké Ball hanno l'aspetto classico: emisfero rosso, emisfero bianco,
  fascia centrale nera e pulsante circolare centrale.
- Le Poké Ball sono costruite con CSS o SVG locale originale, senza dipendenze
  remote.
- I pannelli usano angoli tagliati o smussati, cornici tecniche, spie luminose e
  griglie decorative leggere.
- I dettagli decorativi non devono ridurre contrasto, leggibilità o spazio utile.

### Tipografia e movimento

- I titoli sono compatti ed energici.
- Dati numerici, timer e record usano una pila di font monospaziati di sistema.
- Testi descrittivi usano una pila sans-serif di sistema leggibile.
- Le animazioni sono brevi e legate a proprietà specifiche; non è ammesso
  `transition: all`.
- Con `prefers-reduced-motion: reduce` flip, pulsazioni e transizioni non
  essenziali vengono eliminate.

## Carte

- Il dorso mostra una Poké Ball classica, chiaramente riconoscibile.
- Il fronte usa un pannello chiaro con sprite centrale, nome e numero del
  Pokémon quando disponibili.
- Una carta abbinata comunica lo stato con colore, simbolo e testo; il colore da
  solo non è sufficiente.
- Match e mismatch hanno feedback visivi e testuali distinti.
- Le carte restano elementi `button`, utilizzabili da tastiera e touch, con nome
  accessibile e stato annunciato.
- Il touch target minimo è 44×44 px.

## Componenti e flusso dati

L'architettura Atomic Design e il flusso dati esistenti restano invariati:

- `App` possiede tema, profilo, mosse e passaggio home/partita.
- `GameBoard` collega la presentazione a `useGameLogic`.
- `useGameLogic`, reducer, servizi e utility mantengono la logica di dominio.
- I componenti visuali ricevono dati e inviano eventi tramite callback.

Lo strato presentazionale viene ricostruito con responsabilità esplicite:

- un atomo Poké Ball riutilizzabile;
- controlli con varianti primaria, secondaria, tecnica e pericolo;
- moduli separati per difficoltà, mazzo e parametri;
- HUD della partita;
- archivio del profilo;
- pannelli dedicati per loading, errore, training e risultato;
- header e footer compatti, coerenti con la console.

Non deve essere duplicato stato tra componenti. I valori derivati continuano a
essere calcolati a partire dalle sorgenti esistenti.

## Stati asincroni ed errori

- Il loading mantiene l'ingombro della griglia con skeleton a forma di carta.
- L'errore è presentato come anomalia di collegamento con azioni esplicite
  “Riprova” e “Usa mazzo offline”.
- La scheda allenamento è non bloccante e richiudibile.
- Gli annunci dinamici usano regioni `aria-live` appropriate.
- Nessun errore è affidato soltanto alla console del browser.

## Accessibilità

- Tutti i controlli sono elementi semantici e funzionano da tastiera.
- Ogni controllo presenta uno stato `:focus-visible` ad alto contrasto.
- Selettori e toggle comunicano lo stato con `aria-pressed` o controlli nativi.
- Le finestre modali conservano `role="dialog"`, `aria-modal`, etichetta,
  focus iniziale, focus trap, chiusura con Escape e ripristino del focus.
- Le immagini informative hanno alt descrittivo; quelle decorative usano
  `alt=""` o sono nascoste alle tecnologie assistive.
- Layout e contrasto devono funzionare in entrambi i temi e fino alle dimensioni
  dei telefoni compatti.

## Responsive

- Desktop: home a due colonne; area gioco centrata con HUD compatta attorno alla
  griglia.
- Tablet: moduli configurazione impilabili e HUD adattiva su più righe.
- Mobile: singola colonna, azioni principali sempre raggiungibili, nessuno
  scorrimento orizzontale.
- Le griglie usano `minmax`, `clamp` e `aspect-ratio`; non dipendono da offset
  assoluti fragili.
- La 6×6 privilegia l'area dello sprite e riduce progressivamente i dettagli
  testuali visivi, preservando sempre il nome accessibile della carta.

## Criteri di verifica

### Automatici

- Aggiornare prima i test dei componenti la cui struttura o nomenclatura cambia.
- Verificare il flusso home → gioco e le azioni di configurazione.
- Verificare toolbar, HUD, griglia, feedback, modale e profilo.
- Mantenere verdi i test della logica esistente.
- Eseguire `npm run lint`, `npm test` e `npm run build`.

### Manuali

- Desktop, tablet e mobile con griglie 2×2, 4×4 e 6×6.
- Navigazione completa con tastiera e focus visibile.
- Tema chiaro, scuro e di sistema.
- Preferenza di movimento ridotto.
- Stati loading, errore, retry, fallback offline, training e vittoria.
- Assenza di regressioni funzionali rispetto alla versione corrente.

## Criterio di completamento

Il redesign è completo quando l'intero linguaggio visuale precedente è stato
rimosso, tutte le funzionalità elencate sono disponibili nella nuova console,
la gerarchia dei tre stati è chiara su desktop e mobile e lint, test e build
terminano con successo.

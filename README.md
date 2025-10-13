🧩 Memory Game in React
🎯 Obiettivo

Creare un gioco di memory interattivo sviluppato con React, in cui l’utente deve accoppiare le carte identiche.

⚙️ Funzionalità principali

Immagini dinamiche → le carte vengono caricate in modo dinamico tramite una chiamata API (Pokémon API).

Dimensione della griglia → l’utente può scegliere tra 4x4, 6x6.

Contatore mosse → registra il numero di tentativi effettuati.

Pulsante Restart → consente di ricominciare la partita in qualsiasi momento.

Tema Dark/Light → possibilità di passare dalla modalità scura a quella chiara tramite un toggle (sole/luna).

🏗️ Struttura del progetto

App.js → gestisce lo stato globale (tema e dimensione griglia).

GameBoard.js → logica principale del gioco, gestione stato e popolamento griglia tramite API Pokémon.

GameGrid.jsx → renderizza la griglia di carte.

Header.js → contiene il titolo e il toggle per il tema.

🔑 Logica di gioco

All’avvio, le immagini vengono scaricate dall’API.

Le immagini vengono duplicate e mescolate casualmente.

L’utente seleziona due carte:

se coincidono, rimangono scoperte;

altrimenti si rigirano automaticamente.

La partita termina quando tutte le coppie sono state trovate.

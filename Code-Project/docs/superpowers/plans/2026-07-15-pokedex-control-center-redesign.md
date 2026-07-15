# Pokédex Control Center Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ricostruire l'intero strato presentazionale di Flip & Match come un Pokédex Control Center robusto, responsive e accessibile, preservando tutta la logica e le funzionalità esistenti.

**Architecture:** `App` continua a possedere stato trasversale e navigazione, mentre `GameBoard` continua a consumare `useGameLogic`; reducer, hook, servizi, configurazione e utility non cambiano. Il lavoro sostituisce markup e CSS dei componenti visuali esistenti e introduce soltanto un nuovo atomo decorativo `PokeBall`, mantenendo componenti piccoli e interfacce a props esplicite.

**Tech Stack:** React 19, JavaScript JSX, CSS vanilla per componente, Vitest, React Testing Library, Vite.

## Global Constraints

- Conservare difficoltà, mazzi, anteprima, allenamento, timer, mosse, combo, record, punteggio, profilo, temi, fallback offline e vittoria.
- Non modificare regole, reducer, formula di punteggio o servizi di dominio.
- Non aggiungere dipendenze, font remoti, librerie CSS o loghi ufficiali.
- Usare una Poké Ball classica con calotta rossa, parte inferiore bianca, fascia nera e pulsante centrale.
- Eliminare ogni riferimento visivo e testuale a diario, spedizione, cartolina e taccuino.
- Mantenere Atomic Design, CSS locale per componente, target touch 44×44 px, focus visibile e `prefers-reduced-motion`.
- Preservare le modifiche utente già presenti e committare soltanto i file elencati nel task corrente.

## File Structure

- Create: `src/components/atoms/PokeBall/PokeBall.jsx` — geometria decorativa riutilizzabile della Poké Ball.
- Create: `src/components/atoms/PokeBall/PokeBall.css` — costruzione fedele tramite CSS.
- Create: `src/components/atoms/PokeBall/PokeBall.test.jsx` — contratto accessibile/decorativo dell'atomo.
- Modify: `src/index.css`, `src/App.jsx`, `src/App.css` — token, sfondo globale e shell dell'app.
- Modify: tutti i file JSX/CSS/test sotto `components/organisms/Header`, `Footer`, `ProfilePanel` — chrome globale e archivio.
- Modify: `components/templates/StartScreen` e `components/molecule/GridControls` — centro di configurazione.
- Modify: `components/templates/GameBoard`, `GameToolbar`, `GameStats`, `GameStatus`, `TrainingInfo`, `GameError`, `GameSkeleton` — console di partita e stati.
- Modify: `components/organisms/GameGrid` — carte e griglia.
- Modify: `components/molecule/VictoryModal`, `ConfirmHomeDialog`, `Button` — azioni e dialoghi.
- Modify: `src/App.test.jsx` e test dei componenti interessati — contratti di comportamento e accessibilità.
- Modify: `README.md`, `docs/IDEA-E-MIGLIORAMENTI.md` — direzione visuale e stato dell'attività.

---

### Task 1: Fondazioni visive e atomo Poké Ball

**Files:**
- Create: `src/components/atoms/PokeBall/PokeBall.jsx`
- Create: `src/components/atoms/PokeBall/PokeBall.css`
- Create: `src/components/atoms/PokeBall/PokeBall.test.jsx`
- Modify: `src/components/atoms/Button/Button.jsx`
- Modify: `src/components/atoms/Button/Button.css`
- Modify: `src/index.css`
- Modify: `src/App.css`

**Interfaces:**
- Produces: `PokeBall({ size = "medium", label = "" })`; `label=""` rende il simbolo decorativo con `aria-hidden="true"`, un label non vuoto produce `role="img"` e `aria-label`.
- Produces: `Button` continua ad accettare tutte le props native e `className`, aggiungendo classi base senza cambiare i consumer.

- [ ] **Step 1: Scrivere il test fallente dell'atomo**

```jsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import PokeBall from "./PokeBall";

describe("PokeBall", () => {
  it("rimane decorativa quando non riceve un'etichetta", () => {
    const { container } = render(<PokeBall />);
    expect(container.firstChild).toHaveAttribute("aria-hidden", "true");
  });

  it("può rappresentare un'immagine accessibile", () => {
    render(<PokeBall label="Poké Ball" size="large" />);
    expect(screen.getByRole("img", { name: "Poké Ball" })).toHaveClass(
      "poke-ball--large",
    );
  });
});
```

- [ ] **Step 2: Verificare che il test fallisca**

Run: `npm test -- src/components/atoms/PokeBall/PokeBall.test.jsx`

Expected: FAIL perché `./PokeBall` non esiste.

- [ ] **Step 3: Implementare l'atomo**

```jsx
import "./PokeBall.css";

function PokeBall({ size = "medium", label = "" }) {
  const accessibilityProps = label
    ? { role: "img", "aria-label": label }
    : { "aria-hidden": "true" };

  return (
    <span
      className={`poke-ball poke-ball--${size}`}
      {...accessibilityProps}
    >
      <span className="poke-ball__button" />
    </span>
  );
}

export default PokeBall;
```

In `PokeBall.css` costruire il cerchio con `linear-gradient(to bottom, var(--poke-red) 0 44%, var(--ink) 44% 56%, var(--surface) 56% 100%)`, bordo nero, proporzioni `1 / 1` e pulsante centrale bianco con doppio anello nero. Definire dimensioni `small`, `medium`, `large` tramite `clamp()`.

- [ ] **Step 4: Sostituire le fondazioni CSS**

In `src/index.css` definire almeno questi token per `body.light` e `body.dark`:

```css
:root {
  font-family: Inter, ui-sans-serif, system-ui, sans-serif;
  font-synthesis: none;
  --poke-red: #e3352f;
  --poke-red-dark: #a81820;
  --poke-yellow: #ffcb05;
  --poke-blue: #2f6eb5;
  --signal-cyan: #31c8f2;
  --ink: #15171c;
  --success: #198754;
  --danger: #c62828;
}

body.light {
  --page-bg: #eef3f7;
  --surface: #ffffff;
  --surface-raised: #f7fafc;
  --text: #17191f;
  --text-muted: #596372;
  --border: #17191f;
}

body.dark {
  --page-bg: #10141b;
  --surface: #202630;
  --surface-raised: #29313d;
  --text: #f8fafc;
  --text-muted: #bac4d0;
  --border: #080a0d;
}
```

Rimuovere tutti i selettori e token legati al diario. In `App.css` creare una shell a colonna con `min-height: 100dvh`, sfondo tecnico a gradienti discreti e contenuto fluido. In `Button.css` definire varianti tramite classi consumer, focus blu/giallo ad alto contrasto, altezza minima 44 px e transizioni limitate a `transform`, `background-color`, `border-color`, `box-shadow`.

- [ ] **Step 5: Verificare test e lint mirato**

Run: `npm test -- src/components/atoms/PokeBall/PokeBall.test.jsx && npm run lint`

Expected: test PASS e lint senza errori.

- [ ] **Step 6: Commit**

```bash
git add src/components/atoms/PokeBall src/components/atoms/Button src/index.css src/App.css
git commit -m "style: establish pokedex visual foundations"
```

---

### Task 2: Shell globale, header, footer e archivio profilo

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/App.test.jsx`
- Modify: `src/components/organisms/Header/Header.jsx`
- Modify: `src/components/organisms/Header/Header.css`
- Modify: `src/components/organisms/Header/Header.test.jsx`
- Modify: `src/components/organisms/Footer/Footer.jsx`
- Modify: `src/components/organisms/Footer/Footer.css`
- Modify: `src/components/organisms/Footer/Footer.test.jsx`
- Modify: `src/components/organisms/ProfilePanel/ProfilePanel.jsx`
- Modify: `src/components/organisms/ProfilePanel/ProfilePanel.css`
- Modify: `src/components/organisms/ProfilePanel/ProfilePanel.test.jsx`

**Interfaces:**
- Consumes: `PokeBall` dal Task 1.
- Preserves: props pubbliche esistenti di `Header`, `Footer` e `ProfilePanel`.
- Produces: landmarks header/footer, pulsante profilo con `aria-expanded`, selettore tema e archivio profilo richiudibile dalla stessa callback di `App`.

- [ ] **Step 1: Aggiornare i test del contratto globale**

In `Header.test.jsx` verificare:

```jsx
expect(screen.getByRole("banner")).toBeInTheDocument();
expect(screen.getByText("Flip & Match")).toBeInTheDocument();
expect(screen.getByRole("button", { name: /archivio allenatore/i }))
  .toHaveAttribute("aria-expanded", "false");
expect(screen.getByRole("combobox", { name: /tema interfaccia/i }))
  .toBeInTheDocument();
```

In `ProfilePanel.test.jsx` verificare titolo “Archivio Allenatore”, privacy locale, accuratezza, scoperte e callback di reset. In `Footer.test.jsx` verificare il landmark `contentinfo` e il testo “Dati Pokémon forniti da PokéAPI”. In `App.test.jsx` verificare che il toggle apra `complementary` con nome “Archivio Allenatore”.

- [ ] **Step 2: Verificare che i test falliscano con la nomenclatura precedente**

Run: `npm test -- src/App.test.jsx src/components/organisms/Header/Header.test.jsx src/components/organisms/Footer/Footer.test.jsx src/components/organisms/ProfilePanel/ProfilePanel.test.jsx`

Expected: FAIL sui nuovi nomi accessibili e contenuti.

- [ ] **Step 3: Ricostruire header e footer**

Il nuovo `Header` usa `<PokeBall size="small" />`, un blocco marchio “Flip & Match / Pokédex Memory System”, indicatori decorativi, pulsante “Archivio Allenatore” e select con label “Tema interfaccia”. Quando la partita è attiva il marchio resta un button con `aria-label="Torna al centro di controllo"`.

Il footer usa markup compatto:

```jsx
<footer className="system-footer">
  <p><span aria-hidden="true" className="system-footer__status" /> Sistema pronto</p>
  <p>Dati Pokémon forniti da PokéAPI</p>
  <nav aria-label="Collegamenti sociali">{/* link esistenti */}</nav>
</footer>
```

- [ ] **Step 4: Ricostruire il profilo come archivio**

Mantenere il calcolo dell'accuratezza e `handleReset`, cambiando la composizione in:

```jsx
<aside className="trainer-archive" aria-labelledby="trainer-archive-title">
  <header className="trainer-archive__header">
    <p>Database locale</p>
    <h2 id="trainer-archive-title">Archivio Allenatore</h2>
  </header>
  <dl className="trainer-archive__metrics">{/* quattro coppie dt/dd */}</dl>
  <section aria-labelledby="discoveries-title">{/* elenco scoperte */}</section>
  <Button className="trainer-archive__reset" onClick={handleReset}>
    Azzera archivio
  </Button>
</aside>
```

In `App.jsx` aggiungere una classe modificatore `App--game-active` e racchiudere il profilo in una regione coerente senza cambiare gli state handler.

- [ ] **Step 5: Scrivere CSS responsive e accessibile**

Header rosso con fascia inferiore nera, spie blu/gialle e altezza compatta; archivio come pannello sovrapposto ancorato sotto l'header su desktop e nel flusso su mobile; footer grafite nel normale flusso. Aggiungere breakpoint a `48rem` e nessun `position: fixed` che copra il contenuto.

- [ ] **Step 6: Verificare e committare**

Run: `npm test -- src/App.test.jsx src/components/organisms/Header/Header.test.jsx src/components/organisms/Footer/Footer.test.jsx src/components/organisms/ProfilePanel/ProfilePanel.test.jsx && npm run lint`

Expected: PASS.

```bash
git add src/App.jsx src/App.test.jsx src/components/organisms/Header src/components/organisms/Footer src/components/organisms/ProfilePanel
git commit -m "style: rebuild global pokedex shell"
```

---

### Task 3: Home e console di configurazione

**Files:**
- Modify: `src/components/templates/StartScreen/StartScreen.jsx`
- Modify: `src/components/templates/StartScreen/StartScreen.css`
- Modify: `src/components/templates/StartScreen/StartScreen.test.jsx`
- Modify: `src/components/molecule/GridControls/GridControls.jsx`
- Modify: `src/components/molecule/GridControls/GridControls.css`
- Modify: `src/components/molecule/GridControls/GridControls.test.jsx`

**Interfaces:**
- Consumes: `PokeBall`, `Button`, `GAME_CONFIG`, `DECK_CATALOG`, `isDeckCompatible`.
- Preserves: tutte le props e callback correnti di `StartScreen` e `GridControls`.
- Produces: configurazione primaria sempre visibile e parametri secondari in un pannello semanticamente raggruppato.

- [ ] **Step 1: Scrivere i test fallenti della nuova gerarchia**

In `StartScreen.test.jsx` verificare:

```jsx
expect(screen.getByRole("heading", { name: /centro di controllo/i }))
  .toBeInTheDocument();
expect(screen.getByRole("button", { name: /avvia sfida/i }))
  .toBeInTheDocument();
expect(screen.getByRole("region", { name: /configurazione sfida/i }))
  .toBeInTheDocument();
expect(screen.getByText(/sistema memory pokémon/i)).toBeInTheDocument();
```

In `GridControls.test.jsx` mantenere i test delle callback e aggiungere la presenza di `fieldset` nominati “Livello memoria” e “Parametri di scansione”. Verificare `aria-pressed` su difficoltà e allenamento e compatibilità mazzi.

- [ ] **Step 2: Eseguire i test e osservare il fallimento**

Run: `npm test -- src/components/templates/StartScreen/StartScreen.test.jsx src/components/molecule/GridControls/GridControls.test.jsx`

Expected: FAIL su titoli, regioni e fieldset nuovi.

- [ ] **Step 3: Ricostruire `GridControls`**

Usare due `fieldset`:

```jsx
<div className="challenge-controls">
  <fieldset className="challenge-controls__difficulty">
    <legend>Livello memoria</legend>
    <div className="challenge-controls__difficulty-grid">
      {/* button 2×2, 4×4, 6×6 con label secondaria numero di coppie */}
    </div>
  </fieldset>
  <fieldset className="challenge-controls__parameters">
    <legend>Parametri di scansione</legend>
    {/* select mazzo, select anteprima, toggle allenamento */}
  </fieldset>
</div>
```

Conservare esattamente le callback esistenti e la disabilitazione dei mazzi incompatibili.

- [ ] **Step 4: Ricostruire `StartScreen`**

Comporre un `main.control-center` con:

```jsx
<section className="control-center__hero" aria-labelledby="control-center-title">
  <p className="control-center__system-label">Sistema memory Pokémon</p>
  <h1 id="control-center-title">Centro di controllo</h1>
  <p>Sincronizza il tuo mazzo, calibra la memoria e trova ogni coppia.</p>
  <Button className="control-center__start" onClick={onStart}>Avvia sfida</Button>
</section>
<section className="control-center__setup" aria-labelledby="challenge-setup-title">
  <h2 id="challenge-setup-title">Configurazione sfida</h2>
  <GridControls {...controlledProps} />
</section>
<aside className="control-center__summary" aria-label="Riepilogo configurazione">
  {/* difficoltà, mazzo, anteprima, allenamento */}
</aside>
<section className="control-center__protocol" aria-labelledby="protocol-title">
  {/* tre passaggi: osserva, abbina, completa */}
</section>
```

Mostrare le metriche profilo in un piccolo pannello “Registro locale”, senza duplicare stato.

- [ ] **Step 5: Implementare il layout robusto**

Usare CSS Grid con hero e setup a due colonne, riepilogo a fascia inferiore, pannelli bordati e accenti Pokédex. A `max-width: 52rem` passare a colonna singola; a `max-width: 32rem` disporre le difficoltà in tre righe o griglia fluida. Nessun contenuto deve dipendere da altezze fisse.

- [ ] **Step 6: Verificare e committare**

Run: `npm test -- src/components/templates/StartScreen/StartScreen.test.jsx src/components/molecule/GridControls/GridControls.test.jsx && npm run lint`

Expected: PASS.

```bash
git add src/components/templates/StartScreen src/components/molecule/GridControls
git commit -m "style: rebuild challenge control center"
```

---

### Task 4: Shell della partita, HUD e stati operativi

**Files:**
- Modify: `src/components/templates/GameBoard/GameBoard.jsx`
- Modify: `src/components/templates/GameBoard/GameBoard.css`
- Modify: `src/components/molecule/GameToolbar/GameToolbar.jsx`
- Modify: `src/components/molecule/GameToolbar/GameToolbar.css`
- Modify: `src/components/molecule/GameToolbar/GameToolbar.test.jsx`
- Modify: `src/components/molecule/GameStats/GameStats.jsx`
- Modify: `src/components/molecule/GameStats/GameStats.css`
- Modify: `src/components/molecule/GameStats/GameStats.test.jsx`
- Modify: `src/components/molecule/GameStatus/GameStatus.jsx`
- Modify: `src/components/molecule/GameStatus/GameStatus.css`
- Modify: `src/components/molecule/TrainingInfo/TrainingInfo.jsx`
- Modify: `src/components/molecule/TrainingInfo/TrainingInfo.css`
- Modify: `src/components/molecule/GameError/GameError.jsx`
- Modify: `src/components/molecule/GameError/GameError.css`
- Modify: `src/components/organisms/GameSkeleton/GameSkeleton.jsx`
- Modify: `src/components/organisms/GameSkeleton/GameSkeleton.css`

**Interfaces:**
- Preserves: props pubbliche di tutti i componenti e output di `useGameLogic`.
- Produces: `main.scan-console`, toolbar, HUD `<dl>`, viewport stabile e pannello impostazioni nativo `<details>`.

- [ ] **Step 1: Aggiornare i test presentazionali**

Verificare che `GameToolbar` esponga pulsanti “Centro di controllo” e “Riavvia partita”; che `GameStats` renda una lista descrittiva nominata “Telemetria partita”; che `GameStatus` mantenga `aria-live`; che `GameError` esponga “Anomalia collegamento”, retry e fallback; che `TrainingInfo` sia una regione “Scheda Pokédex”; che `GameSkeleton` abbia status “Sincronizzazione Pokémon in corso”.

Test rappresentativo:

```jsx
render(<GameStats elapsedMs={61000} moves={4} minimumMoves={8} combo={2} bestRecord={null} />);
const telemetry = screen.getByRole("group", { name: /telemetria partita/i });
expect(within(telemetry).getByText("01:01")).toBeInTheDocument();
expect(within(telemetry).getByText("4")).toBeInTheDocument();
```

- [ ] **Step 2: Eseguire i test mirati e verificare i fallimenti**

Run: `npm test -- src/components/molecule/GameToolbar src/components/molecule/GameStats src/components/molecule/GameStatus src/components/molecule/TrainingInfo src/components/molecule/GameError src/components/organisms/GameSkeleton`

Expected: FAIL sulla nuova nomenclatura/semantica, senza errori della logica.

- [ ] **Step 3: Ricomporre `GameBoard`**

Sostituire i wrapper precedenti con:

```jsx
<main className="scan-console">
  <section className="scan-console__frame" aria-label="Console di gioco">
    <GameToolbar {...toolbarProps} />
    <GameStats {...statsProps} />
    <div className="scan-console__viewport">
      {/* loading, error o GameGrid */}
    </div>
    <div className="scan-console__feedback">
      <GameStatus {...statusProps} />
      {trainingInfo ? <TrainingInfo {...trainingProps} /> : null}
    </div>
    <details className="scan-console__settings">
      <summary>Parametri partita</summary>
      <GridControls {...settingsProps} />
    </details>
  </section>
  <VictoryModal {...modalProps} />
</main>
```

Non modificare destructuring o callback provenienti da `useGameLogic`.

- [ ] **Step 4: Ricostruire toolbar, HUD e pannelli di stato**

Usare `<dl aria-label="Telemetria partita">` con cinque metriche. Toolbar con contesto come badge centrale. `GameStatus` resta una regione live con modificatore match/mismatch. `TrainingInfo` usa header con ID Pokémon e pulsante “Chiudi scheda”. `GameError` usa icona Poké Ball disconnessa solo decorativa. Skeleton mantiene lo stesso numero di celle della griglia.

- [ ] **Step 5: Scrivere CSS della console**

Creare cornice rossa, bordo grafite, fascia indicatori e viewport interna neutra. La HUD usa `grid-template-columns: repeat(5, minmax(0, 1fr))`, passa a 3+2 su tablet e 2 colonne su telefoni. Il pannello feedback usa `min-block-size` per evitare layout shift. Il `<details>` usa un summary di almeno 44 px.

- [ ] **Step 6: Verificare e committare**

Run: `npm test -- src/components/templates/GameBoard src/components/molecule/GameToolbar src/components/molecule/GameStats src/components/molecule/GameStatus src/components/molecule/TrainingInfo src/components/molecule/GameError src/components/organisms/GameSkeleton && npm run lint`

Expected: PASS.

```bash
git add src/components/templates/GameBoard src/components/molecule/GameToolbar src/components/molecule/GameStats src/components/molecule/GameStatus src/components/molecule/TrainingInfo src/components/molecule/GameError src/components/organisms/GameSkeleton
git commit -m "style: build pokedex game console"
```

---

### Task 5: Griglia e carte Poké Ball

**Files:**
- Modify: `src/components/organisms/GameGrid/GameGrid.jsx`
- Modify: `src/components/organisms/GameGrid/GameGrid.css`
- Modify: `src/components/organisms/GameGrid/GameGrid.test.jsx`

**Interfaces:**
- Preserves: `GameGrid({ cards, onFlip, gridSize, isInputLocked, feedback, feedbackCardIds })`.
- Consumes: forma card `{ id, pairId, name, image, flipped, matched }`.
- Produces: button card con dorso Poké Ball, fronte con sprite/nome/numero e stamp stato.

- [ ] **Step 1: Scrivere i test fallenti delle nuove carte**

Estendere `GameGrid.test.jsx`:

```jsx
const cardButton = screen.getByRole("button", { name: /carta 1 di 4: scoperta, bulbasaur/i });
expect(cardButton).toHaveAttribute("aria-pressed", "true");
expect(within(cardButton).getByText("Bulbasaur")).toBeInTheDocument();
expect(within(cardButton).getByText("#001")).toBeInTheDocument();
```

Aggiungere un test che una carta coperta non esponga nome/numero visivo alle tecnologie assistive e un test che la carta matched mostri testo “Registrato”.

- [ ] **Step 2: Verificare il fallimento**

Run: `npm test -- src/components/organisms/GameGrid/GameGrid.test.jsx`

Expected: FAIL perché nome, numero e stato “Registrato” non esistono.

- [ ] **Step 3: Aggiornare il markup mantenendo il contratto accessibile**

Dentro `card-front` aggiungere:

```jsx
<span className="memory-card__index">#{String(card.pairId).padStart(3, "0")}</span>
<img src={card.image} alt={isRevealed ? `${card.name}, Pokémon registrato` : ""} />
<span className="memory-card__name">{card.name}</span>
```

Il dorso deve contenere la geometria completa della Poké Ball tramite elementi CSS e `aria-hidden="true"`. Renderizzare `<span className="memory-card__matched">Registrato</span>` soltanto per carte abbinate. Conservare `getCardLabel`, click guard, disabled e `aria-pressed`.

- [ ] **Step 4: Ricostruire completamente il CSS della griglia**

Usare namespace `.memory-grid` e `.memory-card`; griglia fluida basata sulle classi difficoltà. Ogni carta usa `aspect-ratio: 3 / 4`, `transform-style: preserve-3d` e facce con `backface-visibility: hidden`. Il dorso presenta calotte rosso/bianco, fascia nera e bottone centrale; il fronte ha pannello chiaro e sprite con `object-fit: contain`. Per 6×6 ridurre/nascondere visivamente indice e nome sotto `40rem`, senza rimuovere l'etichetta accessibile.

Match usa bordo verde + check/testo; mismatch usa bordo rosso + testo live esterno. Aggiungere `:focus-visible`, `:disabled` leggibile e media query reduced motion che rimuove flip animato.

- [ ] **Step 5: Verificare test e regressioni del game hook**

Run: `npm test -- src/components/organisms/GameGrid/GameGrid.test.jsx src/hooks/useGameLogic.test.jsx`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/organisms/GameGrid
git commit -m "style: create classic pokeball memory cards"
```

---

### Task 6: Dialoghi Pokédex e risultato finale

**Files:**
- Modify: `src/components/molecule/VictoryModal/VictoryModal.jsx`
- Modify: `src/components/molecule/VictoryModal/VictoryModal.css`
- Modify: `src/components/molecule/VictoryModal/VictoryModal.test.jsx`
- Modify: `src/components/molecule/ConfirmHomeDialog/ConfirmHomeDialog.jsx`
- Modify: `src/components/molecule/ConfirmHomeDialog/ConfirmHomeDialog.css`
- Modify: `src/components/molecule/ConfirmHomeDialog/ConfirmHomeDialog.test.jsx`

**Interfaces:**
- Preserves: tutte le props, callback, focus trap, Escape, backdrop close e ripristino focus esistenti.
- Produces: rapporto registrazione Pokédex e conferma uscita coerente con la console.

- [ ] **Step 1: Aggiornare i test dei dialoghi**

Per `VictoryModal` verificare titolo “Scansione completata”, testo punteggio, stelle, telemetria, regione “Pokémon registrati”, `<details>` “Dettagli punteggio”, pulsanti “Nuova scansione” e “Centro di controllo”. Conservare test Escape, backdrop, focus iniziale e focus trap.

Per `ConfirmHomeDialog` verificare titolo “Interrompere la scansione?”, azioni “Continua partita” e “Esci al centro”, oltre ai test focus/Escape.

- [ ] **Step 2: Verificare i fallimenti testuali**

Run: `npm test -- src/components/molecule/VictoryModal/VictoryModal.test.jsx src/components/molecule/ConfirmHomeDialog/ConfirmHomeDialog.test.jsx`

Expected: FAIL sui nuovi nomi, mentre i test di focus continuano a descrivere il comportamento richiesto.

- [ ] **Step 3: Ricomporre la vittoria senza toccare la logica focus**

Usare questa gerarchia dentro il dialog esistente:

```jsx
<header className="scan-result__header">
  <PokeBall size="medium" />
  <p>Registrazione completata</p>
  <h2 id="victory-title">Scansione completata</h2>
</header>
<section className="scan-result__score" aria-label="Valutazione finale">{/* score e stelle */}</section>
<section className="scan-result__pokemon" aria-label="Pokémon registrati">{/* sprite */}</section>
<dl className="scan-result__telemetry">{/* tempo, mosse, combo */}</dl>
<details className="scan-result__formula"><summary>Dettagli punteggio</summary>{/* formula e soglie */}</details>
<footer className="scan-result__actions">{/* due azioni */}</footer>
```

Il primo focus resta sul pulsante “Nuova scansione”.

- [ ] **Step 4: Ricomporre conferma uscita e CSS**

Mantenere overlay e logica del dialog; cambiare soltanto gerarchia/testi/classi. Entrambi i dialoghi usano pannello grafite/bianco dentro cornice rossa, bordo nero, barra indicatori e layout fluido con `max-block-size: calc(100dvh - 2rem); overflow-y: auto`. Su mobile le azioni diventano colonna. Reduced motion elimina entrata/scaling.

- [ ] **Step 5: Verificare e committare**

Run: `npm test -- src/components/molecule/VictoryModal/VictoryModal.test.jsx src/components/molecule/ConfirmHomeDialog/ConfirmHomeDialog.test.jsx && npm run lint`

Expected: PASS inclusi focus ed Escape.

```bash
git add src/components/molecule/VictoryModal src/components/molecule/ConfirmHomeDialog
git commit -m "style: redesign pokedex result dialogs"
```

---

### Task 7: Integrazione, documentazione e verifica completa

**Files:**
- Modify: `src/App.test.jsx`
- Modify: `README.md`
- Modify: `docs/IDEA-E-MIGLIORAMENTI.md`
- Modify only if required by failing presentation tests: files changed in Tasks 1–6.

**Interfaces:**
- Consumes: intero strato presentazionale dei Task 1–6.
- Produces: flusso integrato verificato e documentazione coerente.

- [ ] **Step 1: Aggiungere il test di integrazione del flusso principale**

In `App.test.jsx`, usando i mock di fetch/storage già presenti, verificare:

```jsx
expect(screen.getByRole("heading", { name: /centro di controllo/i })).toBeInTheDocument();
await user.click(screen.getByRole("button", { name: /avvia sfida/i }));
expect(await screen.findByRole("main")).toHaveClass("scan-console");
expect(screen.getByRole("group", { name: /telemetria partita/i })).toBeInTheDocument();
expect(screen.getByRole("grid", { name: /griglia di gioco/i })).toBeInTheDocument();
```

Se `GameGrid` oggi usa un `div`, aggiungere `role="grid"`; ogni card button riceve `role="gridcell"` solo se ciò non altera la semantica nativa del button, altrimenti racchiuderla in un elemento con ruolo `gridcell`.

- [ ] **Step 2: Eseguire prima il test di integrazione**

Run: `npm test -- src/App.test.jsx`

Expected: PASS; se fallisce, correggere solo markup/nomi presentazionali senza cambiare hook o reducer.

- [ ] **Step 3: Aggiornare la documentazione**

Sostituire in `README.md` la sezione “Direzione visuale” con una descrizione del Pokédex Control Center: console rossa/grafite, Poké Ball classiche, centro configurazione, HUD, archivio e report finale. In `docs/IDEA-E-MIGLIORAMENTI.md` annotare che il redesign precedente è superato dal documento `docs/superpowers/specs/2026-07-15-pokedex-control-center-redesign.md`, senza cancellare la cronologia dell'audit.

- [ ] **Step 4: Eseguire la suite completa**

Run: `npm test`

Expected: tutti i test PASS, nessun test skipped o unhandled rejection.

- [ ] **Step 5: Eseguire lint e build**

Run: `npm run lint && npm run build`

Expected: ESLint termina senza errori e Vite produce `dist/` con exit code 0.

- [ ] **Step 6: Verifica manuale mirata**

Avviare `npm run dev` e controllare a 1440×900, 768×1024 e 390×844:

- home e riepilogo configurazione;
- avvio 2×2, 4×4 e 6×6;
- tema chiaro/scuro/sistema;
- tastiera, focus e dialoghi;
- loading, errore, retry e fallback offline;
- training info e vittoria;
- `prefers-reduced-motion`.

Expected: nessuna sovrapposizione, nessuno scroll orizzontale, controlli almeno 44×44 px, griglia dominante e leggibile.

- [ ] **Step 7: Controllare diff e commit finale**

Run: `git diff --check && git status --short`

Expected: nessun errore whitespace; lo status mostra soltanto file del redesign oltre alle modifiche utente preesistenti già identificate.

```bash
git add README.md docs/IDEA-E-MIGLIORAMENTI.md src/App.test.jsx
git commit -m "docs: document pokedex control center"
```

Non includere `.dockerignore`, `AGENTS.md`, `Dockerfile`, `compose.yaml` o altri documenti non modificati intenzionalmente da questo piano.

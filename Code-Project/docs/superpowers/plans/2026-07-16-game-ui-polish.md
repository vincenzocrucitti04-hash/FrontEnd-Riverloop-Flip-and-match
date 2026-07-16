# Game UI Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Correggere Poké Ball, indicatori di stato, fronte delle carte, caricamento e controlli della modale mantenendo invariata la logica del gioco.

**Architecture:** Le correzioni visuali restano nei componenti proprietari e nei rispettivi CSS. `useGameLogic` resta l'unico proprietario del caricamento e coordina richiesta e attesa minima abortibile; il nuovo organismo `GameLoader` presenta soltanto lo stato ricevuto.

**Tech Stack:** React 19, JavaScript JSX, CSS vanilla per componente, Vitest, React Testing Library, Vite.

## Global Constraints

- Nessuna nuova dipendenza.
- Lo spinner appare a ogni generazione del mazzo e resta visibile per almeno 1.000 ms.
- Fronte scoperto: sprite Pokémon, numero Pokédex e nome; retro: Poké Ball.
- Copia di stato predefinita: `Partita in corso: trova tutte le coppie.`
- Copia del pulsante modale: `Nuova partita`.
- Preservare semantica, tastiera, `focus-visible`, touch target e `prefers-reduced-motion`.
- Non modificare o includere nei commit `.dockerignore`, `Dockerfile`, `compose.yaml` e `../.gitignore` già modificati dall'utente.

---

## File map

- `src/components/atoms/PokeBall/PokeBall.css`: colori invarianti della Poké Ball.
- `src/components/templates/StartScreen/StartScreen.jsx` e `.css`: rimozione stato pronto iniziale.
- `src/components/organisms/Footer/Footer.jsx` e `.css`: rimozione stato pronto dal footer.
- `src/components/molecule/GameStatus/GameStatus.css`: nuova copia predefinita.
- `src/components/organisms/GameGrid/GameGrid.jsx` e `.css`: stato esplicito di fronte e retro.
- `src/components/organisms/GameLoader/GameLoader.jsx` e `.css`: nuovo spinner accessibile.
- `src/components/templates/GameBoard/GameBoard.jsx`: sostituzione dello skeleton con il loader.
- `src/config/gameConfig.js`: durata minima centralizzata.
- `src/utils/gameLogic.js`: attesa abortibile riusabile.
- `src/hooks/useGameLogic.js`: coordinamento tra caricamento reale e durata minima.
- `src/components/molecule/VictoryModal/VictoryModal.jsx` e `.css`: nuova copia e chevron.
- `docs/IDEA-E-MIGLIORAMENTI.md`: aggiornamento del feedback di rete da skeleton a spinner.

### Task 1: Correggere Poké Ball e rimuovere gli indicatori “Sistema pronto”

**Files:**
- Modify: `src/components/atoms/PokeBall/PokeBall.css`
- Modify: `src/components/atoms/PokeBall/PokeBall.test.jsx`
- Modify: `src/components/templates/StartScreen/StartScreen.jsx`
- Modify: `src/components/templates/StartScreen/StartScreen.css`
- Modify: `src/components/templates/StartScreen/StartScreen.test.jsx`
- Modify: `src/components/organisms/Footer/Footer.jsx`
- Modify: `src/components/organisms/Footer/Footer.css`
- Modify: `src/components/organisms/Footer/Footer.test.jsx`

**Interfaces:**
- Consumes: token esistenti `--poke-red` e `--ink`.
- Produces: `PokeBall` con metà inferiore e centro `#ffffff` in ogni tema; markup senza indicatori pronti.

- [ ] **Step 1: Scrivere i test fallenti**

In `PokeBall.test.jsx`, leggere il CSS come già fanno gli altri test CSS e verificare che fondo e bottone non usino `var(--surface)`:

```jsx
const pokeBallStyles = readFileSync(
  resolve("src/components/atoms/PokeBall/PokeBall.css"),
  "utf8",
);

test("keeps its lower half and center white in every theme", () => {
  expect(pokeBallStyles).toMatch(/var\(--ink\) 44% 56%,\s*#ffffff 56% 100%/s);
  expect(pokeBallStyles).toMatch(
    /\.poke-ball__button\s*{[^}]*background:\s*#ffffff;/s,
  );
});
```

In `StartScreen.test.jsx` e `Footer.test.jsx`, aggiungere rispettivamente:

```jsx
expect(screen.queryByText("Sistema pronto")).not.toBeInTheDocument();
expect(container.querySelector(".control-center__scanner-status")).toBeNull();
```

```jsx
expect(screen.queryByText("Sistema pronto")).not.toBeInTheDocument();
expect(container.querySelector(".system-footer__status")).toBeNull();
```

- [ ] **Step 2: Eseguire i test mirati e verificare il fallimento**

Run:

```bash
npm test -- src/components/atoms/PokeBall/PokeBall.test.jsx src/components/templates/StartScreen/StartScreen.test.jsx src/components/organisms/Footer/Footer.test.jsx
```

Expected: FAIL perché il CSS usa `var(--surface)` e gli indicatori sono ancora renderizzati.

- [ ] **Step 3: Implementare la correzione minima**

In `PokeBall.css`, impostare `#ffffff` nella parte inferiore del gradiente, nel `background` e nel primo anello del `box-shadow` del bottone. Rimuovere da `StartScreen.jsx` lo span `.control-center__scanner-status` e da `Footer.jsx` l'intero paragrafo `.system-footer__ready`. Eliminare dai CSS le regole dei quattro selettori rimasti inutilizzati.

- [ ] **Step 4: Rieseguire i test mirati**

Run: il comando dello Step 2.

Expected: PASS per tutti i test indicati.

- [ ] **Step 5: Commit isolato**

```bash
git add src/components/atoms/PokeBall src/components/templates/StartScreen src/components/organisms/Footer
git commit -m "fix: polish control center status visuals"
```

### Task 2: Rendere affidabile il fronte delle carte e aggiornare lo stato di partita

**Files:**
- Modify: `src/components/molecule/GameStatus/GameStatus.css`
- Modify: `src/components/molecule/GameStatus/GameStatus.test.jsx`
- Modify: `src/components/organisms/GameGrid/GameGrid.jsx`
- Modify: `src/components/organisms/GameGrid/GameGrid.css`
- Modify: `src/components/organisms/GameGrid/GameGrid.test.jsx`

**Interfaces:**
- Consumes: `card.flipped`, `card.matched`, `card.image`, `card.pairId`, `card.name`.
- Produces: classi `memory-card__front--visible` e `memory-card__back--hidden` collegate a `isRevealed`.

- [ ] **Step 1: Scrivere i test fallenti per stato e livelli della carta**

In `GameStatus.test.jsx` aggiungere un test che legge il CSS:

```jsx
test("uses the in-progress message when no announcement is active", () => {
  const styles = readFileSync(
    resolve("src/components/molecule/GameStatus/GameStatus.css"),
    "utf8",
  );
  expect(styles).toContain(
    'content: "Partita in corso: trova tutte le coppie.";',
  );
});
```

In `GameGrid.test.jsx`, nel test di carta scoperta verificare:

```jsx
const image = screen.getByRole("img", { name: /Pikachu, Pokémon registrato/i });
expect(image).toHaveAttribute("src", "pikachu.png");
expect(image.closest(".memory-card__front")).toHaveClass(
  "memory-card__front--visible",
);
expect(container.querySelector(".memory-card__back")).toHaveClass(
  "memory-card__back--hidden",
);
```

- [ ] **Step 2: Eseguire i test mirati e verificare il fallimento**

Run:

```bash
npm test -- src/components/molecule/GameStatus/GameStatus.test.jsx src/components/organisms/GameGrid/GameGrid.test.jsx
```

Expected: FAIL sulla vecchia copia e sulle nuove classi mancanti.

- [ ] **Step 3: Implementare gli stati visuali espliciti**

In `GameGrid.jsx` comporre le classi dei lati:

```jsx
<span
  className={`memory-card__front ${isRevealed ? "memory-card__front--visible" : ""}`}
  aria-hidden={!isRevealed}
>
```

```jsx
<span
  className={`memory-card__back ${isRevealed ? "memory-card__back--hidden" : ""}`}
  aria-hidden="true"
>
```

In `GameGrid.css`, mantenere la rotazione ma aggiungere `opacity`, `visibility` e livelli espliciti:

```css
.memory-card__front {
  z-index: 1;
  opacity: 0;
  visibility: hidden;
}

.memory-card__back {
  z-index: 2;
  opacity: 1;
  visibility: visible;
}

.memory-card__front--visible {
  z-index: 2;
  opacity: 1;
  visibility: visible;
}

.memory-card__back--hidden {
  z-index: 1;
  opacity: 0;
  visibility: hidden;
}
```

Aggiornare il blocco reduced-motion affinché usi le stesse classi e sostituire in `GameStatus.css` la copia predefinita con quella definita nei vincoli globali.

- [ ] **Step 4: Rieseguire i test mirati**

Run: il comando dello Step 2.

Expected: PASS.

- [ ] **Step 5: Commit isolato**

```bash
git add src/components/molecule/GameStatus src/components/organisms/GameGrid
git commit -m "fix: reveal pokemon card artwork reliably"
```

### Task 3: Sostituire lo skeleton con uno spinner accessibile

**Files:**
- Create: `src/components/organisms/GameLoader/GameLoader.jsx`
- Create: `src/components/organisms/GameLoader/GameLoader.css`
- Create: `src/components/organisms/GameLoader/GameLoader.test.jsx`
- Delete: `src/components/organisms/GameSkeleton/GameSkeleton.jsx`
- Delete: `src/components/organisms/GameSkeleton/GameSkeleton.css`
- Delete: `src/components/organisms/GameSkeleton/GameSkeleton.test.jsx`
- Modify: `src/components/templates/GameBoard/GameBoard.jsx`
- Modify: `src/components/templates/GameBoard/GameBoard.test.jsx`

**Interfaces:**
- Consumes: booleano `loading` già restituito da `useGameLogic`.
- Produces: `GameLoader()` senza props, con `role="status"` e nome accessibile `Caricamento Pokémon in corso`.

- [ ] **Step 1: Scrivere il test fallente del nuovo loader**

Creare `GameLoader.test.jsx`:

```jsx
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import GameLoader from "./GameLoader";

test("renders one accessible spinner without synchronization copy", () => {
  const { container } = render(<GameLoader />);
  expect(screen.getByRole("status", { name: "Caricamento Pokémon in corso" })).toBeInTheDocument();
  expect(container.querySelectorAll(".game-loader__spinner")).toHaveLength(1);
  expect(screen.queryByText(/Sincronizzazione/i)).not.toBeInTheDocument();
});

test("stops rotating when reduced motion is requested", () => {
  const styles = readFileSync(
    resolve("src/components/organisms/GameLoader/GameLoader.css"),
    "utf8",
  );
  expect(styles).toMatch(
    /@media \(prefers-reduced-motion: reduce\)[\s\S]*\.game-loader__spinner[\s\S]*animation:\s*none;/,
  );
});
```

- [ ] **Step 2: Eseguire il test e verificare il fallimento**

Run: `npm test -- src/components/organisms/GameLoader/GameLoader.test.jsx`

Expected: FAIL perché il modulo non esiste.

- [ ] **Step 3: Creare il componente e collegarlo a GameBoard**

Creare `GameLoader.jsx`:

```jsx
import "./GameLoader.css";

function GameLoader() {
  return (
    <div className="game-loader" role="status" aria-label="Caricamento Pokémon in corso">
      <span className="game-loader__spinner" aria-hidden="true" />
    </div>
  );
}

export default GameLoader;
```

Creare CSS con un contenitore centrato che occupi lo spazio del viewport, uno spinner circolare con bordo neutro e segmento `var(--poke-red)`, animazione `transform: rotate(1turn)` e media query reduced-motion con `animation: none`. Aggiornare import/render di `GameBoard` da `GameSkeleton gridSize={gridSize}` a `GameLoader`. Eliminare la directory `GameSkeleton` e aggiornare in `GameBoard.test.jsx` ogni mock o attesa riferita allo skeleton.

- [ ] **Step 4: Eseguire i test del loader e del template**

Run:

```bash
npm test -- src/components/organisms/GameLoader/GameLoader.test.jsx src/components/templates/GameBoard/GameBoard.test.jsx
```

Expected: PASS e nessun riferimento a `GameSkeleton` o `Sincronizzazione`.

- [ ] **Step 5: Commit isolato**

```bash
git add src/components/organisms/GameLoader src/components/organisms/GameSkeleton src/components/templates/GameBoard
git commit -m "feat: show accessible game loading spinner"
```

### Task 4: Garantire un secondo minimo per ogni caricamento

**Files:**
- Modify: `src/config/gameConfig.js`
- Modify: `src/config/gameConfig.test.js`
- Modify: `src/utils/gameLogic.js`
- Modify: `src/utils/gameLogic.test.js`
- Modify: `src/hooks/useGameLogic.js`
- Modify: `src/hooks/useGameLogic.test.jsx`

**Interfaces:**
- Produces: `GAME_CONFIG.timings.minimumLoadingMs === 1000`.
- Produces: `waitForDelay(delayMs, signal) -> Promise<void>`, risolta dopo il ritardo o rigettata con `AbortError`.
- Consumes: `request.signal` e `request.isCurrent()` già prodotti da `createLatestRequestManager`.

- [ ] **Step 1: Scrivere i test fallenti di configurazione e attesa abortibile**

In `gameConfig.test.js` verificare:

```js
assert.equal(gameConfig.GAME_CONFIG.timings.minimumLoadingMs, 1000);
```

Aggiornare l'oggetto valido usato nel test negativo includendo `minimumLoadingMs: 1000` e la validazione per quattro durate.

In `gameLogic.test.js` aggiungere:

```js
test("waitForDelay resolves after the requested duration and aborts cleanly", async () => {
  vi.useFakeTimers();
  const controller = new AbortController();
  const completed = vi.fn();
  const waiting = gameLogic.waitForDelay(1000, controller.signal).then(completed);
  await vi.advanceTimersByTimeAsync(999);
  assert.equal(completed.mock.calls.length, 0);
  await vi.advanceTimersByTimeAsync(1);
  await waiting;
  assert.equal(completed.mock.calls.length, 1);

  const abortedController = new AbortController();
  const aborted = gameLogic.waitForDelay(1000, abortedController.signal);
  abortedController.abort();
  await assert.rejects(aborted, { name: "AbortError" });
  vi.useRealTimers();
});
```

- [ ] **Step 2: Scrivere il test fallente dell'hook**

In `useGameLogic.test.jsx`, con timer finti e API risolta immediatamente, verificare che `loading` resti `true` a 999 ms e diventi `false` a 1.000 ms. Aggiungere un secondo caso con una Promise controllata: dopo 1.000 ms `loading` resta `true`, poi diventa `false` solo quando la Promise dei Pokémon viene risolta.

- [ ] **Step 3: Eseguire i test mirati e verificare il fallimento**

Run:

```bash
npm test -- src/config/gameConfig.test.js src/utils/gameLogic.test.js src/hooks/useGameLogic.test.jsx
```

Expected: FAIL perché configurazione, utility e durata minima non esistono ancora.

- [ ] **Step 4: Implementare configurazione e utility abortibile**

Aggiungere `minimumLoadingMs: 1000` a `GAME_CONFIG.timings` e aggiornare la validazione da tre a quattro durate.

In `gameLogic.js` esportare:

```js
export function waitForDelay(delayMs, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("Aborted", "AbortError"));
      return;
    }

    const timeoutId = setTimeout(() => {
      signal?.removeEventListener("abort", handleAbort);
      resolve();
    }, delayMs);
    function handleAbort() {
      clearTimeout(timeoutId);
      reject(new DOMException("Aborted", "AbortError"));
    }
    signal?.addEventListener("abort", handleAbort, { once: true });
  });
}
```

- [ ] **Step 5: Coordinare dati e timer in useGameLogic**

Importare `waitForDelay`. In `generateCards`, trasformare il recupero in `responsesPromise`, catturare il risultato senza terminare anticipatamente sugli errori e attendere entrambi:

```js
const responsesPromise = deck.offline
  ? Promise.resolve(
      pokemonIds.map((id) =>
        getDeckPokemon(deckId).find((pokemon) => pokemon.id === id),
      ),
    )
  : Promise.all(
      pokemonIds.map((id) => fetchPokemon(id, { signal: request.signal })),
    );

const [loadResult] = await Promise.all([
  responsesPromise.then(
    (responses) => ({ responses, error: null }),
    (loadError) => ({ responses: null, error: loadError }),
  ),
  waitForDelay(GAME_CONFIG.timings.minimumLoadingMs, request.signal),
]);

if (loadResult.error) {
  throw loadResult.error;
}
```

Controllare `request.isCurrent()` prima di creare e distribuire il mazzo. L'abort del request manager cancellerà sia fetch sia attesa; il catch esistente ignorerà l'`AbortError`.

- [ ] **Step 6: Aggiornare i test esistenti che usano timer finti**

Prima di aspettarsi carte o preview, avanzare i timer di 1.000 ms con `await vi.advanceTimersByTimeAsync(1000)`. Conservare separata l'attesa di preview (`previewMs`) in modo che i test dimostrino entrambe le fasi.

- [ ] **Step 7: Rieseguire i test mirati**

Run: il comando dello Step 3.

Expected: PASS, incluse cache/offline, errori, retry, cambio opzioni e cleanup.

- [ ] **Step 8: Commit isolato**

```bash
git add src/config/gameConfig.js src/config/gameConfig.test.js src/utils/gameLogic.js src/utils/gameLogic.test.js src/hooks/useGameLogic.js src/hooks/useGameLogic.test.jsx
git commit -m "feat: enforce minimum game loading time"
```

### Task 5: Rifinire la modale di vittoria e aggiornare la documentazione

**Files:**
- Modify: `src/components/molecule/VictoryModal/VictoryModal.jsx`
- Modify: `src/components/molecule/VictoryModal/VictoryModal.css`
- Modify: `src/components/molecule/VictoryModal/VictoryModal.test.jsx`
- Modify: `docs/IDEA-E-MIGLIORAMENTI.md`

**Interfaces:**
- Produces: pulsante accessibile `Nuova partita`.
- Produces: span `.scan-result__formula-chevron` con `aria-hidden="true"` dentro `summary`.

- [ ] **Step 1: Scrivere il test fallente della modale**

Aggiornare l'attesa del pulsante e verificare il chevron:

```jsx
const closeButton = screen.getByRole("button", { name: "Nuova partita" });
const summary = screen.getByText("Dettagli punteggio").closest("summary");
expect(summary.querySelector(".scan-result__formula-chevron")).toHaveAttribute(
  "aria-hidden",
  "true",
);
```

- [ ] **Step 2: Eseguire il test e verificare il fallimento**

Run: `npm test -- src/components/molecule/VictoryModal/VictoryModal.test.jsx`

Expected: FAIL sulla vecchia copia e sul chevron mancante.

- [ ] **Step 3: Implementare copia e indicatore espandibile**

In `VictoryModal.jsx` usare:

```jsx
<summary>
  <span>Dettagli punteggio</span>
  <span className="scan-result__formula-chevron" aria-hidden="true">⌄</span>
</summary>
```

Cambiare il testo del bottone in `Nuova partita`. Nel CSS rimuovere il marker nativo, distribuire il summary con `justify-content: space-between`, ruotare il chevron in `.scan-result__formula[open]` e disabilitarne la transizione nella media query reduced-motion.

- [ ] **Step 4: Aggiornare la nota di progetto**

In `docs/IDEA-E-MIGLIORAMENTI.md`, sostituire la voce che promette lo skeleton con una formulazione coerente: `Stato di rete curato: spinner accessibile, errore con retry e fallback a immagini locali.`

- [ ] **Step 5: Rieseguire il test mirato**

Run: il comando dello Step 2.

Expected: PASS.

- [ ] **Step 6: Commit isolato**

```bash
git add src/components/molecule/VictoryModal docs/IDEA-E-MIGLIORAMENTI.md
git commit -m "fix: clarify victory modal controls"
```

### Task 6: Verifica integrata

**Files:**
- Verify only: intero progetto.

**Interfaces:**
- Consumes: tutti i deliverable dei Task 1-5.
- Produces: evidenza di test, lint e build riusciti.

- [ ] **Step 1: Verificare che non restino copie o componenti obsoleti**

Run:

```bash
rg -n "Sistema pronto|Sincronizzazione Pokémon|Nuova scansione|GameSkeleton" src
```

Expected: nessun risultato.

- [ ] **Step 2: Eseguire tutta la suite**

Run: `npm test`

Expected: tutti i test PASS.

- [ ] **Step 3: Eseguire lint**

Run: `npm run lint`

Expected: exit code 0, nessun errore ESLint.

- [ ] **Step 4: Eseguire build di produzione**

Run: `npm run build`

Expected: exit code 0 e bundle Vite creato in `dist/`.

- [ ] **Step 5: Controllare diff e worktree**

Run:

```bash
git diff --check -- src docs/IDEA-E-MIGLIORAMENTI.md
git status --short
```

Expected: nessun errore negli interventi; le sole modifiche non correlate residue sono i file Docker/ignore dell'utente.

- [ ] **Step 6: Verifica manuale**

Avviare `npm run dev` e controllare tema chiaro/scuro, viewport desktop/mobile, tastiera, caricamento iniziale, riavvio, cambio impostazioni, errore/retry, carte scoperte e modale di vittoria. Lo spinner deve durare almeno un secondo; ogni fronte scoperto deve mostrare sprite, ID e nome.

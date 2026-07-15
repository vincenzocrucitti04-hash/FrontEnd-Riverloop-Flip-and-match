const ERROR_MESSAGES = {
  offline:
    "Sembra che tu sia offline. Riprova quando la rete torna disponibile oppure usa il mazzo locale.",
  timeout:
    "Il caricamento sta impiegando troppo tempo. Puoi riprovare oppure usare il mazzo locale.",
  server:
    "PokeAPI non è disponibile al momento. Puoi riprovare oppure usare il mazzo locale.",
  network:
    "Non riusciamo a raggiungere PokeAPI. Controlla la connessione, riprova oppure usa il mazzo locale.",
};

export function classifyPokemonLoadError(error, isOnline = true) {
  let kind = "network";

  if (!isOnline) {
    kind = "offline";
  } else if (error?.code === "TIMEOUT") {
    kind = "timeout";
  } else if (error?.code === "HTTP_ERROR") {
    kind = "server";
  }

  return { kind, message: ERROR_MESSAGES[kind] };
}

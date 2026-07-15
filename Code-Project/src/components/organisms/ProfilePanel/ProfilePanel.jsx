import Button from "../../atoms/Button/Button";
import "./ProfilePanel.css";

function ProfilePanel({
  profile,
  onReset,
  confirmFn = (message) => window.confirm(message),
}) {
  const accuracy =
    profile.totalAttempts === 0
      ? 0
      : Math.round((profile.correctPairs / profile.totalAttempts) * 100);

  const handleReset = () => {
    if (
      confirmFn(
        "Vuoi azzerare statistiche, record e Pokémon scoperti in questo browser?",
      )
    ) {
      onReset();
    }
  };

  return (
    <aside
      className="trainer-archive"
      aria-labelledby="trainer-archive-title"
    >
      <header className="trainer-archive__header">
        <p>Database locale</p>
        <h2 id="trainer-archive-title">Archivio Allenatore</h2>
      </header>
      <p className="trainer-archive__privacy">
        Questi dati restano soltanto in questo browser.
      </p>
      <dl className="trainer-archive__metrics">
        <div>
          <dt>Partite concluse</dt>
          <dd>{profile.gamesCompleted}</dd>
        </div>
        <div>
          <dt>Accuratezza</dt>
          <dd>{accuracy}%</dd>
        </div>
        <div>
          <dt>Serie attuale</dt>
          <dd>{profile.currentWinStreak}</dd>
        </div>
        <div>
          <dt>Serie migliore</dt>
          <dd>{profile.bestWinStreak}</dd>
        </div>
      </dl>
      <p className="trainer-archive__formula">
        Accuratezza = coppie corrette ÷ tentativi.
      </p>
      <section
        className="trainer-archive__discoveries"
        aria-labelledby="discoveries-title"
      >
        <h3 id="discoveries-title">
          Pokémon scoperti: {profile.discoveredPokemon.length}
        </h3>
        {profile.discoveredPokemon.length > 0 ? (
          <ul>
            {profile.discoveredPokemon.map(({ id, name }) => (
              <li key={id}>{name}</li>
            ))}
          </ul>
        ) : (
          <p>Nessuno per ora.</p>
        )}
      </section>
      <Button
        type="button"
        className="trainer-archive__reset"
        onClick={handleReset}
      >
        Azzera archivio
      </Button>
    </aside>
  );
}

export default ProfilePanel;

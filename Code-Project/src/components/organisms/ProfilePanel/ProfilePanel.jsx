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
    <aside className="profile-panel" aria-labelledby="profile-title">
      <h2 id="profile-title">Profilo locale</h2>
      <p className="profile-panel__privacy">
        Questi dati restano soltanto in questo browser.
      </p>
      <div className="profile-panel__metrics">
        <p>Partite concluse: {profile.gamesCompleted}</p>
        <p>Accuratezza: {accuracy}%</p>
        <p>Serie attuale: {profile.currentWinStreak}</p>
        <p>Serie migliore: {profile.bestWinStreak}</p>
      </div>
      <p className="profile-panel__formula">
        Accuratezza = coppie corrette ÷ tentativi.
      </p>
      <div>
        <h3>Pokémon scoperti: {profile.discoveredPokemon.length}</h3>
        <p>
          {profile.discoveredPokemon.length > 0
            ? profile.discoveredPokemon.map(({ name }) => name).join(", ")
            : "Nessuno per ora."}
        </p>
      </div>
      <Button
        type="button"
        className="profile-panel__reset"
        onClick={handleReset}
      >
        Azzera statistiche
      </Button>
    </aside>
  );
}

export default ProfilePanel;

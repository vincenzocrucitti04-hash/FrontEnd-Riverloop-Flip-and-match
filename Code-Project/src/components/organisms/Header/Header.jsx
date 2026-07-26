import PokeBall from "../../atoms/PokeBall/PokeBall";
import "./Header.css";

function Header({
  theme,
  onThemeChange,
  isGameActive = false,
  onHome = () => {},
  profileOpen = false,
  onProfileToggle = () => {},
}) {
  return (
    <header className="system-header">
      <div className="system-header__content">
        {isGameActive ? (
          <button
            type="button"
            className="system-header__brand system-header__brand--button"
            onClick={onHome}
            aria-label="Torna al centro di controllo"
          >
            <PokeBall size="small" />
            <span className="system-header__brand-copy">
              <strong>Flip &amp; Match</strong>
              <span>Pokédex Memory System</span>
            </span>
          </button>
        ) : (
          <div className="system-header__brand">
            <PokeBall size="small" />
            <span className="system-header__brand-copy">
              <strong>Flip &amp; Match</strong>
              <span>Pokédex Memory System</span>
            </span>
          </div>
        )}

        <div className="system-header__indicators" aria-hidden="true">
          <span className="system-header__indicator system-header__indicator--blue" />
          <span className="system-header__indicator system-header__indicator--yellow" />
        </div>

        <div className="system-header__controls">
          <button
            type="button"
            className="system-header__archive-toggle"
            onClick={onProfileToggle}
            aria-expanded={profileOpen}
          >
            <span className="system-header__archive-icon" aria-hidden="true" />
            <span>Archivio Allenatore</span>
          </button>
          <label className="system-header__theme">
            <span>Tema interfaccia</span>
            <select
              value={theme}
              onChange={(event) => onThemeChange(event.target.value)}
            >
              <option value="light">Chiaro</option>
              <option value="dark">Scuro</option>
              <option value="system">Sistema</option>
            </select>
          </label>
        </div>
      </div>
    </header>
  );
}

export default Header;

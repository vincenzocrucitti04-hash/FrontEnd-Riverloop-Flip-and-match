import "./Header.css";

function Header({
  theme,
  onThemeChange,
  moves,
  profileOpen = false,
  onProfileToggle = () => {},
}) {
  return (
    <header className="header">
      <div className="header-content">
        <div className="header-title">
          <h1>Flip & Match</h1>
          <span className="subtitle">Memory Game</span>
        </div>

        <div className="header-controls">
          <button
            type="button"
            className="profile-toggle"
            onClick={onProfileToggle}
            aria-expanded={profileOpen}
          >
            <span aria-hidden="true">👤</span>
            <span className="profile-toggle__label">Profilo locale</span>
          </button>
          <label className="theme-selector">
            <span className="theme-selector__label">Tema</span>
            <select
              value={theme}
              onChange={(event) => onThemeChange(event.target.value)}
            >
              <option value="light">Chiaro</option>
              <option value="dark">Scuro</option>
              <option value="system">Sistema</option>
            </select>
          </label>

          <div className="moves-counter">
            <div className="moves-badge">
              <span className="moves-label">Mosse</span>
              <span className="moves-number">{moves}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;

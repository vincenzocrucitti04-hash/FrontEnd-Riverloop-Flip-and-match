import "./Header.css";
import SunIcon from "../../../assets/sun-regular-full.svg";
import MoonIcon from "../../../assets/moon-regular-full.svg";
import Button from "../../atoms/Button/Button";

function Header({ theme, setTheme, moves }) {
  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-title">
          <h1>Flip & Match</h1>
          <span className="subtitle">Memory Game</span>
        </div>

        <div className="header-controls">
          <Button onClick={toggleTheme} className="theme-toggle">
            <div className="theme-icon">
              {theme === "light" ? (
                <img src={MoonIcon} alt="enable dark mode" />
              ) : (
                <img src={SunIcon} alt="enable light mode" />
              )}
            </div>
            <span>{theme === "light" ? "Dark" : "Light"}</span>
          </Button>

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

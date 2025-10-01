import { useState, useEffect } from "react";
import Header from "./components/organisms/Header/Header";
import GameBoard from "./components/templates/GameBoard/GameBoard";
import Footer from "./components/organisms/Footer/Footer";
import "./App.css";

function App() {
  const [theme, setTheme] = useState("light");
  const [moves, setMoves] = useState(0);

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  return (
    <div className="App">
      <Header theme={theme} setTheme={setTheme} moves={moves} />
      <GameBoard setMoves={setMoves} moves={moves} />
      <Footer />
    </div>
  );
}

export default App;

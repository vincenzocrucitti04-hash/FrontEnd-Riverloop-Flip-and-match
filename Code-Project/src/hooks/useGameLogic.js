import { useState, useEffect } from "react";

export default function useGameLogic(setMoves) {
  const [gridSize, setGridSize] = useState("4x4");
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    generateCards();
  }, [gridSize]);

  const generateCards = async () => {
    setLoading(true);
    setCards([]);
    setFlippedCards([]);

    const totalCells = gridSize === "4x4" ? 16 : 36;
    const numPairs = totalCells / 2;

    try {
      const pokemonIds = Array.from(
        { length: numPairs },
        () => Math.floor(Math.random() * 150) + 1
      );

      const responses = await Promise.all(
        pokemonIds.map((id) =>
          fetch(`https://pokeapi.co/api/v2/pokemon/${id}`).then((res) =>
            res.json()
          )
        )
      );

      const pokemonImages = responses.map(
        (data) => data?.sprites?.front_default || ""
      );

      const gameCards = [];
      pokemonImages.forEach((img, i) => {
        gameCards.push(
          { id: i * 2, img, flipped: false, matched: false },
          { id: i * 2 + 1, img, flipped: false, matched: false }
        );
      });

      setCards(gameCards.sort(() => Math.random() - 0.5));
    } catch (err) {
      console.error("Error generating cards:", err);
      setCards([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRestart = () => {
    setFlippedCards([]);
    if (typeof setMoves === "function") {
      setMoves(0);
    }
    generateCards();
  };

  const handleFlip = (cardId) => {
    const clickedCard = cards.find((c) => c.id === cardId);

    if (
      !clickedCard ||
      clickedCard.flipped ||
      clickedCard.matched ||
      flippedCards.length === 2
    ) {
      return;
    }

    if (typeof setMoves === "function") {
      setMoves((prev) => prev + 1);
    }

    const newCards = cards.map((c) =>
      c.id === cardId ? { ...c, flipped: true } : c
    );
    setCards(newCards);

    const newFlipped = [...flippedCards, { ...clickedCard, id: cardId }];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      const [first, second] = newFlipped;

      if (first.img === second.img) {
        setCards((prev) =>
          prev.map((c) => (c.img === first.img ? { ...c, matched: true } : c))
        );
        setFlippedCards([]);
      } else {
        setTimeout(() => {
          setCards((prevCards) =>
            prevCards.map((c) =>
              c.id === first.id || c.id === second.id
                ? { ...c, flipped: false }
                : c
            )
          );
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  return {
    cards,
    gridSize,
    loading,
    setGridSize,
    handleFlip,
    handleRestart,
  };
}

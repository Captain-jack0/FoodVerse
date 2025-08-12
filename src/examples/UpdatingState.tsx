import { useState } from "react";
import Button from "../components/Button";

function UpdatingState() {
  const [game, setGame] = useState({
    id: 1,
    player: {
      name: "John",
      score: 100,
      level: 1,
    },
  });

  const [pizza, setPizza] = useState({
    name: "Cheese Pizza",
    toppings: ["Cheese", "Tomato"],
  });

  const updateGame = () => {
    setGame({
      ...game,
      player: {
        ...game.player,
        name: "Jane",
      },
    });
  };

  const updatePizza = () => {
    setPizza({
      ...pizza,
      toppings: [...pizza.toppings, "Mushroom"],
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <p>Game ID: {game.id}</p>
      <p>Player Name: {game.player.name}</p>
      <p>Player Score: {game.player.score}</p>
      <p>Player Level: {game.player.level}</p>
      <Button
        variant="accent"
        size="md"
        alignX="right"
        alignY="bottom"
        onClick={updateGame}
      >
        Update Game
      </Button>

      <p>Pizza Name: {pizza.name}</p>
      <p>Pizza Toppings: {pizza.toppings.join(", ")}</p>
      <Button
        variant="accent"
        size="md"
        alignX="right"
        alignY="bottom"
        onClick={updatePizza}
      >
        Update Pizza
      </Button>
    </div>
  );
}

export default UpdatingState;

import { useEffect, useState, useMemo } from "react";
import "./App.css";

const GRID_WIDTH = 9;
const GRID_HEIGHT = 9;

const START_POS = { x: 4, y: 8 };
const GOAL_Y = 0;

const LANES = [
  { y: 6, speed: 0.03 },
  { y: 5, speed: -0.04 },
  { y: 4, speed: 0.05 },
  { y: 3, speed: -0.03 },
];

const GOAL_ITEMS = ["🧸", "🦴"];

export default function App() {
  const [player, setPlayer] = useState(START_POS);
  const [score, setScore] = useState(0);

  const [vacuums, setVacuums] = useState(
    LANES.map((lane) => ({
      ...lane,
      x: Math.random() * GRID_WIDTH,
    }))
  );

  // Stable random goal items for top row
  const goals = useMemo(
    () =>
      Array.from({ length: GRID_WIDTH }, () =>
        GOAL_ITEMS[Math.floor(Math.random() * GOAL_ITEMS.length)]
      ),
    []
  );

  // Move vacuums
  useEffect(() => {
    const interval = setInterval(() => {
      setVacuums((prev) =>
        prev.map((v) => ({
          ...v,
          x: (v.x + v.speed + GRID_WIDTH) % GRID_WIDTH,
        }))
      );
    }, 16);

    return () => clearInterval(interval);
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      setPlayer((prev) => {
        let { x, y } = prev;

        if (e.key === "ArrowUp") y--;
        if (e.key === "ArrowDown") y++;
        if (e.key === "ArrowLeft") x--;
        if (e.key === "ArrowRight") x++;

        x = Math.max(0, Math.min(GRID_WIDTH - 1, x));
        y = Math.max(0, Math.min(GRID_HEIGHT - 1, y));

        return { x, y };
      });
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Collision detection
  useEffect(() => {
    const hit = vacuums.some(
      (v) => Math.round(v.x) === player.x && v.y === player.y
    );

    if (hit) {
      setPlayer(START_POS);
    }
  }, [vacuums, player]);

  // Win condition: reach any tile in top row
  useEffect(() => {
    if (player.y === GOAL_Y) {
      setScore((s) => s + 1);
      setPlayer(START_POS);
    }
  }, [player]);

  return (
    <div className="container">
      <h1>🐶 Corgi Vacuum Dodge</h1>
      <p>Score: {score}</p>

      <div className="grid">
        {Array.from({ length: GRID_HEIGHT }).map((_, y) =>
          Array.from({ length: GRID_WIDTH }).map((_, x) => {
            const isPlayer = player.x === x && player.y === y;
            const vacuumHere = vacuums.some(
              (v) => Math.round(v.x) === x && v.y === y
            );
            const isGoalRow = y === GOAL_Y;

            return (
              <div className="cell" key={`${x}-${y}`}>
                {isPlayer && "🐶"}
                {vacuumHere && "🧹"}
                {isGoalRow && goals[x]}
              </div>
            );
          })
        )}
      </div>

      <p className="hint">Avoid the vacuums and reach any toy!</p>
    </div>
  );
}

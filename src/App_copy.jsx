import React, { useState, useRef, useEffect } from "react";
import { useInterval } from "./useIntervals";
import {
  CANVAS_SIZE,
  SNAKE_START,
  APPLE_START,
  SCALE,
  SPEED,
  DIRECTIONS
} from "./constants";

/**
* A React component that renders a snake game on a canvas element.
* @returns {JSX.Element} The JSX element for the game.
*/
const App = () => {
  const canvasRef = useRef();
  const [snake, setSnake] = useState(SNAKE_START);
  const [apple, setApple] = useState(APPLE_START);
  const [dir, setDir] = useState([0, -1]);
  const [speed, setSpeed] = useState(null);
  const [gameOver, setGameOver] = useState(false);

  // Run the game loop at a fixed interval based on the speed
  useInterval(() => gameLoop(), speed);

  /**
   * Ends the game by setting the speed to null and the game over flag to true.
  */
  const endGame = () => {
    setSpeed(null);
    setGameOver(true);
  };

  /**
    * Changes the direction of the snake based on the key code of the arrow keys.
    * @param {Object} event - The keydown event object.
    * @param {number} event.keyCode - The key code of the pressed key.
  */
  const moveSnake = ({ keyCode }) =>
    keyCode >= 37 && keyCode <= 40 && setDir(DIRECTIONS[keyCode]);

  /**
    * Creates a new apple at a random position on the grid.
    * @returns {Array<number>} The coordinates of the new apple.
  */
  const createApple = () =>
    apple.map((_a, i) => Math.floor(Math.random() * (CANVAS_SIZE[i] / SCALE)));


  /**
    * Checks if a piece (either the snake head or an apple) collides with the walls or the snake body.
    * @param {Array<number>} piece - The coordinates of the piece to check.
    * @param {Array<Array<number>>} [snk=snake] - The coordinates of the snake body segments.
    * @returns {boolean} True if there is a collision, false otherwise.
  */
  const checkCollision = (piece, snk = snake) => {
    if (
      piece[0] * SCALE >= CANVAS_SIZE[0] ||
      piece[0] < 0 ||
      piece[1] * SCALE >= CANVAS_SIZE[1] ||
      piece[1] < 0
    )
      return true;

    for (const segment of snk) {
      if (piece[0] === segment[0] && piece[1] === segment[1]) return true;
    }
    return false;
  };

  /**
    * Checks if the snake head collides with the apple, and creates a new apple if so.
    * @param {Array<Array<number>>} newSnake - The coordinates of the new snake body segments.
    * @returns {boolean} True if the snake ate the apple, false otherwise.
  */
  const checkAppleCollision = newSnake => {
    if (newSnake[0][0] === apple[0] && newSnake[0][1] === apple[1]) {
      let newApple = createApple();
      while (checkCollision(newApple, newSnake)) {
        newApple = createApple();
      }
      setApple(newApple);
      return true;
    }
    return false;
  };

  /**
    * Updates the game state by moving the snake, checking for collisions, and eating the apple.
  */
  const gameLoop = () => {
    const snakeCopy = JSON.parse(JSON.stringify(snake));
    const newSnakeHead = [snakeCopy[0][0] + dir[0], snakeCopy[0][1] + dir[1]];
    snakeCopy.unshift(newSnakeHead);
    if (checkCollision(newSnakeHead)) endGame();
    if (!checkAppleCollision(snakeCopy)) snakeCopy.pop();
    setSnake(snakeCopy);
  };

  /**
    * Starts the game by resetting the state to the initial values.
  */
  const startGame = () => {
    setSnake(SNAKE_START);
    setApple(APPLE_START);
    setDir([0, -1]);
    setSpeed(SPEED);
    setGameOver(false);
  };

  // Draw the snake and the apple on the canvas using the useEffect hook
  useEffect(() => {
    const context = canvasRef.current.getContext("2d");
    context.setTransform(SCALE, 0, 0, SCALE, 0, 0);
    context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    context.fillStyle = "green";
    snake.forEach(([x, y]) => context.fillRect(x, y, 1, 1));
    context.fillStyle = "lightblue";
    context.fillRect(apple[0], apple[1], 1, 1);
  }, [snake, apple, gameOver]);

  return (
    <div role="button" tabIndex="0" onKeyDown={e => moveSnake(e)}>
      <canvas
        style={{ border: "1px solid black" }}
        ref={canvasRef}
        width={`${CANVAS_SIZE[0]}px`}
        height={`${CANVAS_SIZE[1]}px`}
      />
      {gameOver && <div>GAME OVER!</div>}
      <button onClick={startGame}>Start Game</button>
    </div>
  );
};

export default App;
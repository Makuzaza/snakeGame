// various modules and components are imported
import React, { useRef, useState, useEffect } from 'react';
import { useInterval } from "./useIntervals";
import { useSound } from 'use-sound';
import eat from './assets/eat.mp3';
import sound from './assets/sound.mp3';
import NewGame from "./components/NewGame";
import { levels } from "./levels";
import Game from "./components/Game";
import GameOver from "./components/GameOver";
import {
  CANVAS_SIZE,
  SNAKE_START,
  APPLE_START,
  SCALE,
  SPEED,
  DIRECTIONS
} from "./constants";

// component App
function App() {

  // various state variables are initialized using the useState hook
  const canvasRef = useRef();
  const [snake, setSnake] = useState(SNAKE_START);
  const [apple, setApple] = useState(APPLE_START);
  const [dir, setDir] = useState([0, -1]);
  const [speed, setSpeed] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [isGameRunning, setIsGameRunning] = useState(false);
  const [player, setPlayer] = useState();
  const [gameSpeed, setGameSpeed] = useState(null);
  const [gameLaunch, setGameLaunch] = useState(true);
  const [gameOn, setGameOn] = useState(false);

  const [soundEat] = useSound(eat);
  const [soundEnd] = useSound(sound);

  // The useInterval hook is used to create a game loop.
  // The gameLoop function is called repeatedly with a specified interval (gameSpeed).
  useInterval(() => gameLoop(), gameSpeed);

  // starting and ending the game
  const startGame = () => {
    setSnake(SNAKE_START);
    setApple(APPLE_START);
    setDir([0, -1]);
    setSpeed(SPEED);
    setGameOn(!gameOn);
    setGameOver(false);
  };

  const endGame = () => {
    setGameOn(false);
    setGameOver(true);
    setGameSpeed(null); // Stop the interval when the game ends
    soundEnd();
  };

  // moving the snake
  const moveSnake = ({ keyCode }) =>
  keyCode >= 37 && keyCode <= 40 && setDir(DIRECTIONS[keyCode]);

  // setting up the game based on the selected level
  const gameSetHandler = (level, name) => {
    const selectedLevel = levels.find(el => el.name === level);

    if (selectedLevel) {
      setGameSpeed(selectedLevel.SPEED);
      setGameLaunch((prevLaunch) => !prevLaunch);
      startGame();

      setPlayer({
        level: level,
        name: name
      });
    }
  };
  
  // stopping the game
  const stopHandler = () => {
    endGame();
    setGameOn(false);
    setGameOver(!gameOver);
    soundEnd()
  }
 // closing the game over screen
  const closeHandler = () => {
    setGameOver(false);
    setGameLaunch(false);
    setGameSpeed(null);
  }

  // check for hittings between game elements, the snake hitting the walls
const checkHitting = (piece, snk = snake) => {
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

// detecting when the snake eats an apple
const checkApple = newSnake => {
  if (newSnake[0][0] === apple[0] && newSnake[0][1] === apple[1]) {
    let newApple = createApple();
    while (checkHitting(newApple, newSnake)) {
      newApple = createApple();
    }
    setApple(newApple);
    soundEat();
    return true;
  }
  return false;
};

// iterations of the game, updates the snake's position, checks for hittings
// unshift() - adds the specified elements to the beginning of an array
// pop() - removes the last element from an array 
const gameLoop = () => {
  const snakeCopy = JSON.parse(JSON.stringify(snake));
  const newSnakeHead = [snakeCopy[0][0] + dir[0], snakeCopy[0][1] + dir[1]];
  snakeCopy.unshift(newSnakeHead);
  if (checkHitting(newSnakeHead)) endGame();
  if (!checkApple(snakeCopy)) snakeCopy.pop();
  setSnake(snakeCopy);
};

// random position for the apple
const createApple = () =>
  apple.map((_a, i) => Math.floor(Math.random() * (CANVAS_SIZE[i] / SCALE)));

  // adds and removes a keyboard event listener to handle key presses
  useEffect(() => {
    const handleKeyDown = (e) => moveSnake(e);

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []); 

  // Draw the snake and the apple on the canvas using the useEffect hook
  useEffect(() => {
    const context = canvasRef.current.getContext("2d");
    context.setTransform(SCALE, 0, 0, SCALE, 0, 0);
    context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    context.fillStyle = "blue";
    snake.forEach(([x, y]) => context.fillRect(x, y, 1, 1));
    context.fillStyle = "red";
    context.fillRect(apple[0], apple[1], 1, 1);
  }, [snake, apple, gameOver]);

  return (
    <div role="button" tabIndex="0" onKeyDown={e => moveSnake(e)}>
       <h1>Snake game</h1>
        <canvas
        style={{ border: "1px solid white" }}
        ref={canvasRef}
        width={`${CANVAS_SIZE[0]}px`}
        height={`${CANVAS_SIZE[1]}px`}
      />
      {isGameRunning ? (
        <button onClick={stopHandler}>Stop Game</button>
      ) : (
        <div>
        {!gameOn && <NewGame onclick={gameSetHandler} />}
        </div>
      )}

      {gameOn && <Game stopHandler={stopHandler} />}
      {gameOver && <GameOver closeHandler={closeHandler} {...player}/>}
    </div>
  );
};
 
export default App;
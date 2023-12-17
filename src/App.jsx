import React, { useRef, useState, useEffect } from 'react';
import { useInterval } from "./useIntervals";
import { useSound } from 'use-sound';
import ice from './assets/ice.mp3';
import sound from './assets/sound.mp3';
import footsteps from './assets/footsteps.mp3';
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

// const getRndInt = (min, max) => Math.floor(Math.random() * (max - min)) + min;

function App() {

  const canvasRef = useRef();
  const [snake, setSnake] = useState(SNAKE_START);
  const [apple, setApple] = useState(APPLE_START);
  const [dir, setDir] = useState([0, -1]);
  const [speed, setSpeed] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [isGameRunning, setIsGameRunning] = useState(false);
  const [player, setPlayer] = useState();
  // const [circles, setCircles] = useState([]);
  const [gameSpeed, setGameSpeed] = useState(null);
  // const [score, setScore] = useState(100);
  const [gameLaunch, setGameLaunch] = useState(true);
  const [gameOn, setGameOn] = useState(false);
  const [current, setCurrent] = useState();

  const [soundEat] = useSound(ice);
  const [soundEnd] = useSound(sound);
  const [soundSteps, { stop: stopSoundSteps }] = useSound(footsteps);

  useInterval(() => gameLoop(), speed);

  const startGame = () => {
    setSnake(SNAKE_START);
    setApple(APPLE_START);
    setDir([0, -1]);
    setSpeed(SPEED);
    setGameOn(!gameOn);
    setGameOver(false);
    setIsGameRunning(true);
    // setGameOn(!gameOn);
  };

  const endGame = () => {
    setSpeed(null);
    setGameOver(true);
  };

  const moveSnake = ({ keyCode }) =>
  keyCode >= 37 && keyCode <= 40 && setDir(DIRECTIONS[keyCode]);

  // const timeoutIdRef = useRef(null);
  // const rounds = useRef(0);
  // const currentInst = useRef(0);

  // let pace = 1000;
  // let levelAmount;
  const gameSetHandler = (level, name) => {
    const selectedLevel = levels.find(el => el.name === level);

    if (selectedLevel) {
      setGameSpeed(selectedLevel.SPEED);

      setPlayer({
        level: level,
        name: name
      });

      setGameLaunch((prevLaunch) => !prevLaunch);
      gameBegin();
    }
  };

  function gameBegin() {
    setGameOn(!gameOn);
  }
    
  const stopHandler = () => {
    setGameOn(false);
    setGameOver(!gameOver);
    // setGameOver(true);
    endGame();
    soundEnd()
  }

  const closeHandler = () => {
    setGameOver(!gameOver);
    setGameLaunch(!gameLaunch);
    // setScore(100);
  }

  const clickHandler = (id) => {
    if (current !== id) {
      stopHandler();
      return;
    }
    // setScore((prevScore) => prevScore + 10);
    // rounds.current--;
    // soundEat();
};

useEffect(() => {
  if (gameOn) {
    soundSteps();
  } else {
    stopSoundSteps();
  }
}, [gameOn, soundSteps, stopSoundSteps]);


// const randomNumber = () => {
//   if (rounds.current >= 3) {
//     stopHandler();
//     return;
//   }

//   let nextActive;

//   do {
//     nextActive = getRndInt(0, levelAmount)
//   } while (nextActive === currentInst.current);

//   setCurrent(nextActive);
//   currentInst.current = nextActive;
//   rounds.current++;
//   pace *= 0.95;
//   timeoutIdRef.current = setTimeout(randomNumber, pace);
// };

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

const gameLoop = () => {
  const snakeCopy = JSON.parse(JSON.stringify(snake));
  const newSnakeHead = [snakeCopy[0][0] + dir[0], snakeCopy[0][1] + dir[1]];
  snakeCopy.unshift(newSnakeHead);
  if (checkCollision(newSnakeHead)) endGame();
  if (!checkAppleCollision(snakeCopy)) snakeCopy.pop();
  setSnake(snakeCopy);
};

const createApple = () =>
  apple.map((_a, i) => Math.floor(Math.random() * (CANVAS_SIZE[i] / SCALE)));

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
      <canvas
        style={{ border: "1px solid white" }}
        ref={canvasRef}
        width={`${CANVAS_SIZE[0]}px`}
        height={`${CANVAS_SIZE[1]}px`}
      />
      / {gameLaunch && <NewGame onclick={gameSetHandler}/>}
      {isGameRunning ? ( // Render "Stop Game" button only when the game is running
        <button onClick={stopHandler}>Stop Game</button>
      ) : (
        <button onClick={startGame}>Start Game</button>
      )}
      {gameOn && (
<Game 
moveSnake={moveSnake}
  // score={score} 
  stopHandler={stopHandler} 
  clickHandler={clickHandler}
  current={current}/>)}
      {gameOver && <GameOver closeHandler={closeHandler} />}
   
    </div>
  );
};

//   return (
//     <>
// <h1>Catch the snow!</h1>
// {gameLaunch && <NewGame onclick={gameSetHandler}/>}
// {gameOn && (
// <Game 
//   score={score} 
//   circles={circles} 
//   stopHandler={stopHandler} 
//   clickHandler={clickHandler}
//   current={current}/>)}
// {gameOver && <GameOver closeHandler={closeHandler} {...player} score={score}/>}
//     </>
//   );
// };
 
export default App;
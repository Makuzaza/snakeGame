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

function App() {

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
  const [current, setCurrent] = useState();

  const [soundEat] = useSound(ice);
  const [soundEnd] = useSound(sound);
  const [soundSteps, { stop: stopSoundSteps }] = useSound(footsteps);

  useInterval(() => gameLoop(), gameSpeed);

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

  const moveSnake = ({ keyCode }) =>
  keyCode >= 37 && keyCode <= 40 && setDir(DIRECTIONS[keyCode]);

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
    
  const stopHandler = () => {
    endGame();
    setGameOn(false);
    setGameOver(!gameOver);
    // setGameOver(true);
    // endGame();
    soundEnd()
  }

  const closeHandler = () => {
    setGameOver(false);
    setGameLaunch(false);
    setGameSpeed(null);
  }

useEffect(() => {
  if (gameOn) {
    soundSteps();
  } else {
    stopSoundSteps();
  }
}, [gameOn, soundSteps, stopSoundSteps]);

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
// const moveSnake = ({ keyCode }) => {
//   console.log('Key pressed:', keyCode);
//   if (keyCode >= 37 && keyCode <= 40) {
//     console.log('Updating direction...');
//     setDir(DIRECTIONS[keyCode]);
//   }
// };

const gameLoop = () => {
  console.log('Game loop running...');
  const snakeCopy = JSON.parse(JSON.stringify(snake));
  const newSnakeHead = [snakeCopy[0][0] + dir[0], snakeCopy[0][1] + dir[1]];
  snakeCopy.unshift(newSnakeHead);
  if (checkCollision(newSnakeHead)) endGame();
  if (!checkAppleCollision(snakeCopy)) snakeCopy.pop();
  setSnake(snakeCopy);
};

const createApple = () =>
  apple.map((_a, i) => Math.floor(Math.random() * (CANVAS_SIZE[i] / SCALE)));

  // keyboard
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
        {!gameOn && (
          <NewGame onclick={gameSetHandler} />
        )}
        {/* {levels.map((level) => (
          <button key={level.name} onClick={() => gameSetHandler(level.name, player)}>
           {level.name}
          </button>
        ))} */}
      </div>
      )}

      {gameOn && (
        <Game 
        stopHandler={stopHandler} 
      />
    )}
    {gameOver && <GameOver closeHandler={closeHandler} {...player}/>}
         {/* {gameLaunch && <NewGame onclick={gameSetHandler}/>} */}
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
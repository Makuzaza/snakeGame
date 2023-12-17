import React from 'react';

function GameOver({closeHandler, name, score, level}) {
    return (
      <div className="overlay">
        <div className="gameover_box">
          <h2>GAME OVER</h2>
          <div className="game_data">
            <div className="score_main">
              <div className="score_text">Score:</div>
              <div className="score_modal">{score}</div>
            </div>
            <div className="name">
                <div>Name: {name}</div><div>Level: {level}</div>
          </div>
          </div>
          <p>
           Good job! Try again!
          </p>
          <button onClick={closeHandler}>X</button>
        </div>
      </div>
    );
  }
  
  export default GameOver;
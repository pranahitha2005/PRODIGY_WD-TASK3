import React, { useState, useEffect } from 'react';
import './App.css';
import { Howl } from 'howler'; // Import Howler for sound playback

// Square Component
const Square = ({ value, onClick }) => {
  return (
    <button className={`square ${value}`} onClick={onClick}>
      {value}
    </button>
  );
};

// Board Component
const Board = ({ squares, onClick }) => {
  return (
    <div className="board">
      {squares.map((square, i) => (
        <Square key={i} value={square} onClick={() => onClick(i)} />
      ))}
    </div>
  );
};

// App Component
const App = () => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [mode, setMode] = useState('multiplayer');
  const [status, setStatus] = useState('Player 1\'s Turn');
  const [winner, setWinner] = useState(null);
  const [player1Name, setPlayer1Name] = useState('Player 1');
  const [player2Name, setPlayer2Name] = useState('Player 2');
  const [moveSound] = useState(new Howl({
    src: ['/path/to/your/move_sound.mp3'], // Replace with actual path to your sound file
  }));

  useEffect(() => {
    const calculateWinnerAndDraw = () => {
      const lines = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
        [0, 4, 8], [2, 4, 6],            // diagonals
      ];
      for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
          return board[a];
        }
      }
      return null;
    };

    const winner = calculateWinnerAndDraw();
    if (winner) {
      setWinner(winner);
      if (winner === 'X') {
        setStatus(`${player1Name} wins!`);
      } else if (winner === 'O') {
        if (mode === 'ai') {
          setStatus("AI wins!");
        } else {
          setStatus(`${player2Name} wins!`);
        }
      }
    } else if (board.every(square => square !== null)) {
      setStatus("It's a draw!");
    } else {
      if (mode === 'multiplayer') {
        setStatus(`${isXNext ? `${player1Name}'s Turn` : `${player2Name}'s Turn`}`);
      } else {
        setStatus(`${isXNext ? `${player1Name}'s Turn` : "AI's Turn"}`);
      }
    }

    if (!isXNext && mode === 'ai' && winner === null) {
      setTimeout(() => {
        const aiMove = calculateAIMove(board);
        if (aiMove !== null) {
          const newBoard = board.slice();
          newBoard[aiMove] = 'O';
          setBoard(newBoard);
          setIsXNext(true);
          moveSound.play(); // Play sound after AI makes its move
        }
      }, 500); // Delay AI move to make it more visible
    }
  }, [board, isXNext, mode]);

  const handleClick = (i) => {
    if (board[i] || winner) return; // If the square is already filled or there's a winner, return early
    const newBoard = board.slice();
    newBoard[i] = isXNext ? 'X' : 'O';
    setBoard(newBoard);
    setIsXNext(!isXNext);
    moveSound.play(); // Play sound after player makes a move
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setStatus(`${player1Name}'s Turn`);
    setWinner(null);
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
    resetGame();
  };

  const handlePlayerNameChange = (player, newName) => {
    if (player === 1) {
      setPlayer1Name(newName);
    } else if (player === 2) {
      setPlayer2Name(newName);
    }
  };

  return (
    <div className="game">
      <h1>Tic Tac Toe</h1>
      <div className="mode-selector">
        <button onClick={() => handleModeChange('multiplayer')}>Multiplayer</button>
        <button onClick={() => handleModeChange('ai')}>AI</button>
      </div>
      <div className="player-names">
        <input
          type="text"
          value={player1Name}
          onChange={(e) => handlePlayerNameChange(1, e.target.value)}
          placeholder="Player 1 Name"
        />
        <input
          type="text"
          value={player2Name}
          onChange={(e) => handlePlayerNameChange(2, e.target.value)}
          placeholder="Player 2 Name"
          disabled={mode === 'ai'}
        />
      </div>
      <div className="status">{status}</div>
      <Board squares={board} onClick={handleClick} />
      {winner && (
        <div className="winner-overlay">
          <div className="winner-message">{status}</div>
          <button onClick={resetGame}>Play Again</button>
        </div>
      )}
    </div>
  );
};

// Helper functions
const calculateAIMove = (squares) => {
  const emptyIndices = squares.map((value, index) => value === null ? index : null).filter(index => index !== null);
  if (emptyIndices.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * emptyIndices.length);
  return emptyIndices[randomIndex];
};

export default App;

import React, {useState, useEffect, useMemo} from 'react';

import './App.css';
import { io } from "socket.io-client";
import { Routes, Route } from 'react-router-dom';
let socket = io('http://localhost:8000');

function Square(props) {
  return (<button className="square" onClick={props.onClick}>{props.value}</button>)
}

// ADMIN PANEL
const Panel = () => {
  const [gameHistory, setGameHistory] = useState([])

  useEffect(() => {
    socket.emit('getFile');
    socket.on('getFiles', (e) => {
        setGameHistory(e)
    }); 
  }, []);

 
  return (
    <div>
      <h1>История игр</h1>
      <table className="table" style={{ width: '100%' }}>
        <thead>
          <tr>
            <th scope="col">ID</th>
            <th scope="col">Победитель</th>
            <th scope="col">Время</th>
          </tr>
        </thead>
        <tbody>
          { gameHistory.map((history, i) => {
            return(
              <tr key={i}>
                <td>{history.id}</td>
                <td>{history.winner}</td>
                <td>{history.data}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// GAME BOARD
const Board = (props) => {
    return (
      <div>
        <div className="board-row">
          <Square value={props.squares[0]} onClick={() => props.handleClick(0)} />
          <Square value={props.squares[1]} onClick={() => props.handleClick(1)} />
          <Square value={props.squares[2]} onClick={() => props.handleClick(2)} />
        </div>
        <div className="board-row">
          <Square value={props.squares[3]} onClick={() => props.handleClick(3)} />
          <Square value={props.squares[4]} onClick={() => props.handleClick(4)} />
          <Square value={props.squares[5]} onClick={() => props.handleClick(5)} />
        </div>
        <div className="board-row">
          <Square value={props.squares[6]} onClick={() => props.handleClick(6)} />
          <Square value={props.squares[7]} onClick={() => props.handleClick(7)} />
          <Square value={props.squares[8]} onClick={() => props.handleClick(8)} />
        </div>
      </div>
    );
}

// 
const Game = () => {
  const [history, sethistory] = useState([{
    squares: Array(9).fill(null)
  }]);
  const [stepNumber, setstepNumber] = useState(0)  
  const [xIsNext, setxIsNext] = useState(true)  
  const [isLoading, setIsLoading] = useState(true)  
  const [idGame, setIdGame] = useState(Math.round(Math.random()*100))  

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false)
    }, 300);    
  }, [])

  const handleClick = (i) => {
    const historyNew = history.slice(0, stepNumber+1);
    const current = historyNew[historyNew.length-1];
    const squares = current.squares.slice();
    if (checkWhoWinner(squares) || squares[i]) return;

    squares[i] = xIsNext ? 'X' : 'O';

    sethistory(history.concat([{squares}]));
    setxIsNext(!xIsNext);
    setstepNumber(history.length);
  }

    if(isLoading){ return(<div>Загрузка...</div>)}

    const historys = history;
    const current = historys[stepNumber];
    const winner = checkWhoWinner(current.squares);
    
    let status = '';
    if (winner) {
      status = '🥇 Победитель: ' + winner;
      socket.emit('save', winner, idGame, stepNumber);
      
      // Если нужно чтоб после завершения игра начиналась снова, то раскоментируй
      // setIsLoading(true)
      // sethistory([{
      //   squares: Array(9).fill(null)
      // }]);
      // setxIsNext(true)
      // setstepNumber(0)
      // setIdGame(Math.round(Math.random()*100));
      // setIsLoading(false)
      // 

    } else status = '🎮 Ходит:  ' + (xIsNext ? 'X' : 'O');

    const restart = () => {
      setIsLoading(true)
      sethistory([{
        squares: Array(9).fill(null)
      }]);
      setxIsNext(true)
      setstepNumber(0)
      setIdGame(Math.round(Math.random()*100));
      setIsLoading(false)
    }

    return (
      <div className="game">
        <div className="game-board">
        <div style={{marginBottom: 10, maxWidth: 100}}>ID: {idGame}</div>
        <div style={{marginBottom: 10, maxWidth: 100}}>{status}</div>
          <Board
            squares={current.squares} 
            handleClick={(i) => handleClick(i)}
          />
        </div>
        <button style={{marginTop: 10}} onClick={() => restart()}>Начать снова</button>
      </div>
    );
}

// Смотрим кто выиграл
const checkWhoWinner = (squares) => {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
}


function App() {
  return (
    <div className="App">
      <h1>Игра крестики нолики от <a href="https://lolz.guru/members/4483338/">FROZEN</a></h1>
      <Routes>
        <Route path="/" element={<Game />}/>
        <Route path="/admin" element={<Panel />}/>
      </Routes>
    </div>
  );
}

export default App;

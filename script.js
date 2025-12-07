const game = new Chess();
const boardEl = document.getElementById('board');
const promotionModal = document.getElementById('promotionModal');
const UNICODE = {p:'♟', r:'♜', n:'♞', b:'♝', q:'♛', k:'♚', P:'♙', R:'♖', N:'♘', B:'♗', Q:'♕', K:'♔'};

// --- Coins & Streaks ---
let coinCount = parseInt(localStorage.getItem('coinCount')) || 0;
let puzzleStreak = parseInt(localStorage.getItem('puzzleStreak')) || 0;
let lastPuzzleDate = localStorage.getItem('lastPuzzleDate') || null;
document.getElementById('coinCount').textContent = coinCount;

function completeDailyPuzzle(){
  const today = new Date().toISOString().slice(0,10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0,10);
  if(lastPuzzleDate === today) return;

  if(lastPuzzleDate === yesterday) puzzleStreak++;
  else puzzleStreak = 1;

  lastPuzzleDate = today;
  localStorage.setItem('lastPuzzleDate', today);
  localStorage.setItem('puzzleStreak', puzzleStreak);

  let coinsAwarded = 0;
  if(puzzleStreak === 3) coinsAwarded=25;
  else if(puzzleStreak === 7) coinsAwarded=50;
  else if(puzzleStreak === 14) coinsAwarded=50;
  else if(puzzleStreak === 30) coinsAwarded=150;

  if(coinsAwarded>0){
    coinCount+=coinsAwarded;
    localStorage.setItem('coinCount', coinCount);
    document.getElementById('coinCount').textContent = coinCount;
    alert(`🎉 Streak ${puzzleStreak} days! You earned ${coinsAwarded} coins!`);
  }
}

// --- Buy Golden King ---
document.getElementById('buyGoldenKing').addEventListener('click',()=>{
  const cost=150;
  if(coinCount>=cost){
    coinCount-=cost;
    localStorage.setItem('coinCount', coinCount);
    document.getElementById('coinCount').textContent = coinCount;
    localStorage.setItem('goldenKing', true);
    alert('✅ You bought the Golden King!');
    renderBoard();
  } else alert('❌ Not enough coins.');
});

// --- Render Board ---
function renderBoard(){
  boardEl.innerHTML='';
  const board = game.board();
  const goldenKingOwned = localStorage.getItem('goldenKing')==='true';
  for(let r=0;r<8;r++){
    for(let f=0;f<8;f++){
      const square=document.createElement('div');
      square.className='square '+((r+f)%2===0?'light':'dark');
      square.dataset.square=String.fromCharCode(97+f)+(8-r);
      const piece=board[r][f];
      if(piece){
        const p=document.createElement('div');
        let symbol = UNICODE[piece.color==='w'?piece.type.toUpperCase():piece.type];
        if(goldenKingOwned && piece.type==='k' && piece.color==='w'){
          p.style.textShadow='0 0 10px gold, 0 0 20px gold';
        }
        p.textContent = symbol;
        square.appendChild(p);
      }
      boardEl.appendChild(square);
    }
  }
}

// --- Panels ---
function showPanel(id){
  document.querySelectorAll('.panel').forEach(p=>p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// --- Initial Render ---
renderBoard();

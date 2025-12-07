// Uses chess.js (loaded via CDN in index.html)
const game = new Chess(); // from chess.js

// DOM
const boardEl = document.getElementById('board');
const moveListEl = document.getElementById('moveList');
const statusEl = document.getElementById('status');
const turnInfo = document.getElementById('turnInfo');
const gameResultEl = document.getElementById('gameResult');
const orientationSelect = document.getElementById('orientation');
const highlightMovesCheckbox = document.getElementById('highlightMoves');
const themeSelect = document.getElementById('themeSelect');

let dragging = null;
let dragPieceEl = null;
let sourceSquare = null;
let legalTargets = [];

// mapping for unicode pieces
const UNICODE = {
  p: '♟', r: '♜', n: '♞', b: '♝', q: '♛', k: '♚',
  P: '♙', R: '♖', N: '♘', B: '♗', Q: '♕', K: '♔'
};

// initial render
function renderBoard() {
  boardEl.innerHTML = '';
  // chess.js returns board as ranks 8 to 1
  const board = game.board();
  // determine orientation
  const flip = (orientationSelect.value === 'black');
  const rows = flip ? [...board].reverse() : board;
  for (let rIndex = 0; rIndex < 8; rIndex++) {
    const rank = rows[rIndex];
    const displayRank = flip ? rIndex+1 : 8 - rIndex;
    for (let file = 0; file < 8; file++) {
      const square = document.createElement('div');
      square.className = 'square';
      const isLight = ((rIndex + file) % 2 === 0);
      square.classList.add(isLight ? 'light' : 'dark');

      // calculate algebraic coordinate
      const fileChar = String.fromCharCode('a'.charCodeAt(0) + file);
      const rankNum = flip ? (file === 0 ? 8 - rIndex : 8 - rIndex) : (8 - rIndex);
      // algebraic coordinate depending on orientation
      const algebraic = (() => {
        const f = flip ? (7 - file) : file;
        const r = flip ? (rIndex+1) : (8 - rIndex);
        return String.fromCharCode('a'.charCodeAt(0)+f) + r;
      })();
      square.dataset.square = algebraic;

      // piece rendering (chess.board() gives same orientation always — ranks 8->1)
      const piece = rank[file];
      if (piece) {
        const p = document.createElement('div');
        p.className = 'piece';
        p.textContent = UNICODE[piece.color === 'w' ? piece.type.toUpperCase() : piece.type.toLowerCase()];
        p.dataset.piece = piece.color === 'w' ? piece.type.toUpperCase() : piece.type.toLowerCase();
        // attach pointerdown for drag
        p.addEventListener('pointerdown', startDrag);
        square.appendChild(p);
      }

      boardEl.appendChild(square);
    }
  }
  updateMoveList();
  updateStatus();
}

// get legal moves from a square
function getLegalMoves(from) {
  const moves = game.moves({ square: from, verbose: true });
  return moves.map(m => m.to);
}

// highlight squares for available moves
function highlightLegal(from) {
  clearHighlights();
  legalTargets = getLegalMoves(from);
  legalTargets.forEach(sq => {
    const el = boardEl.querySelector(`[data-square="${sq}"]`);
    if (el) el.classList.add('highlight');
  });
}

// clear highlights
function clearHighlights() {
  boardEl.querySelectorAll('.highlight').forEach(el => el.classList.remove('highlight'));
  boardEl.querySelectorAll('.last-move').forEach(el => el.classList.remove('last-move'));
}

// start dragging
function startDrag(e) {
  e.preventDefault();
  const pieceEl = e.currentTarget;
  const squareEl = pieceEl.parentElement;
  sourceSquare = squareEl.dataset.square;
  // prepare dragging visual
  dragging = {
    piece: pieceEl.dataset.piece,
    from: sourceSquare
  };
  highlightLegal(sourceSquare);
  // capture pointer
  pieceEl.setPointerCapture(e.pointerId);
  dragPieceEl = pieceEl;
  dragPieceEl.style.position = 'absolute';
  dragPieceEl.style.zIndex = 1000;
  moveDrag(e);
  boardEl.addEventListener('pointermove', moveDrag);
  boardEl.addEventListener('pointerup', endDrag);
}

// move drag element
function moveDrag(e) {
  if (!dragPieceEl) return;
  const rect = boardEl.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  dragPieceEl.style.left = (x - dragPieceEl.offsetWidth/2) + 'px';
  dragPieceEl.style.top = (y - dragPieceEl.offsetHeight/2) + 'px';
}

// end drag
function endDrag(e) {
  boardEl.removeEventListener('pointermove', moveDrag);
  boardEl.removeEventListener('pointerup', endDrag);
  if (!dragPieceEl) return;
  const rect = boardEl.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const squareSize = rect.width / 8;
  const file = Math.floor(x / squareSize);
  const rank = Math.floor(y / squareSize);
  // compute algebraic for current orientation
  const flip = (orientationSelect.value === 'black');
  const f = flip ? (7 - file) : file;
  const r = flip ? (rank + 1) : (8 - rank);
  const to = String.fromCharCode('a'.charCodeAt(0) + f) + r;

  attemptMove(sourceSquare, to);

  // cleanup
  dragPieceEl.style.position = '';
  dragPieceEl.style.left = '';
  dragPieceEl.style.top = '';
  dragPieceEl = null;
  dragging = null;
  sourceSquare = null;
  clearHighlights();
}

// attempt a move via chess.js
function attemptMove(from, to, promotion='q') {
  // handle promotions automatically as queen (prompt handled later)
  const move = game.move({ from, to, promotion });
  if (move === null) {
    // illegal move -> snap back
    flashStatus('Illegal move', true);
    renderBoard();
    return false;
  } else {
    // successful
    flashStatus(`${move.color === 'w' ? 'White' : 'Black'}: ${move.san}`);
    // highlight last move squares
    const fromEl = boardEl.querySelector(`[data-square="${move.from}"]`);
    const toEl = boardEl.querySelector(`[data-square="${move.to}"]`);
    if (fromEl) fromEl.classList.add('last-move');
    if (toEl) toEl.classList.add('last-move');

    renderBoard();
    checkGameOver();
    return true;
  }
}

// update move list
function updateMoveList() {
  moveListEl.innerHTML = '';
  const history = game.history({ verbose: true });
  for (let i = 0; i < history.length; i += 2) {
    const li = document.createElement('li');
    const moveNum = Math.floor(i / 2) + 1;
    const white = history[i] ? history[i].san : '';
    const black = history[i + 1] ? history[i + 1].san : '';
    li.innerHTML = `<strong>${moveNum}.</strong> ${white} ${black}`;
    moveListEl.appendChild(li);
  }
  turnInfo.textContent = `Turn: ${game.turn() === 'w' ? 'White' : 'Black'}`;
}

// update status
function updateStatus() {
  const turn = game.turn();
  const in_check = game.in_check();
  const status = in_check ? `${turn === 'w' ? 'White' : 'Black'} is in check` : 'Playing';
  statusEl.textContent = `Status: ${status}`;
  gameResultEl.textContent = '';
}

// flash status message
function flashStatus(msg, error=false) {
  statusEl.textContent = `Status: ${msg}`;
  if (error) {
    statusEl.style.color = '#ffaaaa';
    setTimeout(()=> { statusEl.style.color = ''; updateStatus(); }, 1200);
  } else {
    setTimeout(()=> { updateStatus(); }, 900);
  }
}

// check game over conditions
function checkGameOver() {
  if (game.in_checkmate()) {
    gameResultEl.textContent = `Checkmate — ${game.turn() === 'w' ? 'Black' : 'White'} wins`;
    flashStatus('Checkmate');
  } else if (game.in_draw()) {
    gameResultEl.textContent = 'Draw';
    flashStatus('Draw');
  } else {
    updateStatus();
  }
}

// Undo
document.getElementById('undoBtn').addEventListener('click', () => {
  game.undo();
  renderBoard();
});

// Reset
document.getElementById('resetBtn').addEventListener('click', () => {
  game.reset();
  renderBoard();
  moveListEl.innerHTML = '';
  gameResultEl.textContent = '';
  updateStatus();
});

// orientation change
orientationSelect.addEventListener('change', renderBoard);

// theme change
themeSelect.addEventListener('change', (e) => {
  const val = e.target.value;
  // simple theme swap: change class names of squares
  // re-render board will apply default gold/white; for other themes we can change colors
  // For now we keep renderBoard and rely on CSS for theme variants (expand later)
  renderBoard();
});

// initial render call
renderBoard();

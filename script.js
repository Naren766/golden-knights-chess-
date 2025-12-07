const game = new Chess();
const boardEl = document.getElementById('board');
const promotionModal = document.getElementById('promotionModal');

// Unicode pieces
const UNICODE = {
  p: '♟', r: '♜', n: '♞', b: '♝', q: '♛', k: '♚',
  P: '♙', R: '♖', N: '♘', B: '♗', Q: '♕', K: '♔'
};

// Render board
function renderBoard() {
  boardEl.innerHTML = '';
  const board = game.board();
  for(let r=0;r<8;r++){
    for(let f=0;f<8;f++){
      const square = document.createElement('div');
      square.className = 'square ' + ((r+f)%2===0?'light':'dark');
      square.dataset.square = String.fromCharCode(97+f) + (8-r);
      const piece = board[r][f];
      if(piece){
        const p = document.createElement('div');
        p.className='piece';
        p.textContent=UNICODE[piece.color=== 'w'?piece.type.toUpperCase():piece.type];
        p.dataset.piece=piece.color=== 'w'?piece.type.toUpperCase():piece.type;
        p.addEventListener('pointerdown',startDrag);
        square.appendChild(p);
      }
      boardEl.appendChild(square);
    }
  }
}

let dragPiece = null;
let sourceSquare = null;

function startDrag(e){
  const piece = e.currentTarget;
  dragPiece = piece;
  sourceSquare = piece.parentElement.dataset.square;
  piece.setPointerCapture(e.pointerId);
  piece.style.position='absolute';
  piece.style.zIndex=1000;
  moveDrag(e);
  boardEl.addEventListener('pointermove',moveDrag);
  boardEl.addEventListener('pointerup',endDrag);
}

function moveDrag(e){
  if(!dragPiece) return;
  const rect=boardEl.getBoundingClientRect();
  dragPiece.style.left=(e.clientX-rect.left-dragPiece.offsetWidth/2)+'px';
  dragPiece.style.top=(e.clientY-rect.top-dragPiece.offsetHeight/2)+'px';
}

function endDrag(e){
  boardEl.removeEventListener('pointermove',moveDrag);
  boardEl.removeEventListener('pointerup',endDrag);
  const rect=boardEl.getBoundingClientRect();
  const x=Math.floor((e.clientX-rect.left)/(rect.width/8));
  const y=Math.floor((e.clientY-rect.top)/(rect.height/8));
  const to = String.fromCharCode(97+x) + (8-y);
  attemptMove(sourceSquare,to);
  dragPiece.style.position='';
  dragPiece.style.left='';
  dragPiece.style.top='';
  dragPiece=null;
  sourceSquare=null;
}

function attemptMove(from,to,promotion=null){
  const moves = game.moves({verbose:true}).filter(m=>m.from===from && m.to===to);
  if(moves.length===0){ renderBoard(); return; }
  const promotionMoves = moves.filter(m=>m.flags.includes('p'));
  if(promotionMoves.length>0 && !promotion){
    showPromotionModal(from,to); return;
  }
  const move = game.move({from,to,promotion:promotion||'q'});
  renderBoard();
}

function showPromotionModal(from,to){
  promotionModal.classList.remove('hidden');
  promotionModal.querySelectorAll('button[data-piece]').forEach(btn=>{
    btn.onclick=()=>{
      promotionModal.classList.add('hidden');
      attemptMove(from,to,btn.dataset.piece);
    };
  });
}

// Reset button
document.getElementById('resetBtn').addEventListener('click',()=>{
  game.reset();
  renderBoard();
});

// Undo button
document.getElementById('undoBtn').addEventListener('click',()=>{
  game.undo();
  renderBoard();
});

// Simple sidebar panel switch
function showPanel(id){
  document.querySelectorAll('.panel').forEach(p=>p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

renderBoard();

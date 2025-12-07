// attempt a move with optional promotion
function attemptMove(from, to, promotion=null) {
  // check if move is promotion
  const moves = game.moves({ verbose: true }).filter(m => m.from === from && m.to === to);
  let moveObj = null;

  if (moves.length === 0) {
    flashStatus('Illegal move', true);
    renderBoard();
    return false;
  }

  // check if any move requires promotion
  const promotionMoves = moves.filter(m => m.flags.includes('p'));
  if (promotionMoves.length > 0 && !promotion) {
    // show promotion modal
    showPromotionModal(from, to);
    return false;
  } else {
    // execute move (auto promotion if provided)
    moveObj = game.move({ from, to, promotion: promotion || 'q' });
  }

  if (!moveObj) {
    flashStatus('Illegal move', true);
    renderBoard();
    return false;
  }

  // successful move
  flashStatus(`${moveObj.color === 'w' ? 'White' : 'Black'}: ${moveObj.san}`);
  highlightLastMove(moveObj.from, moveObj.to);
  renderBoard();
  checkGameOver();
  return true;
}

// highlight last move squares
function highlightLastMove(from, to) {
  const fromEl = boardEl.querySelector(`[data-square="${from}"]`);
  const toEl = boardEl.querySelector(`[data-square="${to}"]`);
  if (fromEl) fromEl.classList.add('last-move');
  if (toEl) toEl.classList.add('last-move');
}

// Show promotion modal
function showPromotionModal(from, to) {
  const modal = document.getElementById('promotionModal');
  modal.classList.remove('hidden');

  // add click events for promotion buttons
  modal.querySelectorAll('button[data-piece]').forEach(btn => {
    btn.onclick = () => {
      const piece = btn.dataset.piece;
      modal.classList.add('hidden');
      attemptMove(from, to, piece);
    };
  });
}

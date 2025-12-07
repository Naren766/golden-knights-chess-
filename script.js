// INITIAL BOARD RENDER UI
function renderBoard() {
    const board = document.getElementById("chessBoard");
    board.innerHTML = "";

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            let square = document.createElement("div");
            square.className = (row + col) % 2 === 0 ? "white" : "gold";
            board.appendChild(square);
        }
    }
}

renderBoard();


// UI BUTTON HANDLING
function showHome() {
    content.innerHTML = "<h2>Home</h2><p>Welcome to GoldenKnights.</p>";
}

function showPlay() {
    content.innerHTML = "<h2>Play Chess</h2><p>Drag & drop piece system coming next.</p>";
}

function showPuzzle() {
    content.innerHTML = "<h2>Golden Puzzle</h2><p>Puzzle engine coming.</p>";
}

function showShop() {
    content.innerHTML = "<h2>Rewards Shop</h2><p>Exchange gold coins for Golden King.</p>";
}

function showTournaments() {
    content.innerHTML = "<h2>Tournaments</h2><p>List of tournaments coming soon.</p>";
}

function showSettings() {
    content.innerHTML = `
        <h2>Settings</h2>
        <p>Theme, sounds, premove, and more coming soon.</p>
    `;
}

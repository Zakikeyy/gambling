// DOM Elements
const nicknameContainer = document.getElementById('nicknameContainer');
const gameContainer = document.getElementById('gameContainer');
const nicknameInput = document.getElementById('nicknameInput');
const startButton = document.getElementById('startButton');
const greeting = document.getElementById('greeting');
const gameBoard = document.getElementById('gameBoard');
const pointsDisplay = document.getElementById('points');
const overlay = document.getElementById('overlay');
const popup = document.getElementById('popup');
const popupTitle = document.getElementById('popupTitle');
const popupMessage = document.getElementById('popupMessage');
const playAgainButton = document.getElementById('playAgainButton');

// Game Variables
let points = 100; // Starting points
let startTime, endTime;

// Event Listener for Start Button
startButton.addEventListener('click', () => {
    const nickname = nicknameInput.value.trim();
    if (!nickname) {
        alert('Please enter a nickname!');
        return;
    }
    greeting.textContent = `Hi, ${nickname}!`;
    nicknameContainer.classList.add('hidden'); // Hide nickname input
    gameContainer.classList.remove('hidden'); // Show game container
    startGame();
});

// Initialize the game board
function initializeGameBoard() {
    const cells = Array(16).fill('diamond');
    cells[0] = 'bomb';
    cells[1] = 'bomb';
    cells.sort(() => Math.random() - 0.5);
    return cells;
}

let cells = initializeGameBoard();

function startGame() {
    startTime = Date.now(); // Start timer
    cells = initializeGameBoard(); // Reset and shuffle board
    gameBoard.innerHTML = ''; // Clear the game board
    overlay.classList.add('hidden'); // Hide overlay
    popup.classList.add('hidden'); // Hide popup
    pointsDisplay.textContent = points; // Display current points
    createBoard(); // Create the game board
}

function revealCell(cell, index) {
    if (cell.dataset.revealed === 'true') return;

    cell.dataset.revealed = 'true'; // Mark cell as revealed
    if (cells[index] === 'bomb') {
        cell.innerHTML = '<span class="emoji">💣</span>';
        cell.style.backgroundColor = '#ff4c4c';
        points -= 20; // Deduct points for hitting a bomb
        endTime = Date.now(); // End timer
        showPopup(false); // Show game over popup
    } else {
        cell.innerHTML = '<span class="emoji">💎</span>';
        cell.style.backgroundColor = '#4caf50';
        checkGameWon();
    }
    pointsDisplay.textContent = points; // Update points display
}

function checkGameWon() {
    const revealedCells = Array.from(gameBoard.children).filter(
        c => c.dataset.revealed === 'true'
    ).length;

    if (revealedCells === 14) { // All diamonds revealed (16 - 2 bombs)
        points += 20; // Add points for winning
        endTime = Date.now(); // End timer
        showPopup(true); // Show win popup
    }
}

function showPopup(isWin) {
    const elapsedTime = ((endTime - startTime) / 1000).toFixed(2); // Calculate time taken
    overlay.classList.remove('hidden'); // Show overlay
    popup.classList.remove('hidden'); // Show popup

    if (isWin) {
        popupTitle.textContent = 'You Win!';
        popupMessage.innerHTML = `🎉 Points Gained: +20<br>⏱ Time Taken: ${elapsedTime}s<br>🏆 Final Points: ${points}`;
    } else {
        popupTitle.textContent = 'Game Over!';
        popupMessage.innerHTML = `❌ Points Lost: -20<br>⏱ Time Taken: ${elapsedTime}s<br>🏆 Final Points: ${points}`;
    }
}

function createBoard() {
    for (let i = 0; i < 16; i++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.index = i;
        cell.dataset.revealed = 'false'; // Initially not revealed
        cell.addEventListener('click', () => revealCell(cell, i)); // Add click event
        gameBoard.appendChild(cell); // Add cell to game board
    }
}

// Event Listener for Play Again Button
playAgainButton.addEventListener('click', startGame);

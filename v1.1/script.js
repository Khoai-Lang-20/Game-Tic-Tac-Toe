const cells = document.querySelectorAll('.cell');
const statusText = document.getElementById('status');
const restartBtn = document.getElementById('restart-btn');
const modeSelect = document.getElementById('game-mode');

const winPatterns = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

let options = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "X";
let running = true;
let isPvE = false; // Mặc định chơi 2 người

function initGame() {
  cells.forEach(cell => cell.addEventListener('click', cellClicked));
  restartBtn.addEventListener('click', restartGame);
  modeSelect.addEventListener('change', changeMode);
  statusText.innerHTML = `Lượt của: <span>${currentPlayer}</span>`;
}

function changeMode() {
  isPvE = modeSelect.value === 'pve';
  restartGame();
}

function cellClicked() {
  const cellIndex = this.getAttribute('data-index');

  if (options[cellIndex] !== "" || !running) return;

  updateCell(this, cellIndex);
  if (checkWinner()) return;

  // Nếu đang ở chế độ Đấu với Máy và tới lượt Máy (O)
  if (isPvE && currentPlayer === "O" && running) {
    setTimeout(botMove, 400); // Trễ 0.4s cho cảm giác tự nhiên
  }
}

function updateCell(cell, index) {
  options[index] = currentPlayer;
  cell.textContent = currentPlayer;
  cell.classList.add(currentPlayer.toLowerCase());
}

function changePlayer() {
  currentPlayer = (currentPlayer === "X") ? "O" : "X";
  statusText.innerHTML = `Lượt của: <span>${currentPlayer}</span>`;
}

function checkWinner() {
  let roundWon = false;

  for (let i = 0; i < winPatterns.length; i++) {
    const pattern = winPatterns[i];
    const cellA = options[pattern[0]];
    const cellB = options[pattern[1]];
    const cellC = options[pattern[2]];

    if (cellA === "" || cellB === "" || cellC === "") continue;
    if (cellA === cellB && cellB === cellC) {
      roundWon = true;
      break;
    }
  }

  if (roundWon) {
    statusText.innerHTML = `🎉 <strong>${currentPlayer} đã CHIẾN THẮNG!</strong>`;
    running = false;
    return true;
  } else if (!options.includes("")) {
    statusText.innerHTML = `🤝 <strong>HÒA CỜ!</strong>`;
    running = false;
    return true;
  } else {
    changePlayer();
    return false;
  }
}

// Logic thông minh cho Máy (Bot)
function botMove() {
  let emptyIndices = [];
  options.forEach((val, idx) => {
    if (val === "") emptyIndices.push(idx);
  });

  if (emptyIndices.length === 0 || !running) return;

  // 1. Máy tìm nước thắng ngay
  let bestMove = findWinningMove("O");
  
  // 2. Nếu không thể thắng ngay, máy chặn người chơi (X) thắng
  if (bestMove === null) {
    bestMove = findWinningMove("X");
  }

  // 3. Nếu không có nguy cơ, đánh ngẫu nhiên
  if (bestMove === null) {
    const randomIndex = Math.floor(Math.random() * emptyIndices.length);
    bestMove = emptyIndices[randomIndex];
  }

  const targetCell = document.querySelector(`.cell[data-index="${bestMove}"]`);
  updateCell(targetCell, bestMove);
  checkWinner();
}

// Hàm hỗ trợ Máy tìm nước đi nguy hiểm/chiến thắng
function findWinningMove(player) {
  for (let pattern of winPatterns) {
    const [a, b, c] = pattern;
    const values = [options[a], options[b], options[c]];
    
    // Nếu có 2 ô cùng là player và 1 ô trống
    if (values.filter(v => v === player).length === 2 && values.includes("")) {
      if (options[a] === "") return a;
      if (options[b] === "") return b;
      if (options[c] === "") return c;
    }
  }
  return null;
}

function restartGame() {
  currentPlayer = "X";
  options = ["", "", "", "", "", "", "", "", ""];
  statusText.innerHTML = `Lượt của: <span>${currentPlayer}</span>`;
  cells.forEach(cell => {
    cell.textContent = "";
    cell.classList.remove('x', 'o');
  });
  running = true;
}

initGame();

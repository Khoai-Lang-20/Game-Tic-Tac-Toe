const menuScreen = document.getElementById('menu-screen');
const gameScreen = document.getElementById('game-screen');
const startBtn = document.getElementById('start-btn');
const backMenuBtn = document.getElementById('back-menu-btn');
const restartBtn = document.getElementById('restart-btn');

const modeSelect = document.getElementById('mode-select');
const player1Input = document.getElementById('player1-name');
const player2Input = document.getElementById('player2-name');
const symbolSelect = document.getElementById('symbol-select');
const p2Group = document.getElementById('p2-group');
const turnDisplay = document.getElementById('turn-display');

const cells = document.querySelectorAll('.cell');

const winPatterns = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

let options = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "X";
let running = true;
let isBotThinking = false;

let gameConfig = {
  mode: "pvp", // pvp hoặc pve
  p1Name: "Player 1",
  p2Name: "Player 2",
  p1Symbol: "X",
  p2Symbol: "O",
  isBot: false
};

// Ẩn/hiện tên người chơi 2 tùy theo chế độ
modeSelect.addEventListener('change', () => {
  if (modeSelect.value === 'pve') {
    p2Group.style.display = 'none';
    player2Input.value = "🤖 Máy thông minh";
  } else {
    p2Group.style.display = 'block';
    player2Input.value = "Player 2";
  }
});

// Nút Bắt đầu chơi từ Menu
startBtn.addEventListener('click', () => {
  gameConfig.mode = modeSelect.value;
  gameConfig.p1Name = player1Input.value.trim() || "Player 1";
  gameConfig.p1Symbol = symbolSelect.value;
  gameConfig.p2Symbol = gameConfig.p1Symbol === "X" ? "O" : "X";

  if (gameConfig.mode === 'pve') {
    gameConfig.p2Name = "🤖 Máy";
    gameConfig.isBot = true;
  } else {
    gameConfig.p2Name = player2Input.value.trim() || "Player 2";
    gameConfig.isBot = false;
  }

  // Chuyển màn hình
  menuScreen.classList.add('hidden');
  gameScreen.classList.remove('hidden');

  resetGameData();
});

// Nút quay lại Menu
backMenuBtn.addEventListener('click', () => {
  gameScreen.classList.add('hidden');
  menuScreen.classList.remove('hidden');
});

restartBtn.addEventListener('click', resetGameData);

function resetGameData() {
  options = ["", "", "", "", "", "", "", "", ""];
  currentPlayer = "X"; // Luôn bắt đầu từ X
  running = true;
  isBotThinking = false;

  cells.forEach(cell => {
    cell.textContent = "";
    cell.classList.remove('x', 'o');
  });

  updateTurnText();

  // Nếu chế độ PvE và người chơi chọn quân O (Máy đánh trước quân X)
  if (gameConfig.isBot && gameConfig.p1Symbol === "O") {
    isBotThinking = true;
    turnDisplay.innerHTML = `🤖 Máy đang nghĩ...`;
    setTimeout(() => {
      botMove();
      isBotThinking = false;
    }, 500);
  }
}

function updateTurnText() {
  let activeName = (currentPlayer === gameConfig.p1Symbol) ? gameConfig.p1Name : gameConfig.p2Name;
  turnDisplay.innerHTML = `Lượt đi: <strong>${activeName} (${currentPlayer})</strong>`;
}

// Xử lý khi click vào ô bàn cờ
cells.forEach(cell => {
  cell.addEventListener('click', function() {
    const index = this.getAttribute('data-index');

    if (options[index] !== "" || !running || isBotThinking) return;

    // Kiểm tra xem có phải lượt của máy không (trong chế độ PvE)
    if (gameConfig.isBot && currentPlayer !== gameConfig.p1Symbol) return;

    makeMove(index, currentPlayer);
    if (checkGameStatus()) return;

    // Nếu là chế độ PvE và đến lượt máy
    if (gameConfig.isBot && currentPlayer !== gameConfig.p1Symbol && running) {
      isBotThinking = true;
      turnDisplay.innerHTML = `🤖 Máy đang suy nghĩ...`;
      setTimeout(() => {
        botMove();
        isBotThinking = false;
      }, 450);
    }
  });
});

function makeMove(index, symbol) {
  options[index] = symbol;
  const cell = document.querySelector(`.cell[data-index="${index}"]`);
  cell.textContent = symbol;
  cell.classList.add(symbol.toLowerCase());
}

function checkGameStatus() {
  let roundWon = false;
  let winningPattern = null;

  for (let pattern of winPatterns) {
    const [a, b, c] = pattern;
    if (options[a] && options[a] === options[b] && options[a] === options[c]) {
      roundWon = true;
      winningPattern = pattern;
      break;
    }
  }

  if (roundWon) {
    let winnerName = (currentPlayer === gameConfig.p1Symbol) ? gameConfig.p1Name : gameConfig.p2Name;
    turnDisplay.innerHTML = `🎉 <strong>${winnerName} (${currentPlayer}) CHIẾN THẮNG!</strong>`;
    running = false;
    return true;
  } else if (!options.includes("")) {
    turnDisplay.innerHTML = `🤝 <strong>TRẬN ĐẤU HÒA!</strong>`;
    running = false;
    return true;
  } else {
    currentPlayer = (currentPlayer === "X") ? "O" : "X";
    updateTurnText();
    return false;
  }
}

// Logic thông minh cho Bot
function botMove() {
  let emptyIndices = [];
  options.forEach((val, idx) => {
    if (val === "") emptyIndices.push(idx);
  });

  if (emptyIndices.length === 0 || !running) return;

  let botSymbol = gameConfig.p1Symbol === "X" ? "O" : "X";
  let playerSymbol = gameConfig.p1Symbol;

  // 1. Bot tìm nước thắng ngay
  let bestMove = findWinningMove(botSymbol);
  
  // 2. Chặn người chơi thắng
  if (bestMove === null) {
    bestMove = findWinningMove(playerSymbol);
  }

  // 3. Đánh ngẫu nhiên nếu không có nước đặc biệt
  if (bestMove === null) {
    const randomIndex = Math.floor(Math.random() * emptyIndices.length);
    bestMove = emptyIndices[randomIndex];
  }

  makeMove(bestMove, botSymbol);
  checkGameStatus();
}

function findWinningMove(symbol) {
  for (let pattern of winPatterns) {
    const [a, b, c] = pattern;
    const values = [options[a], options[b], options[c]];
    if (values.filter(v => v === symbol).length === 2 && values.includes("")) {
      if (options[a] === "") return a;
      if (options[b] === "") return b;
      if (options[c] === "") return c;
    }
  }
  return null;
}

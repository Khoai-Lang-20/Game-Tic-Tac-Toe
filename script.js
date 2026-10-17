const cells = document.querySelectorAll('.cell');
const statusText = document.getElementById('status');
const restartBtn = document.getElementById('restart-btn');

// Các trường hợp thắng (hàng ngang, dọc, chéo)
const winPatterns = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Ngang
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Dọc
  [0, 4, 8], [2, 4, 6]             // Chéo
];

let options = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "X";
let running = true;

// Khởi tạo game
function initGame() {
  cells.forEach(cell => cell.addEventListener('click', cellClicked));
  restartBtn.addEventListener('click', restartGame);
  statusText.innerHTML = `Lượt của: <span>${currentPlayer}</span>`;
}

function cellClicked() {
  const cellIndex = this.getAttribute('data-index');

  // Nếu ô đã được đánh hoặc game đã kết thúc thì dừng lại
  if (options[cellIndex] !== "" || !running) {
    return;
  }

  updateCell(this, cellIndex);
  checkWinner();
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

    if (cellA === "" || cellB === "" || cellC === "") {
      continue;
    }
    if (cellA === cellB && cellB === cellC) {
      roundWon = true;
      break;
    }
  }

  if (roundWon) {
    statusText.innerHTML = `🎉 <strong>Người chơi ${currentPlayer} đã CHIẾN THẮNG!</strong>`;
    running = false;
  } else if (!options.includes("")) {
    statusText.innerHTML = `🤝 <strong>HÒA CỜ!</strong>`;
    running = false;
  } else {
    changePlayer();
  }
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

// Chạy game khi tải xong
initGame();

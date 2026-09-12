"use strict";
const READY = "READY", PLAYING = "PLAYING", GAME_OVER = "GAME_OVER";
const GAME_TIME = 30;
// 1: 벽, 0: 길. 좌표는 0부터 시작한다.
const mazeMap = [
 "11111111111", "10000010001", "10111010101", "10100000101",
 "10101111101", "10001000001", "11111011101", "10000010001",
 "10111110111", "10000000001", "11111111111"
].map(row => [...row].map(Number));
const startPosition = { row: 1, col: 1 }, exitPosition = { row: 9, col: 9 };
const directions = { up: [-1,0], down: [1,0], left: [0,-1], right: [0,1] };
let score = 0, timeLeft = GAME_TIME, gameState = READY;
let playerRow = startPosition.row, playerCol = startPosition.col;
let timerId = null, deadline = 0, resultType = null;
const maze = document.querySelector("#maze");
const scoreElement = document.querySelector("#score"), timeElement = document.querySelector("#time-left");
const startButton = document.querySelector("#start-button"), restartButton = document.querySelector("#restart-button");
const resultPanel = document.querySelector("#result-panel"), guideText = document.querySelector("#guide-text");
const catSound = document.querySelector("#cat-sound");
const moveButtons = [...document.querySelectorAll("button[data-direction]")];
const player = document.createElement("span");
player.className = "player"; player.dataset.direction = "down";
const catAsset = new Image();
catAsset.onerror = () => { player.classList.add("fallback"); player.textContent = "🐱"; };
catAsset.src = "./images/cat.png";
function createMaze() {
 maze.replaceChildren();
 mazeMap.forEach((row,r) => row.forEach((wall,c) => {
  const cell = document.createElement("div"); cell.className = wall ? "cell wall" : "cell";
  const isStart = r === startPosition.row && c === startPosition.col;
  const isExit = r === exitPosition.row && c === exitPosition.col;
  if (isStart || isExit) {
   cell.classList.add(isExit ? "exit" : "entrance");
   const door = document.createElement("img"); door.className = "door"; door.alt = ""; door.src = "./images/door.png";
   door.onerror = () => { door.hidden = true; };
   const label = document.createElement("span"); label.className = "cell-label"; label.textContent = isExit ? "출구" : "출발";
   cell.append(door,label);
  }
  maze.append(cell);
 })); renderPlayer();
}
function renderPlayer() {
 maze.children[playerRow * mazeMap[0].length + playerCol].append(player);
 maze.setAttribute("aria-label", `미로: 고양이 ${playerRow+1}행 ${playerCol+1}열, 출구 ${exitPosition.row+1}행 ${exitPosition.col+1}열. 파란 칸은 벽입니다.`);
}
function updateStatus() { scoreElement.textContent = score; timeElement.textContent = timeLeft; }
function playCatSound() { catSound.pause(); catSound.currentTime = 0; catSound.play().catch(() => {}); }
function canMove(row,col) { return mazeMap[row]?.[col] === 0; }
function checkExit() { return playerRow === exitPosition.row && playerCol === exitPosition.col; }
function calculateScore() { return 100 + timeLeft * 10; }
function movePlayer(direction) {
 if (gameState !== PLAYING || !directions[direction]) return;
 updateTimer(); if (gameState !== PLAYING) return;
 const [dr,dc] = directions[direction]; player.dataset.direction = direction;
 if (!canMove(playerRow+dr,playerCol+dc)) return;
 playerRow += dr; playerCol += dc; renderPlayer();
 if (checkExit()) endGame("success");
}
function updateTimer() {
 if (gameState !== PLAYING) return;
 timeLeft = Math.max(0,Math.ceil((deadline-performance.now())/1000)); updateStatus();
 if (timeLeft === 0) endGame("failure");
}
function startGame() {
 if (gameState === PLAYING) return;
 clearInterval(timerId); score = 0; timeLeft = GAME_TIME; resultType = null;
 playerRow = startPosition.row; playerCol = startPosition.col; player.dataset.direction = "down";
 gameState = PLAYING; deadline = performance.now()+GAME_TIME*1000;
 resultPanel.hidden = true; startButton.hidden = true;
 moveButtons.forEach(button => { button.disabled = false; });
 guideText.textContent = "벽을 피해 초록색 출구까지 한 칸씩 이동하세요!";
 renderPlayer(); updateStatus(); maze.focus({preventScroll:true});
 playCatSound(); timerId = setInterval(updateTimer,100);
}
function endGame(type) {
 if (gameState !== PLAYING) return;
 gameState = GAME_OVER; resultType = type; clearInterval(timerId); timerId = null;
 score = type === "success" ? calculateScore() : 0; updateStatus();
 moveButtons.forEach(button => { button.disabled = true; });
 document.querySelector("#result-title").textContent = type === "success" ? "탈출 성공! 🎉" : "시간 초과!";
 document.querySelector("#final-score").textContent = score;
 guideText.textContent = type === "success" ? "고양이가 교실을 탈출했어요!" : "30초가 지났어요. 다시 도전해 보세요!";
 resultPanel.hidden = false; restartButton.focus({preventScroll:true}); playCatSound();
}
function resetGame() { startGame(); }
startButton.addEventListener("click",startGame);
restartButton.addEventListener("click",resetGame);
moveButtons.forEach(button => button.addEventListener("click",() => movePlayer(button.dataset.direction)));
document.addEventListener("keydown",event => {
 const direction = {ArrowUp:"up",ArrowDown:"down",ArrowLeft:"left",ArrowRight:"right"}[event.key];
 if (!direction || event.altKey || event.ctrlKey || event.metaKey) return;
 event.preventDefault(); movePlayer(direction);
});
createMaze(); updateStatus();

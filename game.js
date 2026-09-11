// 게임에서 사용할 상태 이름
const READY = "READY";
const PLAYING = "PLAYING";
const GAME_OVER = "GAME_OVER";

const GAME_TIME = 30;
let score = 0;
let timeLeft = GAME_TIME;
let gameState = READY;
let timerId = null;

const scoreElement = document.querySelector("#score");
const timeElement = document.querySelector("#time-left");
const finalScoreElement = document.querySelector("#final-score");
const guideText = document.querySelector("#guide-text");
const gameArea = document.querySelector("#game-area");
const catTarget = document.querySelector("#cat-target");
const readyPanel = document.querySelector("#ready-panel");
const resultPanel = document.querySelector("#result-panel");
const startButton = document.querySelector("#start-button");
const restartButton = document.querySelector("#restart-button");
const catSound = document.querySelector("#cat-sound");

// 현재 점수와 시간을 화면에 표시한다.
function updateStatus() {
  scoreElement.textContent = score;
  timeElement.textContent = timeLeft;
}

// 울음소리를 처음부터 한 번 재생한다.
function playCatSound() {
  catSound.pause();
  catSound.currentTime = 0;
  catSound.play().catch(() => {
    // 소리를 재생할 수 없어도 게임은 계속 진행한다.
  });
}

// 고양이가 게임 영역을 벗어나지 않는 임의 위치를 찾는다.
function moveTarget() {
  const maxX = Math.max(0, gameArea.clientWidth - catTarget.offsetWidth);
  const maxY = Math.max(0, gameArea.clientHeight - catTarget.offsetHeight);
  const randomX = Math.floor(Math.random() * (maxX + 1));
  const randomY = Math.floor(Math.random() * (maxY + 1));

  catTarget.style.left = randomX + "px";
  catTarget.style.top = randomY + "px";
}

// 게임 진행 중 고양이를 클릭했을 때만 점수를 올린다.
function handleTargetClick() {
  if (gameState !== PLAYING) {
    return;
  }

  score += 1;
  scoreElement.textContent = score;
  moveTarget();
}

// 1초마다 시간을 줄이고 0초에 게임을 종료한다.
function updateTimer() {
  if (gameState !== PLAYING) {
    return;
  }

  timeLeft -= 1;

  if (timeLeft <= 0) {
    timeLeft = 0;
    updateStatus();
    endGame();
    return;
  }

  updateStatus();
}

// 게임을 시작하고 클릭 대상과 타이머를 활성화한다.
function startGame() {
  if (gameState === PLAYING) {
    return;
  }

  clearInterval(timerId);
  score = 0;
  timeLeft = GAME_TIME;
  gameState = PLAYING;

  updateStatus();
  readyPanel.classList.add("is-hidden");
  resultPanel.style.display = "none";
  startButton.classList.add("is-hidden");
  catTarget.style.display = "block";
  guideText.textContent = "움직이는 고양이를 빠르게 클릭하세요!";

  // 고양이가 보인 뒤 크기를 계산해 안전한 위치로 옮긴다.
  requestAnimationFrame(moveTarget);
  playCatSound();
  timerId = setInterval(updateTimer, 1000);
}

// 타이머와 클릭을 멈추고 최종 점수를 표시한다.
function endGame() {
  if (gameState !== PLAYING) {
    return;
  }

  gameState = GAME_OVER;
  clearInterval(timerId);
  timerId = null;

  catTarget.style.display = "none";
  finalScoreElement.textContent = score;
  resultPanel.style.display = "block";
  guideText.textContent = "게임이 끝났습니다. 다시 도전해 보세요!";
  playCatSound();
}

// 모든 값을 초기화한 뒤 새 게임을 시작한다.
function resetGame() {
  clearInterval(timerId);
  timerId = null;
  score = 0;
  timeLeft = GAME_TIME;
  gameState = READY;
  updateStatus();
  startGame();
}

startButton.addEventListener("click", startGame);
restartButton.addEventListener("click", resetGame);
catTarget.addEventListener("click", handleTargetClick);

// 화면 크기가 바뀌면 고양이를 안전한 범위에 다시 배치한다.
window.addEventListener("resize", () => {
  if (gameState === PLAYING) {
    moveTarget();
  }
});

updateStatus();

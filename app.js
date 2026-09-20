const ROUND_SECONDS = 120;

const screens = [...document.querySelectorAll(".screen")];
const namesInput = document.querySelector("#namesInput");
const nameCount = document.querySelector("#nameCount");
const chooseButton = document.querySelector("#chooseButton");
const clearNamesButton = document.querySelector("#clearNamesButton");
const selectedName = document.querySelector("#selectedName");
const playerName = document.querySelector("#playerName");
const finishedName = document.querySelector("#finishedName");
const timer = document.querySelector("#timer");
const timerFill = document.querySelector("#timerFill");
const questionType = document.querySelector("#questionType");
const questionText = document.querySelector("#questionText");
const questionHint = document.querySelector("#questionHint");

let questions = [];
let questionDeck = [];
let currentPlayer = "";
let previousPlayer = "";
let questionIndex = 0;
let questionsShown = 0;
let secondsRemaining = ROUND_SECONDS;
let timerId = null;

function showScreen(id) {
  screens.forEach((screen) => screen.classList.toggle("hidden", screen.id !== id));
}

function getNames() {
  return [...new Set(namesInput.value.split(/\n|,/).map((name) => name.trim()).filter(Boolean))];
}

function updateNameCount() {
  const count = getNames().length;
  nameCount.textContent = `${count} ${count === 1 ? "student" : "students"}`;
  chooseButton.disabled = count === 0 || questions.length === 0;
  localStorage.setItem("hotSeatNames", namesInput.value);
}

function shuffle(items) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function pickPlayer() {
  const names = getNames();
  const eligible = names.length > 1 ? names.filter((name) => name !== previousPlayer) : names;
  currentPlayer = eligible[Math.floor(Math.random() * eligible.length)];
  selectedName.textContent = currentPlayer;
  showScreen("selectedScreen");
}

function renderTimer() {
  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  timer.textContent = `${minutes}:${String(seconds).padStart(2, "0")}`;
  timerFill.style.width = `${(secondsRemaining / ROUND_SECONDS) * 100}%`;
  timer.classList.toggle("urgent", secondsRemaining <= 10);
}

function showNextQuestion() {
  if (questionIndex >= questionDeck.length) {
    questionDeck = shuffle(questions);
    questionIndex = 0;
  }
  const question = questionDeck[questionIndex];
  questionIndex += 1;
  questionsShown += 1;
  questionType.textContent = question.type === "choice" ? "This or That" : "One-Word Answer";
  questionText.textContent = question.text;
  questionHint.textContent = question.type === "choice" ? "Choose oneâno explanation needed." : "Answer with one word or a very short phrase.";
}

function startRound() {
  questionDeck = shuffle(questions);
  questionIndex = 0;
  questionsShown = 0;
  secondsRemaining = ROUND_SECONDS;
  playerName.textContent = currentPlayer;
  renderTimer();
  showNextQuestion();
  showScreen("gameScreen");
  timerId = window.setInterval(() => {
    secondsRemaining -= 1;
    renderTimer();
    if (secondsRemaining <= 0) finishRound();
  }, 1000);
}

function finishRound() {
  window.clearInterval(timerId);
  timerId = null;
  previousPlayer = currentPlayer;
  finishedName.textContent = currentPlayer;
  document.querySelector("#questionsAnswered").textContent = `${questionsShown} ${questionsShown === 1 ? "question" : "questions"} asked`;
  showScreen("finishedScreen");
}

async function loadQuestions() {
  try {
    const response = await fetch("questions.json");
    if (!response.ok) throw new Error("Could not load questions.");
    questions = await response.json();
    updateNameCount();
  } catch (error) {
    document.querySelector("#setupScreen").innerHTML = `
      <h2>Questions couldnât load</h2>
      <p class="helper">Run this folder from a small local web server or upload all four files together. Browsers block JSON loading when index.html is opened directly.</p>`;
  }
}

namesInput.value = localStorage.getItem("hotSeatNames") || "";
namesInput.addEventListener("input", updateNameCount);
chooseButton.addEventListener("click", pickPlayer);
clearNamesButton.addEventListener("click", () => { namesInput.value = ""; updateNameCount(); namesInput.focus(); });
document.querySelector("#pickAgainButton").addEventListener("click", pickPlayer);
document.querySelector("#startButton").addEventListener("click", startRound);
document.querySelector("#nextButton").addEventListener("click", showNextQuestion);
document.querySelector("#endButton").addEventListener("click", finishRound);
document.querySelector("#newRoundButton").addEventListener("click", pickPlayer);
document.querySelector("#backToNamesButton").addEventListener("click", () => showScreen("setupScreen"));
document.addEventListener("keydown", (event) => {
  if (event.code === "Space" && !document.querySelector("#gameScreen").classList.contains("hidden")) {
    event.preventDefault();
    showNextQuestion();
  }
});

updateNameCount();
loadQuestions();
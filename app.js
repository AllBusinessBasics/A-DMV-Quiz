const data = window.DMV_QUIZ_DATA;

const state = {
  modeKey: null,
  modeConfig: null,
  questions: [],
  currentIndex: 0,
  score: 0,
  answered: false,
  hintUsed: false,
  answers: [],
};

const bestScoreKey = "utah-permit-practice-best-scores";

const categoryHints = {
  permit: "Think about the official Utah permit rules: age, supervision, practice time, or test details.",
  testing: "Remember the handbook sample test and the rules for the driving skills test.",
  safety: "Pick the answer that protects people in the vehicle the most.",
  parking: "Look for the safest stop, the correct lane, or the exact no-parking distance.",
  rightOfWay: "When in doubt, give way to the person already there or the more vulnerable road user.",
  signals: "Traffic controls usually tell you to stop, slow down, yield, or stay in the correct lane.",
  alcoholRailroad: "These rules are strict. Think about the safest legal choice, not the easiest one.",
  signs: "Use the sign's shape and color first, then match the most common road meaning.",
};

const els = {
  heroFacts: document.getElementById("hero-facts"),
  sourceLinks: document.getElementById("source-links"),
  modeGrid: document.getElementById("mode-grid"),
  homeScreen: document.getElementById("home-screen"),
  quizScreen: document.getElementById("quiz-screen"),
  resultsScreen: document.getElementById("results-screen"),
  homeButton: document.getElementById("home-button"),
  resultsHomeButton: document.getElementById("results-home-button"),
  modeBadge: document.getElementById("mode-badge"),
  progressText: document.getElementById("progress-text"),
  scoreText: document.getElementById("score-text"),
  progressBar: document.getElementById("progress-bar"),
  category: document.getElementById("question-category"),
  source: document.getElementById("question-source"),
  questionText: document.getElementById("question-text"),
  imageWrap: document.getElementById("image-wrap"),
  questionImage: document.getElementById("question-image"),
  answerList: document.getElementById("answer-list"),
  hintPanel: document.getElementById("hint-panel"),
  hintText: document.getElementById("hint-text"),
  hintButton: document.getElementById("hint-button"),
  feedbackPanel: document.getElementById("feedback-panel"),
  feedbackTitle: document.getElementById("feedback-title"),
  feedbackText: document.getElementById("feedback-text"),
  nextButton: document.getElementById("next-button"),
  resultsTitle: document.getElementById("results-title"),
  resultsSummary: document.getElementById("results-summary"),
  resultsScore: document.getElementById("results-score"),
  resultsStatus: document.getElementById("results-status"),
  bestScore: document.getElementById("best-score"),
  weakAreas: document.getElementById("weak-areas"),
  retryModeButton: document.getElementById("retry-mode-button"),
  retryMissedButton: document.getElementById("retry-missed-button"),
};

function init() {
  renderHeroFacts();
  renderSourceLinks();
  renderModes();
  attachEvents();
}

function renderHeroFacts() {
  els.heroFacts.innerHTML = "";
  data.heroFacts.forEach((fact) => {
    const li = document.createElement("li");
    li.textContent = fact;
    els.heroFacts.appendChild(li);
  });
}

function renderSourceLinks() {
  els.sourceLinks.innerHTML = "";
  data.sourceLinks.forEach((link) => {
    const anchor = document.createElement("a");
    anchor.href = link.href;
    anchor.target = "_blank";
    anchor.rel = "noreferrer";
    anchor.textContent = link.label;
    els.sourceLinks.appendChild(anchor);
  });
}

function renderModes() {
  els.modeGrid.innerHTML = "";
  Object.entries(data.modes).forEach(([modeKey, mode]) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "mode-card";
    button.dataset.mode = modeKey;
    button.innerHTML = `
      <div class="mode-card-header">
        <div>
          <p class="section-tag">${mode.kicker}</p>
          <h3>${mode.label}</h3>
        </div>
        <span class="mode-pill">${mode.questionCount} Questions</span>
      </div>
      <p>${mode.description}</p>
      <div class="mode-meta">
        ${mode.meta.map((item) => `<span>${item}</span>`).join("")}
      </div>
    `;
    els.modeGrid.appendChild(button);
  });
}

function attachEvents() {
  els.modeGrid.addEventListener("click", (event) => {
    const button = event.target.closest("[data-mode]");
    if (!button) {
      return;
    }
    startMode(button.dataset.mode);
  });

  els.answerList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-answer-index]");
    if (!button || state.answered) {
      return;
    }
    submitAnswer(Number(button.dataset.answerIndex));
  });

  els.nextButton.addEventListener("click", () => {
    if (state.currentIndex === state.questions.length - 1) {
      showResults();
      return;
    }
    state.currentIndex += 1;
    state.answered = false;
    renderQuestion();
  });

  els.homeButton.addEventListener("click", showHome);
  els.resultsHomeButton.addEventListener("click", showHome);
  els.retryModeButton.addEventListener("click", () => startMode(state.modeKey));
  els.retryMissedButton.addEventListener("click", retryMissedQuestions);
  els.hintButton.addEventListener("click", showHint);
}

function startMode(modeKey, customQuestions = null) {
  state.modeKey = modeKey;
  state.modeConfig = data.modes[modeKey];
  state.questions = customQuestions ?? buildQuestionSet(state.modeConfig);
  state.currentIndex = 0;
  state.score = 0;
  state.answered = false;
  state.hintUsed = false;
  state.answers = [];

  els.homeScreen.classList.add("hidden");
  els.resultsScreen.classList.add("hidden");
  els.quizScreen.classList.remove("hidden");

  renderQuestion();
}

function buildQuestionSet(mode) {
  if (mode.onlyCategory) {
    return shuffle(sampleQuestions(getQuestionsByCategory(mode.onlyCategory), mode.questionCount));
  }

  const selected = [];
  const usedIds = new Set();

  Object.entries(mode.categoryTargets).forEach(([category, count]) => {
    const pool = getQuestionsByCategory(category).filter((question) => !usedIds.has(question.id));
    const picks = sampleQuestions(pool, count);
    picks.forEach((question) => {
      selected.push(question);
      usedIds.add(question.id);
    });
  });

  if (selected.length < mode.questionCount) {
    const fillPool = data.questions.filter((question) => !usedIds.has(question.id));
    const filler = sampleQuestions(fillPool, mode.questionCount - selected.length);
    filler.forEach((question) => {
      selected.push(question);
      usedIds.add(question.id);
    });
  }

  return shuffle(selected);
}

function getQuestionsByCategory(category) {
  return data.questions.filter((question) => question.category === category);
}

function sampleQuestions(pool, count) {
  const available = [...pool];
  const chosen = [];
  while (chosen.length < count && available.length > 0) {
    const index = Math.floor(Math.random() * available.length);
    chosen.push(available.splice(index, 1)[0]);
  }
  return chosen;
}

function shuffle(items) {
  const list = [...items];
  for (let i = list.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}

function renderQuestion() {
  const question = state.questions[state.currentIndex];
  const questionNumber = state.currentIndex + 1;
  const allowHints = state.modeConfig.allowHints !== false;

  state.hintUsed = false;
  els.modeBadge.textContent = state.modeConfig.label;
  els.progressText.textContent = `Question ${questionNumber} of ${state.questions.length}`;
  els.scoreText.textContent = `Correct ${state.score}`;
  els.progressBar.style.width = `${(questionNumber / state.questions.length) * 100}%`;
  els.category.textContent = data.categoryLabels[question.category];
  els.source.textContent = question.sourceLabel;
  els.questionText.textContent = question.prompt;
  els.hintPanel.classList.add("hidden");
  els.hintText.textContent = "";
  els.hintButton.disabled = !allowHints;
  els.hintButton.textContent = "Show Hint";
  els.hintButton.classList.toggle("hidden", !allowHints);
  els.feedbackPanel.classList.add("hidden");
  els.feedbackTitle.textContent = "";
  els.feedbackText.textContent = "";
  els.nextButton.disabled = true;
  els.nextButton.textContent =
    state.currentIndex === state.questions.length - 1 ? "See Results" : "Next Question";

  if (question.image) {
    els.questionImage.src = question.image.src;
    els.questionImage.alt = question.image.alt;
    els.imageWrap.classList.remove("hidden");
  } else {
    els.questionImage.removeAttribute("src");
    els.questionImage.alt = "";
    els.imageWrap.classList.add("hidden");
  }

  els.answerList.innerHTML = "";
  question.answers.forEach((answer, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "answer-button";
    button.dataset.answerIndex = String(index);
    button.textContent = answer;
    els.answerList.appendChild(button);
  });
}

function showHint() {
  if (state.answered || state.hintUsed || state.modeConfig.allowHints === false) {
    return;
  }

  const question = state.questions[state.currentIndex];
  const wrongIndexes = question.answers
    .map((_, index) => index)
    .filter((index) => index !== question.correctIndex);
  const buttons = [...els.answerList.querySelectorAll(".answer-button")];
  const hintText = categoryHints[question.category] ?? "Look for the safest legal answer.";

  let eliminated = [];
  if (wrongIndexes.length >= 3) {
    eliminated = shuffle(wrongIndexes).slice(0, 2);
  } else if (wrongIndexes.length === 2) {
    eliminated = shuffle(wrongIndexes).slice(0, 1);
  }

  eliminated.forEach((index) => {
    const button = buttons[index];
    if (!button) {
      return;
    }
    button.classList.add("hint-eliminated");
    button.disabled = true;
  });

  const eliminatedText = eliminated.length
    ? ` I crossed off ${eliminated
        .map((index) => `"${question.answers[index]}"`)
        .join(" and ")} for you.`
    : "";

  els.hintText.textContent = `${hintText}${eliminatedText}`;
  els.hintPanel.classList.remove("hidden");
  els.hintButton.disabled = true;
  els.hintButton.textContent = "Hint Used";
  state.hintUsed = true;
}

function submitAnswer(selectedIndex) {
  const question = state.questions[state.currentIndex];
  const buttons = [...els.answerList.querySelectorAll(".answer-button")];
  const isCorrect = selectedIndex === question.correctIndex;

  state.answered = true;
  els.hintButton.disabled = true;
  if (isCorrect) {
    state.score += 1;
  }

  state.answers.push({
    question,
    selectedIndex,
    isCorrect,
  });

  buttons.forEach((button, index) => {
    button.classList.add("locked");
    if (index === question.correctIndex) {
      button.classList.add("correct");
    }
    if (index === selectedIndex && index !== question.correctIndex) {
      button.classList.add("incorrect");
    }
  });

  els.feedbackPanel.classList.remove("hidden");
  els.feedbackTitle.textContent = isCorrect
    ? "Correct. Keep going."
    : `Not quite. The right answer is: ${question.answers[question.correctIndex]}`;
  els.feedbackText.textContent = question.explanation;
  els.nextButton.disabled = false;
  els.scoreText.textContent = `Correct ${state.score}`;
}

function showResults() {
  els.quizScreen.classList.add("hidden");
  els.resultsScreen.classList.remove("hidden");

  const total = state.questions.length;
  const percent = Math.round((state.score / total) * 100);
  const passingScore = state.modeConfig.passingScore ?? null;

  els.resultsTitle.textContent = `${state.modeConfig.label} complete`;
  els.resultsSummary.textContent = state.modeConfig.resultsSummary;
  els.resultsScore.textContent = `${state.score} / ${total}`;

  if (passingScore) {
    const passed = percent >= passingScore;
    if (state.modeConfig.showPassFailOnly) {
      els.resultsStatus.textContent = passed
        ? `You would've passed the Utah written test with ${percent}%.`
        : `You would've not passed the Utah written test. You got ${percent}%, and passing needs ${passingScore}% or better.`;
    } else {
      els.resultsStatus.textContent = passed
        ? `You passed this practice round with ${percent}%.`
        : `You got ${percent}%. Aim for ${passingScore}% or better.`;
    }
  } else {
    els.resultsStatus.textContent = `You got ${percent}% correct.`;
  }

  updateBestScore(state.modeKey, percent);
  els.bestScore.textContent = `${getBestScore(state.modeKey)}%`;
  renderWeakAreas();
}

function renderWeakAreas() {
  const missed = state.answers.filter((entry) => !entry.isCorrect);
  els.weakAreas.innerHTML = "";

  if (!missed.length) {
    const li = document.createElement("li");
    li.textContent = "Nothing missed this round. Try a harder mode next.";
    els.weakAreas.appendChild(li);
    return;
  }

  const counts = missed.reduce((accumulator, entry) => {
    const key = entry.question.category;
    accumulator[key] = (accumulator[key] ?? 0) + 1;
    return accumulator;
  }, {});

  Object.entries(counts)
    .sort((left, right) => right[1] - left[1])
    .slice(0, 3)
    .forEach(([category, count]) => {
      const li = document.createElement("li");
      li.textContent = `${data.categoryLabels[category]}: ${count} missed`;
      els.weakAreas.appendChild(li);
    });
}

function retryMissedQuestions() {
  const missedQuestions = state.answers
    .filter((entry) => !entry.isCorrect)
    .map((entry) => entry.question);

  if (!missedQuestions.length) {
    showHome();
    return;
  }

  startMode(state.modeKey, shuffle(missedQuestions));
}

function showHome() {
  els.quizScreen.classList.add("hidden");
  els.resultsScreen.classList.add("hidden");
  els.homeScreen.classList.remove("hidden");
}

function getBestScore(modeKey) {
  const saved = JSON.parse(localStorage.getItem(bestScoreKey) ?? "{}");
  return saved[modeKey] ?? 0;
}

function updateBestScore(modeKey, percent) {
  const saved = JSON.parse(localStorage.getItem(bestScoreKey) ?? "{}");
  saved[modeKey] = Math.max(saved[modeKey] ?? 0, percent);
  localStorage.setItem(bestScoreKey, JSON.stringify(saved));
}

init();

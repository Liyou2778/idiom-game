// ==================== 游戏状态 ====================

const state = {

  questions: [],

  currentIndex: 0,

  score: 0,

  streak: 0,

  maxStreak: 0,

  totalCorrect: 0,

  startTime: null,

  elapsedTime: 0,

  timerInterval: null,

  correctChars: [false, false, false, false],

  attempts: 0,

  questionTimes: [],

  isTransitioning: false,

};



// ==================== DOM 引用 ====================

const $ = (sel) => document.querySelector(sel);

const $$ = (sel) => document.querySelectorAll(sel);



const screens = {

  start: $('#start-screen'),

  game: $('#game-screen'),

  result: $('#result-screen'),

};



const dom = {

  startBtn: $('#start-btn'),

  restartBtn: $('#restart-btn'),

  submitBtn: $('#submit-btn'),

  answerInput: $('#answer-input'),

  idiomImage: $('#idiom-image'),

  imageLoading: $('#image-loading'),

  questionNum: $('#question-num'),

  totalQuestions: $('#total-questions'),

  score: $('#score'),

  streak: $('#streak'),

  time: $('#time'),

  charSlots: $$('.char-slot'),

  feedback: $('#feedback'),

  finalScore: $('#final-score'),

  resultCorrect: $('#result-correct'),

  resultMaxStreak: $('#result-max-streak'),

  resultAvgTime: $('#result-avg-time'),

  resultTotal: $('#result-total'),

  resultEmoji: $('#result-emoji'),

  resultDetails: $('#result-details'),
  hintBtn: $('#hint-btn'),

};



// 使用相对路径（兼容直接打开 HTML 和 GitHub Pages）





// ==================== 题库加载 ====================

async function loadQuestions() {
  state.questions = [{"id": 1, "answer": "一针见血", "difficulty": 1, "image": "images/1.png", "hint": "跟医疗有关"}, {"id": 2, "answer": "对牛弹琴", "difficulty": 1, "image": "images/2.png", "hint": "跟听众有关"}, {"id": 3, "answer": "画蛇添足", "difficulty": 2, "image": "images/3.png", "hint": "多余的操作"}, {"id": 4, "answer": "守株待兔", "difficulty": 2, "image": "images/4.png", "hint": "不劳而获"}, {"id": 5, "answer": "亡羊补牢", "difficulty": 2, "image": "images/5.png", "hint": "为时未晚"}, {"id": 6, "answer": "杯弓蛇影", "difficulty": 3, "image": "images/6.png", "hint": "虚幻的恐惧"}, {"id": 7, "answer": "掩耳盗铃", "difficulty": 3, "image": "images/7.png", "hint": "自欺欺人"}, {"id": 8, "answer": "刻舟求剑", "difficulty": 3, "image": "images/8.png", "hint": "不懂变通"}, {"id": 9, "answer": "买椟还珠", "difficulty": 4, "image": "images/9.png", "hint": "取舍不当"}, {"id": 10, "answer": "叶公好龙", "difficulty": 4, "image": "images/10.png", "hint": "表面喜欢"}];
}

function loadQuestionsXHR() {

  return new Promise((resolve, reject) => {

    const xhr = new XMLHttpRequest();

    xhr.open('GET', DATA_URL, true);

    xhr.onload = function () {

      state.questions = JSON.parse(this.responseText);

      resolve();

    };

    xhr.onerror = reject;

    xhr.send();

  });

}



// ==================== 画面切换 ====================

function showScreen(name) {

  Object.values(screens).forEach((s) => s.classList.remove('active'));

  screens[name].classList.add('active');

}



// ==================== 计分系统 ====================

function calculateScore(elapsedSeconds) {

  let speedBonus = 0;

  if (elapsedSeconds <= 5) speedBonus = 5;

  else if (elapsedSeconds <= 10) speedBonus = 3;

  else if (elapsedSeconds <= 20) speedBonus = 1;



  const streakBonus = Math.max(0, state.streak) * 2;



  return {

    base: 10,

    speedBonus,

    streakBonus,

    total: 10 + speedBonus + streakBonus,

  };

}



// ==================== 计时器 ====================

function startTimer() {

  state.startTime = Date.now();

  state.elapsedTime = 0;

  if (dom.time) dom.time.textContent = '0';

  clearInterval(state.timerInterval);

  state.timerInterval = setInterval(() => {

    state.elapsedTime = Math.floor((Date.now() - state.startTime) / 1000);

    if (dom.time) dom.time.textContent = state.elapsedTime;

  }, 200);

}



function stopTimer() {

  clearInterval(state.timerInterval);

}



function getElapsed() {

  return Math.floor((Date.now() - state.startTime) / 1000);

}



// ==================== 题目加载 ====================

function loadQuestion(index) {

  const q = state.questions[index];

  if (!q) return;



  state.correctChars = [false, false, false, false];

  state.attempts = 0;



  dom.questionNum.textContent = index + 1;

  dom.totalQuestions.textContent = state.questions.length;

  dom.score.textContent = state.score;

  dom.streak.textContent = state.streak;



  dom.charSlots.forEach((slot) => {

    slot.textContent = '';

    slot.className = 'char-slot';

    slot.dataset.locked = 'false';

  });



  dom.answerInput.value = '';

  dom.answerInput.disabled = false;

  dom.submitBtn.disabled = false;

  dom.feedback.classList.add('hidden');

  dom.feedback.textContent = '';



  // 加载图片（相对路径）

  dom.idiomImage.classList.add('loading');

  dom.imageLoading.classList.remove('hidden');

  dom.idiomImage.src = '';



  const img = new Image();

  img.onload = () => {

    dom.idiomImage.src = img.src;

    dom.idiomImage.classList.remove('loading');

    dom.imageLoading.classList.add('hidden');

  };

  img.onerror = () => {

    // 生成彩色占位图

    const canvas = document.createElement('canvas');

    canvas.width = 320;

    canvas.height = 240;

    const ctx = canvas.getContext('2d');

    const colors = ['#ff6b9d', '#c44dff', '#6bc5ff', '#ffd93d', '#4ecdc4'];

    const color = colors[q.id % colors.length];

    ctx.fillStyle = color + '40';

    ctx.fillRect(0, 0, 320, 240);

    ctx.fillStyle = color;

    ctx.font = '24px sans-serif';

    ctx.textAlign = 'center';

    ctx.textBaseline = 'middle';

    ctx.fillText('图 ' + q.id + ' 待加载', 160, 100);

    ctx.font = '14px sans-serif';

    ctx.fillStyle = 'rgba(255,255,255,0.6)';

    ctx.fillText(q.answer.replace(/./g, '？'), 160, 140);

    dom.idiomImage.src = canvas.toDataURL();

    dom.idiomImage.classList.remove('loading');

    dom.imageLoading.classList.add('hidden');

  };

  img.src = q.image;



  startTimer();

  setTimeout(function () { dom.answerInput.focus(); }, 300);

}



// ==================== 答案检查 ====================

function checkAnswer() {

  if (state.isTransitioning) return;



  const q = state.questions[state.currentIndex];

  if (!q) return;



  const input = dom.answerInput.value.trim();

  if (input.length !== 4) {

    showFeedback('请输入四个字', 'warn');

    return;

  }



  state.attempts++;



  const answerChars = q.answer.split('');

  const inputChars = input.split('');

  const newCorrect = state.correctChars.slice();

  let anyNewCorrect = false;



  inputChars.forEach(function (ch, i) {

    if (!state.correctChars[i] && ch === answerChars[i]) {

      newCorrect[i] = true;

      anyNewCorrect = true;

    }

  });



  const allCorrect = newCorrect.every(function (b) { return b; });



  if (allCorrect) {

    handleCorrectAnswer();

  } else {

    handleWrongAnswer(newCorrect, anyNewCorrect);

  }

}



function handleCorrectAnswer() {

  stopTimer();

  state.isTransitioning = true;



  const elapsed = getElapsed();

  const scoreInfo = calculateScore(elapsed);



  state.score += scoreInfo.total;

  state.streak++;

  state.totalCorrect++;

  if (state.streak > state.maxStreak) state.maxStreak = state.streak;

  state.questionTimes.push(elapsed);



  const q = state.questions[state.currentIndex];

  const chars = q.answer.split('');

  dom.charSlots.forEach(function (slot, i) {

    slot.textContent = chars[i];

    slot.className = 'char-slot correct-pop';

    slot.dataset.locked = 'true';

  });



  dom.score.textContent = state.score;

  dom.streak.textContent = state.streak;



  var bonusParts = [];

  if (scoreInfo.speedBonus > 0) bonusParts.push('速度+' + scoreInfo.speedBonus);

  if (scoreInfo.streakBonus > 0) bonusParts.push('连对+' + scoreInfo.streakBonus);

  var bonusText = bonusParts.length ? ' (' + bonusParts.join(' ') + ')' : '';



  showFeedback('✅ 正确！+' + scoreInfo.total + '分' + bonusText, 'success');



  dom.answerInput.disabled = true;

  dom.submitBtn.disabled = true;



  setTimeout(function () {

    state.isTransitioning = false;

    state.currentIndex++;

    if (state.currentIndex >= state.questions.length) {

      showResultScreen();

    } else {

      loadQuestion(state.currentIndex);

    }

  }, 2000);

}



function handleWrongAnswer(newCorrect, anyNewCorrect) {

  state.correctChars = newCorrect;
  state.streak = 0;


  const q = state.questions[state.currentIndex];

  const chars = q.answer.split('');



  dom.charSlots.forEach(function (slot, i) {

    if (newCorrect[i]) {

      slot.textContent = chars[i];

      slot.className = 'char-slot locked';

      slot.dataset.locked = 'true';

    } else {

      slot.textContent = '';

      slot.className = 'char-slot';

      slot.dataset.locked = 'false';

    }

  });



  dom.answerInput.value = '';

  dom.answerInput.focus();



  var lockedCount = newCorrect.filter(Boolean).length;

  if (lockedCount > 0) {

    showFeedback('还有 ' + (4 - lockedCount) + ' 个字不对，再想想！', 'info');

  } else {

    showFeedback('❌ 不对哦，再试试！', 'error');

  }

}



// ==================== 反馈显示 ====================

var feedbackTimeout = null;



function showFeedback(text, type) {

  if (!type) type = 'info';

  dom.feedback.textContent = text;

  dom.feedback.className = 'feedback ' + type;

  dom.feedback.classList.remove('hidden');



  clearTimeout(feedbackTimeout);

  if (type !== 'success') {

    feedbackTimeout = setTimeout(function () {

      dom.feedback.classList.add('hidden');

    }, 2000);

  }

}



// ==================== 提示功能 ====================

function showHint() {

  const q = state.questions[state.currentIndex];

  if (!q || !q.hint) return;

  showFeedback('💡 提示：' + q.hint, 'info');

}



// ==================== 结果画面 ====================

function showResultScreen() {

  showScreen('result');



  dom.finalScore.textContent = state.score;

  dom.resultCorrect.textContent = state.totalCorrect;

  dom.resultMaxStreak.textContent = state.maxStreak;

  dom.resultTotal.textContent = state.questions.length;



  var avgTime = state.questionTimes.length

    ? (state.questionTimes.reduce(function(a, b) { return a + b; }, 0) / state.questionTimes.length).toFixed(1)

    : '-';

  dom.resultAvgTime.textContent = avgTime;



  var ratio = state.totalCorrect / state.questions.length;

  var emoji, grade;

  if (ratio >= 1) {

    emoji = '🏆'; grade = 'S - 成语大师！';

  } else if (ratio >= 0.8) {

    emoji = '🌟'; grade = 'A - 博学多才！';

  } else if (ratio >= 0.6) {

    emoji = '👍'; grade = 'B - 知识渊博！';

  } else if (ratio >= 0.4) {

    emoji = '💪'; grade = 'C - 继续努力！';

  } else {

    emoji = '📖'; grade = 'D - 要多学习哦！';

  }

  dom.resultEmoji.textContent = emoji;



  dom.resultDetails.innerHTML = state.questionTimes

    .map(function(t, i) {

      var q = state.questions[i];

      return '<div class="detail-item">'

        + '<span class="detail-num">' + (i + 1) + '</span>'

        + '<span class="detail-answer">' + q.answer + '</span>'

        + '<span class="detail-time">' + t + 's</span>'

        + '</div>';

    })

    .join('');

}



// ==================== 键盘事件 ====================

function handleKeydown(e) {

  if (e.key === 'Enter') {

    e.preventDefault();

    checkAnswer();

  }

  if (e.key === 'h' || e.key === 'H') {

    showHint();

  }

}



// ==================== 初始化 ====================

document.addEventListener('DOMContentLoaded', function () {

  initGame();

});



async function initGame() {

  await loadQuestions();



  dom.totalQuestions.textContent = state.questions.length;



  dom.startBtn.addEventListener('click', startGame);

  dom.restartBtn.addEventListener('click', startGame);

  dom.submitBtn.addEventListener('click', checkAnswer);

  dom.answerInput.addEventListener('keydown', handleKeydown);
  dom.hintBtn.addEventListener('click', showHint);

  dom.hintBtn.addEventListener('click', showHint);

}



function startGame() {

  state.currentIndex = 0;

  state.score = 0;

  state.streak = 0;

  state.maxStreak = 0;

  state.totalCorrect = 0;

  state.questionTimes = [];

  state.isTransitioning = false;



  showScreen('game');

  loadQuestion(0);

}


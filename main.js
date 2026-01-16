let questions = [];
let answers = [];
let current = 0;
let lang = 'uz';
let total = 20;
let fio = '';
let time = 0;
let timer;

/* REAL IMTIHON */
let isRealExam = false;
let wrongCount = 0;
const MAX_WRONG = 2;

const qEl = document.getElementById('question');
const imgEl = document.getElementById('qimage');
const optEl = document.getElementById('options');
const progEl = document.getElementById('progress');
const timerEl = document.getElementById('timer');
const testScreen = document.getElementById('testScreen');

/******** START ********/
function startExam(count, realMode = false) {
  fio = document.getElementById('fio').value.trim();
  if (!fio) return alert('F.I.O kiriting');

  total = count;
  isRealExam = realMode;
  wrongCount = 0;

  time = count === 20 ? 25 * 60 : 60 * 60;

  document.getElementById('startScreen').classList.add('hidden');
  document.getElementById('testScreen').classList.remove('hidden');

  loadQuestions();
  startTimer();
}

/******** DARK ********/
document.getElementById('darkBtn').onclick =
    () => document.body.classList.toggle('dark');

/******** LANG ********/
document.getElementById('langSelect').onchange = e => {
  lang = e.target.value;
  renderQuestion();
};

/******** LOAD ********/
function loadQuestions() {
  fetch('questions.json')
      .then(r => r.json())
      .then(data => {
        questions = data.sort(() => 0.5 - Math.random()).slice(0, total);
        answers = Array(total).fill(null);
        renderProgress();
        renderQuestion();
      });
}

/******** PROGRESS ********/
function renderProgress() {
  progEl.innerHTML = '';
  answers.forEach((a, i) => {
    const d = document.createElement('div');
    d.className = 'cell';
    d.textContent = i + 1;
    if (a) d.classList.add(a.correct ? 'correct' : 'wrong');
    d.onclick = () => { current = i; renderQuestion(); };
    progEl.appendChild(d);
  });
}

/******** QUESTION ********/
function renderQuestion() {
  const q = questions[current];
  qEl.textContent = `${current + 1}. ${q.text[lang]}`;
  imgEl.src = q.image || 'test.jpg';
  optEl.innerHTML = '';

  const saved = answers[current];

  for (let k in q.options) {
    const d = document.createElement('div');
    d.className = 'option';
    d.textContent = q.options[k][lang];

    if (saved) {
      d.classList.add('disabled');
      if (k === q.correct_option) d.classList.add('correct');
      if (k === saved.selected && !saved.correct) d.classList.add('wrong');
    }

    d.onclick = () => {
      if (answers[current]) return;

      const correct = k === q.correct_option;
      answers[current] = { selected: k, correct };

      /* REAL IMTIHON XATO NAZORATI */
      if (!correct && isRealExam) {
        wrongCount++;
        if (wrongCount > MAX_WRONG) {
          finish(true); // ⛔ 3-xato → darhol tugaydi
          return;
        }
      }

      renderProgress();
      renderQuestion();

      setTimeout(() => {
        const next = answers.findIndex(a => a === null);
        if (next !== -1) {
          current = next;
          renderQuestion();
        } else finish(false);
      }, 500);
    };

    optEl.appendChild(d);
  }
}

/******** TIMER ********/
function startTimer() {
  timer = setInterval(() => {
    time--;
    timerEl.textContent =
        String(Math.floor(time / 60)).padStart(2, '0') + ':' +
        String(time % 60).padStart(2, '0');
    if (time <= 0) finish(false);
  }, 1000);
}

/******** ZOOM ********/
let baseFont = 18;

document.getElementById('zoomIn').onclick = () => {
  if (baseFont < 26) {
    baseFont += 2;
    applyZoom();
  }
};

document.getElementById('zoomOut').onclick = () => {
  if (baseFont > 14) {
    baseFont -= 2;
    applyZoom();
  }
};

function applyZoom() {
  testScreen.style.fontSize = baseFont + 'px';
  qEl.style.fontSize = (baseFont + 4) + 'px';
}

function finish(forceFail = false) {
  clearInterval(timer);

  const score = answers.filter(a => a && a.correct).length;
  const failed = forceFail || (isRealExam && wrongCount > MAX_WRONG);

  // 🔥 GOOGLE SHEETS GA NATIJA YUBORISH
  fetch(SHEET_URL, {
    method: "POST",
    body: JSON.stringify({
      action: "result",
      fio: fio,
      phone: localStorage.getItem("userPhone"),
      score: score,
      total: total,
      wrong: wrongCount,
      status: failed ? "FAILED" : "PASSED",
      date: new Date().toLocaleString()
    })
  })
      .then(res => res.json())
      .then(data => {
        console.log("Result saved:", data);
      })
      .catch(err => console.error("Result error:", err));

  // 🔴 NATIJA EKRANI
  document.body.innerHTML = `
  <div class="start-screen">
    <h1 class="${failed ? 'result-fail' : 'result-success'}">
      ${failed ? 'IMTIHON TO‘XTATILDI' : 'IMTIHON YAKUNLANDI'}
    </h1>
    <h2 class="result-score">Natija: ${score} / ${total}</h2>
    <p class="result-wrong">Xatolar: ${wrongCount}</p>
    <p class="result-fio">${fio}</p>
    <button class="main-btn" onclick="location.reload()">Qayta</button>
  </div>`;
}


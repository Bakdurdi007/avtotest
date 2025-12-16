let questions = [];
let current = 0;
let answers = []; // {selected, correct}
let lang = 'uz';

const qEl = document.getElementById('question');
const imgEl = document.getElementById('qimage');
const optEl = document.getElementById('options');
const progEl = document.getElementById('progress');
const timerEl = document.getElementById('timer');

document.getElementById('langSelect').onchange = e => {
  lang = e.target.value;
  renderQuestion();
};

fetch('questions.json')
    .then(r => r.json())
    .then(data => {
      questions = data.sort(() => 0.5 - Math.random()).slice(0, 20);
      answers = Array(20).fill(null);
      renderProgress();
      renderQuestion();
    });

/******** PROGRESS ********/
function renderProgress() {
  progEl.innerHTML = '';
  answers.forEach((a, i) => {
    const d = document.createElement('div');
    d.className = 'cell';
    d.textContent = i + 1;
    if (a) d.classList.add(a.correct ? 'correct' : 'wrong');
    d.onclick = () => {
      current = i;
      renderQuestion();
    };
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

  for (let key in q.options) {
    const d = document.createElement('div');
    d.className = 'option';
    d.textContent = q.options[key][lang];

    if (saved) {
      d.classList.add('disabled');

      if (key === q.correct_option)
        d.classList.add('correct');

      if (key === saved.selected && !saved.correct)
        d.classList.add('wrong');
    }

    d.onclick = () => {
      if (answers[current]) return;

      const correct = key === q.correct_option;
      answers[current] = { selected: key, correct };

      renderProgress();
      renderQuestion();

      setTimeout(() => {
        const next = answers.findIndex(a => a === null);
        if (next !== -1) {
          current = next;
          renderQuestion();
        } else finishTest();
      }, 400);
    };

    optEl.appendChild(d);
  }
}

/******** TIMER ********/
let time = 25 * 60;
const interval = setInterval(() => {
  time--;
  timerEl.textContent =
      String(Math.floor(time / 60)).padStart(2, '0') + ':' +
      String(time % 60).padStart(2, '0');

  if (time <= 0) finishTest();
}, 1000);

/******** FINISH ********/
function finishTest() {
  clearInterval(interval);
  const score = answers.filter(a => a.correct).length;
  alert(`Test yakunlandi\nNatija: ${score}/20`);
  location.reload();
}

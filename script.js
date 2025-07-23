// script.js — logic for tabs, timer, localStorage, persistent choices

const dynamicSection = document.getElementById('dynamic-section');
const navBtns = document.querySelectorAll('.nav-btn');

// Tab state
let activeTab = localStorage.getItem('activeTab') || 'task';

// For "Совершенно секретно" tab
let secretClickCount = Number(localStorage.getItem('secretClickCount')) || 0;

// For timer
const MS_IN_DAY = 86400000;
const MS_IN_HOUR = 3600000;
const MS_IN_MIN = 60000;
let taskStart = localStorage.getItem('taskStart');

// Vacancy/task state
let selectedVacancy = localStorage.getItem('selectedVacancy') || '';
let selectedTask = localStorage.getItem('selectedTask') || '';

function saveState() {
  localStorage.setItem('activeTab', activeTab);
  localStorage.setItem('selectedVacancy', selectedVacancy);
  localStorage.setItem('selectedTask', selectedTask);
}

function setActiveTab(tab) {
  navBtns.forEach(btn => btn.classList.remove('active'));
  document.querySelector(`.nav-btn[data-tab="${tab}"]`).classList.add('active');
  activeTab = tab;
  saveState();
  renderTab(tab);
}

function renderTab(tab) {
  dynamicSection.innerHTML = '';
  if (tab === 'task') {
    renderTaskTab();
  } else if (tab === 'vacancy') {
    renderVacancyTab();
  } else if (tab === 'secret') {
    renderSecretTab();
  }
}

// --- Task Tab ---
function renderTaskTab() {
  if (localStorage.getItem('taskStarted')) {
    // Show task and timer
    dynamicSection.innerHTML = `
      <div class="fade-in">
        <div class="gold-text" style="margin-bottom:10px; font-size:1.3rem;">${selectedTask || 'Задание не выбрано'}</div>
        <div id="timer" class="timer gold-text"></div>
      </div>
    `;
    startTimer();
  } else {
    // If no vacancy selected, show prompt
    if (!selectedVacancy) {
      const msg = document.createElement('div');
      msg.className = 'fade-in gold-text';
      msg.style.marginBottom = '16px';
      msg.style.fontSize = '1.1rem';
      msg.textContent = 'Сначала выберите вакансию';
      dynamicSection.appendChild(msg);
      const btn = document.createElement('button');
      btn.textContent = 'Выбрать вакансию';
      btn.className = 'action-btn gold-border fade-in';
      btn.onclick = () => {
        setActiveTab('vacancy');
      };
      dynamicSection.appendChild(btn);
    } else {
      // Vacancy selected, allow to get task
      const btn = document.createElement('button');
      btn.textContent = 'Получить задание';
      btn.className = 'action-btn gold-border fade-in';
      btn.onclick = () => {
        localStorage.setItem('taskStarted', '1');
        const now = Date.now();
        localStorage.setItem('taskStart', now);
        taskStart = now;
        saveState();
        renderTaskTab();
      };
      dynamicSection.appendChild(btn);
    }
  }
}

function startTimer() {
  let timerEl = document.getElementById('timer');
  function update() {
    let start = Number(localStorage.getItem('taskStart'));
    let deadline = start + 3 * MS_IN_DAY;
    let now = Date.now();
    let left = Math.max(0, deadline - now);
    let days = Math.floor(left / MS_IN_DAY);
    let hours = Math.floor((left % MS_IN_DAY) / MS_IN_HOUR);
    let mins = Math.floor((left % MS_IN_HOUR) / MS_IN_MIN);
    timerEl.textContent = `${days} ${plural(days, 'день', 'дня', 'дней')} ${hours} ${plural(hours, 'час', 'часа', 'часов')} ${mins} ${plural(mins, 'минута', 'минуты', 'минут')}`;
    if (left > 0) {
      setTimeout(update, 1000 * 30);
    } else {
      timerEl.textContent = 'Время вышло';
      localStorage.removeItem('taskStarted');
      localStorage.removeItem('taskStart');
    }
  }
  update();
}

function plural(n, one, few, many) {
  n = Math.abs(n) % 100;
  let n1 = n % 10;
  if (n > 10 && n < 20) return many;
  if (n1 > 1 && n1 < 5) return few;
  if (n1 === 1) return one;
  return many;
}

// --- Vacancy Tab ---
const vacancies = [
  { role: 'Уборщик', task: 'Вымыть полы' },
  { role: 'Киллер', task: 'Ликвидировать Абдулхамида' },
  { role: 'Бизнесмен', task: 'Следить за бизнесом' },
  { role: 'Мафиози', task: 'Выбить долги у конкурентов' },
];

function renderVacancyTab() {
  // If already selected, show summary and option to изменить
  if (selectedVacancy && selectedTask) {
    const msg = document.createElement('div');
    msg.className = 'fade-in gold-text';
    msg.style.marginBottom = '18px';
    msg.style.fontSize = '1.15rem';
    msg.innerHTML = `Вы выбрали вакансию: <b>${selectedVacancy}</b><br>Задание: <span style='color:#fff;'>${selectedTask}</span>`;
    dynamicSection.appendChild(msg);
    const btn = document.createElement('button');
    btn.textContent = 'Изменить вакансию';
    btn.className = 'action-btn gold-border fade-in';
    btn.onclick = () => showVacancyList();
    dynamicSection.appendChild(btn);
    return;
  }
  // Otherwise, show выбор button
  const btn = document.createElement('button');
  btn.textContent = 'Выбрать вакансию';
  btn.className = 'action-btn gold-border fade-in';
  btn.onclick = () => showVacancyList();
  dynamicSection.appendChild(btn);
}

function showVacancyList() {
  dynamicSection.innerHTML = '';
  const list = document.createElement('div');
  list.className = 'vacancy-list fade-in';
  vacancies.forEach(v => {
    const vBtn = document.createElement('button');
    vBtn.className = 'vacancy-btn gold-border';
    vBtn.textContent = v.role;
    if (selectedVacancy === v.role) {
      vBtn.classList.add('selected-vacancy');
    }
    vBtn.onclick = () => {
      selectedVacancy = v.role;
      selectedTask = v.task;
      saveState();
      // Show confirmation + instruction
      dynamicSection.innerHTML = `<div class='fade-in gold-text' style='margin-top:16px;font-size:1.18rem;'>Вакансия выбрана: <b>${v.role}</b><br>Задание: <span style='color:#fff;'>${v.task}</span><br><span style='font-size:0.98em;opacity:0.8;'>Скиньте результат и фото в личку к Мистеру Андрею</span></div>`;
      // Option to перейти к получению задания
      const nextBtn = document.createElement('button');
      nextBtn.textContent = 'Перейти к получению задания';
      nextBtn.className = 'action-btn gold-border fade-in';
      nextBtn.style.marginTop = '22px';
      nextBtn.onclick = () => setActiveTab('task');
      dynamicSection.appendChild(nextBtn);
    };
    list.appendChild(vBtn);
  });
  dynamicSection.appendChild(list);
}

// --- Secret Tab ---
function renderSecretTab() {
  let msg;
  secretClickCount = Number(localStorage.getItem('secretClickCount')) || 0;
  if (secretClickCount === 0) {
    msg = 'Вам туда нельзя — это совершенно секретно';
  } else if (secretClickCount === 1) {
    msg = 'Вам же сказали — это секретно';
  } else if (secretClickCount === 2) {
    msg = 'Уйдите уже';
  } else {
    msg = 'Нет, ты не попадёшь сюда';
  }
  dynamicSection.innerHTML = `<div class='fade-in gold-text'>${msg}</div>`;
  secretClickCount++;
  localStorage.setItem('secretClickCount', secretClickCount);
}

// --- Nav Events ---
navBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    setActiveTab(btn.dataset.tab);
  });
});

// --- Initial render ---
setActiveTab(activeTab);

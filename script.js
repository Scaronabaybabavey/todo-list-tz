const STORAGE_KEY = 'todo-list-tasks';

const form = document.getElementById('add-form');
const input = document.getElementById('task-input');
const list = document.getElementById('task-list');
const empty = document.getElementById('empty');
const counter = document.getElementById('counter');
const filters = document.getElementById('filters');
const clearDoneBtn = document.getElementById('clear-done');

let tasks = loadTasks();
let currentFilter = 'all';

// --- Хранилище ---

function loadTasks() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// --- Действия ---

function addTask(text) {
  tasks.unshift({
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
    text,
    done: false,
  });
  saveTasks();
  render();
}

function toggleTask(id) {
  const task = tasks.find((t) => t.id === id);
  if (!task) return;
  task.done = !task.done;
  saveTasks();
  render();
}

function deleteTask(id) {
  tasks = tasks.filter((t) => t.id !== id);
  saveTasks();
  render();
}

function clearDone() {
  tasks = tasks.filter((t) => !t.done);
  saveTasks();
  render();
}

// --- Отрисовка ---

function pluralTasks(n) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return 'задача';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'задачи';
  return 'задач';
}

function createTaskElement(task) {
  const li = document.createElement('li');
  li.className = 'task' + (task.done ? ' is-done' : '');
  li.dataset.id = task.id;

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'task__check';
  checkbox.checked = task.done;
  checkbox.setAttribute('aria-label', 'Отметить как выполненную');

  const text = document.createElement('span');
  text.className = 'task__text';
  text.textContent = task.text; // textContent защищает от XSS

  const del = document.createElement('button');
  del.type = 'button';
  del.className = 'task__delete';
  del.textContent = '×';
  del.title = 'Удалить';
  del.setAttribute('aria-label', 'Удалить задачу');

  li.append(checkbox, text, del);
  return li;
}

function render() {
  const visible = tasks.filter((t) => {
    if (currentFilter === 'active') return !t.done;
    if (currentFilter === 'done') return t.done;
    return true;
  });

  list.replaceChildren(...visible.map(createTaskElement));

  const activeCount = tasks.filter((t) => !t.done).length;
  const doneCount = tasks.length - activeCount;

  counter.textContent = tasks.length
    ? `Осталось: ${activeCount} ${pluralTasks(activeCount)}`
    : '';

  empty.hidden = visible.length > 0;
  empty.textContent = tasks.length ? 'Здесь ничего нет' : 'Задач пока нет';
  clearDoneBtn.disabled = doneCount === 0;
}

// --- События ---

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) {
    input.classList.add('is-error');
    input.focus();
    return;
  }
  addTask(text);
  input.value = '';
  input.focus();
});

input.addEventListener('input', () => input.classList.remove('is-error'));

// Делегирование: один обработчик на весь список
list.addEventListener('click', (e) => {
  const li = e.target.closest('.task');
  if (!li) return;
  const { id } = li.dataset;

  if (e.target.closest('.task__delete')) {
    deleteTask(id);
  } else if (e.target.classList.contains('task__check') || e.target.classList.contains('task__text')) {
    toggleTask(id);
  }
});

filters.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-filter]');
  if (!btn) return;
  currentFilter = btn.dataset.filter;
  filters.querySelectorAll('[data-filter]').forEach((b) => {
    b.classList.toggle('is-active', b === btn);
  });
  render();
});

clearDoneBtn.addEventListener('click', clearDone);

// Синхронизация между вкладками
window.addEventListener('storage', (e) => {
  if (e.key === STORAGE_KEY) {
    tasks = loadTasks();
    render();
  }
});

render();

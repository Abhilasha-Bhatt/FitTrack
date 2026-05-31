const params = new URLSearchParams(window.location.search);
let email = params.get('email') || localStorage.getItem('fittrackEmail');
const userEmail = document.getElementById('userEmail');
const loggedMessage = document.getElementById('loggedMessage');
const backBtn = document.getElementById('backBtn');
const taskForm = document.getElementById('taskForm');
const taskInput = document.getElementById('taskInput');
const taskList = document.getElementById('taskList');
const taskCount = document.getElementById('taskCount');
const habitForm = document.getElementById('habitForm');
const habitInput = document.getElementById('habitInput');
const habitList = document.getElementById('habitList');
const streakTotal = document.getElementById('streakTotal');

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const today = new Date();
const currentDayIndex = today.getDay();
const storageTasksKey = () => `weeklyGoalTasks_${email}`;
const storageHabitsKey = () => `weeklyGoalHabits_${email}`;

const loadEmail = () => {
  if (!email) {
    email = localStorage.getItem('fittrackEmail');
  }

  if (!email) {
    userEmail.textContent = 'unknown';
    loggedMessage.textContent = 'Please sign in to use your weekly goal dashboard.';
    taskInput.disabled = true;
    habitInput.disabled = true;
    return false;
  }

  localStorage.setItem('fittrackEmail', email);
  userEmail.textContent = email;
  loggedMessage.textContent = 'Your weekly plan is ready.';
  return true;
};

const getStoredTasks = () => {
  try {
    return JSON.parse(localStorage.getItem(storageTasksKey())) || [];
  } catch (error) {
    return [];
  }
};

const getStoredHabits = () => {
  try {
    return JSON.parse(localStorage.getItem(storageHabitsKey())) || [];
  } catch (error) {
    return [];
  }
};

const saveTasks = (tasks) => {
  localStorage.setItem(storageTasksKey(), JSON.stringify(tasks));
};

const saveHabits = (habits) => {
  localStorage.setItem(storageHabitsKey(), JSON.stringify(habits));
};

const updateTaskCount = (tasks) => {
  const left = tasks.filter((task) => !task.completed).length;
  taskCount.textContent = `${left} remaining`;
};

const calculateStreak = (habit) => {
  const history = habit.history || Array(7).fill(false);
  let streak = 0;
  for (let i = currentDayIndex; i >= 0; i -= 1) {
    if (history[i]) {
      streak += 1;
    } else {
      break;
    }
  }
  return streak;
};

const renderTasks = () => {
  const tasks = getStoredTasks();
  taskList.innerHTML = '';
  tasks.forEach((task, index) => {
    const li = document.createElement('li');
    li.className = 'task-item';

    const label = document.createElement('label');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.completed;
    checkbox.addEventListener('change', () => {
      task.completed = checkbox.checked;
      saveTasks(tasks);
      renderTasks();
    });

    const text = document.createElement('span');
    text.className = `task-text${task.completed ? ' completed' : ''}`;
    text.textContent = task.title;

    label.appendChild(checkbox);
    label.appendChild(text);

    const actions = document.createElement('div');
    actions.className = 'task-actions';

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.textContent = 'Remove';
    removeBtn.addEventListener('click', () => {
      tasks.splice(index, 1);
      saveTasks(tasks);
      renderTasks();
    });

    actions.appendChild(removeBtn);
    li.appendChild(label);
    li.appendChild(actions);
    taskList.appendChild(li);
  });
  updateTaskCount(tasks);
};

const renderHabits = () => {
  const habits = getStoredHabits();
  habitList.innerHTML = '';
  let highestStreak = 0;

  habits.forEach((habit, habitIndex) => {
    const streak = calculateStreak(habit);
    highestStreak = Math.max(highestStreak, streak);

    const item = document.createElement('div');
    item.className = 'habit-item';

    const label = document.createElement('div');
    label.className = 'habit-label';

    const title = document.createElement('h3');
    title.textContent = habit.name;

    const meta = document.createElement('span');
    meta.textContent = `Streak: ${streak}`;

    label.appendChild(title);
    label.appendChild(meta);

    const dayGrid = document.createElement('div');
    dayGrid.className = 'habit-days';

    habit.history = habit.history || Array(7).fill(false);

    days.forEach((day, dayIndex) => {
      const dayBox = document.createElement('button');
      dayBox.type = 'button';
      dayBox.className = 'day-box';
      if (habit.history[dayIndex]) {
        dayBox.classList.add('active');
      }
      if (dayIndex === currentDayIndex) {
        dayBox.classList.add('today');
      }
      dayBox.textContent = day;
      dayBox.addEventListener('click', () => {
        habit.history[dayIndex] = !habit.history[dayIndex];
        saveHabits(habits);
        renderHabits();
      });
      dayGrid.appendChild(dayBox);
    });

    const actions = document.createElement('div');
    actions.className = 'habit-actions';
    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.textContent = 'Remove habit';
    deleteBtn.addEventListener('click', () => {
      habits.splice(habitIndex, 1);
      saveHabits(habits);
      renderHabits();
    });
    actions.appendChild(deleteBtn);

    item.appendChild(label);
    item.appendChild(dayGrid);
    item.appendChild(actions);
    habitList.appendChild(item);
  });

  streakTotal.textContent = `${highestStreak} streak`;
};

const handleTaskSubmit = (event) => {
  event.preventDefault();
  const title = taskInput.value.trim();
  if (!title) {
    return;
  }
  const tasks = getStoredTasks();
  tasks.push({ title, completed: false });
  saveTasks(tasks);
  taskInput.value = '';
  renderTasks();
};

const handleHabitSubmit = (event) => {
  event.preventDefault();
  const name = habitInput.value.trim();
  if (!name) {
    return;
  }
  const habits = getStoredHabits();
  habits.push({ name, history: Array(7).fill(false) });
  saveHabits(habits);
  habitInput.value = '';
  renderHabits();
};

const navigateBack = () => {
  if (email) {
    window.location.href = `../dashboard/dashboard.html?email=${encodeURIComponent(email)}`;
  } else {
    window.location.href = '../login_page/login.html';
  }
};

taskForm.addEventListener('submit', handleTaskSubmit);
habitForm.addEventListener('submit', handleHabitSubmit);

if (backBtn) {
    backBtn.addEventListener('click', navigateBack);
}

function initDateBadge() {
  const badge = document.getElementById('dateBadge');
  if (badge) {
    const now = new Date();
    badge.textContent = now.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  }
}

initDateBadge();

if (loadEmail()) {
  renderTasks();
  renderHabits();
} else {
  taskCount.textContent = '0 tasks';
  streakTotal.textContent = '0 streak';
}

const sections = [...document.querySelectorAll('.ob-sec')];
const steps = [...document.querySelectorAll('.ob-step')];
const progressLabel = document.getElementById('ob-lbl');
const progressFill = document.getElementById('ob-prog');
const prevButton = document.getElementById('ob-prev');
const nextButton = document.getElementById('ob-next');
let currentStep = 0;
const state = {
  medications: 'no',
  preferences: new Set(),
  time: '',
  days: '',
  level: ''
};

const queryEmail = new URLSearchParams(window.location.search).get('email');

const postJson = async (url, data) => {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json();
};

const updateUI = () => {
  sections.forEach((sec, idx) => sec.classList.toggle('act', idx === currentStep));
  steps.forEach((step, idx) => step.classList.toggle('act', idx === currentStep));
  progressLabel.textContent = `${currentStep + 1} / ${sections.length}`;
  progressFill.style.width = `${((currentStep + 1) / sections.length) * 100}%`;
  prevButton.style.visibility = currentStep === 0 ? 'hidden' : 'visible';
  nextButton.textContent = currentStep === sections.length - 1 ? 'Finish' : 'Continue →';
};

window.obNext = () => {
  if (!validateStep()) return;
  if (currentStep < sections.length - 1) {
    currentStep += 1;
    updateUI();
    return;
  }
  submitOnboarding();
};

window.obPrev = () => {
  if (currentStep > 0) {
    currentStep -= 1;
    updateUI();
  }
};

window.toggleMed = (mode) => {
  state.medications = mode;
  document.getElementById('med-no').classList.toggle('act', mode === 'no');
  document.getElementById('med-yes').classList.toggle('act', mode === 'yes');
  document.getElementById('med-detail').style.display = mode === 'yes' ? 'block' : 'none';
};

window.togglePref = (card) => {
  const pref = card.dataset.pref;
  if (state.preferences.has(pref)) {
    state.preferences.delete(pref);
    card.classList.remove('act');
  } else {
    state.preferences.add(pref);
    card.classList.add('act');
  }
};

window.selectSlot = (element, type) => {
  const siblingSelector = type === 'time' ? '[data-time]' : type === 'days' ? '[data-days]' : '[data-level]';
  const parent = element.parentElement;
  const items = parent.querySelectorAll(siblingSelector);
  items.forEach((item) => item.classList.toggle('active', item === element));
  if (type === 'time') state.time = element.dataset.time;
  if (type === 'days') state.days = element.dataset.days;
  if (type === 'level') state.level = element.dataset.level;
};

const validateStep = () => {
  if (currentStep === 0) {
    const age = document.getElementById('ob-age').value;
    const gender = document.getElementById('ob-gender').value;
    const height = document.getElementById('ob-height').value;
    const weight = document.getElementById('ob-weight').value;
    const activity = document.getElementById('ob-activity').value;
    if (!age || !gender || !height || !weight || !activity) {
      alert('Please fill in all body stats fields before continuing.');
      return false;
    }
  }
  if (currentStep === 1) {
    const diet = document.getElementById('ob-diet').value;
    const water = document.getElementById('ob-water').value;
    if (!diet || !water) {
      alert('Please select your dietary preference and water intake before continuing.');
      return false;
    }
  }
  if (currentStep === 2 && state.preferences.size === 0) {
    alert('Pick at least one exercise preference to continue.');
    return false;
  }
  if (currentStep === 3 && (!state.time || !state.days || !state.level)) {
    alert('Choose your workout schedule preferences.');
    return false;
  }
  return true;
};

const submitOnboarding = async () => {
  if (!validateStep()) return;
  if (!queryEmail) {
    alert('Unable to save onboarding without an email address.');
    return;
  }

  const payload = {
    email: queryEmail,
    age: document.getElementById('ob-age').value,
    gender: document.getElementById('ob-gender').value,
    height: document.getElementById('ob-height').value,
    weight: document.getElementById('ob-weight').value,
    target_weight: document.getElementById('ob-tweight').value,
    activity_level: document.getElementById('ob-activity').value,
    medications: state.medications,
    medication_details: document.getElementById('ob-meds').value.trim(),
    conditions: document.getElementById('ob-conditions').value.trim(),
    diet: document.getElementById('ob-diet').value,
    water: document.getElementById('ob-water').value,
    preferences: Array.from(state.preferences),
    workout_time: state.time,
    workout_days: state.days,
    session_duration: document.getElementById('ob-duration').value,
    fitness_level: state.level,
  };

  try {
    const result = await postJson('onboard.php', payload);
    if (result.success) {
      alert('Onboarding completed successfully!');
      window.location.href = '../dashboard/dashboard.html?email=' + encodeURIComponent(queryEmail);
    } else {
      alert(result.error || 'Failed to save onboarding details.');
    }
  } catch (error) {
    console.error(error);
    alert('Unable to connect with the server.');
  }
};

window.skipOnboard = () => {
  if (queryEmail) {
    window.location.href = '../dashboard/dashboard.html?email=' + encodeURIComponent(queryEmail);
  } else {
    window.location.href = '../login_page/login.html';
  }
};

const stepClick = (idx) => {
  currentStep = idx;
  updateUI();
};

steps.forEach((step, idx) => step.addEventListener('click', () => stepClick(idx)));
updateUI();

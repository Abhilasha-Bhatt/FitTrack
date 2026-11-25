const params = new URLSearchParams(window.location.search);
let email = params.get('email') || localStorage.getItem('fittrackEmail');
const profileEmail = document.getElementById('profileEmail');
const profileMessage = document.getElementById('profileMessage');
const editBtn = document.getElementById('editBtn');
const saveBtn = document.getElementById('saveBtn');
const cancelBtn = document.getElementById('cancelBtn');
const backBtn = document.getElementById('backBtn');
const profileSummary = document.getElementById('profileSummary');
const profileForm = document.getElementById('profileForm');

const fieldMap = {
  age: 'age',
  gender: 'gender',
  height: 'height_cm',
  weight: 'weight_kg',
  targetWeight: 'target_weight_kg',
  activityLevel: 'activity_level',
  medications: 'medications',
  medicationDetails: 'medication_details',
  conditions: 'conditions',
  diet: 'diet',
  water: 'water_intake',
  preferences: 'preferences',
  workoutTime: 'workout_time',
  workoutDays: 'workout_days',
  sessionDuration: 'session_duration',
  fitnessLevel: 'fitness_level',
};

let userProfile = {};

const getById = (id) => document.getElementById(id);

const setMessage = (message, isError = false) => {
  profileMessage.textContent = message;
  profileMessage.style.color = isError ? '#ff6b6b' : '#8c93ad';
};

const parsePreferences = (value) => {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed;
  } catch (error) {
    // ignore parse errors
  }
  return value.split(',').map((item) => item.trim()).filter(Boolean);
};

const joinPreferences = (preferences) => {
  if (!preferences) return '';
  if (Array.isArray(preferences)) return preferences.join(', ');
  return preferences.toString();
};

const setField = (id, value) => {
  const field = getById(id);
  if (!field) return;
  field.value = value ?? '';
};

const populateForm = (user) => {
  Object.entries(fieldMap).forEach(([fieldId, userKey]) => {
    const value = user[userKey];
    if (fieldId === 'preferences') {
      setField(fieldId, joinPreferences(parsePreferences(value)));
    } else {
      setField(fieldId, value ?? '');
    }
  });
};

const setSummaryValue = (id, value) => {
  const element = document.getElementById(id);
  if (!element) return;
  element.textContent = value || '—';
};

const populateSummary = (user) => {
  setSummaryValue('summaryAge', user.age);
  setSummaryValue('summaryGender', user.gender);
  setSummaryValue('summaryHeight', user.height_cm ? `${user.height_cm} cm` : '—');
  setSummaryValue('summaryWeight', user.weight_kg ? `${user.weight_kg} kg` : '—');
  setSummaryValue('summaryTargetWeight', user.target_weight_kg ? `${user.target_weight_kg} kg` : '—');
  setSummaryValue('summaryActivityLevel', user.activity_level);
  setSummaryValue('summaryDiet', user.diet);
  setSummaryValue('summaryWater', user.water_intake ? `${user.water_intake} glasses` : '—');
  setSummaryValue('summaryWorkoutTime', user.workout_time);
  setSummaryValue('summaryWorkoutDays', user.workout_days);
  setSummaryValue('summarySessionDuration', user.session_duration);
  setSummaryValue('summaryFitnessLevel', user.fitness_level);
  setSummaryValue('summaryMedicationDetails', user.medication_details);
  setSummaryValue('summaryConditions', user.conditions);
  setSummaryValue('summaryPreferences', joinPreferences(parsePreferences(user.preferences)));
};

const valueOrExisting = (id, key, transform = (v) => v) => {
  const el = getById(id);
  if (!el) {
    return userProfile[key] ?? null;
  }
  const raw = typeof el.value === 'string' ? el.value.trim() : el.value;
  const transformed = transform(raw);
  return transformed === '' || transformed === undefined ? null : transformed;
};

const collectForm = () => {
  const preferencesEl = getById('preferences');
  const preferences = preferencesEl
    ? parsePreferences(preferencesEl.value)
    : parsePreferences(userProfile.preferences);

  return {
    email,
    age: valueOrExisting('age', 'age'),
    gender: valueOrExisting('gender', 'gender'),
    height: valueOrExisting('height', 'height_cm'),
    weight: valueOrExisting('weight', 'weight_kg'),
    target_weight: valueOrExisting('targetWeight', 'target_weight_kg'),
    activity_level: valueOrExisting('activityLevel', 'activity_level'),
    medications: valueOrExisting('medications', 'medications'),
    medication_details: valueOrExisting('medicationDetails', 'medication_details'),
    conditions: valueOrExisting('conditions', 'conditions'),
    diet: valueOrExisting('diet', 'diet'),
    water: valueOrExisting('water', 'water_intake'),
    preferences,
    workout_time: valueOrExisting('workoutTime', 'workout_time'),
    workout_days: valueOrExisting('workoutDays', 'workout_days'),
    session_duration: valueOrExisting('sessionDuration', 'session_duration'),
    fitness_level: valueOrExisting('fitnessLevel', 'fitness_level'),
  };
};

const toggleEditMode = (show) => {
  profileForm.classList.toggle('hidden', !show);
  profileSummary.classList.toggle('hidden', show);
  editBtn.classList.toggle('hidden', show);
  if (show) {
    saveBtn.disabled = false;
    cancelBtn.textContent = 'Cancel';
  } else {
    cancelBtn.textContent = 'Back';
    setMessage('Review your saved profile and click Edit Profile to make changes.');
  }
};

const propagateEmailToLinks = () => {
  if (!email) return;
  localStorage.setItem('fittrackEmail', email);
  document.querySelectorAll('a[href]').forEach((a) => {
    const href = a.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('javascript:')) return;
    try {
      const url = new URL(href, window.location.href);
      if (url.origin !== window.location.origin) return;
      url.searchParams.set('email', email);
      a.href = url.href;
    } catch (_) {
      // ignore malformed hrefs
    }
  });
};

const getUserEmail = () => {
  if (!email) {
    email = localStorage.getItem('fittrackEmail');
  }
  return email;
};

const loadProfile = async () => {
  if (!getUserEmail()) {
    profileEmail.textContent = 'unknown';
    setMessage('No user email provided. Please sign in again.', true);
    saveBtn.disabled = true;
    editBtn.disabled = true;
    return;
  }

  localStorage.setItem('fittrackEmail', email);
  profileEmail.textContent = email;
  setMessage('Loading profile...');
  saveBtn.disabled = true;

  try {
    const response = await fetch(`../workouts/get_user_profile.php?email=${encodeURIComponent(email)}`);
    const data = await response.json();

    if (!data.success) {
      setMessage('New profile detected. Fill in your details below to get started.');
      toggleEditMode(true);
      return;
    }

    userProfile = data.user;
    populateForm(userProfile);
    populateSummary(userProfile);
    setMessage('Profile loaded. Review your stats or click Edit Profile.');
  } catch (error) {
    console.error(error);
    setMessage('Unable to fetch profile data. Please check the server.', true);
  } finally {
    saveBtn.disabled = false;
  }
};

const saveProfile = async () => {
  if (!getUserEmail()) return;

  saveBtn.disabled = true;
  saveBtn.textContent = 'Saving...';

  try {
    const payload = collectForm();
    const response = await fetch('../stats/onboard.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await response.json();

    if (data.success) {
      userProfile = {
        ...userProfile,
        age: payload.age,
        gender: payload.gender,
        height_cm: payload.height,
        weight_kg: payload.weight,
        target_weight_kg: payload.target_weight,
        activity_level: payload.activity_level,
        medications: payload.medications,
        medication_details: payload.medication_details,
        conditions: payload.conditions,
        diet: payload.diet,
        water_intake: payload.water,
        preferences: JSON.stringify(payload.preferences || []),
        workout_time: payload.workout_time,
        workout_days: payload.workout_days,
        session_duration: payload.session_duration,
        fitness_level: payload.fitness_level,
      };
      populateSummary(userProfile);
      populateForm(userProfile);
      toggleEditMode(false);
      setMessage('Profile updated successfully.');
      return;
    }

    setMessage(data.error || 'Unable to save profile data.', true);
  } catch (error) {
    console.error(error);
    setMessage('Unable to connect to the server.', true);
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = 'Save Changes';
  }
};

const navigateBack = () => {
  if (!profileForm.classList.contains('hidden')) {
    toggleEditMode(false);
    return;
  }

  if (getUserEmail()) {
    window.location.href = `dashboard.html?email=${encodeURIComponent(email)}`;
  } else {
    window.location.href = '../login_page/login.html';
  }
};

if (editBtn) {
  editBtn.addEventListener('click', () => toggleEditMode(true));
}

saveBtn.addEventListener('click', saveProfile);
cancelBtn.addEventListener('click', navigateBack);

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
propagateEmailToLinks();
loadProfile();

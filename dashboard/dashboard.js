document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const email = params.get('email');

  // --- Populate user info ---
  const userNameEl = document.getElementById('userName');
  if (email && userNameEl) {
    const name = email.split('@')[0];
    userNameEl.textContent = name.charAt(0).toUpperCase() + name.slice(1);
  }

  let currentWater = 0;
  let currentSleep = 7.0;
  let currentSteps = 0;

  function updateUserStats(updates) {
      if (!email) return;
      if (updates.water_intake !== undefined) {
          currentWater = updates.water_intake;
          const wEl = document.getElementById('userWaterVal');
          if (wEl) wEl.textContent = currentWater;
      }
      if (updates.sleep_hours !== undefined) {
          currentSleep = updates.sleep_hours;
          const h = Math.floor(currentSleep);
          const m = Math.round((currentSleep - h) * 60);
          if (document.getElementById('sleepHrsText')) document.getElementById('sleepHrsText').textContent = h;
          if (document.getElementById('sleepMinsText')) document.getElementById('sleepMinsText').textContent = m;
      }
      if (updates.steps !== undefined) {
          currentSteps = updates.steps;
          const sEl = document.getElementById('stepsCount');
          if (sEl) sEl.textContent = currentSteps.toLocaleString();
      }
      
      fetch('update_user_stats.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email, ...updates })
      })
      .then(res => res.json())
      .then(data => {
          if (!data.success) console.error("Error updating stats", data.error);
      })
      .catch(console.error);
  }

  // Interactive buttons
  const incWaterBtn = document.getElementById('incWaterBtn');
  const decWaterBtn = document.getElementById('decWaterBtn');
  if (incWaterBtn && decWaterBtn) {
      incWaterBtn.addEventListener('click', () => updateUserStats({ water_intake: currentWater + 1 }));
      decWaterBtn.addEventListener('click', () => { if(currentWater > 0) updateUserStats({ water_intake: currentWater - 1 }) });
  }

  const incSleepBtn = document.getElementById('incSleepBtn');
  const decSleepBtn = document.getElementById('decSleepBtn');
  if (incSleepBtn && decSleepBtn) {
      incSleepBtn.addEventListener('click', () => updateUserStats({ sleep_hours: currentSleep + 0.5 }));
      decSleepBtn.addEventListener('click', () => { if(currentSleep > 0.5) updateUserStats({ sleep_hours: currentSleep - 0.5 }) });
  }

  const incStepsBtn = document.getElementById('incStepsBtn');
  const decStepsBtn = document.getElementById('decStepsBtn');
  if (incStepsBtn && decStepsBtn) {
      // Increment/decrement by 500 steps
      incStepsBtn.addEventListener('click', () => updateUserStats({ steps: currentSteps + 500 }));
      decStepsBtn.addEventListener('click', () => { if(currentSteps >= 500) updateUserStats({ steps: currentSteps - 500 }) });
  }

  // --- Date badge ---
  const dateBadge = document.getElementById('dateBadge');
  if (dateBadge) {
    const now = new Date();
    const opts = { day: 'numeric', month: 'short', year: 'numeric' };
    dateBadge.textContent = now.toLocaleDateString('en-US', opts);
  }

  // --- Sidebar navigation ---
  const navBtns = document.querySelectorAll('.nav-btn[data-target]');
  navBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      let target = btn.dataset.target;
      if (email) {
        const sep = target.includes('?') ? '&' : '?';
        target += `${sep}email=${encodeURIComponent(email)}`;
      }
      window.location.href = target;
    });
  });

  // --- Sleep chart (simple canvas wave) ---
  const sleepCanvas = document.getElementById('sleepCanvas');
  if (sleepCanvas) {
    const ctx = sleepCanvas.getContext('2d');
    const w = sleepCanvas.width;
    const h = sleepCanvas.height;

    const gradient = ctx.createLinearGradient(0, 0, w, 0);
    gradient.addColorStop(0, 'rgba(167, 139, 250, 0.1)');
    gradient.addColorStop(0.5, 'rgba(167, 139, 250, 0.3)');
    gradient.addColorStop(1, 'rgba(167, 139, 250, 0.1)');

    const data = [3.5, 4, 2, 3, 4.5, 2.5, 3.8, 4, 1.5, 3, 4, 3.5, 2];

    ctx.beginPath();
    ctx.moveTo(0, h);

    for (let i = 0; i < data.length; i++) {
      const x = (i / (data.length - 1)) * w;
      const y = h - (data[i] / 5) * h;
      if (i === 0) {
        ctx.lineTo(x, y);
      } else {
        const prevX = ((i - 1) / (data.length - 1)) * w;
        const cpX = (prevX + x) / 2;
        ctx.quadraticCurveTo(prevX + (x - prevX) * 0.5, h - (data[i - 1] / 5) * h, cpX, (y + (h - (data[i - 1] / 5) * h)) / 2);
        ctx.quadraticCurveTo(cpX, y, x, y);
      }
    }

    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Line on top
    ctx.beginPath();
    for (let i = 0; i < data.length; i++) {
      const x = (i / (data.length - 1)) * w;
      const y = h - (data[i] / 5) * h;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = 'rgba(167, 139, 250, 0.7)';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // --- Animate numbers on load (initial placeholder handled by fetch) ---
  // animateNumber('stepsCount', 0, 19840, 1500, true);

  // --- Fetch user profile data ---
  if (email) {
    fetch(`../workouts/get_user_profile.php?email=${encodeURIComponent(email)}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.user) {
            const user = data.user;
            
            // Water Intake
            const waterGlasses = parseInt(user.water_intake) || 0;
            currentWater = waterGlasses;
            document.getElementById('userDietLabel').textContent = user.diet ? `${user.diet} Diet` : 'Stay hydrated!';
            animateNumber('userWaterVal', 0, waterGlasses, 1000);

            // Steps
            const stepsVal = parseInt(user.steps) || 0;
            currentSteps = stepsVal;
            animateNumber('stepsCount', 0, stepsVal, 1500, true);

            // Sleep Hours
            const sleepHrs = parseFloat(user.sleep_hours) || 7.0;
            currentSleep = sleepHrs;
            const slH = Math.floor(sleepHrs);
            const slM = Math.round((sleepHrs - slH) * 60);
            if (document.getElementById('sleepHrsText')) document.getElementById('sleepHrsText').textContent = slH;
            if (document.getElementById('sleepMinsText')) document.getElementById('sleepMinsText').textContent = slM;

            // Fitness Profile (BMI)
            const w = parseFloat(user.weight_kg);
            const h = parseFloat(user.height_cm) / 100;
            if (w && h) {
                const bmi = Math.round(w / (h * h));
                animateNumber('bmiScore', 0, bmi, 1200);
            }
            if (user.activity_level) document.getElementById('activityLevelDisplay').textContent = user.activity_level;
            if (user.fitness_level) document.getElementById('levelDisplay').textContent = user.fitness_level;
            if (user.session_duration) document.getElementById('durationDisplay').textContent = user.session_duration;

            // Weight Profile
            if (w) animateNumber('currentWeightDisplay', 0, w, 1200);
            const tg = parseFloat(user.target_weight_kg);
            if (tg) document.getElementById('targetWeightDisplay').textContent = `${tg} kg`;
            if (w && tg) {
                const diff = (w - tg).toFixed(1);
                document.getElementById('weightDiffDisplay').textContent = diff > 0 ? `${diff} kg to lose` : `${Math.abs(diff)} kg to gain`;
            }
            if (user.height_cm) document.getElementById('heightDisplay').textContent = `${user.height_cm} cm`;
        }
      })
      .catch(err => console.error("Could not fetch user profile for dashboard", err));
  }

  // --- Gauge Animation ---
  const gaugeArc = document.getElementById('gaugeArc');
  if (gaugeArc) {
    // 251 is full dasharray. 125 is 50%.
    // We want to animate from 251 (0%) to 125 (50%)
    setTimeout(() => {
        gaugeArc.style.transition = 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)';
        gaugeArc.style.strokeDashoffset = '125';
    }, 500);
  }

  // --- Calendar Icon Click ---
  const calBtn = document.querySelector('button.action-btn:has(i.fa-calendar-alt)');
  const calModal = document.getElementById('calendarModal');
  const closeCal = document.getElementById('closeCalendar');
  const fullCalendar = document.getElementById('fullCalendar');

  if (calBtn && calModal) {
    calBtn.addEventListener('click', () => {
        // Generate Calendar
        if (fullCalendar) {
            fullCalendar.innerHTML = '';
            const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
            for (let i = 1; i <= daysInMonth; i++) {
                const dayDiv = document.createElement('div');
                dayDiv.className = 'cal-day';
                dayDiv.textContent = i;
                if ([2, 4, 5, 8, 9, 12, 14, 15, 16, 20, 21].includes(i)) dayDiv.classList.add('done');
                fullCalendar.appendChild(dayDiv);
            }
        }
        calModal.classList.remove('hidden');
    });
  }

  if (closeCal) {
    closeCal.addEventListener('click', () => {
        calModal.classList.add('hidden');
    });
  }

  // Close modal on background click
  window.addEventListener('click', (e) => {
    if (e.target === calModal) calModal.classList.add('hidden');
  });
});

function animateNumber(id, start, end, duration, addCommas = false) {
  const el = document.getElementById(id);
  if (!el) return;

  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
    const current = Math.round(start + (end - start) * eased);

    el.textContent = addCommas ? current.toLocaleString() : current;

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

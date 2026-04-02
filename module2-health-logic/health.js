/* ═══════════════════════════════════════════════════════
   MODULE 2 — HEALTH CALCULATIONS & CORE LOGIC
   Owner: Person 2
   Responsibilities:
     - BMI calculation & classification
     - BMR (Basal Metabolic Rate) using Mifflin-St Jeor
     - TDEE (Total Daily Energy Expenditure)
     - Calorie burn estimates per task
     - Streak calculation logic
     - Ideal weight range (Devine formula)
     - Water intake recommendation
     - Macronutrient split calculation
     - Login & session auth logic
     - Onboarding data saving
   Integrates with: Module 3 (reads health data), Module 4 (saves via storage API)
═══════════════════════════════════════════════════════ */

(function(){
  'use strict';

  const S    = window.FITTRACK.S;
  const ADMIN = window.FITTRACK.ADMIN;

  // ── Utility ──────────────────────────────────────────
  function setText(id, v){ var e=document.getElementById(id); if(e) e.textContent=v; }
  function todayStr(){ return new Date().toISOString().split('T')[0]; }
  function esc(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

  // Expose utilities globally for other modules
  window.FT_Utils = { setText, todayStr, esc };

  // ── BMI ──────────────────────────────────────────────
  /**
   * Calculate BMI
   * @param {number} weightKg
   * @param {number} heightCm
   * @returns {{ value: string, category: string, color: string }}
   */
  function calcBMI(weightKg, heightCm){
    if(!weightKg || !heightCm) return { value:'—', category:'Unknown', color:'var(--text2)' };
    var bmi = weightKg / Math.pow(heightCm / 100, 2);
    var cat, color;
    if(bmi < 18.5){ cat='Underweight'; color='var(--teal)'; }
    else if(bmi < 25){ cat='Normal'; color='var(--accent)'; }
    else if(bmi < 30){ cat='Overweight'; color='var(--orange)'; }
    else { cat='Obese'; color='var(--red)'; }
    return { value: bmi.toFixed(1), category: cat, color: color };
  }

  // ── BMR (Mifflin-St Jeor Equation) ───────────────────
  /**
   * @param {number} weightKg
   * @param {number} heightCm
   * @param {number} ageYears
   * @param {string} gender  'Male' | 'Female' | other
   * @returns {number} kcal/day
   */
  function calcBMR(weightKg, heightCm, ageYears, gender){
    if(!weightKg || !heightCm || !ageYears) return 0;
    var base = 10 * weightKg + 6.25 * heightCm - 5 * ageYears;
    return Math.round(gender === 'Male' ? base + 5 : base - 161);
  }

  // ── TDEE ─────────────────────────────────────────────
  /**
   * @param {number} bmr
   * @param {string} activity  Sedentary | Lightly Active | Moderately Active | Very Active | Extremely Active
   * @returns {number} kcal/day
   */
  function calcTDEE(bmr, activity){
    var multipliers = {
      'Sedentary'          : 1.2,
      'Lightly Active'     : 1.375,
      'Moderately Active'  : 1.55,
      'Very Active'        : 1.725,
      'Extremely Active'   : 1.9
    };
    return Math.round(bmr * (multipliers[activity] || 1.2));
  }

  // ── Ideal Weight (Devine Formula) ────────────────────
  /**
   * @param {number} heightCm
   * @param {string} gender
   * @returns {{ min: number, max: number }}
   */
  function idealWeightRange(heightCm, gender){
    if(!heightCm) return { min:0, max:0 };
    var inchesOver5ft = (heightCm / 2.54) - 60;
    var base = gender === 'Male' ? 50 : 45.5;
    var ideal = base + 2.3 * Math.max(0, inchesOver5ft);
    return { min: (ideal * 0.9).toFixed(1), max: (ideal * 1.1).toFixed(1) };
  }

  // ── Calorie Burn Estimate ─────────────────────────────
  /**
   * Estimates calories burned based on task category & duration string
   * @param {string} category  workout | meal | rest | other
   * @param {string} duration  e.g. '30 min', '1 hr'
   * @returns {number}
   */
  function estimateCalBurn(category, duration){
    var base = { workout: 8, meal: 0, rest: 1, other: 2 }; // kcal per minute
    var mins = parseDurationMinutes(duration);
    return Math.round((base[category] || 2) * mins);
  }

  function parseDurationMinutes(dur){
    if(!dur) return 30;
    var match = dur.match(/(\d+)\s*(hr|hour|min)/i);
    if(!match) return 30;
    return match[2].toLowerCase().startsWith('h') ? parseInt(match[1]) * 60 : parseInt(match[1]);
  }

  // ── Macronutrient Split ───────────────────────────────
  /**
   * @param {number} tdee  kcal/day
   * @param {string} goal  'Lose Weight' | 'Build Muscle' | 'Maintain' | 'General Fitness'
   * @returns {{ protein: number, carbs: number, fat: number }} in grams
   */
  function calcMacros(tdee, goal){
    var splits = {
      'Lose Weight'     : { p: 0.35, c: 0.35, f: 0.30 },
      'Build Muscle'    : { p: 0.30, c: 0.45, f: 0.25 },
      'Maintain'        : { p: 0.25, c: 0.50, f: 0.25 },
      'General Fitness' : { p: 0.25, c: 0.50, f: 0.25 }
    };
    var s = splits[goal] || splits['General Fitness'];
    return {
      protein : Math.round(tdee * s.p / 4),
      carbs   : Math.round(tdee * s.c / 4),
      fat     : Math.round(tdee * s.f / 9)
    };
  }

  // ── Water Intake Recommendation ───────────────────────
  /**
   * @param {number} weightKg
   * @param {string} activity
   * @returns {number} glasses (250ml each)
   */
  function recommendWater(weightKg, activity){
    var base = weightKg * 0.033; // litres
    var extra = activity === 'Very Active' || activity === 'Extremely Active' ? 0.75 : 0;
    return Math.round((base + extra) / 0.25);
  }

  // ── Streak Calculation ────────────────────────────────
  /**
   * @param {string[]} dates  ISO date strings e.g. ['2024-01-01', ...]
   * @returns {number}
   */
  function calcStreak(dates){
    if(!dates || !dates.length) return 0;
    var sorted = dates.slice().sort();
    var streak = 1;
    var today = new Date(); today.setHours(0,0,0,0);
    var latest = new Date(sorted[sorted.length-1]); latest.setHours(0,0,0,0);
    var diff = (today - latest) / (1000*60*60*24);
    if(diff > 1) return 0;
    for(var i = sorted.length-1; i > 0; i--){
      var d1 = new Date(sorted[i]); d1.setHours(0,0,0,0);
      var d2 = new Date(sorted[i-1]); d2.setHours(0,0,0,0);
      var gap = (d1 - d2) / (1000*60*60*24);
      if(gap === 1) streak++;
      else break;
    }
    return streak;
  }

  // ── Auth: Sign Up ─────────────────────────────────────
  function doSignup(){
    var name  = document.getElementById('su-name').value.trim();
    var email = document.getElementById('su-email').value.trim().toLowerCase();
    var pass  = document.getElementById('su-pass').value;
    var goal  = document.getElementById('su-goal').value;

    if(!name){ window.FT_toast('Enter your name','e'); return; }
    if(!email || email.indexOf('@')<0){ window.FT_toast('Enter a valid email','e'); return; }
    if(pass.length < 6){ window.FT_toast('Password must be 6+ characters','e'); return; }
    if(email === ADMIN.email){ window.FT_toast('This email is reserved for admin.','e'); return; }

    var users = window.FT_Storage.getUsers();
    if(users.find(function(u){ return u.email===email; })){ window.FT_toast('Email already registered.','e'); return; }

    var user = {
      id: 'u_'+Date.now(),
      name: name, email: email, password: pass,
      goal: goal || 'General Fitness',
      since: new Date().toLocaleDateString('en-US',{month:'short',year:'numeric'}),
      profile:{}, tasks:{},
      loginDates:[todayStr()],
      streak:1, totalLogins:1, tasksDone:0,
      lastActive:todayStr(), active:true
    };
    users.push(user);
    window.FT_Storage.saveUsers(users);
    S.session = user.id;
    window.FT_toast('Welcome, '+name.split(' ')[0]+'! 🎉','s');
    setTimeout(function(){ showPage('onboard'); window.FT_Onboard.reset(); }, 500);
  }

  // ── Auth: Login ───────────────────────────────────────
  function doLogin(){
    var email = document.getElementById('li-email').value.trim().toLowerCase();
    var pass  = document.getElementById('li-pass').value;
    if(!email || !pass){ window.FT_toast('Please enter credentials','e'); return; }

    if(email === ADMIN.email && pass === ADMIN.password){
      S.session = 'admin';
      window.FT_toast('Welcome, Deepshikha! 🛡️','s');
      setTimeout(function(){ window.FT_Admin.launch(); }, 500);
      return;
    }
    var users = window.FT_Storage.getUsers();
    var user  = users.find(function(u){ return u.email===email && u.password===pass; });
    if(!user){ window.FT_toast('Invalid email or password.','e'); return; }
    if(!user.active){ window.FT_toast('Your account has been suspended.','e'); return; }

    recordLogin(user);
    S.session = user.id;
    window.FT_toast('Welcome back, '+user.name.split(' ')[0]+'! 💪','s');
    setTimeout(function(){ window.FT_Dash.launch(); }, 500);
  }

  function recordLogin(user){
    var today = todayStr();
    if(!user.loginDates) user.loginDates = [];
    if(!user.loginDates.includes(today)){
      user.loginDates.push(today);
      user.totalLogins = (user.totalLogins||0) + 1;
      user.streak = calcStreak(user.loginDates);
      user.lastActive = today;
    }
    window.FT_Storage.updateUser(user);
  }

  function doLogout(){
    S.session = null;
    window.FT_toast('Signed out.','i');
    setTimeout(function(){ showPage('auth'); }, 400);
  }

  // ── Onboarding: Save Profile ──────────────────────────
  function finishOnboard(){
    var user = window.FT_Storage.getUser(S.session);
    if(!user) return;
    var p = S;

    user.profile = {
      height     : document.getElementById('ob-height').value || '',
      weight     : document.getElementById('ob-weight').value || '',
      tweight    : document.getElementById('ob-tweight').value || '',
      age        : document.getElementById('ob-age').value || '',
      gender     : document.getElementById('ob-gender').value || '',
      activity   : document.getElementById('ob-activity').value || '',
      meds       : S.hasMed ? (document.getElementById('ob-meds').value||'Yes') : 'None',
      conditions : document.getElementById('ob-conditions').value || 'None',
      diet       : document.getElementById('ob-diet').value || '',
      water      : document.getElementById('ob-water').value || '8',
      prefs      : S.prefs.slice(),
      time       : S.selTime,
      days       : S.selDays,
      level      : S.selLevel,
      duration   : document.getElementById('ob-duration').value
    };

    // Run calculations and attach to profile
    var h = parseFloat(user.profile.height);
    var w = parseFloat(user.profile.weight);
    var a = parseFloat(user.profile.age);
    var g = user.profile.gender;
    var act = user.profile.activity;

    var bmiResult = calcBMI(w, h);
    var bmr = calcBMR(w, h, a, g);
    var tdee = calcTDEE(bmr, act);

    user.profile.bmi     = bmiResult.value;
    user.profile.bmr     = bmr;
    user.profile.tdee    = tdee;
    user.profile.macros  = calcMacros(tdee, user.goal);
    user.profile.idealWt = idealWeightRange(h, g);
    user.profile.recWater = recommendWater(w, act);

    window.FT_Storage.updateUser(user);
    window.FT_toast('Profile saved! Your journey begins 🚀','s');
    setTimeout(function(){ window.FT_Dash.launch(); }, 600);
  }

  // ── Page Utility ──────────────────────────────────────
  function showPage(id){
    document.querySelectorAll('.page').forEach(function(p){ p.classList.remove('active'); });
    var p = document.getElementById('pg-'+id);
    if(p) p.classList.add('active');
  }
  window.showPage = showPage;

  // ── Expose Public API ─────────────────────────────────
  window.FT_Health = {
    calcBMI, calcBMR, calcTDEE, calcMacros,
    recommendWater, calcStreak, estimateCalBurn,
    idealWeightRange
  };

  window.FT_Auth = {
    doSignup, doLogin, doLogout, finishOnboard,
    showView: function(v){
      document.getElementById('v-signup').style.display = v==='signup'?'block':'none';
      document.getElementById('v-login').style.display  = v==='login' ?'block':'none';
    }
  };

})();

/* ═══════════════════════════════════════════════════════
   MODULE 3 — DIET & EXERCISE RECOMMENDATIONS ENGINE
   Owner: Person 3
   Responsibilities:
     - Personalized diet plan generation
     - Meal suggestions by goal & dietary preference
     - Exercise plan generation by fitness level & prefs
     - Video recommendation filtering
     - Weekly workout plan builder
     - Supplement suggestions
     - Smart task category suggestions
     - Recipe/meal macro display on Profile tab
   Reads from: Module 2 (health calculations), Module 4 (user profile)
   Writes to: Module 4 (saves recommendations)
═══════════════════════════════════════════════════════ */

(function(){
  'use strict';

  // ── Meal Plans by Goal ────────────────────────────────
  var MEAL_PLANS = {
    'Lose Weight': {
      breakfast: [
        'Oats with berries & almond milk (320 kcal)',
        'Greek yogurt parfait with granola (290 kcal)',
        'Scrambled eggs with spinach & whole wheat toast (350 kcal)',
        'Smoothie bowl: banana, protein powder, chia seeds (300 kcal)'
      ],
      lunch: [
        'Grilled chicken salad with olive oil dressing (420 kcal)',
        'Quinoa bowl with roasted vegetables & chickpeas (480 kcal)',
        'Turkey lettuce wraps with avocado (380 kcal)',
        'Lentil soup with a slice of multigrain bread (410 kcal)'
      ],
      dinner: [
        'Baked salmon with steamed broccoli & brown rice (520 kcal)',
        'Stir-fried tofu with bok choy & soba noodles (460 kcal)',
        'Chicken breast with roasted sweet potato & asparagus (500 kcal)',
        'Paneer tikka with cucumber raita & 1 roti (490 kcal)'
      ],
      snacks: [
        'Apple with 1 tbsp peanut butter (180 kcal)',
        'Handful of almonds (170 kcal)',
        'Low-fat cottage cheese with cucumber (140 kcal)',
        'Carrot sticks with hummus (150 kcal)'
      ]
    },
    'Build Muscle': {
      breakfast: [
        '4-egg omelette with cheese, veggies & whole wheat toast (550 kcal)',
        'Protein pancakes with banana & honey (480 kcal)',
        'Overnight oats with protein powder, milk & peanut butter (520 kcal)',
        'Chicken breast + 2 eggs + oatmeal combo (600 kcal)'
      ],
      lunch: [
        'Double chicken rice bowl with broccoli & olive oil (720 kcal)',
        'Tuna pasta with olive oil, tomatoes & parmesan (680 kcal)',
        'Beef stir fry with brown rice & mixed vegetables (750 kcal)',
        'Paneer bhurji with 3 rotis & dal (700 kcal)'
      ],
      dinner: [
        'Grilled salmon + sweet potato + spinach salad (680 kcal)',
        'Chicken curry with brown rice (720 kcal)',
        'Egg fried rice with mixed vegetables & tofu (640 kcal)',
        'Mutton keema with 2 rotis & raita (710 kcal)'
      ],
      snacks: [
        'Protein shake with milk + banana (300 kcal)',
        'Greek yogurt + mixed nuts + honey (280 kcal)',
        'Peanut butter sandwich on whole grain bread (320 kcal)',
        'Cheese & whole grain crackers (250 kcal)'
      ]
    },
    'General Fitness': {
      breakfast: [
        'Poha with peanuts & vegetables (380 kcal)',
        'Idli (3) with sambar & coconut chutney (350 kcal)',
        'Avocado toast with poached egg (400 kcal)',
        'Banana smoothie with oats & milk (360 kcal)'
      ],
      lunch: [
        'Dal makhani with brown rice & salad (520 kcal)',
        'Mixed vegetable curry with 2 rotis (490 kcal)',
        'Grilled fish with quinoa & roasted veggies (540 kcal)',
        'Chickpea salad with lemon dressing (450 kcal)'
      ],
      dinner: [
        'Vegetable pulao with raita (420 kcal)',
        'Moong dal with rice & sabzi (480 kcal)',
        'Grilled chicken tikka with salad & mint chutney (460 kcal)',
        'Pasta primavera with olive oil & parmesan (500 kcal)'
      ],
      snacks: [
        'Sprouts chaat (120 kcal)',
        'Makhana (fox nuts) roasted (160 kcal)',
        'Fresh fruit bowl (130 kcal)',
        'Roasted chana (140 kcal)'
      ]
    },
    'Maintain': {
      breakfast: [
        'Upma with vegetables & sambar (400 kcal)',
        'Whole grain cereal with milk & banana (420 kcal)',
        'Egg bhurji with 2 whole wheat parathas (460 kcal)',
        'Dosa with coconut chutney & sambar (380 kcal)'
      ],
      lunch: [
        'Rajma with brown rice & salad (560 kcal)',
        'Chicken sandwich on whole grain with salad (520 kcal)',
        'Palak paneer with 2 rotis (540 kcal)',
        'Chole with puri (2) & onion salad (580 kcal)'
      ],
      dinner: [
        'Fish curry with rice & papad (500 kcal)',
        'Vegetable biryani with raita (540 kcal)',
        'Grilled paneer with stir-fried vegetables & rice (510 kcal)',
        'Dal tadka with 2 rotis & pickle (490 kcal)'
      ],
      snacks: [
        'Samosa (1) with green chutney (180 kcal)',
        'Lassi (250ml) (170 kcal)',
        'Mixed nuts & dried fruit (200 kcal)',
        'Banana & peanut butter (190 kcal)'
      ]
    }
  };

  // ── Exercise Plans by Level & Preference ─────────────
  var EXERCISE_PLANS = {
    Beginner: {
      strength: [
        { name:'Bodyweight Squats', sets:'3×12', rest:'60s', kcal:80 },
        { name:'Knee Push-Ups', sets:'3×10', rest:'60s', kcal:60 },
        { name:'Glute Bridges', sets:'3×15', rest:'45s', kcal:50 },
        { name:'Dumbbell Bicep Curls (5kg)', sets:'3×10', rest:'60s', kcal:55 },
        { name:'Standing Calf Raises', sets:'3×15', rest:'45s', kcal:40 }
      ],
      cardio: [
        { name:'Brisk Walk', duration:'30 min', kcal:120 },
        { name:'Low-Intensity Cycling', duration:'20 min', kcal:100 },
        { name:'Step Ups', duration:'15 min', kcal:90 }
      ],
      yoga: [
        { name:'Cat-Cow Stretch', duration:'5 min', kcal:15 },
        { name:'Child\'s Pose', duration:'5 min', kcal:12 },
        { name:'Mountain Pose Flow', duration:'10 min', kcal:20 },
        { name:'Seated Forward Bend', duration:'5 min', kcal:10 }
      ],
      hiit: [
        { name:'Modified HIIT (30s on / 30s off)', rounds:'6', kcal:150 },
        { name:'Jump Jacks + Rest Interval', rounds:'8', kcal:130 }
      ]
    },
    Intermediate: {
      strength: [
        { name:'Barbell Back Squats', sets:'4×8', rest:'90s', kcal:130 },
        { name:'Incline Dumbbell Press', sets:'4×10', rest:'75s', kcal:110 },
        { name:'Romanian Deadlift', sets:'4×10', rest:'90s', kcal:140 },
        { name:'Pull-Ups / Assisted Pull-Ups', sets:'3×8', rest:'90s', kcal:100 },
        { name:'Overhead Dumbbell Press', sets:'4×10', rest:'60s', kcal:95 }
      ],
      cardio: [
        { name:'Jogging', duration:'30 min', kcal:260 },
        { name:'Jump Rope', duration:'20 min', kcal:220 },
        { name:'Stair Climbing', duration:'25 min', kcal:200 }
      ],
      yoga: [
        { name:'Sun Salutation (5 rounds)', duration:'15 min', kcal:60 },
        { name:'Warrior Sequence', duration:'20 min', kcal:70 },
        { name:'Balance Poses Flow', duration:'15 min', kcal:55 }
      ],
      hiit: [
        { name:'Tabata (20s on / 10s off)', rounds:'8', kcal:250 },
        { name:'Circuit: Burpees + Mountain Climbers', rounds:'5', kcal:220 }
      ]
    },
    Advanced: {
      strength: [
        { name:'Deadlifts', sets:'5×5', rest:'120s', kcal:200 },
        { name:'Bench Press', sets:'5×5', rest:'120s', kcal:170 },
        { name:'Front Squats', sets:'4×6', rest:'120s', kcal:190 },
        { name:'Weighted Pull-Ups', sets:'4×6', rest:'90s', kcal:150 },
        { name:'Clean & Press', sets:'4×5', rest:'120s', kcal:180 }
      ],
      cardio: [
        { name:'Sprint Intervals (8×200m)', duration:'25 min', kcal:380 },
        { name:'Rowing Machine', duration:'30 min', kcal:350 },
        { name:'Boxing / Shadow Boxing', duration:'30 min', kcal:340 }
      ],
      yoga: [
        { name:'Ashtanga Primary Series', duration:'60 min', kcal:180 },
        { name:'Advanced Inversions Flow', duration:'45 min', kcal:130 },
        { name:'Power Yoga Circuit', duration:'45 min', kcal:160 }
      ],
      hiit: [
        { name:'Pyramid HIIT Protocol', rounds:'10', kcal:400 },
        { name:'Battle Ropes + Sled Push', rounds:'8', kcal:380 }
      ]
    }
  };

  // ── Supplement Suggestions ────────────────────────────
  var SUPPLEMENTS = {
    'Lose Weight'    : ['Whey Protein (post-workout)', 'Green Tea Extract', 'CLA (Conjugated Linoleic Acid)', 'Multivitamin'],
    'Build Muscle'   : ['Whey/Casein Protein', 'Creatine Monohydrate (5g/day)', 'BCAA (intra-workout)', 'Zinc & Magnesium'],
    'General Fitness': ['Whey Protein', 'Omega-3 Fish Oil', 'Vitamin D3', 'Multivitamin'],
    'Maintain'       : ['Omega-3', 'Multivitamin', 'Probiotics', 'Vitamin C']
  };

  // ── Weekly Workout Plan Builder ───────────────────────
  /**
   * Builds a 7-day workout plan based on user profile
   * @param {object} profile  user.profile
   * @param {string} goal     user.goal
   * @param {number} daysPerWeek  number
   * @returns {object}  { Mon: [...], Tue: [...], ... }
   */
  function buildWeeklyPlan(profile, goal, daysPerWeek){
    var level  = profile.level || 'Beginner';
    var prefs  = profile.prefs || [];
    var days   = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    var plan   = {};
    var n      = parseInt(daysPerWeek) || 3;
    var workDays = days.slice(0, n);

    var ex = EXERCISE_PLANS[level] || EXERCISE_PLANS['Beginner'];

    // Pick exercise types based on user preferences
    var types = [];
    if(prefs.includes('strength') || prefs.includes('yoga') === false) types.push('strength');
    if(prefs.includes('cardio') || prefs.includes('hiit')) types.push('cardio');
    if(prefs.includes('yoga')) types.push('yoga');
    if(prefs.includes('hiit')) types.push('hiit');
    if(!types.length) types = ['strength','cardio','yoga'];

    workDays.forEach(function(day, idx){
      var type = types[idx % types.length];
      var exercises = ex[type] || ex['strength'];
      plan[day] = exercises.map(function(e){
        return {
          text : e.name + (e.sets ? ' – '+e.sets : '') + (e.duration ? ' – '+e.duration : ''),
          cat  : type === 'cardio' || type === 'hiit' ? 'workout' : 'workout',
          time : profile.time === 'early' ? '06:00' :
                 profile.time === 'morning' ? '09:00' :
                 profile.time === 'afternoon' ? '13:00' : '19:00',
          dur  : e.duration || '45 min',
          note : e.sets ? 'Sets/Reps: '+e.sets : 'Duration: '+e.duration,
          done : false,
          id   : Date.now() + Math.random()
        };
      });
    });

    // Rest days
    days.forEach(function(day){
      if(!plan[day]){
        plan[day] = [{
          text : 'Rest & Recovery — light stretching recommended',
          cat  : 'rest', time:'09:00', dur:'20 min',
          note : 'Active recovery: walk, foam roll, stretch',
          done : false, id: Date.now() + Math.random()
        }];
      }
    });

    return plan;
  }

  // ── Diet Recommendation Card Generator ───────────────
  /**
   * Returns an HTML string for the full diet plan card
   * @param {object} user
   * @returns {string} HTML
   */
  function renderDietCard(user){
    var goal   = user.goal || 'General Fitness';
    var meals  = MEAL_PLANS[goal] || MEAL_PLANS['General Fitness'];
    var supp   = SUPPLEMENTS[goal] || SUPPLEMENTS['General Fitness'];
    var p      = user.profile || {};
    var macros = p.macros || { protein:0, carbs:0, fat:0 };

    var rand = function(arr){ return arr[Math.floor(Math.random()*arr.length)]; };

    return '<div class="panel" style="margin-bottom:20px;">' +
      '<div class="panel-head"><div class="panel-title">🥗 Your Personalised Diet Plan</div>' +
      '<span class="badge badge-green">'+goal+'</span></div>' +

      // Macros row
      (macros.protein ? '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:16px;">' +
        macroCard('🥩 Protein', macros.protein+'g', 'var(--accent)') +
        macroCard('🍚 Carbs',   macros.carbs+'g',   'var(--teal)') +
        macroCard('🥑 Fat',     macros.fat+'g',     'var(--orange)') +
      '</div>' : '') +

      // Meals
      mealRow('🌅 Breakfast', rand(meals.breakfast)) +
      mealRow('☀️ Lunch',     rand(meals.lunch)) +
      mealRow('🌙 Dinner',    rand(meals.dinner)) +
      mealRow('🍎 Snack',     rand(meals.snacks)) +

      // Supplements
      '<div style="margin-top:16px;padding-top:14px;border-top:1px solid var(--border);">' +
      '<div style="font-size:.72rem;color:var(--text3);letter-spacing:1.5px;text-transform:uppercase;margin-bottom:8px;font-weight:700;">💊 Supplement Stack</div>' +
      '<div style="display:flex;flex-wrap:wrap;gap:7px;">' +
      supp.map(function(s){ return '<span class="badge badge-purple">'+s+'</span>'; }).join('') +
      '</div></div></div>';
  }

  function macroCard(label, value, color){
    return '<div style="background:var(--card2);border:1px solid var(--border);border-radius:var(--rs);padding:12px;text-align:center;">' +
      '<div style="font-size:.68rem;color:var(--text2);margin-bottom:4px;">'+label+'</div>' +
      '<div style="font-family:\'Bebas Neue\',sans-serif;font-size:1.5rem;color:'+color+';">'+value+'</div></div>';
  }

  function mealRow(label, meal){
    return '<div style="display:flex;align-items:flex-start;gap:12px;padding:10px 0;border-bottom:1px solid var(--border);">' +
      '<div style="font-size:.72rem;color:var(--text2);min-width:90px;padding-top:2px;">'+label+'</div>' +
      '<div style="font-size:.84rem;font-weight:500;">'+meal+'</div></div>';
  }

  // ── Exercise Recommendation Card ──────────────────────
  function renderExerciseCard(user){
    var level = (user.profile && user.profile.level) || 'Beginner';
    var prefs = (user.profile && user.profile.prefs) || [];
    var goal  = user.goal || 'General Fitness';
    var ex    = EXERCISE_PLANS[level] || EXERCISE_PLANS['Beginner'];

    // Choose a type based on first pref
    var type = prefs.includes('yoga') ? 'yoga' :
               prefs.includes('hiit') ? 'hiit' :
               prefs.includes('cardio') ? 'cardio' : 'strength';

    var exercises = ex[type] || ex['strength'];

    return '<div class="panel" style="margin-bottom:20px;">' +
      '<div class="panel-head"><div class="panel-title">💪 Today\'s Workout — '+level+'</div>' +
      '<span class="badge badge-teal">'+type.toUpperCase()+'</span></div>' +
      '<div style="display:flex;flex-direction:column;gap:9px;">' +
      exercises.map(function(e, i){
        return '<div style="display:flex;align-items:center;gap:12px;padding:10px 12px;background:var(--card2);border:1px solid var(--border);border-radius:var(--rs);">' +
          '<div style="width:26px;height:26px;border-radius:50%;background:var(--adim);border:1px solid rgba(200,255,0,.2);display:flex;align-items:center;justify-content:center;font-size:.7rem;font-weight:700;color:var(--accent);font-family:\'Space Mono\',monospace;flex-shrink:0;">'+(i+1)+'</div>' +
          '<div style="flex:1;"><div style="font-size:.86rem;font-weight:600;margin-bottom:2px;">'+e.name+'</div>' +
          '<div style="font-size:.7rem;color:var(--text2);">'+(e.sets||e.duration||'')+(e.rest?' · Rest: '+e.rest:'')+'</div></div>' +
          '<div style="font-size:.78rem;color:var(--orange);font-weight:700;font-family:\'Space Mono\',monospace;">~'+e.kcal+' kcal</div></div>';
      }).join('') +
      '</div></div>';
  }

  // ── Auto-populate planner from weekly plan ─────────────
  function autoFillWeeklyPlan(user){
    if(!user.profile) return user;
    var daysPerWeek = parseInt(user.profile.days) || 3;
    var plan = buildWeeklyPlan(user.profile, user.goal, daysPerWeek);
    // Merge – don't overwrite if user already has tasks
    Object.keys(plan).forEach(function(day){
      if(!user.tasks) user.tasks = {};
      if(!user.tasks[day] || !user.tasks[day].length){
        user.tasks[day] = plan[day];
      }
    });
    return user;
  }

  // ── Video Recommendations ─────────────────────────────
  /**
   * Returns top 4 recommended videos based on user prefs & level
   * @param {object} profile
   * @returns {Array}
   */
  function recommendVideos(profile){
    var vids  = window.FITTRACK.VIDEOS;
    var prefs = profile.prefs || [];
    var level = profile.level || 'Beginner';
    var levelMap = { 'Beginner':'Beginner', 'Intermediate':'Intermediate', 'Advanced':'Advanced' };

    var scored = vids.map(function(v){
      var score = 0;
      if(prefs.includes(v.cat)) score += 2;
      if(v.level === levelMap[level] || v.level === 'All Levels') score += 1;
      return { video: v, score: score };
    });
    scored.sort(function(a,b){ return b.score - a.score; });
    return scored.slice(0,4).map(function(x){ return x.video; });
  }

  // ── Task Category Suggestions ─────────────────────────
  /**
   * Suggests task categories for the day based on profile
   * @param {object} profile
   * @param {string} dayOfWeek
   * @returns {string}
   */
  function suggestTaskCategory(profile, dayOfWeek){
    var restDays = ['Sat','Sun'];
    if(restDays.includes(dayOfWeek)) return 'rest';
    var prefs = profile.prefs || [];
    if(prefs.includes('yoga') || prefs.includes('meditation')) return 'workout';
    return 'workout';
  }

  // ── Public API ────────────────────────────────────────
  window.FT_RecommendationEngine = {
    getMealPlan    : function(goal){ return MEAL_PLANS[goal] || MEAL_PLANS['General Fitness']; },
    getExercisePlan: function(level){ return EXERCISE_PLANS[level] || EXERCISE_PLANS['Beginner']; },
    buildWeeklyPlan,
    renderDietCard,
    renderExerciseCard,
    autoFillWeeklyPlan,
    recommendVideos,
    suggestTaskCategory,
    getSupplements : function(goal){ return SUPPLEMENTS[goal] || SUPPLEMENTS['General Fitness']; }
  };

})();

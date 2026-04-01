/* ═══════════════════════════════════════════════════════
   MODULE 4 — PROGRESS TRACKING & DATA STORAGE
   Owner: Person 4
   Responsibilities:
     - localStorage read/write for all user data
     - Task CRUD operations (add, toggle, delete, clear)
     - Streak tracking & daily progress recording
     - Bar chart rendering (weekly tasks)
     - Calendar heatmap rendering (login history)
     - Dashboard stats population
     - Admin: user table rendering
     - Admin: progress cards rendering
     - Admin: activity/streak leaderboard rendering
     - Badge & sidebar counters update
     - Toast notification system
═══════════════════════════════════════════════════════ */

(function(){
  'use strict';

  var S       = window.FITTRACK.S;
  var DAYS    = window.FITTRACK.DAYS_ARR;
  var COLORS  = window.FITTRACK.AV_COLORS;

  // ════════════════════════════════════════════════════
  //  STORAGE API
  // ════════════════════════════════════════════════════

  function getUsers(){
    try{ return JSON.parse(localStorage.getItem('ft_users')||'[]'); }
    catch(e){ return []; }
  }
  function saveUsers(u){ localStorage.setItem('ft_users', JSON.stringify(u)); }

  function getUser(id){
    return getUsers().find(function(u){ return u.id===id; }) || null;
  }

  function updateUser(updated){
    var users = getUsers();
    var idx   = users.findIndex(function(u){ return u.id===updated.id; });
    if(idx > -1){ users[idx]=updated; saveUsers(users); }
  }

  function deleteUserById(id){
    var users = getUsers().filter(function(u){ return u.id!==id; });
    saveUsers(users);
  }

  // ════════════════════════════════════════════════════
  //  TOAST NOTIFICATION SYSTEM
  // ════════════════════════════════════════════════════

  function toast(msg, type){
    type = type || 's';
    var w = document.getElementById('toastWrap');
    var t = document.createElement('div');
    t.className = 'toast t-'+type;
    var ic = type==='s'?'✅':type==='e'?'❌':'ℹ️';
    t.innerHTML = '<span>'+ic+'</span><span>'+msg+'</span>';
    w.appendChild(t);
    setTimeout(function(){ t.style.opacity='0'; t.style.transform='translateX(30px)'; t.style.transition='.3s'; setTimeout(function(){ t.remove(); }, 350); }, 3000);
  }

  // Expose globally so all modules can use it
  window.FT_toast = toast;

  // ════════════════════════════════════════════════════
  //  TASK MANAGEMENT
  // ════════════════════════════════════════════════════

  function addTask(){
    var text = document.getElementById('task-input').value.trim();
    if(!text){ toast('Please enter a task','e'); return; }
    var user = getUser(S.session);
    if(!user) return;
    if(!user.tasks) user.tasks = {};
    if(!user.tasks[S.curDay]) user.tasks[S.curDay] = [];

    user.tasks[S.curDay].push({
      id   : Date.now(),
      text : text,
      cat  : document.getElementById('task-cat').value,
      time : document.getElementById('task-time').value,
      dur  : document.getElementById('task-dur').value,
      note : document.getElementById('task-note').value.trim(),
      done : false
    });

    updateUser(user);
    document.getElementById('task-input').value = '';
    document.getElementById('task-note').value  = '';
    renderTasks();
    buildDayTabs();
    updateBadge();
    toast('Task added ✅','s');
  }

  function toggleTask(id){
    var user  = getUser(S.session);
    if(!user) return;
    var tasks = (user.tasks && user.tasks[S.curDay]) || [];
    var task  = tasks.find(function(t){ return t.id===id; });
    if(!task) return;

    var wasDone = task.done;
    task.done   = !task.done;

    if(!wasDone && task.done){
      user.tasksDone = (user.tasksDone||0) + 1;
      var today = window.FT_Utils.todayStr();
      if(!user.loginDates) user.loginDates = [];
      if(!user.loginDates.includes(today)) user.loginDates.push(today);
      user.streak = window.FT_Health.calcStreak(user.loginDates);
    } else if(wasDone && !task.done){
      user.tasksDone = Math.max(0,(user.tasksDone||1)-1);
    }

    updateUser(user);
    renderTasks();
    updateBadge();
    populateDash();
    buildCalendar();
    if(task.done) toast('Task completed! 🔥 Streak: '+user.streak,'s');
  }

  function deleteTask(id){
    var user = getUser(S.session);
    if(!user) return;
    if(!user.tasks || !user.tasks[S.curDay]) return;
    user.tasks[S.curDay] = user.tasks[S.curDay].filter(function(t){ return t.id!==id; });
    updateUser(user);
    renderTasks(); buildDayTabs(); updateBadge();
  }

  function clearDay(){
    var user = getUser(S.session);
    if(!user) return;
    if(!user.tasks) user.tasks = {};
    user.tasks[S.curDay] = [];
    updateUser(user);
    renderTasks(); buildDayTabs(); updateBadge();
  }

  // ════════════════════════════════════════════════════
  //  RENDER: TASK LIST
  // ════════════════════════════════════════════════════

  function renderTasks(){
    var wrap  = document.getElementById('task-list');
    if(!wrap) return;
    var user  = getUser(S.session);
    var tasks = (user && user.tasks && user.tasks[S.curDay]) || [];

    if(!tasks.length){
      wrap.innerHTML = '<div class="empty-state"><div class="empty-icon">📋</div><div style="font-size:.82rem;color:var(--text3);line-height:1.6;">No tasks for '+S.curDay+'.<br>Add your first task!</div></div>';
    } else {
      tasks.sort(function(a,b){ return (a.time||'').localeCompare(b.time||''); });
      var ce = {workout:'💪',meal:'🥗',rest:'😴',other:'📝'};
      var cc = {workout:'tc-w',meal:'tc-m',rest:'tc-r',other:'tc-o'};
      wrap.innerHTML = tasks.map(function(t){
        return '<div class="task-item'+(t.done?' done-task':'')+'">'+
          '<div class="task-check'+(t.done?' chk':'')+'" onclick="FT_Storage.toggleTask('+t.id+')">'+(t.done?'✓':'')+'</div>'+
          '<div class="task-info"><div class="task-text">'+window.FT_Utils.esc(t.text)+'</div>'+
          '<div class="task-meta"><span>⏰ '+window.FT_Utils.esc(t.time)+'</span><span>⏱ '+window.FT_Utils.esc(t.dur)+'</span>'+
          (t.note?'<span>📝 '+window.FT_Utils.esc(t.note.slice(0,30))+(t.note.length>30?'...':'')+'</span>':'')+'</div></div>'+
          '<span class="tcat '+cc[t.cat]+'">'+(ce[t.cat]||'📝')+' '+window.FT_Utils.esc(t.cat)+'</span>'+
          '<span class="task-del" onclick="FT_Storage.deleteTask('+t.id+')">🗑</span></div>';
      }).join('');
    }
    window.FT_Utils.setText('sum-total', tasks.length);
    window.FT_Utils.setText('sum-done',  tasks.filter(function(t){ return t.done; }).length);
  }

  // ════════════════════════════════════════════════════
  //  RENDER: DAY TABS
  // ════════════════════════════════════════════════════

  function buildDayTabs(){
    var wrap = document.getElementById('day-tabs');
    if(!wrap) return;
    wrap.innerHTML = '';
    var now = new Date();
    var dmap = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    var todayShort = dmap[now.getDay()];

    DAYS.forEach(function(day){
      var tab = document.createElement('div');
      tab.className = 'day-tab'+(day===S.curDay?' act':'');
      tab.textContent = day+(day===todayShort?' (Today)':'');
      var user = getUser(S.session);
      if(user && user.tasks && user.tasks[day] && user.tasks[day].length>0) tab.classList.add('has-tasks');
      tab.onclick = (function(d,t){
        return function(){
          S.curDay = d;
          document.querySelectorAll('.day-tab').forEach(function(x){ x.classList.remove('act'); });
          t.classList.add('act');
          window.FT_Utils.setText('task-list-title', d+"'s Tasks");
          renderTasks();
        };
      })(day, tab);
      wrap.appendChild(tab);
    });
    window.FT_Utils.setText('task-list-title', S.curDay+"'s Tasks");
  }

  // ════════════════════════════════════════════════════
  //  RENDER: SIDEBAR & BADGE COUNTERS
  // ════════════════════════════════════════════════════

  function updateBadge(){
    var user = getUser(S.session);
    if(!user) return;
    var all = [];
    Object.values(user.tasks||{}).forEach(function(arr){ all = all.concat(arr); });
    window.FT_Utils.setText('task-badge', all.filter(function(t){ return !t.done; }).length);
    var todayTasks = (user.tasks && user.tasks[S.curDay]) || [];
    var done = todayTasks.filter(function(t){ return t.done; }).length;
    window.FT_Utils.setText('sb-done', done+'/'+todayTasks.length);
  }

  // ════════════════════════════════════════════════════
  //  RENDER: DASHBOARD OVERVIEW STATS
  // ════════════════════════════════════════════════════

  function populateDash(){
    var user = getUser(S.session);
    if(!user) return;
    var p    = user.profile || {};
    var first= user.name.split(' ')[0];
    var ini  = initials(user.name);
    var streak = user.streak || 0;

    window.FT_Utils.setText('sb-uname', user.name);
    window.FT_Utils.setText('wb-name',  first);
    ['sb-av','top-av','prof-av'].forEach(function(id){ window.FT_Utils.setText(id, ini); });

    window.FT_Utils.setText('wb-streak',   streak);
    window.FT_Utils.setText('sb-streak',   streak);
    window.FT_Utils.setText('stat-streak', streak);
    window.FT_Utils.setText('p-streak',    streak);
    window.FT_Utils.setText('cal-badge', '🔥 '+streak+' DAY STREAK');

    var flames=''; for(var i=0;i<Math.min(streak,5);i++) flames+='🔥';
    window.FT_Utils.setText('sb-flames', flames||'—');

    window.FT_Utils.setText('stat-logins', user.totalLogins||0);
    window.FT_Utils.setText('p-logins',    user.totalLogins||0);
    window.FT_Utils.setText('p-tasks-done',user.tasksDone||0);
    window.FT_Utils.setText('p-since',     user.since||'—');
    window.FT_Utils.setText('prof-name',   user.name);
    window.FT_Utils.setText('prof-email',  user.email);
    window.FT_Utils.setText('prof-goal',   user.goal);
    window.FT_Utils.setText('prof-level',  p.level||'Beginner');

    // Health stats
    if(p.height && p.weight){
      var bmiData = window.FT_Health.calcBMI(parseFloat(p.weight), parseFloat(p.height));
      window.FT_Utils.setText('m-weight', p.weight+' kg');
      window.FT_Utils.setText('m-bmi',    bmiData.value);
      window.FT_Utils.setText('p-bmi',    bmiData.value);
    }
    if(p.height)     window.FT_Utils.setText('p-height',     p.height+' cm');
    if(p.weight)     window.FT_Utils.setText('p-weight',     p.weight+' kg');
    if(p.tweight)    window.FT_Utils.setText('p-tweight',    p.tweight+' kg');
    if(p.age)        window.FT_Utils.setText('p-age',        p.age+' yrs');
    if(p.activity)   window.FT_Utils.setText('p-activity',   p.activity);
    if(p.meds)       window.FT_Utils.setText('p-meds',       p.meds);
    if(p.diet)       window.FT_Utils.setText('p-diet',       p.diet);
    if(p.water)      window.FT_Utils.setText('p-water',      p.water+' glasses');
    if(p.conditions) window.FT_Utils.setText('p-conditions', p.conditions||'None');
    if(p.prefs && p.prefs.length) window.FT_Utils.setText('p-prefs', p.prefs.join(', '));
    if(p.time)       window.FT_Utils.setText('p-time',       p.time);
    if(p.days)       window.FT_Utils.setText('p-days',       p.days+' days/week');
    if(p.duration)   window.FT_Utils.setText('p-duration',   p.duration);

    // Task today
    var todayTasks = (user.tasks && user.tasks[S.curDay]) || [];
    var done = todayTasks.filter(function(t){ return t.done; }).length;
    window.FT_Utils.setText('sb-done', done+' / '+todayTasks.length);

    // Calories (approx)
    var totalDone = 0;
    Object.values(user.tasks||{}).forEach(function(arr){ totalDone += arr.filter(function(t){ return t.done; }).length; });
    var cals = totalDone * 45;
    window.FT_Utils.setText('stat-cals',  cals);
    window.FT_Utils.setText('sb-cals',    cals+' kcal');
    window.FT_Utils.setText('stat-tasks', user.tasksDone||0);

    // Weekly progress
    var weekDone=0, weekTotal=0;
    DAYS.forEach(function(d){
      var arr = (user.tasks && user.tasks[d]) || [];
      weekTotal += arr.length;
      weekDone  += arr.filter(function(t){ return t.done; }).length;
    });
    var pct = weekTotal > 0 ? Math.round(weekDone/weekTotal*100) : 0;
    window.FT_Utils.setText('m-progress',    pct+'%');
    window.FT_Utils.setText('ring-sessions', user.tasksDone||0);
    window.FT_Utils.setText('stat-cals-trend', cals>0?'↑ active':'—');
    window.FT_Utils.setText('stat-tasks-trend', done+'/'+todayTasks.length+' today');

    // Diet / Exercise cards
    var dietEl = document.getElementById('diet-rec-card');
    var exEl   = document.getElementById('exercise-rec-card');
    if(dietEl && window.FT_RecommendationEngine)
      dietEl.innerHTML = window.FT_RecommendationEngine.renderDietCard(user);
    if(exEl && window.FT_RecommendationEngine)
      exEl.innerHTML = window.FT_RecommendationEngine.renderExerciseCard(user);

    setTimeout(function(){
      document.querySelectorAll('.bar-inner').forEach(function(b){
        b.style.height = b.getAttribute('data-h')+'%';
      });
    }, 300);
  }

  // ════════════════════════════════════════════════════
  //  RENDER: BAR CHART (Weekly Tasks)
  // ════════════════════════════════════════════════════

  function buildBarChart(){
    var user = getUser(S.session);
    var weekData = DAYS.map(function(d){
      if(!user || !user.tasks || !user.tasks[d]) return { d:d, v:0 };
      return { d:d, v: user.tasks[d].filter(function(t){ return t.done; }).length };
    });
    var max = Math.max.apply(null, weekData.map(function(x){ return x.v; })) || 1;
    var chart = document.getElementById('bar-chart');
    if(!chart) return;
    chart.innerHTML = '';
    weekData.forEach(function(item){
      var pct  = Math.round(item.v/max*100);
      var wrap = document.createElement('div'); wrap.className='bar-wrap';
      var bar  = document.createElement('div'); bar.className='bar'; bar.style.height='100%';
      var inner= document.createElement('div'); inner.className='bar-inner';
      inner.setAttribute('data-h',pct); inner.style.height='0%';
      bar.title = item.d+': '+item.v+' tasks done';
      bar.appendChild(inner);
      var lbl = document.createElement('div'); lbl.className='bar-lbl'; lbl.textContent=item.d;
      wrap.appendChild(bar); wrap.appendChild(lbl); chart.appendChild(wrap);
    });
    var totalWeek = weekData.reduce(function(s,x){ return s+x.v; },0);
    window.FT_Utils.setText('bar-note','This week: '+totalWeek+' tasks completed');
  }

  // ════════════════════════════════════════════════════
  //  RENDER: CALENDAR HEATMAP
  // ════════════════════════════════════════════════════

  function buildCalendar(){
    var now    = new Date();
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    window.FT_Utils.setText('cal-month', months[now.getMonth()]+' '+now.getFullYear());
    var grid = document.getElementById('cal-grid');
    if(!grid) return;
    grid.innerHTML = '';
    var user    = getUser(S.session);
    var loginSet= new Set((user&&user.loginDates)||[]);
    var todayDate = now.getDate();
    var daysInMonth = new Date(now.getFullYear(),now.getMonth()+1,0).getDate();
    var firstDay    = new Date(now.getFullYear(),now.getMonth(),1).getDay();

    for(var i=0;i<firstDay;i++){
      var b=document.createElement('div'); b.className='cal-day'; b.style.visibility='hidden'; grid.appendChild(b);
    }
    for(var d=1;d<=daysInMonth;d++){
      var el  = document.createElement('div'); el.className='cal-day';
      var dStr= now.getFullYear()+'-'+String(now.getMonth()+1).padStart(2,'0')+'-'+String(d).padStart(2,'0');
      if(d===todayDate) el.classList.add('today');
      else if(loginSet.has(dStr)) el.classList.add('done');
      el.title = months[now.getMonth()]+' '+d;
      grid.appendChild(el);
    }
  }

  // ════════════════════════════════════════════════════
  //  DASHBOARD LAUNCH
  // ════════════════════════════════════════════════════

  function launchDash(){
    window.showPage('dash');
    populateDash();
    buildBarChart();
    buildCalendar();
    renderTasks();
    updateBadge();
  }

  function switchTab(tab){
    document.querySelectorAll('.dash-tab').forEach(function(t){ t.classList.remove('act'); });
    document.querySelectorAll('.nav-item[id^="n-"]').forEach(function(n){ n.classList.remove('act'); });
    var t = document.getElementById('tab-'+tab); if(t) t.classList.add('act');
    var n = document.getElementById('n-'+tab);   if(n) n.classList.add('act');
    var titles={overview:'OVERVIEW',planner:'DAILY PLANNER',videos:'VIDEO LIBRARY',profile:'MY PROFILE'};
    window.FT_Utils.setText('topbar-title', titles[tab]||tab.toUpperCase());
    S.curTab = tab;
    if(tab==='planner') renderTasks();
    if(tab==='overview'){ populateDash(); buildBarChart(); buildCalendar(); }
  }

  // ════════════════════════════════════════════════════
  //  ADMIN DASHBOARD RENDERING
  // ════════════════════════════════════════════════════

  function launchAdmin(){
    window.showPage('admin');
    renderAdminUsers();
    renderProgress();
    renderActivity();
    window.FT_Utils.setText('admin-top-date', new Date().toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'}));
  }

  function switchAdminTab(tab){
    document.querySelectorAll('.admin-tab').forEach(function(t){ t.classList.remove('act'); });
    document.querySelectorAll('.aNav').forEach(function(n){ n.classList.remove('act'); });
    var t = document.getElementById('atab-'+tab); if(t) t.classList.add('act');
    var n = document.getElementById('an-'+tab);   if(n) n.classList.add('act');
  }

  function renderAdminUsers(){
    var users = getUsers();
    // Summary stats
    window.FT_Utils.setText('a-total',    users.length);
    window.FT_Utils.setText('a-active',   users.filter(function(u){ return u.active; }).length);
    window.FT_Utils.setText('a-inactive', users.filter(function(u){ return !u.active; }).length);
    var totalTasks = 0;
    users.forEach(function(u){ totalTasks += u.tasksDone||0; });
    window.FT_Utils.setText('a-tasks', totalTasks);

    var tbody = document.getElementById('users-tbody');
    if(!tbody) return;
    if(!users.length){
      tbody.innerHTML='<tr><td colspan="7" style="text-align:center;color:var(--text3);padding:30px;">No users registered yet.</td></tr>';
      return;
    }
    tbody.innerHTML = users.map(function(u,i){
      var bmi = (u.profile&&u.profile.height&&u.profile.weight) ?
        window.FT_Health.calcBMI(parseFloat(u.profile.weight),parseFloat(u.profile.height)).value : '—';
      return '<tr>'+
        '<td><div style="display:flex;align-items:center;gap:10px;">'+
          '<div class="user-av-sm '+(COLORS[i%5]||'')+'">'+window.FT_Utils.esc(initials(u.name))+'</div>'+
          '<div><div style="font-weight:600;font-size:.86rem;">'+window.FT_Utils.esc(u.name)+'</div>'+
          '<div style="font-size:.7rem;color:var(--text2);">'+window.FT_Utils.esc(u.email)+'</div></div></div></td>'+
        '<td><span class="badge badge-green">'+window.FT_Utils.esc(u.goal||'—')+'</span></td>'+
        '<td><span style="font-family:\'Space Mono\',monospace;font-size:.82rem;">'+bmi+'</span></td>'+
        '<td><span style="color:var(--accent);font-weight:700;">🔥 '+(u.streak||0)+'</span></td>'+
        '<td>'+(u.tasksDone||0)+'</td>'+
        '<td><span class="badge '+(u.active?'badge-teal':'badge-red')+'">'+(u.active?'Active':'Suspended')+'</span></td>'+
        '<td style="display:flex;gap:6px;">' +
          '<button class="btn btn-teal" style="font-size:.72rem;padding:5px 10px;" onclick="FT_Storage.viewUser(\''+u.id+'\')">View</button>'+
          '<button class="btn '+(u.active?'btn-red':'btn-accent')+'" style="font-size:.72rem;padding:5px 10px;" onclick="FT_Storage.toggleUserStatus(\''+u.id+'\')">'+(u.active?'Suspend':'Activate')+'</button></td>'+
        '</tr>';
    }).join('');
  }

  function toggleUserStatus(id){
    var users = getUsers();
    var user  = users.find(function(u){ return u.id===id; });
    if(!user) return;
    user.active = !user.active;
    saveUsers(users);
    toast((user.active?'User activated':'User suspended'),'s');
    renderAdminUsers(); renderProgress();
  }

  function viewUser(id){
    var u = getUser(id);
    if(!u) return;
    var p = u.profile || {};
    var allTasks=[], doneTasks=[];
    Object.values(u.tasks||{}).forEach(function(arr){ allTasks=allTasks.concat(arr); });
    doneTasks = allTasks.filter(function(t){ return t.done; });

    var bmi = (p.height&&p.weight) ? window.FT_Health.calcBMI(parseFloat(p.weight),parseFloat(p.height)).value : '—';

    document.getElementById('udm-content').innerHTML =
      '<div class="udm-section">'+
        '<div class="udm-sec-title">Account Info</div>'+
        '<div class="udm-fields">'+
          udmF('Name',u.name)+udmF('Email',u.email)+udmF('Goal',u.goal||'—')+
          udmF('Member Since',u.since||'—')+udmF('Streak','🔥 '+(u.streak||0)+' days')+
          udmF('Total Logins',u.totalLogins||0)+udmF('Tasks Done',u.tasksDone||0)+
          udmF('Status',u.active?'Active':'Suspended')+
        '</div></div>'+
      '<div class="udm-section">'+
        '<div class="udm-sec-title">Health Profile</div>'+
        '<div class="udm-fields">'+
          udmF('Height',p.height?p.height+' cm':'—')+udmF('Weight',p.weight?p.weight+' kg':'—')+
          udmF('Target Wt',p.tweight?p.tweight+' kg':'—')+udmF('Age',p.age?p.age+' yrs':'—')+
          udmF('Gender',p.gender||'—')+udmF('BMI',bmi)+udmF('Activity',p.activity||'—')+
          udmF('Diet',p.diet||'—')+udmF('Water',p.water?p.water+' glasses':'—')+
          udmF('Medications',p.meds||'None')+udmF('Conditions',p.conditions||'None')+
          udmF('Level',p.level||'—')+
        '</div></div>'+
      '<div class="udm-section">'+
        '<div class="udm-sec-title">Recent Tasks ('+doneTasks.length+' completed)</div>'+
        '<div class="udm-tasks-list">'+
          (allTasks.slice(-8).reverse().map(function(t){
            return '<div class="udm-task'+(t.done?' done':'')+'">'+
              '<div><div class="udm-task-text">'+(t.done?'✅':'⬜')+' '+window.FT_Utils.esc(t.text)+'</div>'+
              '<div class="udm-task-meta">'+window.FT_Utils.esc(t.cat)+' · '+window.FT_Utils.esc(t.time)+' · '+window.FT_Utils.esc(t.dur)+'</div></div>'+
              '<span class="badge '+(t.done?'badge-green':'badge-orange')+'">'+(t.done?'Done':'Pending')+'</span></div>';
          }).join('')||'<div style="color:var(--text3);font-size:.82rem;">No tasks yet.</div>')+
        '</div></div>';

    document.getElementById('userDetailModal').classList.add('open');
  }

  function udmF(k,v){
    return '<div class="udm-field"><div class="udm-key">'+window.FT_Utils.esc(k)+'</div><div class="udm-val">'+window.FT_Utils.esc(v)+'</div></div>';
  }

  function closeUserDetail(){
    document.getElementById('userDetailModal').classList.remove('open');
  }

  function renderProgress(){
    var users = getUsers();
    var wrap  = document.getElementById('progress-cards');
    if(!wrap) return;
    if(!users.length){ wrap.innerHTML='<div style="color:var(--text3);grid-column:1/-1;padding:28px;text-align:center;">No users registered yet.</div>'; return; }
    wrap.innerHTML = users.map(function(u,i){
      var allTasks=[];
      Object.values(u.tasks||{}).forEach(function(arr){ allTasks=allTasks.concat(arr); });
      var done = allTasks.filter(function(t){ return t.done; }).length;
      var pct  = allTasks.length ? Math.round(done/allTasks.length*100) : 0;
      var weekTasks=[];
      DAYS.forEach(function(d){ if(u.tasks&&u.tasks[d]) weekTasks=weekTasks.concat(u.tasks[d]); });
      var weekDone= weekTasks.filter(function(t){ return t.done; }).length;
      var weekPct = weekTasks.length ? Math.round(weekDone/weekTasks.length*100) : 0;
      var bmi     = (u.profile&&u.profile.height&&u.profile.weight) ?
        window.FT_Health.calcBMI(parseFloat(u.profile.weight),parseFloat(u.profile.height)).value : '—';

      return '<div class="panel">'+
        '<div style="display:flex;align-items:center;gap:11px;margin-bottom:16px;">'+
          '<div class="user-av-sm '+(COLORS[i%5]||'')+'">'+window.FT_Utils.esc(initials(u.name))+'</div>'+
          '<div><div style="font-size:.9rem;font-weight:700;">'+window.FT_Utils.esc(u.name)+'</div>'+
          '<div style="font-size:.72rem;color:var(--text2);">'+window.FT_Utils.esc(u.goal||'—')+'  ·  🔥 '+(u.streak||0)+' day streak</div></div>'+
          '<span class="badge '+(u.active?'badge-green':'badge-red')+'" style="margin-left:auto;">'+(u.active?'Active':'Suspended')+'</span>'+
        '</div>'+
        pbRow('Overall Tasks',pct)+pbRow('This Week',weekPct)+pbRow('Streak Score',Math.min(100,(u.streak||0)*10))+
        '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin-top:14px;">'+
          miniStat('Streak','🔥 '+(u.streak||0))+miniStat('Logins',u.totalLogins||0)+miniStat('Done',u.tasksDone||0)+
        '</div></div>';
    }).join('');
    setTimeout(function(){
      document.querySelectorAll('.pb-fill').forEach(function(b){ b.style.width=b.getAttribute('data-w')+'%'; });
    },200);
  }

  function pbRow(lbl,pct){
    return '<div class="progress-bar-row">'+
      '<div class="pb-label">'+window.FT_Utils.esc(lbl)+'</div>'+
      '<div class="pb-track"><div class="pb-fill" data-w="'+pct+'" style="width:0%;"></div></div>'+
      '<div class="pb-val">'+pct+'%</div></div>';
  }
  function miniStat(l,v){
    return '<div style="background:var(--card3);border-radius:7px;padding:8px;text-align:center;">'+
      '<div style="font-family:\'Bebas Neue\',sans-serif;font-size:1.2rem;color:var(--accent);">'+window.FT_Utils.esc(v)+'</div>'+
      '<div style="font-size:.6rem;color:var(--text2);">'+window.FT_Utils.esc(l)+'</div></div>';
  }

  function renderActivity(){
    var users = getUsers();
    var wrap  = document.getElementById('activity-list');
    if(!wrap) return;
    if(!users.length){ wrap.innerHTML='<div style="color:var(--text3);font-size:.82rem;padding:20px;">No users registered yet.</div>'; return; }
    var sorted = users.slice().sort(function(a,b){ return (b.streak||0)-(a.streak||0); });
    wrap.innerHTML = sorted.map(function(u,i){
      var loginDates = (u.loginDates||[]).slice(-14);
      return '<div class="panel" style="display:flex;align-items:center;gap:16px;padding:18px 22px;">'+
        '<div class="user-av-sm '+(COLORS[i%5]||'')+'" style="width:42px;height:42px;font-size:.9rem;flex-shrink:0;">'+window.FT_Utils.esc(initials(u.name))+'</div>'+
        '<div style="flex:1;min-width:0;">'+
          '<div style="display:flex;align-items:center;gap:10px;margin-bottom:7px;">'+
            '<div style="font-size:.9rem;font-weight:700;">'+window.FT_Utils.esc(u.name)+'</div>'+
            '<span class="badge badge-green" style="font-size:.6rem;">'+window.FT_Utils.esc(u.goal||'—')+'</span>'+
            '<span class="badge '+(u.active?'badge-teal':'badge-red')+'" style="font-size:.6rem;">'+(u.active?'Active':'Suspended')+'</span>'+
          '</div>'+
          '<div style="display:flex;gap:5px;flex-wrap:wrap;">'+
            loginDates.map(function(d){ return '<div title="'+window.FT_Utils.esc(d)+'" style="width:14px;height:14px;background:var(--accent);border-radius:2px;opacity:.8;"></div>'; }).join('')+
            (loginDates.length===0?'<span style="font-size:.72rem;color:var(--text3);">No login history</span>':'')+
          '</div>'+
          '<div style="font-size:.72rem;color:var(--text2);margin-top:5px;">'+loginDates.length+' active days recorded</div>'+
        '</div>'+
        '<div style="text-align:center;min-width:80px;">'+
          '<div style="font-family:\'Bebas Neue\',sans-serif;font-size:2rem;color:var(--accent);line-height:1;">🔥'+(u.streak||0)+'</div>'+
          '<div style="font-size:.66rem;color:var(--text2);">DAY STREAK</div>'+
          '<div style="font-size:.72rem;color:var(--teal);margin-top:4px;">'+(u.totalLogins||0)+' logins</div>'+
        '</div>'+
        '<div style="text-align:center;min-width:70px;">'+
          '<div style="font-family:\'Bebas Neue\',sans-serif;font-size:1.8rem;color:var(--teal);line-height:1;">'+(u.tasksDone||0)+'</div>'+
          '<div style="font-size:.66rem;color:var(--text2);">TASKS DONE</div>'+
        '</div>'+
        '</div>';
    }).join('');
  }

  // ── Helper ────────────────────────────────────────────
  function initials(name){
    return (name||'U').split(' ').map(function(w){ return w[0]||''; }).join('').toUpperCase().slice(0,2)||'U';
  }

  // ════════════════════════════════════════════════════
  //  PUBLIC API
  // ════════════════════════════════════════════════════
  window.FT_Storage = {
    getUsers, saveUsers, getUser, updateUser, deleteUserById,
    addTask, toggleTask, deleteTask, clearDay,
    renderTasks, buildDayTabs, updateBadge,
    populateDash, buildBarChart, buildCalendar,
    launchDash, switchTab,
    launchAdmin, switchAdminTab,
    renderAdminUsers, toggleUserStatus, viewUser, closeUserDetail,
    renderProgress, renderActivity
  };

  window.FT_Dash  = { launch: launchDash };
  window.FT_Admin = { launch: launchAdmin };

})();

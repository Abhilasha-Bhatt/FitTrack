/* ═══════════════════════════════════════════════════════
   MODULE 1 — ONBOARDING UI LOGIC
   Part of: UI/UX & Frontend Structure
   Owner: Person 1
   Responsibilities:
     - Step navigation (next/prev) for 4-step onboard
     - Preference card toggles
     - Slot selection (time, days, level)
     - Medical toggle
     - Video modal open/close
     - Tab switching (user dashboard)
     - Filter buttons (video library)
     - Video grid rendering
     - Admin nav tabs switching
═══════════════════════════════════════════════════════ */

(function(){
  'use strict';

  var S = window.FITTRACK.S;

  // ── Onboarding Step Navigation ─────────────────────
  function reset(){
    S.curSec=1; S.prefs=[]; S.selTime=''; S.selDays=''; S.selLevel=''; S.hasMed=false;
    for(var i=1;i<=4;i++){
      var s=document.getElementById('obs-sec-'+i);
      if(s) s.classList.remove('act');
    }
    var s1=document.getElementById('obs-sec-1');
    if(s1) s1.classList.add('act');
    updateObUI();
  }

  function updateObUI(){
    var n=S.curSec;
    for(var i=1;i<=4;i++){
      var e=document.getElementById('obs-'+i);
      if(!e) continue;
      e.className='ob-step'+(i===n?' act':i<n?' done':'');
    }
    document.getElementById('ob-prog').style.width=(n/4*100)+'%';
    window.FT_Utils.setText('ob-lbl',n+' / 4');
    document.getElementById('ob-prev').style.visibility=n>1?'visible':'hidden';
    document.getElementById('ob-next').textContent=n===4?'🚀 Start Journey':'Continue →';
  }

  function obNext(){
    if(S.curSec<4){
      document.getElementById('obs-sec-'+S.curSec).classList.remove('act');
      S.curSec++;
      document.getElementById('obs-sec-'+S.curSec).classList.add('act');
      updateObUI();
    } else {
      window.FT_Auth.finishOnboard();
    }
  }

  function obPrev(){
    if(S.curSec>1){
      document.getElementById('obs-sec-'+S.curSec).classList.remove('act');
      S.curSec--;
      document.getElementById('obs-sec-'+S.curSec).classList.add('act');
      updateObUI();
    }
  }

  function toggleMed(v){
    S.hasMed = v==='yes';
    document.getElementById('med-no').className  = 'med-btn'+(v==='no' ?' act':'');
    document.getElementById('med-yes').className = 'med-btn'+(v==='yes'?' act':'');
    document.getElementById('med-detail').style.display = S.hasMed ? 'block' : 'none';
  }

  function togglePref(el){
    el.classList.toggle('sel');
    var p   = el.dataset.pref;
    var idx = S.prefs.indexOf(p);
    if(idx>-1) S.prefs.splice(idx,1);
    else S.prefs.push(p);
  }

  function selectSlot(el, type){
    el.parentElement.querySelectorAll('.slot').forEach(function(s){ s.classList.remove('sel'); });
    el.classList.add('sel');
    if(type==='time')  S.selTime  = el.getAttribute('data-time');
    if(type==='days')  S.selDays  = el.getAttribute('data-days');
    if(type==='level') S.selLevel = el.getAttribute('data-level');
  }

  // ── Video Library ──────────────────────────────────
  function buildVideoGrid(filter){
    var grid  = document.getElementById('video-grid');
    if(!grid) return;
    var VIDEOS= window.FITTRACK.VIDEOS;
    var list  = filter==='all' ? VIDEOS : VIDEOS.filter(function(v){ return v.cat===filter; });
    var tc    = {yoga:'vt-yoga',exercise:'vt-exercise',meditation:'vt-meditation',strength:'vt-strength'};
    grid.innerHTML = list.map(function(v){
      return '<div class="video-card" onclick="FT_UI.openVideo(\''+v.id+'\',\''+window.FT_Utils.esc(v.title)+'\',\''+v.dur+' · '+v.level+'\')">'+
        '<div class="video-thumb"><img src="https://img.youtube.com/vi/'+v.id+'/mqdefault.jpg" alt="'+window.FT_Utils.esc(v.title)+'" loading="lazy"/>'+
        '<div class="video-overlay"><div class="play-circle">▶</div></div></div>'+
        '<div class="video-info"><div class="vid-tag '+(tc[v.cat]||'vt-exercise')+'">'+window.FT_Utils.esc(v.cat)+'</div>'+
        '<div class="video-title">'+window.FT_Utils.esc(v.title)+'</div>'+
        '<div class="video-meta">▶ '+v.dur+' · '+v.level+'</div></div></div>';
    }).join('');
  }

  function filterVids(el){
    document.querySelectorAll('.fbtn').forEach(function(b){ b.classList.remove('act'); });
    el.classList.add('act');
    buildVideoGrid(el.getAttribute('data-filter'));
  }

  function openVideo(id, title, sub){
    document.getElementById('modalFrame').src = 'https://www.youtube.com/embed/'+id+'?autoplay=1';
    window.FT_Utils.setText('modalTitle', title);
    window.FT_Utils.setText('modalSub', sub);
    document.getElementById('videoModal').classList.add('open');
  }

  function closeVideo(){
    document.getElementById('videoModal').classList.remove('open');
    document.getElementById('modalFrame').src = '';
  }

  // ── Init ───────────────────────────────────────────
  (function init(){
    var now   = new Date();
    var dmap  = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    S.curDay  = dmap[now.getDay()] === 'Sun' ? 'Sun' : dmap[now.getDay()];
    // default to Mon if calculation off
    if(!window.FITTRACK.DAYS_ARR.includes(S.curDay)) S.curDay='Mon';

    var h = now.getHours();
    var g = h<12?'Good morning 👋':h<17?'Good afternoon 👋':'Good evening 👋';
    window.FT_Utils.setText('wb-greet', g);
    var dateStr = now.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'});
    window.FT_Utils.setText('top-date', dateStr);
    window.FT_Utils.setText('admin-top-date', dateStr);
    buildVideoGrid('all');
  })();

  // ── Expose Public API ──────────────────────────────
  window.FT_UI = {
    reset, obNext, obPrev,
    toggleMed, togglePref, selectSlot,
    buildVideoGrid, filterVids, openVideo, closeVideo
  };

  window.FT_Onboard = { reset };

})();

// ================= GLOBAL =================
let userProfile = {};
const params = new URLSearchParams(window.location.search);
const email = params.get("email");

console.log("Script Loaded");
console.log("Email from URL:", email);

// ================= MUSIC DATABASE =================
const musicDB = {
  'lose weight': [
    { title: "High Energy Cardio Mix", youtubeId: "kvXhF5K1v7A", icon: "🔥", bpm: "140-160 BPM" },
    { title: "Fat Burn EDM Beats", youtubeId: "yJgMAvJj608", icon: "⚡", bpm: "130-150 BPM" },
    { title: "Running Motivation", youtubeId: "M2Q1EIMNhlA", icon: "🏃", bpm: "150-170 BPM" }
  ],
  'build muscle': [
    { title: "Heavy Lifting Anthems", youtubeId: "cK2Xf0nmbg0", icon: "🏋️", bpm: "120-140 BPM" },
    { title: "Beast Mode Hip Hop", youtubeId: "hTWKbfoikeg", icon: "💪", bpm: "90-110 BPM" },
    { title: "Power Metal Workout", youtubeId: "vphzO2a37eU", icon: "🤘", bpm: "140-180 BPM" }
  ],
  'default': [
    { title: "Workout Power Mix", youtubeId: "tOtb_1I6iA4", icon: "🎧", bpm: "120-140 BPM" },
    { title: "Gym Motivation Beats", youtubeId: "2XyqgP9jJbA", icon: "🔊", bpm: "130-150 BPM" },
    { title: "Yoga & Stretch Chill", youtubeId: "qFZKK7K52uQ", icon: "🧘", bpm: "70-90 BPM" },
    { title: "HIIT Timer Music", youtubeId: "Ww7Zz-K-L8s", icon: "⏱️", bpm: "140-160 BPM" },
    { title: "Rock Gym Playlist", youtubeId: "3m0V-rP9kY0", icon: "🎸", bpm: "120-150 BPM" },
    { title: "Lo-Fi Cool Down", youtubeId: "5qap5aO4i9A", icon: "🌙", bpm: "60-80 BPM" }
  ]
};

// ================= INIT =================
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM Loaded");
  initDateBadge();
  loadUserProfile();

  // Modal close
  document.getElementById("closeModal").addEventListener("click", closeModal);

  // Filter buttons
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      filterVideos(filter);
    });
  });

  // Stop music button
  const stopBtn = document.getElementById("stopMusic");
  if (stopBtn) {
    stopBtn.addEventListener("click", stopMusic);
  }
});

// ================= LOAD USER =================
async function loadUserProfile() {
  if (!email) {
    console.warn("No email found in URL — loading default workouts");
    const heading = document.getElementById("user-heading");
    if (heading) {
      heading.textContent = "General fitness workouts";
    }
    
    // Load default videos and music even without a user profile
    userProfile = {
      goal: "general fitness",
      fitness_level: "beginner",
      session_duration: "30 min",
      preferences: "full body"
    };
    displayVideos();
    loadMusic();
    return;
  }

  try {
    console.log("Fetching user profile...");

    const res = await fetch(`get_user_profile.php?email=${email}`);
    const data = await res.json();

    console.log("API Response:", data);

    if (data.success) {
      userProfile = normalizeProfile(data.user);

      console.log("Normalized User Profile:", userProfile);

      const heading = document.getElementById("user-heading");
      if (heading) {
        heading.textContent = `Workouts for: ${userProfile.goal || 'General Fitness'}`;
      }

      displayVideos();
      loadMusic();
    } else {
      console.error("User not found — loading defaults");
      const heading = document.getElementById("user-heading");
      if (heading) {
        heading.textContent = "General fitness workouts";
      }
      userProfile = { goal: "general fitness", fitness_level: "beginner", preferences: "full body" };
      displayVideos();
      loadMusic();
    }

  } catch (err) {
    console.error("Error fetching profile:", err);
    userProfile = { goal: "general fitness", fitness_level: "beginner", preferences: "full body" };
    displayVideos();
    loadMusic();
  } finally {
    const loader = document.getElementById("loading");
    if (loader) loader.style.display = "none";
  }
}

// ================= NORMALIZE =================
function normalizeProfile(profile) {
  return {
    ...profile,
    goal: profile.goal?.toLowerCase(),
    fitness_level: profile.fitness_level?.toLowerCase(),
    conditions: profile.conditions?.toLowerCase(),
    preferences: profile.preferences?.toLowerCase(),
    session_duration: profile.session_duration?.toLowerCase()
  };
}

// ================= BMI =================
function getBMI(profile) {
  if (!profile.height_cm || !profile.weight_kg) {
    console.warn("Missing height/weight → skipping BMI");
    return 22; // safe default
  }

  const height = profile.height_cm / 100;
  const bmi = profile.weight_kg / (height * height);

  console.log("BMI:", bmi.toFixed(2));
  return bmi;
}

// ================= QUERY BUILDER =================
function buildQuery(profile, filterType) {
  let query = "";

  const bmi = getBMI(profile);

  console.log("Building query from profile...");

  // If a specific filter is active, use it
  if (filterType && filterType !== 'all') {
    query += filterType + " workout ";
  } else {
    // Goal
    if (profile.goal === "lose weight") {
      query += "fat loss ";
      if (bmi > 25) query += "HIIT ";
      else query += "light cardio ";
    } else if (profile.goal === "build muscle") {
      query += "muscle building strength ";
    } else {
      query += "full body fitness ";
    }
  }

  // Level
  if (profile.fitness_level === "beginner") {
    query += "beginner ";
  } else if (profile.fitness_level === "advanced") {
    query += "advanced ";
  }

  // Duration
  if (profile.session_duration) {
    query += profile.session_duration + " ";
  }

  // Conditions
  if (profile.conditions?.includes("knee")) {
    query += "no jumping low impact ";
  }
  if (profile.conditions?.includes("back")) {
    query += "back pain safe ";
  }

  // Preferences
  if (profile.preferences && filterType === 'all') {
    query += profile.preferences + " ";
  }

  console.log("Final Query:", query.trim());
  return query.trim();
}

// ================= FETCH VIDEOS =================
async function fetchVideos(query) {
  const API_KEY = "AIzaSyDxYS3cSttyjuiG6OZreDqz9ddW5y3atZ4"; 

  try {
    console.log("Fetching videos for query:", query);

    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=6&key=${API_KEY}`
    );

    const data = await res.json();

    console.log("YouTube API Response:", data);

    if (!data.items) {
      console.error("API Error:", data);
      return [];
    }

    const videos = data.items.map(item => ({
      title: item.snippet.title,
      youtubeId: item.id.videoId,
      thumbnail: item.snippet.thumbnails.medium.url,
      description: item.snippet.description,
      type: guessVideoType(item.snippet.title + " " + item.snippet.description)
    }));

    console.log("Videos fetched:", videos);
    return videos;

  } catch (err) {
    console.error("Fetch failed:", err);
    return [];
  }
}

// ================= GUESS VIDEO TYPE =================
function guessVideoType(text) {
  text = text.toLowerCase();
  if (text.includes('yoga') || text.includes('meditation')) return 'yoga';
  if (text.includes('cardio') || text.includes('running') || text.includes('hiit')) return 'cardio';
  if (text.includes('strength') || text.includes('muscle') || text.includes('weight')) return 'strength';
  if (text.includes('stretch') || text.includes('flexibility') || text.includes('cool down')) return 'stretching';
  return 'all';
}

// ================= FILTER =================
let allLoadedVideos = [];
let currentFilter = 'all';

function filterVideos(type) {
  currentFilter = type;
  
  // Re-fetch with the new filter
  displayVideos(type);
}

// ================= DISPLAY =================
async function displayVideos(filterType = 'all') {
  const grid = document.getElementById("videosGrid");

  if (!userProfile || Object.keys(userProfile).length === 0) {
    console.error("Empty user profile");
    grid.innerHTML = "No user data found";
    return;
  }

  grid.innerHTML = `
    <div style="grid-column: 1 / -1; text-align: center; padding: 40px;">
      <div class="video-loader"></div>
      <p style="color: var(--text2); margin-top: 16px;">Loading workouts...</p>
    </div>
  `;

  const query = buildQuery(userProfile, filterType);
  const videos = await fetchVideos(query);

  if (videos.length === 0) {
    console.warn("No videos returned");
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 60px; color: var(--text2);">
        <div style="font-size: 3rem; margin-bottom: 16px;">📹</div>
        <h3>No videos found</h3>
        <p>Try a different filter or check your internet connection.</p>
      </div>
    `;
    return;
  }

  allLoadedVideos = videos;
  grid.innerHTML = "";

  videos.forEach((video, index) => {
    const card = document.createElement("div");
    card.className = "video-card";
    card.style.animationDelay = `${index * 0.1}s`;
    card.dataset.type = video.type;

    card.innerHTML = `
      <div class="video-thumbnail">
        <img src="${video.thumbnail}" alt="${video.title}"/>
        <div class="play-icon"></div>
      </div>
      <div class="video-card-info">
        <div class="video-card-type">${video.type}</div>
        <h3 class="video-card-title">${video.title}</h3>
      </div>
    `;

    card.onclick = () => openModal(video);
    grid.appendChild(card);
  });

  document.getElementById("loading").style.display = "none";
  console.log("Videos rendered successfully");
}

// ================= MUSIC =================
function loadMusic() {
  const musicGrid = document.getElementById("musicGrid");
  if (!musicGrid) return;

  const goal = userProfile.goal || 'default';
  const tracks = musicDB[goal] || musicDB['default'];

  musicGrid.innerHTML = "";

  tracks.forEach((track, index) => {
    const card = document.createElement("div");
    card.className = "music-card";
    card.style.animationDelay = `${index * 0.1}s`;

    card.innerHTML = `
      <div class="music-icon">${track.icon}</div>
      <div class="music-info">
        <h4>${track.title}</h4>
        <span class="music-bpm">${track.bpm}</span>
      </div>
      <button class="play-music-btn" title="Play">▶</button>
    `;

    card.querySelector('.play-music-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      playMusic(track, card);
    });

    musicGrid.appendChild(card);
  });
}

let musicIframe = null;
let musicAudio = null;

function playMusic(track, card) {
  // Stop existing
  stopMusic();

  const playerContainer = document.getElementById('musicPlayerContainer');
  if (!playerContainer) return;

  playerContainer.innerHTML = `
    <iframe 
      id="musicIframe"
      width="40" height="40"
      src="https://www.youtube.com/embed/${track.youtubeId}?autoplay=1&mute=0&loop=1&playlist=${track.youtubeId}&controls=0&modestbranding=1"
      allow="autoplay"
      style="border:none; pointer-events:none;">
    </iframe>
  `;

  const nowPlaying = document.getElementById("nowPlaying");
  const nowTitle = document.getElementById("nowPlayingTitle");
  if (nowPlaying && nowTitle) {
    nowPlaying.classList.remove("hidden");
    nowTitle.textContent = track.title;
  }

  document.querySelectorAll('.music-card').forEach(c => c.classList.remove('active'));
  if (card) card.classList.add('active');
}

function stopMusic() {
  const container = document.getElementById('musicPlayerContainer');
  if (container) {
    container.innerHTML = ""; // This stops the video
  }
  const nowPlaying = document.getElementById("nowPlaying");
  if (nowPlaying) nowPlaying.classList.add("hidden");
  document.querySelectorAll('.music-card').forEach(c => c.classList.remove('active'));
}

// ================= MODAL =================
function openModal(video) {
  console.log("Playing video:", video.title);

  // Stop music when opening a video
  stopMusic();

  const iframe = document.getElementById("videoFrame");
  iframe.src = `https://www.youtube.com/embed/${video.youtubeId}?autoplay=1`;

  document.getElementById("videoTitle").textContent = video.title;
  document.getElementById("videoDescription").textContent = video.description || "";
  document.getElementById("videoModal").classList.remove("hidden");
}

function closeModal() {
  console.log("Closing modal");
  const iframe = document.getElementById("videoFrame");
  iframe.src = "";
  document.getElementById("videoModal").classList.add("hidden");
}

function initDateBadge() {
  const badge = document.getElementById('dateBadge');
  if (badge) {
    const now = new Date();
    badge.textContent = now.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  }
}
# 🏋️ FITTRACK — Elite Fitness Platform

A modular fitness web application split into **4 independent modules** for team collaboration.

---

## 📁 Project Structure

```
fittrack/
├── index.html                          ← Main entry point (integrates all modules)
├── shared/
│   ├── constants.js                    ← Global state, video data, constants
│   └── styles.css                      ← Base CSS design tokens (shared)
│
├── module1-ui-frontend/               ← 👤 Person 1
│   ├── styles.css                      ← All page layouts & UI component CSS
│   ├── ui.js                           ← Onboarding steps, video grid, filters
│   └── README.md
│
├── module2-health-logic/              ← 👤 Person 2
│   ├── health.js                       ← BMI, BMR, TDEE, streak calc, auth
│   └── README.md
│
├── module3-diet-exercise-engine/      ← 👤 Person 3
│   ├── recommendations.js              ← Meal plans, exercise plans, weekly builder
│   └── README.md
│
└── module4-progress-storage/         ← 👤 Person 4
    ├── storage.js                      ← localStorage CRUD, task management, charts
    └── README.md
```

---

## 🚀 How to Run

> No build tools needed! Pure HTML/CSS/JS.

1. Clone the repo
2. Open `index.html` in a browser (or use Live Server in VS Code)
3. That's it ✅

```bash
git clone <repo-url>
cd fittrack
# Open index.html in browser, OR:
npx live-server .
```

---

## 👥 Team Responsibilities

| Module | Person | Folder | Responsibility |
|--------|--------|--------|----------------|
| 1 | Person 1 | `module1-ui-frontend/` | UI/UX, page layouts, CSS, animations, video grid |
| 2 | Person 2 | `module2-health-logic/` | BMI/BMR/TDEE calculations, auth logic, onboarding save |
| 3 | Person 3 | `module3-diet-exercise-engine/` | Diet plans, exercise plans, weekly builder |
| 4 | Person 4 | `module4-progress-storage/` | localStorage, task CRUD, charts, admin rendering |

---

## 🔑 Admin Login

- **Email:** `deepshikha@fittrack.com`
- **Password:** `admin123`

---

## 🧩 Module Integration (API Contracts)

Each module exposes a global namespace object:

| Module | Global Object | Key Methods |
|--------|--------------|-------------|
| 1 | `FT_UI` | `obNext()`, `obPrev()`, `togglePref()`, `filterVids()`, `openVideo()` |
| 2 | `FT_Auth`, `FT_Health` | `doLogin()`, `doSignup()`, `calcBMI()`, `calcBMR()`, `calcStreak()` |
| 3 | `FT_RecommendationEngine` | `renderDietCard()`, `renderExerciseCard()`, `buildWeeklyPlan()` |
| 4 | `FT_Storage`, `FT_Dash`, `FT_Admin` | `addTask()`, `toggleTask()`, `populateDash()`, `renderAdminUsers()` |

Shared utilities: `FT_Utils.setText()`, `FT_Utils.esc()`, `FT_toast(msg, type)`

---

## 📦 Git Workflow

```bash
# Each person works in their own module folder
git checkout -b feature/module1-ui
# ... make changes in module1-ui-frontend/ ...
git add module1-ui-frontend/
git commit -m "feat(ui): add responsive sidebar"
git push origin feature/module1-ui
# Then open a PR to main
```

> ⚠️ **Rule:** Only edit files in YOUR module folder. Changes to `shared/` and `index.html` require team discussion.

---

## 🔧 JS Load Order (important!)

```html
shared/constants.js               <!-- 1st: defines FITTRACK global -->
module4-progress-storage/storage.js  <!-- 2nd: toast + storage needed by all -->
module2-health-logic/health.js    <!-- 3rd: health calcs + auth -->
module3-diet-exercise-engine/...  <!-- 4th: recommendations -->
module1-ui-frontend/ui.js         <!-- 5th: UI init (uses everything) -->
```

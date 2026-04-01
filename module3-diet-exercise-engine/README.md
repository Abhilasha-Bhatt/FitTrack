# Module 3 — Diet & Exercise Recommendations Engine

**Owner:** Person 3  
**Files:** `recommendations.js`

## Responsibilities
- Meal plans database (Lose Weight / Build Muscle / General Fitness / Maintain)
- Exercise plans database by level (Beginner / Intermediate / Advanced)
- Supplement suggestions per goal
- Weekly workout plan auto-builder (based on user prefs, level, days/week)
- Diet recommendation card HTML renderer (shown on Overview tab)
- Exercise recommendation card HTML renderer (shown on Overview tab)
- Auto-fill planner tasks from weekly plan after onboarding
- Video recommendation ranking by user preferences
- Task category suggestions by day of week

## Global API Exposed
```js
window.FT_RecommendationEngine = {
  getMealPlan(goal)                 // → { breakfast, lunch, dinner, snacks }
  getExercisePlan(level)            // → { strength, cardio, yoga, hiit }
  buildWeeklyPlan(profile, goal, daysPerWeek)  // → { Mon: [...tasks], Tue: [...] }
  renderDietCard(user)              // → HTML string for diet card
  renderExerciseCard(user)          // → HTML string for exercise card
  autoFillWeeklyPlan(user)          // → mutated user object with tasks filled
  recommendVideos(profile)          // → top 4 video objects
  suggestTaskCategory(profile, day) // → 'workout'|'rest'|'meal'
  getSupplements(goal)              // → string[]
}
```

## Depends On
- `shared/constants.js` (FITTRACK.VIDEOS, FITTRACK.S)
- `FT_Health.calcBMI` (Module 2) — optional, for display
- No direct storage writes — returns data for Module 4 to save

## Adding New Meal Plans
To add a new goal type, add a key to `MEAL_PLANS`:
```js
MEAL_PLANS['New Goal'] = {
  breakfast: [...],
  lunch: [...],
  dinner: [...],
  snacks: [...]
};
```
Then add the matching entry to `SUPPLEMENTS` and `EXERCISE_PLANS`.

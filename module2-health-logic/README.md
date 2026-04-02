# Module 2 — Health Calculations & Core Logic

**Owner:** Person 2  
**Files:** `health.js`

## Responsibilities
- BMI calculation (Quetelet Index)
- BMR using Mifflin-St Jeor Equation
- TDEE from BMR × activity multiplier
- Ideal weight range (Devine Formula)
- Macronutrient split by goal
- Water intake recommendation
- Calorie burn estimation per task
- Streak calculation from login date array
- Sign up / login / logout auth logic
- Onboarding data collection & profile save
- Calls Module 3's `buildWeeklyPlan` after profile save

## Global API Exposed
```js
window.FT_Health = {
  calcBMI(weightKg, heightCm)       // → {value, category, color}
  calcBMR(weight, height, age, gender)
  calcTDEE(bmr, activity)
  calcMacros(tdee, goal)            // → {protein, carbs, fat} grams
  recommendWater(weightKg, activity)
  calcStreak(dates[])               // → number
  estimateCalBurn(category, duration)
  idealWeightRange(heightCm, gender)
}

window.FT_Auth = {
  doSignup()       // reads form, creates user, goes to onboarding
  doLogin()        // reads form, logs in user or admin
  doLogout()       // clears session
  showView(v)      // switches auth form between signup/login
  finishOnboard()  // collects onboarding form, saves profile, launches dash
}

window.FT_Utils = {
  setText(id, v)   // safe DOM text setter
  todayStr()       // ISO date string for today
  esc(s)           // HTML escape
}
```

## Depends On
- `shared/constants.js` (FITTRACK.ADMIN, FITTRACK.S)
- `FT_Storage.getUsers/saveUsers/getUser/updateUser` (Module 4)
- `FT_toast` (Module 4)
- `FT_Dash.launch` and `FT_Admin.launch` (Module 4)
- `FT_Onboard.reset` (Module 1)
- `FT_RecommendationEngine.autoFillWeeklyPlan` (Module 3)

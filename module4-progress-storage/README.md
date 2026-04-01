# Module 4 — Progress Tracking & Data Storage

**Owner:** Person 4  
**Files:** `storage.js`

## Responsibilities
- All localStorage read/write (`ft_users` key)
- User CRUD: getUsers, saveUsers, getUser, updateUser, deleteUserById
- Task CRUD: addTask, toggleTask, deleteTask, clearDay
- Streak update on task completion
- Toast notification system (`FT_toast`)
- Sidebar + badge counter updates
- Dashboard overview stats population (`populateDash`)
- Weekly bar chart rendering (`buildBarChart`)
- Login activity calendar heatmap (`buildCalendar`)
- Day tabs for planner (`buildDayTabs`)
- Task list rendering (`renderTasks`)
- Tab switching (`switchTab`)
- Dashboard launch (`launchDash`)
- Admin launch (`launchAdmin`)
- Admin: users table rendering (`renderAdminUsers`)
- Admin: user status toggle (suspend/activate)
- Admin: user detail slide panel (`viewUser`, `closeUserDetail`)
- Admin: progress cards (`renderProgress`)
- Admin: streak/activity leaderboard (`renderActivity`)
- Admin: tab switching (`switchAdminTab`)

## Global API Exposed
```js
window.FT_Storage = {
  // Data
  getUsers(), saveUsers(u), getUser(id), updateUser(u), deleteUserById(id),
  // Tasks
  addTask(), toggleTask(id), deleteTask(id), clearDay(),
  // Render
  renderTasks(), buildDayTabs(), updateBadge(),
  populateDash(), buildBarChart(), buildCalendar(),
  // Navigation
  launchDash(), switchTab(tab),
  // Admin
  launchAdmin(), switchAdminTab(tab),
  renderAdminUsers(), toggleUserStatus(id), viewUser(id), closeUserDetail(),
  renderProgress(), renderActivity()
}

window.FT_Dash  = { launch: launchDash }
window.FT_Admin = { launch: launchAdmin }
window.FT_toast = function(msg, type) // 's'=success, 'e'=error, 'i'=info
```

## localStorage Schema
```js
// Key: 'ft_users'  Value: JSON array of user objects
{
  id: 'u_1234567890',
  name: 'Alex Johnson',
  email: 'alex@example.com',
  password: 'mypassword',
  goal: 'Lose Weight',
  since: 'Jan 2025',
  profile: {
    height: '175', weight: '72', tweight: '65',
    age: '28', gender: 'Male', activity: 'Moderately Active',
    meds: 'None', conditions: 'None', diet: 'Vegetarian',
    water: '8', prefs: ['yoga','hiit'], time: 'morning',
    days: '4', level: 'Intermediate', duration: '45 min',
    bmi: '23.5', bmr: 1780, tdee: 2759,
    macros: { protein: 241, carbs: 345, fat: 92 }
  },
  tasks: {
    Mon: [{ id: 1234, text: '...', cat: 'workout', time: '07:00', dur: '45 min', note: '', done: false }],
    Tue: [...], ...
  },
  loginDates: ['2025-01-01', '2025-01-02'],
  streak: 2,
  totalLogins: 3,
  tasksDone: 12,
  lastActive: '2025-01-02',
  active: true
}
```

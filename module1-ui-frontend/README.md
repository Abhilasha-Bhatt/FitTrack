# Module 1 — UI/UX & Frontend Structure

**Owner:** Person 1  
**Files:** `styles.css`, `ui.js`

## Responsibilities
- All CSS: page layouts, component styles, animations, responsiveness
- Onboarding wizard step navigation (next/prev/progress bar)
- Preference card toggles & slot selection
- Video grid rendering & filter buttons
- Video modal open/close
- Tab switcher initialization
- Page-level init (greeting text, date display)

## Global API Exposed
```js
window.FT_UI = {
  obNext(), obPrev(), reset()       // Onboarding steps
  toggleMed(v)                      // Medical toggle
  togglePref(el)                    // Exercise preference cards
  selectSlot(el, type)              // Time/day/level slots
  buildVideoGrid(filter)            // Render video cards
  filterVids(el)                    // Filter button handler
  openVideo(id, title, sub)         // Open YouTube modal
  closeVideo()                      // Close modal
}
window.FT_Onboard = { reset }
```

## Depends On
- `shared/styles.css` (design tokens)
- `shared/constants.js` (FITTRACK.VIDEOS, FITTRACK.S)
- `FT_Utils.setText`, `FT_Utils.esc` (from Module 4)
- `FT_Auth.finishOnboard` (from Module 2)

## What NOT to edit
- Do not touch `module2-health-logic/`, `module3-*/`, `module4-*/`
- Do not store data to localStorage (that's Module 4's job)
- Do not run health calculations (that's Module 2's job)

---
name: Technical Debt
about: Refactor, clean-up, or restructure existing code
title: "[TECH DEBT] - Refactor habit tracker logic"
labels: refactor, P3 - Medium
assignees: ''
---

###  What part of the code needs cleanup or improvement?
The `HabitTracker.js` component in the frontend has too many responsibilities. It handles UI, logic, and data fetching all in one file (around 250+ lines).

###  Suggestions
Split the component into:
- A presentational component (`HabitTrackerUI.js`)
- A logic handler (possibly using custom hooks like `useHabits`)
- A separate fetch function

###  Impact
Improves maintainability, reusability, and easier testing in future updates. No changes to actual user experience.

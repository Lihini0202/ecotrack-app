---
name: Bug Report
about: Report something that isn't working right
title: "[BUG] - Goal tracker not saving progress"
labels: bug, P2 - High
assignees: ''
---

### Describe the bug
When I mark an eco-friendly activity as "done" on the goal tracker, it shows a success message, but the status is not saved in the database. When I reopen the app, it's unchecked again.

### Expected behavior
When a goal is marked as complete, it should be saved to the database and remain checked even after the app is restarted.

### Steps to reproduce the behavior
1. Open the EcoTrack app
2. Go to the "Activity Goal Tracker"
3. Mark "Turned off lights today" as complete
4. Restart the app
5. The goal is not saved — it resets to incomplete

### Environment
- Device/OS: Samsung Galaxy A52 / Android 13
- App Version: v1.0.1

## 📄 Description

Added the "Daily Activity Goal Tracker" screen to the React Native frontend.  
Users can now mark eco-friendly actions (like switching off lights, eating local food) as complete for the day.  
This feature syncs with the backend and updates the user's activity stats in MongoDB.

## ✅ Checklist

- [x] Code is fully tested (manual testing done on Android)
- [x] No breaking changes introduced
- [x] Follows Conventional Commit format (`feat: add goal tracker screen`)
- [x] Linting and formatting checks passed
- [x] Linked related issues (#12)
- [x] Added screenshots of UI

## 🔗 Related Issues
Fixes #12

## 🧪 How to Test

1. Run the backend server (`npm start` in `/backend`)
2. Run the frontend in Expo (`npm start` in `/frontend`)
3. Go to "Goal Tracker" screen
4. Tap on an activity to mark it complete
5. Restart the app and confirm it remembers completed goals

## 📝 Notes

- Used AsyncStorage for temporary local caching
- Backend syncing happens every 10 minutes
- Feature works on both Android & iOS (tested on emulators)

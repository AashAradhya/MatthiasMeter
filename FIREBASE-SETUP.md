# MatthiasMeter - Firebase Setup Guide

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add project" or use an existing project
3. Follow the setup wizard (you can disable Google Analytics if you want)

## Step 2: Enable Realtime Database

1. In your Firebase project, click on "Realtime Database" in the left menu
2. Click "Create Database"
3. Choose a location (use default)
4. Start in **test mode** for now (we'll set rules next)

## Step 3: Set Database Rules

1. Go to the "Rules" tab in Realtime Database
2. Replace the rules with:
```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```
3. Click "Publish"

⚠️ **Note:** These rules allow anyone to read/write. For production, you should add authentication and more restrictive rules.

## Step 4: Get Your Firebase Config

1. Click the gear icon (⚙️) next to "Project Overview"
2. Select "Project settings"
3. Scroll down to "Your apps" section
4. Click the "</>" (Web) icon to add a web app
5. Give it a name (e.g., "MatthiasMeter")
6. Copy the `firebaseConfig` object

## Step 5: Add Config to HTML File

1. Open `matthiasmeter-firebase.html` in a text editor
2. Find the section that says:
```javascript
// PASTE YOUR FIREBASE CONFIG HERE
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    ...
};
```
3. Replace it with your actual config from Firebase
4. Save the file

## Step 6: Deploy

### Option A: Netlify Drop (Easiest)
1. Go to https://app.netlify.com/drop
2. Drag and drop `matthiasmeter-firebase.html`
3. Share the URL with your team!

### Option B: GitHub Pages
1. Create a new GitHub repository
2. Upload `matthiasmeter-firebase.html` as `index.html`
3. Enable GitHub Pages in repository settings

### Option C: Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
# Copy matthiasmeter-firebase.html to public/index.html
firebase deploy
```

## Features

✅ **Centralized Data** - Everyone's charges stored in Firebase
✅ **Real-time Updates** - Changes appear instantly for all users
✅ **Team Dashboard** - See what Matthias owes everyone
✅ **Historical Data** - All data persists permanently
✅ **Multi-device** - Access from anywhere

## Troubleshooting

**"Firebase initialization error"**
- Check that your config is correct
- Make sure Realtime Database is enabled
- Verify the database URL in your config

**"Failed to add charge"**
- Check database rules allow writing
- Check browser console for errors

**Data not syncing**
- Refresh the page
- Check internet connection
- Verify Firebase console shows the data

## Security (Optional)

For better security, you can add Firebase Authentication and update rules:

```json
{
  "rules": {
    "users": {
      ".read": true,
      ".write": true
    },
    "charges": {
      "$userId": {
        ".read": true,
        ".write": true
      }
    }
  }
}
```

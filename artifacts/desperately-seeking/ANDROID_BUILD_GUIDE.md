# Android Build Guide — Desperately Seeking

This guide walks you through building the Android app and submitting it to the Google Play Store.

## Prerequisites (install on your local computer)

1. **Node.js** (v18+) — https://nodejs.org
2. **pnpm** — run `npm install -g pnpm` in your terminal
3. **Android Studio** — https://developer.android.com/studio (free)
   - During install, make sure "Android SDK" and "Android Virtual Device" are checked
4. **Java JDK 17+** — usually bundled with Android Studio

---

## Step 1 — Download this project

Download or clone this project to your computer.

---

## Step 2 — Install dependencies

Open your terminal in the project root folder and run:

```bash
pnpm install
```

---

## Step 3 — Set up Android project (first time only)

Navigate to the web app folder:

```bash
cd artifacts/desperately-seeking
pnpm run android:init
```

This creates an `android/` folder containing the native Android project.

---

## Step 4 — Build and sync

Every time you want to update the Android app with new changes, run:

```bash
cd artifacts/desperately-seeking
pnpm run android:sync
```

This builds the web app and copies it into the Android project.

---

## Step 5 — Open in Android Studio

```bash
pnpm run android:open
```

Android Studio will open with the project.

---

## Step 6 — Configure app signing (required for Play Store)

In Android Studio:

1. Go to **Build → Generate Signed Bundle / APK**
2. Choose **Android App Bundle (.aab)** — Play Store requires this format
3. Click **Create new keystore** if you don't have one
   - Save this keystore file somewhere safe — you'll need it for every future update
   - Fill in key alias, passwords, and your details
4. Choose **release** build variant
5. Click **Finish** — the `.aab` file will be generated

---

## Step 7 — Add app icon

In Android Studio, right-click `app/src/main/res` → **New → Image Asset**
- Upload the Desperately Seeking logo
- Android Studio will generate all the required icon sizes automatically

---

## Step 8 — Upload to Google Play Console

1. Go to https://play.google.com/console and sign in (pay the $25 fee if you haven't)
2. Click **Create app**
3. Fill in:
   - App name: **Desperately Seeking**
   - Default language: English
   - App or game: **App**
   - Free or paid: **Free**
4. Go to **Production → Create new release**
5. Upload your `.aab` file
6. Add release notes (what's new)
7. Submit for review

---

## Store Listing Requirements

Before submitting, you'll need to prepare in Play Console:

- **Short description** (80 chars): "Post what you need. Help comes to you."
- **Full description** (4000 chars): Describe the marketplace
- **Screenshots**: At least 2 phone screenshots (take them from the app)
- **Feature graphic**: 1024×500 px banner image
- **App icon**: 512×512 px PNG (high-res)
- **Privacy policy URL**: Required — host a simple privacy policy page

---

## App Details

- **App ID**: `com.desperatelyseeking.app`
- **App Name**: Desperately Seeking
- **Category**: Shopping or Marketplace
- **Content Rating**: Everyone

---

## Tips

- Google Play review typically takes **a few hours to 1 day**
- Always keep your keystore file backed up — losing it means you can't update the app
- Test on a real Android device or emulator before submitting
- Make sure the backend API is deployed (Replit deployment) before submitting, since the app talks to your server

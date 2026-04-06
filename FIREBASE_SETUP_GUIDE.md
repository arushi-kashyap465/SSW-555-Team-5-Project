## 🔥 Firebase Setup Guide (Team Members)

After accepting the Firebase invite, follow these steps to get your local environment working.

---

### ✅ 1. Login to Firebase

Open a terminal and run:

```bash
npm install -g firebase-tools
firebase login
```

Log in using the **same Google account** that was invited to the Firebase project.

---

### ✅ 2. Pull Firebase config into the project

Inside the project root:

```bash
firebase use --add
```

Select the shared project (e.g. `qr-attendance-app`).

---

### ✅ 3. Enable Firestore (if not already done)

Go to Firebase Console → Firestore Database
Click **Create database** (only needed once per project)

---

### ✅ 4. Set up backend credentials (IMPORTANT)

You need a service account key to let your local backend talk to Firebase.

#### Step A — Download key

1. Go to Firebase Console → Project Settings ⚙️
2. Go to **Service Accounts**
3. Click **Generate new private key**
4. Download the JSON file

#### Step B — Store it safely

Move it somewhere **outside the repo**, for example:

```
C:\Users\YourName\.firebase\firebase-key.json
```

🚨 **DO NOT upload this file to GitHub**

---

#### Step C — Set environment variable

**Windows (PowerShell):**

```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\Users\YourName\.firebase\firebase-key.json"
```

**Mac/Linux:**

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/firebase-key.json"
```

---

### ✅ 5. Install dependencies

```bash
npm install
```

---

### ✅ 6. Run the backend

```bash
npm start
```

You should see:

```
Server running at http://localhost:3001
```

---

### ✅ 7. Test Firestore connection

Try registering a user or creating an event.

Then check Firebase Console → Firestore → you should see data appear.

---

## ⚠️ Important Notes

* Never commit `.json` service account keys
* Each team member should use their **own local key**
* If Firestore requests fail → check your env variable

---

## 🚀 You're Ready!

You can now:

* Use the API locally
* Work with Firestore instead of MongoDB
* Test QR flows once deployment is set up

---

# 🗳️ VoteSecure — CMP 300 Level Online Voting System

> A fully offline, single-file, anonymous digital voting system built for the 300 Level Computer Science students of a Nigerian university. No backend. No database. No installation required.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Project Structure](#project-structure)
- [How to Run](#how-to-run)
- [Default Configuration](#default-configuration)
- [System Pages](#system-pages)
- [How Voting Works](#how-voting-works)
- [Admin Guide](#admin-guide)
- [Matric Number Format](#matric-number-format)
- [Security & Anonymity](#security--anonymity)
- [Customisation Guide](#customisation-guide)
- [Known Limitations](#known-limitations)
- [Credits](#credits)

---

## Overview

**VoteSecure** is a browser-based electronic voting system designed for the **CMP 300 Level Course Representative election**. It runs entirely in a single `.html` file — no server, no internet connection, and no installation needed. Simply open the file in any modern browser and voting begins.

The system simulates a secure, anonymous election with:
- Student registration (sign up)
- Authenticated login via Matriculation Number
- One-person-one-vote enforcement
- Anonymous vote recording with receipt IDs
- A live admin dashboard for the Course Representative

---

## Features

| Feature | Details |
|---|---|
| 🔐 Anonymous Voting | Student identity is never linked to their vote |
| 📝 Student Registration | Sign-up with name, matric number, and email |
| 🎓 Matric Validation | Accepts only valid FT23CMP0001 – FT23CMP0500 format |
| 🗳️ Candidate Cards | Expandable manifesto per candidate |
| ✅ Vote Receipt | Every vote generates a unique transaction receipt ID |
| 🛡️ Admin Dashboard | Password-protected panel for the Course Rep |
| 📊 Live Statistics | Turnout %, vote distribution chart, anonymous vote log |
| 🏁 Election Control | Admin can open/close voting and declare a winner |
| 📄 Results Export | Download results as a `.txt` report |
| 📱 Responsive Design | Works on mobile and desktop browsers |
| 🌙 Dark Mode UI | Sleek dark theme with teal/blue accent palette |

---

## Project Structure

```
votesecure_project/
│
├── README.md                        ← You are here
│
├── src/
│   ├── votesecure_cmp300.html       ← Main application (single-file, open this to run)
│   ├── database.js                  ← In-memory data model & DB logic (extracted)
│   ├── components.js                ← Reusable UI helper functions (extracted)
│   ├── landing.js                   ← Landing page builder (extracted)
│   ├── voter.js                     ← Voter portal builder (extracted)
│   ├── admin.js                     ← Admin dashboard builder (extracted)
│   └── styles.css                   ← All CSS styles (extracted)
│
└── docs/
    ├── USER_GUIDE.md                ← Step-by-step guide for students
    └── ADMIN_GUIDE.md               ← Step-by-step guide for the Course Rep
```

> **Note:** The files inside `src/` other than `votesecure_cmp300.html` are **extracted source modules** for study, editing, and version control purposes. The actual running application is the single `.html` file.

---

## How to Run

### Option 1 — Direct Open (Simplest)
1. Locate `src/votesecure_cmp300.html`
2. Double-click it OR right-click → "Open with" → your browser (Chrome, Firefox, Edge)
3. The system launches immediately

### Option 2 — Local Server (Recommended for dev)
```bash
# Using Python (Python 3)
cd votesecure_project/src
python -m http.server 8080

# Then open in browser:
# http://localhost:8080/votesecure_cmp300.html
```

### Option 3 — VS Code Live Server
1. Install the **Live Server** extension in VS Code
2. Right-click `votesecure_cmp300.html` → "Open with Live Server"

---

## Default Configuration

| Setting | Value |
|---|---|
| Admin Password | `Madaki123` |
| Matric Range | `FT23CMP0001` – `FT23CMP0500` |
| Total Students | `500` |
| Election Status (default) | `open` (live) |

### Default Candidates

| # | Name | Avatar | Colour |
|---|------|--------|--------|
| 1 | Endurance SANTU Akumifi | EA | Green `#1a6b4a` |
| 2 | Muhammad Yusuf Madaki | MM | Blue `#1a3d6b` |
| 3 | Aisha Yahuza | AY | Purple `#6b1a4a` |

---

## System Pages

### 1. Landing Page
The entry point. Shows three navigation cards:
- **📝 Create Account** — goes to Sign Up
- **🔐 Student Login** — goes to Login
- **🛡️ Course Rep Dashboard** — goes to Admin login

### 2. Sign Up Page
New students register with:
- Full Name (first + last required)
- Matriculation Number (validated against FT23CMP0001–FT23CMP0500)
- University Email Address

Progress bars show completion per field in real time. After success, the student is auto-redirected to Login.

### 3. Login Page
Returning students enter their Matric Number to access the ballot. No password needed — the matric number is the authenticator.

### 4. Voter Portal
- Shows all candidates with avatar, position, and a short manifesto preview
- "Read full manifesto" expands the card
- Clicking a card selects it (highlighted with teal border + check mark)
- "Submit My Vote" opens a confirmation modal
- After confirming, a **Receipt ID** (e.g. `TXN-AB1C2D-XYZ`) is displayed

### 5. Admin Dashboard
Three tabs:
- **📊 Overview** — stats cards, turnout bar, live vote distribution
- **👥 Candidates** — add, edit, or remove candidates
- **📡 Live Monitor** — real-time gauges and anonymous vote log

---

## How Voting Works

```
Student signs up
      ↓
Student logs in with Matric No
      ↓
Student selects a candidate
      ↓
Confirmation modal shown
      ↓
Vote recorded in DB.votes[] as { receiptId, candidateId, timestamp }
      ↓
DB.users[matric].hasVoted = true   ← Prevents re-voting
      ↓
Candidate vote count incremented
      ↓
Receipt ID shown to student
      ↓
Student's identity is NEVER stored alongside candidateId
```

### Anonymity Guarantee
The vote log stores only `receiptId`, `candidateId`, and `timestamp`. The student's name, email, and matric number are stored in `DB.users` — but their `hasVoted` flag only proves _that_ they voted, not _who they voted for_.

---

## Admin Guide

1. Go to the landing page
2. Click **🛡️ Course Rep Dashboard**
3. Enter password: `Madaki123`
4. You are now in the Admin Dashboard

### Managing the Election
| Action | How |
|---|---|
| Close voting | Click **🔒 Close Voting** in the sidebar |
| Re-open voting | Click **🔓 Open Voting** in the sidebar |
| End election & declare winner | Click **🏁 End Election** on the Overview tab |
| View results | Click **🏆 View Results** (available after closing) |
| Download results | In the Results modal, click **📄 Download Results Report** |

### Managing Candidates
1. Go to the **👥 Candidates** tab
2. Use **+ Add Candidate** to add a new one
3. Use **✏️ Edit** to update name or manifesto
4. Use **🗑️ Remove** to delete a candidate

---

## Matric Number Format

```
FT23CMP0001
│  │  │  └─── 4-digit sequence (0001 to 0500)
│  │  └─────── Department code: CMP (Computer Science)
│  └────────── Year of entry: 23 (2023)
└───────────── Faculty prefix: FT
```

**Valid examples:**
- `FT23CMP0001` ✅
- `FT23CMP0250` ✅
- `FT23CMP0500` ✅

**Invalid examples:**
- `FT23CMP0501` ❌ (out of range)
- `FT23CMP001`  ❌ (old 3-digit format)
- `FT22CMP0001` ❌ (wrong year)

---

## Security & Anonymity

| Concern | How VoteSecure handles it |
|---|---|
| Double voting | `hasVoted` flag on user; checked atomically before recording |
| Vote-to-identity linking | Receipt ID only links to candidateId, never to student |
| Admin manipulation | Admin can see totals but not who voted for whom |
| Ballot stuffing | Only registered matric numbers (FT23CMP0001–0500) can vote |
| Input injection | All inputs run through `sanitize()` stripping `< > " ' &` |

> ⚠️ **Important:** This system uses **in-memory storage**. All data resets when the browser tab is closed or refreshed. For a production deployment, integrate with Firebase Firestore or a Node.js + PostgreSQL backend.

---

## Customisation Guide

All configurable values are at the top of the `<script>` block in `votesecure_cmp300.html`:

```javascript
// ── CHANGE THESE TO CUSTOMISE ──────────────────────────────────────────────

const ADMIN_PW  = "Madaki123";          // Change admin password here
const MATRIC_RE = /^FT23CMP(0[0-4]\d{2}|0500)$/;  // Matric regex pattern

const DB = {
  election: {
    status: "open",          // "open" | "closed" | "pending"
    totalStudents: 500,      // Total eligible voters
    totalVotes: 0,
  },
  candidates: [
    {
      id: "c1",
      name: "Endurance SANTU Akumifi",
      position: "Course Representative",
      manifesto: "...",
      avatar: "EA",          // 2-letter initials shown in avatar circle
      color: "#1a6b4a",      // Avatar background accent colour
      votes: 0,
    },
    // Add more candidates here...
  ],
};
```

### Change the accent colour (teal → something else)
In the `<style>` block, find:
```css
:root {
  --ac: #00d4a8;   /* ← Change this value */
}
```

---

## Known Limitations

1. **No persistence** — data is lost on page refresh. To persist data, replace `DB` with `localStorage` or a real database.
2. **No real authentication** — anyone with a valid matric number format can register. Add OTP or email verification for production.
3. **Single-device admin** — admin and student portals share the same JS memory. In production, separate admin and student interfaces.
4. **No network sync** — votes cast on different devices/browsers are not shared. The system is designed for a single shared device or a server deployment.

---

## Credits

- **Developed for:** CMP 300 Level — Computer Science Department
- **UI Framework:** Vanilla JavaScript (no frameworks)
- **Fonts:** [Sora](https://fonts.google.com/specimen/Sora) + [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono) via Google Fonts
- **Icons:** Native Unicode emoji
- **Design System:** Custom dark theme with CSS variables

---

*Last updated: June 2026 | VoteSecure v1.2*

# 🛡️ VoteSecure — Admin (Course Rep) Guide

> Complete guide for managing the CMP 300 Level election

---

## Accessing the Admin Dashboard

1. Open `votesecure_cmp300.html` in your browser
2. Click **🛡️ Course Rep Dashboard** on the landing page
3. Enter the admin password: **`Madaki123`**
4. Press **Enter** or click **🔓 Enter Dashboard**

---

## Dashboard Overview

The dashboard has three tabs in the left sidebar:

| Tab | Purpose |
|---|---|
| 📊 Overview | Election stats, turnout, vote distribution |
| 👥 Candidates | Add, edit, or remove candidates |
| 📡 Live Monitor | Real-time vote log (anonymous) |

---

## Managing the Election

### Open / Close Voting

In the **sidebar**, find the election status panel at the bottom:

- **🔒 Close Voting** — immediately stops new votes from being cast
- **🔓 Open Voting** — re-opens voting if you closed it accidentally

The status updates live for all users viewing the system.

---

### End the Election & Declare a Winner

1. Go to the **📊 Overview** tab
2. Click **🏁 End Election** (top-right corner)
3. A confirmation dialog will show current turnout data
4. Click **🏁 End & Declare Winner** to permanently close and display results

> ⚠️ This cannot be reversed. Make sure all votes are in before ending.

---

### View Results

- After closing, click **🏆 View Results** on the Overview tab
- The Results modal shows:
  - 🥇 Winner with vote count and percentage
  - Full ranked leaderboard (🥇🥈🥉)
  - Turnout summary
- Click **📄 Download Results Report** to save a `.txt` file

---

## Managing Candidates

Go to the **👥 Candidates** tab.

### Add a Candidate

1. Click **+ Add Candidate**
2. Enter the candidate's **Full Name**
3. Enter their **Manifesto** (campaign statement)
4. Click **Add Candidate** — they appear instantly

### Edit a Candidate

1. Find the candidate in the list
2. Click **✏️ Edit**
3. Update the name and/or manifesto
4. Click **Save Changes**

### Remove a Candidate

1. Find the candidate in the list
2. Click **🗑️ Remove**
3. They are immediately removed from the ballot

> ⚠️ Removing a candidate after votes have been cast will not affect recorded votes, but their count will no longer appear in results.

---

## Live Monitoring

Go to the **📡 Live Monitor** tab to see:

- **Votes Cast** — total count with animated glow
- **Turnout Rate** — percentage of eligible students who voted
- **Participation Gauge** — visual progress bar
- **Anonymous Vote Log** — every receipt ID in reverse chronological order

> 🔒 The vote log shows only receipt IDs and timestamps — never student names or matric numbers.

---

## Default Configuration Reference

| Setting | Value |
|---|---|
| Admin Password | `Madaki123` |
| Total Eligible Students | `500` |
| Matric Range | `FT23CMP0001` – `FT23CMP0500` |

### Default Candidates

| # | Name |
|---|------|
| 1 | Endurance SANTU Akumifi |
| 2 | Muhammad Yusuf Madaki |
| 3 | Aisha Yahuza |

---

## Changing the Admin Password

Open `votesecure_cmp300.html` in a text editor (e.g. VS Code, Notepad++).

Find this line near the top of the `<script>` section:

```javascript
const ADMIN_PW = "Madaki123";
```

Change `"Madaki123"` to your new password. Save the file.

---

## Troubleshooting

**Q: A student says they can't register — "Matric No already registered".**  
A: Their matric number is already in the system. Direct them to the Login page.

**Q: A student voted but the count didn't go up.**  
A: Refresh the page and check the Live Monitor. In-memory data is shared within the same browser tab session only.

**Q: I accidentally closed voting during the election.**  
A: Click **🔓 Open Voting** in the sidebar to re-open it.

**Q: Can I reset all votes and start over?**  
A: Yes, but only by refreshing the browser page — this clears ALL in-memory data (registrations, votes, everything). Use this carefully.

---

*VoteSecure v1.2 — CMP 300 Level, June 2026*

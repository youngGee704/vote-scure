/**
 * database.js — VoteSecure CMP 300
 * ─────────────────────────────────────────────────────────────────────────────
 * In-memory database that simulates Firebase / a real backend.
 * All data lives in the DB object and resets when the page reloads.
 *
 * To add persistence, replace the DB object reads/writes with:
 *   - localStorage (simple, single-device)
 *   - Firebase Firestore (real-time, multi-device)
 *   - A REST API (Node.js + PostgreSQL / MongoDB)
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ── IN-MEMORY DATABASE ────────────────────────────────────────────────────────
const DB = {

  /**
   * Election meta-data
   * status: "open" | "closed" | "pending"
   */
  election: {
    status: "open",
    totalStudents: 500,
    totalVotes: 0,
  },

  /**
   * Registered users
   * Key: matricNo (string)
   * Value: { name, matric, email, hasVoted, receiptId? }
   *
   * Example:
   *   "FT23CMP0042": {
   *     name: "John Emeka Doe",
   *     matric: "FT23CMP0042",
   *     email: "jdoe@university.edu.ng",
   *     hasVoted: false,
   *     receiptId: null
   *   }
   */
  users: {},

  /**
   * Candidates list
   * Each candidate object:
   *   id       — unique string ("c1", "c2", …)
   *   name     — full display name
   *   position — always "Course Representative" for this election
   *   manifesto — full campaign text
   *   avatar   — 2-letter initials shown in the circular avatar
   *   color    — hex accent colour for avatar background
   *   votes    — vote count (integer, starts at 0)
   */
  candidates: [
    {
      id: "c1",
      name: "Endurance SANTU Akumifi",
      position: "Course Representative",
      manifesto:
        "I will bridge the gap between students and lecturers by creating a weekly open-door session. " +
        "My focus is on early exam timetables, better lab access, and a student welfare fund for those " +
        "struggling with fees. Vote Endurance for a stronger, more united CMP 300 level.",
      avatar: "EA",
      color: "#1a6b4a",
      votes: 0,
    },
    {
      id: "c2",
      name: "Muhammad Yusuf Madaki",
      position: "Course Representative",
      manifesto:
        "Three priorities: transparent communication, a digital notice board for all class updates, " +
        "and negotiating with faculty for grace periods during personal emergencies. " +
        "Your voice deserves to be heard. Together we rise — vote Madaki.",
      avatar: "MM",
      color: "#1a3d6b",
      votes: 0,
    },
    {
      id: "c3",
      name: "Aisha Yahuza",
      position: "Course Representative",
      manifesto:
        "I bring dedication and a student-first vision. I'll establish a mentorship program pairing " +
        "finalists with 100-level students, fight for better facilities, and publish monthly rep " +
        "reports to the class. Aisha Yahuza — your voice, your future.",
      avatar: "AY",
      color: "#6b1a4a",
      votes: 0,
    },
  ],

  /**
   * Anonymous vote log
   * Each entry: { receiptId, candidateId, ts }
   *
   * IMPORTANT: studentId / matricNo is intentionally NEVER stored here.
   * This is the core of the anonymity guarantee.
   * The only way to prove a vote was cast is the receiptId.
   */
  votes: [],
};

// ── CONSTANTS ─────────────────────────────────────────────────────────────────

/** Admin password — change this before deployment */
const ADMIN_PW = "Madaki123";

/**
 * Matric number regex
 * Valid range: FT23CMP0001 – FT23CMP0500
 *
 * Breakdown:
 *   ^FT23CMP       — fixed prefix (Faculty + Year + Dept)
 *   (0[0-4]\d{2}   — 0000–0499
 *   |0500)$        — OR exactly 0500
 */
const MATRIC_RE = /^FT23CMP(0[0-4]\d{2}|0500)$/;

/** Standard email validation regex */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Candidate avatar colour palette (cycles when more candidates added) */
const COLORS = [
  "#1a6b4a", // green
  "#1a3d6b", // blue
  "#6b1a4a", // purple
  "#6b4a1a", // brown
  "#3d6b1a", // olive
  "#1a5d6b", // teal
];

// ── UTILITY FUNCTIONS ─────────────────────────────────────────────────────────

/**
 * Strips potentially dangerous HTML characters from user input.
 * Prevents XSS injection in displayed fields.
 * @param {string} s — raw input string
 * @returns {string} — sanitized string
 */
const sanitize = (s) => String(s).replace(/[<>"'&]/g, "");

/**
 * Generates a unique voting receipt ID.
 * Format: TXN-XXXXXX-YYYYYY (alphanumeric, uppercase)
 * @returns {string}
 */
const mkRcpt = () =>
  "TXN-" +
  Math.random().toString(36).slice(2, 8).toUpperCase() +
  "-" +
  Date.now().toString(36).toUpperCase();

/**
 * Extracts up to 2 uppercase initials from a full name.
 * "John Emeka Doe" → "JE"
 * @param {string} n — full name
 * @returns {string}
 */
const initials = (n) =>
  n
    .trim()
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

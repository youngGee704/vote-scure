/**
 * components.js — VoteSecure CMP 300
 * ─────────────────────────────────────────────────────────────────────────────
 * Reusable UI building-block functions.
 * These are vanilla-JS DOM factories — no framework, no JSX.
 *
 * All functions return HTMLElement instances that can be appended to any parent.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ── APP STATE ─────────────────────────────────────────────────────────────────

/**
 * Global application state.
 * view:    "landing" | "voter" | "admin"
 * student: null | { id, name, matric, email, hasVoted, receiptId }
 */
let state = { view: "landing", student: null };

/**
 * Re-renders the entire app from scratch.
 * Called whenever state.view changes.
 */
const render = () => {
  document.getElementById("app").innerHTML = "";
  buildApp();
};

// ── LOW-LEVEL DOM HELPERS ────────────────────────────────────────────────────

/**
 * Generic element factory.
 * @param {string} tag        - HTML tag name
 * @param {Object} attrs      - attributes / event handlers / style object
 * @param {Array}  children   - child nodes or text strings
 * @returns {HTMLElement}
 */
const el = (tag, attrs = {}, children = []) => {
  const e = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (k === "style" && typeof v === "object") Object.assign(e.style, v);
    else if (k.startsWith("on")) e.addEventListener(k.slice(2).toLowerCase(), v);
    else e.setAttribute(k, v);
  });
  children.forEach((c) =>
    c != null && e.appendChild(typeof c === "string" ? document.createTextNode(c) : c)
  );
  return e;
};

/**
 * Creates a <div> with optional inline style and children array.
 * @param {Object|null} s  - style object
 * @param {Array|null}  ch - children (HTMLElement | string)
 */
const div = (s, ch) => {
  const d = document.createElement("div");
  if (s) Object.assign(d.style, s);
  if (ch)
    ch.forEach(
      (c) => c != null && d.appendChild(typeof c === "string" ? document.createTextNode(c) : c)
    );
  return d;
};

/** Creates a <p> with text and optional style */
const p = (text, s) => {
  const e = document.createElement("p");
  e.textContent = text;
  if (s) Object.assign(e.style, s);
  return e;
};

/** Creates a heading element <h1>–<h6> */
const h = (n, text, s) => {
  const e = document.createElement("h" + n);
  e.textContent = text;
  if (s) Object.assign(e.style, s);
  return e;
};

/** Creates a <button> */
const btn = (text, s, cb) => {
  const b = document.createElement("button");
  b.textContent = text;
  if (s) Object.assign(b.style, s);
  if (cb) b.onclick = cb;
  return b;
};

/** Creates an <input> */
const inp = (s, attrs = {}) => {
  const i = document.createElement("input");
  if (s) Object.assign(i.style, s);
  Object.entries(attrs).forEach(([k, v]) => {
    if (k === "oninput") i.oninput = v;
    else if (k === "onkeydown") i.onkeydown = v;
    else i.setAttribute(k, v);
  });
  return i;
};

/** Creates a <span> */
const span = (text, s) => {
  const e = document.createElement("span");
  e.textContent = text;
  if (s) Object.assign(e.style, s);
  return e;
};

/** Creates a <code> */
const code = (text, s) => {
  const e = document.createElement("code");
  e.textContent = text;
  if (s) Object.assign(e.style, s);
  return e;
};

// ── REUSABLE UI COMPONENTS ───────────────────────────────────────────────────

/**
 * Animated status dot.
 * Green + pulse animation when on=true, grey when off.
 * @param {boolean} on
 * @returns {HTMLElement}
 */
function Dot(on) {
  return el("span", {
    style: {
      display: "inline-block",
      width: "8px",
      height: "8px",
      borderRadius: "50%",
      background: on ? "var(--ac)" : "var(--t3)",
      animation: on ? "pu 1.5s ease infinite" : "none",
      boxShadow: on ? "0 0 8px var(--ac)" : "none",
    },
  });
}

/**
 * Coloured tag/badge.
 * @param {string} text  - label
 * @param {string} c     - colour key: "ac" | "bl" | "er" | "wn"
 * @returns {HTMLElement}
 */
function Tag(text, c = "ac") {
  const m = {
    ac: "rgba(0,212,168,.1)/color:#00d4a8/rgba(0,212,168,.25)",
    bl: "rgba(0,153,255,.1)/color:#0099ff/rgba(0,153,255,.25)",
    er: "rgba(255,71,87,.1)/color:#ff4757/rgba(255,71,87,.25)",
    wn: "rgba(255,211,42,.1)/color:#ffd32a/rgba(255,211,42,.25)",
  };
  const parts = (m[c] || m.ac).split("/");
  return el(
    "span",
    {
      style: {
        display: "inline-flex",
        alignItems: "center",
        padding: "3px 10px",
        borderRadius: "20px",
        background: parts[0],
        color: parts[1].replace("color:", ""),
        border: `1px solid ${parts[2]}`,
        fontSize: "11px",
        fontWeight: "600",
        letterSpacing: ".05em",
        textTransform: "uppercase",
      },
    },
    [text]
  );
}

/**
 * Styled button with hover lift effect.
 * Variants: "pr" (primary), "se" (secondary), "da" (danger), "su" (success)
 * @param {string}   text
 * @param {string}   variant
 * @param {Function} cb        - click handler
 * @param {boolean}  disabled
 * @returns {HTMLButtonElement}
 */
function Btn(text, variant, cb, disabled = false) {
  const V = {
    pr: "background:linear-gradient(135deg,#00d4a8,#0099ff);color:#000;border:none;box-shadow:0 4px 14px rgba(0,212,168,.3)",
    se: "background:transparent;color:var(--tx);border:1px solid var(--br)",
    da: "background:linear-gradient(135deg,#ff4757,#ff6b35);color:#fff;border:none",
    su: "background:linear-gradient(135deg,#00d4a8,#00b894);color:#000;border:none",
  };
  const style = {
    padding: "12px 22px",
    borderRadius: "var(--rs)",
    fontWeight: "600",
    fontSize: "14px",
    transition: "all .2s",
    letterSpacing: ".02em",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? "0.45" : "1",
  };
  const parts = (V[variant || "pr"] || V.pr)
    .split(";")
    .reduce((o, p) => {
      const [k, ...v] = p.split(":");
      if (k.trim())
        o[k.trim().replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = v.join(":").trim();
      return o;
    }, {});
  Object.assign(style, parts);
  const b = document.createElement("button");
  Object.assign(b.style, style);
  b.textContent = text;
  b.disabled = disabled;
  if (cb) b.onclick = cb;
  b.onmouseenter = () => { if (!disabled) b.style.transform = "translateY(-1px)"; };
  b.onmouseleave = () => { b.style.transform = "translateY(0)"; };
  return b;
}

/**
 * Styled text/email/password input with focus border glow.
 * @param {string}  placeholder
 * @param {string}  type        - input type (default "text")
 * @param {boolean} monospace   - use monospace font (for matric inputs)
 * @returns {HTMLInputElement}
 */
function mkInput(placeholder, type = "text", monospace = false) {
  const i = document.createElement("input");
  i.type = type;
  i.placeholder = placeholder;
  Object.assign(i.style, {
    width: "100%",
    background: "var(--s2)",
    border: "1px solid var(--br)",
    borderRadius: "var(--rs)",
    padding: "12px 14px",
    color: "var(--tx)",
    fontSize: "14px",
    outline: "none",
    transition: "border-color .2s",
    fontFamily: monospace ? "var(--mo)" : "var(--fn)",
    letterSpacing: monospace ? ".06em" : "normal",
  });
  i.onfocus = () => (i.style.borderColor = "var(--ac)");
  i.onblur = () => (i.style.borderColor = "var(--br)");
  return i;
}

/**
 * Red error box with ⚠️ icon.
 * @param {string} msg
 * @returns {HTMLElement}
 */
function errBox(msg) {
  return div(
    {
      display: "flex",
      gap: "8px",
      padding: "11px 14px",
      background: "rgba(255,71,87,.08)",
      border: "1px solid rgba(255,71,87,.2)",
      borderRadius: "var(--rs)",
      color: "var(--er)",
      fontSize: "13px",
      lineHeight: "1.5",
      animation: "fi .2s ease",
    },
    [span("⚠️"), span(msg)]
  );
}

/**
 * Green success box with ✅ icon.
 * @param {string} msg
 * @returns {HTMLElement}
 */
function okBox(msg) {
  return div(
    {
      display: "flex",
      gap: "8px",
      padding: "11px 14px",
      background: "rgba(0,212,168,.08)",
      border: "1px solid rgba(0,212,168,.2)",
      borderRadius: "var(--rs)",
      color: "var(--ac)",
      fontSize: "13px",
      lineHeight: "1.5",
      animation: "fi .2s ease",
    },
    [span("✅"), span(msg)]
  );
}

/**
 * Creates and mounts a modal overlay.
 *
 * @param {string}   title      - modal header text
 * @param {Function} contentFn  - (box: HTMLElement, closeModal: Function) => void
 * @param {Function} onClose    - optional callback when modal closes
 * @returns {HTMLElement}       - the overlay element
 *
 * Usage:
 *   mkModal("Confirm Vote", (box, close) => {
 *     box.appendChild(p("Are you sure?"));
 *     box.appendChild(Btn("Yes", "pr", () => { doVote(); close(); }));
 *   });
 */
function mkModal(title, contentFn, onClose) {
  const overlay = div({
    position: "fixed",
    inset: "0",
    zIndex: "1000",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(0,0,0,.72)",
    backdropFilter: "blur(10px)",
    animation: "fi .2s ease",
    padding: "16px",
  });
  overlay.onclick = () => {
    document.body.removeChild(overlay);
    if (onClose) onClose();
  };

  const box = document.createElement("div");
  box.className = "card";
  Object.assign(box.style, {
    padding: "24px",
    width: "100%",
    maxWidth: "520px",
    maxHeight: "90vh",
    overflowY: "auto",
    animation: "up .3s ease",
    boxShadow: "var(--sl)",
  });
  box.onclick = (e) => e.stopPropagation(); // prevent overlay close on box click

  const header = div(
    { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" },
    [h(3, title, { fontSize: "17px", fontWeight: "700" })]
  );
  const closeBtn = btn(
    "✕",
    { background: "none", border: "none", color: "var(--t3)", fontSize: "20px", cursor: "pointer", lineHeight: "1" },
    () => { document.body.removeChild(overlay); if (onClose) onClose(); }
  );
  header.appendChild(closeBtn);
  box.appendChild(header);

  contentFn(box, () => document.body.contains(overlay) && document.body.removeChild(overlay));
  overlay.appendChild(box);
  document.body.appendChild(overlay);
  return overlay;
}

/**
 * Builds the VoteSecure logo/header block shown on the landing page.
 * Includes the animated status badge (LIVE / CLOSED / PENDING).
 * @returns {HTMLElement}
 */
function makeLogo() {
  const isOpen = DB.election.status === "open";
  const isClosed = DB.election.status === "closed";
  const statusColor = isOpen
    ? "rgba(0,212,168,.08)"
    : isClosed
    ? "rgba(255,71,87,.08)"
    : "rgba(255,211,42,.08)";
  const statusBorder = isOpen
    ? "rgba(0,212,168,.2)"
    : isClosed
    ? "rgba(255,71,87,.2)"
    : "rgba(255,211,42,.2)";
  const statusText = isOpen ? "ELECTION LIVE" : isClosed ? "ELECTION CLOSED" : "ELECTION PENDING";
  const statusTextColor = isOpen ? "var(--ac)" : isClosed ? "var(--er)" : "var(--wn)";

  const wrap = div({ textAlign: "center", marginBottom: "30px" });
  const icon = div(
    {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: "68px",
      height: "68px",
      borderRadius: "20px",
      background: "linear-gradient(135deg,rgba(0,212,168,.18),rgba(0,153,255,.18))",
      border: "1px solid rgba(0,212,168,.3)",
      fontSize: "32px",
      marginBottom: "12px",
      boxShadow: "var(--gl)",
    },
    [span("🗳️")]
  );
  wrap.appendChild(icon);
  wrap.appendChild(h(1, "VoteSecure", { fontSize: "24px", fontWeight: "800", letterSpacing: "-.02em", marginBottom: "4px" }));
  wrap.appendChild(p("300 LEVEL CMP ONLINE VOTING SYSTEM", { color: "var(--t2)", fontSize: "11px", marginBottom: "12px", letterSpacing: ".04em" }));
  const statusBadge = div(
    {
      display: "inline-flex",
      alignItems: "center",
      gap: "7px",
      padding: "5px 14px",
      borderRadius: "20px",
      background: statusColor,
      border: `1px solid ${statusBorder}`,
    },
    [
      Dot(isOpen),
      span(statusText, { fontSize: "11px", fontWeight: "700", letterSpacing: ".06em", color: statusTextColor }),
    ]
  );
  wrap.appendChild(statusBadge);
  return wrap;
}

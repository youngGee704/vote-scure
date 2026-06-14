/**
 * landing.js — VoteSecure CMP 300
 * ─────────────────────────────────────────────────────────────────────────────
 * Builds the Landing Page — the first screen users see.
 *
 * Contains three sub-pages rendered inside the same card wrapper:
 *   1. home    — navigation cards (Sign Up, Login, Admin)
 *   2. signup  — new student registration form
 *   3. login   — returning student login
 *   4. admin   — admin password gate
 *
 * Sub-pages are shown/hidden via window.showPage(name).
 * ─────────────────────────────────────────────────────────────────────────────
 */

function buildLanding() {
  // ── ROOT CONTAINER ──────────────────────────────────────────────────────────
  const root = div({
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    background: "var(--bg)",
    backgroundImage:
      "radial-gradient(ellipse at 20% 50%,rgba(0,212,168,.06) 0%,transparent 55%)," +
      "radial-gradient(ellipse at 80% 15%,rgba(0,153,255,.06) 0%,transparent 55%)",
  });
  const wrap = div({ width: "100%", maxWidth: "450px", animation: "up .5s ease" });
  wrap.appendChild(makeLogo());

  // ════════════════════════════════════════════════════════════════════════════
  // HOME PAGE — three navigation cards
  // ════════════════════════════════════════════════════════════════════════════
  const homeBtns = div({ display: "flex", flexDirection: "column", gap: "11px" });

  [
    { p: "signup", ic: "📝", title: "Create Account",        sub: "New student? Register with your details",       col: "var(--ac)" },
    { p: "login",  ic: "🔐", title: "Student Login",         sub: "Already registered? Log in to vote",            col: "var(--ac)" },
    { p: "admin",  ic: "🛡️", title: "Course Rep Dashboard",  sub: "Admin access — password protected",             col: "var(--bl)" },
  ].forEach((b) => {
    const card = div({
      background: "var(--s1)",
      border: "1px solid var(--br)",
      borderRadius: "var(--rd)",
      padding: "16px 20px",
      display: "flex",
      alignItems: "center",
      gap: "14px",
      cursor: "pointer",
      transition: "all .2s",
    });
    const ico = div({
      width: "46px", height: "46px", borderRadius: "12px", flexShrink: "0",
      background: b.col === "var(--ac)" ? "rgba(0,212,168,.1)" : "rgba(0,153,255,.1)",
      border: `1px solid ${b.col === "var(--ac)" ? "rgba(0,212,168,.2)" : "rgba(0,153,255,.2)"}`,
      display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px",
    }, [span(b.ic)]);
    const txt = div({ flex: "1" });
    txt.appendChild(p(b.title, { fontWeight: "700", fontSize: "15px", color: "var(--tx)", marginBottom: "3px" }));
    txt.appendChild(p(b.sub,   { color: "var(--t2)", fontSize: "12px" }));
    card.appendChild(ico); card.appendChild(txt);
    card.appendChild(span("›", { color: "var(--t3)", fontSize: "22px" }));
    card.onmouseenter = () => { card.style.borderColor = b.col; card.style.background = "var(--s2)"; };
    card.onmouseleave = () => { card.style.borderColor = "var(--br)"; card.style.background = "var(--s1)"; };
    card.onclick = () => showPage(b.p);
    homeBtns.appendChild(card);
  });

  // Security note
  const noteBx = div({ marginTop: "8px", padding: "12px 14px", background: "rgba(0,153,255,.05)", borderRadius: "var(--rs)", border: "1px solid rgba(0,153,255,.12)" });
  noteBx.innerHTML = '<p style="font-size:12px;color:var(--t2);line-height:1.7">🔒 <strong style="color:var(--tx)">Secure &amp; Anonymous</strong> — Your vote is stored in Firebase. Your identity is <em>never</em> linked to your choice.</p>';
  homeBtns.appendChild(noteBx);

  // ════════════════════════════════════════════════════════════════════════════
  // SIGN UP PAGE
  // ════════════════════════════════════════════════════════════════════════════
  const signupPage = div({ display: "none" });
  signupPage.className = "card";
  Object.assign(signupPage.style, { padding: "24px" });

  signupPage.appendChild(btn("← Back", { background: "none", border: "none", color: "var(--t2)", fontSize: "13px", cursor: "pointer", marginBottom: "20px" }, () => showPage("home")));

  const spHdr = div({ marginBottom: "20px" });
  spHdr.appendChild(div({ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "42px", height: "42px", borderRadius: "11px", background: "rgba(0,212,168,.1)", border: "1px solid rgba(0,212,168,.2)", fontSize: "20px", marginBottom: "10px" }, [span("📝")]));
  spHdr.appendChild(h(2, "Create Your Account", { fontSize: "19px", fontWeight: "800", marginBottom: "5px" }));
  spHdr.appendChild(p("Register once with your university details. All fields are required.", { color: "var(--t2)", fontSize: "13px", lineHeight: "1.6" }));
  signupPage.appendChild(spHdr);

  // Progress bars (Name / Matric / Email)
  const progWrap = div({ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginBottom: "20px" });
  const progBars = ["Full Name", "Matric No", "Email"].map((lbl) => {
    const pw = div({});
    const bar = div({ height: "3px", borderRadius: "2px", background: "var(--br)", marginBottom: "4px", transition: "background .3s" });
    const lt  = p(lbl, { fontSize: "10px", color: "var(--t3)", fontWeight: "600", letterSpacing: ".04em", textAlign: "center" });
    pw.appendChild(bar); pw.appendChild(lt); progWrap.appendChild(pw);
    return { bar, lt };
  });
  signupPage.appendChild(progWrap);

  const spForm = div({ display: "flex", flexDirection: "column", gap: "16px" });

  // — Full Name field —
  const nameWrap = div({ display: "flex", flexDirection: "column", gap: "6px" });
  const nameLbl = document.createElement("label"); nameLbl.textContent = "Full Name *";
  Object.assign(nameLbl.style, { fontSize: "13px", fontWeight: "600", color: "var(--t2)", letterSpacing: ".04em" });
  const nameIconWrap = div({ position: "relative" });
  const nameIco  = span("👤", { position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)", fontSize: "14px", pointerEvents: "none" });
  const nameInp  = mkInput("e.g. Chidi Emmanuel Okafor");
  nameInp.style.paddingLeft = "40px";
  nameIconWrap.appendChild(nameIco); nameIconWrap.appendChild(nameInp);
  nameWrap.appendChild(nameLbl); nameWrap.appendChild(nameIconWrap);
  nameWrap.appendChild(p("Enter first and last name as on your university ID", { fontSize: "11px", color: "var(--t3)" }));
  spForm.appendChild(nameWrap);

  nameInp.oninput = () => {
    const v = nameInp.value;
    const ok = v.trim().split(" ").length >= 2 && v.trim().length >= 4;
    progBars[0].bar.style.background = ok && v ? "var(--ac)" : "var(--br)";
    progBars[0].lt.style.color       = ok && v ? "var(--ac)" : "var(--t3)";
    progBars[0].lt.textContent        = "Full Name" + (ok && v ? " ✓" : "");
  };

  // — Matric Number field —
  const matWrap = div({ display: "flex", flexDirection: "column", gap: "6px" });
  const matLbl  = document.createElement("label"); matLbl.textContent = "Matriculation Number *";
  Object.assign(matLbl.style, { fontSize: "13px", fontWeight: "600", color: "var(--t2)", letterSpacing: ".04em" });
  const matIconWrap = div({ position: "relative" });
  const matIco   = span("🎓", { position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)", fontSize: "14px", pointerEvents: "none" });
  const matCheck = span("",   { position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", fontSize: "14px" });
  const matInp   = mkInput("e.g. FT23CMP0042", "text", true);
  matInp.maxLength = 13; matInp.style.paddingLeft = "40px"; matInp.style.paddingRight = "36px";
  matInp.oninput = () => {
    const v  = matInp.value.toUpperCase().replace(/[^A-Z0-9]/g, ""); matInp.value = v;
    const ok = MATRIC_RE.test(v);
    matCheck.textContent = v ? (ok ? "✅" : "❌") : "";
    matInp.style.borderColor = v ? (ok ? "var(--ac)" : "var(--er)") : "var(--br)";
    progBars[1].bar.style.background = ok ? "var(--ac)" : "var(--br)";
    progBars[1].lt.style.color       = ok ? "var(--ac)" : "var(--t3)";
    progBars[1].lt.textContent        = "Matric No" + (ok ? " ✓" : "");
  };
  matIconWrap.appendChild(matIco); matIconWrap.appendChild(matInp); matIconWrap.appendChild(matCheck);
  matWrap.appendChild(matLbl); matWrap.appendChild(matIconWrap);
  matWrap.appendChild(p("Format: FT23CMP0001 – FT23CMP0500 · Auto-converts to uppercase", { fontSize: "11px", color: "var(--t3)" }));
  spForm.appendChild(matWrap);

  // — Email field —
  const emWrap = div({ display: "flex", flexDirection: "column", gap: "6px" });
  const emLbl  = document.createElement("label"); emLbl.textContent = "University Email Address *";
  Object.assign(emLbl.style, { fontSize: "13px", fontWeight: "600", color: "var(--t2)", letterSpacing: ".04em" });
  const emIconWrap = div({ position: "relative" });
  const emIco   = span("✉️", { position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)", fontSize: "14px", pointerEvents: "none" });
  const emCheck = span("",   { position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", fontSize: "14px" });
  const emInp   = mkInput("e.g. ft23cmp042@university.edu.ng", "email");
  emInp.style.paddingLeft = "40px"; emInp.style.paddingRight = "36px";
  emInp.oninput = () => {
    const ok = EMAIL_RE.test(emInp.value);
    emCheck.textContent = emInp.value ? (ok ? "✅" : "❌") : "";
    emInp.style.borderColor = emInp.value ? (ok ? "var(--ac)" : "var(--er)") : "var(--br)";
    progBars[2].bar.style.background = ok ? "var(--ac)" : "var(--br)";
    progBars[2].lt.style.color       = ok ? "var(--ac)" : "var(--t3)";
    progBars[2].lt.textContent        = "Email" + (ok ? " ✓" : "");
  };
  emIconWrap.appendChild(emIco); emIconWrap.appendChild(emInp); emIconWrap.appendChild(emCheck);
  emWrap.appendChild(emLbl); emWrap.appendChild(emIconWrap);
  emWrap.appendChild(p("Use your official university email address", { fontSize: "11px", color: "var(--t3)" }));
  spForm.appendChild(emWrap);

  // Privacy note
  const privNote = div({ padding: "11px 13px", background: "rgba(0,212,168,.05)", borderRadius: "var(--rs)", border: "1px solid rgba(0,212,168,.12)" });
  privNote.innerHTML = '<p style="font-size:12px;color:var(--t2);line-height:1.65">🔐 Your details are stored securely. Your name and email are <strong style="color:var(--tx)">never</strong> linked to your vote — anonymity enforced at database level.</p>';
  spForm.appendChild(privNote);

  const spErr = div({ display: "none" }); spForm.appendChild(spErr);
  const spOk  = div({ display: "none" }); spForm.appendChild(spOk);

  // Submit handler
  const spSubmitBtn = Btn("✅  Create My Account", "pr", () => {
    const nm  = sanitize(nameInp.value.trim());
    const mat = sanitize(matInp.value.trim().toUpperCase());
    const em  = sanitize(emInp.value.trim().toLowerCase());
    spErr.style.display = "none"; spOk.style.display = "none";

    if (!nm || nm.split(" ").length < 2) { spErr.innerHTML = ""; spErr.appendChild(errBox("Please enter your full name (first and last name).")); spErr.style.display = "block"; return; }
    if (!MATRIC_RE.test(mat))            { spErr.innerHTML = ""; spErr.appendChild(errBox("Invalid Matric No. Must be between FT23CMP0001 and FT23CMP0500.")); spErr.style.display = "block"; return; }
    if (!EMAIL_RE.test(em))              { spErr.innerHTML = ""; spErr.appendChild(errBox("Please enter a valid email address.")); spErr.style.display = "block"; return; }
    if (DB.users[mat])                   { spErr.innerHTML = ""; spErr.appendChild(errBox("This Matric No is already registered. Please log in instead.")); spErr.style.display = "block"; return; }

    DB.users[mat] = { name: nm, matric: mat, email: em, hasVoted: false };
    spOk.innerHTML = ""; spOk.appendChild(okBox(`Welcome, ${nm.split(" ")[0]}! 🎉 Account created. Redirecting to login…`)); spOk.style.display = "block";
    spSubmitBtn.disabled = true;
    setTimeout(() => { loginMatInp.value = mat; showPage("login"); }, 2000);
  });
  Object.assign(spSubmitBtn.style, { width: "100%", fontSize: "15px", padding: "14px" });
  spForm.appendChild(spSubmitBtn);

  const goLoginLink = div({ textAlign: "center", marginTop: "4px" });
  goLoginLink.innerHTML = '<p style="font-size:13px;color:var(--t2)">Already registered? <button onclick="window.showPage(\'login\')" style="background:none;border:none;color:var(--ac);cursor:pointer;font-weight:700;font-size:13px;font-family:var(--fn)">Log in here →</button></p>';
  spForm.appendChild(goLoginLink);
  signupPage.appendChild(spForm);

  // ════════════════════════════════════════════════════════════════════════════
  // LOGIN PAGE
  // ════════════════════════════════════════════════════════════════════════════
  const loginPage = div({ display: "none" });
  loginPage.className = "card";
  Object.assign(loginPage.style, { padding: "24px" });
  loginPage.appendChild(btn("← Back", { background: "none", border: "none", color: "var(--t2)", fontSize: "13px", cursor: "pointer", marginBottom: "20px" }, () => showPage("home")));

  const lpHdr = div({ marginBottom: "20px" });
  lpHdr.appendChild(div({ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "42px", height: "42px", borderRadius: "11px", background: "rgba(0,212,168,.1)", border: "1px solid rgba(0,212,168,.2)", fontSize: "20px", marginBottom: "10px" }, [span("🔐")]));
  lpHdr.appendChild(h(2, "Student Login", { fontSize: "19px", fontWeight: "800", marginBottom: "5px" }));
  lpHdr.appendChild(p("Enter your Matriculation Number to access the ballot.", { color: "var(--t2)", fontSize: "13px", lineHeight: "1.6" }));
  loginPage.appendChild(lpHdr);

  const lpForm = div({ display: "flex", flexDirection: "column", gap: "16px" });
  const lmWrap = div({ display: "flex", flexDirection: "column", gap: "6px" });
  const lmLbl  = document.createElement("label"); lmLbl.textContent = "Matriculation Number";
  Object.assign(lmLbl.style, { fontSize: "13px", fontWeight: "600", color: "var(--t2)", letterSpacing: ".04em" });
  const lmIconWrap = div({ position: "relative" });
  const lmIco = span("🎓", { position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)", fontSize: "14px", pointerEvents: "none" });
  const loginMatInp = mkInput("e.g. FT23CMP0042", "text", true);
  loginMatInp.maxLength = 13; loginMatInp.style.paddingLeft = "40px"; loginMatInp.style.fontSize = "15px";
  loginMatInp.oninput = () => (loginMatInp.value = loginMatInp.value.toUpperCase().replace(/[^A-Z0-9]/g, ""));
  lmIconWrap.appendChild(lmIco); lmIconWrap.appendChild(loginMatInp);
  lmWrap.appendChild(lmLbl); lmWrap.appendChild(lmIconWrap);
  lmWrap.appendChild(p("Format: FT23CMP0001 – FT23CMP0500", { fontSize: "11px", color: "var(--t3)" }));
  lpForm.appendChild(lmWrap);

  const lpErr = div({ display: "none" }); lpForm.appendChild(lpErr);

  const doLogin = () => {
    const mat = sanitize(loginMatInp.value.trim().toUpperCase());
    lpErr.style.display = "none";
    if (!mat)                 { lpErr.innerHTML = ""; lpErr.appendChild(errBox("Please enter your Matriculation Number.")); lpErr.style.display = "block"; return; }
    if (!MATRIC_RE.test(mat)) { lpErr.innerHTML = ""; lpErr.appendChild(errBox("Invalid format. Must be FT23CMP0001 – FT23CMP0500.")); lpErr.style.display = "block"; return; }
    if (!DB.users[mat])       { lpErr.innerHTML = ""; lpErr.appendChild(errBox("Matric No not found. Please create an account first.")); lpErr.style.display = "block"; return; }
    state.student = { id: mat, ...DB.users[mat] };
    state.view = "voter"; render();
  };
  loginMatInp.onkeydown = (e) => e.key === "Enter" && doLogin();

  const lpBtn = Btn("Access Voter Portal →", "pr", doLogin);
  Object.assign(lpBtn.style, { width: "100%", fontSize: "15px", padding: "14px" });
  lpForm.appendChild(lpBtn);

  const goRegLink = div({ textAlign: "center", marginTop: "4px" });
  goRegLink.innerHTML = '<p style="font-size:13px;color:var(--t2)">Don\'t have an account? <button onclick="window.showPage(\'signup\')" style="background:none;border:none;color:var(--ac);cursor:pointer;font-weight:700;font-size:13px;font-family:var(--fn)">Register here →</button></p>';
  lpForm.appendChild(goRegLink);
  loginPage.appendChild(lpForm);

  // ════════════════════════════════════════════════════════════════════════════
  // ADMIN PAGE
  // ════════════════════════════════════════════════════════════════════════════
  const adminPage = div({ display: "none" });
  adminPage.className = "card";
  Object.assign(adminPage.style, { padding: "24px" });
  adminPage.appendChild(btn("← Back", { background: "none", border: "none", color: "var(--t2)", fontSize: "13px", cursor: "pointer", marginBottom: "20px" }, () => showPage("home")));

  const apHdr = div({ marginBottom: "20px" });
  apHdr.appendChild(div({ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "42px", height: "42px", borderRadius: "11px", background: "rgba(0,153,255,.1)", border: "1px solid rgba(0,153,255,.2)", fontSize: "20px", marginBottom: "10px" }, [span("🛡️")]));
  const apTitleRow = div({ display: "flex", alignItems: "center", gap: "10px", marginBottom: "5px" });
  apTitleRow.appendChild(h(2, "Admin Access", { fontSize: "19px", fontWeight: "800" }));
  apTitleRow.appendChild(Tag("Restricted", "bl"));
  apHdr.appendChild(apTitleRow);
  apHdr.appendChild(p("Restricted to the Course Representative only.", { color: "var(--t2)", fontSize: "13px", lineHeight: "1.6" }));
  adminPage.appendChild(apHdr);

  const apForm = div({ display: "flex", flexDirection: "column", gap: "16px" });
  const apPwWrap = div({ display: "flex", flexDirection: "column", gap: "6px" });
  const apPwLbl  = document.createElement("label"); apPwLbl.textContent = "Admin Password";
  Object.assign(apPwLbl.style, { fontSize: "13px", fontWeight: "600", color: "var(--t2)", letterSpacing: ".04em" });
  const apPwIconWrap = div({ position: "relative" });
  const apPwIco = span("🔑", { position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)", fontSize: "14px", pointerEvents: "none" });
  const pwInp = mkInput("Enter admin password", "password");
  pwInp.style.paddingLeft = "40px";
  apPwIconWrap.appendChild(apPwIco); apPwIconWrap.appendChild(pwInp);
  apPwWrap.appendChild(apPwLbl); apPwWrap.appendChild(apPwIconWrap);
  apForm.appendChild(apPwWrap);

  const apErr = div({ display: "none" }); apForm.appendChild(apErr);

  const doAdmin = () => {
    apErr.style.display = "none";
    if (!pwInp.value)              { apErr.innerHTML = ""; apErr.appendChild(errBox("Please enter the admin password.")); apErr.style.display = "block"; return; }
    if (pwInp.value !== ADMIN_PW)  { apErr.innerHTML = ""; apErr.appendChild(errBox("Incorrect password. Access denied.")); apErr.style.display = "block"; return; }
    state.view = "admin"; render();
  };
  pwInp.onkeydown = (e) => e.key === "Enter" && doAdmin();

  const apBtn = Btn("🔓  Enter Dashboard", "se", doAdmin);
  Object.assign(apBtn.style, { width: "100%", fontSize: "15px", padding: "14px" });
  apForm.appendChild(apBtn);

  const pwHint = div({ marginTop: "4px", textAlign: "center" });
  pwHint.innerHTML = '<p style="font-size:11px;color:var(--t3)">Admin password: <code style="font-family:var(--mo);color:var(--t2)">Madaki123</code></p>';
  apForm.appendChild(pwHint);
  adminPage.appendChild(apForm);

  // ── PAGE SWITCHER ──────────────────────────────────────────────────────────
  const pages = { home: homeBtns, signup: signupPage, login: loginPage, admin: adminPage };
  window.showPage = (name) => {
    Object.values(pages).forEach((p) => (p.style.display = "none"));
    pages[name].style.display = "block";
  };
  showPage("home");

  wrap.appendChild(homeBtns);
  wrap.appendChild(signupPage);
  wrap.appendChild(loginPage);
  wrap.appendChild(adminPage);
  root.appendChild(wrap);
  return root;
}

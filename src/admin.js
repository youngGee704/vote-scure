/**
 * admin.js — VoteSecure CMP 300
 * ─────────────────────────────────────────────────────────────────────────────
 * Builds the Admin Dashboard — accessible only after correct password entry.
 *
 * Layout:
 *   - Sticky sidebar (navigation + election toggle + logout)
 *   - Main content area (rendered by renderMain() based on activeTab)
 *
 * Tabs:
 *   1. overview    — stats, turnout bar, vote distribution chart
 *   2. candidates  — CRUD management for candidate list
 *   3. monitoring  — real-time gauges + anonymous vote log
 *
 * Modals:
 *   - End Election confirmation
 *   - Election Results declaration (with download)
 *   - Add Candidate
 *   - Edit Candidate
 * ─────────────────────────────────────────────────────────────────────────────
 */

function buildAdmin() {
  let activeTab = "overview";

  const root = div({ display: "flex", minHeight: "100vh", background: "var(--bg)" });

  // ════════════════════════════════════════════════════════════════════════════
  // SIDEBAR
  // ════════════════════════════════════════════════════════════════════════════
  const sidebar = div({
    width: "230px",
    background: "var(--s1)",
    borderRight: "1px solid var(--br)",
    display: "flex",
    flexDirection: "column",
    position: "sticky",
    top: "0",
    height: "100vh",
    flexShrink: "0",
  });

  // Sidebar top branding
  const sbTop = div({ padding: "20px 18px", borderBottom: "1px solid var(--br)" });
  sbTop.appendChild(span("🛡️", { display: "block", fontSize: "22px", marginBottom: "8px" }));
  sbTop.appendChild(p("Admin Dashboard", { fontWeight: "800", fontSize: "14px" }));
  sbTop.appendChild(p("Course Rep Panel", { fontSize: "11px", color: "var(--t2)", marginTop: "3px" }));
  sidebar.appendChild(sbTop);

  // Navigation tabs
  const nav  = div({ padding: "10px", flex: "1" });
  const tabs = [
    { id: "overview",   lb: "📊 Overview" },
    { id: "candidates", lb: "👥 Candidates" },
    { id: "monitoring", lb: "📡 Live Monitor" },
  ];
  const tabBtns = {};
  tabs.forEach((t) => {
    const isActive = t.id === "overview";
    const tb = btn(t.lb, {
      width: "100%",
      textAlign: "left",
      background:   isActive ? "rgba(0,212,168,.1)" : "transparent",
      border:       isActive ? "1px solid rgba(0,212,168,.2)" : "1px solid transparent",
      borderRadius: "var(--rs)",
      padding:      "10px 13px",
      marginBottom: "4px",
      color:        isActive ? "var(--ac)" : "var(--t2)",
      fontSize:     "13px",
      fontWeight:   isActive ? "600" : "400",
      cursor:       "pointer",
      transition:   "all .2s",
    }, () => {
      activeTab = t.id;
      Object.entries(tabBtns).forEach(([id, b]) => {
        b.style.background  = id === t.id ? "rgba(0,212,168,.1)" : "transparent";
        b.style.borderColor = id === t.id ? "rgba(0,212,168,.2)" : "transparent";
        b.style.color       = id === t.id ? "var(--ac)" : "var(--t2)";
        b.style.fontWeight  = id === t.id ? "600" : "400";
      });
      renderMain();
    });
    tabBtns[t.id] = tb;
    nav.appendChild(tb);
  });
  sidebar.appendChild(nav);

  // Election toggle + logout
  const sbBot = div({ padding: "14px", borderTop: "1px solid var(--br)" });
  const isOpen = DB.election.status === "open";

  const toggleBox = div({
    marginBottom: "10px",
    padding: "10px 12px",
    background: `rgba(${isOpen ? "0,212,168" : "255,71,87"},.1)`,
    borderRadius: "var(--rs)",
    border: `1px solid rgba(${isOpen ? "0,212,168" : "255,71,87"},.2)`,
  });
  const toggleStatus = div({ display: "flex", alignItems: "center", gap: "7px", marginBottom: "8px" });
  const tDot  = Dot(DB.election.status === "open");
  const tTxt  = span(DB.election.status === "open" ? "ELECTION OPEN" : "ELECTION CLOSED", {
    fontSize: "12px", fontWeight: "700",
    color: DB.election.status === "open" ? "var(--ac)" : "var(--er)",
  });
  toggleStatus.appendChild(tDot); toggleStatus.appendChild(tTxt);
  toggleBox.appendChild(toggleStatus);

  const toggleBtn = btn(
    DB.election.status === "open" ? "🔒 Close Voting" : "🔓 Open Voting",
    {
      width: "100%",
      background: DB.election.status === "open" ? "linear-gradient(135deg,#ff4757,#ff6b35)" : "linear-gradient(135deg,#00d4a8,#00b894)",
      color: DB.election.status === "open" ? "#fff" : "#000",
      border: "none",
      borderRadius: "var(--rs)",
      padding: "8px",
      fontSize: "12px",
      fontWeight: "600",
      cursor: "pointer",
    },
    () => {
      DB.election.status = DB.election.status === "open" ? "closed" : "open";
      toggleBtn.textContent = DB.election.status === "open" ? "🔒 Close Voting" : "🔓 Open Voting";
      Object.assign(toggleBtn.style, {
        background: DB.election.status === "open" ? "linear-gradient(135deg,#ff4757,#ff6b35)" : "linear-gradient(135deg,#00d4a8,#00b894)",
        color: DB.election.status === "open" ? "#fff" : "#000",
      });
      tTxt.textContent = DB.election.status === "open" ? "ELECTION OPEN" : "ELECTION CLOSED";
      tTxt.style.color = DB.election.status === "open" ? "var(--ac)" : "var(--er)";
      renderMain();
    }
  );
  toggleBox.appendChild(toggleBtn);
  sbBot.appendChild(toggleBox);
  sbBot.appendChild(btn("← Logout", {
    width: "100%", background: "none", border: "1px solid var(--br)",
    color: "var(--t3)", padding: "9px", borderRadius: "var(--rs)", fontSize: "12px",
  }, () => { state.view = "landing"; render(); }));
  sidebar.appendChild(sbBot);

  // ════════════════════════════════════════════════════════════════════════════
  // MAIN CONTENT AREA
  // ════════════════════════════════════════════════════════════════════════════
  const mainArea = div({ flex: "1", padding: "28px 30px", overflowY: "auto" });

  // ── renderMain: re-renders the active tab's content ──────────────────────
  function renderMain() {
    mainArea.innerHTML = "";
    const tv = DB.election.totalVotes;
    const ts = DB.election.totalStudents;
    const tp = Math.round((tv / ts) * 100);
    const isClosed = DB.election.status === "closed";
    const ranked = [...DB.candidates].sort((a, b) => b.votes - a.votes);

    // ── TAB: OVERVIEW ────────────────────────────────────────────────────────
    if (activeTab === "overview") {
      const topRow = div({ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" });
      const pageTitle = div({});
      pageTitle.appendChild(h(1, "Election Overview", { fontSize: "22px", fontWeight: "800", letterSpacing: "-.02em", marginBottom: "4px" }));
      pageTitle.appendChild(p("300 LEVEL CMP · Real-time data", { color: "var(--t2)", fontSize: "13px" }));
      topRow.appendChild(pageTitle);

      if (!isClosed) {
        topRow.appendChild(Btn("🏁 End Election", "da", () => {
          mkModal("🏁 End Election?", (box, close) => {
            box.appendChild(p("This will permanently close voting and declare a winner. This cannot be reversed.", { color: "var(--t2)", fontSize: "13px", marginBottom: "14px", lineHeight: "1.7" }));
            const warnDiv = div({ background: "rgba(255,71,87,.07)", border: "1px solid rgba(255,71,87,.2)", borderRadius: "var(--rs)", padding: "10px", marginBottom: "16px" });
            warnDiv.appendChild(p(`⚠️ ${tv} votes cast · ${tp}% turnout.`, { fontSize: "13px", color: "var(--er)" }));
            box.appendChild(warnDiv);
            const br = div({ display: "flex", gap: "10px" });
            br.appendChild(Btn("Cancel", "se", close));
            br.appendChild(Btn("🏁 End & Declare Winner", "da", () => {
              DB.election.status = "closed";
              close();
              toggleBtn.textContent = "🔓 Open Voting";
              Object.assign(toggleBtn.style, { background: "linear-gradient(135deg,#00d4a8,#00b894)", color: "#000" });
              tTxt.textContent = "ELECTION CLOSED"; tTxt.style.color = "var(--er)";
              renderMain(); showResults();
            }));
            box.appendChild(br);
          });
        }));
      } else {
        topRow.appendChild(Btn("🏆 View Results", "pr", showResults));
      }
      mainArea.appendChild(topRow);

      // Stats grid
      const statGrid = div({ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(155px,1fr))", gap: "12px", marginBottom: "20px" });
      [
        { l: "Votes Cast",     v: tv,                    ic: "🗳️", cl: "var(--ac)" },
        { l: "Total Students", v: ts,                    ic: "🎓", cl: "var(--bl)" },
        { l: "Turnout",        v: `${tp}%`,              ic: "📊", cl: "var(--wn)" },
        { l: "Candidates",     v: DB.candidates.length,  ic: "👥", cl: "var(--or)" },
      ].forEach((s, i) => {
        const sc = div({ background: "var(--s1)", border: "1px solid var(--br)", borderRadius: "var(--rd)", padding: "16px", textAlign: "center", animation: `up .4s ease ${i * 0.07}s both` });
        sc.appendChild(p(s.ic, { fontSize: "24px", marginBottom: "5px" }));
        sc.appendChild(p(String(s.v), { fontSize: "24px", fontWeight: "800", color: s.cl, fontFamily: "var(--mo)" }));
        sc.appendChild(p(s.l, { fontSize: "11px", color: "var(--t2)", marginTop: "3px" }));
        statGrid.appendChild(sc);
      });
      mainArea.appendChild(statGrid);

      // Turnout progress bar
      const tCard = div({ background: "var(--s1)", border: "1px solid var(--br)", borderRadius: "var(--rd)", padding: "18px", marginBottom: "16px" });
      const tcTop = div({ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" });
      tcTop.appendChild(p("Voter Turnout", { fontWeight: "700", fontSize: "14px" }));
      tcTop.appendChild(Tag(`${tp}% Participated`, tp > 70 ? "ac" : tp > 40 ? "wn" : "er"));
      tCard.appendChild(tcTop);
      const barTrack = div({ width: "100%", height: "12px", background: "var(--s3)", borderRadius: "6px", overflow: "hidden" });
      const barFill  = div({ height: "100%", width: `${tp}%`, background: "var(--ac)", borderRadius: "6px", transition: "width 1s ease", boxShadow: "0 0 8px rgba(0,212,168,.4)" });
      barTrack.appendChild(barFill); tCard.appendChild(barTrack);
      const tRow = div({ display: "flex", justifyContent: "space-between", marginTop: "8px" });
      tRow.appendChild(p(`✅ ${tv} voted`, { fontSize: "12px", color: "var(--t3)" }));
      tRow.appendChild(p(`⏳ ${ts - tv} remaining`, { fontSize: "12px", color: "var(--t3)" }));
      tCard.appendChild(tRow); mainArea.appendChild(tCard);

      // Vote distribution
      const dCard = div({ background: "var(--s1)", border: "1px solid var(--br)", borderRadius: "var(--rd)", padding: "18px" });
      dCard.appendChild(p("Live Vote Distribution", { fontWeight: "700", fontSize: "14px", marginBottom: "5px" }));
      dCard.appendChild(p(isClosed ? "Final results:" : "ℹ️ Exact counts hidden until election closes.", { fontSize: "12px", color: "var(--t3)", marginBottom: "16px", fontStyle: "italic" }));
      ranked.forEach((c, i) => {
        const pct = tv > 0 ? Math.round((c.votes / tv) * 100) : 0;
        const clr = ["var(--ac)", "var(--bl)", "var(--or)", "var(--wn)"][i % 4];
        const row = div({ marginBottom: "14px" });
        const rTop = div({ display: "flex", justifyContent: "space-between", marginBottom: "6px", alignItems: "center" });
        const rLeft = div({ display: "flex", alignItems: "center", gap: "8px" });
        const av = div({ width: "26px", height: "26px", borderRadius: "6px", background: `${c.color}25`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "9px", fontWeight: "800", color: c.color, fontFamily: "var(--mo)" }, [span(c.avatar)]);
        rLeft.appendChild(av); rLeft.appendChild(p(c.name, { fontWeight: "600", fontSize: "13px" }));
        rTop.appendChild(rLeft);
        rTop.appendChild(p(isClosed ? `${c.votes} votes` : `${pct}%`, { fontFamily: "var(--mo)", fontSize: "12px", color: clr }));
        row.appendChild(rTop);
        const bt = div({ width: "100%", height: "9px", background: "var(--s3)", borderRadius: "5px", overflow: "hidden" });
        bt.appendChild(div({ height: "100%", width: `${tv > 0 ? Math.round((c.votes / Math.max(tv, 1)) * 100) : 0}%`, background: clr, borderRadius: "5px", boxShadow: `0 0 6px ${clr}40` }));
        row.appendChild(bt); dCard.appendChild(row);
      });
      mainArea.appendChild(dCard);
    }

    // ── TAB: CANDIDATES ──────────────────────────────────────────────────────
    if (activeTab === "candidates") {
      const cTop = div({ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" });
      cTop.appendChild(h(1, "Candidate Management", { fontSize: "22px", fontWeight: "800" }));
      cTop.appendChild(Btn("+ Add Candidate", "pr", () => {
        mkModal("Add New Candidate", (box, close) => {
          const nf = div({ display: "flex", flexDirection: "column", gap: "13px" });
          const ni = mkInput("e.g. John Emeka Doe");
          const nm = div({ display: "flex", flexDirection: "column", gap: "5px" });
          nm.appendChild(p("Full Name", { fontSize: "13px", fontWeight: "600", color: "var(--t2)" }));
          nm.appendChild(ni); nf.appendChild(nm);

          const mnTa = document.createElement("textarea");
          mnTa.placeholder = "Write the candidate's manifesto…"; mnTa.rows = 4;
          Object.assign(mnTa.style, { width: "100%", background: "var(--s2)", border: "1px solid var(--br)", borderRadius: "var(--rs)", padding: "11px 13px", color: "var(--tx)", fontSize: "13px", outline: "none", resize: "vertical", fontFamily: "var(--fn)" });
          mnTa.onfocus = () => (mnTa.style.borderColor = "var(--ac)");
          mnTa.onblur  = () => (mnTa.style.borderColor = "var(--br)");
          const mnWrap = div({ display: "flex", flexDirection: "column", gap: "5px" });
          mnWrap.appendChild(p("Manifesto", { fontSize: "13px", fontWeight: "600", color: "var(--t2)" }));
          mnWrap.appendChild(mnTa); nf.appendChild(mnWrap);

          const br = div({ display: "flex", gap: "10px" });
          br.appendChild(Btn("Cancel", "se", close));
          br.appendChild(Btn("Add Candidate", "pr", () => {
            if (!ni.value.trim()) return;
            DB.candidates.push({
              id:        "c" + Date.now(),
              name:      sanitize(ni.value.trim()),
              position:  "Course Representative",
              manifesto: sanitize(mnTa.value.trim()) || "Manifesto to be added.",
              avatar:    initials(ni.value),
              color:     COLORS[DB.candidates.length % COLORS.length],
              votes:     0,
            });
            close(); renderMain();
          }));
          nf.appendChild(br); box.appendChild(nf);
        });
      }));
      mainArea.appendChild(cTop);

      DB.candidates.forEach((c, i) => {
        const cc = div({ background: "var(--s1)", border: "1px solid var(--br)", borderRadius: "var(--rd)", padding: "16px", marginBottom: "12px", animation: `up .4s ease ${i * 0.07}s both` });
        const cRow = div({ display: "flex", alignItems: "flex-start", gap: "12px" });
        cRow.appendChild(div({ width: "46px", height: "46px", borderRadius: "11px", background: `${c.color}25`, border: `2px solid ${c.color}45`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: "800", color: c.color, flexShrink: "0", fontFamily: "var(--mo)" }, [span(c.avatar)]));
        const ct = div({ flex: "1" });
        const ctTop = div({ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "8px" });
        const ctLeft = div({});
        ctLeft.appendChild(p(c.name,     { fontWeight: "700", fontSize: "15px", marginBottom: "2px" }));
        ctLeft.appendChild(p(c.position, { fontSize: "11px", color: "var(--ac)", fontWeight: "600", letterSpacing: ".04em" }));
        const ctRight = div({ display: "flex", gap: "7px" });

        // Edit button
        ctRight.appendChild(btn("✏️ Edit", { background: "rgba(0,153,255,.08)", border: "1px solid rgba(0,153,255,.2)", color: "var(--bl)", padding: "5px 11px", borderRadius: "var(--rs)", fontSize: "12px", cursor: "pointer" }, () => {
          mkModal("Edit Candidate", (box, close) => {
            const ef = div({ display: "flex", flexDirection: "column", gap: "13px" });
            const ei = mkInput(c.name); ei.value = c.name;
            const em2 = div({ display: "flex", flexDirection: "column", gap: "5px" });
            em2.appendChild(p("Full Name", { fontSize: "13px", fontWeight: "600", color: "var(--t2)" }));
            em2.appendChild(ei); ef.appendChild(em2);

            const eta = document.createElement("textarea"); eta.rows = 4; eta.value = c.manifesto;
            Object.assign(eta.style, { width: "100%", background: "var(--s2)", border: "1px solid var(--br)", borderRadius: "var(--rs)", padding: "11px 13px", color: "var(--tx)", fontSize: "13px", outline: "none", resize: "vertical", fontFamily: "var(--fn)" });
            eta.onfocus = () => (eta.style.borderColor = "var(--ac)");
            eta.onblur  = () => (eta.style.borderColor = "var(--br)");
            const etw = div({ display: "flex", flexDirection: "column", gap: "5px" });
            etw.appendChild(p("Manifesto", { fontSize: "13px", fontWeight: "600", color: "var(--t2)" }));
            etw.appendChild(eta); ef.appendChild(etw);

            const br = div({ display: "flex", gap: "10px" });
            br.appendChild(Btn("Cancel", "se", close));
            br.appendChild(Btn("Save Changes", "pr", () => {
              c.name      = sanitize(ei.value.trim()  || c.name);
              c.manifesto = sanitize(eta.value.trim() || c.manifesto);
              c.avatar    = initials(c.name);
              close(); renderMain();
            }));
            ef.appendChild(br); box.appendChild(ef);
          });
        }));

        // Remove button
        ctRight.appendChild(btn("🗑️ Remove", { background: "rgba(255,71,87,.08)", border: "1px solid rgba(255,71,87,.2)", color: "var(--er)", padding: "5px 11px", borderRadius: "var(--rs)", fontSize: "12px", cursor: "pointer" }, () => {
          DB.candidates.splice(DB.candidates.indexOf(c), 1);
          renderMain();
        }));

        ctTop.appendChild(ctLeft); ctTop.appendChild(ctRight); ct.appendChild(ctTop);
        ct.appendChild(p(c.manifesto, { fontSize: "13px", color: "var(--t2)", marginTop: "8px", lineHeight: "1.75" }));
        cRow.appendChild(ct); cc.appendChild(cRow); mainArea.appendChild(cc);
      });
      if (!DB.candidates.length) mainArea.appendChild(p("No candidates yet. Add one above.", { color: "var(--t3)", fontSize: "14px" }));
    }

    // ── TAB: MONITORING ──────────────────────────────────────────────────────
    if (activeTab === "monitoring") {
      mainArea.appendChild(h(1, "Live Monitoring", { fontSize: "22px", fontWeight: "800", marginBottom: "4px" }));
      mainArea.appendChild(p("Real-time data · Student identities never shown.", { color: "var(--t2)", fontSize: "13px", marginBottom: "20px" }));

      // Metric cards
      const mg = div({ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" });
      const vc = div({ background: "var(--s1)", border: "1px solid var(--br)", borderRadius: "var(--rd)", padding: "16px", animation: "gp 3s ease infinite" });
      vc.appendChild(p("VOTES CAST",    { fontSize: "11px", color: "var(--t3)", marginBottom: "6px", letterSpacing: ".06em" }));
      vc.appendChild(p(String(tv),      { fontSize: "40px", fontWeight: "800", fontFamily: "var(--mo)", color: "var(--ac)" }));
      vc.appendChild(p(`of ${ts} students`, { fontSize: "12px", color: "var(--t2)", marginTop: "3px" }));
      const tc = div({ background: "var(--s1)", border: "1px solid var(--br)", borderRadius: "var(--rd)", padding: "16px" });
      tc.appendChild(p("TURNOUT RATE",  { fontSize: "11px", color: "var(--t3)", marginBottom: "6px", letterSpacing: ".06em" }));
      tc.appendChild(p(`${tp}%`,        { fontSize: "40px", fontWeight: "800", fontFamily: "var(--mo)", color: "var(--wn)" }));
      tc.appendChild(p("participation rate", { fontSize: "12px", color: "var(--t2)", marginTop: "3px" }));
      mg.appendChild(vc); mg.appendChild(tc); mainArea.appendChild(mg);

      // Participation gauge
      const gCard = div({ background: "var(--s1)", border: "1px solid var(--br)", borderRadius: "var(--rd)", padding: "18px", marginBottom: "14px" });
      const gcTop = div({ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" });
      gcTop.appendChild(p("Participation Gauge", { fontWeight: "700", fontSize: "14px" }));
      const gcStatus = div({ display: "flex", alignItems: "center", gap: "7px" }, [
        Dot(DB.election.status === "open"),
        span(DB.election.status === "open" ? "Accepting Votes" : "Closed", { fontSize: "12px", color: DB.election.status === "open" ? "var(--ac)" : "var(--er)", fontWeight: "600" }),
      ]);
      gcTop.appendChild(gcStatus); gCard.appendChild(gcTop);
      const gt = div({ width: "100%", height: "16px", background: "var(--s3)", borderRadius: "8px", overflow: "hidden" });
      gt.appendChild(div({ height: "100%", width: `${tp}%`, background: "var(--ac)", borderRadius: "8px", boxShadow: "0 0 8px rgba(0,212,168,.4)" }));
      gCard.appendChild(gt);
      const gRow = div({ display: "flex", justifyContent: "space-between", marginTop: "8px" });
      gRow.appendChild(p(`✅ ${tv} voted`,    { fontSize: "12px", color: "var(--t2)" }));
      gRow.appendChild(p(`⏳ ${ts - tv} pending`, { fontSize: "12px", color: "var(--t2)" }));
      gCard.appendChild(gRow); mainArea.appendChild(gCard);

      // Anonymous vote log
      const vCard = div({ background: "var(--s1)", border: "1px solid var(--br)", borderRadius: "var(--rd)", padding: "18px" });
      vCard.appendChild(p("Anonymous Vote Log · receipt IDs only", { fontWeight: "700", fontSize: "14px", marginBottom: "14px" }));
      if (!DB.votes.length) {
        vCard.appendChild(p("No votes yet.", { color: "var(--t3)", fontSize: "13px" }));
      } else {
        DB.votes.slice().reverse().forEach((v) => {
          const vr = div({ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--s2)", borderRadius: "var(--rs)", padding: "9px 13px", border: "1px solid var(--br)", marginBottom: "7px", animation: "si .3s ease" });
          vr.appendChild(div({ display: "flex", alignItems: "center", gap: "8px" }, [
            div({ width: "6px", height: "6px", borderRadius: "50%", background: "var(--ac)", flexShrink: "0" }),
            span(v.receiptId, { fontFamily: "var(--mo)", fontSize: "12px", color: "var(--t2)" }),
          ]));
          vr.appendChild(span(v.ts || "", { fontSize: "11px", color: "var(--t3)" }));
          vCard.appendChild(vr);
        });
      }
      mainArea.appendChild(vCard);
    }
  } // end renderMain

  // ── RESULTS MODAL ────────────────────────────────────────────────────────
  function showResults() {
    const tv     = DB.election.totalVotes;
    const ts     = DB.election.totalStudents;
    const tp     = Math.round((tv / ts) * 100);
    const ranked = [...DB.candidates].sort((a, b) => b.votes - a.votes);
    const winner = ranked[0];

    mkModal("🏆 Election Results", (box) => {
      // Winner section
      if (winner) {
        const wSection = div({ textAlign: "center", marginBottom: "18px" });
        wSection.appendChild(p("🏆", { fontSize: "48px", marginBottom: "8px" }));
        wSection.appendChild(p("WINNER DECLARED", { fontSize: "10px", color: "var(--t3)", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: "5px" }));
        const wAv = div({ width: "60px", height: "60px", borderRadius: "15px", background: `${winner.color}25`, border: `2px solid ${winner.color}50`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", fontWeight: "800", color: winner.color, fontFamily: "var(--mo)", margin: "0 auto 8px" }, [span(winner.avatar)]);
        wSection.appendChild(wAv);
        wSection.appendChild(h(2, winner.name,     { fontSize: "20px", fontWeight: "800", marginBottom: "3px" }));
        wSection.appendChild(p(winner.position,    { color: "var(--ac)", fontWeight: "600", fontSize: "13px" }));
        wSection.appendChild(p(`${winner.votes} votes · ${tv > 0 ? Math.round((winner.votes / tv) * 100) : 0}% of ballots`, { color: "var(--t2)", fontSize: "13px", marginTop: "4px" }));
        box.appendChild(wSection);
      }

      // All candidates ranked
      ranked.forEach((c, i) => {
        const rr = div({ marginBottom: "12px" });
        const rt = div({ display: "flex", justifyContent: "space-between", marginBottom: "5px", alignItems: "center" });
        rt.appendChild(div({ display: "flex", alignItems: "center", gap: "6px" }, [
          span(["🥇", "🥈", "🥉"][i] || "", { fontSize: "13px" }),
          p(c.name, { fontWeight: "600", fontSize: "13px" }),
        ]));
        rt.appendChild(p(`${c.votes} votes`, { fontFamily: "var(--mo)", fontSize: "12px", fontWeight: "700" }));
        rr.appendChild(rt);
        const bt = div({ width: "100%", height: "8px", background: "var(--s3)", borderRadius: "4px", overflow: "hidden" });
        bt.appendChild(div({ height: "100%", width: `${tv > 0 ? Math.round((c.votes / Math.max(tv, 1)) * 100) : 0}%`, background: i === 0 ? "var(--ac)" : "var(--t3)", borderRadius: "4px" }));
        rr.appendChild(bt); box.appendChild(rr);
      });

      // Summary stats
      const stats = div({ background: "var(--s2)", borderRadius: "var(--rs)", padding: "11px", marginBottom: "14px" });
      stats.appendChild(p(`Votes: ${tv} · Turnout: ${tp}% · Students: ${ts}`, { fontSize: "11px", color: "var(--t3)", fontFamily: "var(--mo)" }));
      box.appendChild(stats);

      // Download results as .txt
      const dlBtn = Btn("📄 Download Results Report", "pr", () => {
        const r =
          `300 LEVEL CMP ONLINE VOTING SYSTEM\nELECTION RESULTS REPORT\n${"=".repeat(50)}\n\n` +
          `WINNER: ${winner?.name} (${winner?.votes} votes)\n\n` +
          `FULL RESULTS:\n${ranked.map((c, i) => `${i + 1}. ${c.name}: ${c.votes} votes (${tv > 0 ? Math.round((c.votes / tv) * 100) : 0}%)`).join("\n")}\n\n` +
          `Turnout: ${tv}/${ts} (${tp}%)\nGenerated: ${new Date().toLocaleString()}`;
        const a = Object.assign(document.createElement("a"), {
          href:     URL.createObjectURL(new Blob([r], { type: "text/plain" })),
          download: "cmp300-results.txt",
        });
        a.click();
      });
      Object.assign(dlBtn.style, { width: "100%" });
      box.appendChild(dlBtn);
    });
  }

  renderMain();
  root.appendChild(sidebar);
  root.appendChild(mainArea);
  return root;
}

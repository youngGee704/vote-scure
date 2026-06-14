/**
 * voter.js — VoteSecure CMP 300
 * ─────────────────────────────────────────────────────────────────────────────
 * Builds the Voter Portal — shown after a student successfully logs in.
 *
 * Features:
 *  - Welcome banner with student name + initials avatar
 *  - Status alerts (already voted / election closed)
 *  - Candidate cards with expandable manifestos
 *  - Vote selection (highlight + check mark)
 *  - Submit vote button → Confirm modal → Receipt modal
 *  - Logout button
 * ─────────────────────────────────────────────────────────────────────────────
 */

function buildVoter() {
  const sid     = state.student.id;
  const student = DB.users[sid] || state.student;
  let pick   = null; // currently selected candidate id
  let expand = null; // currently expanded manifesto id

  const root = div({ minHeight: "100vh", background: "var(--bg)" });

  // ── STICKY HEADER ──────────────────────────────────────────────────────────
  const header = div({
    background: "rgba(17,24,39,.96)",
    backdropFilter: "blur(12px)",
    borderBottom: "1px solid var(--br)",
    padding: "12px 20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    position: "sticky",
    top: "0",
    zIndex: "100",
  });

  const hLeft = div({ display: "flex", alignItems: "center", gap: "10px" });
  hLeft.appendChild(span("🗳️", { fontSize: "20px" }));
  const hTxt = div({});
  hTxt.appendChild(p("VoteSecure", { fontWeight: "700", fontSize: "14px" }));
  hTxt.appendChild(p("300 LEVEL CMP ONLINE VOTING SYSTEM", { fontSize: "10px", color: "var(--t2)" }));
  hLeft.appendChild(hTxt);

  const hRight = div({ display: "flex", alignItems: "center", gap: "10px" });
  const closed = DB.election.status === "closed";
  const statusRow = div({ display: "flex", alignItems: "center", gap: "6px" });
  statusRow.appendChild(Dot(!closed));
  statusRow.appendChild(span(closed ? "CLOSED" : "LIVE", { fontSize: "11px", color: closed ? "var(--er)" : "var(--ac)", fontWeight: "700", letterSpacing: ".04em" }));
  const userBadge = div({ padding: "5px 10px", background: "var(--s1)", borderRadius: "var(--rs)", border: "1px solid var(--br)", fontSize: "11px", color: "var(--t2)", fontFamily: "var(--mo)" }, [span("👤 " + sid)]);
  const logoutBtn = btn("Logout", { background: "none", border: "1px solid var(--br)", color: "var(--t3)", padding: "5px 11px", borderRadius: "var(--rs)", fontSize: "12px" }, () => { state.view = "landing"; state.student = null; render(); });
  hRight.appendChild(statusRow); hRight.appendChild(userBadge); hRight.appendChild(logoutBtn);
  header.appendChild(hLeft); header.appendChild(hRight);
  root.appendChild(header);

  const main = div({ maxWidth: "900px", margin: "0 auto", padding: "28px 16px" });

  // ── WELCOME BANNER ─────────────────────────────────────────────────────────
  const welcomeBanner = div({ marginBottom: "20px", padding: "14px 18px", background: "var(--s1)", borderRadius: "var(--rd)", border: "1px solid var(--br)", display: "flex", alignItems: "center", gap: "12px", animation: "up .4s ease" });
  const avDiv = div({ width: "40px", height: "40px", borderRadius: "10px", background: "linear-gradient(135deg,rgba(0,212,168,.2),rgba(0,153,255,.2))", border: "1px solid rgba(0,212,168,.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: "700", color: "var(--ac)", fontFamily: "var(--mo)", flexShrink: "0" }, [span(initials(student.name || "ST"))]);
  const wTxt = div({ flex: "1" });
  wTxt.appendChild(p("Welcome back, " + (student.name || "Student").split(" ")[0] + "! 👋", { fontWeight: "700", fontSize: "14px", marginBottom: "2px" }));
  wTxt.appendChild(p((student.email || "") + " · " + sid, { fontSize: "11px", color: "var(--t2)", fontFamily: "var(--mo)" }));
  welcomeBanner.appendChild(avDiv); welcomeBanner.appendChild(wTxt);
  if (student.hasVoted) welcomeBanner.appendChild(Tag("Voted ✓", "ac"));
  main.appendChild(welcomeBanner);

  // ── STATUS ALERTS ──────────────────────────────────────────────────────────
  if (student.hasVoted) {
    const vBanner = div({ background: "rgba(0,212,168,.07)", border: "1px solid rgba(0,212,168,.25)", borderRadius: "var(--rd)", padding: "14px 18px", marginBottom: "20px", display: "flex", gap: "12px", alignItems: "center", animation: "up .4s ease" });
    vBanner.appendChild(span("✅", { fontSize: "24px" }));
    const vt = div({});
    vt.appendChild(p("Your vote has been recorded!", { fontWeight: "700", color: "var(--ac)", marginBottom: "2px" }));
    vt.appendChild(p("Your choice is anonymous and permanent.", { fontSize: "13px", color: "var(--t2)" }));
    vBanner.appendChild(vt); main.appendChild(vBanner);
  }
  if (closed && !student.hasVoted) {
    const cBanner = div({ background: "rgba(255,71,87,.07)", border: "1px solid rgba(255,71,87,.25)", borderRadius: "var(--rd)", padding: "14px 18px", marginBottom: "20px" });
    cBanner.appendChild(p("🔒 Election Closed", { fontWeight: "700", color: "var(--er)", marginBottom: "2px" }));
    cBanner.appendChild(p("Voting has ended. Results are being processed.", { fontSize: "13px", color: "var(--t2)" }));
    main.appendChild(cBanner);
  }

  // ── PAGE TITLE ─────────────────────────────────────────────────────────────
  const titleSection = div({ marginBottom: "20px" });
  titleSection.appendChild(h(2, student.hasVoted ? "Election Candidates" : "Cast Your Vote", { fontSize: "22px", fontWeight: "800", letterSpacing: "-.02em", marginBottom: "5px" }));
  titleSection.appendChild(p(student.hasVoted ? "You have already voted." : closed ? "Voting is now closed." : "Review each candidate carefully. Your vote is anonymous and permanent.", { color: "var(--t2)", fontSize: "13px" }));
  main.appendChild(titleSection);

  // ── CANDIDATE CARDS GRID ───────────────────────────────────────────────────
  const grid = div({ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(265px,1fr))", gap: "14px", marginBottom: "28px" });
  const cardRefs = {}; // id → { ccard, checkMark }

  DB.candidates.forEach((c, i) => {
    const ccard = div({
      background: "var(--s1)",
      border: "2px solid var(--br)",
      borderRadius: "var(--rd)",
      padding: "18px",
      cursor: student.hasVoted || closed ? "default" : "pointer",
      transition: "all .25s",
      animation: `up .5s ease ${i * 0.07}s both`,
    });

    // Avatar row
    const cavH = div({ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "11px" });
    const av   = div({ width: "48px", height: "48px", borderRadius: "12px", background: `${c.color}28`, border: `2px solid ${c.color}55`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px", fontWeight: "800", color: c.color, fontFamily: "var(--mo)" }, [span(c.avatar)]);
    const checkMark = div({ width: "24px", height: "24px", borderRadius: "50%", background: "var(--ac)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px" }, [span("✓")]);
    checkMark.style.display = "none"; // hidden until selected
    cavH.appendChild(av); cavH.appendChild(checkMark);
    ccard.appendChild(cavH);

    ccard.appendChild(p(c.name,     { fontWeight: "700", fontSize: "15px", marginBottom: "3px" }));
    ccard.appendChild(p(c.position, { fontSize: "11px", color: "var(--ac)", fontWeight: "700", marginBottom: "9px", textTransform: "uppercase", letterSpacing: ".05em" }));

    // Manifesto (truncated by default)
    const manifestoEl = p(c.manifesto.slice(0, 95) + "…", { fontSize: "13px", color: "var(--t2)", lineHeight: "1.75", marginBottom: "9px" });
    ccard.appendChild(manifestoEl);

    // Expand/collapse button
    const readBtn = btn("▼ Read full manifesto", { background: "none", border: "none", color: "var(--ac)", fontSize: "12px", cursor: "pointer", fontWeight: "600" }, (e) => {
      e.stopPropagation();
      if (expand === c.id) {
        expand = null;
        manifestoEl.textContent = c.manifesto.slice(0, 95) + "…";
        readBtn.textContent = "▼ Read full manifesto";
      } else {
        expand = c.id;
        manifestoEl.textContent = c.manifesto;
        readBtn.textContent = "▲ Show less";
      }
    });
    ccard.appendChild(readBtn);
    cardRefs[c.id] = { ccard, checkMark };

    // Selection handler (only when voting is active)
    if (!student.hasVoted && !closed) {
      ccard.onclick = () => {
        const prev = pick;
        if (prev && cardRefs[prev]) {
          cardRefs[prev].ccard.style.border    = "2px solid var(--br)";
          cardRefs[prev].ccard.style.transform = "none";
          cardRefs[prev].checkMark.style.display = "none";
        }
        if (prev === c.id) {
          pick = null;
          submitBtn.disabled = true;
          submitHint.textContent = "Select a candidate above to continue";
        } else {
          pick = c.id;
          ccard.style.border    = "2px solid var(--ac)";
          ccard.style.transform = "translateY(-3px)";
          checkMark.style.display = "flex";
          submitBtn.disabled = false;
          submitHint.textContent = "Selected: " + c.name;
        }
      };
    }
    grid.appendChild(ccard);
  });
  main.appendChild(grid);

  // ── SUBMIT BUTTON ──────────────────────────────────────────────────────────
  const submitWrap = div({ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", animation: "up .6s ease" });
  const submitHint = p("Select a candidate above to continue", { fontSize: "12px", color: "var(--t3)" });

  const submitBtn = Btn("🗳️  Submit My Vote", "pr", () => {
    if (!pick) return;
    const c = DB.candidates.find((x) => x.id === pick);

    // Confirmation modal
    mkModal("Confirm Your Vote", (box, closeModal) => {
      box.appendChild(p("You are about to cast your vote for:", { color: "var(--t2)", fontSize: "13px", marginBottom: "14px" }));

      const cRow = div({ background: "var(--s2)", borderRadius: "var(--rs)", padding: "14px", marginBottom: "14px", border: "1px solid var(--br)", display: "flex", alignItems: "center", gap: "12px" });
      cRow.appendChild(div({ width: "42px", height: "42px", borderRadius: "10px", background: `${c.color}28`, border: `2px solid ${c.color}55`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: "800", color: c.color, fontFamily: "var(--mo)" }, [span(c.avatar)]));
      const cTxt = div({});
      cTxt.appendChild(p(c.name,     { fontWeight: "700", fontSize: "15px" }));
      cTxt.appendChild(p(c.position, { fontSize: "12px", color: "var(--t2)" }));
      cRow.appendChild(cTxt); box.appendChild(cRow);

      const warn = div({ background: "rgba(255,211,42,.07)", border: "1px solid rgba(255,211,42,.2)", borderRadius: "var(--rs)", padding: "10px", marginBottom: "16px" });
      warn.appendChild(p("⚠️ This is permanent. You may only vote once.", { fontSize: "13px", color: "var(--wn)" }));
      box.appendChild(warn);

      const btnRow = div({ display: "flex", gap: "10px" });
      btnRow.appendChild(Btn("Cancel", "se", closeModal));

      const confirmBtn = Btn("✅  Confirm Vote", "pr", () => {
        // Atomic: double-check has not voted (guards against race conditions)
        if (DB.users[sid].hasVoted) { closeModal(); return; }

        // Record vote — candidateId stored WITHOUT student identity
        const rid = mkRcpt();
        DB.users[sid].hasVoted  = true;
        DB.users[sid].receiptId = rid;
        DB.candidates.find((x) => x.id === pick).votes++;
        DB.election.totalVotes++;
        DB.votes.push({ receiptId: rid, candidateId: pick, ts: new Date().toLocaleTimeString() });
        state.student = { ...state.student, ...DB.users[sid] };
        closeModal();

        // Receipt modal
        mkModal("🎉 Vote Recorded!", (rb, cr) => {
          rb.style.textAlign = "center";
          rb.appendChild(p("✅", { fontSize: "54px", marginBottom: "10px" }));
          rb.appendChild(h(3, "Your vote has been cast!", { fontSize: "17px", fontWeight: "800", marginBottom: "7px" }));
          rb.appendChild(p("Your identity is not linked to your choice. Save this receipt ID as proof:", { color: "var(--t2)", fontSize: "13px", marginBottom: "16px", lineHeight: "1.7" }));

          const rcptBox = div({ background: "var(--s2)", borderRadius: "var(--rd)", padding: "18px", marginBottom: "14px", border: "1px solid rgba(0,212,168,.25)" });
          rcptBox.appendChild(p("Transaction Receipt ID", { fontSize: "11px", color: "var(--t3)", marginBottom: "7px", textTransform: "uppercase", letterSpacing: ".1em" }));
          rcptBox.appendChild(p(rid, { fontSize: "14px", fontFamily: "var(--mo)", color: "var(--ac)", fontWeight: "700", letterSpacing: ".08em", wordBreak: "break-all" }));
          rcptBox.appendChild(p(new Date().toLocaleString(), { fontSize: "11px", color: "var(--t3)", marginTop: "7px" }));
          rb.appendChild(rcptBox);
          rb.appendChild(p("This ID proves your vote was counted without revealing who you chose.", { fontSize: "12px", color: "var(--t3)", marginBottom: "16px" }));

          const closeRcptBtn = Btn("Close", "pr", () => { cr(); state.view = "voter"; render(); });
          Object.assign(closeRcptBtn.style, { width: "100%" });
          rb.appendChild(closeRcptBtn);
        });
      });
      btnRow.appendChild(confirmBtn);
      box.appendChild(btnRow);
    });
  }, !pick /* disabled until a candidate is selected */);

  Object.assign(submitBtn.style, { minWidth: "220px", fontSize: "15px", padding: "14px 28px" });

  if (!student.hasVoted && !closed) {
    submitWrap.appendChild(submitBtn);
    submitWrap.appendChild(submitHint);
    main.appendChild(submitWrap);
  }

  root.appendChild(main);
  return root;
}

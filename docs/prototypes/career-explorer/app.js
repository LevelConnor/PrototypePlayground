// Career Explorer — application code.
// Extracted from index.html. Loaded by the bottom <script src> tag.

/* ══════════════════════════════════════════
   SINGLE GLOBAL CLICK HANDLER — no inline onclick anywhere
══════════════════════════════════════════ */
document.addEventListener('click', function(e) {
  const t = e.target;

  // ZIP SEARCH
  const zipBtn = t.closest('[id^="zip-btn-"]');
  if (zipBtn) { handleZipSearch(zipBtn.dataset.pid, zipBtn.dataset.career, zipBtn.dataset.code); return; }

  // NAV TABS
  const nt = t.closest('.nt');
  if (nt && nt.dataset.tab) { switchTab(nt.dataset.tab, nt); return; }

  // Any element carrying data-tab-target jumps to the named panel —
  // Home link cards on the landing, and 'Back to Home' buttons on
  // sub-panels all route through here.
  const tabJump = t.closest('[data-tab-target]');
  if (tabJump) {
    switchTab(tabJump.dataset.tabTarget);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }
  // Next Moves card -> open the matching modal.
  const nmCard = t.closest('.home-nm-card[data-nm]');
  if (nmCard) { openNextMoves(nmCard.dataset.nm); return; }
  // Next Moves modal close (X button OR clicking the backdrop directly).
  if (t.closest('[data-nm-close]')) { closeNextMoves(); return; }
  if (t.dataset && t.dataset.nmBackdrop !== undefined) { closeNextMoves(); return; }
  // 'View Career' button inside a Next Moves career block — closes the
  // Next Moves modal and opens the full career details modal for that
  // code. Small delay before openLiveDetail so the close transition
  // has room to release the overflow lock cleanly.
  const nmView = t.closest('[data-nm-view]');
  if (nmView) {
    const code = nmView.dataset.nmView;
    closeNextMoves();
    setTimeout(() => openLiveDetail(code, 'nm'), 60);
    return;
  }

  // ASSESSMENT rating buttons
  const sb = t.closest('.sb');
  if (sb && sb.closest('#qwrap')) { rate(sb); return; }

  // ASSESSMENT submit / reset / mode toggle
  if (t.id === 'btn-submit') { submitAssessment(); return; }
  if (t.id === 'btn-reset') { resetAssessment(); return; }
  if (t.id === 'btn-autofill') { autofillAssessment(); return; }
  // t.closest — the button contains an SVG icon whose child <path>
  // becomes the click target, so a strict t.id check would miss those.
  if (t.closest('#btn-retake')) { resetAssessment(); return; }
  if (t.id === 'btn-explore-matches') { goToSearch(); return; }
  if (t.id === 'btn-go-assess') { goToAssessment(); return; }

  // SAVE BUTTONS
  if (t.id === 'btn-copy-link') { copyLink(); return; }
  if (t.id === 'btn-email') { emailResults(); return; }
  if (t.id === 'btn-print') { printResults(); return; }
  if (t.id === 'btn-homescreen') { addToHomeScreen(); return; }
  if (t.id === 'btn-copy-email-msg') { copyEmailContent(); return; }
  if (t.id === 'btn-copy-email-link') { copyEmailLink(); return; }
  if (t.id === 'btn-close-email') { document.getElementById('email-modal').classList.remove('open'); return; }
  if (t.id === 'btn-close-hsc') { document.getElementById('hsc-modal').classList.remove('open'); return; }

  // TRAY
  // Any element carrying data-open-tray opens the Saved Careers tray.
  // Lets the header heart + the in-page hearts (Search Careers, Career
  // Clusters top rows) share a single handler.
  if (t.closest('[data-open-tray]')) { openTray(); return; }
  if (t.id === 'btn-theme') { toggleTheme(); return; }
  if (t.id === 'btn-close-tray') { closeTray(); return; }
  if (t.id === 'tov') { closeTray(); return; }
  if (t.id === 'btn-tray-link') { copyTrayLink(); return; }
  if (t.id === 'btn-tray-print') { window.print(); return; }

  // Bright Outlook "Show more" pagination button
  if (t.id === 'bo-more-btn') { loadBrightOutlookPage(); return; }

  // Interest profile expand/collapse (top 3 ↔ all 6)
  if (t.closest('.ip-switch')) { toggleIpShowAll(); return; }

  // Filter-bar dropdown toggle (Work style / Education / Salary buttons)
  const fbBtn = t.closest('.fb-btn');
  if (fbBtn) { toggleFb(fbBtn.parentElement); return; }

  // Education option chip
  const eduOpt = t.closest('.edu-opt[data-edu]');
  if (eduOpt) {
    eduZoneMin = parseInt(eduOpt.dataset.edu) || 0;
    updateFbValueLabels();
    applyClientFilters();
    return;
  }

  // Salary option chip
  const salOpt = t.closest('.sal-opt[data-sal]');
  if (salOpt) {
    minSalary = parseInt(salOpt.dataset.sal) || 0;
    updateFbValueLabels();
    applyClientFilters();
    return;
  }

  // Work-style (RIASEC) chip. Toggle membership in activeR.
  const rc = t.closest('.rc[data-r]');
  if (rc && rc.dataset.r) {
    const letter = rc.dataset.r;
    if (activeR.has(letter)) activeR.delete(letter);
    else activeR.add(letter);
    if (activeR.size > 0) document.getElementById('sinput').value = '';
    updateFbValueLabels();
    updateSearch();
    return;
  }

  // Click outside any filter-bar panel → close all open ones.
  if (!t.closest('.fb')) closeAllFbs();

  // Career cluster card — opens detail section
  const clusCard = t.closest('.cluster-card[data-cluster]');
  if (clusCard && clusCard.dataset.cluster) {
    openClusterDetail(clusCard.dataset.cluster);
    return;
  }

  // Close cluster detail
  if (t.id === 'cluster-detail-close') { closeClusterDetail(); return; }

  // Sub-cluster chip — toggles a client-side title-keyword filter over
  // the loaded cluster cards. Clicking the active chip again clears it.
  // (O*NET's API doesn't expose sub-cluster codes for direct filtering,
  // so we tokenize the chip label and match against career titles.)
  const sub = t.closest('.sub-chip[data-sub]');
  if (sub) {
    const subVal = sub.dataset.sub;
    if (activeClusterSub === subVal) {
      activeClusterSub = '';
      sub.classList.remove('active');
    } else {
      activeClusterSub = subVal;
      document.querySelectorAll('.sub-chip').forEach(c => c.classList.remove('active'));
      sub.classList.add('active');
    }
    applyClusterSubFilter();
    return;
  }

  // Cluster-page pagination ("Show more" inside #cluster-list-more)
  if (t.id === 'cluster-list-more-btn' && loadedClusterCode_v2) {
    loadClusterIntoTarget(loadedClusterCode_v2, activeCluster, 'cluster-list', 'cluster-rcount', 'cluster-list-more');
    return;
  }

  // Career card click — opens modal. Bookmark + star buttons on the
  // card stop propagation so they don't also trigger the modal open.
  const ccard = t.closest('.ccard[data-live-code]');
  if (ccard) {
    const star = t.closest('.ccard-star');
    if (star) {
      e.stopPropagation();
      toggleTopPick(ccard.dataset.liveCode);
      return;
    }
    const bm = t.closest('.ccard-bm');
    if (bm) {
      e.stopPropagation();
      toggleLiveSave(ccard.dataset.liveCode);
      return;
    }
    openLiveDetail(ccard.dataset.liveCode, ccard.dataset.prefix || 'sd');
    return;
  }

  // Modal close: X button or backdrop click
  if (t.closest('[data-cmodal-close]')) { closeModal(); return; }
  if (t.dataset && t.dataset.cmodalBackdrop !== undefined) { closeModal(); return; }
  // (clicking inside .cmodal itself shouldn't close — closest('[data-cmodal-backdrop]')
  // would also match the overlay container; restrict to the overlay element only)

  // Modal save button
  const msave = t.closest('.cmodal-save');
  if (msave && msave.dataset.liveCode) { toggleLiveSave(msave.dataset.liveCode); return; }

  // Modal tabs
  const mtab = t.closest('.cmodal-tab[data-mtab]');
  if (mtab) {
    document.querySelectorAll('.cmodal-tab').forEach(b => b.classList.toggle('active', b === mtab));
    document.querySelectorAll('.cmodal-pane').forEach(p => { p.hidden = (p.dataset.mpane !== mtab.dataset.mtab); });
    return;
  }

  // Related-career cards now share the .ccard[data-live-code] markup —
  // the handler above already routes their clicks. No extra wiring needed.
});

// Close modal on Esc
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    const o = document.getElementById('cmodal-overlay');
    if (o && o.classList.contains('open')) closeModal();
  }
});

// Search input — use input event
document.addEventListener('input', function(e) {
  if (e.target.id === 'sinput') doSearch();
  else if (e.target.id === 'cluster-sinput') {
    clusterKeyword = (e.target.value || '').trim();
    // Reset the display window so the first page of the new filtered
    // result set is what the user sees.
    clusterDisplay_v2 = CLUSTER_PAGE_SIZE;
    repaintCluster();
  }
});
/* ══ O*NET PROXY (Cloudflare Worker) ══ */
const ONET_PROXY = 'https://onet-proxy.c-irwin.workers.dev';
async function onetGet(path) {
  const res = await fetch(`${ONET_PROXY}${path}`, { headers: { 'Accept': 'application/json' } });
  if (!res.ok) throw new Error(`O*NET ${res.status}: ${path}`);
  return res.json();
}
// Debounce wrapper for keystroke searches
function debounce(fn, ms) {
  let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
}

/* ══ STATE ══ */
const saved = new Set();
// Top-picks — a promoted subset of `saved`. Bare career codes (not
// prefixed with 'live-' like `saved` uses). Capped at 5 by
// toggleTopPick. Persisted alongside saved in the URL restore payload.
const topPicks = new Set();
const TOP_PICKS_MAX = 5;
// Answers keyed by O*NET question index (1..60). Value: {area, val}.
// Keyed by index (not row position) so switching Quick <-> Full preserves
// what the user has already answered.
const answered = new Map();
// O*NET Interest Profiler items, loaded once at boot from /ip_questions.
// Each item: {index: 1..60, area: 'realistic'|..., text: '...'}.
let IP_QUESTIONS = [];
// O*NET area name -> single-letter RIASEC key used everywhere else.
const AREA_KEY = {
  realistic:'R', investigative:'I', artistic:'A',
  social:'S', enterprising:'E', conventional:'C',
};
// Section headers per area, in canonical R-I-A-S-E-C order.
const AREA_SECTIONS = [
  { key:'realistic',     letter:'R', label:'Section 1 — Hands-On & Technical' },
  { key:'investigative', letter:'I', label:'Section 2 — Research & Analysis' },
  { key:'artistic',      letter:'A', label:'Section 3 — Creative & Artistic' },
  { key:'social',        letter:'S', label:'Section 4 — Helping & Teaching' },
  { key:'enterprising',  letter:'E', label:'Section 5 — Leading & Persuading' },
  { key:'conventional',  letter:'C', label:'Section 6 — Organizing & Managing' },
];
let lastResults = null;
// O*NET-style 0-40 scores per RIASEC dimension, computed from the same
// answers as lastResults. O*NET's Mini Interest Profiler convention:
// subtract 1 from each rating (so 1-5 -> 0-4), sum across answered items
// in that area, then normalize to 0-40. With 5 questions per area the
// raw max is 20, scaled to 40 by ×2.
let lastOnetScores = null;
const activeR = new Set();      // active RIASEC chips (work-style filter)
let activeCluster = '';         // active cluster filter (one at a time)
let activeClusterSub = '';      // active sub-cluster chip (title-keyword filter)
let minSalary = 0;              // 0 = Any. Filters cards client-side by detailCache median.
let eduZoneMin = 0;             // 0 = Any. Filters cards client-side by O*NET job_zone (1-5).
// RIASEC palette. Updated for the new light-mode page: E and C used to be
// pale steel-blue and pale yellow (designed against a dark background) and
// were illegible on white. Replaced with deeper, well-saturated tones that
// keep the same semantic associations.
// Vivid RIASEC palette for the quiz-results cards (matches the design spec).
// All chosen so dark navy text reads cleanly on them.
// Vivid pill backgrounds for each RIASEC area. Re-mapped so A=yellow,
// S=green, C=pink to match the latest design spec.
const BC = {R:'#0083FF',I:'#FF7A1A',A:'#FFD810',S:'#68F4B8',E:'#A78BFA',C:'#F49FFB'};
// Short descriptions tuned to fit on a single line inside the result pill
// at its minimum width (~440px). Don't extend these without re-tuning min.
// Curated typical certifications / licenses per SOC code. Keys are
// 6-digit (specific occupation), 4-digit (family), or 2-digit (broad
// category). Longest-prefix wins. Each entry is a list because some
// careers have multiple canonical credentials. Not exhaustive by
// design — real coverage would come from CareerOneStop's cert API.
const CERT_MAP = {
  // Healthcare
  '29-1141': [{ name:'Registered Nurse (RN) License',                 issuer:'State Board of Nursing (NCLEX-RN via NCSBN)',           notes:'Required in every US state before practicing.' }],
  '29-2061': [{ name:'LPN / LVN License',                             issuer:'State Board of Nursing (NCLEX-PN)',                     notes:'Complete an accredited practical nursing program to sit for the exam.' }],
  '29-1216': [{ name:'State Medical License',                         issuer:'State Medical Board (USMLE or COMLEX)',                 notes:'MD or DO degree + residency + all three USMLE steps typical.' }],
  '29-1051': [{ name:'Pharmacist License',                            issuer:'State Board of Pharmacy (NAPLEX + MPJE)',               notes:'Pharm.D. degree required for exam eligibility.' }],
  '29-1071': [{ name:'Physician Assistant Certification (PA-C)',      issuer:'NCCPA (PANCE exam)',                                    notes:'Master\'s from an ARC-PA accredited program required.' }],
  '29-1123': [{ name:'Physical Therapy License',                      issuer:'State Board of Physical Therapy (NPTE)',                notes:'Doctor of Physical Therapy (DPT) degree required.' }],
  '29-1122': [{ name:'Occupational Therapy License + NBCOT',          issuer:'State licensing board + NBCOT',                         notes:'Master\'s or doctoral OT degree required.' }],
  '29-1131': [{ name:'State Veterinary License',                      issuer:'State Veterinary Board (NAVLE)',                        notes:'DVM degree required.' }],
  '29-1021': [{ name:'State Dental License',                          issuer:'State Dental Board (INBDE)',                            notes:'DDS or DMD degree required.' }],
  '29-2011': [{ name:'ASCP Board of Certification (MLS or MLT)',      issuer:'American Society for Clinical Pathology',               notes:'Some states also require a separate license.' }],
  '29-2034': [{ name:'ARRT Registration',                             issuer:'American Registry of Radiologic Technologists',         notes:'Most states require an ARRT-registered credential.' }],
  '29-2055': [{ name:'Certified Surgical Technologist (CST)',         issuer:'NBSTSA',                                                notes:'Required in some states; strongly recommended elsewhere.' }],
  // Legal
  '23-1011': [{ name:'State Bar License',                             issuer:'State Bar (Bar Exam + character review)',               notes:'JD from an ABA-accredited law school typically required.' }],
  // Finance
  '13-2011': [{ name:'Certified Public Accountant (CPA)',             issuer:'State Board of Accountancy (Uniform CPA Exam)',         notes:'Required to sign audit reports and for many senior roles.' }],
  '13-2051': [{ name:'FINRA Series 7 (for broker-dealer roles)',      issuer:'FINRA',                                                 notes:'CFA is a common voluntary credential for buy-side / research roles.' }],
  // Education
  '25-2':   [{ name:'State Teaching License / Certification',        issuer:'State Department of Education',                         notes:'Bachelor\'s degree + student teaching + state exams (Praxis or state equivalent) typical.' }],
  // Skilled trades
  '47-2111':[{ name:'Journeyman / Master Electrician License',        issuer:'State Licensing Board',                                 notes:'Apprenticeship hours + a state exam.' }],
  '47-2152':[{ name:'State Plumber License',                          issuer:'State Plumbing Board',                                  notes:'Apprenticeship hours + a state exam.' }],
  '49-9021':[{ name:'EPA Section 608 Certification',                  issuer:'US EPA (approved testing organizations)',               notes:'Required to handle refrigerants. Many states also license HVAC techs.' }],
  // Public safety
  '33-3051':[{ name:'State POST Certification',                       issuer:'State Peace Officer Standards and Training board',      notes:'Complete a state-approved police academy.' }],
  '33-2011':[{ name:'Firefighter I / II Certification',               issuer:'IFSAC or Pro Board accredited program',                 notes:'EMT certification is also commonly required.' }],
  // Transportation
  '53-3032':[{ name:'Commercial Driver License (CDL)',                issuer:'State DMV (CDL knowledge + skills tests)',              notes:'Class A CDL for most tractor-trailer roles; Class B for straight trucks.' }],
  '53-2020':[{ name:'FAA Airline Transport Pilot (ATP) Certificate',  issuer:'Federal Aviation Administration',                       notes:'Requires 1,500 flight hours + a type rating.' }],
  '53-2011':[{ name:'FAA Commercial Pilot Certificate',               issuer:'Federal Aviation Administration',                       notes:'ATP required for airline captain roles.' }],
  // Real estate
  '41-9022':[{ name:'State Real Estate Sales License',                issuer:'State Real Estate Commission',                          notes:'Pre-licensing coursework + a state exam.' }],
  '41-9021':[{ name:'State Real Estate Broker License',               issuer:'State Real Estate Commission',                          notes:'Typically 2+ years as a sales agent before qualifying.' }],
  // Personal services
  '39-5012':[{ name:'State Cosmetology License',                      issuer:'State Board of Cosmetology',                            notes:'Accredited cosmetology program + a state exam.' }],
  // Computing (typically no license — surface the common voluntary certs)
  '15-12':  [{ name:'No license required',                            issuer:'Common voluntary certs (AWS, Azure, GCP, CompTIA, CISSP, PMP)', notes:'Not legally required — used to demonstrate competency to employers.' }],
};

function certsForCode(code) {
  if (!code) return [];
  const c6 = code.slice(0, 7);   // '29-1141'
  const c4 = code.slice(0, 5);   // '29-11'
  const c2 = code.slice(0, 2);   // '29'
  return CERT_MAP[c6] || CERT_MAP[c4] || CERT_MAP[c2] || [];
}

const RI = {
  R:{name:'Realistic — The Builder',       short:'Realistic',     desc:'Hands-on work, tools, and physical tasks.',
     draw:'solving practical, hands-on problems',                 look:'hands-on work you can see and touch'},
  I:{name:'Investigative — The Thinker',   short:'Investigative', desc:'Research, analysis, and complex problem-solving.',
     draw:'digging into ideas, research, and analysis',           look:'intellectual challenges you can go deep on'},
  A:{name:'Artistic — The Creator',        short:'Artistic',      desc:'Design, writing, and creative expression.',
     draw:'creative expression and original design',              look:'creative freedom and room for original ideas'},
  S:{name:'Social — The Helper',           short:'Social',        desc:'Teaching, healthcare, and supporting others.',
     draw:"working closely with — and helping — other people",    look:'real connection with the people you serve'},
  E:{name:'Enterprising — The Leader',     short:'Enterprising',  desc:'Business, sales, and persuading others.',
     draw:'leading, persuading, and driving outcomes',            look:'influence, ownership, and space to lead'},
  C:{name:'Conventional — The Organizer',  short:'Conventional',  desc:'Data, finance, and structured processes.',
     draw:'organizing information and doing precise, methodical work',
     look:'clear structure, accuracy, and reliable systems'},
};

// Compose a personalized blurb from the top-3 RIASEC areas. Returns raw
// HTML — inserted directly into the results card. `sorted` is the same
// [[letter, score]] array renderInterestProfile receives.
function ipBlurb(sorted) {
  const top = sorted.slice(0, 3).map(([k]) => k);
  if (top.length < 3) return '';
  const [k1, k2, k3] = top;
  const oxford = (a, b, c) => `${a}, ${b}, and ${c}`;
  const areas = oxford(
    `<strong>${RI[k1].short}</strong>`,
    `<strong>${RI[k2].short}</strong>`,
    `<strong>${RI[k3].short}</strong>`
  );
  const draws = oxford(RI[k1].draw, RI[k2].draw, RI[k3].draw);
  const looks = oxford(RI[k1].look, RI[k2].look, RI[k3].look);
  return `<details class="ip-blurb" open>
    <summary>Explain My Results</summary>
    <div class="ip-blurb-body">
      Your top three — ${areas} — point you toward ${draws}. When you're weighing careers, favor roles that offer ${looks}.
    </div>
  </details>`;
}

/* ══ TOAST ══ */
function toast(m) {
  const t = document.getElementById('toast');
  t.textContent = m; t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2600);
}

/* ══ NAV ══ */
function switchTab(id, btn) {
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nt').forEach(t => t.classList.remove('active'));
  const panel = document.getElementById('panel-' + id);
  if (panel) panel.classList.add('active');
  // The top nav is gone (users navigate via Home cards + Back buttons),
  // but keep this branch working for any legacy .nt tab still on the
  // page.
  if (btn) btn.classList.add('active');
  else {
    const tab = document.querySelector('.nt[data-tab="'+id+'"]');
    if (tab) tab.classList.add('active');
  }
}
function goToAssessment() { switchTab('assessment'); window.scrollTo({top:0,behavior:'smooth'}); }
function goToSearch() {
  switchTab('search');
  window.scrollTo({top:0,behavior:'smooth'});
}
/* ══ ASSESSMENT ══ */
// The whole O*NET Interest Profiler item bank (60 items). The quiz-
// mode toggle is gone — every user takes the full assessment.
function activeItems() {
  return IP_QUESTIONS;
}

// Update the "N of X answered" caption and the top progress bar based on
// how many of the current active items are answered.
function updateAnsweredUI() {
  const items = activeItems();
  const total = items.length || 30;
  const activeIdx = new Set(items.map(q => q.index));
  let n = 0;
  answered.forEach((_v, k) => { if (activeIdx.has(k)) n++; });
  const qans = document.getElementById('qans');
  if (qans) qans.textContent = n + ' of ' + total + ' answered';
  const pf = document.getElementById('pf');
  if (pf) pf.style.width = Math.round((n / total) * 100) + '%';
}

function rate(btn) {
  const row = btn.closest('.qr');
  row.querySelectorAll('.sb').forEach(b => b.className = 'sb');
  btn.classList.add('s' + btn.dataset.v);
  const qIndex = parseInt(row.dataset.qidx, 10);
  answered.set(qIndex, { area: row.dataset.t, val: parseInt(btn.dataset.v, 10) });
  updateAnsweredUI();
}

// Render the quiz into #qwrap from the O*NET item bank. Called at boot
// after /ip_questions resolves, and every time the user toggles quiz mode.
// Preserves any answers already in the answered map — .sb buttons for
// previously-rated items are pre-selected via .s{val} class.
function renderQuiz() {
  const wrap = document.getElementById('qwrap');
  if (!wrap) return;
  const items = activeItems();
  if (!items.length) {
    wrap.innerHTML = '<div style="text-align:center;padding:60px 20px;color:var(--ts);font-size:15px">Loading questions from O*NET…</div>';
    return;
  }
  const byArea = {};
  items.forEach(q => { (byArea[q.area] = byArea[q.area] || []).push(q); });
  wrap.innerHTML = AREA_SECTIONS.map(sec => {
    const areaItems = byArea[sec.key] || [];
    if (!areaItems.length) return '';
    const rows = areaItems.map(q => {
      const prior = answered.get(q.index);
      const btn = (v) => `<button class="sb${prior && prior.val === v ? ' s' + v : ''}" data-v="${v}">${v}</button>`;
      return `<div class="qr" data-t="${sec.letter}" data-qidx="${q.index}">
        <span class="qt">${q.text}</span>
        <div class="qs">${btn(1)}${btn(2)}${btn(3)}${btn(4)}${btn(5)}</div>
      </div>`;
    }).join('');
    return `<div class="sdiv"><span class="sdl">${sec.label}</span><div class="sdln"></div></div>${rows}`;
  }).join('');
  updateAnsweredUI();
}

// Fetch the O*NET Interest Profiler item bank once and render.
async function initQuiz() {
  if (IP_QUESTIONS.length) { renderQuiz(); return; }
  try {
    const data = await onetGet('/ip_questions');
    IP_QUESTIONS = (data && data.question) || [];
  } catch (e) {
    console.error('Failed to load IP questions', e);
    const wrap = document.getElementById('qwrap');
    if (wrap) wrap.innerHTML =
      '<div style="text-align:center;padding:60px 20px;color:var(--ts);font-size:15px">Couldn\'t load questions. Try again later.</div>';
    return;
  }
  renderQuiz();
}

function submitAssessment() {
  const items = activeItems();
  const activeIdx = new Set(items.map(q => q.index));
  const tot={R:0,I:0,A:0,S:0,E:0,C:0}, cnt={R:0,I:0,A:0,S:0,E:0,C:0};
  let answeredCount = 0;
  answered.forEach((v, k) => {
    if (!activeIdx.has(k)) return;
    tot[v.area] += v.val;
    cnt[v.area]++;
    answeredCount++;
  });
  // Require ~2/3 completion. 30-item quiz -> 20 min. 60-item -> 40 min.
  const min = Math.max(6, Math.floor(items.length * 2 / 3));
  if (answeredCount < min) {
    alert(`Please answer at least ${min} of ${items.length} questions.`);
    return;
  }
  const avgs = {}, onet = {};
  Object.keys(tot).forEach(k => {
    avgs[k] = cnt[k] ? +(tot[k]/cnt[k]).toFixed(2) : 0;
    // O*NET 0-40 score: mean of (rating-1) across answered items, then ×10
    // (since each (rating-1) is 0-4, the mean is 0-4, ×10 = 0-40).
    onet[k] = cnt[k] ? Math.round(((tot[k] - cnt[k]) / cnt[k]) * 10) : 0;
  });
  lastResults = avgs;
  lastOnetScores = onet;
  // Switch to the combined Find My Career tab, populate the interest profile,
  // auto-select the user's top-3 work-style chips, switch the filter view to
  // the Work style tab, and run the live match.
  switchTab('search');
  syncProfileUI();
  const sorted = Object.entries(avgs).sort((a,b) => b[1]-a[1]);
  activeR.clear();
  sorted.slice(0,3).forEach(([k]) => activeR.add(k));
  syncRiasecChipsUI();
  updateFbValueLabels();
  // Clear any existing keyword search so RIASEC mode is the entry point.
  document.getElementById('sinput').value = '';
  updateSearch();
  window.scrollTo({top:0,behavior:'smooth'});
}

// Sync the interest-profile card + the save-your-profile row to whatever's
// in lastResults. Called when the assessment completes and on initial load
// (in case state was restored from a saved URL).
function syncProfileUI() {
  const targets = document.querySelectorAll('.interest-profile');
  const homeCta = document.getElementById('home-quiz-cta');
  const homeResultsSection = document.getElementById('home-results-section');
  // Search-panel headline needs to stay hidden while the results card is
  // in place there — otherwise the page has 'Explore Careers' above
  // 'Your Results' back-to-back.
  const searchPt = document.getElementById('search-pt');
  const searchPs = document.getElementById('search-ps');
  // The legacy standalone .sav row is now superseded by the action buttons
  // embedded inside .ip-card. Force-hide it regardless of state.
  const saveEl = document.getElementById('profile-save');
  if (saveEl) saveEl.style.display = 'none';
  if (lastResults) {
    // Quiz taken -> results card replaces the Get-Matched card on Home
    // (wrapped in the "Your Interest Assessment Results" section), and
    // lands at the top of Explore Careers.
    if (homeCta) homeCta.style.display = 'none';
    if (homeResultsSection) homeResultsSection.style.display = '';
    if (searchPt) searchPt.style.display = 'none';
    if (searchPs) searchPs.style.display = 'none';
    const sorted = Object.entries(lastResults).sort((a,b) => b[1] - a[1]);
    renderInterestProfile(sorted);
  } else {
    // No quiz -> Get-Matched card is the primary CTA on Home. On Explore
    // Careers the search-only interest-profile slot gets the small CTA
    // fallback card (previous behavior). Home results section hidden.
    if (homeCta) homeCta.style.display = '';
    if (homeResultsSection) homeResultsSection.style.display = 'none';
    if (searchPt) searchPt.style.display = '';
    if (searchPs) searchPs.style.display = '';
    // Empty-state CTA on the Search Careers page uses the same home-card
    // component the Home landing uses, so the visual language across the
    // app is identical.
    const ctaHtml = `
      <button class="home-card" data-tab-target="assessment" type="button">
        <div class="home-card-icon home-icon-quiz" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.94 15.5A2 2 0 0 0 8.5 14.06L2.36 12.48a.5.5 0 0 1 0-.96L8.5 9.94A2 2 0 0 0 9.94 8.5l1.58-6.14a.5.5 0 0 1 .96 0L14.06 8.5A2 2 0 0 0 15.5 9.94l6.14 1.58a.5.5 0 0 1 0 .96L15.5 14.06a2 2 0 0 0-1.44 1.44l-1.58 6.14a.5.5 0 0 1-.96 0z"/></svg>
        </div>
        <div class="home-card-body">
          <h2 class="home-card-title">Take The Interests Assessment</h2>
          <p class="home-card-desc">Answer questions and get a personalized list of careers that match your interests.</p>
        </div>
        <span class="home-card-cta">Take The Quiz <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m13 5 7 7-7 7"/></svg></span>
      </button>`;
    targets.forEach(el => {
      // Home's slot has data-hide-when-empty so it stays out of the way
      // when no quiz has been taken (the Get-Matched card serves the
      // purpose there). Others show the fallback CTA.
      if (el.dataset.hideWhenEmpty !== undefined) {
        el.style.display = 'none';
        el.innerHTML = '';
      } else {
        el.style.display = '';
        el.innerHTML = ctaHtml;
      }
    });
  }
}

// Single unified visualization for the assessment results header — replaces
// the old top-3 ribbon + bubble chart + colour key + description grid.
// Each row carries letter avatar + name + descriptor + bar + numeric score,
// sorted high → low, with the top 3 emphasized and the remaining muted.
// Tracks whether the user has expanded the interest profile to show all 6
// Toggle state: false = show all 6 (default), true = show top 3 with
// heights proportional to the user's RIASEC scores.
let ipShowAll = false;
// Stash the sorted scores so the toggle handler can recompute heights
// without re-fetching anything.
let ipSorted = null;

function renderInterestProfile(sorted) {
  // Multiple containers can hold the results card (Home landing +
  // Explore Careers). renderInterestProfile paints the same markup
  // into every '.interest-profile' element on the page.
  const targets = document.querySelectorAll('.interest-profile');
  if (!targets.length) return;
  ipSorted = sorted;

  // Each row is a single colored pill whose width is proportional to the
  // O*NET 0-40 score, scaled so the TOP result is always full pill width.
  // Pills below the top scale down by (score / topScore). The score number
  // sits OUTSIDE the pill on the right. The pill has a CSS min-width that
  // keeps the description visible even when the score is very low.
  // Score now lives INSIDE the pill, so the top pill can fill 100 % of
  // the row width.
  const MAX_PCT = 100;
  const topScore = sorted.length
    ? ((lastOnetScores && lastOnetScores[sorted[0][0]] != null)
        ? lastOnetScores[sorted[0][0]]
        : Math.round(((sorted[0][1] - 1) / 4) * 40))
    : 0;
  const rowFor = ([k, v], i) => {
    const score = (lastOnetScores && lastOnetScores[k] != null)
      ? lastOnetScores[k]
      : Math.round(((v - 1) / 4) * 40);
    // Top pill = MAX_PCT; everything else scales relative to it.
    const ratio = topScore > 0 ? (score / topScore) : 0;
    const pct = Math.max(8, Math.min(MAX_PCT, Math.round(ratio * MAX_PCT)));
    return `<div class="ip-row" data-pos="${i}">
      <div class="ip-row-pill" style="--rc:${BC[k]};--pw:${pct}%">
        <div class="ip-row-avatar">${k}</div>
        <div class="ip-row-body">
          <div class="ip-row-name">${RI[k].short}</div>
          <div class="ip-row-desc">${RI[k].desc}</div>
        </div>
        <span class="ip-row-score">${score}</span>
      </div>
    </div>`;
  };

  // Retake icon — the only footer action still on the card.
  const iconRetake = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0 1 15.5-6.3L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15.5 6.3L3 16"/><path d="M3 21v-5h5"/></svg>`;

  const cardHtml = `
    <div class="ip-card">
      <div class="ip-layout">
        <div class="ip-header">
          <h2 class="ip-title">Your Career Quiz Results</h2>
          <p class="ip-intro">Based on your answers, these are the work styles that energize you most. Scores range from 0-40.</p>
        </div>
        <div class="ip-stack">
          ${sorted.map(rowFor).join('')}
        </div>
        ${ipBlurb(sorted)}
        <div class="ip-foot">
          <div class="ip-toggle-pill">
            <span>Show Full Results</span>
            <button class="ip-switch" type="button" aria-pressed="${ipShowAll}">
              <span class="ip-switch-dot"></span>
            </button>
          </div>
          <div class="ip-foot-r">
            <button class="ip-action-pill" id="btn-retake">Retake Quiz ${iconRetake}</button>
          </div>
        </div>
      </div>
    </div>`;
  targets.forEach(el => { el.innerHTML = cardHtml; el.style.display = ''; });

  applyIpVisibility();
}

// Show all 6 rows or just the top 3, with a max-height collapse on rows 4-6.
function applyIpVisibility() {
  if (!ipSorted) return;
  // Iterate PER stack — a flat querySelectorAll across .ip-row would treat
  // Home + Explore Careers stacks as one 12-row list, hiding every row of
  // the second stack. Each .ip-stack keeps its own top-3 visible.
  document.querySelectorAll('.ip-stack').forEach(stack => {
    stack.querySelectorAll('.ip-row').forEach((r, i) => {
      if (ipShowAll || i < 3) r.classList.remove('ip-row--hidden');
      else r.classList.add('ip-row--hidden');
    });
  });
}

function toggleIpShowAll() {
  ipShowAll = !ipShowAll;
  document.querySelectorAll('.ip-switch').forEach(sw => {
    sw.setAttribute('aria-pressed', String(ipShowAll));
  });
  applyIpVisibility();
}

// Fetch O*NET careers matching the user's top-3 Holland code. Falls back to
// top-2 then top-1 if the 3-letter combo is too rare. Renders the matches
// using the same renderLiveList card component as Search / Clusters / Bright
// Outlook so the look + behavior (inline drawer on click) is consistent.
async function renderAssessmentMatches(top3) {
  const mcards = document.getElementById('mcards');
  mcards.innerHTML = '<div style="color:var(--ts);font-size:15px;padding:18px 0">Finding careers that match your interests…</div>';

  const ladders = [top3.slice(0,3).join(''), top3.slice(0,2).join(''), top3[0]];
  let careers = [];
  for (const code of ladders) {
    if (!code) continue;
    try {
      const data = await onetGet(`/holland/${code}?end=5`);
      const occ = (data && data.occupation) || [];
      if (occ.length >= 3) { careers = occ.slice(0,5); break; }
      if (!careers.length) careers = occ.slice(0,5);
    } catch (e) { /* try next ladder */ }
  }

  if (!careers.length) {
    mcards.innerHTML = '<div style="color:var(--ts);font-size:15px;padding:18px 0">No matches available from O*NET right now. Try Explore Careers above.</div>';
    return;
  }

  // Map the Holland response to the shape renderLiveList expects.
  const list = careers.map(c => ({
    code: c.code,
    title: c.title,
    tags: {
      brightOutlook:  !!(c.tags && c.tags.bright_outlook),
      apprenticeship: !!(c.tags && c.tags.apprenticeship),
      stem:           !!(c.tags && c.tags.stem),
      green:          !!(c.tags && c.tags.green),
    },
  }));
  renderLiveList(list, 'mcards', 'mc');
}

function resetAssessment() {
  answered.clear();
  lastResults = null;
  lastOnetScores = null;
  renderQuiz(); // repaints .qr rows with no selection and resets the count
  // Revert the Home + Search Careers pages to their pre-quiz state
  // (hides the results card, restores the Get-Matched CTA card).
  syncProfileUI();
  const afw = document.getElementById('afw'); if (afw) afw.style.display = 'block';
  const rw = document.getElementById('rw');   if (rw) rw.style.display = 'none';
  // Route the user back into the quiz so they can start over.
  switchTab('assessment');
  window.scrollTo({top:0,behavior:'smooth'});
}

// Dev shortcut: random-fills every question 1–5 then submits. Wired to
// the floating 🎲 button at the bottom-right of the Assessment panel
// so we can spin through the assessment → results flow quickly.
function autofillAssessment() {
  document.querySelectorAll('.qr').forEach(row => {
    const val = 1 + Math.floor(Math.random() * 5);
    const btn = row.querySelector(`.sb[data-v="${val}"]`);
    if (btn) rate(btn);
  });
  // Tiny delay so the UI shows the answers being filled before the submit
  // tears down the assessment panel.
  setTimeout(submitAssessment, 120);
}

/* ══ SAVE / EMAIL / PRINT ══ */
function getStateUrl() {
  const data = btoa(JSON.stringify({
    results:  lastResults,
    saved:    [...saved],
    topPicks: [...topPicks],
  }));
  return location.href.split('?')[0] + '?state=' + data;
}
function copyLink() {
  navigator.clipboard.writeText(getStateUrl()).then(() => toast('✓ Results link copied!')).catch(() => toast('Copy failed'));
}
function emailResults() {
  if (!lastResults) return;
  const url = getStateUrl();
  const sorted = Object.entries(lastResults).sort((a,b)=>b[1]-a[1]);
  const top3 = sorted.slice(0,3).map(([k],i) => `${i+1}. ${RI[k].short}`).join(', ');
  const sl = saved.size
    ? [...saved]
        .filter(k => typeof k === 'string' && k.startsWith('live-'))
        .map(k => (savedMeta.get(k.slice('live-'.length)) || {}).title)
        .filter(Boolean).join(', ')
    : 'None yet';
  document.getElementById('email-top3').textContent = top3;
  document.getElementById('email-saved').textContent = sl;
  const urlEl = document.getElementById('email-url');
  urlEl.textContent = url; urlEl.dataset.url = url;
  document.getElementById('email-modal').classList.add('open');
}
function copyEmailContent() {
  const top3 = document.getElementById('email-top3').textContent;
  const sl = document.getElementById('email-saved').textContent;
  const url = document.getElementById('email-url').dataset.url;
  const text = ['Subject: My Career Assessment Results — Level All','','My top interest areas: '+top3,'Saved careers: '+sl,'','Return link (paste into browser):',url].join('\n');
  navigator.clipboard.writeText(text).then(() => toast('✓ Message copied — paste into an email!')).catch(() => toast('Copy failed'));
}
function copyEmailLink() {
  const url = document.getElementById('email-url').dataset.url;
  navigator.clipboard.writeText(url).then(() => toast('✓ Link copied!')).catch(() => toast('Copy failed'));
  document.getElementById('email-modal').classList.remove('open');
}
function printResults() {
  if (!lastResults) return;
  const url = getStateUrl();
  const d = new Date();
  const el = document.getElementById('print-date');
  if (el) el.textContent = 'Printed on ' + d.toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'});
  const fu = document.getElementById('print-restore-url');
  if (fu) fu.textContent = url;
  window.print();
}
function addToHomeScreen() {
  if (!lastResults) return;
  navigator.clipboard.writeText(getStateUrl()).catch(()=>{});
  document.getElementById('hsc-modal').classList.add('open');
}
function copyTrayLink() {
  navigator.clipboard.writeText(getStateUrl()).then(() => toast('✓ Save link copied!')).catch(() => toast('Copy failed'));
}

/* ══ SEARCH ══ */
// Debounce timer for search input
const detailCache = {};

// Debounced live search — fires after 300ms of input pause
const debouncedLiveSearch = debounce(_execLiveSearch, 300);

// Show/hide the default empty state (Bright Outlook list).
// Empty state is shown when the search input is empty.
function isSearchEmpty() {
  return !document.getElementById('sinput').value.trim();
}
function showEmptyState() {
  document.getElementById('search-empty-state').classList.add('show');
  document.getElementById('slist').innerHTML = '';
  document.getElementById('rcount').textContent = '';
  renderBrightOutlook();
}
function hideEmptyState() {
  document.getElementById('search-empty-state').classList.remove('show');
}

// Bright Outlook state: cached careers + paging cursor.
const BO_PAGE_SIZE = 15;
let boCareers = [];     // accumulated careers across all loaded pages
let boTotal = null;     // total available (set after first fetch)
let boLoading = false;

async function loadBrightOutlookPage() {
  if (boLoading) return;
  boLoading = true;
  const start = boCareers.length + 1;
  const end = start + BO_PAGE_SIZE - 1;
  try {
    const data = await onetGet(`/bright_outlook/grow?start=${start}&end=${end}`);
    const page = (data.career || []).map(c => ({
      code: c.code,
      title: c.title,
      tags: { brightOutlook: true, apprenticeship: false, stem: false, green: false },
    }));
    boTotal = data.total || boTotal || page.length;
    boCareers = boCareers.concat(page);
    renderLiveList(boCareers, 'bo-list', 'bo');
    // Update "Show more" affordance
    const moreWrap = document.getElementById('bo-more-wrap');
    const countLabel = document.getElementById('bo-count');
    const hasMore = boCareers.length < boTotal;
    moreWrap.style.display = boCareers.length > 0 ? 'block' : 'none';
    document.getElementById('bo-more-btn').style.display = hasMore ? '' : 'none';
    countLabel.textContent = `Showing ${boCareers.length} of ${boTotal} Bright Outlook careers`;
  } catch (err) {
    console.error('Bright Outlook fetch failed:', err);
    if (boCareers.length === 0) {
      document.getElementById('bo-list').innerHTML =
        '<div style="color:var(--ts);font-size:15px;padding:14px 0">Couldn\'t reach O*NET. Try the search above.</div>';
    }
  } finally {
    boLoading = false;
  }
}

async function renderBrightOutlook() {
  if (boCareers.length > 0) return; // already loaded
  const el = document.getElementById('bo-list');
  if (!el) return;
  el.innerHTML = '<div style="color:var(--ts);font-size:15px;padding:14px 0">Loading careers from O*NET…</div>';
  await loadBrightOutlookPage();
}

// Unified search dispatcher for the Find My Career page.
// Mode priority: keyword (sinput >= 2 chars) > riasec (activeR) > empty.
// Cluster browsing lives on its own /clusters tab now.
function updateSearch() {
  const q = document.getElementById('sinput').value.trim();
  syncRiasecChipsUI();

  if (q.length >= 2) {
    hideEmptyState();
    document.getElementById('slist-more').innerHTML = '';
    debouncedLiveSearch(q);
    return;
  }
  if (q.length === 1) {
    hideEmptyState();
    document.getElementById('rcount').textContent = '';
    document.getElementById('slist').innerHTML =
      '<div style="text-align:center;padding:40px 20px;color:var(--ts);font-size:15px">Type at least 2 characters to search.</div>';
    document.getElementById('slist-more').innerHTML = '';
    return;
  }
  if (activeR.size > 0) {
    hideEmptyState();
    renderRiasecIntoSlist();
    return;
  }
  showEmptyState();
}

// Backwards-compat shim for any remaining callers that say doSearch().
function doSearch() { updateSearch(); }

function syncRiasecChipsUI() {
  document.querySelectorAll('.rc').forEach(c => {
    c.classList.toggle('active', activeR.has(c.dataset.r));
  });
}

// ─── Filter bar dropdown helpers ─────────────────────────────────────────
function toggleFb(fb) {
  const wasOpen = fb.classList.contains('open');
  closeAllFbs();
  if (!wasOpen) {
    fb.classList.add('open');
    fb.querySelector('.fb-panel').hidden = false;
  }
}
function closeAllFbs() {
  document.querySelectorAll('.fb.open').forEach(f => {
    f.classList.remove('open');
    const p = f.querySelector('.fb-panel');
    if (p) p.hidden = true;
  });
}

// Sync the small text on each filter button and selected-option chip styles.
function updateFbValueLabels() {
  // Work style: count of active RIASEC letters
  const wsLabel = activeR.size > 0 ? `${activeR.size} selected` : '';
  setFbValue('workstyle', wsLabel, activeR.size > 0);

  // Education
  const eduMap = {0:'', 2:"No degree", 3:"Some college", 4:"Bachelor's+", 5:"Master's+"};
  setFbValue('education', eduMap[eduZoneMin] || '', eduZoneMin > 0);
  document.querySelectorAll('.edu-opt').forEach(el => {
    el.classList.toggle('active', parseInt(el.dataset.edu) === eduZoneMin);
  });

  // Salary
  const salLabel = minSalary > 0 ? '$' + (minSalary/1000) + 'k+' : '';
  setFbValue('salary', salLabel, minSalary > 0);
  document.querySelectorAll('.sal-opt').forEach(el => {
    el.classList.toggle('active', parseInt(el.dataset.sal) === minSalary);
  });
}
function setFbValue(name, text, hasValue) {
  const v = document.getElementById('fb-value-' + name);
  if (v) v.textContent = text;
  const fb = document.querySelector(`.fb[data-fb="${name}"]`);
  if (fb) fb.classList.toggle('has-value', !!hasValue);
}

// Apply Education + Salary filters to the rendered career list by hiding
// rows whose cached values don't match. Cards without cached data stay
// visible (we never penalize a card for missing data).
// Sub-cluster filter — toggling a chip rebuilds the cluster view from
// the full pool (no longer just hides DOM nodes). repaintCluster() reads
// activeClusterSub, computes the matching subset, and renders the first
// page of it. Reset clusterDisplay_v2 so a fresh filter starts at page 1.
function applyClusterSubFilter() {
  clusterDisplay_v2 = CLUSTER_PAGE_SIZE;
  repaintCluster();
}

function applyClientFilters() {
  // Walk every grid (#slist, #cluster-list, #bo-list, …) — renderLiveList
  // marks each result container with .cgrid, so a single selector covers
  // all of them. Earlier this only targeted two specific IDs, so filters
  // were silently ignored on the Bright Outlook empty state.
  document.querySelectorAll('.cgrid .ccard[data-live-code]').forEach(card => {
    const code = card.dataset.liveCode;
    const cached = detailCache[code] || {};
    let hide = false;
    if (minSalary > 0) {
      const sal = cached.salary && cached.salary.median;
      if (sal && sal < minSalary) hide = true;
    }
    if (eduZoneMin > 0) {
      const z = cached.jobZone;
      if (z && z < eduZoneMin) hide = true;
    }
    card.style.display = hide ? 'none' : '';
  });
  // After filtering, refresh the RIASEC mode's match-count headline so it
  // reflects the count of cards actually on screen rather than the raw
  // API result size.
  refreshRiasecRcount();
}

// Recompute the #rcount headline from currently-visible #slist cards.
// Called after filter changes so the number stays in sync with what the
// user actually sees. Only runs when we're displaying RIASEC matches
// (lastResults is set) — keyword-search headlines are computed elsewhere.
function refreshRiasecRcount() {
  const rcount = document.getElementById('rcount');
  const slist = document.getElementById('slist');
  if (!rcount || !slist || !lastResults) return;
  // Skip if we're showing the loading/empty state in #slist instead of
  // actual cards.
  const cards = slist.querySelectorAll('.ccard[data-live-code]');
  if (!cards.length) return;
  let visible = 0;
  cards.forEach(c => { if (c.style.display !== 'none') visible++; });
  rcount.textContent = `${visible} career${visible!==1?'s':''} match your top work styles. Find them below.`;
}

// ─── RIASEC (Holland-code) mode ───────────────────────────────────────────
async function renderRiasecIntoSlist() {
  const rcount = document.getElementById('rcount');
  const slist = document.getElementById('slist');
  const more = document.getElementById('slist-more');
  more.innerHTML = '';
  // Build Holland code from active letters, sorted by the user's RIASEC
  // scores when available (so SIR > SRI when S > I > R).
  let letters = [...activeR];
  if (lastResults) {
    letters.sort((a, b) => (lastResults[b] || 0) - (lastResults[a] || 0));
  }
  const fullCode = letters.slice(0, 3).join('');
  rcount.textContent = `Matching careers for ${fullCode}…`;
  slist.innerHTML = '<div style="color:var(--ts);font-size:15px;padding:14px 0">Loading careers from O*NET…</div>';

  // Two paths to result fetching:
  //  - If the user has completed the quiz, lastOnetScores has all 6
  //    RIASEC scores (0-40 each). Use the /fit endpoint so O*NET returns
  //    its native Best/Great/Good grades.
  //  - Otherwise (user toggled chips without taking the quiz) fall back
  //    to /holland and synthesize a Best-fit badge via set-overlap.
  const HOLLAND_PAGE = 100;
  const useFit = lastOnetScores
    && Object.keys(lastOnetScores).length === 6;
  let careers = [];          // raw API entries
  let usedCode = '';         // RIASEC code we ended up showing (for diagnostics)
  let fitMode = false;       // true => entries carry .fit; false => use overlap

  if (useFit) {
    try {
      const q = new URLSearchParams({
        realistic:     lastOnetScores.R,
        investigative: lastOnetScores.I,
        artistic:      lastOnetScores.A,
        social:        lastOnetScores.S,
        enterprising:  lastOnetScores.E,
        conventional:  lastOnetScores.C,
        end: String(HOLLAND_PAGE),
      });
      const data = await onetGet('/fit?' + q.toString());
      careers = (data && data.career) || [];
      usedCode = fullCode;
      fitMode = true;
    } catch (e) {
      // fall through to Holland ladder
    }
  }

  if (!careers.length) {
    // Holland fallback ladder: try 3-letter, then 2-letter, then 1-letter.
    for (let n = fullCode.length; n >= 1; n--) {
      const sub = fullCode.slice(0, n);
      try {
        const data = await onetGet(`/holland/${sub}?end=${HOLLAND_PAGE}`);
        const occ = (data && data.occupation) || [];
        if (occ.length >= 5 || n === 1) {
          careers = occ;
          usedCode = sub;
          break;
        }
        if (!careers.length) { careers = occ; usedCode = sub; }
      } catch (e) { /* try next */ }
    }
  }

  if (!careers.length) {
    slist.innerHTML = '<div style="color:var(--ts);font-size:15px;padding:14px 0">No matches found. Try a different combination of work styles.</div>';
    rcount.textContent = '';
    return;
  }

  // Build the render list. In FIT mode, each entry carries its O*NET
  // fit grade (Best/Great/Good). In Holland-fallback mode, we synthesize
  // a Best-fit boolean using set-overlap so the badge still works.
  const userLetterSet = new Set(letters.slice(0, 3));
  const list = careers.map(c => {
    let fitGrade = null;
    let isMatch = false;
    if (fitMode) {
      fitGrade = c.fit || null;
      isMatch = fitGrade === 'Best';
    } else {
      const careerLetters = new Set((c.interest_code || '').split(''));
      let overlap = 0;
      userLetterSet.forEach(l => { if (careerLetters.has(l)) overlap++; });
      isMatch = overlap === userLetterSet.size;
      if (isMatch) fitGrade = 'Best';
    }
    return {
      code: c.code, title: c.title,
      isMatch,
      fitGrade,
      tags: {
        brightOutlook:  !!(c.tags && c.tags.bright_outlook),
        apprenticeship: !!(c.tags && c.tags.apprenticeship),
        stem:           !!(c.tags && c.tags.stem),
        green:          !!(c.tags && c.tags.green),
      },
    };
  });
  // Holland responses inline a job_zone object per career; stash it for
  // the Education filter. /fit responses don't include job_zone, so the
  // Education filter on those is best-effort — values fill in as cards
  // get opened (which triggers the full detail fetch).
  //
  // Also stash the fit grade on the cache so the career-details modal
  // reads the same value the card shows — otherwise the modal badge
  // (which used to be derived from bright-outlook) can disagree with
  // the card badge.
  list.forEach(item => {
    if (!item.fitGrade) return;
    detailCache[item.code] = detailCache[item.code] || { _partial: true };
    detailCache[item.code].fitGrade = item.fitGrade;
  });
  careers.forEach(c => {
    if (c.job_zone && c.job_zone.code) {
      detailCache[c.code] = detailCache[c.code] || { _partial: true };
      detailCache[c.code].jobZone = c.job_zone.code;
    }
  });
  renderLiveList(list, 'slist', 'sd');
  rcount.textContent = `${careers.length} career${careers.length!==1?'s':''} match your top work styles. Find them below.`;
  applyClientFilters();
}

// ─── Cluster careers loader (used by the Career Clusters page) ──────────
const CLUSTER_PAGE_SIZE = 15;
let clusterCareers_v2 = [];   // currently-rendered slice (matches active filter)
let clusterPool_v2 = [];      // all careers fetched up front
let clusterTotal_v2 = null;
let clusterDisplay_v2 = 0;    // # items currently rendered (advances on Show More)
let clusterLoading_v2 = false;
let loadedClusterCode_v2 = null;
// Sub-cluster catalog harvested from the API response so the chips reflect
// O*NET's real taxonomy instead of a hand-curated list.
let clusterSubCatalog_v2 = []; // [{code, title}]
// Map: career.code -> sub_cluster.code so the chip filter can match by ID.
let careerSubCode_v2 = new Map();
// Free-text keyword filter on the cluster page (title contains match).
let clusterKeyword = '';

// Return the pool filtered by (a) the active sub-cluster chip and
// (b) the cluster-page keyword search (title contains, case-insensitive).
// Both are optional; neither active -> the full pool.
function filteredClusterPool() {
  let out = clusterPool_v2;
  if (activeClusterSub) {
    out = out.filter(c => careerSubCode_v2.get(c.code) === activeClusterSub);
  }
  if (clusterKeyword) {
    const q = clusterKeyword.toLowerCase();
    out = out.filter(c => (c.title || '').toLowerCase().includes(q));
  }
  return out;
}

// Render the current view of the cluster (head slice of the active subset)
// into the cluster page. Called after every fetch, chip toggle, or Show
// More — single source of truth for what the cluster section displays.
function repaintCluster() {
  const filtered = filteredClusterPool();
  if (!clusterDisplay_v2) clusterDisplay_v2 = CLUSTER_PAGE_SIZE;
  clusterCareers_v2 = filtered.slice(0, clusterDisplay_v2);
  renderLiveList(clusterCareers_v2, 'cluster-list', 'cl');

  const rc = document.getElementById('cluster-rcount');
  if (rc) {
    if (activeClusterSub) {
      const subTitle =
        (clusterSubCatalog_v2.find(s => s.code === activeClusterSub) || {}).title
        || activeClusterSub;
      rc.textContent = `${clusterCareers_v2.length} of ${filtered.length} career${filtered.length!==1?'s':''} in ${subTitle}`;
    } else {
      const tt = clusterTotal_v2 || filtered.length;
      rc.textContent = `${clusterCareers_v2.length} of ${tt} career${tt!==1?'s':''}`;
    }
  }
  const more = document.getElementById('cluster-list-more');
  if (more) {
    const hasMore = clusterCareers_v2.length < filtered.length;
    more.innerHTML = hasMore
      ? '<div style="margin-top:14px;text-align:center"><button class="cta ghost" id="cluster-list-more-btn">Show more</button></div>'
      : '';
  }
}

async function loadClusterIntoTarget(code, name, listId, rcountId, moreId) {
  if (clusterLoading_v2) return;
  clusterLoading_v2 = true;
  try {
    // First call: fetch the whole cluster (max ~170 careers) so we can
    // enumerate every sub-cluster and filter against the full pool.
    if (!clusterPool_v2.length) {
      const data = await onetGet(`/career_cluster/${code}?start=1&end=300`);
      const occ = data.occupation || data.career || [];
      clusterPool_v2 = occ.map(c => {
        const sub = (c.sub_cluster && c.sub_cluster[0]) || null;
        if (sub && sub.code) careerSubCode_v2.set(c.code, sub.code);
        return {
          code: c.code, title: c.title,
          tags: {
            brightOutlook:  !!(c.tags && c.tags.bright_outlook),
            apprenticeship: !!(c.tags && c.tags.apprenticeship),
            stem:           !!(c.tags && c.tags.stem),
            green:          !!(c.tags && c.tags.green),
          },
        };
      });
      clusterTotal_v2 = data.total || clusterPool_v2.length;
      const seen = new Set();
      clusterSubCatalog_v2 = [];
      for (const c of occ) {
        const s = (c.sub_cluster && c.sub_cluster[0]) || null;
        if (s && s.code && !seen.has(s.code)) {
          seen.add(s.code);
          clusterSubCatalog_v2.push({ code: s.code, title: s.title });
        }
      }
      renderClusterSubChips();
      // Initial render: show the first page of the (unfiltered) pool.
      clusterDisplay_v2 = CLUSTER_PAGE_SIZE;
    } else {
      // Subsequent call = Show More. Advance the rendered window of the
      // CURRENT filtered subset (whichever chip is active).
      const filtered = filteredClusterPool();
      clusterDisplay_v2 = Math.min(
        clusterDisplay_v2 + CLUSTER_PAGE_SIZE,
        filtered.length
      );
    }
    repaintCluster();
  } catch (err) {
    console.error('Cluster fetch failed:', err);
    document.getElementById(listId).innerHTML =
      '<div style="color:var(--ts);font-size:15px;padding:14px 0">Couldn\'t reach O*NET. Try again later.</div>';
  } finally {
    clusterLoading_v2 = false;
  }
}

// Repaint #cluster-subs from the live sub-cluster catalog.
function renderClusterSubChips() {
  const host = document.getElementById('cluster-subs');
  if (!host) return;
  host.innerHTML = clusterSubCatalog_v2
    .map(s => `<button class="fc sub-chip${activeClusterSub === s.code ? ' active' : ''}" data-sub="${s.code}" data-sub-title="${s.title}">${s.title}</button>`)
    .join('');
}

// ─── Career Clusters page ───────────────────────────────────────────────
// Render the editorial grid of cluster cards. Called once on DOM ready.
// Career-count-per-cluster cache, populated by loadClusterCounts().
// Keyed by cluster name (matches CLUSTERS[].name).
const clusterTotals = new Map();

function renderClusterGrid() {
  const grid = document.getElementById('cluster-grid');
  if (!grid) return;
  grid.innerHTML = CLUSTERS.map(c => {
    const total = clusterTotals.get(c.name);
    const countPill = total
      ? `<div class="cluster-card-count">${total} careers</div>`
      : '';
    return `
    <div class="cluster-card" data-cluster="${c.name}">
      <img src="${c.img}" alt="${c.name}" loading="lazy"
           onerror="this.style.display='none'">
      <div class="cluster-card-overlay"></div>
      ${countPill}
      <div class="cluster-card-cta">View Careers</div>
      <div class="cluster-card-body">
        <h3 class="cluster-card-title">${c.name}</h3>
        <p class="cluster-card-desc">${c.desc}</p>
      </div>
    </div>
  `;}).join('');
}

// Fetch the O*NET total-careers count for every cluster once, then
// re-render the grid so each card shows a count pill. Cheap — one
// `?end=1` request per cluster; edge cache holds them for 1h. Failures
// silently omit the pill instead of surfacing a broken state.
async function loadClusterCounts() {
  if (clusterTotals.size >= CLUSTERS.length) return;
  await Promise.all(CLUSTERS.map(async c => {
    const code = CLUSTER_CODES[c.name];
    if (!code) return;
    try {
      const data = await onetGet(`/career_cluster/${code}?end=1`);
      if (data && data.total) clusterTotals.set(c.name, data.total);
    } catch (e) { /* leave the pill absent */ }
  }));
  renderClusterGrid();
}

// Open the cluster detail section (sub-clusters + career list), scroll
// it into view, and fire the first page of careers.
function openClusterDetail(name) {
  const cl = CLUSTERS.find(c => c.name === name);
  if (!cl) return;
  activeCluster = name;
  activeClusterSub = '';
  const detail = document.getElementById('cluster-detail');
  detail.style.display = 'block';
  document.getElementById('cluster-detail-title').textContent = cl.name;
  document.getElementById('cluster-detail-desc').textContent = cl.desc;
  // Chips render after the cluster fetch (built from O*NET's real
  // sub-cluster catalog). Show a placeholder so the row doesn't pop in.
  document.getElementById('cluster-subs').innerHTML = '';

  // Reset pagination + keyword + fire the load
  const code = CLUSTER_CODES[name];
  clusterCareers_v2 = [];
  clusterPool_v2 = [];
  careerSubCode_v2 = new Map();
  clusterSubCatalog_v2 = [];
  clusterTotal_v2 = null;
  clusterDisplay_v2 = 0;
  clusterKeyword = '';
  const csi = document.getElementById('cluster-sinput');
  if (csi) csi.value = '';
  loadedClusterCode_v2 = code;
  document.getElementById('cluster-list').innerHTML =
    '<div style="color:var(--ts);font-size:15px;padding:14px 0">Loading careers from O*NET…</div>';
  document.getElementById('cluster-rcount').textContent = 'Loading…';
  document.getElementById('cluster-list-more').innerHTML = '';
  loadClusterIntoTarget(code, name, 'cluster-list', 'cluster-rcount', 'cluster-list-more');

  // Scroll the detail into view
  setTimeout(() => detail.scrollIntoView({behavior:'smooth', block:'start'}), 60);
}

function closeClusterDetail() {
  activeCluster = '';
  activeClusterSub = '';
  loadedClusterCode_v2 = null;
  clusterCareers_v2 = [];
  clusterPool_v2 = [];
  careerSubCode_v2 = new Map();
  clusterSubCatalog_v2 = [];
  clusterTotal_v2 = null;
  clusterDisplay_v2 = 0;
  clusterKeyword = '';
  const csi = document.getElementById('cluster-sinput');
  if (csi) csi.value = '';
  const detail = document.getElementById('cluster-detail');
  if (detail) detail.style.display = 'none';
  document.getElementById('cluster-grid').scrollIntoView({behavior:'smooth', block:'start'});
}

async function _execLiveSearch(q) {
  const rcount = document.getElementById('rcount');
  rcount.textContent = 'Searching O*NET…';
  try {
    const data = await onetGet(`/search?keyword=${encodeURIComponent(q)}&end=25`);
    const occs = (data.occupation || []).map(o => ({
      code: o.code,
      title: o.title,
      tags: {
        brightOutlook: !!(o.tags && o.tags.bright_outlook),
        apprenticeship: !!(o.tags && o.tags.apprenticeship),
        stem: !!(o.tags && o.tags.stem),
        green: !!(o.tags && o.tags.green),
      },
    }));
    const total = data.total || occs.length;
    rcount.textContent = total + ' career' + (total !== 1 ? 's' : '') + ' found' +
      (total > occs.length ? ` (showing ${occs.length})` : '');
    renderLiveList(occs, 'slist', 'sd');
    document.getElementById('slist-more').innerHTML = '';
  } catch (err) {
    console.error('Live search failed:', err);
    rcount.textContent = "Couldn't reach O*NET. Try again in a moment.";
    document.getElementById('slist').innerHTML = '';
  }
}

// Render a list of live O*NET results (title + code, no salary yet)
// Build the badge row HTML for a live (O*NET) career card.
// Dedup rule: when a career is Bright Outlook, the ☀️ pill subsumes the 📈
// growth pill (both would say "Bright"). For Average / Below average careers,
// the 📈 pill shows. Salary always shows when available.
function buildCardBadges(career, detail) {
  const tags = (detail && detail.tags) || career.tags || {};
  const sal = detail && detail.salary && detail.salary.median;
  const growth = detail && detail.outlook && detail.outlook.growth;
  const cluster = detail && detail.cluster;
  const brightOutlook = !!tags.brightOutlook;
  return [
    brightOutlook ? `<span class="mb g">☀️ Bright Outlook</span>` : '',
    tags.apprenticeship ? `<span class="mb">🔨 Apprenticeship</span>` : '',
    tags.stem ? `<span class="mb">🔬 STEM</span>` : '',
    sal ? `<span class="mb g">💰 $${sal.toLocaleString()}/yr</span>` : '',
    (growth && !brightOutlook) ? `<span class="mb">📈 ${growth}</span>` : '',
    cluster ? `<span class="mb">${cluster}</span>` : ''
  ].filter(Boolean).join('');
}

// Card gradients are class-based now (.ccard / .ccard.bright in CSS).
// Bright Outlook careers get the sunrise gradient; everyone else gets
// the primary-blue gradient.

// Heart icon used by every save button (grid cards, modal, tray empty
// state). Matches the SVG used in the top-nav Saved button so the visual
// language is consistent. `filled=true` paints the heart solid; otherwise
// it renders as a stroked outline.
function heartIcon(filled, size = 18) {
  return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="${filled ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;
}

// Star icon for the Top Picks toggle. Same visual language as the
// heart: outline = saved-only, filled = promoted to top-pick.
function starIcon(filled, size = 18) {
  return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="${filled ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="12 2 15 8.8 22.5 9.6 17 14.6 18.4 22 12 18.4 5.6 22 7 14.6 1.5 9.6 9 8.8 12 2"/></svg>`;
}

// Markup for a single career grid card. Title + bottom-aligned salary +
// Bright Outlook pills, top-right ♡, optional Best Fit badge top-left.
// Per-career images come from LoremFlickr (free, keyword-based, no API
// key). Each career gets a unique photo derived from a few significant
// words from its title, with the SOC code as a deterministic seed so
// the same career always shows the same image. If LoremFlickr is slow
// or blocks a request, the <img> onerror handler falls back to the
// career's cluster image (below), which is one of the 14 verified
// Unsplash URLs already used on the Career Clusters grid.

// SOC 2-digit prefix -> cluster name, for the fallback path when
// LoremFlickr fails or returns a broken URL. Same mapping we had before
// per-career images — good enough to keep the card populated.
const SOC_TO_CLUSTER_IMG = {
  '11':'Management & Entrepreneurship', '13':'Financial Services',
  '15':'Digital Technology',            '17':'Advanced Manufacturing',
  '19':'Energy & Natural Resources',    '21':'Healthcare & Human Services',
  '23':'Public Service & Safety',       '25':'Education',
  '27':'Arts, Entertainment & Design',  '29':'Healthcare & Human Services',
  '31':'Healthcare & Human Services',   '33':'Public Service & Safety',
  '35':'Hospitality, Events & Tourism', '37':'Hospitality, Events & Tourism',
  '39':'Hospitality, Events & Tourism', '41':'Marketing & Sales',
  '43':'Management & Entrepreneurship', '45':'Agriculture',
  '47':'Construction',                  '49':'Supply Chain & Transportation',
  '51':'Advanced Manufacturing',        '53':'Supply Chain & Transportation',
  '55':'Public Service & Safety',
};

// Generic keyword per SOC prefix — used when the title-derived keywords
// come up empty (rare, but happens for very generic "…, All Other" rows).
const SOC_KEYWORD_FALLBACK = {
  '11':'business','13':'finance','15':'computer','17':'engineering',
  '19':'science','21':'community','23':'law','25':'education',
  '27':'art','29':'healthcare','31':'nurse','33':'police',
  '35':'restaurant','37':'cleaning','39':'personal','41':'sales',
  '43':'office','45':'farm','47':'construction','49':'mechanic',
  '51':'factory','53':'transportation','55':'military',
};

// Words to drop when tokenizing a career title into image keywords.
const _IMG_STOP = new Set([
  'and','the','of','for','with','a','an','in','on','to','from','or','&',
  'all','other','not','elsewhere','classified','except','including','line',
  'first','specialists','workers','and,','general','operators',
]);

let _clusterImgByName = null;
function _clusterImg(name) {
  if (!_clusterImgByName) {
    _clusterImgByName = Object.create(null);
    for (const c of CLUSTERS) _clusterImgByName[c.name] = c.img;
  }
  return _clusterImgByName[name] || (CLUSTERS[0] && CLUSTERS[0].img);
}

function careerImageKeywords(code, title) {
  const t = String(title || '')
    .replace(/\([^)]*\)/g, ' ')       // strip parentheticals
    .split(/[,;—:]/)[0]                // first clause only
    .toLowerCase();
  const words = t.split(/[^a-z]+/).filter(w => w.length >= 4 && !_IMG_STOP.has(w));
  const kw = words.slice(0, 3);
  if (!kw.length) {
    const prefix = String(code || '').slice(0, 2);
    kw.push(SOC_KEYWORD_FALLBACK[prefix] || 'work');
  }
  return kw.join(',');
}

function careerImageUrl(code, title) {
  // Hits the Worker's /image route which proxies Unsplash Search and
  // 302-redirects to a deterministic Unsplash CDN photo. Same career
  // code + keywords always resolve to the same photo; the Worker + edge
  // cache the redirect for 30 days so we don't burn Unsplash rate.
  const seed = String(code || 'x').replace(/[^0-9a-zA-Z]/g, '');
  const kw = careerImageKeywords(code, title);
  return `${ONET_PROXY}/image?q=${encodeURIComponent(kw)}&seed=${seed}`;
}

// URL used by the <img>'s onerror handler when LoremFlickr fails.
function careerImageFallback(code) {
  const prefix = String(code || '').slice(0, 2);
  return _clusterImg(SOC_TO_CLUSTER_IMG[prefix]);
}

function buildLiveCard(c, cached, code, prefix, isSaved) {
  const tags = (cached && cached.tags) || c.tags || {};
  const sal = cached && cached.salary && cached.salary.median;
  const salPill = sal ? `<span class="ccard-pill">$${sal.toLocaleString()}/yr</span>` : '';
  const boPill = tags.brightOutlook ? `<span class="ccard-pill bo">☀ Bright Outlook</span>` : '';
  const brightCls = tags.brightOutlook ? ' bright' : '';
  const imgUrl = careerImageUrl(code, c.title);
  const imgFb  = careerImageFallback(code);
  // Map O*NET fit grades to badge variants. Falls back to the legacy
  // .isMatch boolean (Best Fit only) for callers that haven't been
  // updated to pass c.fitGrade.
  const grade = c.fitGrade || (c.isMatch ? 'Best' : '');
  let fitBadge = '';
  if (grade === 'Best')  fitBadge = `<div class="ccard-match ccard-match--best">Best Fit</div>`;
  else if (grade === 'Great') fitBadge = `<div class="ccard-match ccard-match--great">Great Fit</div>`;
  else if (grade === 'Good')  fitBadge = `<div class="ccard-match ccard-match--good">Good Fit</div>`;
  // onerror: try the cluster fallback URL once; on second failure hide.
  const imgOnErr = `if(!this.dataset.fb){this.dataset.fb=1;this.src=&quot;${imgFb}&quot;}else{this.style.display=&#39;none&#39;}`;
  // Star button — only renders once the career is saved. Filled when
  // the career has been promoted to a top pick.
  const isTop = topPicks.has(code);
  const topPickCls = isTop ? ' is-top-pick' : '';
  const starBtn = isSaved
    ? `<button class="ccard-star${isTop?' top':''}" data-live-code="${code}" aria-label="${isTop?'Remove from top picks':'Add to top picks'}" aria-pressed="${isTop}">${starIcon(isTop)}</button>`
    : '';
  return `<div class="ccard has-image${brightCls}${topPickCls}" data-live-code="${code}" data-prefix="${prefix||'sd'}">
    <img class="ccard-img" src="${imgUrl}" alt="${c.title || ''}" loading="lazy" onerror="${imgOnErr}">
    <div class="ccard-overlay"></div>
    ${fitBadge}
    ${starBtn}
    <button class="ccard-bm${isSaved?' saved':''}" data-live-code="${code}" aria-label="${isSaved?'Saved':'Save career'}">${heartIcon(isSaved)}</button>
    <div class="ccard-body">
      <h3 class="ccard-title">${c.title}</h3>
      <div class="ccard-pills">${salPill}${boPill}</div>
    </div>
  </div>`;
}

function renderLiveList(list, listId, prefix) {
  const el = document.getElementById(listId);
  if (!el) return;
  el.classList.add('cgrid');
  if (!list.length) {
    el.classList.remove('cgrid');
    el.innerHTML = `<div style="text-align:center;padding:40px 20px;color:var(--ts);font-size:15px">No careers found. Try a different keyword.</div>`;
    return;
  }
  // Float saved careers (top picks first, then other saved) to the top
  // of any browsing list — Search Careers, Career Clusters, Bright
  // Outlook. Within each group original order is preserved so
  // fit-score / salary rankings still hold.
  list = sortListBySaveState(list);
  el.innerHTML = list.map(c => {
    const code = c.code;
    const isSaved = saved.has('live-'+code);
    const cached = detailCache[code] || {};
    return buildLiveCard(c, cached, code, prefix, isSaved);
  }).join('');

  prefetchSummaries(list, prefix);
}

// In-flight tracker so we don't fire duplicate requests for the same career
// across multiple renders.
const summaryInFlight = new Set();
function prefetchSummaries(list, prefix) {
  list.forEach(c => {
    // Full (non-partial) detail already in cache — nothing to do.
    if (detailCache[c.code] && !detailCache[c.code]._partial) return;
    if (summaryInFlight.has(c.code)) return;
    summaryInFlight.add(c.code);
    onetGet(`/career/${c.code}/outlook`).then(out => {
      const wage = (out && out.salary) || {};
      const outlookCat = out && out.outlook && out.outlook.category;
      // Merge fresh data into whatever's already in the cache (may already
      // hold a jobZone from a Holland list response). Without this merge,
      // pre-seeded partial entries blocked salary + tags from ever landing
      // and the card pills never updated until full detail was fetched.
      const cur = detailCache[c.code] || {};
      detailCache[c.code] = {
        code: c.code,
        title: c.title,
        description: cur.description || '',
        sampleTitles: cur.sampleTitles || [],
        tags: { ...(c.tags || {}), ...(cur.tags || {}) },
        salary: {
          median: wage.annual_median        || (cur.salary && cur.salary.median) || 0,
          low:    wage.annual_10th_percentile || (cur.salary && cur.salary.low)    || 0,
          high:   wage.annual_90th_percentile || (cur.salary && cur.salary.high)   || 0,
        },
        outlook: {
          growth:     outlookCat || (cur.outlook && cur.outlook.growth)     || '',
          descriptor: (cur.outlook && cur.outlook.descriptor) || '',
        },
        tasks:        cur.tasks        || [],
        eduBreakdown: cur.eduBreakdown || [],
        pathways:     cur.pathways     || [],
        prepare:      cur.prepare      || [],
        hiring:       cur.hiring       || {},
        cluster:      cur.cluster      || '',
        riasec:       cur.riasec       || [],
        related:      cur.related      || [],
        jobZone:      cur.jobZone,
        _partial:     true,
      };
      // Patch the card's pills row in place — find all matching cards by
      // data attribute (the same career may render in multiple lists).
      document.querySelectorAll(`.ccard[data-live-code="${c.code}"]`).forEach(card => {
        const pills = card.querySelector('.ccard-pills');
        if (!pills) return;
        const sal = detailCache[c.code].salary && detailCache[c.code].salary.median;
        const tags = detailCache[c.code].tags || {};
        const salPill = sal ? `<span class="ccard-pill">$${sal.toLocaleString()}/yr</span>` : '';
        const boPill = tags.brightOutlook ? `<span class="ccard-pill bo">☀ Bright Outlook</span>` : '';
        pills.innerHTML = salPill + boPill;
      });
      // Re-apply Salary/Education filters now that this card has data.
      applyClientFilters();
    }).catch(() => {
      // Silent — card just stays without salary
    }).finally(() => {
      summaryInFlight.delete(c.code);
    });
  });
}

// Related-tab cards now use the same .ccard markup as the search/Clusters/
// Bright-Outlook grids. prefetchSummaries already paints any .ccard with a
// matching data-live-code from a freshly-fetched outlook response, so we
// just route the related list through it.
function enrichRelatedCards(relatedList) {
  prefetchSummaries(
    (relatedList || []).map(r => ({ code: r.code, title: r.title })),
    'sd'
  );
}

// Fetch detail for a live result, cache it, then build the drawer
// Currently-open career code (for the modal). Used by close + tab handlers.
let openModalCode = null;

function openModal() {
  const o = document.getElementById('cmodal-overlay');
  if (!o) return;
  o.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeModal() {
  const o = document.getElementById('cmodal-overlay');
  if (!o) return;
  o.classList.remove('open');
  document.body.style.overflow = '';
  openModalCode = null;
}

async function openLiveDetail(code, prefix) {
  openModalCode = code;
  const modal = document.getElementById('cmodal');
  if (!modal) return;
  openModal();

  // If a full (non-partial) detail is already cached, render immediately.
  if (detailCache[code] && !detailCache[code]._partial) {
    modal.innerHTML = buildModalDetail(detailCache[code], code);
    modal.scrollTop = 0;
    enrichRelatedCards(detailCache[code].related || []);
    return;
  }

  // Skeleton while loading. Matches the two-panel header shape so the
  // layout doesn't jump when the real content lands.
  modal.innerHTML = `
    <div class="cmodal-head">
      <div class="cmodal-head-left">
        <div style="height:32px;width:65%;background:rgba(255,255,255,.22);border-radius:6px;animation:pulse 1.2s ease-in-out infinite"></div>
        <div style="height:14px;width:90%;background:rgba(255,255,255,.16);border-radius:4px;animation:pulse 1.2s ease-in-out infinite;margin-top:14px"></div>
        <div style="height:14px;width:70%;background:rgba(255,255,255,.16);border-radius:4px;animation:pulse 1.2s ease-in-out infinite"></div>
      </div>
      <div class="cmodal-head-right"></div>
      <div class="cmodal-actions">
        <button class="cmodal-close" data-cmodal-close aria-label="Close">✕</button>
      </div>
    </div>
    <div class="cmodal-body" style="display:flex;flex-direction:column;gap:12px">
      ${[80,55,95,65,70].map(w=>`<div style="height:14px;width:${w}%;background:var(--lg);border-radius:4px;animation:pulse 1.2s ease-in-out infinite"></div>`).join('')}
      <style>@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}</style>
    </div>`;
  modal.scrollTop = 0;

  try {
    // Fetch live data from O*NET in parallel: basic info, outlook+wages,
    // related occupations, education breakdown, and the full task list.
    const [info, outlook, related, eduRes, tasksRes, knowledgeRes] = await Promise.all([
      onetGet(`/career/${code}`).catch(() => null),
      onetGet(`/career/${code}/outlook`).catch(() => null),
      onetGet(`/career/${code}/details/related_occupations`).catch(() => null),
      onetGet(`/career/${code}/details/education`).catch(() => null),
      onetGet(`/career/${code}/details/tasks?end=8`).catch(() => null),
      // Knowledge feeds the new "Ways To Prepare" tab (Suggested Courses).
      // Same slice the Home "Courses To Take" modal uses.
      onetGet(`/career/${code}/details/knowledge`).catch(() => null),
    ]);
    if (!info && !outlook) throw new Error('O*NET returned no data');

    const wage = (outlook && outlook.salary) || {};
    const sampleTitles = ((info && info.also_called) || []).map(x => x.title).filter(Boolean);
    const tags = (info && info.tags) || {};
    const outlookCat = outlook && outlook.outlook && outlook.outlook.category;
    const outlookDesc = outlook && outlook.outlook && outlook.outlook.description;
    const relatedList = ((related && related.occupation) || []).slice(0, 8).map(r => ({
      code: r.code, title: r.title,
    }));
    // Tasks: O*NET's /details/tasks gives titles. Fall back to info.on_the_job (3 max).
    const onetTasks  = ((tasksRes && tasksRes.task) || []).map(t => t.title).filter(Boolean);
    const fallbackTasks = (info && info.on_the_job) || [];
    // Education: O*NET's /details/education returns {title, percentage_of_respondents}.
    const onetEdu = ((eduRes && eduRes.response) || []).map(e => ({
      level: e.title, pct: e.percentage_of_respondents,
    }));

    // All data is now from O*NET — no curated fallback. Some fields O*NET
    // doesn't expose (cluster name, growth %, annual openings, curated
    // pathways and "Ways to Prepare" lists) simply stay absent.
    const tasks = onetTasks.length ? onetTasks : fallbackTasks;

    const detail = {
      code,
      title:        (info && info.title) || code,
      description:  (info && info.what_they_do) || '',
      sampleTitles,
      tags: {
        brightOutlook:  !!tags.bright_outlook,
        apprenticeship: !!tags.apprenticeship,
        stem:           !!tags.stem,
        green:          !!tags.green,
      },
      salary: {
        median: wage.annual_median          || 0,
        low:    wage.annual_10th_percentile || 0,
        high:   wage.annual_90th_percentile || 0,
      },
      outlook: {
        growth:     outlookCat  || '',
        descriptor: outlookDesc || '',
      },
      tasks,
      eduBreakdown: onetEdu,
      pathways: [],
      prepare:  [],
      hiring:   {},
      cluster:  '',
      riasec:   [],
      related:  relatedList,
      // Top academic subjects for Ways To Prepare. Filter to entries with
      // usable importance + name, sort desc, keep the top ~6.
      knowledge: (
        ((knowledgeRes && knowledgeRes.element) || [])
          .filter(e => e && e.name && (e.importance == null || e.importance > 0))
          .sort((a, b) => (b.importance || 0) - (a.importance || 0))
          .slice(0, 6)
          .map(e => ({ name: e.name, description: e.description || '' }))
      ),
    };
    // Preserve prior cache fields (fitGrade + jobZone stashed during the
    // grid render pass) — otherwise a fresh modal fetch would overwrite
    // them and the modal fit badge would lose its grade.
    const prior = detailCache[code] || {};
    if (prior.fitGrade && !detail.fitGrade) detail.fitGrade = prior.fitGrade;
    if (prior.jobZone  && !detail.jobZone)  detail.jobZone  = prior.jobZone;
    detailCache[code] = detail;

    // Update the card pills now that we have real data
    document.querySelectorAll(`.ccard[data-live-code="${code}"]`).forEach(card => {
      const pills = card.querySelector('.ccard-pills');
      if (!pills) return;
      const sal = detail.salary && detail.salary.median;
      const tags = detail.tags || {};
      const salPill = sal ? `<span class="ccard-pill">$${sal.toLocaleString()}/yr</span>` : '';
      const boPill = tags.brightOutlook ? `<span class="ccard-pill bo">☀ Bright Outlook</span>` : '';
      pills.innerHTML = salPill + boPill;
    });

    // Only paint into the modal if it's still showing THIS career (user
    // may have clicked through to a different one while we were fetching).
    if (openModalCode === code) {
      modal.innerHTML = buildModalDetail(detail, code);
      modal.scrollTop = 0;
      enrichRelatedCards(relatedList);
    }

  } catch (err) {
    console.error('Detail error:', err);
    if (openModalCode === code) {
      modal.innerHTML = `<div class="cmodal-head"><div class="cmodal-head-left"><h2 class="cmodal-title">Couldn't load</h2></div><div class="cmodal-head-right"></div><div class="cmodal-actions"><button class="cmodal-close" data-cmodal-close aria-label="Close">✕</button></div></div><div class="cmodal-body"><p style="color:var(--ts);font-size:15px">Couldn't load details. Try again in a moment.</p></div>`;
    }
  }
}

// Build the career detail modal content. Editorial layout: gradient
// banner header with title/description/pills, then pill tabs with
// content panes (overview / income / education / related).
function buildModalDetail(d, code) {
  const isSaved = saved.has('live-' + code);
  const sal = d.salary  || {};
  const out = d.outlook || {};
  const eb  = d.eduBreakdown || [];
  const tk  = d.tasks    || [];
  const slo = sal.low  || 0;
  const shi = sal.high || 0;
  const salPill = sal.median ? `<span class="ccard-pill">$${sal.median.toLocaleString()}/yr</span>` : '';
  const boPill  = d.tags?.brightOutlook ? `<span class="ccard-pill bo">☀ Bright Outlook</span>` : '';
  // Fit grade is stashed on detailCache when the render list is built
  // in renderRiasecIntoSlist so the modal shows the same tier as the
  // card. (Old logic derived a badge from bright-outlook, which is a
  // separate signal — it caused the modal and card to disagree.)
  const grade = d.fitGrade || '';
  let fitBadgeModal = '';
  if (grade === 'Best')  fitBadgeModal = `<div class="cmodal-match cmodal-match--best">Best Fit</div>`;
  else if (grade === 'Great') fitBadgeModal = `<div class="cmodal-match cmodal-match--great">Great Fit</div>`;
  else if (grade === 'Good')  fitBadgeModal = `<div class="cmodal-match cmodal-match--good">Good Fit</div>`;

  // Two-panel header: solid-blue title panel on the left, career photo
  // on the right. Actions (save + close) pinned to the top-right of the
  // whole header so they're accessible even when the two panels stack.
  const imgUrl = careerImageUrl(code, d.title);
  const imgFb  = careerImageFallback(code);
  const imgOnErr = `if(!this.dataset.fb){this.dataset.fb=1;this.src=&quot;${imgFb}&quot;}else{this.style.display=&#39;none&#39;}`;
  return `<div class="cmodal-head">
    <div class="cmodal-head-left">
      ${fitBadgeModal}
      <h2 class="cmodal-title" id="cmodal-title">${d.title || code}</h2>
      ${d.description ? `<p class="cmodal-desc">${d.description}</p>` : ''}
      <div class="cmodal-head-pills">${salPill}${boPill}</div>
    </div>
    <div class="cmodal-head-right">
      <img class="cmodal-head-img" src="${imgUrl}" alt="${d.title || code}" loading="lazy" onerror="${imgOnErr}">
    </div>
    <div class="cmodal-actions">
      <button class="cmodal-save${isSaved?' saved':''}" data-live-code="${code}" aria-label="Save">${heartIcon(isSaved)}</button>
      <button class="cmodal-close" data-cmodal-close aria-label="Close">✕</button>
    </div>
  </div>
  <div class="cmodal-body">
    <div class="cmodal-tabs">
      <button class="cmodal-tab active" data-mtab="ov">Overview</button>
      <button class="cmodal-tab" data-mtab="ih">Income &amp; Outlook</button>
      <button class="cmodal-tab" data-mtab="ed">Education</button>
      <button class="cmodal-tab" data-mtab="wp">Ways To Prepare</button>
      <button class="cmodal-tab" data-mtab="rc">Related Careers</button>
    </div>

    <!-- OVERVIEW -->
    <div class="cmodal-pane" data-mpane="ov">
      ${(sal.median || out.growth) ? `<div class="cmodal-stats">
        ${sal.median ? `<div class="cmodal-stat">
          <div class="cmodal-stat-label">Median Salary</div>
          <div class="cmodal-stat-value">$${sal.median.toLocaleString()}</div>
          <div class="cmodal-stat-foot">per year</div>
        </div>` : ''}
        ${out.growth ? `<div class="cmodal-stat">
          <div class="cmodal-stat-label">Job Growth</div>
          <div class="cmodal-stat-value">${out.growth}</div>
          <div class="cmodal-stat-foot">${out.descriptor || ''}</div>
        </div>` : ''}
      </div>` : ''}

      ${d.sampleTitles?.length ? `<div class="cmodal-section">
        <div class="cmodal-section-title">Also Called</div>
        <div class="cmodal-chips">
          ${d.sampleTitles.slice(0,6).map(t=>`<div class="cmodal-chip">${t}</div>`).join('')}
        </div>
      </div>` : ''}

      ${tk.length ? `<div class="cmodal-section">
        <div class="cmodal-section-title">Common Tasks</div>
        <div class="cmodal-chips">
          ${tk.slice(0,8).map(t=>`<div class="cmodal-chip">${t}</div>`).join('')}
        </div>
      </div>` : ''}
    </div>

    <!-- INCOME & OUTLOOK -->
    <div class="cmodal-pane" data-mpane="ih" hidden>
      ${sal.median ? `
        <div class="cmodal-section-title" style="margin-bottom:14px">How much do ${d.title}s earn yearly?</div>
        <p style="font-size:15px;color:var(--navy);margin:0 0 18px;line-height:1.55">Ten percent earned less than $${slo.toLocaleString()} and ten percent earned more than $${shi.toLocaleString()}.</p>
        <div class="cmodal-stats cmodal-stats--row" style="margin-bottom:18px">
          <div class="cmodal-stat cmodal-stat--white"><div class="cmodal-stat-label">Low (10%)</div><div class="cmodal-stat-value">$${slo.toLocaleString()}</div></div>
          <div class="cmodal-stat"><div class="cmodal-stat-label">Median (50%)</div><div class="cmodal-stat-value">$${sal.median.toLocaleString()}</div></div>
          <div class="cmodal-stat cmodal-stat--white"><div class="cmodal-stat-label">High (90%)</div><div class="cmodal-stat-value">$${shi.toLocaleString()}</div></div>
        </div>
      ` : '<p style="color:var(--ts);font-size:15px">Salary data not available.</p>'}
      ${out.growth ? `<div class="cmodal-section">
        <div class="cmodal-section-title">Projected Growth</div>
        <div class="cmodal-stat" style="max-width:380px"><div class="cmodal-stat-label">Outlook</div><div class="cmodal-stat-value">${out.growth}</div>${out.descriptor ? `<div class="cmodal-stat-foot">${out.descriptor}</div>` : ''}</div>
      </div>` : ''}
    </div>

    <!-- EDUCATION -->
    <div class="cmodal-pane" data-mpane="ed" hidden>
      ${eb.length ? `
        <div class="cmodal-section-title" style="margin-bottom:14px">What education level do ${d.title}s have?</div>
        <div class="cmodal-stats cmodal-stats--row" style="margin-bottom:18px">
          ${(() => {
            // Highlight the most common education level in green (mirrors
            // how the Median salary card pops on the Income tab).
            const topIdx = eb.reduce((best, e, i) => (e.pct||0) > (eb[best].pct||0) ? i : best, 0);
            return eb.map((e, i) => `<div class="cmodal-stat${i===topIdx?'':' cmodal-stat--white'}">
              <div class="cmodal-stat-label">${e.level}</div>
              <div class="cmodal-stat-value">${(e.pct||0).toFixed(1)}%</div>
            </div>`).join('');
          })()}
        </div>
      ` : '<p style="color:var(--ts);font-size:15px">Education data not available.</p>'}
      ${d.tags?.apprenticeship ? `<div class="cmodal-section">
        <div class="cmodal-chip" style="background:rgba(255,216,16,.14);border-color:rgba(255,216,16,.4);display:flex;flex-direction:column;gap:8px;align-items:flex-start">
          <div style="font-weight:900">🔨 Registered Apprenticeship Available</div>
          <div style="font-size:13px;color:var(--navy);line-height:1.5">Earn while you learn — no college debt required.</div>
          <a href="https://www.apprenticeship.gov/apprenticeship-job-finder?onetCode=${code}" target="_blank" class="cta ylw" style="font-size:11px;padding:7px 14px;text-decoration:none">Find Apprenticeships →</a>
        </div>
      </div>` : ''}
    </div>

    <!-- WAYS TO PREPARE -->
    ${(() => {
      const kn = d.knowledge || [];
      const certs = certsForCode(code);
      if (!kn.length && !certs.length) {
        return `<div class="cmodal-pane" data-mpane="wp" hidden>
          <p style="font-size:15px;color:var(--ts);margin:0">O*NET didn't return preparation guidance for this career.</p>
        </div>`;
      }
      const coursesHtml = kn.length ? `<div class="cmodal-section">
        <div class="cmodal-section-title">Suggested Courses to Take</div>
        <p style="font-size:14px;color:var(--ts);margin:0 0 12px;line-height:1.5">Academic subjects that map to this career, ranked by how important each is to the job.</p>
        <ul class="wp-list">
          ${kn.map(e => `<li>
            <div class="wp-list-title">${e.name}</div>
            ${e.description ? `<div class="wp-list-sub">${e.description}</div>` : ''}
          </li>`).join('')}
        </ul>
      </div>` : '';
      const certsHtml = certs.length ? `<div class="cmodal-section">
        <div class="cmodal-section-title">Certifications & Licenses</div>
        <div class="wp-certs">
          ${certs.map(c => `<div class="wp-cert">
            <div class="wp-cert-name">${c.name}</div>
            <div class="wp-cert-issuer">${c.issuer}</div>
            ${c.notes ? `<div class="wp-cert-notes">${c.notes}</div>` : ''}
          </div>`).join('')}
        </div>
      </div>` : '';
      return `<div class="cmodal-pane" data-mpane="wp" hidden>${coursesHtml}${certsHtml}</div>`;
    })()}

    <!-- RELATED -->
    <div class="cmodal-pane" data-mpane="rc" hidden>
      <p style="font-size:15px;color:var(--ts);margin:0 0 16px">These careers share similar skills, interests, or education pathways.</p>
      <div class="rcgrid">
        ${(d.related||[]).map(r => {
          const cached = detailCache[r.code] || {};
          const isSaved = saved.has('live-'+r.code);
          return buildLiveCard({ title: r.title, isMatch: false }, cached, r.code, 'sd', isSaved);
        }).join('')}
      </div>
    </div>

  </div>`;
}

function switchDTab(btn) {
  const wrap = btn.closest('.cdw');
  const panelId = btn.dataset.panel;
  wrap.querySelectorAll('.cdt').forEach(t => t.classList.remove('active'));
  wrap.querySelectorAll('.cdp').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  const panel = document.getElementById(panelId);
  if (panel) panel.classList.add('active');
}

/* ══ SAVE ══ */
// Metadata snapshot for saved careers (title + median salary, when known).
// Keyed by O*NET code. Populated lazily — at save time we read from
// detailCache when available, and ensureSavedMeta() backfills missing
// entries from O*NET on tray render.
const savedMeta = new Map();

function toggleLiveSave(code) {
  const key = 'live-' + code;
  if (saved.has(key)) {
    saved.delete(key);
    savedMeta.delete(code);
    // Unsaving a career also demotes it from top picks — the star can't
    // outlive the save.
    topPicks.delete(code);
    toast('Removed from saved careers');
  } else {
    saved.add(key);
    // Snapshot from cache; either the card list or the open drawer will
    // have populated detailCache by now in the common path.
    const cached = detailCache[code] || {};
    savedMeta.set(code, {
      title:  cached.title  || code,
      salary: cached.salary && cached.salary.median ? cached.salary.median : null,
    });
    toast('♥ Career saved!');
  }
  // Every count badge with class .tc gets the number so header + in-page
  // tray triggers all stay in sync.
  document.querySelectorAll('.tc').forEach(el => { el.textContent = saved.size > 0 ? saved.size : ''; });
  if (document.getElementById('tpn').classList.contains('open')) renderTray();
  // Card re-renders (via renderHomeSaved / renderTray) recreate the
  // heart + star buttons from scratch, so we don't need to hand-patch
  // every .ccard-bm here — but keep the modal save button in sync since
  // it isn't recreated.
  document.querySelectorAll(`.cmodal-save[data-live-code="${code}"]`).forEach(b => {
    b.classList.toggle('saved', saved.has(key));
    b.innerHTML = heartIcon(saved.has(key));
  });
  // Repaint every grid card carrying this code so the star appears /
  // disappears next to the heart.
  repaintCardChrome(code);
  // Keep the Home landing's Saved-Careers strip in sync.
  renderHomeSaved();
}

// Promote / demote a saved career to Top Picks. Capped at TOP_PICKS_MAX.
function toggleTopPick(code) {
  if (!code) return;
  // Star only ever shows on saved cards, so this guard is defensive.
  if (!saved.has('live-' + code)) return;
  if (topPicks.has(code)) {
    topPicks.delete(code);
    toast('Removed from top picks');
  } else {
    if (topPicks.size >= TOP_PICKS_MAX) {
      toast(`Top picks capped at ${TOP_PICKS_MAX} — unstar another one first`);
      return;
    }
    topPicks.add(code);
    toast('★ Added to top picks');
  }
  repaintCardChrome(code);
  renderHomeSaved();
  if (document.getElementById('tpn').classList.contains('open')) renderTray();
}

// Sync every grid card that carries this code — repaints the heart,
// star, and .is-top-pick body class so the card matches current state
// without a full re-render of the surrounding list.
function repaintCardChrome(code) {
  const key = 'live-' + code;
  const isSaved = saved.has(key);
  const isTop   = topPicks.has(code);
  document.querySelectorAll(`.ccard[data-live-code="${code}"]`).forEach(card => {
    card.classList.toggle('is-top-pick', isTop);
    const bm = card.querySelector('.ccard-bm');
    if (bm) {
      bm.classList.toggle('saved', isSaved);
      bm.innerHTML = heartIcon(isSaved);
    }
    // Ensure the star exists iff saved. Add/remove and update its state.
    let star = card.querySelector('.ccard-star');
    if (isSaved && !star) {
      star = document.createElement('button');
      star.className = 'ccard-star';
      star.dataset.liveCode = code;
      card.appendChild(star);
    } else if (!isSaved && star) {
      star.remove();
      star = null;
    }
    if (star) {
      star.classList.toggle('top', isTop);
      star.setAttribute('aria-label', isTop ? 'Remove from top picks' : 'Add to top picks');
      star.setAttribute('aria-pressed', String(isTop));
      star.innerHTML = starIcon(isTop);
    }
  });
}

// Sort a list of career codes so top picks come first (in insertion
// order) and the rest follow (also in insertion order).
function sortByTopPicks(codes) {
  const top = [], rest = [];
  for (const c of codes) (topPicks.has(c) ? top : rest).push(c);
  return top.concat(rest);
}

// Sort a list of career objects for browsing surfaces (Search Careers,
// Career Clusters, Bright Outlook): top picks first, other saved
// careers next, then everything else. Insertion order preserved within
// each group so ranking (fit-score, salary, etc.) still holds within.
function sortListBySaveState(list) {
  const top = [], savedTier = [], rest = [];
  for (const c of list) {
    const code = c && c.code;
    if (!code) { rest.push(c); continue; }
    if (topPicks.has(code))                top.push(c);
    else if (saved.has('live-' + code))    savedTier.push(c);
    else                                    rest.push(c);
  }
  return top.concat(savedTier).concat(rest);
}

// Backfill metadata for any saved careers we don't have details for yet.
// Used by the tray so titles always show even after a page reload that
// restored saves from the URL.
async function ensureSavedMeta() {
  const codes = [...saved]
    .filter(k => typeof k === 'string' && k.startsWith('live-'))
    .map(k => k.slice('live-'.length))
    .filter(code => !savedMeta.has(code) || !savedMeta.get(code).title || savedMeta.get(code).title === code);
  await Promise.allSettled(codes.map(async code => {
    try {
      const [info, outlook] = await Promise.all([
        onetGet(`/career/${code}`).catch(() => null),
        onetGet(`/career/${code}/outlook`).catch(() => null),
      ]);
      savedMeta.set(code, {
        title:  (info && info.title) || code,
        salary: (outlook && outlook.salary && outlook.salary.annual_median) || null,
      });
    } catch (e) { /* leave as-is */ }
  }));
}

/* ══ NEXT MOVES (Home landing modals) ══
   Three modals reachable from the Home page — Courses To Take,
   Skills and Experiences, Programs & Pathways. Each iterates the
   user's saved careers and enriches them with the relevant O*NET
   slice (knowledge / skills+work_activities / education+job_zone),
   fetching in parallel and rendering as data arrives. */

// { 'code|slice': Promise resolving to parsed JSON }
const nmSliceCache = new Map();
let nmOpenType = null; // 'courses' | 'skills' | 'pathways'

function nmSlice(code, slice) {
  const key = code + '|' + slice;
  if (nmSliceCache.has(key)) return nmSliceCache.get(key);
  const p = onetGet(`/career/${code}/details/${slice}`).catch(() => null);
  nmSliceCache.set(key, p);
  return p;
}

// Human-friendly meta for each modal.
const NM_TYPES = {
  courses: {
    title: 'Courses To Take',
    subtitle: 'Academic subjects that map to the careers you\'ve saved, ranked by how important each is to the job.',
  },
  skills: {
    title: 'Skills and Experiences',
    subtitle: 'The abilities to practice and the kinds of on-the-job activities that build them.',
  },
  pathways: {
    title: 'Programs & Pathways',
    subtitle: 'The typical education level and pathway for each of your saved careers.',
  },
};

function openNextMoves(type) {
  if (!NM_TYPES[type]) return;
  nmOpenType = type;
  const overlay = document.getElementById('nm-overlay');
  if (!overlay) return;
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  renderNextMoves();
}

function closeNextMoves() {
  const overlay = document.getElementById('nm-overlay');
  if (!overlay) return;
  overlay.classList.remove('open');
  document.body.style.overflow = '';
  nmOpenType = null;
}

// Escape untrusted strings that go into innerHTML.
function nmEsc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// Escape for a CSS/DOM id selector (career codes contain '.' and '-').
function nmSel(s) { return String(s).replace(/[^a-zA-Z0-9]/g, '_'); }

// Codes the user has saved. Reused by every renderer.
function nmSavedCodes() {
  return [...saved]
    .filter(k => typeof k === 'string' && k.startsWith('live-'))
    .map(k => k.slice('live-'.length));
}

// Career title, resolving from any of the metadata sources we might have.
function nmCareerTitle(code) {
  const meta = savedMeta.get(code);
  if (meta && meta.title && meta.title !== code) return meta.title;
  const cached = detailCache[code];
  if (cached && cached.title) return cached.title;
  return code;
}

function renderNextMoves() {
  const modal = document.getElementById('nm-modal');
  if (!modal) return;
  const type = nmOpenType;
  const cfg = NM_TYPES[type];
  const codes = nmSavedCodes();
  const head = `
    <div class="nm-head">
      <div class="nm-head-l">
        <h2 id="nm-title">${nmEsc(cfg.title)}</h2>
        <p>${nmEsc(cfg.subtitle)}</p>
      </div>
      <button class="cmodal-close" data-nm-close aria-label="Close">✕</button>
    </div>`;
  if (!codes.length) {
    modal.innerHTML = head + `
      <div class="nm-body">
        <div class="nm-empty">You haven't saved any careers yet. Save a career from your quiz results, the explore page, or a cluster to see recommendations here.</div>
      </div>`;
    return;
  }
  // Render skeleton per career; each renderer fills its own <div>.
  modal.innerHTML = head + `
    <div class="nm-body">
      ${codes.map(code => `
        <div class="nm-career" id="nm-career-${nmSel(code)}">
          <div class="nm-career-head">
            <h3 class="nm-career-title">${nmEsc(nmCareerTitle(code))}</h3>
            <button class="nm-view-btn" data-nm-view="${nmEsc(code)}" type="button">
              View Career
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m13 5 7 7-7 7"/></svg>
            </button>
          </div>
          <div class="nm-career-body" data-nm-slot="${nmEsc(code)}">
            <div class="nm-loading">Loading from O*NET…</div>
          </div>
        </div>
      `).join('')}
    </div>`;
  modal.scrollTop = 0;
  // Kick off the per-career fetch pipeline.
  if (type === 'courses') codes.forEach(nmFillCourses);
  else if (type === 'skills') codes.forEach(nmFillSkills);
  else if (type === 'pathways') codes.forEach(nmFillPathways);
}

// Utility: sort elements by importance descending, take top N with a
// nonzero importance and a name we can show.
function nmTopElements(data, n) {
  const els = (data && data.element) || [];
  return els
    .filter(e => e && e.name && (e.importance == null || e.importance > 0))
    .sort((a, b) => (b.importance || 0) - (a.importance || 0))
    .slice(0, n);
}

async function nmFillCourses(code) {
  const slot = document.querySelector(`[data-nm-slot="${cssAttr(code)}"]`);
  if (!slot) return;
  const data = await nmSlice(code, 'knowledge');
  const top = nmTopElements(data, 6);
  if (!top.length) {
    slot.innerHTML = `<div class="nm-empty" style="padding:14px 12px">O*NET didn't return knowledge areas for this career.</div>`;
    return;
  }
  slot.innerHTML = `
    <div class="nm-subhead">Top academic subjects</div>
    <ul class="nm-list">
      ${top.map(e => `<li>
        <div>
          <div><strong>${nmEsc(e.name)}</strong></div>
          <div class="nm-list-sub">${nmEsc(e.description)}</div>
        </div>
      </li>`).join('')}
    </ul>`;
}

async function nmFillSkills(code) {
  const slot = document.querySelector(`[data-nm-slot="${cssAttr(code)}"]`);
  if (!slot) return;
  const [skillsData, activitiesData] = await Promise.all([
    nmSlice(code, 'skills'),
    nmSlice(code, 'work_activities'),
  ]);
  const topSkills = nmTopElements(skillsData, 5);
  const topActivities = nmTopElements(activitiesData, 4);
  const hasSkills = !!topSkills.length;
  const hasActs = !!topActivities.length;
  if (!hasSkills && !hasActs) {
    slot.innerHTML = `<div class="nm-empty" style="padding:14px 12px">O*NET didn't return skills for this career.</div>`;
    return;
  }
  slot.innerHTML = `
    ${hasSkills ? `<div class="nm-subhead">Skills to build</div>
      <ul class="nm-list">
        ${topSkills.map(e => `<li>
          <div>
            <div><strong>${nmEsc(e.name)}</strong></div>
            <div class="nm-list-sub">${nmEsc(e.description)}</div>
          </div>
        </li>`).join('')}
      </ul>` : ''}
    ${hasActs ? `<div class="nm-subhead">Ways to get real-world experience</div>
      <ul class="nm-list">
        ${topActivities.map(e => `<li>
          <div>
            <div><strong>${nmEsc(e.name)}</strong></div>
            <div class="nm-list-sub">${nmEsc(e.description)}</div>
          </div>
        </li>`).join('')}
      </ul>` : ''}`;
}

async function nmFillPathways(code) {
  const slot = document.querySelector(`[data-nm-slot="${cssAttr(code)}"]`);
  if (!slot) return;
  const [eduData, zoneData, summary] = await Promise.all([
    nmSlice(code, 'education'),
    nmSlice(code, 'job_zone'),
    // Summary gives us the tags (apprenticeship, bright_outlook, etc.)
    onetGet(`/career/${code}`).catch(() => null),
  ]);
  const eduRows = (eduData && eduData.response) || [];
  const topEdu = eduRows
    .filter(r => r && r.title && r.percentage_of_respondents != null)
    .sort((a, b) => b.percentage_of_respondents - a.percentage_of_respondents)
    .slice(0, 4);
  const tags = (summary && summary.tags) || {};
  const zoneTitle = zoneData && zoneData.title
    ? String(zoneData.title).replace(/^Job Zone [A-Za-z]+:\s*/, '')
    : '';
  const parts = [];
  if (zoneTitle || (zoneData && zoneData.education)) {
    parts.push(`<div class="nm-subhead">Preparation needed</div>
      <div>${zoneTitle ? `<div style="font-weight:900;color:var(--navy);margin-bottom:4px">${nmEsc(zoneTitle)}</div>` : ''}${zoneData && zoneData.education ? `<div class="nm-list-sub">${nmEsc(zoneData.education)}</div>` : ''}</div>`);
  }
  if (topEdu.length) {
    parts.push(`<div class="nm-subhead">What most workers have</div>
      <div class="nm-tags">
        ${topEdu.map(r => `<span class="nm-tag${r.percentage_of_respondents >= 50 ? ' blue' : ''}">${nmEsc(r.title)} · ${r.percentage_of_respondents}%</span>`).join('')}
      </div>`);
  }
  const badges = [];
  if (tags.apprenticeship) badges.push('<span class="nm-tag yellow">🔨 Registered apprenticeship available</span>');
  if (tags.bright_outlook) badges.push('<span class="nm-tag">☀ Bright Outlook</span>');
  if (tags.stem) badges.push('<span class="nm-tag">STEM</span>');
  if (tags.green) badges.push('<span class="nm-tag">Green economy</span>');
  if (badges.length) {
    parts.push(`<div class="nm-subhead">Signals</div><div class="nm-tags">${badges.join('')}</div>`);
  }
  if (tags.apprenticeship) {
    parts.push(`<div class="nm-actions">
      <a href="https://www.apprenticeship.gov/apprenticeship-job-finder?onetCode=${nmEsc(code)}" target="_blank" rel="noopener">Find apprenticeships →</a>
    </div>`);
  }
  slot.innerHTML = parts.join('');
}

// CSS attribute selectors don't play nicely with '.' — escape for safety.
function cssAttr(s) { return String(s).replace(/([\\"])/g, '\\$1'); }

/* ══ HOME LANDING ══
   Renders the "Saved Careers" strip on #panel-home and toggles the
   "Your Next Moves" section based on whether the user has saved
   anything yet. Called at boot and after every toggleLiveSave. */
function renderHomeSaved() {
  const el = document.getElementById('home-saved');
  if (!el) return;
  const codes = [...saved]
    .filter(k => typeof k === 'string' && k.startsWith('live-'))
    .map(k => k.slice('live-'.length));
  // Top picks first, then the rest — insertion order preserved within
  // each group.
  const sorted = sortByTopPicks(codes);
  if (!sorted.length) {
    el.classList.remove('cgrid');
    el.innerHTML = `<div class="home-saved-empty">
      Nothing saved yet. Hit the heart on any career (from your quiz results,
      the explore page, or a cluster) and it'll land here.
    </div>`;
  } else {
    el.classList.add('cgrid');
    el.innerHTML = sorted.map(code => {
      const meta = savedMeta.get(code) || { title: code, salary: null };
      const cached = detailCache[code] || {
        tags: {},
        salary: { median: meta.salary || 0 },
      };
      return buildLiveCard(
        { title: meta.title, isMatch: false },
        cached,
        code,
        'home',
        true
      );
    }).join('');
    // Background-backfill titles / outlook for anything we don't have.
    ensureSavedMeta();
  }
  // 'X of 5 prioritized' chip on the Home Saved section header —
  // hidden entirely until at least one save exists.
  const chip = document.getElementById('home-priority-chip');
  const count = document.getElementById('home-priority-count');
  if (chip) chip.style.display = sorted.length ? '' : 'none';
  if (count) count.textContent = topPicks.size;
  const nm = document.getElementById('home-next-moves');
  if (nm) nm.style.display = sorted.length ? '' : 'none';
}

/* ══ TRAY ══ */
function openTray() { renderTray(); document.getElementById('tov').classList.add('open'); document.getElementById('tpn').classList.add('open'); }
function closeTray() { document.getElementById('tov').classList.remove('open'); document.getElementById('tpn').classList.remove('open'); }
function renderTray() {
  const b = document.getElementById('tbody');
  if (!saved.size) {
    b.classList.remove('cgrid');
    b.innerHTML = `<div class="tempty"><div style="margin-bottom:12px;color:var(--ts)">${heartIcon(false, 28)}</div><p>No saved careers yet.<br>Tap the heart on any career to save it here.</p></div>`;
    return;
  }
  const codes = [...saved]
    .filter(k => typeof k === 'string' && k.startsWith('live-'))
    .map(k => k.slice('live-'.length));
  const sorted = sortByTopPicks(codes); // top picks first, then the rest.
  // Render saved entries with the same .ccard component used everywhere
  // else (Find My Career, Clusters, Bright Outlook, Related). The heart
  // is always 'saved' here; clicking it removes the career. Tapping the
  // card body opens the modal — same as the rest of the app.
  b.classList.add('cgrid');
  b.innerHTML = sorted.map(code => {
    const meta = savedMeta.get(code) || { title: code, salary: null };
    // Shape an object that buildLiveCard understands: needs c.title and
    // a cached entry with .tags + .salary.median for the salary pill.
    const c = { title: meta.title, isMatch: false };
    const cached = detailCache[code] || {
      tags: {},
      salary: { median: meta.salary || 0 },
    };
    // Always pass isSaved=true so the heart renders filled. Pass a
    // tray-specific prefix so any future modal routing can tell where
    // the click came from.
    return buildLiveCard(c, cached, code, 'tray', true);
  }).join('');
  // Kick off background backfill if any titles are missing. Snapshot the
  // current titles before the fetch so we only re-render when something
  // ACTUALLY changed — otherwise a network-failed backfill (which falls
  // back to title=code) re-triggers ensureSavedMeta in a tight loop and
  // freezes the page.
  const beforeSnapshot = new Map(
    [...savedMeta].map(([c, m]) => [c, m && m.title])
  );
  ensureSavedMeta().then(() => {
    if (!document.getElementById('tpn').classList.contains('open')) return;
    let changed = false;
    savedMeta.forEach((m, c) => {
      if (m && beforeSnapshot.get(c) !== m.title) changed = true;
    });
    if (changed) renderTray();
  });
}

/* ══ RESTORE FROM URL ══ */
function restoreFromURL() {
  try {
    const s = new URLSearchParams(location.search).get('state');
    if (!s) return;
    const d = JSON.parse(atob(s));
    // Saved careers are stored as 'live-{onetCode}' keys. Legacy numeric
    // entries from the curated-CAREERS era are no longer meaningful and are
    // silently dropped.
    if (Array.isArray(d.saved)) {
      d.saved.forEach(k => {
        if (typeof k === 'string' && k.startsWith('live-')) saved.add(k);
      });
    }
    // Top picks restored alongside the saves. Bare career codes.
    if (Array.isArray(d.topPicks)) {
      d.topPicks.forEach(c => {
        if (typeof c === 'string' && saved.has('live-' + c) && topPicks.size < TOP_PICKS_MAX) {
          topPicks.add(c);
        }
      });
    }
    // Every count badge with class .tc gets the number so header + in-page
  // tray triggers all stay in sync.
  document.querySelectorAll('.tc').forEach(el => { el.textContent = saved.size > 0 ? saved.size : ''; });
    if (d.results) { lastResults = d.results; renderResults(d.results); }
    if (saved.size) ensureSavedMeta();
    toast('✓ Your saved results have been restored!');
  } catch(e) { console.warn('Restore failed', e); }
}

/* ══ CLUSTERS ══ */
// Used to render the Career Clusters editorial grid. img/desc are for the
// card; subs lists O*NET's official sub-clusters (shown as chips after a
// cluster is selected — O*NET's API doesn't filter by sub-cluster, so they
// surface as context, not as a working filter).
const CLUSTERS = [
  {name:'Advanced Manufacturing',        icon:'⚙️',  img:'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80', desc:'Make products using machines, robotics, and smart technology.', subs:['Engineering','Industrial Machinery','Production & Automation','Robotics','Safety & Quality Assurance']},
  {name:'Agriculture',                   icon:'🌾',  img:'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80', desc:'Work with plants, animals, and the environment to grow food.',   subs:['Agribusiness','Agricultural Technology & Automation','Animal Systems','Food Science & Processing','Plant Systems','Water Systems']},
  {name:'Arts, Entertainment & Design',  icon:'🎨',  img:'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&q=80', desc:'Express ideas through art, performance, and digital creation.',   subs:['Design & Digital Arts','Fashion & Interiors','Fine Arts','Lighting & Sound Technology','Media Production & Broadcasting','Performing Arts']},
  {name:'Construction',                  icon:'🏗️', img:'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80', desc:'Design and build homes, buildings, roads, and other structures.', subs:['Architecture & Civil Engineering','Construction Planning & Development','Equipment Operation & Maintenance','Skilled Trades']},
  {name:'Digital Technology',            icon:'💻',  img:'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80', desc:'Use computers, code, and smart systems to solve problems.',       subs:['Data Science & AI','Network Systems & Cybersecurity','IT Support & Services','Software Solutions','Unmanned Vehicle Technology','Web & Cloud']},
  {name:'Education',                     icon:'📚',  img:'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80', desc:'Help others learn, grow, and reach their goals.',                 subs:['Early Childhood Development','Education Administration & Leadership','Learner Support & Community Engagement','Teaching, Training & Facilitation']},
  {name:'Energy & Natural Resources',    icon:'⚡',  img:'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=800&q=80', desc:'Power and protect the planet through energy and natural systems.',subs:['Clean & Alternative Energy','Conservation & Land Management','Ecological Research & Development','Environmental Protection','Resource Extraction','Utilities']},
  {name:'Financial Services',            icon:'💰',  img:'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80', desc:'Help people and businesses make smart money decisions.',          subs:['Accounting','Banking & Credit','Financial Strategy & Investments','Insurance','Real Estate']},
  {name:'Healthcare & Human Services',   icon:'🏥',  img:'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80', desc:"Take care of people's physical and emotional health.",            subs:['Behavioral & Mental Health','Biotechnology Research & Development','Community & Social Services','Health Data & Administration','Personal Care Services','Physical Health']},
  {name:'Hospitality, Events & Tourism', icon:'🍽️', img:'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80', desc:'Help people enjoy travel, dining, and other experiences.',        subs:['Accommodations','Conferences & Events','Culinary & Food Services','Travel & Leisure']},
  {name:'Management & Entrepreneurship', icon:'🚀',  img:'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80', desc:'Lead people, start businesses, and bring new ideas to life.',     subs:['Business Information Management','Entrepreneurship & Small Business','Leadership & Operations','Project Management','Regulation']},
  {name:'Marketing & Sales',             icon:'📣',  img:'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&q=80', desc:'Communicate ideas and help people find products they love.',     subs:['Marketing & Advertising','Market Research, Analytics & Ethics','Retail & Customer Experience','Strategic Sales']},
  {name:'Public Service & Safety',       icon:'🛡️', img:'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=800&q=80', desc:'Protect people and help communities stay safe and supported.',    subs:['Emergency Response','Judicial Systems','Local, State & Federal Services','Military & National Security','Public Safety']},
  {name:'Supply Chain & Transportation', icon:'🚚',  img:'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80', desc:'Move people, goods, and information safely and efficiently.',    subs:['Air & Space Transportation','Ground & Rail Transportation','Maintenance & Repair','Marine Transportation','Planning & Logistics','Purchasing & Warehousing']},
];

// Map our local cluster names to O*NET career-cluster codes
// (from GET /mnm/career_clusters). Note the Oxford comma differences in
// "Arts, Entertainment, & Design" and "Hospitality, Events, & Tourism"
// — our local names drop the comma but the codes still map.
const CLUSTER_CODES = {
  'Advanced Manufacturing':        '010100',
  'Construction':                  '010200',
  'Supply Chain & Transportation': '010300',
  'Arts, Entertainment & Design':  '020100',
  'Hospitality, Events & Tourism': '020200',
  'Financial Services':            '030100',
  'Education':                     '040100',
  'Healthcare & Human Services':   '040200',
  'Public Service & Safety':       '040300',
  'Agriculture':                   '050100',
  'Energy & Natural Resources':    '050200',
  'Digital Technology':            '060100',
  'Management & Entrepreneurship': '060200',
  'Marketing & Sales':             '060300',
};

// Pagination state for the live cluster results.
/* ══ PROGRAM FINDER (MOCK) ══ */
const ZIP_REGIONS = {
  '100':'New York City, NY','101':'New York City, NY','102':'New York City, NY','103':'Staten Island, NY','104':'Bronx, NY','105':'Westchester, NY','106':'Westchester, NY','107':'Westchester, NY','108':'Westchester, NY','109':'Westchester, NY',
  '110':'Queens, NY','111':'Queens, NY','112':'Brooklyn, NY','113':'Queens, NY','114':'Queens, NY','115':'Queens, NY','116':'Queens, NY','117':'Long Island, NY','118':'Long Island, NY','119':'Long Island, NY',
  '200':'Washington, DC','201':'Northern VA','202':'Washington, DC','203':'Fairfield County, CT','060':'Hartford, CT','061':'Hartford, CT','062':'New Haven, CT',
  '021':'Boston, MA','022':'Boston, MA','023':'South Shore, MA','024':'Cape Cod, MA','010':'Springfield, MA','011':'Springfield, MA','012':'Pittsfield, MA',
  '770':'Houston, TX','750':'Dallas, TX','733':'Houston, TX','787':'Austin, TX','782':'San Antonio, TX',
  '900':'Los Angeles, CA','902':'Los Angeles, CA','940':'San Francisco, CA','941':'San Francisco, CA','945':'Oakland, CA','925':'San Jose, CA',
  '600':'Chicago, IL','601':'Chicago, IL','606':'Chicago, IL',
  '300':'Atlanta, GA','303':'Atlanta, GA',
  '331':'Miami, FL','320':'Jacksonville, FL','327':'Orlando, FL','337':'Tampa, FL',
  '980':'Seattle, WA','981':'Seattle, WA','972':'Portland, OR',
  '850':'Phoenix, AZ','852':'Phoenix, AZ',
  '800':'Denver, CO','802':'Denver, CO',
  '481':'Detroit, MI','482':'Detroit, MI',
  '191':'Philadelphia, PA','190':'Philadelphia, PA'
};

const REGION_SCHOOLS = {
  'New York City, NY': {
    trade:[
      {name:'Apex Technical School',type:'Trade School',address:'635 Ave of the Americas, New York, NY'},
      {name:'Manhattan Institute',type:'Vocational School',address:'214 W 29th St, New York, NY'},
      {name:'NYCCT Trade Programs',type:'Trade School',address:'300 Jay St, Brooklyn, NY'},
    ],
    community:[
      {name:'Borough of Manhattan Community College',type:'Community College',address:'199 Chambers St, New York, NY',accred:'Middle States Accredited'},
      {name:'Bronx Community College',type:'Community College',address:'2155 University Ave, Bronx, NY',accred:'Middle States Accredited'},
      {name:'LaGuardia Community College',type:'Community College',address:'31-10 Thomson Ave, Queens, NY',accred:'Middle States Accredited'},
      {name:'Kingsborough Community College',type:'Community College',address:'2001 Oriental Blvd, Brooklyn, NY',accred:'Middle States Accredited'},
    ],
    university:[
      {name:'City College of New York',type:'4-Year University',address:'160 Convent Ave, New York, NY',accred:'Middle States Accredited'},
      {name:'Hunter College',type:'4-Year University',address:'695 Park Ave, New York, NY',accred:'Middle States Accredited'},
      {name:'Baruch College',type:'4-Year University',address:'55 Lexington Ave, New York, NY',accred:'Middle States Accredited'},
    ]
  },
  'Long Island, NY': {
    trade:[
      {name:'Lincoln Technical Institute',type:'Trade School',address:'5 Aerial Way, Syosset, NY'},
      {name:'BOCES Career & Technical Education',type:'Trade School',address:'507 Deer Park Rd, Dix Hills, NY'},
    ],
    community:[
      {name:'Nassau Community College',type:'Community College',address:'1 Education Dr, Garden City, NY',accred:'Middle States Accredited'},
      {name:'Suffolk County Community College',type:'Community College',address:'533 College Rd, Selden, NY',accred:'Middle States Accredited'},
    ],
    university:[
      {name:'Hofstra University',type:'4-Year University',address:'100 Hofstra University, Hempstead, NY',accred:'Middle States Accredited'},
      {name:'Stony Brook University',type:'4-Year University',address:'100 Nicolls Rd, Stony Brook, NY',accred:'Middle States Accredited'},
    ]
  },
  'Boston, MA': {
    trade:[
      {name:'Porter and Chester Institute',type:'Trade School',address:'670 Lordship Blvd, Stratford, MA'},
      {name:'Lincoln Technical Institute',type:'Trade School',address:'5 Middlesex Ave, Somerville, MA'},
    ],
    community:[
      {name:'Bunker Hill Community College',type:'Community College',address:'250 New Rutherford Ave, Boston, MA',accred:'NECHE Accredited'},
      {name:'Roxbury Community College',type:'Community College',address:'1234 Columbus Ave, Boston, MA',accred:'NECHE Accredited'},
      {name:'Middlesex Community College',type:'Community College',address:'591 Springs Rd, Bedford, MA',accred:'NECHE Accredited'},
    ],
    university:[
      {name:'University of Massachusetts Boston',type:'4-Year University',address:'100 Morrissey Blvd, Boston, MA',accred:'NECHE Accredited'},
      {name:'Northeastern University',type:'4-Year University',address:'360 Huntington Ave, Boston, MA',accred:'NECHE Accredited'},
    ]
  },
  'Houston, TX': {
    trade:[
      {name:'Texas School of Business',type:'Trade School',address:'711 E Airtex Dr, Houston, TX'},
      {name:'Fortis Institute Houston',type:'Vocational School',address:'9990 Richmond Ave, Houston, TX'},
    ],
    community:[
      {name:'Houston Community College',type:'Community College',address:'3100 Main St, Houston, TX',accred:'SACSCOC Accredited'},
      {name:'San Jacinto College',type:'Community College',address:'8060 Spencer Hwy, Pasadena, TX',accred:'SACSCOC Accredited'},
      {name:'Lone Star College',type:'Community College',address:'5000 Research Forest Dr, The Woodlands, TX',accred:'SACSCOC Accredited'},
    ],
    university:[
      {name:'University of Houston',type:'4-Year University',address:'4800 Calhoun Rd, Houston, TX',accred:'SACSCOC Accredited'},
      {name:'Texas Southern University',type:'4-Year University',address:'3100 Cleburne St, Houston, TX',accred:'SACSCOC Accredited'},
    ]
  },
  'Dallas, TX': {
    trade:[
      {name:'Lincoln Tech Dallas',type:'Trade School',address:'2915 Alouette Dr, Grand Prairie, TX'},
      {name:'Caris College',type:'Vocational School',address:'8585 N Stemmons Fwy, Dallas, TX'},
    ],
    community:[
      {name:'Dallas College',type:'Community College',address:'1402 Corinth St, Dallas, TX',accred:'SACSCOC Accredited'},
      {name:'Tarrant County College',type:'Community College',address:'1500 Houston St, Fort Worth, TX',accred:'SACSCOC Accredited'},
    ],
    university:[
      {name:'University of Texas at Dallas',type:'4-Year University',address:'800 W Campbell Rd, Richardson, TX',accred:'SACSCOC Accredited'},
      {name:'Southern Methodist University',type:'4-Year University',address:'6425 Boaz St, Dallas, TX',accred:'SACSCOC Accredited'},
    ]
  },
  'Los Angeles, CA': {
    trade:[
      {name:'Advance Beauty College',type:'Trade School',address:'14100 Rosecrans Ave, La Mirada, CA'},
      {name:'Los Angeles Trade Technical College',type:'Trade School',address:'400 W Washington Blvd, Los Angeles, CA'},
    ],
    community:[
      {name:'Los Angeles City College',type:'Community College',address:'855 N Vermont Ave, Los Angeles, CA',accred:'ACCJC Accredited'},
      {name:'Santa Monica College',type:'Community College',address:'1900 Pico Blvd, Santa Monica, CA',accred:'ACCJC Accredited'},
      {name:'East Los Angeles College',type:'Community College',address:'1301 Avenida Cesar Chavez, Monterey Park, CA',accred:'ACCJC Accredited'},
    ],
    university:[
      {name:'California State University, LA',type:'4-Year University',address:'5151 State University Dr, Los Angeles, CA',accred:'WSCUC Accredited'},
      {name:'UCLA',type:'4-Year University',address:'405 Hilgard Ave, Los Angeles, CA',accred:'WSCUC Accredited'},
    ]
  },
  'Chicago, IL': {
    trade:[
      {name:'Coyne College',type:'Trade School',address:'330 N Green St, Chicago, IL'},
      {name:'Lincoln Technical Institute',type:'Trade School',address:'8317 W North Ave, Melrose Park, IL'},
    ],
    community:[
      {name:'City Colleges of Chicago',type:'Community College',address:'226 W Jackson Blvd, Chicago, IL',accred:'HLC Accredited'},
      {name:'Triton College',type:'Community College',address:'2000 5th Ave, River Grove, IL',accred:'HLC Accredited'},
      {name:'College of DuPage',type:'Community College',address:'425 Fawell Blvd, Glen Ellyn, IL',accred:'HLC Accredited'},
    ],
    university:[
      {name:'University of Illinois Chicago',type:'4-Year University',address:'601 S Morgan St, Chicago, IL',accred:'HLC Accredited'},
      {name:'DePaul University',type:'4-Year University',address:'1 E Jackson Blvd, Chicago, IL',accred:'HLC Accredited'},
    ]
  },
  'default': {
    trade:[
      {name:'Lincoln Technical Institute',type:'Trade School',address:'Local Campus — see website for address'},
      {name:'Fortis Institute',type:'Vocational School',address:'Local Campus — see website for address'},
      {name:'Porter and Chester Institute',type:'Trade School',address:'Local Campus — see website for address'},
    ],
    community:[
      {name:'Local Community College',type:'Community College',address:'Search community colleges in your area',accred:'Regionally Accredited'},
      {name:'Regional Technical College',type:'Community College',address:'Search technical colleges in your area',accred:'Regionally Accredited'},
    ],
    university:[
      {name:'Regional State University',type:'4-Year University',address:'Search state universities in your area',accred:'Regionally Accredited'},
      {name:'Local Private University',type:'4-Year University',address:'Search universities in your area',accred:'Regionally Accredited'},
    ]
  }
};

function getRegionFromZip(zip) {
  const prefix3 = zip.substring(0,3);
  const prefix2 = zip.substring(0,2);
  for (const [key, val] of Object.entries(ZIP_REGIONS)) {
    if (key === prefix3 || key === prefix2) return val;
  }
  return 'default';
}

function handleZipSearch(pid, careerTitle, onetCode) {
  const zipEl = document.getElementById('zip-' + pid);
  const resultsEl = document.getElementById('zip-results-' + pid);
  const zip = zipEl ? zipEl.value.trim() : '';

  if (!zip || zip.length !== 5 || !/^\d+$/.test(zip)) {
    if (resultsEl) resultsEl.innerHTML = `<p style="font-size:12px;color:#FF6B6B;">Please enter a valid 5-digit zip code.</p>`;
    return;
  }

  resultsEl.innerHTML = `<div style="font-size:15px;color:var(--ts);padding:10px 0">Searching for programs near ${zip}...</div>`;

  setTimeout(() => {
    const region = getRegionFromZip(zip);
    const regionData = REGION_SCHOOLS[region] || REGION_SCHOOLS['default'];
    // Show the full pool of nearby schools (community + university + trade).
    // The previous pathway-based filtering relied on local curated data
    // that's no longer present; can re-narrow later via O*NET job_zone or
    // /details/education if we resurface the zip-search UI.
    const pool = [
      ...(regionData.community || []),
      ...(regionData.university || []),
      ...(regionData.trade || []),
    ];

    const results = pool.slice(0, 4);
    const regionLabel = region === 'default' ? `zip code ${zip}` : region;

    resultsEl.innerHTML = `
      <div style="font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:.1em;color:var(--blue);margin-bottom:10px">
        ${results.length} programs found near ${regionLabel}
      </div>
      <div style="display:flex;flex-direction:column;gap:8px">
        ${results.map(p => {
          const degrees = p.degrees || (p.type==='Trade School'?['Certificate']:p.type==='Community College'?["Associate's Degree",'Certificate']:["Bachelor's Degree"]);
          const accred = p.accred || 'Accredited';
          const url = p.url || '#';
          return `<div style="background:var(--off);border:1px solid var(--mg);border-radius:var(--rmd);padding:13px 14px">
            <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin-bottom:6px">
              <div>
                <div style="font-size:15px;font-weight:900;text-transform:uppercase;color:var(--navy);margin-bottom:2px">${p.name}</div>
                <div style="font-size:11px;color:var(--ts);">${p.type}</div>
              </div>
              <a href="${url}" target="_blank" style="background:var(--yellow);color:var(--navy);border:none;border-radius:var(--rf);padding:6px 12px;font-size:11px;font-weight:900;text-transform:uppercase;text-decoration:none;white-space:nowrap;flex-shrink:0">Visit →</a>
            </div>
            <div style="font-size:11px;color:var(--ts);margin-bottom:6px">${p.address}</div>
            <div style="display:flex;flex-wrap:wrap;gap:5px;align-items:center">
              ${degrees.map(d=>`<span style="background:rgba(255,215,16,.12);border:1px solid rgba(255,215,16,.3);border-radius:var(--rf);padding:2px 8px;font-size:11px;color:rgba(255,215,16,.9)">${d}</span>`).join('')}
              <span style="background:rgba(0,131,255,.1);border:1px solid rgba(0,131,255,.25);border-radius:var(--rf);padding:2px 8px;font-size:11px;color:var(--blue)">${accred}</span>
            </div>
          </div>`;
        }).join('')}
      </div>
      <p style="font-size:11px;color:var(--ts);margin-top:10px;line-height:1.5">🔧 Mock data for demo. Real results via CareerOneStop Training Finder API using zip ${zip} + O*NET code <code style="font-size:11px">${onetCode}</code>.</p>`;
  }, 800);
}

/* ══ THEME ══ */
function applyTheme(mode) {
  const dark = mode === 'dark';
  document.body.classList.toggle('dark', dark);
  const btn = document.getElementById('btn-theme');
  if (btn) {
    btn.textContent = dark ? '☀️' : '🌙';
    btn.title = dark ? 'Switch to light mode' : 'Switch to dark mode';
  }
}
function toggleTheme() {
  const next = document.body.classList.contains('dark') ? 'light' : 'dark';
  try { localStorage.setItem('theme', next); } catch (e) { /* private mode */ }
  applyTheme(next);
}

/* ══ INIT ══ */
document.addEventListener('DOMContentLoaded', function() {
  // Theme — restore saved choice, otherwise honor the user's OS preference.
  let saved = null;
  try { saved = localStorage.getItem('theme'); } catch (e) {}
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(saved || (prefersDark ? 'dark' : 'light'));

  restoreFromURL();
  renderClusterGrid();
  syncProfileUI();
  updateFbValueLabels();
  updateSearch();
  // Landing page: paint the Saved-Careers strip and toggle Next Moves.
  renderHomeSaved();
  // Fetch the O*NET Interest Profiler item bank + render into #qwrap.
  initQuiz();
  // Populate the cluster-card career-count pills once totals arrive.
  loadClusterCounts();
});

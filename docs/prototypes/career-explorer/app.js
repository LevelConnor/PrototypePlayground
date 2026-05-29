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

  // ASSESSMENT rating buttons
  const sb = t.closest('.sb');
  if (sb && sb.closest('#qwrap')) { rate(sb); return; }

  // ASSESSMENT submit / reset
  if (t.id === 'btn-submit') { submitAssessment(); return; }
  if (t.id === 'btn-reset') { resetAssessment(); return; }
  if (t.id === 'btn-retake') { resetAssessment(); return; }
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
  if (t.id === 'open-tray-btn' || t.closest('#open-tray-btn')) { openTray(); return; }
  if (t.id === 'btn-close-tray') { closeTray(); return; }
  if (t.id === 'tov') { closeTray(); return; }
  if (t.id === 'btn-tray-link') { copyTrayLink(); return; }
  if (t.id === 'btn-tray-print') { window.print(); return; }

  // Bright Outlook "Show more" pagination button
  if (t.id === 'bo-more-btn') { loadBrightOutlookPage(); return; }

  // Cluster pagination ("Show more" inside the slist)
  if (t.id === 'slist-more-btn' && loadedClusterCode_v2) {
    loadClusterIntoSlist(loadedClusterCode_v2, activeCluster);
    return;
  }

  // Filter-mode tabs (Work style / Area / Cluster) — pure view state,
  // swaps which chip group is visible. Doesn't change any filter.
  const fmt = t.closest('.fmtab');
  if (fmt && fmt.dataset.mode) { setFilterMode(fmt.dataset.mode); return; }

  // Interest profile expand/collapse (top 3 ↔ all 6)
  if (t.closest('#ip-toggle')) { toggleInterestProfile(); return; }

  // Work-style (RIASEC) chip. Toggle membership in activeR.
  const rc = t.closest('.rc[data-r]');
  if (rc && rc.dataset.r) {
    const letter = rc.dataset.r;
    if (activeR.has(letter)) activeR.delete(letter);
    else activeR.add(letter);
    if (activeR.size > 0) {
      document.getElementById('sinput').value = '';
      activeCluster = '';
    }
    updateSearch();
    return;
  }

  // Career cluster chip — single-active toggle.
  const cc = t.closest('.cluster-chip[data-cluster]');
  if (cc && cc.dataset.cluster) {
    const name = cc.dataset.cluster;
    activeCluster = (activeCluster === name) ? '' : name;
    if (activeCluster) document.getElementById('sinput').value = '';
    updateSearch();
    return;
  }

  // Area chips — single-active keyword shortcut.
  const schip = t.closest('.schip');
  if (schip && schip.dataset.q) {
    const input = document.getElementById('sinput');
    const wasActive = schip.classList.contains('active');
    document.querySelectorAll('.schip').forEach(c => c.classList.remove('active'));
    if (wasActive) {
      input.value = '';
    } else {
      schip.classList.add('active');
      input.value = schip.dataset.q;
      activeCluster = '';
    }
    updateSearch();
    return;
  }
  // CAREER ROWS (always live now)
  const crow = t.closest('.crow');
  if (crow && crow.dataset.liveCode) {
    const bm = t.closest('.bmbtn');
    if (bm) {
      e.stopPropagation();
      toggleLiveSave(crow.dataset.liveCode);
      return;
    }
    openLiveDetail(crow.dataset.liveCode, crow.dataset.prefix || 'sd');
    return;
  }

  // CAREER DETAIL TABS
  const cdt = t.closest('.cdt');
  if (cdt && cdt.dataset.panel) { switchDTab(cdt); return; }

  // SAVE button inside drawer (live)
  const cdbm = t.closest('.cdbm');
  if (cdbm && cdbm.dataset.liveCode) { toggleLiveSave(cdbm.dataset.liveCode); return; }

  // RELATED career click inside live (O*NET) drawer
  const liveRel = t.closest('[data-live-rel]');
  if (liveRel) { openLiveDetail(liveRel.dataset.liveRel, liveRel.dataset.prefix || 'sd'); return; }


});

// Search input — use input event
document.addEventListener('input', function(e) {
  if (e.target.id === 'sinput') doSearch();
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
const saved = new Set(), answered = {};
let lastResults = null;
const activeR = new Set();      // active RIASEC chips (work-style filter)
let activeCluster = '';         // active cluster filter (one at a time)
// RIASEC palette. Updated for the new light-mode page: E and C used to be
// pale steel-blue and pale yellow (designed against a dark background) and
// were illegible on white. Replaced with deeper, well-saturated tones that
// keep the same semantic associations.
const BC = {R:'#0083FF',I:'#F4845F',A:'#9B72CF',S:'#E5A800',E:'#4F6F8A',C:'#9B8E2E'};
const RI = {
  R:{name:'Realistic — The Builder',short:'Realistic',desc:'Hands-on work, tools, machines, and physical tasks.',bg:'#0A0F2E'},
  I:{name:'Investigative — The Thinker',short:'Investigative',desc:'Research, analysis, science, and solving complex problems.',bg:'#1D0E32'},
  A:{name:'Artistic — The Creator',short:'Artistic',desc:'Design, writing, performance, and creative expression.',bg:'#1a0a00'},
  S:{name:'Social — The Helper',short:'Social',desc:'Teaching, counseling, healthcare, and supporting others.',bg:'#002E01'},
  E:{name:'Enterprising — The Leader',short:'Enterprising',desc:'Business, sales, management, and persuading others.',bg:'#1a003a'},
  C:{name:'Conventional — The Organizer',short:'Conventional',desc:'Data, systems, finance, and structured processes.',bg:'#1a1a0a'}
};

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
  document.getElementById('panel-' + id).classList.add('active');
  if (btn) btn.classList.add('active');
  else document.querySelector('.nt[data-tab="'+id+'"]').classList.add('active');
}
function goToAssessment() { switchTab('assessment'); window.scrollTo({top:0,behavior:'smooth'}); }
function goToSearch() {
  switchTab('search');
  window.scrollTo({top:0,behavior:'smooth'});
}
/* ══ ASSESSMENT ══ */
function rate(btn) {
  const row = btn.closest('.qr');
  row.querySelectorAll('.sb').forEach(b => b.className = 'sb');
  btn.classList.add('s' + btn.dataset.v);
  const idx = Array.from(document.querySelectorAll('.qr')).indexOf(row);
  answered[idx] = {type: row.dataset.t, val: parseInt(btn.dataset.v)};
  const n = Object.keys(answered).length;
  document.getElementById('qans').textContent = n + ' of 30 answered';
  document.getElementById('pf').style.width = Math.round((n/30)*100) + '%';
}

function submitAssessment() {
  if (Object.keys(answered).length < 20) { alert('Please answer at least 20 questions.'); return; }
  const tot={R:0,I:0,A:0,S:0,E:0,C:0}, cnt={R:0,I:0,A:0,S:0,E:0,C:0};
  Object.values(answered).forEach(({type,val}) => { tot[type]+=val; cnt[type]++; });
  const avgs = {};
  Object.keys(tot).forEach(k => avgs[k] = cnt[k] ? +(tot[k]/cnt[k]).toFixed(2) : 0);
  lastResults = avgs;
  // Switch to the combined Find My Career tab, populate the interest profile,
  // auto-select the user's top-3 work-style chips, switch the filter view to
  // the Work style tab, and run the live match.
  switchTab('search');
  syncProfileUI();
  const sorted = Object.entries(avgs).sort((a,b) => b[1]-a[1]);
  activeR.clear();
  sorted.slice(0,3).forEach(([k]) => activeR.add(k));
  syncRiasecChipsUI();
  setFilterMode('riasec');
  // Clear any existing keyword search so RIASEC mode is the entry point.
  document.getElementById('sinput').value = '';
  activeCluster = '';
  updateSearch();
  window.scrollTo({top:0,behavior:'smooth'});
}

// Sync the interest-profile card + the save-your-profile row to whatever's
// in lastResults. Called when the assessment completes and on initial load
// (in case state was restored from a saved URL).
function syncProfileUI() {
  const ipEl = document.getElementById('interest-profile');
  const saveEl = document.getElementById('profile-save');
  if (!ipEl) return;
  if (lastResults) {
    const sorted = Object.entries(lastResults).sort((a,b) => b[1] - a[1]);
    renderInterestProfile(sorted);
    if (saveEl) saveEl.style.display = '';
  } else {
    ipEl.innerHTML = `
      <div style="text-align:center;padding:8px 4px">
        <div class="t-eyebrow" style="color:var(--blue);margin-bottom:8px">Get personalized matches</div>
        <p style="font-size:15px;color:var(--navy);line-height:1.55;margin:0 auto 14px;max-width:440px">
          A short 30-question quiz uncovers your top work styles and unlocks careers tailored to your interests.
        </p>
        <button class="cta" id="btn-go-assess">Take the Assessment</button>
      </div>`;
    if (saveEl) saveEl.style.display = 'none';
  }
}

// Single unified visualization for the assessment results header — replaces
// the old top-3 ribbon + bubble chart + colour key + description grid.
// Each row carries letter avatar + name + descriptor + bar + numeric score,
// sorted high → low, with the top 3 emphasized and the remaining muted.
// Tracks whether the user has expanded the interest profile to show all 6
// rows. Defaults to collapsed (top 3 only) on first render.
let interestProfileExpanded = false;

function renderInterestProfile(sorted) {
  const el = document.getElementById('interest-profile');
  if (!el) return;
  // Bar width is the absolute share of the 5-point scale (so a 4.6 reads as
  // 92%) — meaningful even when the user's "lowest" score is still high.
  const rowFor = ([k, v], i) => {
    const pct = Math.max(4, Math.min(100, Math.round((v / 5) * 100)));
    const isRest = i >= 3;
    return `<div class="ip-row${isRest?' is-rest':''}">
      <div class="ip-avatar" style="background:${BC[k]}">${k}</div>
      <div class="ip-body">
        <div class="ip-name">${RI[k].short}<span class="ip-tag">${RI[k].name.split('—')[1].trim()}</span></div>
        <div class="ip-desc">${RI[k].desc}</div>
        <div class="ip-bar"><div class="ip-fill" style="width:${pct}%;background:${BC[k]}"></div></div>
      </div>
      <div class="ip-score">${v.toFixed(1)}<small>of 5</small></div>
    </div>`;
  };
  const top3 = sorted.slice(0,3).map(rowFor).join('');
  const rest = sorted.slice(3).map((entry, i) => rowFor(entry, i + 3)).join('');
  const expanded = interestProfileExpanded;
  el.innerHTML = `
    <p class="ip-intro">Based on your answers, these are the work styles that energize you most. Your top three shape the careers we match you to below.</p>
    <div class="ip-rows">
      ${top3}
      ${rest ? `<div class="ip-more-wrap" id="ip-more-wrap"${expanded?' data-expanded':''}>${rest}</div>` : ''}
    </div>
    ${rest ? `<div class="ip-toggle-wrap">
      <button class="ip-toggle" id="ip-toggle" aria-expanded="${expanded}">
        <span class="ip-toggle-text">${expanded ? 'Show top 3 only' : 'Show all 6 work styles'}</span>
        <span class="ip-toggle-chevron" aria-hidden="true">${expanded ? '▴' : '▾'}</span>
      </button>
    </div>` : ''}
    <p class="ip-footnote">Your interests and career goals can change over time. Retake the assessment anytime.</p>`;
}

function toggleInterestProfile() {
  interestProfileExpanded = !interestProfileExpanded;
  syncProfileUI();
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
    mcards.innerHTML = '<div style="color:var(--ts);font-size:15px;padding:18px 0">No matches available from O*NET right now. Try Search Careers above.</div>';
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
  Object.keys(answered).forEach(k => delete answered[k]);
  lastResults = null;
  document.querySelectorAll('.sb').forEach(b => b.className = 'sb');
  document.getElementById('qans').textContent = '0 of 30 answered';
  document.getElementById('pf').style.width = '0%';
  document.getElementById('afw').style.display = 'block';
  document.getElementById('rw').style.display = 'none';
  window.scrollTo({top:0,behavior:'smooth'});
}

/* ══ SAVE / EMAIL / PRINT ══ */
function getStateUrl() {
  const data = btoa(JSON.stringify({results:lastResults, saved:[...saved]}));
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

// Unified search dispatcher. Picks a mode based on what's set, syncs the
// chip UI, and renders into #slist. Mode priority:
//   keyword (sinput >= 2 chars) > cluster (activeCluster) > riasec (activeR)
//   > empty (Bright Outlook list).
// Area chips are keyword shortcuts — clicking one writes into sinput and falls
// into keyword mode. RIASEC chips stay visible when keyword/cluster mode wins
// so the user still sees their interest context.
function updateSearch() {
  const q = document.getElementById('sinput').value.trim();
  syncAreaChipsUI(q);
  syncRiasecChipsUI();
  syncClusterChipsUI();

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
  if (activeCluster) {
    hideEmptyState();
    renderClusterIntoSlist();
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

function syncAreaChipsUI(qLower) {
  const v = (qLower || '').toLowerCase();
  document.querySelectorAll('.schip').forEach(c => {
    c.classList.toggle('active', (c.dataset.q || '').toLowerCase() === v);
  });
}

function syncRiasecChipsUI() {
  document.querySelectorAll('.rc').forEach(c => {
    c.classList.toggle('active', activeR.has(c.dataset.r));
  });
}

function syncClusterChipsUI() {
  document.querySelectorAll('.cluster-chip').forEach(c => {
    c.classList.toggle('active', c.dataset.cluster === activeCluster);
  });
}

// Filter-mode tabs: switch which chip group is visible. Pure view state —
// doesn't reset any active filter. Modes: 'riasec' | 'area' | 'cluster'.
function setFilterMode(mode) {
  document.querySelectorAll('.fmtab').forEach(b => {
    b.classList.toggle('active', b.dataset.mode === mode);
  });
  document.querySelectorAll('.fc-group[data-mode-pane]').forEach(g => {
    g.hidden = (g.dataset.modePane !== mode);
  });
}

// Pick the right initial tab based on session state.
function pickInitialFilterMode() {
  if (lastResults) return 'riasec';
  return 'area';
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

  // Fallback ladder: try 3-letter, then 2-letter, then 1-letter.
  let careers = [];
  let usedCode = '';
  for (let n = fullCode.length; n >= 1; n--) {
    const sub = fullCode.slice(0, n);
    try {
      const data = await onetGet(`/holland/${sub}?end=20`);
      const occ = (data && data.occupation) || [];
      if (occ.length >= 5 || n === 1) {
        careers = occ.slice(0, 20);
        usedCode = sub;
        break;
      }
      if (!careers.length) { careers = occ.slice(0, 20); usedCode = sub; }
    } catch (e) { /* try next */ }
  }

  if (!careers.length) {
    slist.innerHTML = '<div style="color:var(--ts);font-size:15px;padding:14px 0">No matches found. Try a different combination of work styles.</div>';
    rcount.textContent = '';
    return;
  }

  const list = careers.map(c => ({
    code: c.code, title: c.title,
    tags: {
      brightOutlook:  !!(c.tags && c.tags.bright_outlook),
      apprenticeship: !!(c.tags && c.tags.apprenticeship),
      stem:           !!(c.tags && c.tags.stem),
      green:          !!(c.tags && c.tags.green),
    },
  }));
  renderLiveList(list, 'slist', 'sd');
  rcount.innerHTML = `<strong>${careers.length}</strong> career${careers.length!==1?'s':''} matching <strong>${usedCode}</strong> (your top work styles)`;
}

// ─── Cluster mode ─────────────────────────────────────────────────────────
const CLUSTER_PAGE_SIZE = 15;
let clusterCareers_v2 = [];
let clusterTotal_v2 = null;
let clusterLoading_v2 = false;
let loadedClusterCode_v2 = null;

async function loadClusterIntoSlist(code, name) {
  if (clusterLoading_v2) return;
  clusterLoading_v2 = true;
  const start = clusterCareers_v2.length + 1;
  const end = start + CLUSTER_PAGE_SIZE - 1;
  try {
    const data = await onetGet(`/career_cluster/${code}?start=${start}&end=${end}`);
    const page = (data.career || []).map(c => ({
      code: c.code, title: c.title,
      tags: {
        brightOutlook:  !!(c.tags && c.tags.bright_outlook),
        apprenticeship: !!(c.tags && c.tags.apprenticeship),
        stem:           !!(c.tags && c.tags.stem),
        green:          !!(c.tags && c.tags.green),
      },
    }));
    clusterTotal_v2 = data.total || clusterTotal_v2 || page.length;
    clusterCareers_v2 = clusterCareers_v2.concat(page);
    renderLiveList(clusterCareers_v2, 'slist', 'sd');
    document.getElementById('rcount').innerHTML =
      `<strong>${name}</strong> — showing ${clusterCareers_v2.length} of ${clusterTotal_v2} career${clusterTotal_v2!==1?'s':''}`;
    const hasMore = clusterCareers_v2.length < clusterTotal_v2;
    document.getElementById('slist-more').innerHTML = hasMore
      ? '<div style="margin-top:14px;text-align:center"><button class="cta ghost" id="slist-more-btn">Show more</button></div>'
      : '';
  } catch (err) {
    console.error('Cluster fetch failed:', err);
    document.getElementById('slist').innerHTML =
      '<div style="color:var(--ts);font-size:15px;padding:14px 0">Couldn\'t reach O*NET. Try again later.</div>';
  } finally {
    clusterLoading_v2 = false;
  }
}

function renderClusterIntoSlist() {
  const code = CLUSTER_CODES[activeCluster];
  if (!code) return;
  // Reset pagination if cluster changed
  if (loadedClusterCode_v2 !== code) {
    clusterCareers_v2 = [];
    clusterTotal_v2 = null;
    loadedClusterCode_v2 = code;
    document.getElementById('slist').innerHTML =
      '<div style="color:var(--ts);font-size:15px;padding:14px 0">Loading careers from O*NET…</div>';
    document.getElementById('rcount').innerHTML = `<strong>${activeCluster}</strong> — loading…`;
    document.getElementById('slist-more').innerHTML = '';
  }
  loadClusterIntoSlist(code, activeCluster);
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
      (total > occs.length ? ` (showing ${occs.length})` : '') + ' · via O*NET';
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

function renderLiveList(list, listId, prefix) {
  const el = document.getElementById(listId);
  if (!el) return;
  if (!list.length) {
    el.innerHTML = `<div style="text-align:center;padding:40px 20px;color:var(--ts);font-size:15px">No careers found. Try a different keyword.</div>`;
    return;
  }
  el.innerHTML = list.map(c => {
    const idx = c.code; // use code as key for live results
    const isSaved = saved.has('live-'+idx);
    const cached = detailCache[idx];
    const badges = buildCardBadges(c, cached);

    return `<div class="crow" data-live-code="${idx}" data-prefix="${prefix}" id="crow-${prefix}-live-${idx.replace(/\./g,'_')}">
      <div class="crl">
        <h3>${c.title}</h3>
        <div class="crm">${badges || '<span class="mb">Loading details…</span>'}</div>
      </div>
      <div class="crr">
        <button class="bmbtn${isSaved?' saved':''}" data-live-code="${idx}">${isSaved?'♥':'♡'}</button>
        <span class="arr" id="arr-${prefix}-${idx.replace(/\./g,'_')}">›</span>
      </div>
    </div>
    <div class="cdw" id="cdw-${prefix}-${idx.replace(/\./g,'_')}"></div>`;
  }).join('');

  // Kick off background fetch of salary + outlook for any not-yet-cached
  // careers, then patch their badges in place. This makes salary appear on
  // collapsed cards without requiring the user to expand each one first.
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
      // Store a lightweight (partial) summary. The _partial flag tells
      // openLiveDetail it must still fetch the full detail (description,
      // tasks, education breakdown, related occupations) on card expand.
      if (!detailCache[c.code]) {
        detailCache[c.code] = {
          code: c.code,
          title: c.title,
          description: '',
          sampleTitles: [],
          tags: { ...(c.tags || {}) },
          salary: {
            median: wage.annual_median || 0,
            low: wage.annual_10th_percentile || 0,
            high: wage.annual_90th_percentile || 0,
          },
          outlook: { growth: outlookCat || '', descriptor: '' },
          tasks: [],
          eduBreakdown: [],
          pathways: [], prepare: [], hiring: {},
          cluster: '', riasec: [], related: [],
          _partial: true,
        };
      }
      // Patch the card's badge row in place
      const safe = c.code.replace(/\./g, '_');
      const crow = document.getElementById('crow-' + prefix + '-live-' + safe);
      if (!crow) return;
      const bm = crow.querySelector('.crm');
      if (bm) bm.innerHTML = buildCardBadges(c, detailCache[c.code]);
    }).catch(() => {
      // Silent — card just stays without salary
    }).finally(() => {
      summaryInFlight.delete(c.code);
    });
  });
}

// Render the inner pills of a single related-career card (.rcard-m).
// Honors the Bright Outlook redundancy rule: show the ☀️ pill OR the 📈
// growth pill, never both.
function paintRelatedCard(code, detail) {
  if (!detail) return;
  const sal    = detail.salary  && detail.salary.median;
  const growth = detail.outlook && detail.outlook.growth;
  const bright = !!(detail.tags && detail.tags.brightOutlook);
  const html = [
    bright            ? `<span class="mb">☀️ Bright Outlook</span>`           : '',
    (growth && !bright) ? `<span class="mb">📈 ${growth}</span>`              : '',
    sal               ? `<span class="mb">💰 $${sal.toLocaleString()}/yr</span>` : '',
  ].filter(Boolean).join('');
  document.querySelectorAll(`.rcard[data-live-rel="${code}"] .rcard-m`)
    .forEach(el => { el.innerHTML = html; });
}

// Background-fetch outlook for every related career and paint each card as
// its data resolves. Reuses detailCache + summaryInFlight so we never fire
// duplicate requests across drawer opens.
function enrichRelatedCards(relatedList) {
  (relatedList || []).forEach(r => {
    // Already cached? Paint immediately.
    if (detailCache[r.code]) { paintRelatedCard(r.code, detailCache[r.code]); return; }
    if (summaryInFlight.has(r.code)) {
      // Another path is already fetching. Poll once cache lands.
      const tick = setInterval(() => {
        if (detailCache[r.code]) { paintRelatedCard(r.code, detailCache[r.code]); clearInterval(tick); }
      }, 150);
      setTimeout(() => clearInterval(tick), 8000);
      return;
    }
    summaryInFlight.add(r.code);
    onetGet(`/career/${r.code}/outlook`).then(out => {
      const wage = (out && out.salary) || {};
      const outlookCat = out && out.outlook && out.outlook.category;
      const isBright = !!(out && out.outlook && (out.outlook.category === 'Bright' || out.outlook.bright_outlook));
      // Lightweight partial entry — same _partial discipline as
      // prefetchSummaries so that opening the drawer still triggers
      // the full data fetch.
      if (!detailCache[r.code]) {
        detailCache[r.code] = {
          code: r.code, title: r.title,
          description: '', sampleTitles: [],
          tags: { brightOutlook: isBright, apprenticeship: false, stem: false, green: false },
          salary: {
            median: wage.annual_median        || 0,
            low:    wage.annual_10th_percentile || 0,
            high:   wage.annual_90th_percentile || 0,
          },
          outlook: { growth: outlookCat || '', descriptor: '' },
          tasks: [],
          eduBreakdown: [],
          pathways: [], prepare: [], hiring: {},
          cluster: '', riasec: [], related: [],
          _partial: true,
        };
      }
      paintRelatedCard(r.code, detailCache[r.code]);
    }).catch(() => {}).finally(() => {
      summaryInFlight.delete(r.code);
    });
  });
}

// Fetch detail for a live result, cache it, then build the drawer
async function openLiveDetail(code, prefix) {
  const safe = code.replace(/\./g, '_');
  const wrap = document.getElementById('cdw-'+prefix+'-'+safe);
  const crow = document.getElementById('crow-'+prefix+'-live-'+safe);
  const arr  = document.getElementById('arr-'+prefix+'-'+safe);
  if (!wrap || !crow) return;

  const isOpen = wrap.classList.contains('open');

  // Close any open drawers in this list
  document.querySelectorAll('[id^="cdw-'+prefix+'-"].open').forEach(el => {
    el.classList.remove('open');
    const ci = el.id.replace('cdw-'+prefix+'-','');
    const cr = document.getElementById('crow-'+prefix+'-live-'+ci);
    const ar = document.getElementById('arr-'+prefix+'-'+ci);
    if (cr) cr.classList.remove('open');
    if (ar) ar.classList.remove('open');
  });

  if (isOpen) return;

  crow.classList.add('open');
  arr.classList.add('open');
  wrap.classList.add('open');

  // If a full (non-partial) detail is already cached, render immediately.
  // Partial entries (written by prefetchSummaries / enrichRelatedCards) hold
  // only salary + outlook; we still need to fetch the rest.
  if (detailCache[code] && !detailCache[code]._partial) {
    wrap.innerHTML = buildLiveDetail(detailCache[code], code, prefix);
    setTimeout(() => wrap.scrollIntoView({behavior:'smooth',block:'nearest'}), 50);
    return;
  }

  // Show skeleton while loading
  wrap.innerHTML = `<div class="cdb" style="display:flex;flex-direction:column;gap:12px">
    ${[80,55,95,65,70].map(w=>`<div style="height:12px;width:${w}%;background:var(--lg);border-radius:4px;animation:pulse 1.2s ease-in-out infinite"></div>`).join('')}
    <style>@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}</style>
  </div>`;
  setTimeout(() => wrap.scrollIntoView({behavior:'smooth',block:'nearest'}), 50);

  try {
    // Fetch live data from O*NET in parallel: basic info, outlook+wages,
    // related occupations, education breakdown, and the full task list.
    const [info, outlook, related, eduRes, tasksRes] = await Promise.all([
      onetGet(`/career/${code}`).catch(() => null),
      onetGet(`/career/${code}/outlook`).catch(() => null),
      onetGet(`/career/${code}/details/related_occupations`).catch(() => null),
      onetGet(`/career/${code}/details/education`).catch(() => null),
      onetGet(`/career/${code}/details/tasks?end=8`).catch(() => null),
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
    };
    detailCache[code] = detail;

    // Update the card badges now that we have real data
    const crow2 = document.getElementById('crow-'+prefix+'-live-'+safe);
    if (crow2) {
      const bm = crow2.querySelector('.crm');
      if (bm) bm.innerHTML = buildCardBadges({ code, title: detail.title, tags: detail.tags }, detail);
    }

    wrap.innerHTML = buildLiveDetail(detail, code, prefix);

    // Background-enrich related-career cards with salary + outlook so each
    // card in the horizontal scroll row shows useful info, not just a title.
    enrichRelatedCards(relatedList);

  } catch (err) {
    console.error('Detail error:', err);
    wrap.innerHTML = `<div class="cdb"><p style="color:var(--ts);font-size:15px">Couldn't load details. <a href="https://www.onetonline.org/link/summary/${code}" target="_blank" style="color:var(--blue)">View on O*NET →</a></p></div>`;
  }
}

// Build the unified detail drawer — used for every career. Sections that
// don't have data simply don't render, so the same template gracefully
// degrades for occupations where O*NET doesn't expose a given field.
function buildLiveDetail(d, code, prefix) {
  const pid = prefix + '-' + code.replace(/\./g,'_');
  const isSaved = saved.has('live-' + code);
  const sal = d.salary  || {};
  const out = d.outlook || {};
  const eb  = d.eduBreakdown || [];
  const pw  = d.pathways || [];
  const pr  = d.prepare  || [];
  const tk  = d.tasks    || [];
  const h   = d.hiring   || {};
  const slo = sal.low  || 0;
  const shi = sal.high || 0;
  const saveBtn = `<button class="cdbm${isSaved?' saved':''}" data-live-code="${code}">${isSaved?'♥ Saved':'♡ Save this Career'}</button>`;
  const footer  = `<div class="cdf">${saveBtn}<a class="opill" href="https://www.onetonline.org/link/summary/${code}" target="_blank">View on O*NET →</a></div>`;

  // Tabs — "Ways to Prepare" only shows when local curated content provides it.
  const tabs = [
    `<button class="cdt active" data-panel="ov-${pid}">Overview</button>`,
    `<button class="cdt" data-panel="ih-${pid}">Income &amp; Outlook</button>`,
    `<button class="cdt" data-panel="ed-${pid}">Education</button>`,
    pr.length ? `<button class="cdt" data-panel="wp-${pid}">Ways to Prepare</button>` : '',
    `<button class="cdt" data-panel="rc-${pid}">Related</button>`,
  ].filter(Boolean).join('');

  // Secondary tag chips in OVERVIEW. Bright Outlook intentionally omitted —
  // it's already conveyed by the card header pill + Job Growth value.
  const tags = [
    d.tags?.apprenticeship ? `<span class="ctg">🔨 Apprenticeship Available</span>` : '',
    d.tags?.stem           ? `<span class="ctg">🔬 STEM</span>`                    : '',
    d.tags?.green          ? `<span class="ctg">🌱 Green Economy</span>`           : ''
  ].filter(Boolean).join('');

  return `<div class="cdn">${tabs}</div>
  <div class="cdb">

  <!-- OVERVIEW -->
  <div class="cdp active" id="ov-${pid}">
    <div class="csg">
      ${sal.median ? `<div class="csb"><div class="csl">Median Salary</div><div class="csv">$${sal.median.toLocaleString()}</div><div class="css2">per year</div></div>` : ''}
      ${out.growth ? `<div class="csb"><div class="csl">Job Growth</div><div class="csv">${out.growth}</div>${out.descriptor ? `<div class="css2">${out.descriptor}</div>` : ''}</div>` : ''}
      ${h.openings ? `<div class="csb"><div class="csl">Annual Openings</div><div class="csv" style="font-size:15px">${h.openings}</div><div class="css2">nationally</div></div>` : ''}
      ${d.cluster ? `<div class="csb"><div class="csl">Career Cluster</div><div class="csv" style="font-size:12px;line-height:1.3">${d.cluster}</div></div>` : ''}
    </div>
    ${tags ? `<div class="ctgs" style="margin-bottom:16px">${tags}</div>` : ''}
    ${d.description ? `<p style="font-size:15px;color:var(--navy);line-height:1.75;margin-bottom:16px">${d.description}</p>` : ''}
    ${d.sampleTitles?.length ? `<div class="csh">Also called</div><div class="ctgs" style="margin-bottom:16px">${d.sampleTitles.slice(0,6).map(t=>`<span class="ctg">${t}</span>`).join('')}</div>` : ''}
    ${tk.length ? `<div class="csh">Common Tasks</div><ul class="ctl">${tk.slice(0,8).map(t=>`<li><span class="cta2">→</span>${t}</li>`).join('')}</ul>` : ''}
    ${footer}
  </div>

  <!-- INCOME & OUTLOOK -->
  <div class="cdp" id="ih-${pid}">
    ${sal.median ? `
    <div class="csh" style="margin-top:0">How much do ${d.title}s earn yearly?</div>
    <p style="font-size:15px;color:var(--navy);margin-bottom:14px;line-height:1.6">Ten percent earned less than $${slo.toLocaleString()} and ten percent earned more than $${shi.toLocaleString()}.</p>
    <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
      <thead><tr style="background:var(--lg)">
        <th style="text-align:left;padding:10px 14px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--ts)">Income Percentile</th>
        <th style="text-align:right;padding:10px 14px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--ts)">Income</th>
      </tr></thead>
      <tbody>
        <tr style="border-bottom:1px solid var(--mg)"><td style="padding:13px 14px;font-size:15px;color:var(--navy);">Low (10%)</td><td style="padding:13px 14px;text-align:right;font-size:15px;font-weight:900;color:var(--navy)">$${slo.toLocaleString()}</td></tr>
        <tr style="border-bottom:1px solid var(--mg);background:var(--off)"><td style="padding:13px 14px;font-size:15px;color:var(--navy);">Median (50%)</td><td style="padding:13px 14px;text-align:right;font-size:15px;font-weight:900;color:var(--navy)">$${sal.median.toLocaleString()}</td></tr>
        <tr><td style="padding:13px 14px;font-size:15px;color:var(--navy);">High (90%)</td><td style="padding:13px 14px;text-align:right;font-size:15px;font-weight:900;color:var(--blue)">$${shi.toLocaleString()}</td></tr>
      </tbody>
    </table>` : '<p style="color:var(--ts);font-size:15px">Salary data not available.</p>'}
    ${out.growth ? `<div style="background:var(--off);border-radius:var(--rmd);padding:14px 16px;margin-bottom:16px"><div style="font-size:12px;font-weight:700;color:var(--ts);text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px">Projected Growth Rate</div><div style="font-size:20px;font-weight:900;color:var(--blue)">${out.growth}${out.descriptor ? ` <span style="font-size:15px;font-weight:400;color:var(--ts)">${out.descriptor}</span>` : ''}</div></div>` : ''}
    ${h.ind?.length ? `<div class="csh">Top Hiring Industries</div><div class="ctgs" style="margin-bottom:14px">${h.ind.map(i=>`<span class="ctg">${i}</span>`).join('')}</div>` : ''}
    ${h.states?.length ? `<div class="csh">Top Hiring States</div><div class="ctgs">${h.states.map(s=>`<span class="ctg">${s}</span>`).join('')}</div>` : ''}
    ${footer}
  </div>

  <!-- EDUCATION -->
  <div class="cdp" id="ed-${pid}">
    ${pw.length ? `<div class="csh" style="margin-top:0">Education Pathways</div><div class="pwl" style="margin-bottom:20px">${pw.map(p=>`<div class="pwi"><div class="pwn">${p.lbl||p.deg}</div><div class="pwd">${p.desc}</div></div>`).join('')}</div>` : ''}
    ${eb.length ? `<div class="csh">What education level do ${d.title}s have?</div>
    <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
      <thead><tr style="background:var(--lg)">
        <th style="text-align:left;padding:10px 14px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--ts)">Education Level</th>
        <th style="text-align:right;padding:10px 14px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--ts)">%</th>
      </tr></thead>
      <tbody>${eb.map((e,i)=>`
        <tr style="border-bottom:1px solid var(--mg);${i%2===1?'background:var(--off)':''}">
          <td style="padding:11px 14px;font-size:15px;color:var(--navy);">${e.level}</td>
          <td style="padding:11px 14px;text-align:right">
            <div style="display:flex;align-items:center;justify-content:flex-end;gap:10px">
              <div style="width:80px;height:6px;background:var(--lg);border-radius:3px;overflow:hidden"><div style="width:${Math.min(e.pct,100)}%;height:100%;background:var(--yellow);border-radius:3px"></div></div>
              <span style="font-size:15px;font-weight:900;color:var(--navy);min-width:42px;text-align:right">${(e.pct||0).toFixed(1)}%</span>
            </div>
          </td>
        </tr>`).join('')}
      </tbody>
    </table>` : ''}
    ${d.tags?.apprenticeship ? `
    <div style="background:rgba(255,183,0,.1);border:1px solid rgba(255,183,0,.3);border-radius:var(--rmd);padding:16px;margin-bottom:16px">
      <div style="font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:.1em;color:var(--blue);margin-bottom:6px">🔨 Registered Apprenticeship Available</div>
      <p style="font-size:12px;color:var(--navy);line-height:1.5;margin-bottom:10px">A registered apprenticeship program exists for this career — earn while you learn, no college debt required.</p>
      <a href="https://www.apprenticeship.gov/apprenticeship-job-finder?onetCode=${code}" target="_blank" style="display:inline-flex;align-items:center;gap:5px;background:var(--yellow);color:var(--navy);border:none;border-radius:var(--rf);padding:8px 16px;font-size:11px;font-weight:900;text-transform:uppercase;text-decoration:none">Find Apprenticeships →</a>
    </div>` : ''}
    ${footer}
  </div>

  ${pr.length ? `<!-- WAYS TO PREPARE -->
  <div class="cdp" id="wp-${pid}">
    <div class="csh" style="margin-top:0">How to prepare for a career as a ${d.title}</div>
    <p style="font-size:15px;color:var(--navy);margin-bottom:16px;line-height:1.6">You can start building toward this career right now — in high school.</p>
    ${pr.map(s=>`<div style="background:var(--off);border-radius:var(--rmd);padding:16px;margin-bottom:12px;border-left:3px solid var(--blue)"><div style="font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:.1em;color:var(--blue);margin-bottom:10px">${s.type}</div><ul style="list-style:none;display:flex;flex-direction:column;gap:7px">${(s.items||[]).map(item=>`<li style="display:flex;gap:10px;font-size:15px;color:var(--navy);line-height:1.5"><span style="color:var(--blue);flex-shrink:0">✓</span>${item}</li>`).join('')}</ul></div>`).join('')}
    ${footer}
  </div>` : ''}

  <!-- RELATED -->
  <div class="cdp" id="rc-${pid}">
    <div class="csh" style="margin-top:0">Related Careers</div>
    <p style="font-size:15px;color:var(--navy);margin-bottom:16px;line-height:1.6">These careers share similar skills, interests, or education pathways. Scroll to see more.</p>
    <div class="rcrow">
      ${(d.related||[]).map(r=>`
        <div class="rcard" data-live-rel="${r.code}" data-prefix="${prefix}">
          <div class="rcard-t">${r.title}</div>
          <div class="rcard-m"></div>
        </div>`).join('')}
    </div>
    ${footer}
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
  document.getElementById('tc').textContent = saved.size;
  if (document.getElementById('tpn').classList.contains('open')) renderTray();
  // Sync all UI for this code (any visible card + any open drawer).
  const safe = code.replace(/\./g, '_');
  document.querySelectorAll(`.cdbm[data-live-code="${code}"]`).forEach(b => {
    b.classList.toggle('saved', saved.has(key));
    b.textContent = saved.has(key) ? '♥ Saved' : '♡ Save this Career';
  });
  document.querySelectorAll(`.bmbtn[data-live-code="${code}"]`).forEach(b => {
    b.classList.toggle('saved', saved.has(key));
    b.textContent = saved.has(key) ? '♥' : '♡';
  });
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

/* ══ TRAY ══ */
function openTray() { renderTray(); document.getElementById('tov').classList.add('open'); document.getElementById('tpn').classList.add('open'); }
function closeTray() { document.getElementById('tov').classList.remove('open'); document.getElementById('tpn').classList.remove('open'); }
function renderTray() {
  const b = document.getElementById('tbody');
  if (!saved.size) {
    b.innerHTML = `<div class="tempty"><div style="font-size:20px;margin-bottom:12px">♡</div><p>No saved careers yet.<br>Hit ♡ on any career to save it here.</p></div>`;
    return;
  }
  const codes = [...saved]
    .filter(k => typeof k === 'string' && k.startsWith('live-'))
    .map(k => k.slice('live-'.length));
  b.innerHTML = codes.map(code => {
    const meta = savedMeta.get(code) || { title: code, salary: null };
    const salaryPill = meta.salary
      ? `<span class="mb">$${meta.salary.toLocaleString()}/yr</span>`
      : `<span class="mb" style="opacity:.6">Loading…</span>`;
    return `<div class="ti">
      <div>
        <h4>${meta.title}</h4>
        <div style="display:flex;flex-wrap:wrap;gap:6px">${salaryPill}</div>
      </div>
      <button class="trm" data-tray-remove="${code}">✕</button>
    </div>`;
  }).join('');
  b.querySelectorAll('[data-tray-remove]').forEach(btn => {
    btn.addEventListener('click', () => toggleLiveSave(btn.dataset.trayRemove));
  });
  // Kick off background backfill if any titles are missing.
  ensureSavedMeta().then(() => {
    // Re-render only if still open and at least one meta changed.
    if (document.getElementById('tpn').classList.contains('open')) renderTray();
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
    document.getElementById('tc').textContent = saved.size;
    if (d.results) { lastResults = d.results; renderResults(d.results); }
    if (saved.size) ensureSavedMeta();
    toast('✓ Your saved results have been restored!');
  } catch(e) { console.warn('Restore failed', e); }
}

/* ══ CLUSTERS ══ */
const CLUSTERS = [
  {name:'Advanced Manufacturing',        icon:'⚙️'},
  {name:'Agriculture',                   icon:'🌾'},
  {name:'Arts, Entertainment & Design',  icon:'🎨'},
  {name:'Construction',                  icon:'🏗️'},
  {name:'Digital Technology',            icon:'💻'},
  {name:'Education',                     icon:'📚'},
  {name:'Energy & Natural Resources',    icon:'⚡'},
  {name:'Financial Services',            icon:'💰'},
  {name:'Healthcare & Human Services',   icon:'🏥'},
  {name:'Hospitality, Events & Tourism', icon:'🍽️'},
  {name:'Management & Entrepreneurship', icon:'🚀'},
  {name:'Marketing & Sales',             icon:'📣'},
  {name:'Public Service & Safety',       icon:'🛡️'},
  {name:'Supply Chain & Transportation', icon:'🚚'},
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

/* ══ INIT ══ */
document.addEventListener('DOMContentLoaded', function() {
  restoreFromURL();
  renderClusterChips();
  syncProfileUI();
  setFilterMode(pickInitialFilterMode());
  updateSearch();
});

// Render the cluster filter chips into the Find My Career panel. Called
// once on page load. Each chip is single-active; click handling lives in
// the global click listener.
function renderClusterChips() {
  const host = document.getElementById('cluster-chips');
  if (!host) return;
  host.innerHTML = CLUSTERS.map(c =>
    `<button class="fc cluster-chip" data-cluster="${c.name}">${c.icon} ${c.name}</button>`
  ).join('');
}

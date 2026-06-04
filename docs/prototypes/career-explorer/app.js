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
  if (t.id === 'btn-theme') { toggleTheme(); return; }
  if (t.id === 'btn-close-tray') { closeTray(); return; }
  if (t.id === 'tov') { closeTray(); return; }
  if (t.id === 'btn-tray-link') { copyTrayLink(); return; }
  if (t.id === 'btn-tray-print') { window.print(); return; }

  // Bright Outlook "Show more" pagination button
  if (t.id === 'bo-more-btn') { loadBrightOutlookPage(); return; }

  // Interest profile expand/collapse (top 3 ↔ all 6)
  if (t.closest('#ip-toggle')) { toggleInterestProfile(); return; }

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

  // Sub-cluster chip — visual highlight only (O*NET API doesn't support
  // sub-cluster filtering; chips surface as context).
  const sub = t.closest('.sub-chip[data-sub]');
  if (sub) {
    document.querySelectorAll('.sub-chip').forEach(c => c.classList.remove('active'));
    sub.classList.add('active');
    return;
  }

  // Cluster-page pagination ("Show more" inside #cluster-list-more)
  if (t.id === 'cluster-list-more-btn' && loadedClusterCode_v2) {
    loadClusterIntoTarget(loadedClusterCode_v2, activeCluster, 'cluster-list', 'cluster-rcount', 'cluster-list-more');
    return;
  }

  // Career card click — opens modal. Bookmark button stops propagation.
  const ccard = t.closest('.ccard[data-live-code]');
  if (ccard) {
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

  // Related-career card click inside the modal — open that career.
  const liveRel = t.closest('[data-live-rel]');
  if (liveRel) { openLiveDetail(liveRel.dataset.liveRel, 'sd'); return; }
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
let minSalary = 0;              // 0 = Any. Filters cards client-side by detailCache median.
let eduZoneMin = 0;             // 0 = Any. Filters cards client-side by O*NET job_zone (1-5).
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
        <div class="t-eyebrow" style="margin-bottom:8px">Get personalized matches</div>
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
function applyClientFilters() {
  document.querySelectorAll('#slist .ccard[data-live-code], #cluster-list .ccard[data-live-code]').forEach(card => {
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
    // Everything returned by /holland/{code} matches the user's interests
    // by definition — mark them all as Great Match.
    isMatch: true,
    tags: {
      brightOutlook:  !!(c.tags && c.tags.bright_outlook),
      apprenticeship: !!(c.tags && c.tags.apprenticeship),
      stem:           !!(c.tags && c.tags.stem),
      green:          !!(c.tags && c.tags.green),
    },
  }));
  // Holland responses inline a job_zone object per career. Stash it now so
  // the Education filter has data without a per-card extra fetch.
  careers.forEach(c => {
    if (c.job_zone && c.job_zone.code) {
      detailCache[c.code] = detailCache[c.code] || { _partial: true };
      detailCache[c.code].jobZone = c.job_zone.code;
    }
  });
  renderLiveList(list, 'slist', 'sd');
  rcount.innerHTML = `<strong>${careers.length}</strong> career${careers.length!==1?'s':''} matching <strong>${usedCode}</strong> (your top work styles)`;
  applyClientFilters();
}

// ─── Cluster careers loader (used by the Career Clusters page) ──────────
const CLUSTER_PAGE_SIZE = 15;
let clusterCareers_v2 = [];
let clusterTotal_v2 = null;
let clusterLoading_v2 = false;
let loadedClusterCode_v2 = null;

async function loadClusterIntoTarget(code, name, listId, rcountId, moreId) {
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
    renderLiveList(clusterCareers_v2, listId, 'cl');
    document.getElementById(rcountId).innerHTML =
      `<strong>${name}</strong> — showing ${clusterCareers_v2.length} of ${clusterTotal_v2} career${clusterTotal_v2!==1?'s':''}`;
    const hasMore = clusterCareers_v2.length < clusterTotal_v2;
    document.getElementById(moreId).innerHTML = hasMore
      ? '<div style="margin-top:14px;text-align:center"><button class="cta ghost" id="cluster-list-more-btn">Show more</button></div>'
      : '';
  } catch (err) {
    console.error('Cluster fetch failed:', err);
    document.getElementById(listId).innerHTML =
      '<div style="color:var(--ts);font-size:15px;padding:14px 0">Couldn\'t reach O*NET. Try again later.</div>';
  } finally {
    clusterLoading_v2 = false;
  }
}

// ─── Career Clusters page ───────────────────────────────────────────────
// Render the editorial grid of cluster cards. Called once on DOM ready.
function renderClusterGrid() {
  const grid = document.getElementById('cluster-grid');
  if (!grid) return;
  grid.innerHTML = CLUSTERS.map(c => `
    <div class="cluster-card" data-cluster="${c.name}">
      <img src="${c.img}" alt="${c.name}" loading="lazy"
           onerror="this.style.display='none'">
      <div class="cluster-card-overlay"></div>
      <div class="cluster-card-cta">View Careers</div>
      <div class="cluster-card-body">
        <h3 class="cluster-card-title">${c.name}</h3>
        <p class="cluster-card-desc">${c.desc}</p>
      </div>
    </div>
  `).join('');
}

// Open the cluster detail section (sub-clusters + career list), scroll
// it into view, and fire the first page of careers.
function openClusterDetail(name) {
  const cl = CLUSTERS.find(c => c.name === name);
  if (!cl) return;
  activeCluster = name;
  const detail = document.getElementById('cluster-detail');
  detail.style.display = 'block';
  document.getElementById('cluster-detail-title').textContent = cl.name;
  document.getElementById('cluster-detail-desc').textContent = cl.desc;
  document.getElementById('cluster-subs').innerHTML =
    cl.subs.map(s => `<button class="fc sub-chip" data-sub="${s}">${s}</button>`).join('');

  // Reset pagination + fire the load
  const code = CLUSTER_CODES[name];
  clusterCareers_v2 = [];
  clusterTotal_v2 = null;
  loadedClusterCode_v2 = code;
  document.getElementById('cluster-list').innerHTML =
    '<div style="color:var(--ts);font-size:15px;padding:14px 0">Loading careers from O*NET…</div>';
  document.getElementById('cluster-rcount').innerHTML = `<strong>${name}</strong> — loading…`;
  document.getElementById('cluster-list-more').innerHTML = '';
  loadClusterIntoTarget(code, name, 'cluster-list', 'cluster-rcount', 'cluster-list-more');

  // Scroll the detail into view
  setTimeout(() => detail.scrollIntoView({behavior:'smooth', block:'start'}), 60);
}

function closeClusterDetail() {
  activeCluster = '';
  loadedClusterCode_v2 = null;
  clusterCareers_v2 = [];
  clusterTotal_v2 = null;
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

// Card gradients are class-based now (.ccard / .ccard.bright in CSS).
// Bright Outlook careers get the sunrise gradient; everyone else gets
// the primary-blue gradient.

// Markup for a single career grid card. Title + bottom-aligned salary +
// Bright Outlook pills, top-right ♡, optional Great Match badge top-left.
function buildLiveCard(c, cached, code, prefix, isSaved) {
  const tags = (cached && cached.tags) || c.tags || {};
  const sal = cached && cached.salary && cached.salary.median;
  const salPill = sal ? `<span class="ccard-pill">$${sal.toLocaleString()}/yr</span>` : '';
  const boPill = tags.brightOutlook ? `<span class="ccard-pill bo">☀ Bright Outlook</span>` : '';
  const brightCls = tags.brightOutlook ? ' bright' : '';
  return `<div class="ccard${brightCls}" data-live-code="${code}" data-prefix="${prefix||'sd'}">
    ${c.isMatch ? `<div class="ccard-match">👤 Great Match</div>` : ''}
    <button class="ccard-bm${isSaved?' saved':''}" data-live-code="${code}" aria-label="${isSaved?'Saved':'Save career'}">${isSaved?'♥':'♡'}</button>
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

  // Skeleton while loading. We don't yet know if it's Bright Outlook until
  // the fetch lands, so use the default (blue) gradient here.
  modal.innerHTML = `
    <div class="cmodal-head">
      <div class="cmodal-head-overlay"></div>
      <div class="cmodal-head-top">
        <div></div>
        <div class="cmodal-actions">
          <button class="cmodal-close" data-cmodal-close aria-label="Close">✕</button>
        </div>
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
      modal.innerHTML = `<div class="cmodal-head"><div class="cmodal-head-overlay"></div><div class="cmodal-head-top"><div></div><div class="cmodal-actions"><button class="cmodal-close" data-cmodal-close aria-label="Close">✕</button></div></div></div><div class="cmodal-body"><p style="color:var(--ts);font-size:15px">Couldn't load details. <a href="https://www.onetonline.org/link/summary/${code}" target="_blank" style="color:var(--blue)">View on O*NET →</a></p></div>`;
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
  const isGreatMatch = lastResults && !!d.tags?.brightOutlook;

  const brightCls = d.tags?.brightOutlook ? ' bright' : '';
  return `<div class="cmodal-head${brightCls}">
    <div class="cmodal-head-overlay"></div>
    <div class="cmodal-head-top">
      ${isGreatMatch ? `<div class="cmodal-match">👤 Great Match</div>` : '<div></div>'}
      <div class="cmodal-actions">
        <button class="cmodal-save${isSaved?' saved':''}" data-live-code="${code}" aria-label="Save">${isSaved?'♥':'♡'}</button>
        <button class="cmodal-close" data-cmodal-close aria-label="Close">✕</button>
      </div>
    </div>
    <div class="cmodal-head-bottom">
      <h2 class="cmodal-title" id="cmodal-title">${d.title || code}</h2>
      ${d.description ? `<p class="cmodal-desc">${d.description}</p>` : ''}
      <div class="cmodal-head-pills">${salPill}${boPill}</div>
    </div>
  </div>
  <div class="cmodal-body">
    <div class="cmodal-tabs">
      <button class="cmodal-tab active" data-mtab="ov">Overview</button>
      <button class="cmodal-tab" data-mtab="ih">Income &amp; Outlook</button>
      <button class="cmodal-tab" data-mtab="ed">Education</button>
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
        <div class="cmodal-stats" style="margin-bottom:18px">
          <div class="cmodal-stat" style="background:var(--white);color:var(--navy)"><div class="cmodal-stat-label">Low (10%)</div><div class="cmodal-stat-value">$${slo.toLocaleString()}</div></div>
          <div class="cmodal-stat"><div class="cmodal-stat-label">Median (50%)</div><div class="cmodal-stat-value">$${sal.median.toLocaleString()}</div></div>
          <div class="cmodal-stat" style="background:var(--white);color:var(--navy)"><div class="cmodal-stat-label">High (90%)</div><div class="cmodal-stat-value">$${shi.toLocaleString()}</div></div>
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
        <div class="cmodal-chips" style="grid-template-columns:1fr">
          ${eb.map(e=>`<div class="cmodal-chip" style="display:flex;align-items:center;justify-content:space-between;gap:14px">
            <span>${e.level}</span>
            <div style="display:flex;align-items:center;gap:10px;flex-shrink:0">
              <div style="width:120px;height:6px;background:var(--lg);border-radius:3px;overflow:hidden"><div style="width:${Math.min(e.pct||0,100)}%;height:100%;background:var(--blue);border-radius:3px"></div></div>
              <span style="font-size:13px;font-weight:900;min-width:48px;text-align:right">${(e.pct||0).toFixed(1)}%</span>
            </div>
          </div>`).join('')}
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

    <!-- RELATED -->
    <div class="cmodal-pane" data-mpane="rc" hidden>
      <p style="font-size:15px;color:var(--ts);margin:0 0 16px">These careers share similar skills, interests, or education pathways.</p>
      <div class="rcrow">
        ${(d.related||[]).map(r=>`
          <div class="rcard" data-live-rel="${r.code}" data-prefix="sd">
            <div class="rcard-t">${r.title}</div>
            <div class="rcard-m"></div>
          </div>`).join('')}
      </div>
    </div>

    <div class="cmodal-footer">
      <a href="https://www.onetonline.org/link/summary/${code}" target="_blank" rel="noopener">View on O*NET →</a>
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
  document.getElementById('tc').textContent = saved.size > 0 ? saved.size : '';
  if (document.getElementById('tpn').classList.contains('open')) renderTray();
  // Sync all UI for this code: grid card heart + modal save button.
  document.querySelectorAll(`.ccard-bm[data-live-code="${code}"]`).forEach(b => {
    b.classList.toggle('saved', saved.has(key));
    b.textContent = saved.has(key) ? '♥' : '♡';
  });
  document.querySelectorAll(`.cmodal-save[data-live-code="${code}"]`).forEach(b => {
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
    document.getElementById('tc').textContent = saved.size > 0 ? saved.size : '';
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
});

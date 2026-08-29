/**
 * AEGISONE Master Studio Application Controller
 * Multi-page routing, engine boot, scenario simulation, forensic drawer
 */

import { ENGINE_BOOT_STEPS, ATTACK_SCENARIOS, INITIAL_ALERT_FEED } from './data.js';
import { Simulation3D } from './simulation-3d.js';
import { HeroCanvas } from './hero-canvas.js';
import { sounds } from './sound.js';

class AegisApp {
  constructor() {
    this.page = 'hero';
    this.scenario = 'baseline';
    this.sim3d = null;
    this.heroCanvas = null;
    this.isBooting = false;
    this.alerts = [...INITIAL_ALERT_FEED];
    this.filter = 'all';
    this.query = '';
    this.drawerItem = null;
    this.soundOn = true;
  }

  init() {
    // Boot 3D
    this.sim3d = new Simulation3D('simulationCanvas');
    this.sim3d.init();

    // Boot hero canvas
    this.heroCanvas = new HeroCanvas('heroOpticalCanvas');

    // Wire everything up
    this.wireNav();
    this.wireHero();
    this.wireSound();
    this.wireEngine();
    this.wireScenario();
    this.wireCameras();
    this.wireDashboard();
    this.wireDrawer();
    this.wireThreatMatrix();

    // Render initial data
    this.renderAlertFeed();
    this.renderThreatMatrix();

    // Handle hash
    const hash = location.hash.replace('#', '');
    if (['hero','simulation','dashboard','threats','hardware'].includes(hash)) {
      this.navTo(hash);
    } else {
      this.navTo('hero');
    }

    // Animate hero flow rate counter
    this.startHeroCounter();
  }

  startHeroCounter() {
    const el = document.getElementById('heroFlowRate');
    if (!el) return;
    setInterval(() => {
      const base = 1284;
      const jitter = Math.floor((Math.random() - 0.5) * 80);
      el.textContent = (base + jitter).toLocaleString();
    }, 1800);
  }

  /* ══════════════════════════════════
     NAVIGATION
  ══════════════════════════════════ */
  wireNav() {
    document.querySelectorAll('.nav-btn[data-page]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.playClick();
        this.navTo(btn.dataset.page);
      });
    });
    document.getElementById('brandBtn')?.addEventListener('click', () => {
      this.playClick(); this.navTo('hero');
    });
    window.addEventListener('popstate', () => {
      const h = location.hash.replace('#','') || 'hero';
      this.navTo(h, false);
    });
  }

  navTo(id, pushHistory = true) {
    if (!['hero','simulation','dashboard','threats','hardware'].includes(id)) return;
    this.page = id;

    document.querySelectorAll('.nav-btn[data-page]').forEach(b =>
      b.classList.toggle('active', b.dataset.page === id));
    document.querySelectorAll('.page-view').forEach(v =>
      v.classList.toggle('active', v.id === `page-${id}`));

    if (pushHistory) location.hash = id;
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (id === 'simulation' && this.sim3d) {
      setTimeout(() => this.sim3d.onResize(), 80);
    }
  }

  /* ══════════════════════════════════
     HERO CTAs
  ══════════════════════════════════ */
  wireHero() {
    const go = (id) => { this.playClick(); this.navTo(id); };
    document.getElementById('heroCTASim')?.addEventListener('click', () => go('simulation'));
    document.getElementById('heroCTADash')?.addEventListener('click', () => go('dashboard'));
    document.getElementById('heroCardCTA')?.addEventListener('click', () => go('simulation'));
  }

  /* ══════════════════════════════════
     SOUND
  ══════════════════════════════════ */
  wireSound() {
    const btn = document.getElementById('soundBtn');
    btn?.addEventListener('click', () => {
      this.soundOn = sounds.toggle();
      btn.textContent = this.soundOn ? '🔊' : '🔇';
      if (this.soundOn) sounds.playClick();
    });
  }

  playClick() { if (this.soundOn) sounds.playClick(); }

  /* ══════════════════════════════════
     STAGED ENGINE BOOT
  ══════════════════════════════════ */
  wireEngine() {
    document.getElementById('initEnginesBtn')?.addEventListener('click', () => this.runBoot());
  }

  async runBoot() {
    if (this.isBooting) return;
    this.isBooting = true;
    const btn = document.getElementById('initEnginesBtn');
    if (btn) { btn.disabled = true; btn.innerHTML = '⚡ Calibrating…'; }

    const console_ = document.getElementById('bootConsoleOutput');
    const log = (msg) => { if (console_) console_.textContent = msg; };

    if (this.soundOn) sounds.playEngineStep();
    log('Initiating kernel-level hardware calibration sequence...');
    await this.delay(600);

    for (const step of ENGINE_BOOT_STEPS) {
      const card = document.getElementById(step.id);
      const chip = card?.querySelector('[data-status]') || card?.querySelector('.chip');
      if (chip) {
        chip.textContent = 'BOOTING...';
        chip.className = 'chip chip-amber';
      }
      if (this.soundOn) sounds.playEngineStep();

      for (const cmd of step.commands) {
        log(`[${step.name}] ${cmd}`);
        await this.delay(420);
      }

      if (chip) {
        chip.textContent = step.status || 'ONLINE';
        chip.className = 'chip chip-emerald';
      }
      if (card) card.classList.add('ready');
      await this.delay(280);
    }

    if (this.soundOn) sounds.playDiodeLock();
    log('✅ Hardware Data Diode Optical Carrier Locked. Zero Reverse Exposure Enforced. All engines synchronized.');

    if (btn) {
      btn.disabled = false;
      btn.style.background = '#059669';
      btn.innerHTML = '✓ All Engines Synchronized';
    }
    this.isBooting = false;
  }

  /* ══════════════════════════════════
     SCENARIO SELECTION
  ══════════════════════════════════ */
  wireScenario() {
    document.querySelectorAll('.scenario-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.playClick();
        this.setScenario(btn.dataset.scenario);
      });
    });

    document.getElementById('inspectBtn')?.addEventListener('click', () => {
      const s = ATTACK_SCENARIOS.find(x => x.id === this.scenario);
      if (s) this.openDrawer(s);
    });
  }

  setScenario(id) {
    this.scenario = id;
    const s = ATTACK_SCENARIOS.find(x => x.id === id) || ATTACK_SCENARIOS[0];

    document.querySelectorAll('.scenario-btn').forEach(b =>
      b.classList.toggle('active', b.dataset.scenario === id));

    this.sim3d?.setScenario(id);

    // Update HUD
    document.getElementById('hudScenarioName').textContent = s.name;
    document.getElementById('hudIngestRate').textContent = s.ingestRate;
    document.getElementById('hudConfidence').textContent = s.confidence;
    document.getElementById('hudConfidence').style.color = s.type === 'safe' ? '#059669' : '#e11d48';

    // Update detection banner
    const banner = document.getElementById('detectionBanner');
    if (banner) {
      banner.className = `detection-banner ${s.type === 'safe' ? 'safe' : s.severity === 'critical' ? 'danger' : 'warn'}`;
      banner.querySelector('.det-icon').textContent = s.type === 'safe' ? '✓' : '⚠️';
      document.getElementById('detTitle').textContent = s.badge;
      document.getElementById('detDesc').textContent = s.summary;
      document.getElementById('detConf').textContent = s.confidence;
    }

    if (s.type !== 'safe') {
      if (this.soundOn) sounds.playAlert(s.severity);
      this.showToast(s.name, s.summary, s.severity === 'critical' ? 'danger' : 'warn');
      this.injectAlert(s);
    }
  }

  /* ══════════════════════════════════
     CAMERAS
  ══════════════════════════════════ */
  wireCameras() {
    document.querySelectorAll('.cam-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.playClick();
        document.querySelectorAll('.cam-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.sim3d?.setCameraPreset(btn.dataset.cam);
      });
    });
  }

  /* ══════════════════════════════════
     DASHBOARD
  ══════════════════════════════════ */
  wireDashboard() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.playClick();
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.filter = btn.dataset.filter;
        this.renderAlertFeed();
      });
    });

    document.getElementById('alertSearch')?.addEventListener('input', e => {
      this.query = e.target.value.toLowerCase().trim();
      this.renderAlertFeed();
    });
  }

  injectAlert(s) {
    this.alerts.unshift({
      id: `ALT-${Math.floor(8000 + Math.random() * 999)}`,
      scenarioId: s.id, title: s.name, severity: s.severity,
      time: 'Just now', source: s.flowData?.sourceIp || '198.51.100.x',
      target: s.flowData?.destIp || '10.0.0.15', summary: s.summary,
      confidence: s.confidence, mitreCode: s.mitreCode
    });
    if (this.alerts.length > 20) this.alerts.pop();
    this.renderAlertFeed();
    const kpi = document.getElementById('kpiThreatCount');
    if (kpi) kpi.textContent = this.alerts.filter(a => a.severity !== 'info').length;
    const badge = document.getElementById('navBadge');
    if (badge) badge.textContent = this.alerts.length;
  }

  renderAlertFeed() {
    const feed = document.getElementById('alertFeed');
    if (!feed) return;

    const items = this.alerts.filter(a => {
      if (this.filter !== 'all' && a.severity !== this.filter) return false;
      if (this.query) {
        return [a.title, a.summary, a.source, a.target, a.id].some(v => v.toLowerCase().includes(this.query));
      }
      return true;
    });

    if (!items.length) {
      feed.innerHTML = `<div style="text-align:center;padding:48px;color:var(--ink-400);background:rgba(255,255,255,0.7);border-radius:var(--r-lg);">No alerts matching filter criteria.</div>`;
      return;
    }

    feed.innerHTML = items.map(a => `
      <div class="alert-item ${a.severity}" data-scenario-id="${a.scenarioId}">
        <div class="alert-rail"></div>
        <div>
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
            <span style="font-family:var(--font-mono);font-size:0.7rem;font-weight:700;color:var(--ink-400);">${a.id}</span>
            <span class="chip chip-${a.severity === 'critical' ? 'crimson' : a.severity === 'high' ? 'amber' : 'cyan'}">${a.severity}</span>
            <span style="font-family:var(--font-mono);font-size:0.7rem;color:var(--ink-400);">⏱ ${a.time}</span>
          </div>
          <div class="alert-title">${a.title}</div>
          <div class="alert-meta">${a.summary}</div>
        </div>
        <span class="chip chip-blue">${a.mitreCode !== 'N/A' ? 'MITRE '+a.mitreCode : 'Baseline'}</span>
        <div style="display:flex;align-items:center;gap:12px;">
          <div style="text-align:right;">
            <div style="font-family:var(--font-mono);font-size:1.1rem;font-weight:800;color:var(--ink-900);">${a.confidence}</div>
            <div style="font-family:var(--font-mono);font-size:0.62rem;color:var(--ink-400);text-transform:uppercase;">Confidence</div>
          </div>
          <button class="btn btn-glass btn-sm inspect-alert" data-id="${a.scenarioId}">Inspect</button>
        </div>
      </div>
    `).join('');

    feed.querySelectorAll('.alert-item').forEach(el => {
      el.addEventListener('click', () => {
        const s = ATTACK_SCENARIOS.find(x => x.id === el.dataset.scenarioId) || ATTACK_SCENARIOS[1];
        this.openDrawer(s);
      });
    });
  }

  /* ══════════════════════════════════
     THREAT MATRIX
  ══════════════════════════════════ */
  wireThreatMatrix() {
    document.getElementById('threatGrid')?.addEventListener('click', e => {
      const btn = e.target.closest('.sim-btn');
      if (!btn) return;
      this.playClick();
      this.navTo('simulation');
      this.setScenario(btn.dataset.id);
    });
  }

  renderThreatMatrix() {
    const grid = document.getElementById('threatGrid');
    if (!grid) return;

    const threats = ATTACK_SCENARIOS.filter(s => s.id !== 'baseline');
    grid.innerHTML = threats.map(t => `
      <article class="threat-card">
        <div style="display:flex;align-items:center;justify-content:space-between;">
          <span class="chip chip-blue">${t.code}</span>
          <span class="chip chip-${t.severity === 'critical' ? 'crimson' : t.severity === 'high' ? 'amber' : 'cyan'}">${t.severity}</span>
        </div>
        <div class="threat-card-title">${t.name}</div>
        <div class="threat-card-desc">${t.summary}</div>
        <div class="threat-indicators">
          <div class="threat-indicators-title">Detection Indicators</div>
          <ul>
            <li>Timing jitter: ${t.flowData?.jitter || 'N/A'}</li>
            <li>Shannon entropy: ${t.flowData?.entropy || 'N/A'}</li>
            <li>Ingest rate: ${t.ingestRate} flows/sec</li>
          </ul>
        </div>
        <div class="threat-card-footer">
          <span class="mitre-tag">MITRE ${t.mitreCode}</span>
          <button class="btn btn-primary btn-sm sim-btn" data-id="${t.id}">Simulate in 3D ▸</button>
        </div>
      </article>
    `).join('');
  }

  /* ══════════════════════════════════
     FORENSIC DRAWER
  ══════════════════════════════════ */
  wireDrawer() {
    document.getElementById('closeDrawerBtn')?.addEventListener('click', () => this.closeDrawer());
    document.getElementById('drawerBackdrop')?.addEventListener('click', e => {
      if (e.target === document.getElementById('drawerBackdrop')) this.closeDrawer();
    });

    document.querySelectorAll('.drawer-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        this.playClick();
        document.querySelectorAll('.drawer-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const isJson = tab.dataset.tab === 'json';
        document.getElementById('tabPlain').style.display = isJson ? 'none' : 'flex';
        document.getElementById('tabJson').style.display = isJson ? 'block' : 'none';
      });
    });

    document.getElementById('drawerSimBtn')?.addEventListener('click', () => {
      if (!this.drawerItem) return;
      this.closeDrawer();
      this.navTo('simulation');
      this.setScenario(this.drawerItem.id);
    });
  }

  openDrawer(s) {
    this.drawerItem = s;
    this.playClick();

    document.getElementById('drawerCode').textContent = s.code;
    document.getElementById('drawerSeverityChip').textContent = s.severity.toUpperCase();
    document.getElementById('drawerSeverityChip').className = `chip chip-${s.severity === 'critical' ? 'crimson' : s.severity === 'high' ? 'amber' : 'cyan'}`;
    document.getElementById('drawerTitle').textContent = s.name;
    document.getElementById('drawerSummaryHead').textContent = s.summary;
    document.getElementById('drawerSummaryBody').textContent = s.explanation;
    document.getElementById('drawerSrc').textContent = s.flowData?.sourceIp || '198.51.100.44';
    document.getElementById('drawerDst').textContent = s.flowData?.destIp || '10.0.0.15';

    const table = document.getElementById('drawerTable');
    if (table && s.flowData) {
      const rows = [
        ['Protocol', s.flowData.protocol], ['Packets/sec', s.flowData.packetsPerSec],
        ['Volume Rate', s.flowData.byteVolume], ['Timing Jitter', s.flowData.jitter],
        ['Shannon Entropy', s.flowData.entropy], ['MITRE Code', s.mitreCode]
      ];
      table.innerHTML = rows.map(([k, v]) => `
        <tr style="border-bottom:1px solid rgba(203,213,225,0.5);">
          <td style="padding:9px 0;color:var(--ink-400);font-weight:500;">${k}</td>
          <td style="padding:9px 0;text-align:right;font-family:var(--font-mono);font-weight:700;color:var(--ink-900);">${v}</td>
        </tr>`).join('');
    }

    const jsonEl = document.getElementById('drawerJson');
    if (jsonEl && s.rawJson) jsonEl.textContent = JSON.stringify(s.rawJson, null, 2);

    document.getElementById('drawerBackdrop').classList.add('open');
  }

  closeDrawer() {
    document.getElementById('drawerBackdrop')?.classList.remove('open');
  }

  /* ══════════════════════════════════
     TOASTS
  ══════════════════════════════════ */
  showToast(title, msg, type = 'danger') {
    const stack = document.getElementById('toastStack');
    if (!stack) return;
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.innerHTML = `
      <div class="toast-ico">${type === 'danger' ? '⚠️' : '⚡'}</div>
      <div><div class="toast-ttl">${title}</div><div class="toast-msg">${msg}</div></div>
      <button class="toast-close">✕</button>
    `;
    el.querySelector('.toast-close').addEventListener('click', () => el.remove());
    stack.appendChild(el);
    setTimeout(() => { el.style.opacity = '0'; el.style.transform = 'translateX(60px)'; setTimeout(() => el.remove(), 280); }, 5500);
  }

  delay(ms) { return new Promise(r => setTimeout(r, ms)); }
}

document.addEventListener('DOMContentLoaded', () => {
  window.aegis = new AegisApp();
  window.aegis.init();
});

/**
 * AEGISONE Hero Canvas — Animated 2D Optical Diode Flow Visualizer
 * Draws animated particles flowing left→right through the optical diode
 */
export class HeroCanvas {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.w = this.canvas.width;
    this.h = this.canvas.height;
    this.t = 0;
    this.particles = [];

    // Zones (as fraction of width)
    this.zones = {
      serverRight: 0.18,
      diodeLeft:   0.32,
      diodeRight:  0.68,
      aiLeft:      0.82,
    };

    for (let i = 0; i < 38; i++) {
      this.particles.push(this.makeParticle());
    }

    this.animate();
  }

  makeParticle(forced_x) {
    return {
      x: forced_x !== undefined ? forced_x : Math.random() * this.w,
      y: this.h / 2 + (Math.random() - 0.5) * 24,
      speed: 1.4 + Math.random() * 1.1,
      r: 3.5 + Math.random() * 2.5,
      type: Math.random() > 0.8 ? 'threat' : 'normal',
      alpha: 0.7 + Math.random() * 0.3,
      oy: (Math.random() - 0.5) * 20
    };
  }

  draw() {
    const { ctx, w, h, t } = this;
    ctx.clearRect(0, 0, w, h);

    // ── Background sections ──
    const zones = this.zones;

    // Left zone: Protected Server
    const gL = ctx.createLinearGradient(0, 0, w * zones.serverRight, 0);
    gL.addColorStop(0, 'rgba(239,246,255,0.9)');
    gL.addColorStop(1, 'rgba(219,234,254,0.7)');
    ctx.fillStyle = gL;
    ctx.beginPath();
    ctx.roundRect(6, 6, w * zones.serverRight - 10, h - 12, 12);
    ctx.fill();

    // Server rack icon
    ctx.fillStyle = '#1e293b';
    ctx.roundRect(14, 14, w * zones.serverRight - 22, h - 28, 8);
    ctx.fill();
    for (let b = 0; b < 4; b++) {
      const by = 22 + b * 22;
      ctx.fillStyle = '#334155';
      ctx.fillRect(18, by, w * zones.serverRight - 30, 14);
      for (let l = 0; l < 4; l++) {
        ctx.fillStyle = l === 0 ? '#10b981' : '#38bdf8';
        ctx.beginPath();
        ctx.arc(24 + l * 12, by + 7, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 9px "JetBrains Mono", monospace';
    ctx.fillText('PROTECTED', 14, h - 18);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '8px "JetBrains Mono", monospace';
    ctx.fillText('TX FIBER ONLY', 14, h - 8);

    // Center zone: Optical Diode
    const dX = w * zones.diodeLeft;
    const dW = w * (zones.diodeRight - zones.diodeLeft);
    const gD = ctx.createLinearGradient(dX, 0, dX + dW, 0);
    gD.addColorStop(0, 'rgba(224,242,254,0.95)');
    gD.addColorStop(0.5, 'rgba(255,255,255,0.98)');
    gD.addColorStop(1, 'rgba(224,242,254,0.95)');
    ctx.fillStyle = gD;
    ctx.shadowColor = 'rgba(0,98,255,0.15)';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.roundRect(dX + 4, 4, dW - 8, h - 8, 14);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Diode border
    ctx.strokeStyle = 'rgba(0,98,255,0.35)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(dX + 4, 4, dW - 8, h - 8, 14);
    ctx.stroke();

    // Laser beam through diode
    const beamAlpha = 0.85 + Math.sin(t * 8) * 0.15;
    const beamGrad = ctx.createLinearGradient(dX + 10, 0, dX + dW - 10, 0);
    beamGrad.addColorStop(0, `rgba(0,212,255,${beamAlpha})`);
    beamGrad.addColorStop(0.5, `rgba(0,98,255,${beamAlpha * 0.7})`);
    beamGrad.addColorStop(1, `rgba(0,212,255,${beamAlpha})`);
    ctx.fillStyle = beamGrad;
    ctx.shadowColor = '#00d4ff';
    ctx.shadowBlur = 8;
    ctx.fillRect(dX + 12, h / 2 - 2.5, dW - 24, 5);
    ctx.shadowBlur = 0;

    // Prism crystal at center
    const cx = dX + dW / 2, cy = h / 2;
    const prismSize = 18 + Math.sin(t * 1.5) * 2;
    const prismRot = t * 1.2;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(prismRot);
    const pg = ctx.createRadialGradient(0, 0, 0, 0, 0, prismSize);
    pg.addColorStop(0, 'rgba(0,212,255,0.95)');
    pg.addColorStop(0.5, 'rgba(0,98,255,0.7)');
    pg.addColorStop(1, 'rgba(124,58,237,0.4)');
    ctx.fillStyle = pg;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      i === 0 ? ctx.moveTo(Math.cos(a) * prismSize, Math.sin(a) * prismSize) : ctx.lineTo(Math.cos(a) * prismSize, Math.sin(a) * prismSize);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Barrier plate (red block)
    const bx = dX + dW * 0.76;
    const barrierGrad = ctx.createLinearGradient(bx, 0, bx + 8, 0);
    barrierGrad.addColorStop(0, '#e11d48');
    barrierGrad.addColorStop(1, '#be123c');
    ctx.fillStyle = barrierGrad;
    ctx.shadowColor = '#e11d48';
    ctx.shadowBlur = 8;
    ctx.fillRect(bx, h * 0.25, 8, h * 0.5);
    ctx.shadowBlur = 0;

    // Label: AEGIS-DIODE
    ctx.fillStyle = '#0062ff';
    ctx.font = 'bold 9px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('AEGIS-DIODE', cx, 18);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '8px "JetBrains Mono", monospace';
    ctx.fillText('1550nm LASER', cx, h - 8);
    ctx.textAlign = 'left';

    // Right zone: AI Enclave
    const aX = w * zones.aiLeft;
    const gR = ctx.createLinearGradient(aX, 0, w, 0);
    gR.addColorStop(0, 'rgba(209,250,229,0.7)');
    gR.addColorStop(1, 'rgba(236,253,245,0.9)');
    ctx.fillStyle = gR;
    ctx.beginPath();
    ctx.roundRect(aX + 6, 6, w - aX - 12, h - 12, 12);
    ctx.fill();

    // Neural orb
    const ncx = aX + (w - aX) * 0.5;
    const ncy = h * 0.5;
    const nr = 28 + Math.sin(t * 2) * 3;
    for (let ring = 3; ring >= 1; ring--) {
      const rr = nr * (1 + ring * 0.35);
      ctx.strokeStyle = `rgba(16,185,129,${0.12 / ring})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(ncx, ncy, rr, 0, Math.PI * 2);
      ctx.stroke();
    }
    const ng = ctx.createRadialGradient(ncx, ncy, 0, ncx, ncy, nr);
    ng.addColorStop(0, 'rgba(5,150,105,0.85)');
    ng.addColorStop(0.5, 'rgba(16,185,129,0.5)');
    ng.addColorStop(1, 'rgba(0,98,255,0.1)');
    ctx.fillStyle = ng;
    ctx.shadowColor = '#10b981';
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.arc(ncx, ncy, nr, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Wireframe neural net lines
    ctx.strokeStyle = 'rgba(16,185,129,0.55)';
    ctx.lineWidth = 0.8;
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + t * 0.5;
      const nx = ncx + Math.cos(a) * nr * 0.85;
      const ny = ncy + Math.sin(a) * nr * 0.85;
      ctx.beginPath(); ctx.moveTo(ncx, ncy); ctx.lineTo(nx, ny); ctx.stroke();
    }

    ctx.fillStyle = '#059669';
    ctx.font = 'bold 9px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('AI ENCLAVE', ncx, h - 10);
    ctx.textAlign = 'left';

    // ── No Return Path ──
    ctx.strokeStyle = 'rgba(225,29,72,0.4)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(aX + 10, h - 16);
    ctx.bezierCurveTo(w * 0.6, h + 20, w * 0.35, h + 20, w * zones.serverRight - 10, h - 16);
    ctx.stroke();
    ctx.setLineDash([]);

    // ── Flowing Particles ──
    this.particles.forEach(p => {
      const inside = p.x > w * zones.diodeLeft && p.x < w * zones.diodeRight;
      let color = p.type === 'threat' ? '#e11d48' : '#0062ff';
      let emissive = p.type === 'threat' ? 'rgba(225,29,72,' : 'rgba(0,98,255,';

      // Glow
      const gp = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 2.5);
      gp.addColorStop(0, emissive + `${p.alpha * 0.6})`);
      gp.addColorStop(1, 'transparent');
      ctx.fillStyle = gp;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Core particle
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 6;
      ctx.globalAlpha = p.alpha;
      ctx.beginPath();
      ctx.arc(p.x, inside ? h / 2 + (p.oy * 0.05) : p.y, inside ? p.r * 0.65 : p.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;

      // Advance
      p.x += p.speed;
      if (p.x > w + 10) {
        p.x = -10;
        p.y = h / 2 + (Math.random() - 0.5) * 24;
      }
    });
  }

  animate() {
    this.t += 0.016;
    this.draw();
    requestAnimationFrame(() => this.animate());
  }
}

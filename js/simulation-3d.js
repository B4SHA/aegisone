/**
 * AEGISONE 3D WebGL Simulation — High-Quality Three.js Scene
 * Photorealistic Server Rack · Optical Prism Diode · AI Neural Core
 */

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.js';

export class Simulation3D {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.scene = this.camera = this.renderer = null;
    this.time = 0;
    this.speed = 1.0;
    this.activeScenario = 'baseline';

    // Objects
    this.serverGroup = null;
    this.diodeGroup = null;
    this.neuralGroup = null;
    this.laserBeam = null;
    this.prismCrystal = null;
    this.neuralCore = null;
    this.neuralRings = [];
    this.neuralNodes = [];
    this.serverLEDs = [];

    // Packets
    this.normalPackets = [];
    this.threatPackets = [];
    this.radarMesh = null;
    this.beaconRings = [];

    // Camera targets
    this.presets = {
      overview: { pos: new THREE.Vector3(0, 3.2, 13.5), look: new THREE.Vector3(0, 0, 0) },
      diode:    { pos: new THREE.Vector3(0, 1.0,  5.2), look: new THREE.Vector3(0, 0, 0) },
      enclave:  { pos: new THREE.Vector3(5.5, 1.6, 6.5), look: new THREE.Vector3(5.5, 0, 0) }
    };
    this.camTargetPos = this.presets.overview.pos.clone();
    this.camTargetLook = this.presets.overview.look.clone();
    this.camCurrentLook = new THREE.Vector3(0, 0, 0);
  }

  init() {
    if (!this.canvas) return;

    /* ── Scene ── */
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(0xf0f4ff, 20, 55);

    /* ── Camera ── */
    const r = this.canvas.getBoundingClientRect();
    const W = r.width || 1200, H = r.height || 640;
    this.camera = new THREE.PerspectiveCamera(44, W / H, 0.05, 80);
    this.camera.position.copy(this.presets.overview.pos);

    /* ── Renderer ── */
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, alpha: true, antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(W, H, false);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;

    /* ── Lighting ── */
    this.scene.add(new THREE.AmbientLight(0xffffff, 2.2));

    const key = new THREE.DirectionalLight(0xffffff, 2.8);
    key.position.set(8, 14, 10); this.scene.add(key);

    const sky = new THREE.DirectionalLight(0xdbeafe, 1.8);
    sky.position.set(-6, 8, 6); this.scene.add(sky);

    const rim = new THREE.DirectionalLight(0xd1fae5, 1.0);
    rim.position.set(0, -4, -8); this.scene.add(rim);

    this.diodeGlow = new THREE.PointLight(0x00d4ff, 5.0, 7);
    this.diodeGlow.position.set(0, 0.4, 0); this.scene.add(this.diodeGlow);

    this.aiGlow = new THREE.PointLight(0x10b981, 3.5, 6);
    this.aiGlow.position.set(5.5, 0.5, 0); this.scene.add(this.aiGlow);

    /* ── Build Scene ── */
    this.buildFloor();
    this.buildServerRack();
    this.buildOpticalDiode();
    this.buildAINeuralCore();
    this.buildCables();
    this.buildParticles();
    this.buildReconRadar();
    this.buildBeaconWaves();

    /* ── Resize ── */
    window.addEventListener('resize', () => this.onResize());
    new ResizeObserver(() => this.onResize()).observe(this.canvas);

    /* ── Start ── */
    this.animate();
  }

  /* ─────────────────────────────── FLOOR ─── */
  buildFloor() {
    const geo = new THREE.PlaneGeometry(36, 20);
    const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.55 });
    const floor = new THREE.Mesh(geo, mat);
    floor.rotation.x = -Math.PI / 2; floor.position.y = -2.2;
    this.scene.add(floor);

    const grid = new THREE.GridHelper(32, 40, 0x0062ff, 0xc7d8f0);
    grid.position.y = -2.18;
    grid.material.transparent = true; grid.material.opacity = 0.35;
    this.scene.add(grid);
  }

  /* ─────────────────────────────── SERVER RACK ─── */
  buildServerRack() {
    this.serverGroup = new THREE.Group();
    this.serverGroup.position.set(-6.0, 0, 0);

    /* Main chassis — dark anodized titanium */
    const body = this.mesh(
      new THREE.BoxGeometry(1.5, 2.4, 1.5),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.95, roughness: 0.15 })
    );
    this.serverGroup.add(body);

    /* Brushed steel accent strips */
    for (let i = 0; i < 3; i++) {
      const strip = this.mesh(
        new THREE.BoxGeometry(1.52, 0.04, 1.52),
        new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 1.0, roughness: 0.05, emissive: 0x38bdf8, emissiveIntensity: 0.4 })
      );
      strip.position.y = 0.8 - i * 0.8;
      this.serverGroup.add(strip);
    }

    /* Front tempered glass fascia */
    const fascia = this.mesh(
      new THREE.BoxGeometry(1.3, 2.22, 0.08),
      new THREE.MeshPhysicalMaterial({ color: 0x0f172a, metalness: 0.7, roughness: 0.2, transparent: true, opacity: 0.9 })
    );
    fascia.position.z = 0.79;
    this.serverGroup.add(fascia);

    /* Blade server units (4) */
    this.serverLEDs = [];
    for (let b = 0; b < 4; b++) {
      const y = 0.75 - b * 0.5;
      const blade = this.mesh(
        new THREE.BoxGeometry(1.2, 0.38, 0.07),
        new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.7, roughness: 0.35 })
      );
      blade.position.set(0, y, 0.815);
      this.serverGroup.add(blade);

      /* Per-blade status LEDs */
      for (let l = 0; l < 5; l++) {
        const ledGeo = new THREE.SphereGeometry(0.022, 8, 8);
        const ledMat = new THREE.MeshBasicMaterial({
          color: l === 0 ? 0x10b981 : l === 1 ? 0x38bdf8 : 0x0062ff
        });
        const led = new THREE.Mesh(ledGeo, ledMat);
        led.position.set(-0.46 + l * 0.22, y, 0.855);
        this.serverGroup.add(led);
        this.serverLEDs.push({ mesh: led, blinkOffset: l * 0.8 + b * 1.2 });
      }
    }

    /* Rear ventilation grille texture */
    for (let g = 0; g < 5; g++) {
      const grille = this.mesh(
        new THREE.BoxGeometry(1.1, 0.045, 0.05),
        new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8, roughness: 0.3 })
      );
      grille.position.set(0, 0.5 - g * 0.25, -0.77);
      this.serverGroup.add(grille);
    }

    this.scene.add(this.serverGroup);
  }

  /* ─────────────────────────────── OPTICAL DIODE ─── */
  buildOpticalDiode() {
    this.diodeGroup = new THREE.Group();
    this.diodeGroup.position.set(0, 0, 0);

    /* Outer industrial enclosure */
    const chassis = this.mesh(
      new THREE.BoxGeometry(2.8, 2.0, 2.0),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.92, roughness: 0.18 })
    );
    this.diodeGroup.add(chassis);

    /* Transparent sapphire glass observation window */
    const window_ = this.mesh(
      new THREE.BoxGeometry(2.55, 1.72, 2.05),
      new THREE.MeshPhysicalMaterial({
        color: 0x38bdf8, transparent: true, opacity: 0.18,
        roughness: 0.02, metalness: 0.0, transmission: 0.9, ior: 1.52, thickness: 0.5
      })
    );
    this.diodeGroup.add(window_);

    /* AEGISONE branding text plate */
    const plate = this.mesh(
      new THREE.BoxGeometry(1.8, 0.22, 0.05),
      new THREE.MeshStandardMaterial({ color: 0x0062ff, metalness: 0.9, roughness: 0.1, emissive: 0x0062ff, emissiveIntensity: 0.3 })
    );
    plate.position.set(0, 1.06, 1.03);
    this.diodeGroup.add(plate);

    /* Laser emitter barrel (left side) */
    const emitter = this.mesh(
      new THREE.CylinderGeometry(0.26, 0.32, 0.7, 20),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.96, roughness: 0.08 })
    );
    emitter.rotation.z = Math.PI / 2;
    emitter.position.set(-0.9, 0, 0);
    this.diodeGroup.add(emitter);

    /* Multi-faceted optical collimating prism crystal */
    const prismGeo = new THREE.OctahedronGeometry(0.48, 0);
    prismGeo.scale(1, 0.7, 1);
    const prismMat = new THREE.MeshPhysicalMaterial({
      color: 0x00d4ff, emissive: 0x0062ff, emissiveIntensity: 0.8,
      transparent: true, opacity: 0.88, roughness: 0.04, metalness: 0.1,
      transmission: 0.2, ior: 1.7
    });
    this.prismCrystal = new THREE.Mesh(prismGeo, prismMat);
    this.diodeGroup.add(this.prismCrystal);

    /* 1-Way high-intensity laser beam core */
    const beamGeo = new THREE.CylinderGeometry(0.045, 0.045, 2.4, 16);
    beamGeo.rotateZ(Math.PI / 2);
    const beamMat = new THREE.MeshBasicMaterial({ color: 0x00d4ff, transparent: true, opacity: 0.95 });
    this.laserBeam = new THREE.Mesh(beamGeo, beamMat);
    this.diodeGroup.add(this.laserBeam);

    /* Laser glow bloom shell */
    const glowGeo = new THREE.CylinderGeometry(0.14, 0.14, 2.3, 16);
    glowGeo.rotateZ(Math.PI / 2);
    const glowMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.15 });
    this.diodeGroup.add(new THREE.Mesh(glowGeo, glowMat));

    /* Physical reverse barrier — titanium red light-trap plate */
    const barrier = this.mesh(
      new THREE.BoxGeometry(0.14, 1.6, 1.6),
      new THREE.MeshStandardMaterial({
        color: 0xe11d48, emissive: 0xe11d48, emissiveIntensity: 0.55,
        metalness: 0.85, roughness: 0.15
      })
    );
    barrier.position.x = 0.76;
    this.diodeGroup.add(barrier);

    /* Anti-return cross etching on barrier */
    const crossH = this.mesh(
      new THREE.BoxGeometry(0.18, 0.04, 0.4),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    crossH.position.set(0.82, 0, 0);
    this.diodeGroup.add(crossH);

    const crossV = this.mesh(
      new THREE.BoxGeometry(0.18, 0.4, 0.04),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    crossV.position.set(0.82, 0, 0);
    this.diodeGroup.add(crossV);

    /* 1-Way directional arrow indicator */
    const arrowCone = new THREE.ConeGeometry(0.18, 0.38, 8);
    arrowCone.rotateZ(-Math.PI / 2);
    const arrowMesh = new THREE.Mesh(arrowCone, new THREE.MeshBasicMaterial({ color: 0x10b981 }));
    arrowMesh.position.set(0.06, 1.12, 0);
    this.diodeGroup.add(arrowMesh);

    this.scene.add(this.diodeGroup);
  }

  /* ─────────────────────────────── AI NEURAL CORE ─── */
  buildAINeuralCore() {
    this.neuralGroup = new THREE.Group();
    this.neuralGroup.position.set(5.8, 0, 0);

    /* Outer holographic neural net wireframe sphere */
    const outerGeo = new THREE.IcosahedronGeometry(1.1, 2);
    const outerMat = new THREE.MeshStandardMaterial({
      color: 0x10b981, emissive: 0x059669, emissiveIntensity: 1.1,
      wireframe: true, transparent: true, opacity: 0.75
    });
    this.neuralCore = new THREE.Mesh(outerGeo, outerMat);
    this.neuralGroup.add(this.neuralCore);

    /* Inner dense solid quantum processor */
    const innerGeo = new THREE.IcosahedronGeometry(0.52, 2);
    const innerMat = new THREE.MeshStandardMaterial({
      color: 0x065f46, metalness: 0.98, roughness: 0.05,
      emissive: 0x047857, emissiveIntensity: 0.6
    });
    this.neuralGroup.add(new THREE.Mesh(innerGeo, innerMat));

    /* Micro neural synapse nodes pulsing around core */
    this.neuralNodes = [];
    const nodeGeo = new THREE.SphereGeometry(0.05, 8, 8);
    const nodeMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    for (let i = 0; i < 14; i++) {
      const node = new THREE.Mesh(nodeGeo, nodeMat.clone());
      const phi = Math.acos(1 - 2 * (i + 0.5) / 14);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      const r = 0.95;
      node.position.set(r * Math.sin(phi) * Math.cos(theta), r * Math.sin(phi) * Math.sin(theta), r * Math.cos(phi));
      this.neuralGroup.add(node);
      this.neuralNodes.push(node);
    }

    /* Counter-rotating orbital tensor rings */
    this.neuralRings = [];
    const ringSizes = [1.4, 1.75, 2.1];
    const ringColors = [0x10b981, 0x0062ff, 0x7c3aed];
    ringSizes.forEach((r, idx) => {
      const geo = new THREE.TorusGeometry(r, 0.025, 8, 64);
      const mat = new THREE.MeshBasicMaterial({ color: ringColors[idx], transparent: true, opacity: 0.6 - idx * 0.12 });
      const ring = new THREE.Mesh(geo, mat);
      ring.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      this.neuralGroup.add(ring);
      this.neuralRings.push({ mesh: ring, speed: 0.6 + idx * 0.25, dir: idx % 2 === 0 ? 1 : -1 });
    });

    /* AI reception pulse sphere */
    const pulseSphere = new THREE.Mesh(
      new THREE.SphereGeometry(1.45, 24, 24),
      new THREE.MeshBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.05, side: THREE.BackSide })
    );
    this.neuralGroup.add(pulseSphere);
    this.aiPulseSphere = pulseSphere;

    this.scene.add(this.neuralGroup);
  }

  /* ─────────────────────────────── CABLES & FIBERS ─── */
  buildCables() {
    /* Ingress optical fiber — server to diode */
    this.addLine([-5.25, 0, 0], [-1.4, 0, 0], 0x0062ff, 0.7);

    /* Egress fiber — diode to AI enclave */
    this.addLine([1.4, 0, 0], [4.7, 0, 0], 0x10b981, 0.75);
  }

  addLine(from, to, color, opacity = 1) {
    const mat = new THREE.LineBasicMaterial({ color, transparent: opacity < 1, opacity });
    const geo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(...from), new THREE.Vector3(...to)]);
    this.scene.add(new THREE.Line(geo, mat));
  }

  /* ─────────────────────────────── PARTICLES ─── */
  buildParticles() {
    /* Normal cyan ingress packets */
    const nGeo = new THREE.SphereGeometry(0.075, 10, 10);
    const nMat = new THREE.MeshStandardMaterial({ color: 0x0062ff, emissive: 0x38bdf8, emissiveIntensity: 1.2, roughness: 0.05 });
    for (let i = 0; i < 60; i++) {
      const mesh = new THREE.Mesh(nGeo, nMat);
      this.scene.add(mesh);
      this.normalPackets.push({ mesh, p: Math.random(), speed: 0.006 + Math.random() * 0.004, oy: (Math.random() - 0.5) * 0.28, oz: (Math.random() - 0.5) * 0.28 });
    }

    /* Threat packets — crimson/amber */
    for (let i = 0; i < 45; i++) {
      const color = i < 25 ? 0xe11d48 : 0xd97706;
      const emissive = i < 25 ? 0xf43f5e : 0xf59e0b;
      const tGeo = new THREE.SphereGeometry(0.085, 10, 10);
      const tMat = new THREE.MeshStandardMaterial({ color, emissive, emissiveIntensity: 1.3, roughness: 0.05 });
      const mesh = new THREE.Mesh(tGeo, tMat);
      mesh.visible = false;
      this.scene.add(mesh);
      this.threatPackets.push({ mesh, p: Math.random(), speed: 0.016 + Math.random() * 0.01, oy: (Math.random() - 0.5) * 0.6, oz: (Math.random() - 0.5) * 0.6 });
    }
  }

  buildReconRadar() {
    const geo = new THREE.RingGeometry(0.3, 3.2, 40);
    const mat = new THREE.MeshBasicMaterial({ color: 0xd97706, transparent: true, opacity: 0, side: THREE.DoubleSide });
    this.radarMesh = new THREE.Mesh(geo, mat);
    this.radarMesh.rotation.x = -Math.PI / 2;
    this.radarMesh.position.set(-6.0, -0.5, 0);
    this.scene.add(this.radarMesh);
  }

  buildBeaconWaves() {
    this.beaconRings = [];
    for (let i = 0; i < 4; i++) {
      const geo = new THREE.RingGeometry(0.18, 0.26, 32);
      const mat = new THREE.MeshBasicMaterial({ color: 0xd97706, transparent: true, opacity: 0, side: THREE.DoubleSide });
      const ring = new THREE.Mesh(geo, mat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(-6.0, 0.3, 0);
      this.scene.add(ring);
      this.beaconRings.push({ mesh: ring, phase: i * 0.6, scale: 1 });
    }
  }

  /* ─────────────────────────────── SCENARIO ─── */
  setScenario(id) {
    this.activeScenario = id;
    const isThreat = id !== 'baseline';
    this.threatPackets.forEach((p, i) => {
      p.mesh.visible = isThreat;
      if (id === 'ddos-flood') { p.speed = 0.028 + Math.random() * 0.016; }
      else if (id === 'dns-tunnel') { p.mesh.material.color.setHex(0xd97706); p.mesh.material.emissive.setHex(0xfbbf24); p.speed = 0.012; }
      else if (id === 'tls-anomaly') { p.mesh.material.color.setHex(0x7c3aed); p.mesh.material.emissive.setHex(0xa78bfa); p.speed = 0.009; }
      else if (id === 'c2-beacon') { p.mesh.material.color.setHex(0xf97316); p.speed = 0.008; }
      else if (id === 'recon-sweep') { p.mesh.visible = false; }
    });
    if (id === 'recon-sweep') this.radarMesh.material.opacity = 0.65;
    else this.radarMesh.material.opacity = 0;
  }

  setCameraPreset(name) {
    const p = this.presets[name];
    if (p) { this.camTargetPos = p.pos; this.camTargetLook = p.look; }
  }

  /* ─────────────────────────────── ANIMATE ─── */
  animate() {
    requestAnimationFrame(() => this.animate());
    this.time += 0.016 * this.speed;
    const t = this.time;

    /* Camera smooth lerp */
    this.camera.position.lerp(this.camTargetPos, 0.035);
    this.camCurrentLook.lerp(this.camTargetLook, 0.04);
    this.camera.lookAt(this.camCurrentLook);

    /* Server blade LED blink */
    this.serverLEDs.forEach(({ mesh, blinkOffset }) => {
      mesh.material.opacity = Math.sin(t * 10 + blinkOffset) > 0.1 ? 1 : 0.3;
    });

    /* Diode prism rotation & laser pulse */
    if (this.prismCrystal) {
      this.prismCrystal.rotation.x = t * 1.5;
      this.prismCrystal.rotation.y = t * 0.8;
    }
    if (this.laserBeam) {
      this.laserBeam.material.opacity = 0.88 + Math.sin(t * 10) * 0.12;
    }
    if (this.diodeGlow) {
      this.diodeGlow.intensity = 5.0 + Math.sin(t * 6) * 1.0;
    }

    /* AI neural core rotation & scale pulse */
    if (this.neuralCore) {
      this.neuralCore.rotation.x = t * 0.5;
      this.neuralCore.rotation.y = t * 0.75;
      const s = 1.0 + Math.sin(t * 2.8) * 0.06;
      this.neuralCore.scale.set(s, s, s);
    }
    if (this.aiGlow) {
      this.aiGlow.intensity = 3.5 + Math.sin(t * 3.5) * 0.8;
    }
    if (this.aiPulseSphere) {
      this.aiPulseSphere.material.opacity = 0.03 + Math.sin(t * 2.5) * 0.025;
    }

    /* Neural rings orbit */
    this.neuralRings.forEach(({ mesh, speed, dir }) => {
      mesh.rotation.z += 0.006 * speed * dir;
      mesh.rotation.x += 0.004 * speed * dir * 0.6;
    });

    /* Neural node sparkle */
    this.neuralNodes.forEach((node, i) => {
      node.material.opacity = 0.5 + 0.5 * Math.abs(Math.sin(t * 4 + i * 0.55));
    });

    /* Normal ingress packets */
    this.normalPackets.forEach(p => {
      p.p += p.speed * this.speed;
      if (p.p > 1) p.p = 0;
      const x = -5.8 + p.p * 11.6;
      const inside = x > -1.5 && x < 1.5;
      p.mesh.position.set(x, inside ? p.oy * 0.15 : p.oy, inside ? p.oz * 0.15 : p.oz);
    });

    /* Threat packets */
    if (this.activeScenario !== 'baseline') {
      this.threatPackets.forEach((p, i) => {
        p.p += p.speed * this.speed;
        if (p.p > 1) p.p = 0;
        const x = -5.8 + p.p * 11.6;
        let y = p.oy, z = p.oz;
        if (this.activeScenario === 'ddos-flood') y += Math.sin(t * 9 + i) * 0.2;
        if (this.activeScenario === 'c2-beacon') y = Math.sin(p.p * Math.PI * 5) * 0.12;
        const inside = x > -1.5 && x < 1.5;
        p.mesh.position.set(x, inside ? y * 0.15 : y, inside ? z * 0.15 : z);
      });
    }

    /* Recon radar sweep */
    if (this.activeScenario === 'recon-sweep' && this.radarMesh) {
      this.radarMesh.rotation.z = t * 2.8;
    }

    /* C2 beacon expanding rings */
    if (this.activeScenario === 'c2-beacon') {
      this.beaconRings.forEach(r => {
        const pt = ((t + r.phase) % 2.0) / 2.0;
        r.mesh.scale.set(1 + pt * 6, 1 + pt * 6, 1);
        r.mesh.material.opacity = (1 - pt) * 0.65;
      });
    } else {
      this.beaconRings.forEach(r => { r.mesh.material.opacity = 0; });
    }

    this.renderer.render(this.scene, this.camera);
  }

  onResize() {
    if (!this.canvas || !this.renderer || !this.camera) return;
    const r = this.canvas.getBoundingClientRect();
    this.camera.aspect = r.width / r.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(r.width, r.height, false);
  }

  /* ─── Util ─── */
  mesh(geo, mat) {
    return new THREE.Mesh(geo, mat);
  }
}

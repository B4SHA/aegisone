# AEGISONE (Sentinel Diode)
### One-Way Visibility. Zero-Way Exposure.
**AI-Powered Cyber Threat Intelligence for Unidirectional Networks**

---

## 🛡️ Executive Summary

**AEGISONE** is a high-assurance cyber threat intelligence interface and simulation platform engineered for unidirectional network architectures (data diodes).

Traditional deep packet inspection (DPI) requires decryption keys and bidirectional TCP handshakes, introducing return-path vulnerabilities into isolated critical infrastructure. AEGISONE solves this by coupling a **physics-enforced 1550nm optical data diode** with **passive flow metadata intelligence (timing jitter, Shannon entropy, connection state distribution, and JA3 fingerprints)**.

- **100% Physical 1-Way Isolation**: Photon transmission layer physically omits the reverse RX fiber pin.
- **Zero Payload Decryption**: Inspects traffic flow characteristics without decrypting encrypted TLS payloads.
- **Explainable Defense Intelligence**: Every detection is mapped to MITRE ATT&CK vectors with auditable forensic evidence.

---

## ✨ Features & Architecture

1. **Animated Hero Overview (`#page-hero`)**
   - High-contrast, executive light-mode design with real-time 2D optical diode flow canvas and live telemetry meters.
2. **3D WebGL Simulation Lab (`#page-simulation`)**
   - Three.js photorealistic hardware visualization featuring:
     - Dark titanium blade server rack with status LEDs
     - Sapphire crystal optical diode chamber with internal 1550nm laser beam & physical reverse-block barrier
     - AI Neural Enclave with counter-rotating tensor orbital rings
   - Interactive camera presets: *Overview*, *Optical Diode*, *AI Enclave*
   - Real-time scenario switching (Baseline, Slowloris/DDoS, C2 Beaconing, DNS Smuggling, TLS Anomaly, Recon Sweep)
   - Staged 3-engine hardware synchronization sequence with audio feedback
3. **Threat Forensics Dashboard (`#page-dashboard`)**
   - Real-time triage feed with severity filters (Critical, High, Medium), search filtering, and live KPI telemetry.
4. **Slide-Out Forensic Drawer**
   - Dual-mode inspection: Plain-English summary for government stakeholders / executives, and raw NetFlow/IPFIX JSON for SOC engineers.
5. **Threat Reference Matrix (`#page-threats`)**
   - 6 attack vectors with direct 3D simulation triggers and MITRE ATT&CK mappings.
6. **Zero-Trust Physical Blueprint (`#page-hardware`)**
   - CAD optical diode schematic and software firewall vs. physical optical diode comparison table.

---

## 🚀 Running Locally

No build tools or heavy node modules required. Simply serve with any HTTP server:

```bash
# Using Python 3
python -m http.server 4173

# Or using Node.js / npx
npx serve .
```

Open `http://localhost:4173` in your browser.

---

## 📂 Project Structure

```
├── index.html              # Multi-page semantic HTML structure
├── css/
│   └── studio.css          # Studio-grade light glassmorphism design system
├── js/
│   ├── app.js              # Application controller & state router
│   ├── simulation-3d.js    # Three.js 3D hardware visualization engine
│   ├── hero-canvas.js      # Animated 2D optical diode canvas
│   ├── data.js             # Threat scenarios, telemetry & MITRE definitions
│   └── sound.js            # Procedural Web Audio API sound synthesizer
└── README.md
```

---

## 🔒 Security Guarantee

- **Optical Physics Isolation**: Light travels in only one direction. Backdoors and reverse command channels are physically impossible.
- **Zero Plaintext Access**: Designed for zero-trust compliance in high-security critical infrastructure (ICS/SCADA, government, and defense installations).

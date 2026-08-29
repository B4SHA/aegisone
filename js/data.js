/**
 * AEGISONE Data Module
 * Attack scenarios, engine boot steps, alert feed, MITRE mappings
 */

export const ENGINE_BOOT_STEPS = [
  {
    id: 'engine-trex', name: 'TRex', status: 'ONLINE',
    commands: [
      '$ modprobe dpdk_igb_uio numa=1',
      '$ trex-cfg --cores 8 --latency-mode hw',
      '$ diode-ingress-bind --interface eth0 --mode optical-rx',
    ]
  },
  {
    id: 'engine-slowloris', name: 'Slowloris', status: 'ARMED',
    commands: [
      '$ slowloris-sim --target 10.0.0.15 --connections 8192',
      '$ scapy-forge --preset ddos_flood_ipv4',
      '$ inject-sentinel --mode passive-monitor --no-tx',
    ]
  },
  {
    id: 'engine-sandbox', name: 'Sandbox AI', status: 'ONLINE',
    commands: [
      '$ cuckoo-boot --isolated-enclave --no-network-access',
      '$ ai-classifier load model=diode_threat_v2.6',
      '$ optical-lock confirmed: 1-way carrier signal active',
    ]
  }
];

export const ATTACK_SCENARIOS = [
  {
    id: 'baseline', code: 'SD-BASELINE', name: 'Normal Traffic Baseline',
    badge: 'Baseline Stable', type: 'safe', severity: 'info',
    summary: 'Continuous benign metadata entering the AI enclave. Encrypted payloads remain sealed.',
    explanation: 'Standard background network activity within expected statistical bounds. All flow telemetry within ±2σ of the 30-day rolling baseline. No threat indicators detected.',
    ingestRate: '1,284', confidence: '99.8%', mitreCode: 'N/A',
    flowData: { sourceIp: '10.0.0.0/24', destIp: '10.0.1.0/24', protocol: 'TCP/UDP Mix', packetsPerSec: '1,284', byteVolume: '4.2 Gbps', jitter: '±0.4ms', entropy: '4.8 bits/byte' },
    rawJson: { event: 'baseline_telemetry', source: '10.0.0.0/24', destination: '10.0.1.0/24', packets_per_sec: 1284, bytes_per_sec: 525336832, mean_iat_ms: 0.78, jitter_ms: 0.4, shannon_entropy: 4.8, anomaly_score: 0.02, verdict: 'BENIGN' }
  },
  {
    id: 'ddos-flood', code: 'SD-DDOS', name: 'High-Volume Slowloris Connection Exhaustion',
    badge: '⚠ Connection Flood Detected', type: 'threat', severity: 'critical',
    summary: 'Massive burst of incomplete HTTP sessions — baseline exceeded by 19.3×.',
    explanation: 'Adversary is attempting to exhaust the target\'s TCP connection table using the Slowloris technique — sending partial HTTP headers at slow intervals to keep connections open indefinitely. AEGISONE detects this via flow count explosion and abnormal session-duration distribution without touching payload content.',
    ingestRate: '24,790', confidence: '99.9%', mitreCode: 'T1498',
    flowData: { sourceIp: '198.51.100.44', destIp: '10.0.0.15', protocol: 'TCP/80 (HTTP)', packetsPerSec: '24,790', byteVolume: '0.3 Mbps (partial pkts)', jitter: '±340ms (long hold)', entropy: '2.1 bits/byte' },
    rawJson: { event: 'ddos_slowloris', source_ip: '198.51.100.44', destination_ip: '10.0.0.15', destination_port: 80, flow_count: 24790, packets_per_sec: 24790, bytes_per_sec: 314572, mean_iat_ms: 0.04, jitter_ms: 340, shannon_entropy: 2.1, connection_state: 'SYN_RCVD', anomaly_score: 0.998, verdict: 'CRITICAL_THREAT', mitre_technique: 'T1498', blocked_by_diode: true }
  },
  {
    id: 'c2-beacon', code: 'SD-C2', name: 'Periodic C2 Command & Control Beaconing',
    badge: '⚠ C2 Beacon Detected', type: 'threat', severity: 'high',
    summary: 'Regular 8-second callback intervals indicate compromised host phoning home.',
    explanation: 'A compromised internal host is maintaining contact with an external command-and-control server. The malware checks in every 8 seconds using a covert channel inside seemingly-normal HTTPS traffic. AEGISONE identifies this via inter-arrival-time regularity — the statistical signature of automated timers no human traffic produces.',
    ingestRate: '180', confidence: '97.4%', mitreCode: 'T1071',
    flowData: { sourceIp: '10.0.0.77', destIp: '185.220.101.12', protocol: 'TCP/443 (TLS)', packetsPerSec: '22', byteVolume: '14.2 KBps', jitter: '±0.02ms (REGULAR)', entropy: '7.9 bits/byte' },
    rawJson: { event: 'c2_beacon', source_ip: '10.0.0.77', destination_ip: '185.220.101.12', destination_port: 443, beacon_interval_ms: 8000, jitter_ms: 0.02, packets_per_sec: 22, bytes_per_sec: 14540, shannon_entropy: 7.9, connection_regularity_score: 0.998, anomaly_score: 0.974, verdict: 'HIGH_THREAT', mitre_technique: 'T1071', blocked_by_diode: true }
  },
  {
    id: 'dns-tunnel', code: 'SD-DNS', name: 'DNS Protocol Data Smuggling',
    badge: '⚠ DNS Tunnel Detected', type: 'threat', severity: 'high',
    summary: 'Oversized 682-byte DNS queries with high entropy exfiltrating data.',
    explanation: 'An attacker is hiding data inside DNS queries and responses to bypass traditional security controls. Standard DNS queries are small (< 100 bytes); these are 682 bytes on average and exhibit near-maximum Shannon entropy (7.9 bits/byte), indicating encrypted or binary-encoded data embedded in what looks like legitimate DNS traffic.',
    ingestRate: '312', confidence: '96.1%', mitreCode: 'T1071.004',
    flowData: { sourceIp: '10.0.0.55', destIp: '8.8.8.8', protocol: 'UDP/53 (DNS)', packetsPerSec: '312', byteVolume: '1.7 Mbps', jitter: '±2.3ms', entropy: '7.9 bits/byte (HIGH)' },
    rawJson: { event: 'dns_tunnel', source_ip: '10.0.0.55', destination_ip: '8.8.8.8', destination_port: 53, query_length_avg: 682, query_length_baseline: 82, packets_per_sec: 312, bytes_per_sec: 1782579, shannon_entropy: 7.9, anomaly_score: 0.961, verdict: 'HIGH_THREAT', mitre_technique: 'T1071.004', blocked_by_diode: true }
  },
  {
    id: 'tls-anomaly', code: 'SD-TLS', name: 'TLS Certificate Impersonation / JA3 Mismatch',
    badge: '⚠ TLS Anomaly Detected', type: 'threat', severity: 'high',
    summary: 'Unusual TLS cipher suite fingerprint (JA3=de10af) inconsistent with declared client.',
    explanation: 'A TLS session is presenting a JA3 fingerprint hash that does not match any known legitimate browser or application in baseline. This is a strong indicator that a custom-compiled malware client is attempting to masquerade as a legitimate HTTPS browser to blend into encrypted web traffic. AEGISONE catches this from the handshake metadata without decrypting the session.',
    ingestRate: '840', confidence: '94.8%', mitreCode: 'T1573',
    flowData: { sourceIp: '10.0.0.91', destIp: '104.21.67.44', protocol: 'TCP/443 (TLS 1.3)', packetsPerSec: '840', byteVolume: '22.5 MBps', jitter: '±0.08ms', entropy: '7.95 bits/byte' },
    rawJson: { event: 'tls_anomaly', source_ip: '10.0.0.91', destination_ip: '104.21.67.44', tls_version: '1.3', ja3_hash: 'de10af6ff36ab15a0d6174d4c7c8c3a1', expected_ja3: 'e6573e91e6eb777c0933c5b8f97f10cd', packets_per_sec: 840, bytes_per_sec: 23592960, shannon_entropy: 7.95, anomaly_score: 0.948, verdict: 'HIGH_THREAT', mitre_technique: 'T1573', blocked_by_diode: true }
  },
  {
    id: 'recon-sweep', code: 'SD-RECON', name: 'Internal Port Reconnaissance Sweep',
    badge: '⚠ Recon Sweep Active', type: 'threat', severity: 'medium',
    summary: 'SYN-only packets sweeping 10,240 ports across internal subnet within 1.8 seconds.',
    explanation: 'An adversary with initial access is conducting rapid port scanning across the internal infrastructure. The hallmark of recon traffic is purely SYN packets with no corresponding payload — no data flows, extremely high port diversity, and no established connections. AEGISONE detects this via the zero-payload profile combined with sequential destination port increments.',
    ingestRate: '5,680', confidence: '98.3%', mitreCode: 'T1046',
    flowData: { sourceIp: '10.0.0.33', destIp: '10.0.0.0/16', protocol: 'TCP/SYN (No Data)', packetsPerSec: '5,680', byteVolume: '0 bytes payload', jitter: '±0.001ms', entropy: '0.0 bits/byte' },
    rawJson: { event: 'recon_sweep', source_ip: '10.0.0.33', destination_subnet: '10.0.0.0/16', port_range_scanned: '1-10240', scan_duration_ms: 1800, packets_per_sec: 5680, payload_bytes: 0, tcp_flags: 'SYN_ONLY', unique_ports_contacted: 10240, anomaly_score: 0.983, verdict: 'MEDIUM_THREAT', mitre_technique: 'T1046', blocked_by_diode: true }
  }
];

export const INITIAL_ALERT_FEED = [
  {
    id: 'ALT-9012', scenarioId: 'c2-beacon', title: 'Periodic C2 Beaconing', severity: 'high',
    time: '3 min ago', source: '10.0.0.77', target: '185.220.101.12',
    summary: 'Regular 8-second callback intervals indicate compromised host phoning home.',
    confidence: '97.4%', mitreCode: 'T1071'
  },
  {
    id: 'ALT-8847', scenarioId: 'dns-tunnel', title: 'DNS Protocol Data Smuggling', severity: 'high',
    time: '11 min ago', source: '10.0.0.55', target: '8.8.8.8',
    summary: 'Oversized 682-byte DNS queries with max-entropy payload detected.',
    confidence: '96.1%', mitreCode: 'T1071.004'
  },
  {
    id: 'ALT-8612', scenarioId: 'ddos-flood', title: 'Slowloris Connection Exhaustion', severity: 'critical',
    time: '24 min ago', source: '198.51.100.44', target: '10.0.0.15',
    summary: 'Baseline flow rate exceeded by 19.3× — TCP table exhaustion attempt.',
    confidence: '99.9%', mitreCode: 'T1498'
  },
  {
    id: 'ALT-8401', scenarioId: 'tls-anomaly', title: 'TLS JA3 Fingerprint Mismatch', severity: 'high',
    time: '38 min ago', source: '10.0.0.91', target: '104.21.67.44',
    summary: 'Unknown JA3 fingerprint detected — non-standard TLS client suspected.',
    confidence: '94.8%', mitreCode: 'T1573'
  },
  {
    id: 'ALT-8290', scenarioId: 'recon-sweep', title: 'Internal Recon Port Sweep', severity: 'medium',
    time: '1 hr ago', source: '10.0.0.33', target: '10.0.0.0/16',
    summary: '10,240 SYN packets in 1.8 seconds across internal subnet.',
    confidence: '98.3%', mitreCode: 'T1046'
  }
];

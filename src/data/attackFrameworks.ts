/**
 * attackFrameworks.ts
 * Reference definitions for OWASP Top 10 2021, MITRE ATT&CK Tactics,
 * CWE categories, and CAPEC attack patterns used across the catalog.
 */

// ── OWASP Top 10 — 2021 ──────────────────────────────────────────────────────

export interface OwaspEntry {
  id: string;
  title: string;
  description: string;
}

export const OWASP_TOP10_2021: OwaspEntry[] = [
  { id: 'A01:2021', title: 'Broken Access Control',         description: 'Restrictions on authenticated users not enforced properly.' },
  { id: 'A02:2021', title: 'Cryptographic Failures',        description: 'Failures related to cryptography exposing sensitive data.' },
  { id: 'A03:2021', title: 'Injection',                     description: 'Hostile data sent to interpreters as part of a command.' },
  { id: 'A04:2021', title: 'Insecure Design',               description: 'Missing or ineffective control design.' },
  { id: 'A05:2021', title: 'Security Misconfiguration',     description: 'Incorrect or incomplete configurations creating vulnerabilities.' },
  { id: 'A06:2021', title: 'Vulnerable Components',         description: 'Using components with known vulnerabilities.' },
  { id: 'A07:2021', title: 'Auth Failures',                 description: 'Broken authentication and session management.' },
  { id: 'A08:2021', title: 'Software & Data Integrity',     description: 'Failures related to code and infrastructure integrity.' },
  { id: 'A09:2021', title: 'Logging & Monitoring Failures', description: 'Insufficient logging and monitoring.' },
  { id: 'A10:2021', title: 'SSRF',                          description: 'Server-side request forgery flaws.' },
];

// ── OWASP API Security Top 10 — 2023 ─────────────────────────────────────────

export const OWASP_API_TOP10_2023: OwaspEntry[] = [
  { id: 'API1:2023', title: 'Broken Object Level Authorization', description: 'Failing to validate object-level permissions.' },
  { id: 'API2:2023', title: 'Broken Authentication',             description: 'Flawed API authentication mechanisms.' },
  { id: 'API3:2023', title: 'Broken Object Property Auth',       description: 'Exposing or allowing modification of object properties.' },
  { id: 'API4:2023', title: 'Unrestricted Resource Consumption', description: 'APIs that do not constrain resources used.' },
  { id: 'API5:2023', title: 'Broken Function Level Auth',        description: 'Complex access control policies not enforced.' },
  { id: 'API6:2023', title: 'Unrestricted Access to Sensitive',  description: 'Sensitive business flows accessible without limits.' },
  { id: 'API7:2023', title: 'Server-Side Request Forgery',       description: 'API fetches remote resource without user URL validation.' },
  { id: 'API8:2023', title: 'Security Misconfiguration',         description: 'Insecure default configs, incomplete configurations.' },
  { id: 'API9:2023', title: 'Improper Inventory Management',     description: 'Outdated or undocumented API versions.' },
  { id: 'API10:2023', title: 'Unsafe API Consumption',           description: 'Trusting third-party API data without validation.' },
];

// ── MITRE ATT&CK Tactics ─────────────────────────────────────────────────────

export interface MitreTactic {
  id: string;
  name: string;
  description: string;
}

export const MITRE_TACTICS: MitreTactic[] = [
  { id: 'TA0001', name: 'Initial Access',        description: 'Techniques to gain initial foothold.' },
  { id: 'TA0002', name: 'Execution',             description: 'Running adversary-controlled code.' },
  { id: 'TA0003', name: 'Persistence',           description: 'Maintain foothold across restarts.' },
  { id: 'TA0004', name: 'Privilege Escalation',  description: 'Gain higher-level permissions.' },
  { id: 'TA0005', name: 'Defense Evasion',       description: 'Avoid detection.' },
  { id: 'TA0006', name: 'Credential Access',     description: 'Steal credentials.' },
  { id: 'TA0007', name: 'Discovery',             description: 'Learn about the environment.' },
  { id: 'TA0008', name: 'Lateral Movement',      description: 'Move through the environment.' },
  { id: 'TA0009', name: 'Collection',            description: 'Gather data of interest.' },
  { id: 'TA0010', name: 'Exfiltration',          description: 'Steal data.' },
  { id: 'TA0011', name: 'Command & Control',     description: 'Communicate with compromised systems.' },
  { id: 'TA0040', name: 'Impact',                description: 'Manipulate, interrupt, or destroy systems.' },
  { id: 'TA0043', name: 'Reconnaissance',        description: 'Gather info to plan future operations.' },
];

// ── CWE Top 25 Categories (2023) ─────────────────────────────────────────────

export interface CweEntry {
  id: string;
  name: string;
}

export const CWE_TOP25_2023: CweEntry[] = [
  { id: 'CWE-79',  name: 'Cross-site Scripting (XSS)' },
  { id: 'CWE-89',  name: "SQL Injection" },
  { id: 'CWE-20',  name: 'Improper Input Validation' },
  { id: 'CWE-125', name: 'Out-of-bounds Read' },
  { id: 'CWE-78',  name: 'OS Command Injection' },
  { id: 'CWE-416', name: 'Use After Free' },
  { id: 'CWE-22',  name: 'Path Traversal' },
  { id: 'CWE-352', name: 'Cross-Site Request Forgery (CSRF)' },
  { id: 'CWE-434', name: 'Unrestricted File Upload' },
  { id: 'CWE-862', name: 'Missing Authorization' },
  { id: 'CWE-476', name: 'NULL Pointer Dereference' },
  { id: 'CWE-287', name: 'Improper Authentication' },
  { id: 'CWE-190', name: 'Integer Overflow' },
  { id: 'CWE-502', name: 'Deserialization of Untrusted Data' },
  { id: 'CWE-77',  name: 'Command Injection' },
  { id: 'CWE-119', name: 'Buffer Overflow' },
  { id: 'CWE-798', name: 'Hard-coded Credentials' },
  { id: 'CWE-918', name: 'Server-Side Request Forgery (SSRF)' },
  { id: 'CWE-306', name: 'Missing Authentication for Critical Function' },
  { id: 'CWE-362', name: 'Race Condition' },
  { id: 'CWE-269', name: 'Improper Privilege Management' },
  { id: 'CWE-94',  name: 'Code Injection' },
  { id: 'CWE-863', name: 'Incorrect Authorization' },
  { id: 'CWE-276', name: 'Incorrect Default Permissions' },
  { id: 'CWE-611', name: 'XML External Entity (XXE)' },
];

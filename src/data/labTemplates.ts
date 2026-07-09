/**
 * labTemplates.ts
 * Docker/Kubernetes container template definitions for each vulnerability family.
 * Each template specifies the Docker image, exposed ports, environment variables,
 * and challenge flags used when a lab session is provisioned.
 * Phase 1: Templates are defined here but not yet provisioned (mockProvider active).
 * Phase 2: LabOrchestrator reads these to spin up real containers.
 */

export interface LabTemplate {
  /** Matches VulnerabilityDefinition.dockerTemplate */
  templateId: string;
  /** Docker Hub image or private registry path */
  image: string;
  /** Container TCP ports to expose */
  ports: number[];
  /** Environment variables injected into the container */
  env: Record<string, string>;
  /** Startup command override (optional) */
  command?: string;
  /** Memory limit e.g. "256m" */
  memoryLimit: string;
  /** CPU share limit (0.0 - 1.0) */
  cpuLimit: number;
  /** TTL in seconds before the watchdog terminates it */
  ttlSeconds: number;
  /** Flag format hint shown to students */
  flagFormat: string;
  /** Whether the lab requires internet access */
  networkIsolated: boolean;
}

export const labTemplates: LabTemplate[] = [
  // ── Web ──────────────────────────────────────────────────────────────────────
  {
    templateId: 'tpl-sqli-basic',
    image: 'webgoat/webgoat-8.0',
    ports: [8080],
    env: { WEBGOAT_PORT: '8080' },
    memoryLimit: '256m', cpuLimit: 0.5, ttlSeconds: 7200,
    flagFormat: 'hp_flag{sqli_...}', networkIsolated: true,
  },
  {
    templateId: 'tpl-sqli-blind',
    image: 'bkimminich/juice-shop',
    ports: [3000],
    env: { NODE_ENV: 'unsafe' },
    memoryLimit: '512m', cpuLimit: 0.5, ttlSeconds: 7200,
    flagFormat: 'hp_flag{blind_sqli_...}', networkIsolated: true,
  },
  {
    templateId: 'tpl-sqli-union',
    image: 'bkimminich/juice-shop',
    ports: [3000],
    env: { NODE_ENV: 'unsafe' },
    memoryLimit: '512m', cpuLimit: 0.5, ttlSeconds: 7200,
    flagFormat: 'hp_flag{union_...}', networkIsolated: true,
  },
  {
    templateId: 'tpl-xss-stored',
    image: 'bkimminich/juice-shop',
    ports: [3000],
    env: { NODE_ENV: 'unsafe' },
    memoryLimit: '256m', cpuLimit: 0.5, ttlSeconds: 7200,
    flagFormat: 'hp_flag{xss_stored_...}', networkIsolated: true,
  },
  {
    templateId: 'tpl-xss-reflected',
    image: 'webgoat/webgoat-8.0',
    ports: [8080],
    env: {},
    memoryLimit: '256m', cpuLimit: 0.5, ttlSeconds: 7200,
    flagFormat: 'hp_flag{xss_ref_...}', networkIsolated: true,
  },
  {
    templateId: 'tpl-xss-dom',
    image: 'webgoat/webgoat-8.0',
    ports: [8080],
    env: {},
    memoryLimit: '256m', cpuLimit: 0.5, ttlSeconds: 7200,
    flagFormat: 'hp_flag{dom_xss_...}', networkIsolated: true,
  },
  {
    templateId: 'tpl-csrf',
    image: 'webgoat/webgoat-8.0',
    ports: [8080],
    env: {},
    memoryLimit: '256m', cpuLimit: 0.5, ttlSeconds: 7200,
    flagFormat: 'hp_flag{csrf_...}', networkIsolated: true,
  },
  {
    templateId: 'tpl-ssrf',
    image: 'hackwithjv/ssrf-lab',
    ports: [8080],
    env: { INTERNAL_HOST: '169.254.169.254' },
    memoryLimit: '256m', cpuLimit: 0.5, ttlSeconds: 7200,
    flagFormat: 'hp_flag{ssrf_...}', networkIsolated: false,
  },
  {
    templateId: 'tpl-xxe',
    image: 'webgoat/webgoat-8.0',
    ports: [8080],
    env: {},
    memoryLimit: '256m', cpuLimit: 0.5, ttlSeconds: 7200,
    flagFormat: 'hp_flag{xxe_...}', networkIsolated: true,
  },
  {
    templateId: 'tpl-path-traversal',
    image: 'webgoat/webgoat-8.0',
    ports: [8080],
    env: {},
    memoryLimit: '256m', cpuLimit: 0.5, ttlSeconds: 7200,
    flagFormat: 'hp_flag{traversal_...}', networkIsolated: true,
  },
  {
    templateId: 'tpl-file-upload',
    image: 'bkimminich/juice-shop',
    ports: [3000],
    env: { NODE_ENV: 'unsafe' },
    memoryLimit: '256m', cpuLimit: 0.5, ttlSeconds: 7200,
    flagFormat: 'hp_flag{upload_...}', networkIsolated: true,
  },
  {
    templateId: 'tpl-clickjacking',
    image: 'webgoat/webgoat-8.0',
    ports: [8080],
    env: {},
    memoryLimit: '128m', cpuLimit: 0.25, ttlSeconds: 3600,
    flagFormat: 'hp_flag{click_...}', networkIsolated: true,
  },
  {
    templateId: 'tpl-http-smuggling',
    image: 'nginx:1.18',
    ports: [80],
    env: {},
    command: 'nginx -g "daemon off;"',
    memoryLimit: '128m', cpuLimit: 0.25, ttlSeconds: 7200,
    flagFormat: 'hp_flag{smuggle_...}', networkIsolated: true,
  },
  {
    templateId: 'tpl-ssti',
    image: 'python:3.9-slim',
    ports: [5000],
    env: { FLASK_ENV: 'development' },
    memoryLimit: '256m', cpuLimit: 0.5, ttlSeconds: 7200,
    flagFormat: 'hp_flag{ssti_...}', networkIsolated: true,
  },
  {
    templateId: 'tpl-deserialization',
    image: 'webgoat/webgoat-8.0',
    ports: [8080],
    env: {},
    memoryLimit: '512m', cpuLimit: 0.5, ttlSeconds: 7200,
    flagFormat: 'hp_flag{deser_...}', networkIsolated: true,
  },

  // ── API ───────────────────────────────────────────────────────────────────────
  {
    templateId: 'tpl-bola',
    image: 'bkimminich/juice-shop',
    ports: [3000],
    env: { NODE_ENV: 'unsafe' },
    memoryLimit: '512m', cpuLimit: 0.5, ttlSeconds: 7200,
    flagFormat: 'hp_flag{bola_...}', networkIsolated: true,
  },
  {
    templateId: 'tpl-broken-auth-api',
    image: 'bkimminich/juice-shop',
    ports: [3000],
    env: {},
    memoryLimit: '512m', cpuLimit: 0.5, ttlSeconds: 7200,
    flagFormat: 'hp_flag{api_auth_...}', networkIsolated: true,
  },
  {
    templateId: 'tpl-mass-assignment',
    image: 'bkimminich/juice-shop',
    ports: [3000],
    env: {},
    memoryLimit: '512m', cpuLimit: 0.5, ttlSeconds: 7200,
    flagFormat: 'hp_flag{mass_...}', networkIsolated: true,
  },
  {
    templateId: 'tpl-nosql-injection',
    image: 'mongo:5.0',
    ports: [27017, 3000],
    env: { MONGO_INITDB_ROOT_USERNAME: 'admin', MONGO_INITDB_ROOT_PASSWORD: 'admin' },
    memoryLimit: '512m', cpuLimit: 0.5, ttlSeconds: 7200,
    flagFormat: 'hp_flag{nosql_...}', networkIsolated: true,
  },
  {
    templateId: 'tpl-jwt-attack',
    image: 'bkimminich/juice-shop',
    ports: [3000],
    env: {},
    memoryLimit: '512m', cpuLimit: 0.5, ttlSeconds: 7200,
    flagFormat: 'hp_flag{jwt_...}', networkIsolated: true,
  },

  // ── Linux ─────────────────────────────────────────────────────────────────────
  {
    templateId: 'tpl-suid-privesc',
    image: 'ubuntu:20.04',
    ports: [22],
    env: { VICTIM_USER: 'lowpriv', VICTIM_PASS: 'password123' },
    memoryLimit: '256m', cpuLimit: 0.5, ttlSeconds: 7200,
    flagFormat: 'hp_flag{suid_...}', networkIsolated: true,
  },
  {
    templateId: 'tpl-cron-exploit',
    image: 'ubuntu:20.04',
    ports: [22],
    env: {},
    memoryLimit: '256m', cpuLimit: 0.5, ttlSeconds: 7200,
    flagFormat: 'hp_flag{cron_...}', networkIsolated: true,
  },
  {
    templateId: 'tpl-writable-passwd',
    image: 'ubuntu:20.04',
    ports: [22],
    env: {},
    memoryLimit: '256m', cpuLimit: 0.5, ttlSeconds: 7200,
    flagFormat: 'hp_flag{passwd_...}', networkIsolated: true,
  },
  {
    templateId: 'tpl-kernel-exploit',
    image: 'ubuntu:18.04',
    ports: [22],
    env: {},
    memoryLimit: '512m', cpuLimit: 0.75, ttlSeconds: 7200,
    flagFormat: 'hp_flag{kernel_...}', networkIsolated: true,
  },

  // ── Windows ───────────────────────────────────────────────────────────────────
  {
    templateId: 'tpl-token-impersonation',
    image: 'mcr.microsoft.com/windows/servercore:ltsc2019',
    ports: [3389, 445],
    env: {},
    memoryLimit: '2g', cpuLimit: 1.0, ttlSeconds: 7200,
    flagFormat: 'hp_flag{token_...}', networkIsolated: true,
  },
  {
    templateId: 'tpl-dll-hijacking',
    image: 'mcr.microsoft.com/windows/servercore:ltsc2019',
    ports: [3389],
    env: {},
    memoryLimit: '2g', cpuLimit: 1.0, ttlSeconds: 7200,
    flagFormat: 'hp_flag{dll_...}', networkIsolated: true,
  },
  {
    templateId: 'tpl-unquoted-service',
    image: 'mcr.microsoft.com/windows/servercore:ltsc2019',
    ports: [3389],
    env: {},
    memoryLimit: '2g', cpuLimit: 1.0, ttlSeconds: 7200,
    flagFormat: 'hp_flag{svc_...}', networkIsolated: true,
  },
  {
    templateId: 'tpl-registry-autorun',
    image: 'mcr.microsoft.com/windows/servercore:ltsc2019',
    ports: [3389],
    env: {},
    memoryLimit: '2g', cpuLimit: 1.0, ttlSeconds: 7200,
    flagFormat: 'hp_flag{reg_...}', networkIsolated: true,
  },

  // ── Active Directory ──────────────────────────────────────────────────────────
  {
    templateId: 'tpl-kerberoasting',
    image: 'vulhub/ad-lab:latest',
    ports: [88, 389, 445, 3389],
    env: { DOMAIN: 'HACKPLUS.LOCAL' },
    memoryLimit: '4g', cpuLimit: 2.0, ttlSeconds: 14400,
    flagFormat: 'hp_flag{kerb_...}', networkIsolated: true,
  },
  {
    templateId: 'tpl-asrep-roasting',
    image: 'vulhub/ad-lab:latest',
    ports: [88, 389, 445],
    env: { DOMAIN: 'HACKPLUS.LOCAL' },
    memoryLimit: '4g', cpuLimit: 2.0, ttlSeconds: 14400,
    flagFormat: 'hp_flag{asrep_...}', networkIsolated: true,
  },
  {
    templateId: 'tpl-pass-the-hash',
    image: 'vulhub/ad-lab:latest',
    ports: [445, 3389],
    env: {},
    memoryLimit: '4g', cpuLimit: 2.0, ttlSeconds: 14400,
    flagFormat: 'hp_flag{pth_...}', networkIsolated: true,
  },
  {
    templateId: 'tpl-dcsync',
    image: 'vulhub/ad-lab:latest',
    ports: [88, 389, 445],
    env: {},
    memoryLimit: '4g', cpuLimit: 2.0, ttlSeconds: 14400,
    flagFormat: 'hp_flag{dcsync_...}', networkIsolated: true,
  },

  // ── Cloud ─────────────────────────────────────────────────────────────────────
  {
    templateId: 'tpl-s3-misconfig',
    image: 'minio/minio',
    ports: [9000, 9001],
    env: { MINIO_ROOT_USER: 'minioadmin', MINIO_ROOT_PASSWORD: 'minioadmin' },
    memoryLimit: '512m', cpuLimit: 0.5, ttlSeconds: 7200,
    flagFormat: 'hp_flag{s3_...}', networkIsolated: false,
  },
  {
    templateId: 'tpl-iam-privesc',
    image: 'localstack/localstack',
    ports: [4566],
    env: { SERVICES: 'iam,s3,ec2,lambda' },
    memoryLimit: '1g', cpuLimit: 1.0, ttlSeconds: 7200,
    flagFormat: 'hp_flag{iam_...}', networkIsolated: false,
  },
  {
    templateId: 'tpl-container-escape',
    image: 'ubuntu:20.04',
    ports: [22],
    env: { DOCKER_HOST: 'unix:///var/run/docker.sock' },
    memoryLimit: '512m', cpuLimit: 0.5, ttlSeconds: 7200,
    flagFormat: 'hp_flag{escape_...}', networkIsolated: true,
  },

  // ── Network ───────────────────────────────────────────────────────────────────
  {
    templateId: 'tpl-arp-spoofing',
    image: 'kalilinux/kali-rolling',
    ports: [22],
    env: {},
    memoryLimit: '512m', cpuLimit: 0.5, ttlSeconds: 7200,
    flagFormat: 'hp_flag{arp_...}', networkIsolated: true,
  },
  {
    templateId: 'tpl-dns-poisoning',
    image: 'kalilinux/kali-rolling',
    ports: [53, 22],
    env: {},
    memoryLimit: '256m', cpuLimit: 0.5, ttlSeconds: 7200,
    flagFormat: 'hp_flag{dns_...}', networkIsolated: true,
  },
  {
    templateId: 'tpl-smb-relay',
    image: 'vulhub/samba:latest',
    ports: [445, 139],
    env: {},
    memoryLimit: '512m', cpuLimit: 0.5, ttlSeconds: 7200,
    flagFormat: 'hp_flag{smb_...}', networkIsolated: true,
  },

  // ── Cryptography ──────────────────────────────────────────────────────────────
  {
    templateId: 'tpl-weak-cipher',
    image: 'python:3.9-slim',
    ports: [5000],
    env: {},
    memoryLimit: '128m', cpuLimit: 0.25, ttlSeconds: 3600,
    flagFormat: 'hp_flag{cipher_...}', networkIsolated: true,
  },
  {
    templateId: 'tpl-hash-length-ext',
    image: 'python:3.9-slim',
    ports: [5000],
    env: {},
    memoryLimit: '128m', cpuLimit: 0.25, ttlSeconds: 3600,
    flagFormat: 'hp_flag{hash_...}', networkIsolated: true,
  },

  // ── Malware / Reverse Engineering ─────────────────────────────────────────────
  {
    templateId: 'tpl-reverse-shell',
    image: 'kalilinux/kali-rolling',
    ports: [4444, 22],
    env: {},
    memoryLimit: '512m', cpuLimit: 0.5, ttlSeconds: 7200,
    flagFormat: 'hp_flag{shell_...}', networkIsolated: true,
  },
  {
    templateId: 'tpl-binary-cracking',
    image: 'ubuntu:20.04',
    ports: [22],
    env: {},
    memoryLimit: '512m', cpuLimit: 0.5, ttlSeconds: 7200,
    flagFormat: 'hp_flag{crack_...}', networkIsolated: true,
  },

  // ── AI Security ───────────────────────────────────────────────────────────────
  {
    templateId: 'tpl-prompt-injection',
    image: 'python:3.11-slim',
    ports: [8080],
    env: { MODEL: 'gpt-3.5-turbo-mock' },
    memoryLimit: '512m', cpuLimit: 0.5, ttlSeconds: 7200,
    flagFormat: 'hp_flag{prompt_...}', networkIsolated: false,
  },
];

export default labTemplates;

/**
 * courseMappings.ts
 * Maps each vulnerability slug to related course IDs and challenge IDs
 * in the HackerPlus learning catalog. Enables the Academy, Labs, and
 * Challenges screens to cross-reference content from the vulnerability catalog.
 */

export interface CourseMapping {
  /** Matches VulnerabilityDefinition.slug */
  vulnerabilitySlug: string;
  /** IDs of courses that teach this vulnerability (from courses.json) */
  courseIds: string[];
  /** IDs of challenges that test this vulnerability (from challenges.json) */
  challengeIds: string[];
  /** IDs of labs that practice this vulnerability (from labs.json) */
  labIds: string[];
  /** Recommended learning path order (lower = earlier) */
  learningOrder: number;
}

export const courseMappings: CourseMapping[] = [

  // ── Web ─────────────────────────────────────────────────────────────────────
  { vulnerabilitySlug: 'sql-injection-basic',    courseIds: ['course-web-01'], challengeIds: ['ch1', 'ch2'],         labIds: ['lab1'],         learningOrder: 1  },
  { vulnerabilitySlug: 'sql-injection-blind',    courseIds: ['course-web-01'], challengeIds: ['ch3'],                labIds: ['lab1'],         learningOrder: 8  },
  { vulnerabilitySlug: 'sql-injection-union',    courseIds: ['course-web-01'], challengeIds: ['ch4'],                labIds: ['lab1'],         learningOrder: 9  },
  { vulnerabilitySlug: 'xss-stored',            courseIds: ['course-web-02'], challengeIds: ['ch5', 'ch6'],         labIds: ['lab2'],         learningOrder: 2  },
  { vulnerabilitySlug: 'xss-reflected',         courseIds: ['course-web-02'], challengeIds: ['ch7'],                labIds: ['lab2'],         learningOrder: 3  },
  { vulnerabilitySlug: 'xss-dom',              courseIds: ['course-web-02'], challengeIds: ['ch8'],                labIds: ['lab2'],         learningOrder: 10 },
  { vulnerabilitySlug: 'csrf',                  courseIds: ['course-web-03'], challengeIds: ['ch9'],                labIds: ['lab3'],         learningOrder: 5  },
  { vulnerabilitySlug: 'ssrf',                  courseIds: ['course-web-04'], challengeIds: ['ch10'],               labIds: ['lab4'],         learningOrder: 12 },
  { vulnerabilitySlug: 'xxe',                   courseIds: ['course-web-05'], challengeIds: [],                     labIds: ['lab5'],         learningOrder: 11 },
  { vulnerabilitySlug: 'path-traversal',        courseIds: ['course-web-06'], challengeIds: [],                     labIds: ['lab6'],         learningOrder: 4  },
  { vulnerabilitySlug: 'file-upload-bypass',    courseIds: ['course-web-06'], challengeIds: [],                     labIds: ['lab6'],         learningOrder: 13 },
  { vulnerabilitySlug: 'clickjacking',          courseIds: ['course-web-07'], challengeIds: [],                     labIds: [],               learningOrder: 6  },
  { vulnerabilitySlug: 'http-request-smuggling',courseIds: [],                challengeIds: [],                     labIds: [],               learningOrder: 30 },
  { vulnerabilitySlug: 'ssti',                  courseIds: [],                challengeIds: [],                     labIds: [],               learningOrder: 25 },
  { vulnerabilitySlug: 'insecure-deserialization',courseIds: [],              challengeIds: [],                     labIds: [],               learningOrder: 28 },

  // ── API ──────────────────────────────────────────────────────────────────────
  { vulnerabilitySlug: 'bola-idor',             courseIds: ['course-api-01'], challengeIds: ['ch11', 'ch12'],       labIds: ['lab7'],         learningOrder: 7  },
  { vulnerabilitySlug: 'broken-api-auth',       courseIds: ['course-api-01'], challengeIds: ['ch13'],               labIds: ['lab7'],         learningOrder: 14 },
  { vulnerabilitySlug: 'mass-assignment',       courseIds: ['course-api-01'], challengeIds: [],                     labIds: ['lab7'],         learningOrder: 15 },
  { vulnerabilitySlug: 'nosql-injection',       courseIds: ['course-api-02'], challengeIds: [],                     labIds: [],               learningOrder: 16 },
  { vulnerabilitySlug: 'jwt-attack',            courseIds: ['course-api-02'], challengeIds: ['ch14'],               labIds: ['lab8'],         learningOrder: 22 },

  // ── Linux ────────────────────────────────────────────────────────────────────
  { vulnerabilitySlug: 'suid-privesc',          courseIds: ['course-linux-01'],challengeIds: ['ch15'],              labIds: ['lab9'],         learningOrder: 17 },
  { vulnerabilitySlug: 'cron-job-exploit',      courseIds: ['course-linux-01'],challengeIds: [],                    labIds: ['lab9'],         learningOrder: 18 },
  { vulnerabilitySlug: 'writable-etc-passwd',   courseIds: ['course-linux-01'],challengeIds: [],                    labIds: ['lab9'],         learningOrder: 19 },
  { vulnerabilitySlug: 'linux-kernel-exploit',  courseIds: ['course-linux-02'],challengeIds: [],                    labIds: [],               learningOrder: 35 },

  // ── Windows ──────────────────────────────────────────────────────────────────
  { vulnerabilitySlug: 'token-impersonation',   courseIds: ['course-win-01'], challengeIds: [],                     labIds: ['lab10'],        learningOrder: 20 },
  { vulnerabilitySlug: 'dll-hijacking',         courseIds: ['course-win-01'], challengeIds: [],                     labIds: [],               learningOrder: 21 },
  { vulnerabilitySlug: 'unquoted-service-path', courseIds: ['course-win-01'], challengeIds: [],                     labIds: [],               learningOrder: 23 },
  { vulnerabilitySlug: 'registry-autorun',      courseIds: ['course-win-01'], challengeIds: [],                     labIds: [],               learningOrder: 24 },

  // ── Active Directory ─────────────────────────────────────────────────────────
  { vulnerabilitySlug: 'kerberoasting',         courseIds: ['course-ad-01'],  challengeIds: ['ch16'],               labIds: ['lab4'],         learningOrder: 26 },
  { vulnerabilitySlug: 'asrep-roasting',        courseIds: ['course-ad-01'],  challengeIds: [],                     labIds: [],               learningOrder: 27 },
  { vulnerabilitySlug: 'pass-the-hash',         courseIds: ['course-ad-01'],  challengeIds: [],                     labIds: [],               learningOrder: 32 },
  { vulnerabilitySlug: 'dcsync-attack',         courseIds: ['course-ad-02'],  challengeIds: [],                     labIds: [],               learningOrder: 40 },
  { vulnerabilitySlug: 'bloodhound-enumeration',courseIds: ['course-ad-01'],  challengeIds: [],                     labIds: [],               learningOrder: 29 },

  // ── Cloud ────────────────────────────────────────────────────────────────────
  { vulnerabilitySlug: 's3-bucket-misconfig',   courseIds: ['course-cloud-01'],challengeIds: [],                    labIds: ['lab5'],         learningOrder: 33 },
  { vulnerabilitySlug: 'iam-privilege-escalation',courseIds:['course-cloud-01'],challengeIds:[],                   labIds: [],               learningOrder: 36 },
  { vulnerabilitySlug: 'cloud-ssrf-metadata',   courseIds: ['course-cloud-01'],challengeIds: [],                    labIds: [],               learningOrder: 37 },
  { vulnerabilitySlug: 'container-escape',      courseIds: ['course-cloud-02'],challengeIds: [],                    labIds: [],               learningOrder: 41 },

  // ── Mobile ───────────────────────────────────────────────────────────────────
  { vulnerabilitySlug: 'android-intent-hijacking',courseIds:['course-mob-01'],challengeIds: [],                     labIds: [],               learningOrder: 31 },
  { vulnerabilitySlug: 'ios-insecure-storage',  courseIds: ['course-mob-01'], challengeIds: [],                     labIds: [],               learningOrder: 34 },
  { vulnerabilitySlug: 'apk-reverse-engineering',courseIds:['course-mob-02'], challengeIds: [],                     labIds: [],               learningOrder: 38 },

  // ── Network ──────────────────────────────────────────────────────────────────
  { vulnerabilitySlug: 'arp-spoofing-mitm',     courseIds: ['course-net-01'], challengeIds: [],                     labIds: ['lab3'],         learningOrder: 42 },
  { vulnerabilitySlug: 'dns-poisoning',         courseIds: ['course-net-01'], challengeIds: [],                     labIds: [],               learningOrder: 43 },
  { vulnerabilitySlug: 'smb-relay',             courseIds: ['course-net-01'], challengeIds: [],                     labIds: [],               learningOrder: 44 },
  { vulnerabilitySlug: 'port-scan-enumeration', courseIds: ['course-net-01'], challengeIds: [],                     labIds: [],               learningOrder: 1  },

  // ── Malware ──────────────────────────────────────────────────────────────────
  { vulnerabilitySlug: 'reverse-shell-deployment',courseIds:['course-mal-01'],challengeIds: [],                     labIds: [],               learningOrder: 45 },
  { vulnerabilitySlug: 'keylogger-analysis',    courseIds: ['course-mal-01'], challengeIds: [],                     labIds: [],               learningOrder: 46 },
  { vulnerabilitySlug: 'ransomware-analysis',   courseIds: ['course-mal-02'], challengeIds: [],                     labIds: [],               learningOrder: 52 },

  // ── Reverse Engineering ───────────────────────────────────────────────────────
  { vulnerabilitySlug: 'binary-cracking',       courseIds: ['course-rev-01'], challengeIds: ['ch17'],               labIds: ['lab10'],        learningOrder: 47 },
  { vulnerabilitySlug: 'anti-debugging-bypass', courseIds: ['course-rev-01'], challengeIds: [],                     labIds: [],               learningOrder: 50 },
  { vulnerabilitySlug: 'firmware-analysis',     courseIds: ['course-rev-02'], challengeIds: [],                     labIds: [],               learningOrder: 55 },

  // ── Cryptography ─────────────────────────────────────────────────────────────
  { vulnerabilitySlug: 'weak-cipher-exploitation',courseIds:['course-cry-01'],challengeIds: ['ch18'],               labIds: ['lab8'],         learningOrder: 48 },
  { vulnerabilitySlug: 'hash-length-extension', courseIds: ['course-cry-01'], challengeIds: [],                     labIds: [],               learningOrder: 51 },

  // ── OSINT ────────────────────────────────────────────────────────────────────
  { vulnerabilitySlug: 'subdomain-enumeration', courseIds: ['course-osint-01'],challengeIds: [],                    labIds: [],               learningOrder: 2  },
  { vulnerabilitySlug: 'social-engineering-recon',courseIds:['course-osint-01'],challengeIds:[],                   labIds: [],               learningOrder: 3  },

  // ── AI Security ──────────────────────────────────────────────────────────────
  { vulnerabilitySlug: 'prompt-injection',      courseIds: ['course-ai-01'],  challengeIds: [],                     labIds: [],               learningOrder: 49 },
  { vulnerabilitySlug: 'model-inversion-attack',courseIds: ['course-ai-02'],  challengeIds: [],                     labIds: [],               learningOrder: 56 },
];

/**
 * Looks up the course mapping for a given vulnerability slug.
 */
export function getMappingForVuln(slug: string): CourseMapping | undefined {
  return courseMappings.find(m => m.vulnerabilitySlug === slug);
}

/**
 * Returns all vulnerability slugs associated with a given course ID.
 */
export function getVulnsForCourse(courseId: string): string[] {
  return courseMappings
    .filter(m => m.courseIds.includes(courseId))
    .map(m => m.vulnerabilitySlug);
}

/**
 * Returns all mappings sorted by recommended learning order.
 */
export function getLearningPath(): CourseMapping[] {
  return [...courseMappings].sort((a, b) => a.learningOrder - b.learningOrder);
}

export default courseMappings;

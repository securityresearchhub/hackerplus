// Courses data service
import Store from '../core/store/store.js';

export const COURSES = [
  {
    id: 'c1',
    title: 'Web Application Hacking Masterclass',
    instructor: 'Alex Cipher',
    category: 'web-security',
    difficulty: 'intermediate',
    duration: '12h 30m',
    xpReward: 800,
    enrolledCount: 4521,
    rating: 4.8,
    description: 'Master OWASP Top 10 vulnerabilities, SQL injection, XSS, CSRF, and more. Hands-on labs with real-world targets.',
    thumbnail: '#1a472a',
    tags: ['owasp', 'sql-injection', 'xss', 'burpsuite'],
    lessons: [
      { id: 'l1', title: 'Introduction to Web Security', duration: '15m', type: 'video', free: true },
      { id: 'l2', title: 'OWASP Top 10 Overview', duration: '25m', type: 'video', free: true },
      { id: 'l3', title: 'SQL Injection Fundamentals', duration: '40m', type: 'lab', free: false },
      { id: 'l4', title: 'Advanced SQL Injection', duration: '35m', type: 'lab', free: false },
      { id: 'l5', title: 'Cross-Site Scripting (XSS)', duration: '30m', type: 'video', free: false },
      { id: 'l6', title: 'CSRF Attacks & Defenses', duration: '25m', type: 'lab', free: false },
      { id: 'l7', title: 'Broken Authentication', duration: '30m', type: 'video', free: false },
      { id: 'l8', title: 'Final Lab Challenge', duration: '60m', type: 'lab', free: false },
    ],
    requirements: ['Basic HTML/CSS knowledge', 'Understanding of HTTP', 'Linux basics'],
    whatYouLearn: ['Identify OWASP Top 10 vulnerabilities', 'Exploit SQL injections', 'Perform XSS attacks', 'Use Burp Suite professionally', 'Write security reports'],
  },
  {
    id: 'c2',
    title: 'Network Penetration Testing',
    instructor: 'Ghost Protocol',
    category: 'network',
    difficulty: 'advanced',
    duration: '18h 00m',
    xpReward: 1200,
    enrolledCount: 2871,
    rating: 4.9,
    description: 'Complete network pentesting from reconnaissance to exploitation. Nmap, Metasploit, and post-exploitation.',
    thumbnail: '#1a2a47',
    tags: ['nmap', 'metasploit', 'wireshark', 'network'],
    lessons: [
      { id: 'l1', title: 'Network Fundamentals Review', duration: '20m', type: 'video', free: true },
      { id: 'l2', title: 'Reconnaissance & OSINT', duration: '45m', type: 'video', free: true },
      { id: 'l3', title: 'Scanning with Nmap', duration: '50m', type: 'lab', free: false },
      { id: 'l4', title: 'Service Enumeration', duration: '40m', type: 'lab', free: false },
      { id: 'l5', title: 'Exploitation with Metasploit', duration: '60m', type: 'lab', free: false },
      { id: 'l6', title: 'Post Exploitation', duration: '55m', type: 'lab', free: false },
    ],
    requirements: ['TCP/IP knowledge', 'Linux command line', 'Web security basics'],
    whatYouLearn: ['Conduct network reconnaissance', 'Use Nmap for scanning', 'Exploit network services', 'Achieve persistent access', 'Write pentest reports'],
  },
  {
    id: 'c3',
    title: 'Cryptography & Crypto Attacks',
    instructor: 'CipherMind',
    category: 'cryptography',
    difficulty: 'intermediate',
    duration: '10h 15m',
    xpReward: 700,
    enrolledCount: 1934,
    rating: 4.7,
    description: 'From classical ciphers to modern cryptography. Learn to break weak crypto implementations.',
    thumbnail: '#2a1a47',
    tags: ['cryptography', 'aes', 'rsa', 'hash-cracking'],
    lessons: [
      { id: 'l1', title: 'History of Cryptography', duration: '20m', type: 'video', free: true },
      { id: 'l2', title: 'Symmetric Encryption', duration: '35m', type: 'video', free: false },
      { id: 'l3', title: 'Asymmetric Encryption & RSA', duration: '40m', type: 'video', free: false },
      { id: 'l4', title: 'Hash Functions & Attacks', duration: '45m', type: 'lab', free: false },
      { id: 'l5', title: 'CTF Crypto Challenges', duration: '60m', type: 'lab', free: false },
    ],
    requirements: ['Basic math', 'Python basics'],
    whatYouLearn: ['Understand crypto algorithms', 'Break weak implementations', 'Crack hashes', 'Solve crypto CTF challenges'],
  },
  {
    id: 'c4',
    title: 'Malware Analysis & Reverse Engineering',
    instructor: 'Byte Breaker',
    category: 'malware',
    difficulty: 'advanced',
    duration: '15h 00m',
    xpReward: 1100,
    enrolledCount: 1203,
    rating: 4.6,
    description: 'Analyze real malware samples safely. Static and dynamic analysis, disassembly, and indicator extraction.',
    thumbnail: '#471a1a',
    tags: ['malware', 'reverse-engineering', 'ghidra', 'ida'],
    lessons: [
      { id: 'l1', title: 'Malware Types Overview', duration: '25m', type: 'video', free: true },
      { id: 'l2', title: 'Static Analysis Basics', duration: '40m', type: 'lab', free: false },
      { id: 'l3', title: 'Dynamic Analysis & Sandboxing', duration: '50m', type: 'lab', free: false },
      { id: 'l4', title: 'Disassembly with Ghidra', duration: '60m', type: 'lab', free: false },
      { id: 'l5', title: 'Ransomware Analysis', duration: '55m', type: 'lab', free: false },
    ],
    requirements: ['Assembly basics', 'Windows internals', 'Virtual machine setup'],
    whatYouLearn: ['Perform static/dynamic analysis', 'Use Ghidra for disassembly', 'Extract IoCs', 'Write malware reports'],
  },
  {
    id: 'c5',
    title: 'OSINT & Digital Investigations',
    instructor: 'ShadowTrace',
    category: 'osint',
    difficulty: 'beginner',
    duration: '8h 30m',
    xpReward: 500,
    enrolledCount: 5821,
    rating: 4.9,
    description: 'Master open-source intelligence gathering. Trace digital footprints, investigate targets legally.',
    thumbnail: '#1a3a47',
    tags: ['osint', 'reconnaissance', 'maltego', 'shodan'],
    lessons: [
      { id: 'l1', title: 'OSINT Fundamentals', duration: '20m', type: 'video', free: true },
      { id: 'l2', title: 'Google Dorking', duration: '30m', type: 'lab', free: true },
      { id: 'l3', title: 'Social Media Investigation', duration: '35m', type: 'lab', free: false },
      { id: 'l4', title: 'Maltego Basics', duration: '45m', type: 'lab', free: false },
      { id: 'l5', title: 'Shodan & IoT Recon', duration: '40m', type: 'lab', free: false },
    ],
    requirements: ['No prerequisites', 'Curiosity and patience'],
    whatYouLearn: ['Use OSINT tools effectively', 'Conduct legal investigations', 'Trace digital footprints', 'Build target profiles'],
  },
  {
    id: 'c6',
    title: 'CTF Bootcamp: From Zero to Hero',
    instructor: 'FlagHunter',
    category: 'ctf',
    difficulty: 'beginner',
    duration: '20h 00m',
    xpReward: 900,
    enrolledCount: 7321,
    rating: 4.8,
    description: 'Complete CTF training covering web, crypto, forensics, binary exploitation, and reverse engineering.',
    thumbnail: '#3a2a1a',
    tags: ['ctf', 'pwn', 'forensics', 'web', 'crypto'],
    lessons: [
      { id: 'l1', title: 'What is CTF?', duration: '15m', type: 'video', free: true },
      { id: 'l2', title: 'Web Challenges', duration: '60m', type: 'lab', free: true },
      { id: 'l3', title: 'Crypto Challenges', duration: '50m', type: 'lab', free: false },
      { id: 'l4', title: 'Forensics Challenges', duration: '55m', type: 'lab', free: false },
      { id: 'l5', title: 'Binary Exploitation', duration: '70m', type: 'lab', free: false },
    ],
    requirements: ['Basic programming', 'Linux familiarity'],
    whatYouLearn: ['Solve all CTF categories', 'Use CTF tools', 'Think like a hacker', 'Win competitions'],
  },
];

export const CoursesService = {
  async getAll() {
    return COURSES;
  },

  async getById(id) {
    return COURSES.find(c => c.id === id) || null;
  },

  async getEnrolled() {
    const { enrolled } = Store.getSlice('courses');
    return COURSES.filter(c => enrolled.includes(c.id));
  },

  async enroll(courseId) {
    Store.dispatch({ type: 'COURSES_ENROLL', payload: courseId });
  },

  async updateProgress(courseId, lessonId, completed) {
    const { progress } = Store.getSlice('courses');
    const courseProgress = progress[courseId] || { completed: [], current: null };
    if (completed && !courseProgress.completed.includes(lessonId)) {
      courseProgress.completed.push(lessonId);
    }
    courseProgress.current = lessonId;
    Store.dispatch({ type: 'COURSES_UPDATE_PROGRESS', payload: { courseId, progress: courseProgress } });
  },

  getProgress(courseId) {
    const { progress } = Store.getSlice('courses');
    return progress[courseId] || { completed: [], current: null };
  },

  isEnrolled(courseId) {
    const { enrolled } = Store.getSlice('courses');
    return enrolled.includes(courseId);
  },
};

export default CoursesService;

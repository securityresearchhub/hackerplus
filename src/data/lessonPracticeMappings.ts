/**
 * lessonPracticeMappings.ts
 * Join table: lesson ID → vulnerability slugs + quiz questions.
 * This is the only file that knows which catalog entries belong to each lesson.
 * PracticeEngine reads this to enrich lessons with labs, challenges, and quizzes.
 */

export type QuizDifficulty = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  /** 0-based index of the correct option */
  correctIndex: number;
  explanation: string;
  difficulty: QuizDifficulty;
  xp: number;
}

export interface LessonPracticeMapping {
  lessonId: string;
  /** HP-026 vulnerability slugs this lesson teaches */
  vulnerabilitySlugs: string[];
  /**
   * Optional direct lab ID overrides — used for lab-type lessons
   * that should surface a specific lab regardless of catalog mapping.
   */
  labIdOverrides?: string[];
  /**
   * Optional direct challenge ID overrides.
   */
  challengeIdOverrides?: string[];
  quiz: QuizQuestion[];
}

export const lessonPracticeMappings: LessonPracticeMapping[] = [

  // ══════════════════════════════════════════════════════════════════════════
  // c001 — Web Application Hacking
  // ══════════════════════════════════════════════════════════════════════════

  // s001 — Introduction
  {
    lessonId: 'l001',
    vulnerabilitySlugs: [],
    quiz: [
      {
        id: 'q-l001-1',
        question: 'What is the primary tool used for intercepting and modifying HTTP traffic in web pentesting?',
        options: ['Nmap', 'Burp Suite', 'Metasploit', 'Wireshark'],
        correctIndex: 1,
        explanation: 'Burp Suite is the industry-standard web application proxy used by security professionals to intercept, modify, and replay HTTP/HTTPS traffic.',
        difficulty: 'Beginner', xp: 25,
      },
      {
        id: 'q-l001-2',
        question: 'Which virtual machine distribution is pre-loaded with security tools and is the standard for ethical hacking?',
        options: ['Ubuntu', 'Windows Server', 'Kali Linux', 'macOS'],
        correctIndex: 2,
        explanation: 'Kali Linux (by Offensive Security) comes pre-installed with hundreds of security tools including Burp Suite, Nmap, Metasploit, and sqlmap.',
        difficulty: 'Beginner', xp: 25,
      },
    ],
  },
  {
    lessonId: 'l002',
    vulnerabilitySlugs: [],
    quiz: [
      {
        id: 'q-l002-1',
        question: 'Which HTTP method is typically used to submit form data that modifies server state?',
        options: ['GET', 'POST', 'HEAD', 'OPTIONS'],
        correctIndex: 1,
        explanation: 'POST carries data in the request body and is used for state-changing operations. GET appends data to the URL and should be idempotent.',
        difficulty: 'Beginner', xp: 25,
      },
      {
        id: 'q-l002-2',
        question: 'What HTTP status code indicates a successful redirect?',
        options: ['200', '401', '302', '500'],
        correctIndex: 2,
        explanation: '302 Found is a redirect status. The browser follows the Location header to the new URL. Attackers often abuse redirects in open-redirect attacks.',
        difficulty: 'Beginner', xp: 25,
      },
      {
        id: 'q-l002-3',
        question: 'Which HTTP header transmits session cookies from browser to server?',
        options: ['Authorization', 'Cookie', 'Set-Cookie', 'X-Session'],
        correctIndex: 1,
        explanation: 'The browser sends the Cookie header on every request. Set-Cookie is the server response header used to create cookies.',
        difficulty: 'Beginner', xp: 25,
      },
    ],
  },
  {
    lessonId: 'l003',
    vulnerabilitySlugs: [],
    quiz: [
      {
        id: 'q-l003-1',
        question: 'What is the purpose of Burp Suite\'s "Repeater" tab?',
        options: ['Automates brute-force attacks', 'Replays and modifies individual HTTP requests', 'Scans for vulnerabilities automatically', 'Decodes encoded data'],
        correctIndex: 1,
        explanation: 'Repeater allows you to manually send and resend HTTP requests with modifications, making it ideal for testing parameter manipulation and injection attacks.',
        difficulty: 'Beginner', xp: 25,
      },
      {
        id: 'q-l003-2',
        question: 'Which Burp Suite feature automatically tests parameters for common vulnerabilities?',
        options: ['Proxy', 'Repeater', 'Scanner (Pro)', 'Decoder'],
        correctIndex: 2,
        explanation: 'Burp Suite Professional\'s Scanner automatically crawls and audits web applications for vulnerabilities like SQLi, XSS, and more.',
        difficulty: 'Beginner', xp: 25,
      },
    ],
  },
  {
    lessonId: 'l004',
    vulnerabilitySlugs: [],
    labIdOverrides: [],
    quiz: [
      {
        id: 'q-l004-1',
        question: 'Why should your hacking lab be network-isolated?',
        options: ['To increase speed', 'To prevent accidental attacks on real systems', 'To enable Docker support', 'To bypass firewalls'],
        correctIndex: 1,
        explanation: 'Lab isolation ensures your practice attacks do not escape to production systems or the internet, which would be illegal and unethical.',
        difficulty: 'Beginner', xp: 25,
      },
    ],
  },

  // s002 — SQL Injection
  {
    lessonId: 'l005',
    vulnerabilitySlugs: ['sql-injection-basic'],
    quiz: [
      {
        id: 'q-l005-1',
        question: 'What does SQL Injection allow an attacker to do?',
        options: ['Execute JavaScript in the victim\'s browser', 'Manipulate database queries to access or modify data', 'Intercept network packets', 'Brute-force user passwords'],
        correctIndex: 1,
        explanation: 'SQL Injection allows attackers to inject malicious SQL code into queries, enabling unauthorized data access, authentication bypass, and data manipulation.',
        difficulty: 'Beginner', xp: 25,
      },
      {
        id: 'q-l005-2',
        question: 'Which character is the most common starting point for SQL injection testing?',
        options: ['<', "'", '%', '/'],
        correctIndex: 1,
        explanation: "A single quote (') breaks out of string context in SQL queries. If the server returns an error, the parameter is likely injectable.",
        difficulty: 'Beginner', xp: 25,
      },
      {
        id: 'q-l005-3',
        question: 'Which OWASP Top 10 2021 category includes SQL Injection?',
        options: ['A01: Broken Access Control', 'A02: Cryptographic Failures', 'A03: Injection', 'A07: Identification & Auth Failures'],
        correctIndex: 2,
        explanation: 'A03:2021 — Injection covers SQL, NoSQL, OS, and LDAP injection. It moved from #1 in 2017 to #3 in 2021.',
        difficulty: 'Beginner', xp: 25,
      },
    ],
  },
  {
    lessonId: 'l006',
    vulnerabilitySlugs: ['sql-injection-basic', 'sql-injection-union'],
    quiz: [
      {
        id: 'q-l006-1',
        question: 'What type of SQL injection uses database error messages to extract data?',
        options: ['Blind Boolean-Based', 'Error-Based', 'Time-Based', 'Out-of-Band'],
        correctIndex: 1,
        explanation: 'Error-based SQLi forces the database to output error messages containing extracted data. Functions like EXTRACTVALUE() and UPDATEXML() are commonly abused.',
        difficulty: 'Intermediate', xp: 30,
      },
      {
        id: 'q-l006-2',
        question: 'Which SQL clause is used in UNION-based injection to retrieve data from other tables?',
        options: ['JOIN', 'UNION SELECT', 'GROUP BY', 'HAVING'],
        correctIndex: 1,
        explanation: 'UNION SELECT appends a second SELECT query to the original. The attacker must match the number and types of columns from the original query.',
        difficulty: 'Intermediate', xp: 30,
      },
      {
        id: 'q-l006-3',
        question: 'What tool automates SQL injection detection and exploitation?',
        options: ['Burp Suite', 'Nmap', 'sqlmap', 'Hydra'],
        correctIndex: 2,
        explanation: 'sqlmap is an open-source tool that automates the detection and exploitation of SQL injection vulnerabilities. It supports all major databases.',
        difficulty: 'Beginner', xp: 25,
      },
    ],
  },
  {
    lessonId: 'l007',
    vulnerabilitySlugs: ['sql-injection-blind'],
    quiz: [
      {
        id: 'q-l007-1',
        question: 'In Boolean-based blind SQL injection, how does the attacker extract data?',
        options: ['Through error messages', 'By observing differences in HTTP responses (true vs false conditions)', 'Through DNS callbacks', 'By timing database response delays'],
        correctIndex: 1,
        explanation: 'Boolean-based blind SQLi sends queries that evaluate to TRUE or FALSE and observes whether the response differs (e.g., page loads vs. empty page), extracting data bit by bit.',
        difficulty: 'Intermediate', xp: 30,
      },
      {
        id: 'q-l007-2',
        question: 'Which SQL function is used in time-based blind injection to create delays?',
        options: ['SLEEP()', 'WAIT()', 'DELAY()', 'PAUSE()'],
        correctIndex: 0,
        explanation: 'SLEEP(n) in MySQL (WAITFOR DELAY in MSSQL) pauses execution for n seconds. If the response is delayed, the condition evaluated to true.',
        difficulty: 'Intermediate', xp: 30,
      },
      {
        id: 'q-l007-3',
        question: 'What is the primary disadvantage of blind SQL injection compared to error-based?',
        options: ['Cannot extract any data', 'Extremely slow — requires many requests to extract data byte by byte', 'Requires admin credentials', 'Only works on MySQL databases'],
        correctIndex: 1,
        explanation: 'Blind SQLi requires hundreds or thousands of requests to extract a single value, making it slow. Tools like sqlmap use binary search to optimise this.',
        difficulty: 'Intermediate', xp: 30,
      },
    ],
  },
  {
    lessonId: 'l008',
    vulnerabilitySlugs: ['sql-injection-basic', 'sql-injection-blind', 'sql-injection-union'],
    labIdOverrides: ['lab1'],
    challengeIdOverrides: ['ch1', 'ch2'],
    quiz: [
      {
        id: 'q-l008-1',
        question: 'What does DVWA stand for?',
        options: ['Damn Vulnerable Web App', 'Dynamic Vulnerability Web Application', 'Defense Vulnerability Web Application', 'Dangerous Vulnerability Web App'],
        correctIndex: 0,
        explanation: 'DVWA (Damn Vulnerable Web App) is a deliberately insecure PHP/MySQL application used for practising common web vulnerabilities.',
        difficulty: 'Beginner', xp: 50,
      },
      {
        id: 'q-l008-2',
        question: 'Which DVWA security level provides the least protection for practice?',
        options: ['High', 'Medium', 'Low', 'Impossible'],
        correctIndex: 2,
        explanation: 'The Low level has no input sanitisation or validation, making it ideal for learning basic injection techniques without filters.',
        difficulty: 'Beginner', xp: 50,
      },
      {
        id: 'q-l008-3',
        question: 'What flag format does HackerPlus use for lab completions?',
        options: ['flag{...}', 'CTF{...}', 'hp_flag{...}', 'HP_CTF{...}'],
        correctIndex: 2,
        explanation: 'All HackerPlus lab flags follow the format hp_flag{...}. Submit the exact string in the Flag Submission panel.',
        difficulty: 'Beginner', xp: 50,
      },
    ],
  },

  // s003 — XSS
  {
    lessonId: 'l009',
    vulnerabilitySlugs: ['xss-reflected', 'xss-stored'],
    quiz: [
      {
        id: 'q-l009-1',
        question: 'What is the key difference between reflected and stored XSS?',
        options: [
          'Reflected requires JavaScript; stored does not',
          'Stored persists in the database and affects all users; reflected is a one-time server echo',
          'Stored attacks only one user; reflected attacks everyone',
          'They use different programming languages',
        ],
        correctIndex: 1,
        explanation: 'Stored XSS persists in the database. Every user loading the infected page executes the payload. Reflected XSS is echoed only to the victim who clicks a malicious link.',
        difficulty: 'Beginner', xp: 25,
      },
      {
        id: 'q-l009-2',
        question: 'Which XSS type poses the greatest risk because it affects every visitor?',
        options: ['Reflected', 'Stored (Persistent)', 'DOM-Based', 'Blind'],
        correctIndex: 1,
        explanation: 'Stored XSS is most dangerous: once injected, every user who loads the page runs the attacker\'s script, enabling mass session hijacking.',
        difficulty: 'Beginner', xp: 25,
      },
      {
        id: 'q-l009-3',
        question: 'What HTML tag is most commonly used to deliver XSS payloads?',
        options: ['<a>', '<img>', '<script>', '<form>'],
        correctIndex: 2,
        explanation: '<script>alert(1)</script> is the classic XSS test payload. Filters often block this, leading to alternatives like <img src=x onerror=alert(1)>.',
        difficulty: 'Beginner', xp: 25,
      },
    ],
  },
  {
    lessonId: 'l010',
    vulnerabilitySlugs: ['xss-dom'],
    quiz: [
      {
        id: 'q-l010-1',
        question: 'DOM-Based XSS is unique because the malicious payload is processed by:',
        options: ['The web server', 'The database server', 'The client-side JavaScript engine', 'A reverse proxy'],
        correctIndex: 2,
        explanation: 'In DOM-Based XSS, the payload never reaches the server. Client-side JavaScript reads attacker-controlled data (source) and writes it to the DOM (sink) unsafely.',
        difficulty: 'Intermediate', xp: 30,
      },
      {
        id: 'q-l010-2',
        question: 'In DOM XSS terminology, what is a "source"?',
        options: ['A safe, validated input field', 'User-controlled data read by the JavaScript (e.g. location.hash)', 'A sanitisation function', 'The HTML body element'],
        correctIndex: 1,
        explanation: 'Sources are where attacker-controlled data enters the JavaScript context: location.href, document.referrer, window.name, URL parameters etc.',
        difficulty: 'Intermediate', xp: 30,
      },
      {
        id: 'q-l010-3',
        question: 'Which Burp Suite extension is most effective for finding DOM-Based XSS?',
        options: ['sqlmap Integration', 'DOM Invader', 'Logger++', 'Autorize'],
        correctIndex: 1,
        explanation: 'Burp Suite\'s DOM Invader (built into Chromium-based browser) instruments the DOM, tracking sources and sinks to find DOM XSS automatically.',
        difficulty: 'Intermediate', xp: 30,
      },
    ],
  },
  {
    lessonId: 'l011',
    vulnerabilitySlugs: ['xss-reflected', 'xss-dom'],
    quiz: [
      {
        id: 'q-l011-1',
        question: 'Which technique bypasses basic HTML encoding filters for XSS?',
        options: ['Double URL encoding (%253C for <)', 'Using only lowercase letters', 'Adding extra spaces between tags', 'Hashing the payload'],
        correctIndex: 0,
        explanation: 'Double encoding (%253C → %3C → <) can bypass filters that only decode once. The server decodes the first layer; the browser decodes the second.',
        difficulty: 'Intermediate', xp: 35,
      },
      {
        id: 'q-l011-2',
        question: 'Which HTML attribute executes JavaScript without requiring a <script> tag?',
        options: ['class', 'href', 'onerror', 'name'],
        correctIndex: 2,
        explanation: 'Event handlers like onerror, onload, onclick execute JavaScript. <img src=x onerror=alert(1)> is a classic filter-bypass XSS payload.',
        difficulty: 'Intermediate', xp: 35,
      },
      {
        id: 'q-l011-3',
        question: 'What CSP header value blocks all inline scripts including XSS payloads?',
        options: ["script-src 'self'", "script-src 'none'", "default-src 'none'", "Content-Security-Policy: block"],
        correctIndex: 0,
        explanation: "script-src 'self' allows only scripts from the same origin and blocks all inline <script> and event handlers, significantly mitigating XSS.",
        difficulty: 'Intermediate', xp: 35,
      },
    ],
  },
  {
    lessonId: 'l012',
    vulnerabilitySlugs: ['xss-stored', 'xss-reflected'],
    labIdOverrides: ['lab2'],
    challengeIdOverrides: ['ch5', 'ch6'],
    quiz: [
      {
        id: 'q-l012-1',
        question: 'What JavaScript property allows reading a user\'s session cookies?',
        options: ['document.cookies', 'document.cookie', 'window.cookies', 'browser.cookie'],
        correctIndex: 1,
        explanation: 'document.cookie returns all cookies not marked HttpOnly as a semicolon-separated string. XSS payloads use it to steal session tokens.',
        difficulty: 'Beginner', xp: 50,
      },
      {
        id: 'q-l012-2',
        question: 'Which cookie flag prevents JavaScript from reading the cookie?',
        options: ['Secure', 'HttpOnly', 'SameSite=Strict', 'Path=/'],
        correctIndex: 1,
        explanation: 'The HttpOnly flag instructs browsers to deny JavaScript access to a cookie. Even a successful XSS payload cannot read HttpOnly cookies via document.cookie.',
        difficulty: 'Beginner', xp: 50,
      },
      {
        id: 'q-l012-3',
        question: 'What attack does successful cookie theft via XSS primarily enable?',
        options: ['SQL Injection', 'CSRF', 'Session Hijacking', 'Command Injection'],
        correctIndex: 2,
        explanation: 'With the victim\'s session cookie, the attacker can authenticate as the victim without knowing their password — this is session hijacking.',
        difficulty: 'Beginner', xp: 50,
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // c002 — Network Penetration Testing
  // ══════════════════════════════════════════════════════════════════════════

  {
    lessonId: 'l101',
    vulnerabilitySlugs: ['port-scan-enumeration'],
    quiz: [
      {
        id: 'q-l101-1',
        question: 'What Nmap flag performs a SYN (stealth) scan that does not complete the TCP handshake?',
        options: ['-sT', '-sS', '-sU', '-sV'],
        correctIndex: 1,
        explanation: '-sS (SYN scan) sends SYN packets and reads the SYN-ACK response without completing the handshake, reducing log noise on many systems.',
        difficulty: 'Beginner', xp: 25,
      },
      {
        id: 'q-l101-2',
        question: 'What does the Nmap flag -p- scan?',
        options: ['Only privileged ports (1-1024)', 'All 65535 TCP ports', 'Only UDP ports', 'The top 100 common ports'],
        correctIndex: 1,
        explanation: '-p- tells Nmap to scan all ports from 1 to 65535. Default scanning only checks the top 1000 most common ports.',
        difficulty: 'Beginner', xp: 25,
      },
      {
        id: 'q-l101-3',
        question: 'Which Nmap script category is used to check for known vulnerabilities?',
        options: ['discovery', 'default', 'vuln', 'safe'],
        correctIndex: 2,
        explanation: 'nmap --script vuln runs the vulnerability detection script category, checking for known CVEs on discovered services.',
        difficulty: 'Beginner', xp: 25,
      },
    ],
  },
  {
    lessonId: 'l102',
    vulnerabilitySlugs: ['port-scan-enumeration', 'subdomain-enumeration'],
    quiz: [
      {
        id: 'q-l102-1',
        question: 'What tool enumerates SMB shares and users on a Windows/Linux target?',
        options: ['Nmap', 'enum4linux', 'Gobuster', 'Nikto'],
        correctIndex: 1,
        explanation: 'enum4linux wraps smbclient, rpcclient, and net commands to enumerate Windows/Samba information including shares, users, groups, and password policies.',
        difficulty: 'Intermediate', xp: 25,
      },
      {
        id: 'q-l102-2',
        question: 'Which protocol commonly runs on port 389 and is targeted for user enumeration?',
        options: ['SMTP', 'FTP', 'LDAP', 'RDP'],
        correctIndex: 2,
        explanation: 'LDAP (Lightweight Directory Access Protocol, port 389) is used by Active Directory. Unauthenticated LDAP enumeration can reveal usernames, groups, and computer accounts.',
        difficulty: 'Intermediate', xp: 25,
      },
      {
        id: 'q-l102-3',
        question: 'What Nmap flag detects service names and version numbers?',
        options: ['-sV', '-O', '-A', '-sC'],
        correctIndex: 0,
        explanation: '-sV performs version detection by probing open ports with service-specific payloads. This reveals whether an FTP server is ProFTPD, vsftpd, etc.',
        difficulty: 'Beginner', xp: 25,
      },
    ],
  },
  {
    lessonId: 'l103',
    vulnerabilitySlugs: ['port-scan-enumeration'],
    labIdOverrides: ['lab2'],
    quiz: [
      {
        id: 'q-l103-1',
        question: 'What does CIDR /24 notation define?',
        options: ['24 hosts only', '256 addresses (e.g. 192.168.1.0–255)', '24 subnets', '24-bit host portion'],
        correctIndex: 1,
        explanation: '/24 means 24 bits for the network, 8 bits for hosts — 256 total addresses (254 usable). Example: 192.168.1.0/24.',
        difficulty: 'Beginner', xp: 50,
      },
      {
        id: 'q-l103-2',
        question: 'Which Nmap flag discovers live hosts WITHOUT port scanning?',
        options: ['-sn', '-sS', '-sV', '-Pn'],
        correctIndex: 0,
        explanation: '-sn (ping scan / host discovery) sends ICMP echo, TCP SYN, TCP ACK, and ICMP timestamp without port scanning. Fast for large networks.',
        difficulty: 'Beginner', xp: 50,
      },
    ],
  },
  {
    lessonId: 'l104',
    vulnerabilitySlugs: [],
    quiz: [
      {
        id: 'q-l104-1',
        question: 'What Metasploit command searches for a specific exploit module?',
        options: ['find', 'search', 'lookup', 'query'],
        correctIndex: 1,
        explanation: '"search" filters the module database by name, CVE, platform, author, etc. e.g. search type:exploit name:eternalblue',
        difficulty: 'Beginner', xp: 25,
      },
      {
        id: 'q-l104-2',
        question: 'What is a Metasploit "payload"?',
        options: ['The vulnerability being exploited', 'Code that executes on the target after successful exploitation', 'The attacker\'s IP address', 'A pre-exploitation scan module'],
        correctIndex: 1,
        explanation: 'A payload is the shellcode delivered after exploitation. Common payloads: meterpreter/reverse_tcp, shell/reverse_tcp.',
        difficulty: 'Beginner', xp: 25,
      },
    ],
  },
  {
    lessonId: 'l105',
    vulnerabilitySlugs: ['reverse-shell-deployment'],
    quiz: [
      {
        id: 'q-l105-1',
        question: 'What Metasploit exploit abused the EternalBlue SMB vulnerability (MS17-010)?',
        options: ['exploit/windows/smb/ms08_067_netapi', 'exploit/windows/smb/ms17_010_eternalblue', 'exploit/windows/dcerpc/ms03_026_dcom', 'exploit/multi/handler'],
        correctIndex: 1,
        explanation: 'ms17_010_eternalblue exploits the SMBv1 buffer overflow used by WannaCry and NotPetya ransomware. It gives SYSTEM-level access without credentials.',
        difficulty: 'Intermediate', xp: 30,
      },
      {
        id: 'q-l105-2',
        question: 'In Metasploit, what does LHOST refer to?',
        options: ['The target\'s hostname', 'The attacker\'s IP for reverse connections', 'The local proxy host', 'A listening server hostname'],
        correctIndex: 1,
        explanation: 'LHOST (Local Host) is the attacker\'s IP address that the target connects back to for reverse shells. LPORT is the port the listener is on.',
        difficulty: 'Beginner', xp: 25,
      },
      {
        id: 'q-l105-3',
        question: 'Which Metasploit command starts the exploit?',
        options: ['start', 'launch', 'exploit', 'execute'],
        correctIndex: 2,
        explanation: '"exploit" (or "run") sends the exploit payload to the target. "exploit -j" runs it as a background job.',
        difficulty: 'Beginner', xp: 25,
      },
    ],
  },
  {
    lessonId: 'l106',
    vulnerabilitySlugs: ['reverse-shell-deployment', 'token-impersonation'],
    quiz: [
      {
        id: 'q-l106-1',
        question: 'What Meterpreter command dumps Windows password hashes?',
        options: ['hashdump', 'dumppass', 'gethashes', 'credcat'],
        correctIndex: 0,
        explanation: '"hashdump" dumps the SAM database password hashes. The output (NTLM hashes) can be cracked offline or used directly in Pass-the-Hash attacks.',
        difficulty: 'Intermediate', xp: 30,
      },
      {
        id: 'q-l106-2',
        question: 'What Meterpreter command attempts to escalate to SYSTEM on Windows?',
        options: ['getuid', 'getsystem', 'elevate', 'runas'],
        correctIndex: 1,
        explanation: '"getsystem" tries multiple privilege escalation techniques including named pipe impersonation and token duplication to get SYSTEM-level access.',
        difficulty: 'Intermediate', xp: 30,
      },
    ],
  },
  {
    lessonId: 'l107',
    vulnerabilitySlugs: ['reverse-shell-deployment'],
    labIdOverrides: ['lab2'],
    challengeIdOverrides: ['ch3', 'ch4'],
    quiz: [
      {
        id: 'q-l107-1',
        question: 'On a CTF/HackTheBox machine, what does "root.txt" typically contain?',
        options: ['System configuration data', 'The root/administrator flag', 'SSH private key', 'Password hashes'],
        correctIndex: 1,
        explanation: 'root.txt is placed in the root home directory (/root or C:\\Users\\Administrator) and contains the final flag proving you achieved highest privilege.',
        difficulty: 'Beginner', xp: 50,
      },
      {
        id: 'q-l107-2',
        question: 'What is the typical goal of a CTF "Pwn the Machine" challenge?',
        options: ['Find only XSS vulnerabilities', 'Gain root/admin access and capture both user.txt and root.txt flags', 'Perform OSINT reconnaissance only', 'Social engineer the admin'],
        correctIndex: 1,
        explanation: 'You need two flags: user.txt (low-privilege access) and root.txt (root/admin). The challenge tests a full attack chain from enumeration to privilege escalation.',
        difficulty: 'Beginner', xp: 50,
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // c003 — Cryptography for Hackers
  // ══════════════════════════════════════════════════════════════════════════

  {
    lessonId: 'l201',
    vulnerabilitySlugs: [],
    quiz: [
      {
        id: 'q-l201-1',
        question: 'What is the fundamental difference between symmetric and asymmetric encryption?',
        options: [
          'Symmetric uses two keys; asymmetric uses one',
          'Symmetric uses one shared key; asymmetric uses a key pair (public/private)',
          'Symmetric is always stronger than asymmetric',
          'They are functionally identical',
        ],
        correctIndex: 1,
        explanation: 'Symmetric (AES, DES) uses one shared secret key. Asymmetric (RSA, ECC) uses a key pair: the public key encrypts, the private key decrypts.',
        difficulty: 'Beginner', xp: 25,
      },
      {
        id: 'q-l201-2',
        question: 'What does a cryptographic hash function produce?',
        options: ['Encrypted ciphertext that can be decrypted', 'A fixed-length digest that cannot be reversed', 'A digital signature', 'A symmetric key'],
        correctIndex: 1,
        explanation: 'Hash functions (SHA-256, MD5) produce a fixed-length output (digest). They are one-way: you cannot derive the input from the hash.',
        difficulty: 'Beginner', xp: 25,
      },
    ],
  },
  {
    lessonId: 'l202',
    vulnerabilitySlugs: ['weak-cipher-exploitation'],
    quiz: [
      {
        id: 'q-l202-1',
        question: 'What makes AES-ECB mode cryptographically weak?',
        options: ['It uses a short key', 'Identical plaintext blocks always produce identical ciphertext blocks, revealing patterns', 'It has no IV', 'It uses a broken S-box'],
        correctIndex: 1,
        explanation: 'ECB mode encrypts each block independently. Identical plaintext → identical ciphertext. This is catastrophically visible in encrypted images (the "ECB penguin").',
        difficulty: 'Intermediate', xp: 30,
      },
      {
        id: 'q-l202-2',
        question: 'What is the block size of AES (all key sizes)?',
        options: ['64 bits', '128 bits', '256 bits', '512 bits'],
        correctIndex: 1,
        explanation: 'AES always uses a 128-bit (16-byte) block size regardless of key length (128, 192, or 256 bits). This is fixed in the NIST standard.',
        difficulty: 'Intermediate', xp: 30,
      },
      {
        id: 'q-l202-3',
        question: 'Which AES mode requires an Initialization Vector (IV)?',
        options: ['ECB only', 'CBC, CTR, GCM (not ECB)', 'Both ECB and CBC', 'None — AES never uses IVs'],
        correctIndex: 1,
        explanation: 'ECB has no IV. CBC, CTR, GCM and other chaining modes require an IV to ensure identical plaintexts produce different ciphertexts.',
        difficulty: 'Intermediate', xp: 30,
      },
    ],
  },
  {
    lessonId: 'l203',
    vulnerabilitySlugs: ['hash-length-extension'],
    quiz: [
      {
        id: 'q-l203-1',
        question: 'RSA security relies on the computational difficulty of:',
        options: ['Solving discrete logarithms', 'Factoring the product of two large prime numbers', 'Reversing AES encryption', 'Guessing random seeds'],
        correctIndex: 1,
        explanation: 'RSA security depends on integer factorisation: given n = p × q where p and q are large primes, computing p and q from n alone is computationally infeasible.',
        difficulty: 'Intermediate', xp: 30,
      },
      {
        id: 'q-l203-2',
        question: 'What key do you use to encrypt data for an RSA key pair owner?',
        options: ['Their private key', 'Their public key', 'A shared session key', 'Any key of sufficient size'],
        correctIndex: 1,
        explanation: 'In RSA: encrypt with the recipient\'s PUBLIC key → only they can decrypt with their PRIVATE key. Sign with your PRIVATE key → anyone verifies with your PUBLIC key.',
        difficulty: 'Beginner', xp: 25,
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // c004 — Malware Analysis & Reverse Engineering
  // ══════════════════════════════════════════════════════════════════════════

  {
    lessonId: 'l301',
    vulnerabilitySlugs: [],
    quiz: [
      {
        id: 'q-l301-1',
        question: 'Why do malware analysts use isolated virtual machines?',
        options: ['Better performance than bare metal', 'To prevent malware from escaping and infecting the host or network', 'VMs are required by law', 'To run multiple OSes for testing'],
        correctIndex: 1,
        explanation: 'Isolation (no network, no shared folders) ensures malware cannot spread to the analyst\'s host or exfiltrate data. VM snapshots allow clean state restoration.',
        difficulty: 'Beginner', xp: 25,
      },
      {
        id: 'q-l301-2',
        question: 'Which tool provides automated behavioural malware analysis in a sandboxed environment?',
        options: ['IDA Pro', 'Cuckoo Sandbox', 'x64dbg', 'Ghidra'],
        correctIndex: 1,
        explanation: 'Cuckoo Sandbox executes malware in an isolated VM and records all system calls, network connections, dropped files, and registry changes.',
        difficulty: 'Intermediate', xp: 25,
      },
    ],
  },
  {
    lessonId: 'l302',
    vulnerabilitySlugs: ['binary-cracking', 'ransomware-analysis'],
    quiz: [
      {
        id: 'q-l302-1',
        question: 'What does static malware analysis examine?',
        options: ['Memory of a running process', 'The binary file and code without executing it', 'Network packet captures', 'System event logs'],
        correctIndex: 1,
        explanation: 'Static analysis inspects the binary: file headers, imported functions, strings, code structure, and signatures — all without running the sample.',
        difficulty: 'Beginner', xp: 30,
      },
      {
        id: 'q-l302-2',
        question: 'What does the Linux "strings" command extract from a binary?',
        options: ['Decompiled source code', 'Printable ASCII/Unicode character sequences', 'Encrypted configuration data', 'File metadata and hashes'],
        correctIndex: 1,
        explanation: '"strings" scans binary files for sequences of printable characters. Malware often contains hardcoded C2 URLs, registry keys, and error messages visible via strings.',
        difficulty: 'Beginner', xp: 30,
      },
      {
        id: 'q-l302-3',
        question: 'Which reverse engineering framework is free, open-source, and developed by the NSA?',
        options: ['IDA Pro', 'Binary Ninja', 'Ghidra', 'OllyDbg'],
        correctIndex: 2,
        explanation: 'Ghidra is a free, open-source SRE framework released by the NSA in 2019. It supports many architectures and includes a decompiler, making it a powerful IDA alternative.',
        difficulty: 'Beginner', xp: 30,
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // c005 — OSINT Mastery
  // ══════════════════════════════════════════════════════════════════════════

  {
    lessonId: 'l401',
    vulnerabilitySlugs: ['social-engineering-recon'],
    quiz: [
      {
        id: 'q-l401-1',
        question: 'What does OSINT stand for?',
        options: ['Open Security Intelligence', 'Open Source Intelligence', 'Online System Information Technology', 'Operational Security Integration'],
        correctIndex: 1,
        explanation: 'OSINT (Open Source Intelligence) is intelligence gathered from publicly available sources: social media, websites, DNS records, public databases, etc.',
        difficulty: 'Beginner', xp: 25,
      },
      {
        id: 'q-l401-2',
        question: 'Which source is NOT considered OSINT?',
        options: ['LinkedIn profiles', 'Company job postings', 'Classified government documents', 'Public DNS records'],
        correctIndex: 2,
        explanation: 'OSINT strictly uses publicly available (open source) information. Classified documents require privileged access and are obtained through other intelligence methods.',
        difficulty: 'Beginner', xp: 25,
      },
    ],
  },
  {
    lessonId: 'l402',
    vulnerabilitySlugs: ['subdomain-enumeration'],
    quiz: [
      {
        id: 'q-l402-1',
        question: 'Which Google dork finds documents of a specific file type?',
        options: ['type:pdf', 'filetype:pdf', 'file:pdf', 'ext:pdf'],
        correctIndex: 1,
        explanation: 'filetype:pdf restricts results to PDF files. Combine with site: to find exposed documents on a target: site:target.com filetype:pdf',
        difficulty: 'Beginner', xp: 25,
      },
      {
        id: 'q-l402-2',
        question: 'Which Google dork restricts results to a specific website?',
        options: ['domain:', 'from:', 'site:', 'host:'],
        correctIndex: 2,
        explanation: 'site:example.com shows only pages indexed from that domain. Useful for mapping attack surface and finding exposed admin panels.',
        difficulty: 'Beginner', xp: 25,
      },
      {
        id: 'q-l402-3',
        question: 'What does the dork "inurl:admin intitle:login" find?',
        options: ['All admin users on LinkedIn', 'Login pages with "admin" in the URL', 'Admin configuration files', 'Administrator email addresses'],
        correctIndex: 1,
        explanation: 'inurl: searches within the URL, intitle: in the page title. Combined, this finds potential admin login portals that may have weak credentials.',
        difficulty: 'Beginner', xp: 25,
      },
    ],
  },
  {
    lessonId: 'l403',
    vulnerabilitySlugs: ['subdomain-enumeration', 'port-scan-enumeration'],
    quiz: [
      {
        id: 'q-l403-1',
        question: 'What does Shodan primarily index?',
        options: ['Web pages and blog articles', 'Internet-connected devices, services, and their banners', 'Social media profiles', 'Dark web hidden services'],
        correctIndex: 1,
        explanation: 'Shodan crawls the internet and indexes device banners — web servers, cameras, routers, industrial control systems, databases. It is the "search engine for hackers".',
        difficulty: 'Beginner', xp: 25,
      },
      {
        id: 'q-l403-2',
        question: 'Which Shodan filter finds devices with a specific open port?',
        options: ['port:', 'open:', 'service:', 'tcp:'],
        correctIndex: 0,
        explanation: 'port:22 finds all devices with SSH open. port:3389 finds exposed RDP. Combine with country: and org: for targeted reconnaissance.',
        difficulty: 'Beginner', xp: 25,
      },
    ],
  },
  {
    lessonId: 'l404',
    vulnerabilitySlugs: ['subdomain-enumeration', 'social-engineering-recon'],
    labIdOverrides: [],
    challengeIdOverrides: ['ch10'],
    quiz: [
      {
        id: 'q-l404-1',
        question: 'Which tool creates graphical maps of relationships between OSINT entities?',
        options: ['Shodan', 'Maltego', 'theHarvester', 'Recon-ng'],
        correctIndex: 1,
        explanation: 'Maltego visualises relationships between people, domains, IPs, companies, and social media profiles as a graph. Transforms automatically query data sources.',
        difficulty: 'Intermediate', xp: 50,
      },
      {
        id: 'q-l404-2',
        question: 'What data can be extracted from image EXIF metadata?',
        options: ['File binary content', 'GPS coordinates, camera model, date/time taken', 'File system permissions', 'Cryptographic hashes'],
        correctIndex: 1,
        explanation: 'EXIF data in JPEG/TIFF images can contain GPS coordinates, device model, software version, and timestamps — critical for geolocation in OSINT investigations.',
        difficulty: 'Beginner', xp: 50,
      },
      {
        id: 'q-l404-3',
        question: 'Which tool harvests emails, subdomains, and names from public sources automatically?',
        options: ['Nmap', 'Maltego', 'theHarvester', 'Shodan'],
        correctIndex: 2,
        explanation: 'theHarvester queries search engines, social networks, and public sources (LinkedIn, Bing, DNSdumpster) to gather emails, subdomains, IPs, and employee names.',
        difficulty: 'Beginner', xp: 50,
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // c006 — Active Directory Attacks
  // ══════════════════════════════════════════════════════════════════════════

  {
    lessonId: 'l501',
    vulnerabilitySlugs: ['bloodhound-enumeration'],
    quiz: [
      {
        id: 'q-l501-1',
        question: 'What is a Domain Controller (DC) in Active Directory?',
        options: ['A network switch that routes AD traffic', 'A server that authenticates users and manages all AD objects and policies', 'A dedicated firewall for the domain', 'A DNS-only server'],
        correctIndex: 1,
        explanation: 'Domain Controllers store the AD database (NTDS.DIT), authenticate all domain users, and enforce Group Policy. Compromising a DC is domain dominance.',
        difficulty: 'Intermediate', xp: 30,
      },
      {
        id: 'q-l501-2',
        question: 'Which tool is the industry standard for Active Directory attack path visualisation?',
        options: ['Nmap', 'BloodHound with SharpHound collector', 'Metasploit', 'Impacket'],
        correctIndex: 1,
        explanation: 'BloodHound ingests SharpHound/AzureHound data and uses Neo4j to graph AD relationships, identifying the shortest attack path to Domain Admin.',
        difficulty: 'Intermediate', xp: 30,
      },
      {
        id: 'q-l501-3',
        question: 'What does LDAP enumeration against AD reveal to an attacker?',
        options: ['Password hashes directly', 'Usernames, group memberships, computer accounts, and SPNs', 'Kerberos tickets', 'GPO scripts content'],
        correctIndex: 1,
        explanation: 'Authenticated (or sometimes anonymous) LDAP queries enumerate all AD objects. Tools: ldapsearch, ldapdomaindump, BloodHound SharpHound.',
        difficulty: 'Intermediate', xp: 30,
      },
    ],
  },
  {
    lessonId: 'l502',
    vulnerabilitySlugs: ['kerberoasting', 'asrep-roasting'],
    challengeIdOverrides: ['ch5'],
    quiz: [
      {
        id: 'q-l502-1',
        question: 'What is the purpose of a Kerberos Ticket Granting Ticket (TGT)?',
        options: ['Directly access a file server', 'Obtain service tickets from the KDC without re-entering credentials', 'Authenticate to SQL Server', 'Establish a VPN connection'],
        correctIndex: 1,
        explanation: 'After initial authentication, the KDC issues a TGT encrypted with the krbtgt hash. The user presents this TGT to request Service Tickets (TGS) for specific services.',
        difficulty: 'Intermediate', xp: 30,
      },
      {
        id: 'q-l502-2',
        question: 'Kerberoasting works because service tickets are encrypted with:',
        options: ['The domain admin\'s NTLM hash', 'The service account\'s NTLM hash (crackable offline)', 'AES-256-HMAC-SHA1 always', 'The computer account hash'],
        correctIndex: 1,
        explanation: 'Service tickets (TGS) are encrypted with the service account\'s NTLM hash. An attacker requests these tickets, then cracks them offline with Hashcat.',
        difficulty: 'Advanced', xp: 40,
      },
      {
        id: 'q-l502-3',
        question: 'Which Impacket script requests Kerberoastable service tickets?',
        options: ['secretsdump.py', 'GetUserSPNs.py', 'psexec.py', 'wmiexec.py'],
        correctIndex: 1,
        explanation: 'GetUserSPNs.py finds accounts with SPNs (service principal names) and requests their TGS tickets, which are saved in Hashcat-compatible format for cracking.',
        difficulty: 'Advanced', xp: 40,
      },
    ],
  },
];

export default lessonPracticeMappings;

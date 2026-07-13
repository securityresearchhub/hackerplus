/**
 * badgeDefinitions.ts
 * Strongly-typed definitions of all badge achievements in the platform.
 * Mirrors the definitions in badges.json for strict type safety.
 */

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  category: 'milestone' | 'xp' | 'streak' | 'course' | 'ctf' | 'special';
  xpReward: number;
  unlockCondition: {
    type:
      | 'lessons_completed'
      | 'xp_earned'
      | 'streak_days'
      | 'course_completed'
      | 'ctf_solved'
      | 'courses_completed'
      | 'lessons_per_day'
      | 'special';
    value: number | string;
  };
}

export const BADGE_DEFINITIONS: Badge[] = [
  {
    id: 'b001',
    name: 'First Blood',
    icon: '🩸',
    description: 'Complete your very first lesson',
    category: 'milestone',
    xpReward: 100,
    unlockCondition: { type: 'lessons_completed', value: 1 },
  },
  {
    id: 'b002',
    name: 'Script Starter',
    icon: '📜',
    description: 'Earn your first 500 XP',
    category: 'xp',
    xpReward: 150,
    unlockCondition: { type: 'xp_earned', value: 500 },
  },
  {
    id: 'b003',
    name: 'On Fire',
    icon: '🔥',
    description: 'Maintain a 7-day learning streak',
    category: 'streak',
    xpReward: 300,
    unlockCondition: { type: 'streak_days', value: 7 },
  },
  {
    id: 'b004',
    name: 'Inferno',
    icon: '🌋',
    description: 'Maintain a 30-day learning streak',
    category: 'streak',
    xpReward: 1000,
    unlockCondition: { type: 'streak_days', value: 30 },
  },
  {
    id: 'b005',
    name: 'SQL Slayer',
    icon: '💉',
    description: 'Complete the Web Hacking course',
    category: 'course',
    xpReward: 500,
    unlockCondition: { type: 'course_completed', value: 'c001' },
  },
  {
    id: 'b006',
    name: 'Packet Phantom',
    icon: '👻',
    description: 'Complete the Network Penetration Testing course',
    category: 'course',
    xpReward: 750,
    unlockCondition: { type: 'course_completed', value: 'c002' },
  },
  {
    id: 'b007',
    name: 'CTF Rookie',
    icon: '🚩',
    description: 'Capture your first flag',
    category: 'ctf',
    xpReward: 200,
    unlockCondition: { type: 'ctf_solved', value: 1 },
  },
  {
    id: 'b008',
    name: 'Flag Collector',
    icon: '🏴',
    description: 'Capture 10 CTF flags',
    category: 'ctf',
    xpReward: 500,
    unlockCondition: { type: 'ctf_solved', value: 10 },
  },
  {
    id: 'b009',
    name: 'CTF Champion',
    icon: '🏆',
    description: 'Capture 50 CTF flags',
    category: 'ctf',
    xpReward: 2000,
    unlockCondition: { type: 'ctf_solved', value: 50 },
  },
  {
    id: 'b010',
    name: 'Knowledge Seeker',
    icon: '📚',
    description: 'Complete 5 courses',
    category: 'course',
    xpReward: 1500,
    unlockCondition: { type: 'courses_completed', value: 5 },
  },
  {
    id: 'b011',
    name: 'Exploit Artist',
    icon: '🎨',
    description: 'Earn 5,000 total XP',
    category: 'xp',
    xpReward: 500,
    unlockCondition: { type: 'xp_earned', value: 5000 },
  },
  {
    id: 'b012',
    name: 'Cipher Breaker',
    icon: '🔐',
    description: 'Complete the Cryptography course',
    category: 'course',
    xpReward: 600,
    unlockCondition: { type: 'course_completed', value: 'c003' },
  },
  {
    id: 'b013',
    name: 'Ghost Protocol',
    icon: '🕶️',
    description: 'Complete the OSINT course',
    category: 'course',
    xpReward: 400,
    unlockCondition: { type: 'course_completed', value: 'c005' },
  },
  {
    id: 'b014',
    name: 'Domain Destroyer',
    icon: '👑',
    description: 'Complete the Active Directory course',
    category: 'course',
    xpReward: 1200,
    unlockCondition: { type: 'course_completed', value: 'c006' },
  },
  {
    id: 'b015',
    name: 'Malware Hunter',
    icon: '🦠',
    description: 'Complete the Malware Analysis course',
    category: 'course',
    xpReward: 1000,
    unlockCondition: { type: 'course_completed', value: 'c004' },
  },
  {
    id: 'b016',
    name: 'Night Owl',
    icon: '🦉',
    description: 'Learn after midnight 5 times',
    category: 'special',
    xpReward: 300,
    unlockCondition: { type: 'special', value: 'midnight_learner' },
  },
  {
    id: 'b017',
    name: 'Speed Demon',
    icon: '⚡',
    description: 'Complete 3 lessons in a single day',
    category: 'special',
    xpReward: 250,
    unlockCondition: { type: 'lessons_per_day', value: 3 },
  },
  {
    id: 'b018',
    name: 'Zero Day',
    icon: '0️⃣',
    description: 'Reach 25,000 XP — Zero Day Master rank',
    category: 'xp',
    xpReward: 5000,
    unlockCondition: { type: 'xp_earned', value: 25000 },
  },
];

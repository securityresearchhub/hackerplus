// Auth service — simulates backend calls with localStorage
import Store from '../core/store/store.js';

const USERS_KEY = 'hp_users';

function getUsers() {
  return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

export const AuthService = {
  async login(email, password) {
    await delay(800);
    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) throw new Error('Invalid email or password');
    const { password: _pw, ...safeUser } = user;
    Store.dispatch({ type: 'AUTH_LOGIN', payload: safeUser });
    return safeUser;
  },

  async register(data) {
    await delay(800);
    const users = getUsers();
    if (users.find(u => u.email === data.email)) {
      throw new Error('Email already registered');
    }
    const user = {
      id: generateId(),
      email: data.email,
      password: data.password,
      username: data.username || data.email.split('@')[0],
      avatar: data.avatar || '🐱‍💻',
      interests: data.interests || [],
      xp: 0,
      streak: 0,
      rank: 'Newbie',
      rankTitle: 'Script Kiddie',
      badges: [],
      joinDate: new Date().toISOString(),
      lastSeen: new Date().toISOString(),
      bio: '',
      dailyGoal: 30,
      learningPath: null,
      firstTime: true,
    };
    users.push(user);
    saveUsers(users);
    const { password: _pw, ...safeUser } = user;
    Store.dispatch({ type: 'AUTH_LOGIN', payload: safeUser });
    return safeUser;
  },

  async logout() {
    Store.dispatch({ type: 'AUTH_LOGOUT' });
  },

  async updateProfile(updates) {
    await delay(400);
    const users = getUsers();
    const { user } = Store.getSlice('auth');
    const idx = users.findIndex(u => u.id === user.id);
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...updates };
      saveUsers(users);
      Store.dispatch({ type: 'AUTH_UPDATE_USER', payload: updates });
    }
    return Store.getSlice('auth').user;
  },

  isAuthenticated() {
    return Store.getSlice('auth').isAuthenticated;
  },

  currentUser() {
    return Store.getSlice('auth').user;
  },

  addXP(amount) {
    const user = Store.getSlice('auth').user;
    if (!user) return;
    const newXP = (user.xp || 0) + amount;
    const rank = calcRank(newXP);
    this.updateProfile({ xp: newXP, rank: rank.name, rankTitle: rank.title });
  },
};

function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function calcRank(xp) {
  if (xp < 500) return { name: 'Newbie', title: 'Script Kiddie' };
  if (xp < 1500) return { name: 'Apprentice', title: 'Packet Sniffer' };
  if (xp < 3000) return { name: 'Hacker', title: 'Exploit Crafter' };
  if (xp < 6000) return { name: 'Elite', title: 'Zero-Day Hunter' };
  if (xp < 12000) return { name: 'Master', title: 'Ghost in the Shell' };
  return { name: 'Legend', title: 'Dark Matter Specialist' };
}

export default AuthService;

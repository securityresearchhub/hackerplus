/**
 * AuthService — Single authority for user registration and credential validation.
 * Persists users in localStorage under 'hp_users'.
 * No Store dependency. No UI logic. Returns typed results only.
 */

const USERS_KEY = 'hp_users';

export interface StoredUser {
  id: string;
  email: string;
  /** NOTE: In a real system this would be a server-side hash. Local-only mock. */
  passwordHash: string;
  username: string;
  displayName: string;
  joinedDate: string;
}

export interface AuthResult {
  success: boolean;
  error?: string;
  user?: Omit<StoredUser, 'passwordHash'>;
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

function getUsers(): StoredUser[] {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveUsers(users: StoredUser[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export const AuthService = {
  /**
   * Registers a new user. Returns an error if the email or username is taken.
   */
  register(username: string, email: string, password: string): AuthResult {
    const users = getUsers();

    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, error: 'This email address is already registered.' };
    }
    if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
      return { success: false, error: 'This callsign (username) is already taken.' };
    }

    const newUser: StoredUser = {
      id: generateId(),
      email: email.trim().toLowerCase(),
      passwordHash: password, // local-only plaintext mock
      username: username.trim(),
      displayName: username.trim(),
      joinedDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    };

    users.push(newUser);
    saveUsers(users);

    const { passwordHash: _, ...safeUser } = newUser;
    return { success: true, user: safeUser };
  },

  /**
   * Validates credentials against the stored user list.
   * Returns an error if the user is not found or password does not match.
   */
  login(email: string, password: string): AuthResult {
    const users = getUsers();
    const match = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());

    if (!match) {
      return { success: false, error: 'No account found with that email address.' };
    }
    if (match.passwordHash !== password) {
      return { success: false, error: 'Incorrect password. Access denied.' };
    }

    const { passwordHash: _, ...safeUser } = match;
    return { success: true, user: safeUser };
  },
};

export default AuthService;

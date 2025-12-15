export interface User {
  email: string;
  name: string;
}

const AUTH_KEY = 'prospera_auth_user';

export const login = (email: string, password: string): User | null => {
  const validUsers = ['filipe@useprospera.com.br', 'cindi@useprospera.com.br'];
  const masterPass = 'R@fa@1307';

  if (validUsers.includes(email) && password === masterPass) {
    const user = { email, name: email.split('@')[0] };
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    return user;
  }
  return null;
};

export const logout = () => {
  localStorage.removeItem(AUTH_KEY);
};

export const getCurrentUser = (): User | null => {
  const userJson = localStorage.getItem(AUTH_KEY);
  return userJson ? JSON.parse(userJson) : null;
};

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem(AUTH_KEY);
};

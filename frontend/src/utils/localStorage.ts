import { AuthState } from '../types/auth.types.tsx';

export const setAuth = (auth: AuthState): void => {
  localStorage.setItem('auth', JSON.stringify(auth));
};

export const getAuth = (): AuthState | null => {
  const auth = localStorage.getItem('auth');
  return auth ? JSON.parse(auth) : null;
};

export const getToken = (): string | null => {
  const auth = getAuth();
  return auth ? auth.token : null;
};

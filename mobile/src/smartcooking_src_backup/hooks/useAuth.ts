import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { setAuth, clearAuth } from '../store';
import { authService } from '../services/authService';

export function useAuth() {
  const dispatch = useDispatch<AppDispatch>();
  const { user, token, isAuthenticated } = useSelector((s: RootState) => s.auth);

  const login = async (email: string, password: string) => {
    const data = await authService.login(email, password);
    dispatch(setAuth({ user: data.user, token: data.accessToken }));
    return data;
  };

  const register = async (name: string, email: string, password: string) => {
    const data = await authService.register(name, email, password);
    dispatch(setAuth({ user: data.user, token: data.accessToken }));
    return data;
  };

  const logout = async () => {
    await authService.logout();
    dispatch(clearAuth());
  };

  return { user, token, isAuthenticated, login, register, logout };
}

// types.ts
interface User {
    id: string;
    email: string;
    username: string;
  }
  
  interface AuthState {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    error: string | null;
  }
  
  interface LoginFormData {
    email: string;
    password: string;
  }
  
  interface SignupFormData {
    email: string;
    username: string;
    password: string;
    confirmPassword: string;
  }
  
  // authContext.tsx
  import React, { createContext, useContext, useReducer, useEffect } from 'react';
  import { jwtDecode } from 'jwt-decode';
  
  const AuthContext = createContext<{
    state: AuthState;
    login: (data: LoginFormData) => Promise<void>;
    signup: (data: SignupFormData) => Promise<void>;
    logout: () => void;
    resetPassword: (email: string) => Promise<void>;
  } | null>(null);
  
  const initialState: AuthState = {
    user: null,
    token: localStorage.getItem('token'),
    isLoading: false,
    error: null,
  };
  
  export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);
  
    useEffect(() => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const decoded = jwtDecode(token);
          dispatch({ type: 'SET_USER', payload: decoded });
        } catch (error) {
          localStorage.removeItem('token');
        }
      }
    }, []);
  
    const login = async (data: LoginFormData) => {
      try {
        dispatch({ type: 'SET_LOADING' });
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        
        if (!response.ok) throw new Error('Login failed');
        
        const { token, user } = await response.json();
        localStorage.setItem('token', token);
        dispatch({ type: 'LOGIN_SUCCESS', payload: { token, user } });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
      }
    };
  
    const signup = async (data: SignupFormData) => {
      try {
        dispatch({ type: 'SET_LOADING' });
        const response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        
        if (!response.ok) throw new Error('Signup failed');
        
        const { token, user } = await response.json();
        localStorage.setItem('token', token);
        dispatch({ type: 'LOGIN_SUCCESS', payload: { token, user } });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
      }
    };
  
    const logout = () => {
      localStorage.removeItem('token');
      dispatch({ type: 'LOGOUT' });
    };
  
    const resetPassword = async (email: string) => {
      try {
        dispatch({ type: 'SET_LOADING' });
        const response = await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
        
        if (!response.ok) throw new Error('Password reset request failed');
        
        dispatch({ type: 'CLEAR_ERROR' });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
      }
    };
  
    return (
      <AuthContext.Provider value={{ state, login, signup, logout, resetPassword }}>
        {children}
      </AuthContext.Provider>
    );
  };
  
  export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
  };
  
  // AuthModal.tsx
  import React, { useState } from 'react';
  import { useForm } from 'react-hook-form';
  import { zodResolver } from '@hookform/resolvers/zod';
  import * as z from 'zod';
  import { useAuth } from './authContext';
  
  const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
  });
  
  const signupSchema = z.object({
    email: z.string().email('Invalid email address'),
    username: z.string().min(3, 'Username must be at least 3 characters'),
    password: z.string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    confirmPassword: z.string(),
  }).refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
  
  const AuthModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const [view, setView] = useState<'login' | 'signup' | 'forgot'>('login');
    const { login, signup, resetPassword, state } = useAuth();
    const { register, handleSubmit, formState: { errors }, reset } = useForm({
      resolver: zodResolver(view === 'login' ? loginSchema : signupSchema),
    });
  
    const onSubmit = async (data: any) => {
      try {
        if (view === 'login') {
          await login(data);
        } else if (view === 'signup') {
          await signup(data);
        } else {
          await resetPassword(data.email);
          alert('If an account exists with this email, you will receive password reset instructions.');
        }
        if (!state.error) {
          reset();
          onClose();
        }
      } catch (error) {
        console.error('Form submission error:', error);
      }
    };
  
    if (!isOpen) return null;
  
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="fixed inset-0 bg-black bg-opacity-30" onClick={onClose} />
        
        <div className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-lg z-50">
          <button 
            onClick={onClose}
            className="absolute right-5 top-5 text-2xl cursor-pointer"
          >
            ×
          </button>
  
          <div className="flex w-full">
            <button
              onClick={() => setView('login')}
              className={`w-1/2 py-6 text-lg font-bold rounded-tl-2xl transition-colors duration-200 
                ${view === 'login' ? 'bg-[#5f9999] text-white' : 'bg-white text-gray-800'}`}
            >
              Log in
            </button>
            <button
              onClick={() => setView('signup')}
              className={`w-1/2 py-6 text-lg font-bold rounded-tr-2xl transition-colors duration-200
                ${view === 'signup' ? 'bg-[#5f9999] text-white' : 'bg-white text-gray-800'}`}
            >
              Sign up
            </button>
          </div>
  
          <div className="p-8">
            {state.error && (
              <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
                {state.error}
              </div>
            )}
  
            {view === 'forgot' ? (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <input
                  {...register('email')}
                  type="email"
                  placeholder="Enter your email"
                  className="w-full px-7 py-5 text-base font-bold bg-gray-200 rounded-full outline-none transition-transform duration-300 focus:scale-[1.02]"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm">{errors.email.message as string}</p>
                )}
                <button
                  type="submit"
                  disabled={state.isLoading}
                  className="w-full py-3 mt-2 text-lg font-bold text-white bg-[#5f9999] rounded-full hover:bg-gray-900 transition-colors duration-300 disabled:opacity-50"
                >
                  {state.isLoading ? 'Sending...' : 'Reset Password'}
                </button>
                <p className="text-center">
                  <button
                    type="button"
                    onClick={() => setView('login')}
                    className="text-[#5f9999] hover:text-gray-900"
                  >
                    Back to login
                  </button>
                </p>
              </form>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <input
                  {...register('email')}
                  type="email"
                  placeholder="Enter email"
                  className="w-full px-7 py-5 text-base font-bold bg-gray-200 rounded-full outline-none transition-transform duration-300 focus:scale-[1.02]"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm">{errors.email.message as string}</p>
                )}
  
                {view === 'signup' && (
                  <>
                    <input
                      {...register('username')}
                      type="text"
                      placeholder="Choose username"
                      className="w-full px-7 py-5 text-base font-bold bg-gray-200 rounded-full outline-none transition-transform duration-300 focus:scale-[1.02]"
                    />
                    {errors.username && (
                      <p className="text-red-500 text-sm">{errors.username.message as string}</p>
                    )}
                  </>
                )}
  
                <input
                  {...register('password')}
                  type="password"
                  placeholder="Enter password"
                  className="w-full px-7 py-5 text-base font-bold bg-gray-200 rounded-full outline-none transition-transform duration-300 focus:scale-[1.02]"
                />
                {errors.password && (
                  <p className="text-red-500 text-sm">{errors.password.message as string}</p>
                )}
  
                {view === 'signup' && (
                  <>
                    <input
                      {...register('confirmPassword')}
                      type="password"
                      placeholder="Confirm password"
                      className="w-full px-7 py-5 text-base font-bold bg-gray-200 rounded-full outline-none transition-transform duration-300 focus:scale-[1.02]"
                    />
                    {errors.confirmPassword && (
                      <p className="text-red-500 text-sm">{errors.confirmPassword.message as string}</p>
                    )}
                  </>
                )}
  
                <button
                  type="submit"
                  disabled={state.isLoading}
                  className="w-full py-3 mt-2 text-lg font-bold text-white bg-[#5f9999] rounded-full hover:bg-gray-900 transition-colors duration-300 disabled:opacity-50"
                >
                  {state.isLoading ? 'Processing...' : view === 'login' ? 'Login' : 'Create Account'}
                </button>
  
                {view === 'login' && (
                  <p className="text-base font-bold mt-4">
                    <button
                      type="button"
                      onClick={() => setView('forgot')}
                      className="text-[#5f9999] hover:text-gray-900 transition-colors duration-200"
                    >
                      Forgot password?
                    </button>
                  </p>
                )}
  
                {view === 'signup' && (
                  <p className="text-base font-bold mt-4">
                    By clicking <strong>Create Account</strong>, you agree to our{' '}
                    <a href="#" className="text-[#5f9999] hover:text-gray-900 transition-colors duration-200">
                      terms of service
                    </a>
                  </p>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
    );
  };
  
  export default AuthModal;
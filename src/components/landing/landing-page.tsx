'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Github,
  Loader2,
  Sparkles,
  ArrowRight,
  Zap,
  Palette,
  FileText,
  Globe,
  Shield,
  Download,
  MousePointer,
  Edit3,
  Rocket,
  Check,
  Menu,
  X,
  UserPlus,
  LogIn,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/store/auth-store';
import { usePortfolioStore } from '@/store/portfolio-store';
import { toast } from 'sonner';
import { ThemeToggle } from '@/components/theme-toggle';
import { cn } from '@/lib/utils';

// Google Icon Component
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

// Error Alert Component
function ErrorAlert({ message, onDismiss }: { message: string; onDismiss?: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg"
    >
      <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-sm text-red-800 dark:text-red-200">{message}</p>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </motion.div>
  );
}

// Password strength indicator
function PasswordStrength({ password }: { password: string }) {
  const getStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 6) score++;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strength = getStrength(password);
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Excellent'];
  const colors = ['', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-emerald-400', 'bg-emerald-600'];

  if (!password) return null;

  return (
    <div className="flex items-center gap-2 mt-1">
      <div className="flex-1 flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i <= strength ? colors[strength] : 'bg-slate-200 dark:bg-slate-700'
            }`}
          />
        ))}
      </div>
      <span className={`text-xs ${strength >= 4 ? 'text-emerald-600' : strength >= 2 ? 'text-yellow-600' : 'text-red-600'}`}>
        {labels[strength]}
      </span>
    </div>
  );
}

interface OAuthStatus {
  github: boolean;
  google: boolean;
}

type AuthView = 'main' | 'signup' | 'login';

interface FormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  name?: string;
  general?: string;
}

// Auth Modal Component
function AuthModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [authView, setAuthView] = useState<AuthView>('main');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<'github' | 'google' | null>(null);
  const [oauthStatus, setOauthStatus] = useState<OAuthStatus>({ github: false, google: false });
  const [errors, setErrors] = useState<FormErrors>({});
  const [oauthError, setOauthError] = useState<string | null>(null);

  const { login } = useAuthStore();
  const { setPortfolio } = usePortfolioStore();

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setAuthView('main');
        setEmail('');
        setPassword('');
        setName('');
        setConfirmPassword('');
        setErrors({});
        setOauthError(null);
      }, 300);
    }
  }, [isOpen]);

  // Clear errors when view changes
  useEffect(() => {
    setErrors({});
    setOauthError(null);
  }, [authView]);

  // Check if OAuth providers are available
  useEffect(() => {
    Promise.all([
      fetch('/api/auth/github').then(res => res.json()),
      fetch('/api/auth/google').then(res => res.json()),
    ])
      .then(([githubData, googleData]) => {
        setOauthStatus({
          github: !githubData.demoMode && githubData.available !== false,
          google: googleData.available === true,
        });
      })
      .catch(() => {
        setOauthStatus({ github: false, google: false });
      });
  }, []);

  // Validate email format
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validate signup form
  const validateSignupForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password.trim()) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate login form
  const validateLoginForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password.trim()) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGitHubOAuth = async () => {
    setLoadingProvider('github');
    setOauthError(null);

    try {
      const response = await fetch('/api/auth/github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ redirect: '/' }),
      });

      const data = await response.json();

      if (!response.ok || data.demoMode) {
        throw new Error(data.message || 'GitHub OAuth is not configured');
      }

      window.location.href = data.redirectUrl;
    } catch (error) {
      console.error('OAuth error:', error);
      const message = error instanceof Error ? error.message : 'Failed to connect to GitHub. Please try again.';
      setOauthError(message);
      toast.error(message);
      setLoadingProvider(null);
    }
  };

  const handleGoogleOAuth = async () => {
    setLoadingProvider('google');
    setOauthError(null);

    try {
      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ redirect: '/' }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Google OAuth is not configured');
      }

      window.location.href = data.redirectUrl;
    } catch (error) {
      console.error('OAuth error:', error);
      const message = error instanceof Error ? error.message : 'Failed to connect to Google. Please try again.';
      setOauthError(message);
      toast.error(message);
      setLoadingProvider(null);
    }
  };

  const handleSignup = async () => {
    if (!validateSignupForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          name: name || email.split('@')[0],
          action: 'signup',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error) {
          if (data.error.includes('already exists')) {
            setErrors({ email: data.error });
          } else {
            setErrors({ general: data.error });
          }
        }
        throw new Error(data.error || 'Failed to create account');
      }

      login(data.user);
      if (data.user.portfolio) {
        setPortfolio(data.user.portfolio);
      }

      toast.success('Account created! Welcome to Signature.');
      onClose();
    } catch (error) {
      console.error('Signup error:', error);
      if (!errors.general && !errors.email) {
        toast.error(error instanceof Error ? error.message : 'Failed to create account');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!validateLoginForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          action: 'login',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error) {
          if (data.error.includes('No account found')) {
            setErrors({ email: data.error });
          } else if (data.error.includes('Incorrect password')) {
            setErrors({ password: data.error });
          } else {
            setErrors({ general: data.error });
          }
        }
        throw new Error(data.error || 'Login failed');
      }

      login(data.user);
      if (data.user.portfolio) {
        setPortfolio(data.user.portfolio);
      }

      toast.success('Welcome back!');
      onClose();
    } catch (error) {
      console.error('Login error:', error);
      if (!errors.general && !errors.email && !errors.password) {
        toast.error(error instanceof Error ? error.message : 'Failed to login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const hasAnyOAuth = oauthStatus.github || oauthStatus.google;
  const isCheckingOAuth = !hasAnyOAuth && authView === 'main';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-md"
          >
            <Card className="border-0 shadow-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl">
              <CardHeader className="text-center pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex-1" />
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                    className="w-14 h-14 mx-auto"
                  >
                    <img
                      src="/logo.png"
                      alt="Signature"
                      className="w-14 h-14 rounded-2xl object-contain shadow-lg"
                    />
                  </motion.div>
                  <button
                    onClick={onClose}
                    className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <X className="w-5 h-5 text-slate-500" />
                  </button>
                </div>
                <CardTitle className="text-xl font-bold mt-2">
                  <span className="bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                    Signature
                  </span>
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">
                  Your professional portfolio builder
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                {isCheckingOAuth ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                  </div>
                ) : (
                  <AnimatePresence mode="wait">
                    {authView === 'main' ? (
                      <motion.div
                        key="main-view"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-3"
                      >
                        {oauthError && (
                          <ErrorAlert message={oauthError} onDismiss={() => setOauthError(null)} />
                        )}

                        {hasAnyOAuth && (
                          <>
                            {oauthStatus.github && (
                              <Button
                                onClick={handleGitHubOAuth}
                                disabled={loadingProvider !== null}
                                className="w-full h-12 bg-gradient-to-r from-slate-900 to-slate-700 hover:from-slate-800 hover:to-slate-600 dark:from-white dark:to-slate-200 dark:text-slate-900 shadow-lg"
                              >
                                {loadingProvider === 'github' ? (
                                  <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                  <>
                                    <Github className="w-5 h-5 mr-2" />
                                    Continue with GitHub
                                  </>
                                )}
                              </Button>
                            )}

                            {oauthStatus.google && (
                              <Button
                                onClick={handleGoogleOAuth}
                                disabled={loadingProvider !== null}
                                variant="outline"
                                className="w-full h-12 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-md"
                              >
                                {loadingProvider === 'google' ? (
                                  <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                  <>
                                    <GoogleIcon className="w-5 h-5 mr-2" />
                                    Continue with Google
                                  </>
                                )}
                              </Button>
                            )}

                            <div className="relative">
                              <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-slate-200 dark:border-slate-700" />
                              </div>
                              <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white dark:bg-slate-900 px-2 text-slate-500">or</span>
                              </div>
                            </div>
                          </>
                        )}

                        <Button
                          variant="outline"
                          onClick={() => setAuthView('signup')}
                          className="w-full h-12 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400"
                        >
                          <UserPlus className="w-5 h-5 mr-2" />
                          Sign up with Email
                        </Button>

                        <Button
                          variant="ghost"
                          onClick={() => setAuthView('login')}
                          className="w-full h-12 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                        >
                          <LogIn className="w-5 h-5 mr-2" />
                          Login with Email
                        </Button>
                      </motion.div>
                    ) : authView === 'signup' ? (
                      <motion.div
                        key="signup-view"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-3"
                      >
                        <div className="flex items-center gap-2 mb-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setAuthView('main')}
                            className="p-0 h-auto"
                          >
                            <ArrowLeft className="w-4 h-4 mr-1" />
                            Back
                          </Button>
                        </div>

                        <div className="space-y-1 mb-4">
                          <h3 className="text-lg font-semibold">Create your account</h3>
                          <p className="text-sm text-slate-500">Enter your details to get started</p>
                        </div>

                        {errors.general && <ErrorAlert message={errors.general} />}

                        <div className="space-y-1">
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                              type="email"
                              placeholder="Email address"
                              value={email}
                              onChange={(e) => {
                                setEmail(e.target.value);
                                if (errors.email) setErrors({ ...errors, email: undefined });
                              }}
                              className={cn(
                                'h-11 pl-10 bg-slate-50 dark:bg-slate-800',
                                errors.email ? 'border-red-500 focus-visible:ring-red-500' : 'border-slate-200 dark:border-slate-700'
                              )}
                            />
                          </div>
                          {errors.email && (
                            <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              {errors.email}
                            </p>
                          )}
                        </div>

                        <Input
                          placeholder="Full name (optional)"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="h-11 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                        />

                        <div className="space-y-1">
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                              type={showPassword ? 'text' : 'password'}
                              placeholder="Password (min 6 characters)"
                              value={password}
                              onChange={(e) => {
                                setPassword(e.target.value);
                                if (errors.password) setErrors({ ...errors, password: undefined });
                              }}
                              className={cn(
                                'h-11 pl-10 pr-10 bg-slate-50 dark:bg-slate-800',
                                errors.password ? 'border-red-500 focus-visible:ring-red-500' : 'border-slate-200 dark:border-slate-700'
                              )}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                          {password && <PasswordStrength password={password} />}
                          {errors.password && (
                            <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              {errors.password}
                            </p>
                          )}
                        </div>

                        <div className="space-y-1">
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                              type={showPassword ? 'text' : 'password'}
                              placeholder="Confirm password"
                              value={confirmPassword}
                              onChange={(e) => {
                                setConfirmPassword(e.target.value);
                                if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined });
                              }}
                              onKeyDown={(e) => e.key === 'Enter' && handleSignup()}
                              className={cn(
                                'h-11 pl-10 bg-slate-50 dark:bg-slate-800',
                                errors.confirmPassword ? 'border-red-500 focus-visible:ring-red-500' : 'border-slate-200 dark:border-slate-700'
                              )}
                            />
                          </div>
                          {errors.confirmPassword && (
                            <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              {errors.confirmPassword}
                            </p>
                          )}
                        </div>

                        <Button
                          onClick={handleSignup}
                          disabled={isLoading}
                          className="w-full h-11 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg"
                        >
                          {isLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            'Create Account'
                          )}
                        </Button>

                        <p className="text-center text-sm text-slate-500">
                          Already have an account?{' '}
                          <button
                            onClick={() => setAuthView('login')}
                            className="text-emerald-600 hover:text-emerald-700 font-medium"
                          >
                            Login
                          </button>
                        </p>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="login-view"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-3"
                      >
                        <div className="flex items-center gap-2 mb-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setAuthView('main')}
                            className="p-0 h-auto"
                          >
                            <ArrowLeft className="w-4 h-4 mr-1" />
                            Back
                          </Button>
                        </div>

                        <div className="space-y-1 mb-4">
                          <h3 className="text-lg font-semibold">Welcome back</h3>
                          <p className="text-sm text-slate-500">Enter your credentials to login</p>
                        </div>

                        {errors.general && <ErrorAlert message={errors.general} />}

                        <div className="space-y-1">
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                              type="email"
                              placeholder="Email address"
                              value={email}
                              onChange={(e) => {
                                setEmail(e.target.value);
                                if (errors.email) setErrors({ ...errors, email: undefined });
                              }}
                              className={cn(
                                'h-11 pl-10 bg-slate-50 dark:bg-slate-800',
                                errors.email ? 'border-red-500 focus-visible:ring-red-500' : 'border-slate-200 dark:border-slate-700'
                              )}
                            />
                          </div>
                          {errors.email && (
                            <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              {errors.email}
                            </p>
                          )}
                        </div>

                        <div className="space-y-1">
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                              type={showPassword ? 'text' : 'password'}
                              placeholder="Password"
                              value={password}
                              onChange={(e) => {
                                setPassword(e.target.value);
                                if (errors.password) setErrors({ ...errors, password: undefined });
                              }}
                              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                              className={cn(
                                'h-11 pl-10 pr-10 bg-slate-50 dark:bg-slate-800',
                                errors.password ? 'border-red-500 focus-visible:ring-red-500' : 'border-slate-200 dark:border-slate-700'
                              )}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                          {errors.password && (
                            <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              {errors.password}
                            </p>
                          )}
                        </div>

                        <Button
                          onClick={handleLogin}
                          disabled={isLoading}
                          className="w-full h-11 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg"
                        >
                          {isLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            'Login'
                          )}
                        </Button>

                        <p className="text-center text-sm text-slate-500">
                          Don&apos;t have an account?{' '}
                          <button
                            onClick={() => setAuthView('signup')}
                            className="text-emerald-600 hover:text-emerald-700 font-medium"
                          >
                            Sign up
                          </button>
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Feature Card Component
function FeatureCard({
  icon: Icon,
  title,
  description,
  index,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-xl hover:border-emerald-200 dark:hover:border-emerald-800 transition-all duration-300"
    >
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/25 group-hover:scale-110 transition-transform duration-300">
          <Icon className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{title}</h3>
        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}

// Step Card Component
function StepCard({
  number,
  title,
  description,
  icon: Icon,
  index,
}: {
  number: number;
  title: string;
  description: string;
  icon: React.ElementType;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.15 }}
      className="relative flex flex-col items-center text-center"
    >
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-xl shadow-emerald-500/30">
          <Icon className="w-8 h-8 text-white" />
        </div>
        <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-white dark:bg-slate-900 border-2 border-emerald-500 flex items-center justify-center font-bold text-emerald-600 text-sm">
          {number}
        </div>
      </div>
      <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">{title}</h3>
      <p className="text-slate-600 dark:text-slate-400 text-sm max-w-xs">{description}</p>
      {index < 2 && (
        <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-emerald-500/50 to-transparent" />
      )}
    </motion.div>
  );
}

// Value Item Component
function ValueItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
        <Check className="w-3 h-3 text-emerald-600" />
      </div>
      <span className="text-slate-700 dark:text-slate-300 text-sm">{text}</span>
    </div>
  );
}

// Main Landing Page Component
export function LandingPage() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const features = [
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Build your professional portfolio in minutes, not hours. Our intuitive editor makes portfolio creation a breeze.',
    },
    {
      icon: Palette,
      title: 'Beautiful Themes',
      description: 'Choose from stunning templates and customize colors, fonts, and layouts to match your personal brand.',
    },
    {
      icon: FileText,
      title: 'ATS-Ready Resumes',
      description: 'Generate optimized PDF resumes that pass applicant tracking systems and land you more interviews.',
    },
    {
      icon: Globe,
      title: 'Public Portfolios',
      description: 'Publish your portfolio with a unique URL and share it with recruiters, clients, and collaborators.',
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your data is encrypted and protected. Control what you share and keep your information safe.',
    },
    {
      icon: Download,
      title: 'Export Anywhere',
      description: 'Download your portfolio as PDF, share via link, or integrate with your existing workflow.',
    },
  ];

  const steps = [
    {
      icon: UserPlus,
      title: 'Create Your Account',
      description: 'Sign up in seconds with GitHub, Google, or email. No credit card required.',
    },
    {
      icon: Edit3,
      title: 'Build Your Portfolio',
      description: 'Add your experience, skills, projects, and education with our intuitive editor.',
    },
    {
      icon: Rocket,
      title: 'Share & Stand Out',
      description: 'Publish your portfolio, download your resume, and land your dream job.',
    },
  ];

  const values = [
    'Professional portfolio website',
    'ATS-optimized resume PDF',
    'Custom domain support',
    'Multiple theme options',
    'GitHub integration',
    'Real-time preview',
    'Mobile responsive design',
    'Unlimited updates',
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Signature" className="w-9 h-9 rounded-xl object-contain" />
              <span className="font-bold text-xl text-slate-900 dark:text-white">Signature</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                Features
              </a>
              <a href="#how-it-works" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                How It Works
              </a>
              <a href="#value" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                What We Provide
              </a>
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-3">
              <ThemeToggle />
              <Button
                variant="ghost"
                onClick={() => setAuthModalOpen(true)}
                className="text-slate-600 dark:text-slate-400"
              >
                Login
              </Button>
              <Button
                onClick={() => setAuthModalOpen(true)}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/25"
              >
                Get Started <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden items-center gap-2">
              <ThemeToggle />
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800"
            >
              <div className="px-4 py-4 space-y-3">
                <a
                  href="#features"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-sm font-medium text-slate-600 dark:text-slate-400 py-2"
                >
                  Features
                </a>
                <a
                  href="#how-it-works"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-sm font-medium text-slate-600 dark:text-slate-400 py-2"
                >
                  How It Works
                </a>
                <a
                  href="#value"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-sm font-medium text-slate-600 dark:text-slate-400 py-2"
                >
                  What We Provide
                </a>
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex gap-3">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setAuthModalOpen(true);
                    }}
                    className="flex-1"
                  >
                    Login
                  </Button>
                  <Button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setAuthModalOpen(true);
                    }}
                    className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
                  >
                    Get Started
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-emerald-950/20 dark:via-slate-950 dark:to-teal-950/20" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                Build your professional presence in minutes
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6 leading-tight"
            >
              Create Stunning Portfolios{' '}
              <span className="bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent">
                That Get You Hired
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto"
            >
              Build a professional portfolio website and ATS-optimized resume that showcases your skills, 
              experience, and projects. Stand out from the crowd and land your dream job.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Button
                size="lg"
                onClick={() => setAuthModalOpen(true)}
                className="w-full sm:w-auto h-14 px-8 text-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-xl shadow-emerald-500/25 group"
              >
                Start Building Free
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <a
                href="#features"
                className="w-full sm:w-auto h-14 px-8 text-lg font-medium text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center justify-center gap-2 transition-colors"
              >
                <MousePointer className="w-5 h-5" />
                See How It Works
              </a>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500 dark:text-slate-400"
            >
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500" />
                Free forever plan
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500" />
                No credit card required
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500" />
                Export anytime
              </div>
            </motion.div>
          </div>

          {/* Hero Image/Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="mt-16 relative"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-slate-50 dark:from-slate-950 to-transparent z-10 pointer-events-none" />
            <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden mx-auto max-w-5xl">
              <div className="h-8 bg-slate-100 dark:bg-slate-800 flex items-center gap-2 px-4">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="p-8 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Sidebar mockup */}
                  <div className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-800">
                    <div className="space-y-3">
                      <div className="h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg w-full" />
                      <div className="h-6 bg-slate-100 dark:bg-slate-800 rounded w-3/4" />
                      <div className="h-6 bg-slate-100 dark:bg-slate-800 rounded w-1/2" />
                      <div className="h-6 bg-slate-100 dark:bg-slate-800 rounded w-2/3" />
                    </div>
                  </div>
                  {/* Main content mockup */}
                  <div className="md:col-span-2 bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500" />
                      <div>
                        <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-32 mb-2" />
                        <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-48" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-full" />
                      <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-5/6" />
                      <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-4/6" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Everything You Need to{' '}
              <span className="bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent">
                Stand Out
              </span>
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Powerful features designed to help you create a professional presence that gets noticed by recruiters and hiring managers.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              How It{' '}
              <span className="bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent">
                Works
              </span>
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Get your professional portfolio up and running in three simple steps.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
            {steps.map((step, index) => (
              <StepCard key={index} {...step} number={index + 1} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* What We Provide Section */}
      <section id="value" className="py-20 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-2 lg:order-1"
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                What You Get with{' '}
                <span className="bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent">
                  Signature
                </span>
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
                Everything you need to create a professional online presence that helps you stand out and get hired.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {values.map((value, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <ValueItem text={value} />
                  </motion.div>
                ))}
              </div>

              <Button
                size="lg"
                onClick={() => setAuthModalOpen(true)}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-xl shadow-emerald-500/25"
              >
                Get Started Free <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-1 lg:order-2"
            >
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl blur-2xl opacity-20" />
                <div className="relative bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-8 text-white">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Free Forever</h3>
                      <p className="text-emerald-100 text-sm">No hidden fees</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                      <div className="text-3xl font-bold mb-1">$0</div>
                      <div className="text-emerald-100 text-sm">Full access to all features</div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Portfolio website</span>
                      <Check className="w-4 h-4" />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Resume export</span>
                      <Check className="w-4 h-4" />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Custom themes</span>
                      <Check className="w-4 h-4" />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Public URL</span>
                      <Check className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-emerald-500 to-teal-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to Build Your Professional Portfolio?
            </h2>
            <p className="text-lg text-emerald-100 mb-8 max-w-2xl mx-auto">
              Join thousands of professionals who have already created stunning portfolios with Signature. Start for free today.
            </p>
            <Button
              size="lg"
              onClick={() => setAuthModalOpen(true)}
              className="bg-white text-emerald-600 hover:bg-emerald-50 shadow-xl px-8"
            >
              Start Building Free <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 dark:bg-slate-950 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <img src="/logo.png" alt="Signature" className="w-9 h-9 rounded-xl object-contain" />
                <span className="font-bold text-xl">Signature</span>
              </div>
              <p className="text-slate-400 text-sm mb-4 max-w-sm">
                Build professional portfolios and ATS-optimized resumes that help you stand out and get hired.
              </p>
              <div className="flex items-center gap-3">
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors"
                >
                  <Github className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Links */}
            <div>
              <h3 className="font-semibold text-sm uppercase tracking-wider text-slate-400 mb-4">Product</h3>
              <ul className="space-y-3">
                <li>
                  <a href="#features" className="text-slate-300 hover:text-white text-sm transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#how-it-works" className="text-slate-300 hover:text-white text-sm transition-colors">
                    How It Works
                  </a>
                </li>
                <li>
                  <a href="#value" className="text-slate-300 hover:text-white text-sm transition-colors">
                    Pricing
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="font-semibold text-sm uppercase tracking-wider text-slate-400 mb-4">Legal</h3>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-slate-300 hover:text-white text-sm transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-300 hover:text-white text-sm transition-colors">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-300 hover:text-white text-sm transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-slate-400 text-sm">
              © {new Date().getFullYear()} Signature. All rights reserved.
            </p>
            <p className="text-slate-500 text-sm">
              Made with{' '}
              <span className="text-emerald-500">♥</span>
              {' '}for professionals worldwide
            </p>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Github, Loader2, Sparkles, AlertCircle, Eye, EyeOff, ArrowLeft, Mail, Lock, UserPlus, LogIn, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/store/auth-store';
import { usePortfolioStore } from '@/store/portfolio-store';
import { toast } from 'sonner';

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
          <XCircle className="w-4 h-4" />
        </button>
      )}
    </motion.div>
  );
}

// Success Alert Component
function SuccessAlert({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-start gap-3 p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-lg"
    >
      <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
      <p className="text-sm text-emerald-800 dark:text-emerald-200">{message}</p>
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

export function GitHubLogin() {
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

  // Check for auth cookies on mount
  useEffect(() => {
    const userDataCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('user_data='));

    const portfolioDataCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('portfolio_data='));

    if (userDataCookie) {
      try {
        const userData = JSON.parse(decodeURIComponent(userDataCookie.split('=')[1]));
        login(userData);

        if (portfolioDataCookie) {
          const portfolioData = JSON.parse(decodeURIComponent(portfolioDataCookie.split('=')[1]));
          setPortfolio(portfolioData);
        }
      } catch (e) {
        console.error('Failed to parse auth cookies:', e);
      }
    }
  }, [login, setPortfolio]);

  // Check for error in URL (from OAuth callback)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get('error');
    const provider = params.get('provider');

    if (error) {
      const errorMessages: Record<string, string> = {
        'oauth_not_configured': `${provider ? provider.charAt(0).toUpperCase() + provider.slice(1) : 'OAuth'} authentication is not configured. Please contact the administrator.`,
        'invalid_auth': 'Authentication failed - the request was invalid or expired. Please try again.',
        'token_error': 'Failed to retrieve authentication token. Please try again.',
        'user_fetch_error': 'Failed to retrieve your profile information. Please try again.',
        'auth_failed': 'Authentication failed. Please try again.',
        'access_denied': 'You denied access to your account. Please approve the request to continue.',
        'redirect_uri_mismatch': 'Authentication configuration error. Please contact support.',
      };

      const message = errorMessages[error] || 'An unexpected error occurred during authentication. Please try again.';
      setOauthError(message);
      toast.error(message);

      // Clear error from URL
      window.history.replaceState({}, '', '/');
    }
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

      // Redirect to GitHub OAuth
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

      // Redirect to Google OAuth
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
          // Check for specific error types
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

      toast.success('Account created! Welcome to Portfolio Generator.');
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
          // Check for specific error types
          if (data.error.includes('No account found')) {
            setErrors({ email: data.error });
          } else if (data.error.includes('Incorrect password')) {
            setErrors({ password: data.error });
          } else if (data.useOAuth) {
            setErrors({ general: data.error });
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-0 shadow-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
          <CardHeader className="text-center pb-2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 10 }}
              className="w-16 h-16 mx-auto mb-4"
            >
              <img 
                src="/logo.png" 
                alt="Portfolio Generator" 
                className="w-16 h-16 rounded-2xl object-contain shadow-lg"
              />
            </motion.div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
              Signature
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400 mt-2">
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
                    {/* OAuth Error Alert */}
                    {oauthError && (
                      <ErrorAlert message={oauthError} onDismiss={() => setOauthError(null)} />
                    )}

                    {/* OAuth Buttons */}
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

                    {/* Email Auth Buttons */}
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

                    {/* General Error */}
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
                          className={`h-11 pl-10 bg-slate-50 dark:bg-slate-800 ${
                            errors.email ? 'border-red-500 focus-visible:ring-red-500' : 'border-slate-200 dark:border-slate-700'
                          }`}
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
                          className={`h-11 pl-10 pr-10 bg-slate-50 dark:bg-slate-800 ${
                            errors.password ? 'border-red-500 focus-visible:ring-red-500' : 'border-slate-200 dark:border-slate-700'
                          }`}
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
                          className={`h-11 pl-10 bg-slate-50 dark:bg-slate-800 ${
                            errors.confirmPassword ? 'border-red-500 focus-visible:ring-red-500' : 'border-slate-200 dark:border-slate-700'
                          }`}
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

                    {/* General Error */}
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
                          className={`h-11 pl-10 bg-slate-50 dark:bg-slate-800 ${
                            errors.email ? 'border-red-500 focus-visible:ring-red-500' : 'border-slate-200 dark:border-slate-700'
                          }`}
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
                          className={`h-11 pl-10 pr-10 bg-slate-50 dark:bg-slate-800 ${
                            errors.password ? 'border-red-500 focus-visible:ring-red-500' : 'border-slate-200 dark:border-slate-700'
                          }`}
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

        <p className="text-center text-sm text-slate-500 mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </motion.div>
    </div>
  );
}

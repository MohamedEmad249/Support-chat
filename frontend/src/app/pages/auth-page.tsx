import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { MessageCircle, Mail, Lock, User } from 'lucide-react';
import { useAuth } from '../../features/auth/AuthProvider';
import { supabase } from '../../lib/supabaseClient';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isConfirmationPending, setIsConfirmationPending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resending, setResending] = useState(false);
  
  const navigate = useNavigate();
  const { session, profile, loading, signIn, signUp } = useAuth();

  useEffect(() => {
    if (!loading && session && profile) {
      navigate('/dashboard', { replace: true });
    }
  }, [loading, session, profile, navigate]);

  useEffect(() => {
    let timer: any;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [resendCooldown]);

  const handleResend = async () => {
    if (resendCooldown > 0 || resending) return;
    setResending(true);
    setResendSuccess(false);
    setError(null);
    try {
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim().toLowerCase(),
      });
      if (resendError) throw resendError;
      setResendSuccess(true);
      setResendCooldown(60);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      if (errMsg.toLowerCase().includes('rate limit') || errMsg.toLowerCase().includes('limit exceeded')) {
        setError("Verification email limit exceeded. Supabase free tier built-in SMTP has a strict limit of 3 emails/hour. Please disable 'Confirm email' under 'Authentication' → 'Settings' in your Supabase Dashboard to bypass this.");
      } else {
        setError(errMsg);
      }
    } finally {
      setResending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (isLogin) {
        try {
          await signIn(email, password);
          navigate('/dashboard', { replace: true });
        } catch (signInErr: any) {
          const errMsg = signInErr instanceof Error ? signInErr.message : String(signInErr);
          if (errMsg.toLowerCase().includes('email not confirmed') || errMsg.toLowerCase().includes('confirm')) {
            setIsConfirmationPending(true);
            return;
          }
          throw signInErr;
        }
      } else {
        if (!fullName.trim()) {
          setError('Please enter your full name');
          setSubmitting(false);
          return;
        }
        const result = await signUp(email, password, fullName);
        if (result && result.session) {
          navigate('/dashboard', { replace: true });
        } else {
          setIsConfirmationPending(true);
        }
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      if (errMsg.toLowerCase().includes('rate limit') || errMsg.toLowerCase().includes('limit exceeded')) {
        setError("Sign-up email limit exceeded. Supabase free tier built-in SMTP has a strict limit of 3 emails/hour. Please disable 'Confirm email' under 'Authentication' → 'Settings' in your Supabase Dashboard to allow instant testing.");
      } else {
        setError(errMsg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (isConfirmationPending) {
    return (
      <div className="min-h-screen flex">
        {/* Left decoration panel (matching AuthPage style) */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 p-12 flex-col justify-between text-white">
          <div>
            <div className="flex items-center gap-3 mb-12">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <MessageCircle className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold">UniSupport</h1>
                <p className="text-blue-200 text-sm">Student Support Platform</p>
              </div>
            </div>

            <div className="space-y-8 max-w-md">
              <div>
                <h2 className="text-4xl font-semibold mb-4">
                  Verify your account
                </h2>
                <p className="text-blue-100 text-lg">
                  Confirm your email to gain access to our live assistance and portal features.
                </p>
              </div>
            </div>
          </div>

          <div className="text-blue-200 text-sm">© 2026 UniSupport</div>
        </div>

        {/* Right validation panel */}
        <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
          <div className="w-full max-w-md">
            <Card className="border-0 shadow-lg overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-blue-500 to-blue-600" />
              <CardHeader className="space-y-4 pb-6 text-center">
                <div className="mx-auto w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center relative">
                  {/* Subtle breathing ring animation for Mail icon */}
                  <span className="absolute inset-0 rounded-full bg-blue-400/20 animate-ping" />
                  <Mail className="w-8 h-8 relative z-10" />
                </div>
                <div className="space-y-2">
                  <CardTitle className="text-2xl font-bold text-gray-900">Verify your email</CardTitle>
                  <CardDescription className="text-gray-500 px-2">
                    We sent a verification link to <span className="font-semibold text-gray-900 break-all">{email}</span>.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-sm text-gray-600 text-center leading-relaxed">
                  Please click the link in that email to confirm your account and log in. 
                  Don't see it? Be sure to check your spam folder.
                </p>

                {error && (
                  <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 text-center">
                    {error}
                  </p>
                )}

                {resendSuccess && (
                  <p className="text-sm text-green-600 bg-green-50 border border-green-100 rounded-lg px-3 py-2 text-center font-medium flex items-center justify-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    New verification link sent!
                  </p>
                )}

                <div className="space-y-3">
                  <Button
                    type="button"
                    onClick={handleResend}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm transition-all"
                    disabled={resendCooldown > 0 || resending}
                  >
                    {resending ? (
                      'Sending link...'
                    ) : resendCooldown > 0 ? (
                      `Resend in ${resendCooldown}s`
                    ) : (
                      'Resend verification email'
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => {
                      setIsConfirmationPending(false);
                      setIsLogin(true);
                      setResendSuccess(false);
                      setError(null);
                    }}
                    className="w-full border-gray-200 hover:bg-gray-50 text-gray-700 font-medium"
                  >
                    Back to Sign In
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 p-12 flex-col justify-between text-white">
        <div>
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <MessageCircle className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold">UniSupport</h1>
              <p className="text-blue-200 text-sm">Student Support Platform</p>
            </div>
          </div>

          <div className="space-y-8 max-w-md">
            <div>
              <h2 className="text-4xl font-semibold mb-4">
                24/7 Support for University Students
              </h2>
              <p className="text-blue-100 text-lg">
                Connect with support agents to resolve your queries.
              </p>
            </div>
          </div>
        </div>

        <div className="text-blue-200 text-sm">© 2026 UniSupport</div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          <Card className="border-0 shadow-lg">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-2xl">
                {isLogin ? 'Welcome back' : 'Create an account'}
              </CardTitle>
              <CardDescription>
                {isLogin
                  ? 'Sign in with your demo or registered account'
                  : 'Create your student account'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="Alex Student"
                        className="pl-10 bg-white"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required={!isLogin}
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@university.edu"
                      className="pl-10 bg-white"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-10 bg-white"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                {error && (
                  <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                    {error}
                  </p>
                )}

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={submitting}
                >
                  {submitting
                    ? isLogin
                      ? 'Signing in...'
                      : 'Creating account...'
                    : isLogin
                      ? 'Sign In'
                      : 'Sign Up'}
                </Button>
              </form>


              <div className="text-center text-sm text-gray-500">
                {isLogin ? "Don't have an account? " : 'Already have an account? '}
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError(null);
                  }}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  {isLogin ? 'Sign up' : 'Sign in'}
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

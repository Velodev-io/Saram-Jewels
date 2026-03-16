import React from 'react';
import { useSignIn } from '@clerk/clerk-react';
import { Link, useNavigate } from 'react-router-dom';

/* ── Sparkle Component ── */
const SparkleStar = ({ style }) => (
  <svg className="sparkle" style={style} viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M80 0C80 0 84.5 59.5 160 80C160 80 84.5 100.5 80 160C80 160 75.5 100.5 0 80C0 80 75.5 59.5 80 0Z" fill="currentColor"/>
  </svg>
);

const SignInPage = () => {
  const { isLoaded, signIn, setActive } = useSignIn();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLoaded) return;

    setLoading(true);
    setError('');

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        navigate('/');
      } else {
        console.log(result);
        setError('Verification required. Please use the standard sign-in for additional steps.');
      }
    } catch (err) {
      console.error('Sign in error:', err);
      setError(err.errors?.[0]?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    if (!isLoaded) return;
    signIn.authenticateWithRedirect({
      strategy: 'oauth_google',
      redirectUrl: '/sso-callback',
      redirectUrlComplete: '/',
    });
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-[#bae6fd]/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-[#e2e8f0]/5 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10 animate-fade-in-up">
        {/* Logo and Greeting */}
        <div className="text-center">
            <Link to="/" className="inline-flex items-center gap-3 group transition-transform hover:scale-105 mb-8">
              <div className="w-12 h-12 rounded-full border border-[#e2e8f0]/30 flex items-center justify-center text-[#e2e8f0] group-hover:border-[#e2e8f0] group-hover:shadow-[0_0_20px_rgba(226,232,240,0.4)] transition-all duration-300 relative">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path d="M12 2L2 8l10 14L22 8z" />
                </svg>
                <SparkleStar style={{ top: '-8px', right: '-8px', width: '12px', height: '12px' }} />
              </div>
              <div className="text-left">
                <div className="font-display font-bold text-2xl text-[#ffffff] tracking-[0.15em] leading-none">
                  SARAM
                </div>
                <div className="text-[10px] font-semibold tracking-[0.3em] text-[#e2e8f0] uppercase mt-0.5">
                  Jewels
                </div>
              </div>
            </Link>
          
          <h2 className="text-4xl font-display font-bold text-[#f8fafc] tracking-tight">
            Welcome Back
          </h2>
          <p className="mt-3 text-sm text-[#94a3b8] tracking-wide">
            Sign in to continue your luxury experience
          </p>
        </div>
        
        <div className="glass p-8 rounded-3xl border border-[rgba(226,232,240,0.2)] shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full bg-[#0f172a] border border-[#334155] text-[#f8fafc] hover:bg-[#1e293b] hover:border-[#e2e8f0]/30 h-11 transition-all rounded-xl flex items-center justify-center gap-3 font-medium text-sm"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </button>

            <div className="flex items-center gap-4 py-2">
              <div className="h-[1px] flex-1 bg-[rgba(226,232,240,0.15)]"></div>
              <span className="text-[#64748b] text-[10px] font-bold uppercase tracking-widest">or</span>
              <div className="h-[1px] flex-1 bg-[rgba(226,232,240,0.15)]"></div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[#e2e8f0] text-[10px] font-bold uppercase tracking-[0.2em] mb-2 block ml-1">
                  Email or Username
                </label>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-dark h-12"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div>
                <label className="text-[#e2e8f0] text-[10px] font-bold uppercase tracking-[0.2em] mb-2 block ml-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-dark h-12"
                  placeholder="••••••••"
                  required
                />
              </div>

              {error && (
                <div className="text-red-400 text-xs mt-2 ml-1 animate-pulse">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-silver w-full mt-6 py-4 rounded-xl text-sm tracking-[0.2em] disabled:opacity-50"
              >
                {loading ? 'AUTHENTICATING...' : 'SIGN IN'}
              </button>
            </div>

            <div className="text-center pt-4">
              <p className="text-[#94a3b8] text-sm">
                No account?{' '}
                <Link to="/sign-up" className="text-[#bae6fd] hover:text-[#f8fafc] font-medium transition-colors ml-1">
                  Sign up
                </Link>
              </p>
            </div>
          </form>
        </div>

        {/* Floating Sparkles around the card */}
        <SparkleStar style={{ top: '20%', right: '5%', width: '15px', height: '15px', animationDelay: '0.5s' }} />
        <SparkleStar style={{ bottom: '15%', left: '8%', width: '10px', height: '10px', animationDelay: '1.2s' }} />
      </div>
    </div>
  );
};

export default SignInPage;

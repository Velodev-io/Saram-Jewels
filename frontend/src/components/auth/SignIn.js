import React, { useState } from 'react';
import { useSignIn } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import SocialGoogleButton from './SocialGoogleButton';

/* ── Sparkle Component ── */
const SparkleStar = ({ style }) => (
  <svg className="sparkle" style={style} viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M80 0C80 0 84.5 59.5 160 80C160 80 84.5 100.5 80 160C80 160 75.5 100.5 0 80C0 80 75.5 59.5 80 0Z" fill="currentColor"/>
  </svg>
);

const SignInPage = () => {
  const { isLoaded, signIn, setActive } = useSignIn();
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [signInLoading, setSignInLoading] = useState(false);
  const [signInError, setSignInError] = useState('');

  const handleGoogleAuth = async () => {
    if (!isLoaded || !signIn) return;

    try {
      setGoogleLoading(true);
      setGoogleError('');

      await signIn.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: '/sso-callback',
        redirectUrlComplete: '/',
        continueSignUp: true,
      });
    } catch (error) {
      const message =
        error?.errors?.[0]?.longMessage ||
        error?.errors?.[0]?.message ||
        error?.message ||
        'Google sign-in could not be started.';

      setGoogleError(message);
      setGoogleLoading(false);
    }
  };

  const handlePasswordSignIn = async (event) => {
    event.preventDefault();

    if (!isLoaded || !signIn || !setActive) return;

    try {
      setSignInLoading(true);
      setSignInError('');

      const result = await signIn.create({
        identifier: identifier.trim(),
        password,
        strategy: 'password',
      });

      if (result.status === 'complete' && result.createdSessionId) {
        await setActive({ session: result.createdSessionId });
        window.location.href = '/';
        return;
      }

      setSignInError('Sign-in needs another verification step. Please try Google or continue with Clerk prompts.');
    } catch (error) {
      const message =
        error?.errors?.[0]?.longMessage ||
        error?.errors?.[0]?.message ||
        error?.message ||
        'Email/username and password sign-in failed.';

      setSignInError(message);
    } finally {
      setSignInLoading(false);
    }
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
        
        <div className="glass p-4 sm:p-8 rounded-3xl border border-[rgba(226,232,240,0.2)] shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <div className="mb-5">
            <SocialGoogleButton
              onClick={handleGoogleAuth}
              disabled={!isLoaded}
              loading={googleLoading}
            />
            {googleError ? (
              <p className="mt-3 text-xs text-[#fde68a]">{googleError}</p>
            ) : null}
          </div>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[rgba(226,232,240,0.15)]" />
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-[0.2em]">
              <span className="bg-[#16181d] px-4 text-[#64748b]">or</span>
            </div>
          </div>

          <form onSubmit={handlePasswordSignIn} className="space-y-5">
            <div>
              <label className="text-[#e2e8f0] text-xs font-semibold uppercase tracking-widest mb-1.5 ml-1 block">
                Email Address Or Username
              </label>
              <input
                type="text"
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                placeholder="Enter email or username"
                autoComplete="username"
                className="input-dark mb-1 h-11 w-full"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[#e2e8f0] text-xs font-semibold uppercase tracking-widest ml-1 block">
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  type={passwordVisible ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter password"
                  autoComplete="current-password"
                  className="input-dark mb-1 h-11 w-full pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setPasswordVisible((visible) => !visible)}
                  className="absolute inset-y-0 right-3 text-[#64748b] hover:text-[#e2e8f0] text-sm"
                >
                  {passwordVisible ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {signInError ? (
              <p className="text-xs text-[#fde68a]">{signInError}</p>
            ) : null}

            <button
              type="submit"
              disabled={!isLoaded || signInLoading}
              className="btn-silver w-full mt-4 normal-case tracking-widest py-3 disabled:opacity-60"
            >
              {signInLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <p className="mt-6 text-sm text-[#94a3b8] text-center">
            No account?{' '}
            <Link to="/sign-up" className="text-[#bae6fd] hover:text-[#f8fafc] font-medium transition-colors">
              Sign up
            </Link>
          </p>
        </div>

        {/* Floating Sparkles around the card */}
        <SparkleStar style={{ top: '20%', right: '5%', width: '15px', height: '15px', animationDelay: '0.5s' }} />
        <SparkleStar style={{ bottom: '15%', left: '8%', width: '10px', height: '10px', animationDelay: '1.2s' }} />
      </div>
    </div>
  );
};

export default SignInPage;

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { SignUp, useSignUp } from '@clerk/clerk-react';

const SparkleStar = ({ style }) => (
  <svg className="sparkle" style={style} viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M80 0C80 0 84.5 59.5 160 80C160 80 84.5 100.5 80 160C80 160 75.5 100.5 0 80C0 80 75.5 59.5 80 0Z" fill="currentColor" />
  </svg>
);

const ContinueSocialAuth = () => {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [username, setUsername] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [hasAutoAttempted, setHasAutoAttempted] = useState(false);
  const autoAttemptRef = useRef(false);
  const isPendingSocialSignup = isLoaded && signUp?.status === 'missing_requirements';
  const shouldShowUsernameOnly = useMemo(() => {
    if (!isPendingSocialSignup) return false;
    const missingFields = signUp?.missingFields || [];
    const unverifiedFields = signUp?.unverifiedFields || [];
    return missingFields.length === 1 && missingFields[0] === 'username' && unverifiedFields.length === 0;
  }, [isPendingSocialSignup, signUp]);
  const suggestedUsername = useMemo(() => {
    const nameParts = [signUp?.firstName, signUp?.lastName]
      .filter(Boolean)
      .join('')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');
    const email = (signUp?.emailAddress || '').split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
    return nameParts || email || 'saramuser';
  }, [signUp?.emailAddress, signUp?.firstName, signUp?.lastName]);

  const completeUsernameStep = useCallback(async (usernameValue) => {
    if (!signUp || !setActive) return;

    const trimmedUsername = usernameValue.trim();
    if (!trimmedUsername) {
      setSubmitError('Username is required.');
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError('');

      const result = await signUp.update({
        username: trimmedUsername,
      });

      if (result.status === 'complete' && result.createdSessionId) {
        await setActive({ session: result.createdSessionId });
        window.location.href = '/';
        return;
      }

      setSubmitError('A few more details are still required. Please continue below.');
    } catch (error) {
      const message =
        error?.errors?.[0]?.longMessage ||
        error?.errors?.[0]?.message ||
        error?.message ||
        'Username could not be saved.';

      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  }, [setActive, signUp]);

  useEffect(() => {
    if (!shouldShowUsernameOnly || autoAttemptRef.current) return;

    autoAttemptRef.current = true;
    setUsername(suggestedUsername);
    setHasAutoAttempted(true);
    void completeUsernameStep(suggestedUsername);
  }, [completeUsernameStep, shouldShowUsernameOnly, suggestedUsername]);

  const handleUsernameSubmit = async (event) => {
    event.preventDefault();
    await completeUsernameStep(username);
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[15%] left-[-10%] w-[500px] h-[500px] bg-[#bae6fd]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[5%] right-[-5%] w-[400px] h-[400px] bg-[#e2e8f0]/5 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10 animate-fade-in-up">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-3 group transition-transform hover:scale-105 mb-8">
            <div className="w-12 h-12 rounded-full border border-[#e2e8f0]/30 flex items-center justify-center text-[#e2e8f0] group-hover:border-[#e2e8f0] group-hover:shadow-[0_0_20px_rgba(226,232,240,0.4)] transition-all duration-300 relative">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path d="M12 2L2 8l10 14L22 8z" />
              </svg>
              <SparkleStar style={{ top: '-8px', right: '-8px', width: '12px', height: '12px' }} />
            </div>
            <div className="text-left">
              <div className="font-display font-bold text-2xl text-[#ffffff] tracking-[0.15em] leading-none">SARAM</div>
              <div className="text-[10px] font-semibold tracking-[0.3em] text-[#e2e8f0] uppercase mt-0.5">Jewels</div>
            </div>
          </Link>

          <h2 className="text-4xl font-display font-bold text-[#f8fafc] tracking-tight">
            {isPendingSocialSignup ? 'Complete Your Account' : 'Continue With Google'}
          </h2>
          <p className="mt-3 text-sm text-[#94a3b8] tracking-wide">
            {isPendingSocialSignup
              ? 'Clerk detected a new Google user. Finish the missing fields once, then future Google logins will sign in directly.'
              : 'No incomplete social sign-up is active right now. Start again from the sign-in page.'}
          </p>
        </div>

        <div className="glass p-4 sm:p-8 rounded-3xl border border-[rgba(226,232,240,0.2)] shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          {isPendingSocialSignup && shouldShowUsernameOnly && hasAutoAttempted && isSubmitting && !submitError ? (
            <div className="py-10 text-center">
              <div className="w-10 h-10 border-2 border-[#334155] border-t-[#e2e8f0] rounded-full animate-spin mx-auto mb-4" />
              <p className="text-sm text-[#94a3b8]">
                Finishing your Google signup with your username automatically...
              </p>
            </div>
          ) : isPendingSocialSignup && shouldShowUsernameOnly ? (
            <form onSubmit={handleUsernameSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-[#e2e8f0] mb-2 ml-1">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder={suggestedUsername || 'Choose a username'}
                  autoFocus
                  className="input-dark w-full h-11"
                />
                <p className="mt-2 text-xs text-[#94a3b8]">
                  {hasAutoAttempted && !submitError
                    ? 'Trying to finish your account automatically with your Google name.'
                    : 'Google is already connected. We just need a username to finish your account.'}
                </p>
              </div>
              {submitError ? (
                <p className="text-xs text-[#fde68a]">{submitError}</p>
              ) : null}
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-silver w-full py-3 text-xs tracking-widest disabled:opacity-60"
              >
                {isSubmitting ? 'Saving Username...' : 'Continue'}
              </button>
            </form>
          ) : isPendingSocialSignup ? (
            <SignUp
              routing="virtual"
              signInUrl="/sign-in"
              afterSignInUrl="/"
              afterSignUpUrl="/"
              appearance={{
                elements: {
                  rootBox: 'w-full',
                  card: 'bg-transparent shadow-none w-full',
                  headerTitle: 'hidden',
                  headerSubtitle: 'hidden',
                  formButtonPrimary: 'btn-silver w-full mt-4 m-0 normal-case tracking-widest py-3',
                  formFieldInput: 'input-dark mb-1 h-11',
                  formFieldLabel: 'text-[#e2e8f0] text-xs font-semibold uppercase tracking-widest mb-1.5 ml-1',
                  footerActionLink: 'text-[#bae6fd] hover:text-[#f8fafc] font-medium transition-colors',
                  footerActionText: 'text-[#94a3b8]',
                  socialButtons: 'hidden',
                  dividerRow: 'hidden',
                  dividerLine: 'bg-[rgba(226,232,240,0.15)]',
                  dividerText: 'text-[#64748b] text-xs font-semibold px-4 uppercase tracking-tighter',
                  formFieldLabelRow: 'text-[#94a3b8]',
                  identityPreviewText: 'text-[#f8fafc]',
                  identityPreviewEditButtonIcon: 'text-[#bae6fd]',
                  alert: 'bg-[rgba(244,63,94,0.1)] border border-[rgba(244,63,94,0.3)] rounded-xl',
                  alertText: 'text-[#fde68a] font-medium text-xs',
                },
                layout: { shimmer: true }
              }}
            />
          ) : (
            <div className="text-center py-6">
              <p className="text-sm text-[#94a3b8] mb-5">
                If you were expecting account setup here, the Google flow probably finished already or expired.
              </p>
              <Link to="/sign-in" className="btn-silver inline-flex justify-center px-6 py-3 text-xs tracking-widest">
                Back To Sign In
              </Link>
            </div>
          )}
        </div>

        <SparkleStar style={{ top: '10%', left: '5%', width: '12px', height: '12px', animationDelay: '0.2s' }} />
        <SparkleStar style={{ bottom: '25%', right: '8%', width: '18px', height: '18px', animationDelay: '0.9s' }} />
      </div>
    </div>
  );
};

export default ContinueSocialAuth;

import React, { useState } from 'react';
import { useSignIn, useSignUp } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import SocialGoogleButton from './SocialGoogleButton';

const SparkleStar = ({ style }) => (
  <svg className="sparkle" style={style} viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M80 0C80 0 84.5 59.5 160 80C160 80 84.5 100.5 80 160C80 160 75.5 100.5 0 80C0 80 75.5 59.5 80 0Z" fill="currentColor" />
  </svg>
);

const normalizeUsername = (value) =>
  value.toLowerCase().replace(/[^a-z0-9]/g, '');

const getUsernameCandidates = ({ firstName, lastName, email }) => {
  const baseName = normalizeUsername(`${firstName}${lastName}`);
  const emailPrefix = normalizeUsername((email || '').split('@')[0] || '');
  const primary = baseName || emailPrefix || 'saramuser';
  const secondary = emailPrefix && emailPrefix !== primary ? emailPrefix : `${primary}shopper`;
  const uniqueSuffix = `${Date.now().toString().slice(-4)}`;

  return [
    primary,
    secondary,
    `${primary}${uniqueSuffix}`,
    `${secondary}${uniqueSuffix}`,
  ].filter(Boolean);
};

const getErrorMessage = (error, fallback) =>
  error?.errors?.[0]?.longMessage ||
  error?.errors?.[0]?.message ||
  error?.message ||
  fallback;

const isUsernameConflict = (error) => {
  const firstError = error?.errors?.[0];
  const message = `${firstError?.longMessage || ''} ${firstError?.message || ''}`.toLowerCase();

  return firstError?.meta?.paramName === 'username' || message.includes('username');
};

const SignUpPage = () => {
  const { isLoaded: isSignInLoaded, signIn } = useSignIn();
  const { isLoaded: isSignUpLoaded, signUp, setActive } = useSignUp();
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [signUpLoading, setSignUpLoading] = useState(false);
  const [signUpError, setSignUpError] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [needsVerification, setNeedsVerification] = useState(false);
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [verificationError, setVerificationError] = useState('');

  const handleGoogleAuth = async () => {
    if (!isSignInLoaded || !signIn) return;

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
      setGoogleError(getErrorMessage(error, 'Google authentication could not be started.'));
      setGoogleLoading(false);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    if (signUpError) {
      setSignUpError('');
    }
  };

  const createAccountWithGeneratedUsername = async () => {
    const candidates = getUsernameCandidates({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
    });

    let lastError = null;

    for (const username of candidates) {
      try {
        return await signUp.create({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          emailAddress: formData.email.trim(),
          password: formData.password,
          username,
        });
      } catch (error) {
        lastError = error;

        if (!isUsernameConflict(error)) {
          throw error;
        }
      }
    }

    throw lastError;
  };

  const handleEmailPasswordSignUp = async (event) => {
    event.preventDefault();

    if (!isSignUpLoaded || !signUp) return;

    if (formData.password !== formData.confirmPassword) {
      setSignUpError('Passwords do not match.');
      return;
    }

    try {
      setSignUpLoading(true);
      setSignUpError('');

      const result = await createAccountWithGeneratedUsername();

      if (result.status === 'complete' && result.createdSessionId && setActive) {
        await setActive({ session: result.createdSessionId });
        window.location.href = '/';
        return;
      }

      await result.prepareEmailAddressVerification({
        strategy: 'email_code',
      });
      setNeedsVerification(true);
    } catch (error) {
      setSignUpError(getErrorMessage(error, 'Account creation failed.'));
    } finally {
      setSignUpLoading(false);
    }
  };

  const handleVerificationSubmit = async (event) => {
    event.preventDefault();

    if (!signUp || !setActive) return;

    try {
      setVerificationLoading(true);
      setVerificationError('');

      const result = await signUp.attemptEmailAddressVerification({
        code: verificationCode.trim(),
      });

      if (result.status === 'complete' && result.createdSessionId) {
        await setActive({ session: result.createdSessionId });
        window.location.href = '/';
        return;
      }

      setVerificationError('Verification is not complete yet. Please check the code and try again.');
    } catch (error) {
      setVerificationError(getErrorMessage(error, 'Verification failed.'));
    } finally {
      setVerificationLoading(false);
    }
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
            {needsVerification ? 'Verify Your Email' : 'Create Account'}
          </h2>
          <p className="mt-3 text-sm text-[#94a3b8] tracking-wide">
            {needsVerification
              ? 'Enter the verification code sent to your email to finish signup.'
              : 'Join the world of timeless brilliance'}
          </p>
        </div>

        <div className="glass p-4 sm:p-8 rounded-3xl border border-[rgba(226,232,240,0.2)] shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          {!needsVerification ? (
            <>
              <div className="mb-5">
                <SocialGoogleButton
                  onClick={handleGoogleAuth}
                  disabled={!isSignInLoaded}
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

              <form onSubmit={handleEmailPasswordSignUp} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[#e2e8f0] text-xs font-semibold uppercase tracking-widest mb-1.5 ml-1 block">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="input-dark mb-1 h-11 w-full"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[#e2e8f0] text-xs font-semibold uppercase tracking-widest mb-1.5 ml-1 block">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="input-dark mb-1 h-11 w-full"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[#e2e8f0] text-xs font-semibold uppercase tracking-widest mb-1.5 ml-1 block">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="input-dark mb-1 h-11 w-full"
                    autoComplete="email"
                    required
                  />
                </div>

                <div>
                  <label className="text-[#e2e8f0] text-xs font-semibold uppercase tracking-widest mb-1.5 ml-1 block">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="input-dark mb-1 h-11 w-full"
                    autoComplete="new-password"
                    required
                  />
                </div>

                <div>
                  <label className="text-[#e2e8f0] text-xs font-semibold uppercase tracking-widest mb-1.5 ml-1 block">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="input-dark mb-1 h-11 w-full"
                    autoComplete="new-password"
                    required
                  />
                </div>

                <p className="text-xs text-[#64748b]">
                  Username is created automatically from your name.
                </p>

                {signUpError ? (
                  <p className="text-xs text-[#fde68a]">{signUpError}</p>
                ) : null}

                <button
                  type="submit"
                  disabled={!isSignUpLoaded || signUpLoading}
                  className="btn-silver w-full mt-4 normal-case tracking-widest py-3 disabled:opacity-60"
                >
                  {signUpLoading ? 'Creating Account...' : 'Create Account'}
                </button>
              </form>
            </>
          ) : (
            <form onSubmit={handleVerificationSubmit} className="space-y-5">
              <div>
                <label className="text-[#e2e8f0] text-xs font-semibold uppercase tracking-widest mb-1.5 ml-1 block">
                  Verification Code
                </label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(event) => setVerificationCode(event.target.value)}
                  className="input-dark mb-1 h-11 w-full tracking-[0.25em] text-center"
                  placeholder="Enter code"
                  required
                />
              </div>

              {verificationError ? (
                <p className="text-xs text-[#fde68a]">{verificationError}</p>
              ) : null}

              <button
                type="submit"
                disabled={verificationLoading}
                className="btn-silver w-full mt-4 normal-case tracking-widest py-3 disabled:opacity-60"
              >
                {verificationLoading ? 'Verifying...' : 'Verify Email'}
              </button>
            </form>
          )}
        </div>

        <SparkleStar style={{ top: '10%', left: '5%', width: '12px', height: '12px', animationDelay: '0.2s' }} />
        <SparkleStar style={{ bottom: '25%', right: '8%', width: '18px', height: '18px', animationDelay: '0.9s' }} />
      </div>
    </div>
  );
};

export default SignUpPage;

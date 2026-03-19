import React from 'react';
import { AuthenticateWithRedirectCallback } from '@clerk/clerk-react';

const SSOCallback = () => {
  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-[#334155] border-t-[#e2e8f0] rounded-full animate-spin mx-auto mb-4" />
        <h2 className="text-xl font-display font-bold text-[#f8fafc] tracking-tight">
          Authenticating...
        </h2>
        <p className="mt-2 text-sm text-[#94a3b8]">
          Please wait while we securely log you in.
        </p>
      </div>
      <AuthenticateWithRedirectCallback 
        signInUrl={`${window.location.origin}/sign-in`}
        signUpUrl={`${window.location.origin}/sign-up`}
        afterSignInUrl={`${window.location.origin}/`}
        afterSignUpUrl={`${window.location.origin}/`}
      />
    </div>
  );
};

export default SSOCallback;

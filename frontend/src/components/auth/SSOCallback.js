import React, { useEffect, useState } from 'react';
import { AuthenticateWithRedirectCallback } from '@clerk/clerk-react';

const SSOCallback = () => {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldRender(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#020617', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '420px', padding: '32px 28px', borderRadius: '28px', border: '1px solid rgba(226,232,240,0.16)', background: 'rgba(15,23,42,0.82)', boxShadow: '0 20px 60px rgba(0,0,0,0.45)', textAlign: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid #334155', borderTopColor: '#e2e8f0', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
        <p style={{ color: '#e2e8f0', fontSize: '18px', fontWeight: 600, margin: '0 0 8px' }}>Finishing your sign-in</p>
        <p style={{ color: '#94a3b8', fontSize: '14px', margin: '0 0 24px' }}>If verification is needed, it will appear below.</p>
        <div
          id="clerk-captcha"
          style={{
            minHeight: '78px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        />
        <p style={{ color: '#64748b', fontSize: '12px', lineHeight: 1.5, margin: '20px 0 0' }}>
          If the verification never finishes on localhost, bot protection in Clerk may be blocking the development callback.
        </p>
      </div>
      {shouldRender && (
        <AuthenticateWithRedirectCallback
          afterSignInUrl="/"
          afterSignUpUrl="/"
          continueSignUpUrl="/continue-social-auth"
        />
      )}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default SSOCallback;

import React from 'react';
import { SignIn } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';

/* ── Sparkle Component ── */
const SparkleStar = ({ style }) => (
  <svg className="sparkle" style={style} viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M80 0C80 0 84.5 59.5 160 80C160 80 84.5 100.5 80 160C80 160 75.5 100.5 0 80C0 80 75.5 59.5 80 0Z" fill="currentColor"/>
  </svg>
);

const SignInPage = () => {
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
          <SignIn 
            routing="path"
            path="/sign-in"
            fallbackRedirectUrl="/"
            signUpUrl="/sign-up"
            appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "bg-transparent shadow-none w-full",
                  headerTitle: "hidden",
                  headerSubtitle: "hidden",
                  formButtonPrimary: "btn-silver w-full mt-4 normal-case tracking-widest py-3",
                  formFieldInput: "input-dark mb-1 h-11",
                  formFieldLabel: "text-[#e2e8f0] text-xs font-semibold uppercase tracking-widest mb-1.5 ml-1",
                  footerActionLink: "text-[#bae6fd] hover:text-[#f8fafc] font-medium transition-colors",
                  footerActionText: "text-[#94a3b8]",
                  dividerLine: "bg-[rgba(226,232,240,0.15)]",
                  dividerText: "text-[#64748b] text-xs font-semibold px-4 uppercase tracking-tighter",
                  socialButtonsBlockButton: "bg-[#0f172a] border border-[#334155] text-[#f8fafc] hover:bg-[#1e293b] hover:border-[#e2e8f0]/30 h-11 transition-all",
                  socialButtonsBlockButtonText: "text-[#f8fafc] font-medium",
                  socialButtonsBlockButtonArrow: "text-[#e2e8f0]",
                  formFieldLabelRow: "text-[#94a3b8]",
                  identityPreviewText: "text-[#f8fafc]",
                  identityPreviewEditButtonIcon: "text-[#bae6fd]",
                },
                layout: { shimmer: true }
              }}
          />
        </div>

        {/* Floating Sparkles around the card */}
        <SparkleStar style={{ top: '20%', right: '5%', width: '15px', height: '15px', animationDelay: '0.5s' }} />
        <SparkleStar style={{ bottom: '15%', left: '8%', width: '10px', height: '10px', animationDelay: '1.2s' }} />
      </div>
    </div>
  );
};

export default SignInPage;

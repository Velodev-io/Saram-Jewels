import React from 'react';
import { SignIn } from '@clerk/clerk-react';

const SignInPage = () => {
  return (
    <div className="min-h-screen bg-green-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-jewelry font-bold text-amber-50">
            Sign In to Your Account
          </h2>
          <p className="mt-2 text-sm text-amber-100">
            Welcome back to Saram Jewels
          </p>
        </div>
        
        <div className="bg-green-800 rounded-2xl shadow-xl p-8 border border-green-700">
          <SignIn 
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "bg-transparent shadow-none",
                headerTitle: "text-amber-50 text-2xl font-jewelry font-bold",
                headerSubtitle: "text-amber-100",
                formButtonPrimary: "bg-amber-200 text-green-900 hover:bg-amber-300 font-semibold",
                formFieldInput: "bg-green-700 border-green-600 text-amber-50 placeholder-amber-200 focus:ring-amber-300 focus:border-amber-300",
                formFieldLabel: "text-amber-100",
                footerActionLink: "text-amber-200 hover:text-amber-300",
                dividerLine: "bg-green-600",
                dividerText: "text-amber-100",
                socialButtonsBlockButton: "bg-green-700 border-green-600 text-amber-50 hover:bg-green-600",
                formFieldLabelRow: "text-amber-100",
                formResendCodeLink: "text-amber-200 hover:text-amber-300"
              }
            }}
            redirectUrl="/"
            signUpUrl="/sign-up"
          />
        </div>
      </div>
    </div>
  );
};

export default SignInPage;

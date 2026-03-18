import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CreditCardIcon, 
  BanknotesIcon, 
  DevicePhoneMobileIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  LockClosedIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

/* ── Sparkle Component ── */
const SparkleStar = ({ style }) => (
  <svg className="sparkle" style={style} viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M80 0C80 0 84.5 59.5 160 80C160 80 84.5 100.5 80 160C80 160 75.5 100.5 0 80C0 80 75.5 59.5 80 0Z" fill="currentColor"/>
  </svg>
);

const PaymentGateway = ({ amount, orderId, onPaymentSuccess, onPaymentFailure }) => {
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const paymentMethods = [
    {
      id: 'cod',
      name: 'Cash on Delivery (COD)',
      description: 'Pay when your jewelry arrives at your doorstep.',
      icon: BanknotesIcon,
      color: 'bg-[#1e293b] border border-[rgba(226,232,240,0.2)]'
    }
  ];

  const processCodPayment = async () => {
    setLoading(true);
    try {
      // Simulate order confirmation delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      onPaymentSuccess({
        paymentId: `cod_${Date.now()}`,
        orderId: orderId || 'SJ-' + Math.floor(Math.random() * 10000),
        method: 'cod',
        status: 'pending'
      });
    } catch (error) {
      console.error('Error in COD confirmation:', error);
      onPaymentFailure('Order confirmation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto glass p-8 rounded-[32px] border border-[rgba(226,232,240,0.15)] shadow-[0_40px_80px_rgba(0,0,0,0.6)] relative overflow-hidden animate-fade-in">
      {/* Sparkles */}
      <SparkleStar style={{ top: '5%', left: '3%', width: '12px', height: '12px' }} />
      <SparkleStar style={{ bottom: '5%', right: '3%', width: '10px', height: '10px', animationDelay: '1s' }} />

      <div className="mb-8 text-center">
        <div className="section-label justify-center mb-4">Secure Confirmation</div>
        <h2 className="text-4xl font-display font-bold text-[#f8fafc] mb-2">Final Step</h2>
        <p className="text-[#94a3b8] text-sm">Review your procurement selection</p>
      </div>

      {/* Order Summary */}
      <div className="bg-[#0f172a]/40 border border-[rgba(226,232,240,0.08)] rounded-2xl p-6 mb-8 relative group overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#e2e8f0]/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        <div className="flex justify-between items-center relative z-10">
          <div className="flex flex-col">
            <span className="text-[#64748b] text-[10px] uppercase tracking-[0.2em] font-bold">Total Payable</span>
            <span className="text-[#f8fafc] text-sm font-medium mt-1">Order #{orderId || 'SJ-' + Math.floor(Math.random() * 10000)}</span>
          </div>
          <div className="text-right">
            <span className="text-3xl font-bold text-silver-gradient">₹{amount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="mb-8">
        <h3 className="text-xs font-bold text-[#e2e8f0] uppercase tracking-widest mb-5 opacity-70">Payment Option</h3>
        <div className="grid grid-cols-1 gap-3">
          {paymentMethods.map((method) => (
            <label
              key={method.id}
              className="flex items-center p-5 rounded-2xl cursor-pointer transition-all duration-300 border border-[#e2e8f0] bg-[#e2e8f0]/5 shadow-[0_0_20px_rgba(226,232,240,0.1)]"
            >
              <div className={`w-11 h-11 rounded-xl ${method.color} flex items-center justify-center mr-4 group-hover:scale-110 transition-transform`}>
                <method.icon className="w-5 h-5 text-[#e2e8f0]" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-[#f8fafc] text-sm">{method.name}</div>
                <div className="text-[11px] text-[#64748b] font-medium tracking-wide mt-0.5">{method.description}</div>
              </div>
              <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center border-[#e2e8f0] bg-[#e2e8f0]">
                 <CheckCircleIcon className="w-4 h-4 text-[#020617]" />
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Trust Badge */}
      <div className="bg-[#e2e8f0]/3 border border-[rgba(226,232,240,0.1)] rounded-xl p-4 mb-8 flex items-center justify-center gap-4">
        <div className="w-8 h-8 rounded-full bg-[#020617] border border-[rgba(226,232,240,0.2)] flex items-center justify-center shadow-lg">
            <ShieldCheckIcon className="h-4 w-4 text-[#e2e8f0]" />
        </div>
        <p className="text-[10px] text-[#94a3b8] font-semibold uppercase tracking-[0.1em]">
          AUTHENTIC PROCUREMENT SECURED
        </p>
      </div>

      {/* Action Buttons */}
      <div className="space-y-4">
        <button
          onClick={processCodPayment}
          disabled={loading}
          className="btn-silver w-full py-5 rounded-2xl relative overflow-hidden group shadow-[0_10px_30px_rgba(226,232,240,0.1)]"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-3">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#020617] border-t-transparent"></div>
              <span className="uppercase tracking-widest text-xs font-bold">Securing your order...</span>
            </div>
          ) : (
            <>
              <span className="uppercase tracking-widest text-[#020617] font-black group-hover:scale-105 transition-transform block italic">Confirm Order (COD)</span>
              <SparkleStar style={{ top: '20%', right: '10%', width: '10px', height: '10px' }} />
            </>
          )}
        </button>

        <button
          onClick={() => navigate('/cart')}
          className="btn-outline w-full py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-[#64748b] hover:text-[#f8fafc]"
        >
          Return to Selection
        </button>
      </div>
    </div>
  );
};

export default PaymentGateway;

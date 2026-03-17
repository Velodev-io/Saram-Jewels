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
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [loading, setLoading] = useState(false);
  const [upiId, setUpiId] = useState('');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const paymentMethods = [
    {
      id: 'razorpay',
      name: 'Razorpay / Cards',
      description: 'UPI, Credit/Debit, Net Banking',
      icon: BanknotesIcon,
      color: 'bg-[#1e293b] border border-[rgba(226,232,240,0.2)]'
    },
    {
      id: 'upi',
      name: 'UPI ID',
      description: 'Instant pay via any UPI App',
      icon: DevicePhoneMobileIcon,
      color: 'bg-[#1e293b] border border-[rgba(226,232,240,0.2)]'
    },
    {
      id: 'card',
      name: 'Debit / Credit',
      description: 'Secure card checkout',
      icon: CreditCardIcon,
      color: 'bg-[#1e293b] border border-[rgba(226,232,240,0.2)]'
    }
  ];

  const validateCardDetails = () => {
    const newErrors = {};
    
    if (!cardDetails.number || cardDetails.number.length < 16) {
      newErrors.number = 'Please enter a valid card number';
    }
    
    if (!cardDetails.expiry || !/^\d{2}\/\d{2}$/.test(cardDetails.expiry)) {
      newErrors.expiry = 'Please enter expiry in MM/YY format';
    }
    
    if (!cardDetails.cvv || cardDetails.cvv.length < 3) {
      newErrors.cvv = 'Please enter a valid CVV';
    }
    
    if (!cardDetails.name.trim()) {
      newErrors.name = 'Please enter cardholder name';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateUpiId = () => {
    if (!upiId || !/^[a-zA-Z0-9._-]+@[a-zA-Z]{3,}$/.test(upiId)) {
      setErrors({ upi: 'Please enter a valid UPI ID (e.g., name@upi)' });
      return false;
    }
    setErrors({});
    return true;
  };

  const handleCardInputChange = (field, value) => {
    let formattedValue = value;
    
    if (field === 'number') {
      formattedValue = value.replace(/\D/g, '').slice(0, 16);
    } else if (field === 'expiry') {
      formattedValue = value.replace(/\D/g, '').slice(0, 4);
      if (formattedValue.length >= 2) {
        formattedValue = formattedValue.slice(0, 2) + '/' + formattedValue.slice(2);
      }
    } else if (field === 'cvv') {
      formattedValue = value.replace(/\D/g, '').slice(0, 4);
    }
    
    setCardDetails(prev => ({
      ...prev,
      [field]: formattedValue
    }));
  };

  const processRazorpayPayment = async () => {
    setLoading(true);
    try {
      // Simulate dummy Razorpay payment processing for testing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      onPaymentSuccess({
        paymentId: `rzp_dummy_${Date.now()}`,
        orderId: orderId || 'SJ-' + Math.floor(Math.random() * 10000),
        method: 'razorpay'
      });
    } catch (error) {
      console.error('Error in dummy Razorpay:', error);
      onPaymentFailure('Simulated payment failed.');
    } finally {
      setLoading(false);
    }
  };

  const processUpiPayment = async () => {
    if (!validateUpiId()) return;
    
    setLoading(true);
    try {
      // Simulate UPI payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      onPaymentSuccess({
        paymentId: `upi_${Date.now()}`,
        orderId: orderId,
        method: 'upi',
        upiId: upiId
      });
    } catch (error) {
      onPaymentFailure('UPI payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const processCardPayment = async () => {
    if (!validateCardDetails()) return;
    
    setLoading(true);
    try {
      // Simulate card payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      onPaymentSuccess({
        paymentId: `card_${Date.now()}`,
        orderId: orderId,
        method: 'card',
        last4: cardDetails.number.slice(-4)
      });
    } catch (error) {
      onPaymentFailure('Card payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    switch (paymentMethod) {
      case 'razorpay':
        await processRazorpayPayment();
        break;
      case 'upi':
        await processUpiPayment();
        break;
      case 'card':
        await processCardPayment();
        break;
      default:
        onPaymentFailure('Please select a payment method.');
    }
  };

  return (
    <div className="max-w-xl mx-auto glass p-8 rounded-[32px] border border-[rgba(226,232,240,0.15)] shadow-[0_40px_80px_rgba(0,0,0,0.6)] relative overflow-hidden animate-fade-in">
      {/* Sparkles */}
      <SparkleStar style={{ top: '5%', left: '3%', width: '12px', height: '12px' }} />
      <SparkleStar style={{ bottom: '5%', right: '3%', width: '10px', height: '10px', animationDelay: '1s' }} />

      <div className="mb-8 text-center">
        <div className="section-label justify-center mb-4">Secure Checkout</div>
        <h2 className="text-4xl font-display font-bold text-[#f8fafc] mb-2">Payment Details</h2>
        <p className="text-[#94a3b8] text-sm">Experience seamless luxury transaction</p>
      </div>

      {/* Order Summary */}
      <div className="bg-[#0f172a]/40 border border-[rgba(226,232,240,0.08)] rounded-2xl p-6 mb-8 relative group overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#e2e8f0]/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        <div className="flex justify-between items-center relative z-10">
          <div className="flex flex-col">
            <span className="text-[#64748b] text-[10px] uppercase tracking-[0.2em] font-bold">Payable Amount</span>
            <span className="text-[#f8fafc] text-sm font-medium mt-1">Order #{orderId || 'SJ-' + Math.floor(Math.random() * 10000)}</span>
          </div>
          <div className="text-right">
            <span className="text-3xl font-bold text-silver-gradient">₹{amount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="mb-8">
        <h3 className="text-xs font-bold text-[#e2e8f0] uppercase tracking-widest mb-5 opacity-70">Select Method</h3>
        <div className="grid grid-cols-1 gap-3">
          {paymentMethods.map((method) => (
            <label
              key={method.id}
              className={`flex items-center p-4 rounded-2xl cursor-pointer transition-all duration-300 border ${
                paymentMethod === method.id
                  ? 'border-[#e2e8f0] bg-[#e2e8f0]/5 shadow-[0_0_20px_rgba(226,232,240,0.1)]'
                  : 'border-[rgba(226,232,240,0.08)] bg-[#0f172a]/50 hover:border-[#e2e8f0]/30 hover:bg-[#e2e8f0]/3'
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value={method.id}
                checked={paymentMethod === method.id}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="sr-only"
              />
              <div className={`w-11 h-11 rounded-xl ${method.color} flex items-center justify-center mr-4 group-hover:scale-110 transition-transform`}>
                <method.icon className="w-5 h-5 text-[#e2e8f0]" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-[#f8fafc] text-sm">{method.name}</div>
                <div className="text-[11px] text-[#64748b] font-medium tracking-wide mt-0.5">{method.description}</div>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                paymentMethod === method.id ? 'border-[#e2e8f0] bg-[#e2e8f0]' : 'border-[#334155]'
              }`}>
                {paymentMethod === method.id && (
                   <CheckCircleIcon className="w-4 h-4 text-[#020617]" />
                )}
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Payment Method Specific Forms */}
      <div className="animate-in fade-in slide-in-from-top-2 duration-300">
        {paymentMethod === 'upi' && (
          <div className="mb-8 flex flex-col gap-2">
            <label className="text-[10px] font-bold text-[#e2e8f0] uppercase tracking-widest ml-1 flex items-center gap-2">
              <DevicePhoneMobileIcon className="h-3 w-3" /> UPI ID
            </label>
            <input
              type="text"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              placeholder="vpa@upi"
              className={`input-dark w-full ${errors.upi ? 'border-red-500/50' : ''}`}
            />
            {errors.upi && (
              <p className="mt-1 text-[10px] text-red-400 flex items-center font-medium uppercase tracking-wider">
                <ExclamationCircleIcon className="w-3 h-3 mr-1" />
                {errors.upi}
              </p>
            )}
          </div>
        )}

        {paymentMethod === 'card' && (
          <div className="mb-8 space-y-5">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-[#e2e8f0] uppercase tracking-widest ml-1">Card Number</label>
              <div className="relative">
                <input
                  type="text"
                  value={cardDetails.number}
                  onChange={(e) => handleCardInputChange('number', e.target.value)}
                  placeholder="0000 0000 0000 0000"
                  className={`input-dark w-full pr-10 ${errors.number ? 'border-red-500/50' : ''}`}
                />
                <CreditCardIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748b]" />
              </div>
              {errors.number && (
                <p className="text-[10px] text-red-400 uppercase tracking-widest font-medium">
                  {errors.number}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-[#e2e8f0] uppercase tracking-widest ml-1">Expiry</label>
                <input
                  type="text"
                  value={cardDetails.expiry}
                  onChange={(e) => handleCardInputChange('expiry', e.target.value)}
                  placeholder="MM/YY"
                  className={`input-dark w-full ${errors.expiry ? 'border-red-500/50' : ''}`}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-[#e2e8f0] uppercase tracking-widest ml-1">CVV</label>
                <div className="relative">
                  <input
                    type="password"
                    value={cardDetails.cvv}
                    onChange={(e) => handleCardInputChange('cvv', e.target.value)}
                    placeholder="***"
                    className={`input-dark w-full pr-10 ${errors.cvv ? 'border-red-500/50' : ''}`}
                  />
                  <LockClosedIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748b]" />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-[#e2e8f0] uppercase tracking-widest ml-1">Cardholder Name</label>
              <input
                type="text"
                value={cardDetails.name}
                onChange={(e) => handleCardInputChange('name', e.target.value)}
                placeholder="Full Name as on Card"
                className={`input-dark w-full ${errors.name ? 'border-red-500/50' : ''}`}
              />
            </div>
          </div>
        )}
      </div>

      {/* Security Trust Badge */}
      <div className="bg-[#e2e8f0]/3 border border-[rgba(226,232,240,0.1)] rounded-xl p-4 mb-8 flex items-center justify-center gap-4">
        <div className="flex -space-x-2">
          <div className="w-8 h-8 rounded-full bg-[#020617] border border-[rgba(226,232,240,0.2)] flex items-center justify-center shadow-lg transform hover:-translate-y-1 transition-transform">
             <ShieldCheckIcon className="h-4 w-4 text-[#e2e8f0]" />
          </div>
          <div className="w-8 h-8 rounded-full bg-[#020617] border border-[rgba(226,232,240,0.2)] flex items-center justify-center shadow-lg transform hover:-translate-y-1 transition-transform">
             <LockClosedIcon className="h-4 w-4 text-[#e2e8f0]" />
          </div>
        </div>
        <p className="text-[10px] text-[#94a3b8] font-semibold uppercase tracking-[0.1em]">
          AES-256 Bit SSL <span className="text-[#334155]">|</span> PCI-DSS COMPLIANT
        </p>
      </div>

      {/* Action Buttons */}
      <div className="space-y-4">
        <button
          onClick={handlePayment}
          disabled={loading}
          className="btn-silver w-full py-4 rounded-2xl relative overflow-hidden group shadow-[0_10px_30px_rgba(226,232,240,0.1)]"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-3">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#020617] border-t-transparent"></div>
              <span className="uppercase tracking-widest text-xs font-bold">Processing Order...</span>
            </div>
          ) : (
            <>
              <span className="uppercase tracking-widest text-[#020617] font-bold group-hover:scale-105 transition-transform block">Pay ₹{amount.toFixed(2)} Now</span>
              <SparkleStar style={{ top: '20%', right: '10%', width: '10px', height: '10px' }} />
            </>
          )}
        </button>

        <button
          onClick={() => navigate('/cart')}
          className="btn-outline w-full py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-[#94a3b8] hover:text-[#f8fafc]"
        >
          Return to Cart
        </button>
      </div>
    </div>
  );
};

export default PaymentGateway;

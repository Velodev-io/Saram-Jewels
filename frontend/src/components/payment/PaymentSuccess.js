import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  CheckCircleIcon, 
  HomeIcon,
  ShoppingBagIcon,
  TruckIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

const SparkleStar = ({ style }) => (
  <svg className="sparkle" style={style} viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M80 0C80 0 84.5 59.5 160 80C160 80 84.5 100.5 80 160C80 160 75.5 100.5 0 80C0 80 75.5 59.5 80 0Z" fill="currentColor"/>
  </svg>
);

const PaymentSuccess = ({ paymentDetails }) => {
  const navigate = useNavigate();

  // Mock tracking information - in real app, this would come from your backend
  const trackingInfo = {
    number: 'DLV123456789',
    carrier: 'Delhivery',
    status: 'Order Confirmed',
    estimatedDelivery: '3-5 business days'
  };

  const getTrackingUrl = () => {
    if (trackingInfo.carrier === 'Delhivery') {
      return `https://www.delhivery.com/track/package/${trackingInfo.number}`;
    } else if (trackingInfo.carrier === 'DTDC') {
      return `https://www.dtdc.in/tracking/tracking_results.asp?Ttype=awb_no&strCnno=${trackingInfo.number}`;
    }
    return '#';
  };

  return (
    <div className="animate-fade-in relative max-w-lg mx-auto mt-8 mb-16 px-4">
      <div className="glass rounded-[32px] p-8 md:p-10 border border-[rgba(226,232,240,0.15)] shadow-[0_40px_80px_rgba(0,0,0,0.6)] relative overflow-hidden text-center">
        {/* Sparkles */}
        <SparkleStar style={{ top: '10%', left: '10%', width: '16px', height: '16px' }} />
        <SparkleStar style={{ top: '15%', right: '15%', width: '10px', height: '10px', animationDelay: '0.5s' }} />
        
        {/* Success Icon */}
        <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-[#10b981]/10 border border-[#10b981]/20 mb-6 drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]">
          <CheckCircleIcon className="h-10 w-10 text-[#10b981]" />
        </div>

        {/* Success Message */}
        <h2 className="text-3xl font-display font-bold text-[#f8fafc] mb-2">
          Payment Successful!
        </h2>
        <p className="text-[#94a3b8] mb-8 max-w-sm mx-auto">
          Thank you for your purchase. Your order has been elegantly confirmed.
        </p>

        {/* Payment Details Container */}
        <div className="bg-[#0f172a]/50 border border-[rgba(226,232,240,0.08)] rounded-2xl p-5 mb-6 text-left">
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center border-b border-[rgba(226,232,240,0.05)] pb-3">
              <span className="text-[#64748b] text-[10px] uppercase tracking-widest font-bold">Order ID</span>
              <span className="font-semibold text-[#e2e8f0]">
                #{paymentDetails?.orderId?.slice(-8) || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-[rgba(226,232,240,0.05)] pb-3">
              <span className="text-[#64748b] text-[10px] uppercase tracking-widest font-bold">Payment Ref</span>
              <span className="font-semibold text-[#e2e8f0]">
                {paymentDetails?.paymentId?.slice(-8) || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center pb-1">
              <span className="text-[#64748b] text-[10px] uppercase tracking-widest font-bold">Method</span>
              <span className="font-semibold text-[#e2e8f0] capitalize bg-[#1e293b] px-3 py-1 rounded-full text-xs border border-[rgba(226,232,240,0.1)]">
                {paymentDetails?.method || 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Tracking Information */}
        <div className="bg-[#3b82f6]/5 border border-[#3b82f6]/20 rounded-2xl p-5 mb-6 text-left relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#3b82f6]/10 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-150" />
          
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="flex items-center">
              <TruckIcon className="h-5 w-5 text-[#60a5fa] mr-2" />
              <h3 className="text-xs font-bold text-[#e2e8f0] uppercase tracking-widest">Tracking Info</h3>
            </div>
            <a
              href={getTrackingUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#3b82f6]/20 text-[#93c5fd] hover:bg-[#3b82f6]/30 transition-colors"
            >
              <EyeIcon className="h-3 w-3 mr-1" /> Track
            </a>
          </div>
          
          <div className="grid grid-cols-2 gap-4 relative z-10">
            <div>
              <p className="text-[#64748b] text-[10px] uppercase tracking-wider mb-1">Carrier</p>
              <p className="text-[#f8fafc] text-sm font-medium">{trackingInfo.carrier}</p>
            </div>
            <div>
              <p className="text-[#64748b] text-[10px] uppercase tracking-wider mb-1">Status</p>
              <p className="text-[#60a5fa] text-sm font-medium">{trackingInfo.status}</p>
            </div>
            <div className="col-span-2 mt-1">
              <p className="text-[#64748b] text-[10px] uppercase tracking-wider mb-1">Est. Delivery</p>
              <p className="text-[#f8fafc] text-sm font-medium">{trackingInfo.estimatedDelivery}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4 mt-8">
          <Link
            to="/profile?tab=orders"
            className="btn-silver w-full py-4 rounded-2xl flex items-center justify-center font-bold text-xs shadow-[0_10px_30px_rgba(226,232,240,0.1)]"
          >
            <ShoppingBagIcon className="w-4 h-4 mr-2" />
            <span className="uppercase tracking-widest">View My Orders</span>
          </Link>
          
          <button
            onClick={() => navigate('/')}
            className="btn-outline w-full py-3.5 rounded-2xl flex items-center justify-center text-[10px] font-bold uppercase tracking-widest hover:bg-[rgba(226,232,240,0.05)] border-[rgba(226,232,240,0.2)] text-[#94a3b8] hover:text-[#f8fafc]"
          >
            <HomeIcon className="w-4 h-4 mr-2" />
            Return to Boutique
          </button>
        </div>

        {/* Support Info */}
        <div className="mt-8 pt-6 border-t border-[rgba(226,232,240,0.08)]">
          <p className="text-xs text-[#64748b]">
            Need assistance? Reach out at{' '}
            <a href="mailto:saramjewels@gmail.com" className="text-[#bae6fd] hover:text-[#e2e8f0] transition-colors underline decoration-[#bae6fd]/30 underline-offset-4">
              saramjewels@gmail.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;

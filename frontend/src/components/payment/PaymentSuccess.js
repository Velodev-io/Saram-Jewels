import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  CheckCircleIcon, 
  HomeIcon,
  ShoppingBagIcon,
  ArrowDownTrayIcon,
  PrinterIcon
} from '@heroicons/react/24/outline';

const SparkleStar = ({ style }) => (
  <svg className="sparkle no-print" style={style} viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M80 0C80 0 84.5 59.5 160 80C160 80 84.5 100.5 80 160C80 160 75.5 100.5 0 80C0 80 75.5 59.5 80 0Z" fill="currentColor"/>
  </svg>
);

const PaymentSuccess = ({ paymentDetails }) => {
  const navigate = useNavigate();
  const today = new Date().toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const handleDownload = () => {
    window.print();
  };

  return (
    <div className="animate-fade-in relative max-w-2xl mx-auto mt-8 mb-16 px-4">
      {/* Print Styles */}
      <style>{`
        @media print {
          body { background: white !important; color: black !important; }
          .no-print { display: none !important; }
          .glass { background: white !important; border: 1px solid #eee !important; box-shadow: none !important; color: black !important; }
          .text-silver-gradient { background: none !important; -webkit-text-fill-color: black !important; color: black !important; }
          .text-[#f8fafc], .text-[#e2e8f0], .text-white { color: black !important; }
          .text-[#94a3b8], .text-[#64748b] { color: #666 !important; }
          .bg-[#0f172a], .bg-[#020617] { background: transparent !important; }
          .invoice-box { border: 1px solid #ddd !important; padding: 20px !important; }
          @page { margin: 2cm; }
        }
      `}</style>

      <div className="glass rounded-[32px] p-10 border border-[rgba(226,232,240,0.15)] shadow-[0_40px_80px_rgba(0,0,0,0.6)] relative overflow-hidden">
        {/* Sparkles (Hidden on Print) */}
        <SparkleStar style={{ top: '5%', left: '5%', width: '16px', height: '16px' }} />
        
        {/* Header (Hidden on Print) */}
        <div className="text-center mb-10 no-print">
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-[#10b981]/10 border border-[#10b981]/20 mb-6 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
            <CheckCircleIcon className="h-10 w-10 text-[#10b981]" />
          </div>
          <h2 className="text-4xl font-display font-bold text-[#f8fafc] mb-2 tracking-tight">Order Confirmed</h2>
          <p className="text-[#94a3b8] font-medium tracking-wide">Thank you for choosing Saram Jewels.</p>
        </div>

        {/* Invoice Body */}
        <div className="invoice-box space-y-8">
          {/* Brand & Invoice Details */}
          <div className="flex justify-between items-start border-b border-[rgba(226,232,240,0.1)] pb-8">
            <div>
              <h1 className="font-display text-2xl font-black text-silver-gradient tracking-widest mb-1">SARAM JEWELS</h1>
              <p className="text-[10px] text-[#64748b] uppercase tracking-[0.3em] font-bold">Premium Curation</p>
            </div>
            <div className="text-right">
              <h3 className="text-xs font-black text-[#e2e8f0] uppercase tracking-widest mb-1">Tax Invoice</h3>
              <p className="text-[10px] text-[#64748b] font-bold">Date: {today}</p>
              <p className="text-[10px] text-[#64748b] font-bold uppercase mt-1">Invoice #: {paymentDetails?.orderId?.slice(-8).toUpperCase() || 'INV-9921'}</p>
            </div>
          </div>

          {/* Billing Info */}
          <div className="grid grid-cols-2 gap-8 text-sm">
            <div>
              <h4 className="text-[10px] font-black text-[#64748b] uppercase tracking-widest mb-3">Billed To</h4>
              <p className="text-[#e2e8f0] font-semibold mb-1">Valued Customer</p>
              <p className="text-[#94a3b8] text-xs leading-relaxed max-w-[200px]">
                Payment Method: <span className="text-[#e2e8f0] font-bold">Cash on Delivery (COD)</span>
              </p>
            </div>
            <div className="text-right">
              <h4 className="text-[10px] font-black text-[#64748b] uppercase tracking-widest mb-3">Merchant</h4>
              <p className="text-[#e2e8f0] font-semibold mb-1">Saram Jewels India</p>
              <p className="text-[#94a3b8] text-xs">Delhi, India</p>
              <p className="text-[#94a3b8] text-xs">saramjewels@gmail.com</p>
            </div>
          </div>

          {/* Order Summary Table */}
          <div className="pt-4">
            <h4 className="text-[10px] font-black text-[#64748b] uppercase tracking-widest mb-4">Acquisition Details</h4>
            <div className="space-y-3 border-t border-[rgba(226,232,240,0.08)] pt-4">
               {paymentDetails?.items?.map((item, idx) => (
                 <div key={idx} className="flex justify-between items-center text-sm">
                    <div className="flex flex-col">
                      <p className="text-[#e2e8f0] font-medium tracking-wide">{item.name || 'Jewelry Piece'}</p>
                      <p className="text-[10px] text-[#64748b] font-bold">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-[#f8fafc] font-bold">₹{(item.price * item.quantity).toLocaleString()}</p>
                 </div>
               ))}
               
               <div className="h-px bg-[rgba(226,232,240,0.05)] my-2" />

               <div className="flex justify-between items-center text-xs">
                  <p className="text-[#64748b] uppercase tracking-widest font-bold">Subtotal</p>
                  <p className="text-[#e2e8f0] font-bold text-xs italic opacity-70">₹{paymentDetails?.subtotal?.toLocaleString() || '0.00'}</p>
               </div>

               <div className="flex justify-between items-center text-xs">
                  <p className="text-[#64748b] uppercase tracking-widest font-bold">GST (3%)</p>
                  <p className="text-[#e2e8f0] font-bold text-xs italic opacity-70">₹{Math.round(paymentDetails?.tax || 0).toLocaleString()}</p>
               </div>

               <div className="flex justify-between items-center text-xs">
                  <p className="text-[#64748b] uppercase tracking-widest font-bold">Delivery Charges</p>
                  <p className={`${paymentDetails?.shipping === 0 ? 'text-green-400' : 'text-[#e2e8f0] opacity-70'} font-bold text-xs italic`}>
                    {paymentDetails?.shipping === 0 ? 'COMPLIMENTARY' : `₹${paymentDetails?.shipping}`}
                  </p>
               </div>

               <div className="flex justify-between items-center text-sm pt-4 border-t border-[rgba(226,232,240,0.1)] font-extrabold">
                  <p className="text-[#64748b] uppercase tracking-widest text-[11px]">Grand Net Total</p>
                  <p className="text-2xl text-silver-gradient italic tracking-tight underline decoration-white/20 underline-offset-8">
                    ₹{Math.round(paymentDetails?.amount || 0).toLocaleString()}
                  </p>
               </div>
               
               <div className="mt-6 flex flex-col gap-2 no-print">
                  <p className="text-[9px] text-amber-400 font-bold uppercase tracking-[0.2em] text-center border border-amber-500/20 py-2 rounded-lg bg-amber-500/5">
                    * Final Payment to be Collected at Doorstep
                  </p>
               </div>
            </div>
          </div>

          {/* Thank You Note */}
          <div className="bg-[#0f172a]/40 border border-[rgba(226,232,240,0.08)] rounded-2xl p-6 text-center italic">
            <p className="text-[#94a3b8] text-xs leading-relaxed mb-4">
              "Every piece of jewelry tells a story. Thank you for making Saram Jewels a part of yours. 
              We look forward to your next acquisition."
            </p>
            <p className="text-silver-gradient font-display text-lg font-bold">~ Saroj Ram</p>
          </div>
        </div>

        {/* Action Buttons (Hidden on Print) */}
        <div className="mt-12 grid grid-cols-2 gap-4 no-print">
          <button
            onClick={handleDownload}
            className="btn-silver w-full py-4 rounded-2xl flex items-center justify-center gap-3 font-bold text-[10px] uppercase tracking-widest shadow-xl hover:scale-[1.02] transition-transform"
          >
            <PrinterIcon className="h-4 w-4" />
            Download Invoice
          </button>
          
          <Link
            to="/profile?tab=orders"
            className="btn-outline w-full py-4 rounded-2xl flex items-center justify-center gap-3 font-bold text-[10px] uppercase tracking-widest border-[rgba(226,232,240,0.2)] text-[#94a3b8] hover:text-white"
          >
            <ShoppingBagIcon className="h-4 w-4" />
            View Orders
          </Link>
        </div>

        <button
          onClick={() => navigate('/')}
          className="w-full mt-6 text-[#64748b] hover:text-[#e2e8f0] text-[10px] font-bold uppercase tracking-[0.3em] transition-colors no-print"
        >
          ← Return to Boutique
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccess;

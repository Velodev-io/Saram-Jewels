import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  TrashIcon,
  PlusIcon,
  MinusIcon,
  ShoppingBagIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import PaymentGateway from '../components/payment/PaymentGateway';
import PaymentSuccess from '../components/payment/PaymentSuccess';
import AddressSelector from '../components/address/AddressSelector';
import apiService from '../services/api';
import LoadingButton from '../components/common/LoadingButton';

/* ── Sparkle Component ── */
const SparkleStar = ({ style }) => (
  <svg className="sparkle" style={style} viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M80 0C80 0 84.5 59.5 160 80C160 80 84.5 100.5 80 160C80 160 75.5 100.5 0 80C0 80 75.5 59.5 80 0Z" fill="currentColor"/>
  </svg>
);

const Cart = () => {
  const { cart: cartItems, removeFromCart, updateQuantity, updateVariant, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const [checkoutStep, setCheckoutStep] = useState('cart'); // 'cart', 'address', 'payment'
  const [isNavigating, setIsNavigating] = useState(false);
  const [shippingAddress, setShippingAddress] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const navigate = useNavigate();

  const subtotal = getCartTotal();
  const tax = subtotal * 0.03;
  const shipping = subtotal >= 499 ? 0 : 150;
  const total = subtotal + tax + shipping;

  const handleAddressComplete = (address) => {
    setShippingAddress(address);
    setCheckoutStep('payment');
  };

  const handlePaymentSuccess = async (details) => {
    try {
      // Save order to backend
      const orderData = {
        user_id: user?.id || 'guest',
        user_email: user?.primaryEmailAddress?.emailAddress || user?.emailAddresses?.[0]?.emailAddress,
        first_name: user?.firstName,
        last_name: user?.lastName,
        amount: total,
        items: cartItems.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          price: item.price,
          selected_color: item.selectedColor || null,
          selected_size: item.selectedSize || null
        })),
        shipping_address: shippingAddress,
        payment_details: details,
        payment_method: details.method || 'razorpay'
      };
      
      const response = await apiService.createOrder(orderData);
      
      setPaymentDetails({ 
        ...details, 
        orderId: response.order_number || details.orderId, 
        items: cartItems, 
        amount: total,
        subtotal,
        tax,
        shipping
      });
      setPaymentSuccess(true);
      setCheckoutStep('cart');
      clearCart();
    } catch (error) {
      console.error('Failed to save order:', error);
      alert('Payment successful, but failed to save order details. Please contact support.');
    }
  };

  if (paymentSuccess) return <PaymentSuccess paymentDetails={paymentDetails} />;
  
  if (checkoutStep === 'address') {
    return (
      <div className="min-h-screen bg-[#020617] pt-32 px-6">
        <AddressSelector 
          onComplete={handleAddressComplete} 
          onBack={() => setCheckoutStep('cart')}
          user={user}
        />
      </div>
    );
  }

  if (checkoutStep === 'payment') {
    return (
      <div className="min-h-screen bg-[#020617] py-24 px-4 flex items-center justify-center">
        <PaymentGateway
          amount={total}
          orderId={`order_${Date.now()}`}
          onPaymentSuccess={handlePaymentSuccess}
          onPaymentFailure={(err) => { alert(`Payment failed: ${err}`); setCheckoutStep('cart'); }}
          onBack={() => setCheckoutStep('address')}
        />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center pt-24 px-6 relative overflow-hidden">
        {/* Background Accents */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[20%] right-[-5%] w-[400px] h-[400px] bg-[#bae6fd]/5 rounded-full blur-[100px]" />
        </div>

        <div className="text-center max-w-sm relative z-20 animate-fade-in-up">
          <div className="w-24 h-24 rounded-full bg-[#0f172a] border border-[rgba(226,232,240,0.15)] flex items-center justify-center mx-auto mb-8 relative">
            <ShoppingBagIcon className="h-10 w-10 text-[#e2e8f0]/40" />
            <SparkleStar style={{ top: '-10px', right: '-10px', width: '15px', height: '15px' }} />
          </div>
          <h2 className="font-display text-4xl font-bold text-[#ffffff] mb-4">Your bag is empty</h2>
          <p className="text-[#64748b] mb-10 leading-relaxed text-sm tracking-wide">
            Explore our sanctuary of brilliance and discover pieces that speak to your soul.
          </p>
          <button onClick={() => navigate('/products')} className="btn-silver w-full">
            Discover Collection
            <ArrowRightIcon className="h-4 w-4 ml-2" />
          </button>
          <div className="mt-8">
            <Link to="/" className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#64748b] hover:text-[#e2e8f0] transition-colors">
              ← Return Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] pt-28 pb-16 relative overflow-hidden">
      {/* Background Accents */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[5%] right-[-5%] w-[500px] h-[500px] bg-[#bae6fd]/3 rounded-full blur-[120px]" />
        <div className="absolute bottom-[0%] left-[-5%] w-[400px] h-[400px] bg-[#e2e8f0]/3 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="mb-12">
          <div className="section-label mb-4">Meticulously Curated</div>
          <h1 className="font-display text-5xl md:text-6xl font-bold text-[#ffffff]">
            Shopping Bag
          </h1>
          <div className="h-[1px] w-32 bg-gradient-to-r from-[#e2e8f0]/40 to-transparent mt-6" />
          <p className="text-[#64748b] mt-4 text-xs font-bold uppercase tracking-widest">
            {cartItems.length} Selection{cartItems.length === 1 ? '' : 's'} Ready for Acquisition
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-12 xl:col-span-8 space-y-6">
            {cartItems.map((item) => (
              <div key={item.id} className="glass p-6 rounded-[32px] border border-[rgba(226,232,240,0.1)] flex flex-col sm:flex-row gap-8 group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#e2e8f0]/2 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                
                {/* Image */}
                <div className="w-full sm:w-40 h-40 rounded-2xl overflow-hidden flex-shrink-0 bg-[#0f172a] border border-[rgba(226,232,240,0.08)] relative z-10">
                  {item.image || (item.images && item.images[0]) ? (
                    <img
                      src={item.image || item.images[0]}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <SparklesIcon className="h-10 w-10 text-[#e2e8f0]/10" />
                    </div>
                  )}
                  <SparkleStar style={{ top: '8px', right: '8px', width: '12px', height: '12px' }} />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 flex flex-col relative z-10">
                  <div className="flex justify-between items-start">
                    <div className="min-w-0">
                      <p className="text-[#64748b] text-[10px] uppercase tracking-[0.2em] font-bold mb-2">{item.category}</p>
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        {item.selectedColor && (
                          <span className="text-[#e2e8f0] font-medium text-[11px] bg-white/5 px-2 py-0.5 rounded-full border border-white/10 uppercase">
                             Color: {item.selectedColor}
                          </span>
                        )}
                        {item.sizes?.length > 0 && (
                          <div className="flex items-center gap-2">
                            <span className="text-[#64748b] text-[10px] font-bold uppercase tracking-widest">Size:</span>
                            <select 
                              value={item.selectedSize || ''} 
                              onChange={(e) => updateVariant(item.id, item.selectedColor, item.selectedSize, item.selectedColor, e.target.value)}
                              className="bg-[#0f172a] border border-white/10 text-[#e2e8f0] text-[11px] rounded px-1.5 py-0.5 outline-none focus:border-gold-light/50"
                            >
                              <option value="" disabled>Choose size</option>
                              {item.sizes.map(s => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                          </div>
                        )}
                        {item.selectedSize && !item.sizes?.length && (
                          <span className="text-[#e2e8f0] font-medium text-[11px] bg-white/5 px-2 py-0.5 rounded-full border border-white/10 uppercase">
                             Size: {item.selectedSize}
                          </span>
                        )}
                      </div>
                      <h3 className="font-display text-2xl font-bold text-[#ffffff] group-hover:text-silver-gradient transition-colors truncate">{item.name}</h3>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id, item.selectedColor, item.selectedSize)}
                      className="w-10 h-10 border border-[rgba(226,232,240,0.1)] rounded-full flex items-center justify-center text-[#64748b] hover:text-red-400 hover:border-red-400/50 transition-all"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-auto pt-6 border-t border-[rgba(226,232,240,0.05)] gap-4">
                    {/* Qty Controls */}
                    <div className="flex items-center bg-[#020617]/40 border border-[#334155]/60 rounded-xl overflow-hidden w-fit">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1, item.selectedColor, item.selectedSize)}
                        disabled={item.quantity <= 1}
                        className="w-10 h-10 flex items-center justify-center text-[#64748b] hover:text-[#e2e8f0] disabled:opacity-30 transition-colors"
                      >
                        <MinusIcon className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-12 h-10 flex items-center justify-center text-[#ffffff] text-sm font-bold border-x border-[#334155]/60">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => {
                          const activeVariant = item.variants?.find(v => 
                            (v.color === item.selectedColor || !v.color) && 
                            (v.size === item.selectedSize || !v.size)
                          );
                          const currentStock = activeVariant?.stock ?? item.stock;
                          if (item.quantity < currentStock) {
                            updateQuantity(item.id, item.quantity + 1, item.selectedColor, item.selectedSize);
                          } else {
                            window.dispatchEvent(new CustomEvent('showNotification', { 
                              detail: { message: `Only ${currentStock} pieces available in the vault.`, type: 'info' } 
                            }));
                          }
                        }}
                        className="w-10 h-10 flex items-center justify-center text-[#64748b] hover:text-[#e2e8f0] transition-colors"
                      >
                        <PlusIcon className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                       <span className="text-[10px] text-[#64748b] font-bold uppercase tracking-widest block mb-1">Total Value</span>
                       <div className="flex items-baseline gap-2">
                          <p className="text-white font-bold text-2xl">
                            ₹{(item.price * item.quantity).toLocaleString()}
                          </p>
                          {item.quantity > 1 && (
                            <p className="text-[#64748b] text-xs font-medium">/ ₹{item.price} ea.</p>
                          )}
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Continue Shopping */}
            <Link
              to="/products"
              className="inline-flex items-center gap-3 text-[#64748b] hover:text-[#e2e8f0] transition-all text-xs font-bold uppercase tracking-widest mt-6 group"
            >
              <div className="w-8 h-8 rounded-full border border-transparent group-hover:border-[#e2e8f0]/40 flex items-center justify-center transition-all">
                ←
              </div>
              Acquire More Brilliance
            </Link>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-12 xl:col-span-4">
            <div className="glass p-8 rounded-[32px] border border-[rgba(226,232,240,0.15)] sticky top-28 shadow-[0_40px_80px_rgba(0,0,0,0.4)]">
              <h3 className="section-label mb-8">Summary</h3>
              
              <div className="space-y-5 mb-8">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[#64748b] font-medium uppercase tracking-widest text-[10px]">Subtotal Value</span>
                  <span className="text-[#94a3b8] font-bold">₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[#64748b] font-medium uppercase tracking-widest text-[10px]">Luxury Shipping</span>
                  <span className={shipping === 0 ? 'text-green-400 font-bold' : 'text-[#94a3b8] font-bold'}>
                    {shipping === 0 ? 'COMPLIMENTARY' : `₹${shipping}`}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[#64748b] font-medium uppercase tracking-widest text-[10px]">Procurement Tax (3%)</span>
                  <span className="text-[#94a3b8] font-bold">₹{Math.round(tax).toLocaleString()}</span>
                </div>

                {shipping > 0 && (
                  <div className="bg-[#bae6fd]/5 border border-[#bae6fd]/10 rounded-2xl px-5 py-4 mt-4 animate-pulse-silver">
                    <p className="text-[#bae6fd] text-[10px] font-bold uppercase tracking-widest text-center">
                      Add ₹{(499 - subtotal).toLocaleString()} for Complimentary Shipping
                    </p>
                  </div>
                )}

                <div className="h-[1px] bg-gradient-to-r from-transparent via-[rgba(226,232,240,0.2)] to-transparent my-8" />

                <div className="flex justify-between items-end">
                  <span className="text-[#64748b] font-bold uppercase tracking-[0.2em] text-[10px] mb-1">Grand Total</span>
                  <div className="text-right">
                    <span className="text-4xl font-bold text-silver-gradient block leading-none">
                      ₹{Math.round(total).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <LoadingButton
                  onClick={() => {
                    setIsNavigating(true);
                    setTimeout(() => {
                      setCheckoutStep('address');
                      setIsNavigating(false);
                    }, 800);
                  }}
                  loading={isNavigating}
                  className="w-full py-5 rounded-2xl"
                  variant="silver"
                >
                  Proceed to Payment
                  <ArrowRightIcon className="h-4 w-4" />
                </LoadingButton>

                <div className="glass bg-[#e2e8f0]/3 border border-[rgba(226,232,240,0.08)] rounded-2xl p-4 flex items-center gap-4">
                   <div className="w-10 h-10 rounded-xl bg-[#020617] flex items-center justify-center border border-[rgba(226,232,240,0.1)]">
                      <ShieldCheckIcon className="h-5 w-5 text-[#e2e8f0]/40" />
                   </div>
                   <div>
                      <p className="text-[10px] font-bold text-white uppercase tracking-widest mb-0.5">Secure Transaction</p>
                      <p className="text-[9px] text-[#64748b] uppercase tracking-wider font-medium">AES-256 SSL Encrypted</p>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;

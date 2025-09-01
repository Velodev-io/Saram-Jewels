import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrashIcon, 
  PlusIcon, 
  MinusIcon,
  ShoppingBagIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { useCart } from '../context/CartContext';
import PaymentGateway from '../components/payment/PaymentGateway';
import PaymentSuccess from '../components/payment/PaymentSuccess';

const Cart = () => {
  const { cart: cartItems, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
  const [showPayment, setShowPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const navigate = useNavigate();

  const handleUpdateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    updateQuantity(itemId, newQuantity);
  };

  const handleRemoveItem = (itemId) => {
    removeFromCart(itemId);
  };

  const calculateSubtotal = () => {
    return getCartTotal();
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.03; // 3% GST
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert('Your cart is empty!');
      return;
    }
    setShowPayment(true);
  };

  const handlePaymentSuccess = (details) => {
    setPaymentDetails(details);
    setPaymentSuccess(true);
    setShowPayment(false);
    // Clear cart after successful payment
    clearCart();
  };

  const handlePaymentFailure = (error) => {
    alert(`Payment failed: ${error}`);
    setShowPayment(false);
  };

  if (paymentSuccess) {
    return <PaymentSuccess paymentDetails={paymentDetails} />;
  }

  if (showPayment) {
    return (
      <PaymentGateway
        amount={calculateTotal()}
        orderId={`order_${Date.now()}`}
        onPaymentSuccess={handlePaymentSuccess}
        onPaymentFailure={handlePaymentFailure}
      />
    );
  }



  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center">
          <ShoppingBagIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">
            Looks like you haven't added any items to your cart yet.
          </p>
          <button
            onClick={() => navigate('/products')}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
          >
            <ArrowRightIcon className="w-4 h-4 mr-2" />
            Start Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start xl:gap-x-16">
          {/* Cart Items */}
          <div className="lg:col-span-7">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Shopping Cart ({cartItems.length} items)</h2>
            
            <div className="space-y-6">
              {cartItems.map((item) => (
                <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center">
                    {/* Product Image */}
                    <div className="flex-shrink-0 w-20 h-20">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover rounded-md"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="ml-6 flex-1">
                      <div className="flex justify-between">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
                          <p className="text-sm text-gray-500">{item.category}</p>
                        </div>
                        <p className="text-lg font-medium text-gray-900">₹{item.price.toLocaleString()}</p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center border border-gray-300 rounded-md">
                                                   <button
                           onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                           className="p-2 text-gray-600 hover:text-gray-800"
                         >
                           <MinusIcon className="w-4 h-4" />
                         </button>
                         <span className="px-4 py-2 text-gray-900 font-medium">{item.quantity}</span>
                         <button
                           onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                           className="p-2 text-gray-600 hover:text-gray-800"
                         >
                           <PlusIcon className="w-4 h-4" />
                         </button>
                        </div>

                                                 <button
                           onClick={() => handleRemoveItem(item.id)}
                           className="text-red-600 hover:text-red-800 flex items-center"
                         >
                           <TrashIcon className="w-4 h-4 mr-1" />
                           Remove
                         </button>
                      </div>

                      {/* Item Total */}
                      <div className="mt-4 text-right">
                        <p className="text-sm text-gray-600">
                          Total: <span className="font-medium text-gray-900">₹{(item.price * item.quantity).toLocaleString()}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-5 mt-8 lg:mt-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Order Summary</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">₹{calculateSubtotal().toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax (GST 18%)</span>
                  <span className="text-gray-900">₹{calculateTax().toLocaleString()}</span>
                </div>
                
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-lg font-medium">
                    <span className="text-gray-900">Total</span>
                    <span className="text-gray-900">₹{calculateTotal().toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                className="w-full mt-6 bg-pink-600 hover:bg-pink-700 text-white font-medium py-3 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
              >
                Proceed to Checkout
              </button>

              {/* Continue Shopping */}
              <button
                onClick={() => navigate('/products')}
                className="w-full mt-3 border border-gray-300 text-gray-700 font-medium py-2 px-4 rounded-md hover:bg-gray-50 transition-colors"
              >
                Continue Shopping
              </button>

              {/* Security Notice */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-600">
                      Secure checkout with multiple payment options including UPI, cards, and net banking.
                    </p>
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

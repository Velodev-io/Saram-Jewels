import React from 'react';
import { Link } from 'react-router-dom';
import { 
  HeartIcon, 
  ShoppingCartIcon,
  TrashIcon,
  ArrowRightIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { useCart } from '../context/CartContext';

/* ── Sparkle Component ── */
const SparkleStar = ({ style }) => (
  <svg className="sparkle" style={style} viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M80 0C80 0 84.5 59.5 160 80C160 80 84.5 100.5 80 160C80 160 75.5 100.5 0 80C0 80 75.5 59.5 80 0Z" fill="currentColor"/>
  </svg>
);

const Wishlist = () => {
  const { wishlist, removeFromWishlist, addToCart } = useCart();

  const handleAddToCart = (product) => {
    addToCart(product);
    removeFromWishlist(product.id);
  };

  if (wishlist.length === 0) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background Accents */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[20%] right-[-5%] w-[400px] h-[400px] bg-[#bae6fd]/5 rounded-full blur-[100px]" />
          <div className="absolute bottom-[10%] left-[-10%] w-[500px] h-[500px] bg-[#e2e8f0]/5 rounded-full blur-[120px]" />
        </div>

        <div className="max-w-md w-full text-center relative z-10 animate-fade-in-up">
          <div className="relative inline-block mb-8">
             <HeartIcon className="mx-auto h-24 w-24 text-[#e2e8f0]/20" />
             <SparkleStar style={{ top: '-10px', right: '-10px', width: '20px', height: '20px' }} />
          </div>
          
          <h2 className="text-4xl font-display font-bold text-[#f8fafc] mb-4">Your collection is empty</h2>
          <p className="text-[#94a3b8] mb-10 text-lg">
            Reserve your favorite pieces of timeless brilliance here.
          </p>
          <Link
            to="/products"
            className="btn-silver"
          >
            <ArrowRightIcon className="w-5 h-5 mr-2" />
            Discover Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] py-20 relative overflow-hidden">
      {/* Background Accents */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[-5%] w-[400px] h-[400px] bg-[#bae6fd]/5 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="section-label justify-center mb-6">Your Sanctuary</div>
          <h1 className="text-5xl font-display font-bold text-[#f8fafc] mb-4">Wishlist</h1>
          <p className="text-[#94a3b8] tracking-[0.1em] uppercase text-xs font-semibold">
            {wishlist.length} Curated Treasure{wishlist.length !== 1 ? 's' : ''}
          </p>
          <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-[#e2e8f0] to-transparent mx-auto mt-8" />
        </div>

        {/* Wishlist Items */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {wishlist.map((product) => (
            <div key={product.id} className="card-3d group">
              <div className="card-3d-inner h-full">
                <div className="glass h-full rounded-[32px] border border-[rgba(226,232,240,0.1)] overflow-hidden flex flex-col hover:border-[#e2e8f0]/40 transition-all duration-500 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
                  {/* Product Image Area */}
                  <div className="aspect-[4/5] relative overflow-hidden bg-[#0f172a]/50">
                    <div className="w-full h-full flex items-center justify-center relative">
                      {/* Fake Image Placeholder with Luxe styling */}
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#020617]/40 z-10" />
                      <div className="text-center p-6 relative z-20">
                        <div className="w-24 h-24 rounded-full border border-[#e2e8f0]/20 flex items-center justify-center p-4 group-hover:border-[#e2e8f0]/40 transition-colors">
                          <SparklesIcon className="h-full w-full text-[#e2e8f0]/40" />
                        </div>
                      </div>
                      <SparkleStar style={{ top: '15%', right: '15%', width: '15px', height: '15px', animationDelay: '0.2s' }} />
                    </div>
                    
                    {/* Remove from wishlist button */}
                    <button
                      onClick={() => removeFromWishlist(product.id)}
                      className="absolute top-4 right-4 w-10 h-10 glass rounded-full flex items-center justify-center z-30 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 hover:bg-red-500/20 hover:border-red-500/50"
                      title="Remove from favorites"
                    >
                      <TrashIcon className="h-4 w-4 text-[#94a3b8] hover:text-red-400" />
                    </button>
                  </div>

                  {/* Product Info */}
                  <div className="p-6 flex-1 flex flex-col bg-[#020617]/20 backdrop-blur-sm">
                    <div className="mb-4">
                      <h3 className="font-display text-xl font-bold text-[#f8fafc] mb-2 line-clamp-1 group-hover:text-silver-gradient transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-[#64748b] text-xs leading-relaxed line-clamp-2">
                        {product.description}
                      </p>
                    </div>
                    
                    {/* Price and Add button */}
                    <div className="mt-auto pt-4 border-t border-[rgba(226,232,240,0.05)]">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex flex-col">
                           <span className="text-[10px] text-[#64748b] font-bold uppercase tracking-widest mb-1">Value</span>
                           <span className="text-xl font-bold text-[#e2e8f0]">₹{product.price}</span>
                        </div>
                        <Link
                          to={`/products/${product.id}`}
                          className="w-10 h-10 glass rounded-xl flex items-center justify-center hover:border-[#e2e8f0]/50 transition-all"
                        >
                          <ArrowRightIcon className="h-4 w-4 text-[#94a3b8]" />
                        </Link>
                      </div>

                      <button
                        onClick={() => handleAddToCart(product)}
                        className="btn-silver w-full py-3 rounded-2xl flex items-center justify-center group/btn"
                      >
                        <ShoppingCartIcon className="h-4 w-4 mr-2 group-hover/btn:scale-110 transition-transform" />
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Action */}
        <div className="mt-20 flex justify-center">
          <Link
            to="/products"
            className="btn-outline px-10"
          >
            <SparklesIcon className="w-4 h-4 mr-2" />
            Continue the Brilliance
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Wishlist;

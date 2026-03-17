import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  StarIcon,
  HeartIcon,
  ShareIcon,
  ShoppingCartIcon,
  TruckIcon,
  ShieldCheckIcon,
  ArrowLeftIcon,
  GiftIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid, HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { useCart } from '../context/CartContext';
import apiService from '../services/api';

/* ── Sparkle Component ── */
const SparkleStar = ({ style }) => (
  <svg className="sparkle" style={style} viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M80 0C80 0 84.5 59.5 160 80C160 80 84.5 100.5 80 160C80 160 75.5 100.5 0 80C0 80 75.5 59.5 80 0Z" fill="currentColor"/>
  </svg>
);

const RatingStars = ({ rating }) => (
  <div className="flex gap-1">
    {[...Array(5)].map((_, i) => (
      <StarSolid
        key={i}
        className={`h-4 w-4 ${i < Math.floor(rating) ? 'text-[#e2e8f0]' : 'text-[#334155]'}`}
      />
    ))}
  </div>
);

// Data will be fetched dynamically via API

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, addToWishlist, removeFromWishlist, isInCart, isInWishlist } = useCart();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const p = await apiService.getProductById(id);
        if (p) {
          const images = Array.isArray(p.images) && p.images.length > 0 
            ? p.images 
            : (typeof p.images === 'string' ? [p.images] : ['https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&h=800&fit=crop']);

          const pPrice = parseFloat(p.price) || 0;
          const pOriginalPrice = parseFloat(p.original_price || p.originalPrice || p.price) || 0;
          const discount = Math.round(((pOriginalPrice - pPrice) / pOriginalPrice) * 100) || 0;

          setProduct({
            id: p.id,
            name: p.name || 'Unknown Product',
            description: p.description || '',
            price: pPrice,
            originalPrice: pOriginalPrice,
            discount: discount,
            category: p.category?.name || 'Unassigned',
            images: images,
            specifications: p.specifications || {},
            rating: p.rating || 4.5,
            reviews: p.reviews || 20,
            inStock: (p.stock > 0),
            sku: p.sku || `SKU-${p.id?.substring(0, 5) || Math.floor(Math.random() * 10000)}`
          });

          // Fetch related products (using category name or ID)
          const categoryFilter = p.category?.id || p.category_id;
          if (categoryFilter) {
            const relRes = await apiService.getProducts({ 
              category: categoryFilter,
              limit: 4
            });
            const relData = relRes?.products || relRes || [];
            setRelatedProducts(relData.filter(rp => rp.id !== p.id).map(rp => ({
              id: rp.id,
              name: rp.name,
              price: rp.price,
              image: Array.isArray(rp.images) ? rp.images[0] : rp.images || 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&h=800&fit=crop',
              rating: rp.rating || 4.5
            })));
          }
        } else {
          setProduct(null);
        }
      } catch (err) {
        console.error("Error fetching product:", err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProduct();
  }, [id]);

  useEffect(() => {
    if (product) {
      setIsWishlisted(isInWishlist(product.id));
    }
  }, [product, isInWishlist]);

  if (loading) {
    return <div className="min-h-screen bg-[#020617] text-[#e2e8f0] flex justify-center items-center pt-28 pb-16">Loading product...</div>;
  }

  if (!product) {
    return <div className="min-h-screen bg-[#020617] text-[#e2e8f0] flex justify-center items-center pt-28 pb-16">Product not found.</div>;
  }

  const notify = (msg, type = 'success') => {
    window.dispatchEvent(new CustomEvent('showNotification', { detail: { message: msg, type } }));
  };

  const handleAddToCart = () => {
    addToCart({ ...product, quantity });
    notify(`${quantity} × ${product.name} added to cart!`);
  };

  const handleBuyNow = () => {
    addToCart({ ...product, quantity });
    navigate('/cart');
  };

  const handleWishlistToggle = () => {
    if (isWishlisted) {
      removeFromWishlist(product.id);
      setIsWishlisted(false);
      notify(`${product.name} removed from wishlist`, 'info');
    } else {
      addToWishlist(product);
      setIsWishlisted(true);
      notify(`${product.name} added to wishlist!`);
    }
  };

  const handleShare = (platform) => {
    const url = window.location.href;
    const text = `Check out ${product.name} from Saram Jewels!`;
    if (platform === 'copy') {
      navigator.clipboard.writeText(url);
      notify('Link copied!');
    } else if (platform === 'whatsapp') {
      window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
    } else if (platform === 'share' && navigator.share) {
      navigator.share({ title: product.name, text, url });
    }
    setShowShareMenu(false);
  };

  return (
    <div className="min-h-screen bg-[#020617] pt-28 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-[#64748b] mb-10">
          <Link to="/" className="hover:text-[#e2e8f0] transition-colors">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-[#e2e8f0] transition-colors">Products</Link>
          <span>/</span>
          <span className="text-[#94a3b8]">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">

          {/* ── Image Gallery ── */}
          <div className="space-y-4">
            {/* Main image */}
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-[#0f172a] border border-[#334155] group card-3d">
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 animate-float"
              />
              
              {/* Sparkles on image */}
              <SparkleStar style={{ top: '15%', left: '20%', width: '20px', height: '20px' }} />
              <SparkleStar style={{ bottom: '25%', right: '15%', width: '15px', height: '15px', animationDelay: '0.8s' }} />
              
              {/* Discount badge */}
              <div className="absolute top-4 left-4">
                <span className="bg-red-500/20 border border-red-500/30 text-red-400 text-sm font-semibold px-3 py-1 rounded-full">
                  -{product.discount}% OFF
                </span>
              </div>
              {/* Actions overlay */}
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                <button
                  onClick={handleWishlistToggle}
                  className="w-10 h-10 rounded-full glass flex items-center justify-center transition-all duration-200 hover:border-red-400/50"
                  title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  {isWishlisted
                    ? <HeartSolid className="h-5 w-5 text-red-400" />
                    : <HeartIcon className="h-5 w-5 text-[#94a3b8]" />}
                </button>
                <div className="relative">
                  <button
                    onClick={() => setShowShareMenu(!showShareMenu)}
                    className="w-10 h-10 rounded-full glass flex items-center justify-center text-[#94a3b8] hover:text-[#e2e8f0] transition-colors"
                  >
                    <ShareIcon className="h-5 w-5" />
                  </button>
                  {showShareMenu && (
                    <div className="absolute right-12 top-0 glass rounded-xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.8)] border border-[rgba(226,232,240,0.15)] w-44 animate-slide-down">
                      {[
                        { label: 'Copy Link', action: 'copy' },
                        { label: 'WhatsApp', action: 'whatsapp' },
                      ].map((s) => (
                        <button
                          key={s.action}
                          onClick={() => handleShare(s.action)}
                          className="w-full text-left px-4 py-2.5 text-sm text-[#94a3b8] hover:text-[#e2e8f0] hover:bg-white/5 transition-colors"
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Thumbnails */}
            <div className="grid grid-cols-4 gap-3">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`aspect-square rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                    selectedImage === i
                      ? 'border-[#e2e8f0] shadow-[0_0_12px_rgba(226,232,240,0.3)]'
                      : 'border-[#334155] hover:border-[rgba(226,232,240,0.4)]'
                  }`}
                >
                  <img src={img} alt={`${product.name} ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* ── Product Info ── */}
          <div className="space-y-6">
            <div>
              <span className="text-[#64748b] text-xs uppercase tracking-widest">{product.category}</span>
              <h1 className="font-display text-4xl font-bold text-[#ffffff] mt-2 mb-4 leading-tight">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-3 mb-6">
                <RatingStars rating={product.rating} />
                <span className="text-[#94a3b8] text-sm">{product.rating}</span>
                <span className="text-[#64748b] text-sm">({product.reviews} reviews)</span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-4 mb-2">
                <span className="font-display text-4xl font-bold text-[#e2e8f0]">
                  ₹{product.price}
                </span>
                <span className="text-[#64748b] text-xl line-through">
                  ₹{product.originalPrice}
                </span>
                <span className="badge-silver">{product.discount}% OFF</span>
              </div>
              <p className="text-green-400 text-sm mb-6">✓ In Stock — Ships within 2–4 business days</p>
            </div>

            <div className="divider-silver" />

            {/* Tabs */}
            <div>
              <div className="flex gap-1 border-b border-[#334155] mb-5">
                {['description', 'specifications'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2.5 text-sm font-medium capitalize transition-all duration-200 border-b-2 -mb-px ${
                      activeTab === tab
                        ? 'border-[#e2e8f0] text-[#e2e8f0]'
                        : 'border-transparent text-[#64748b] hover:text-[#94a3b8]'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {activeTab === 'description' ? (
                <p className="text-[#94a3b8] leading-relaxed text-sm">{product.description}</p>
              ) : (
                <div className="space-y-3">
                  {Object.entries(product.specifications).map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between py-2 border-b border-[#1e293b]">
                      <span className="text-[#64748b] text-sm">{k}</span>
                      <span className="text-[#94a3b8] text-sm font-medium">{v}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-4">
              <span className="text-xs text-[#94a3b8] font-semibold uppercase tracking-widest">Qty:</span>
              <div className="flex items-center border border-[#334155] rounded-lg overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2.5 text-[#64748b] hover:text-[#e2e8f0] hover:bg-[#1e293b] transition-colors"
                >
                  −
                </button>
                <span className="px-5 py-2.5 text-[#ffffff] font-medium border-x border-[#334155] min-w-[48px] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(10, quantity + 1))}
                  className="px-4 py-2.5 text-[#64748b] hover:text-[#e2e8f0] hover:bg-[#1e293b] transition-colors"
                >
                  +
                </button>
              </div>
              <span className="text-[#64748b] text-sm">= ₹{(product.price * quantity).toLocaleString()}</span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleAddToCart}
                className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 rounded-xl font-semibold text-sm transition-all duration-200 ${
                  isInCart(product.id)
                    ? 'bg-[rgba(226,232,240,0.15)] border border-[#e2e8f0] text-[#e2e8f0]'
                    : 'btn-silver'
                }`}
              >
                <ShoppingCartIcon className="h-5 w-5" />
                {isInCart(product.id) ? 'Added to Cart ✓' : 'Add to Cart'}
              </button>
              <button
                onClick={handleBuyNow}
                className="flex-1 btn-outline py-4 px-6"
              >
                Buy Now
              </button>
            </div>

            {/* Trust indicators */}
            <div className="grid grid-cols-3 gap-4 pt-2 border-t border-[#1e293b]">
              {[
                { Icon: TruckIcon, label: 'Free Delivery', sub: 'Above ₹999' },
                { Icon: ShieldCheckIcon, label: 'Secure Pay', sub: 'SSL Encrypted' },
                { Icon: GiftIcon, label: 'Gift Wrap', sub: 'Free on all orders' },
              ].map(({ Icon, label, sub }) => (
                <div key={label} className="flex flex-col items-center text-center gap-1.5">
                  <Icon className="h-5 w-5 text-[#e2e8f0]" />
                  <span className="text-[#ffffff] text-xs font-medium">{label}</span>
                  <span className="text-[#64748b] text-[10px]">{sub}</span>
                </div>
              ))}
            </div>

            {/* SKU */}
            <p className="text-[#64748b] text-xs">SKU: {product.sku}</p>
          </div>
        </div>

        {/* ── Reviews ── */}
        <div className="mb-20">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="section-label mb-2">Reviews</div>
              <h2 className="font-display text-3xl font-bold text-[#ffffff]">
                Customer Stories
              </h2>
            </div>
            <button className="btn-outline text-sm">Write a Review</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {reviews.map((r) => (
              <div key={r.id} className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#e2e8f0] to-[#94a3b8] flex items-center justify-center text-[#020617] text-sm font-bold">
                      {r.user.charAt(0)}
                    </div>
                    <div>
                      <p className="text-[#ffffff] font-medium text-sm">{r.user}</p>
                      <p className="text-[#64748b] text-xs">{r.city}</p>
                    </div>
                  </div>
                  <span className="text-[#64748b] text-xs">{r.date}</span>
                </div>
                <RatingStars rating={r.rating} />
                <p className="text-[#94a3b8] text-sm leading-relaxed mt-3 italic">"{r.comment}"</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Related Products ── */}
        <div>
          <div className="section-label mb-4">You May Also Like</div>
          <h2 className="font-display text-3xl font-bold text-[#ffffff] mb-8">
            Related Pieces
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {relatedProducts.map((p) => (
              <Link
                key={p.id}
                to={`/products/${p.id}`}
                className="card group overflow-hidden"
              >
                <div className="aspect-square overflow-hidden bg-[#0f172a]">
                  <img
                    src={p.image} alt={p.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-[#ffffff] text-sm font-medium mb-2 line-clamp-1 group-hover:text-[#e2e8f0] transition-colors">
                    {p.name}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="text-[#e2e8f0] font-bold">₹{p.price}</span>
                    <div className="flex items-center gap-1">
                      <StarSolid className="h-3.5 w-3.5 text-[#e2e8f0]" />
                      <span className="text-[#64748b] text-xs">{p.rating}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProductDetail;

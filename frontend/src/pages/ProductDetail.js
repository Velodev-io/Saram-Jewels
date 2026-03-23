import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  HeartIcon,
  ShareIcon,
  ShoppingCartIcon,
  TruckIcon,
  ShieldCheckIcon,
  GiftIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid, HeartIcon as HeartSolid, PlayIcon } from '@heroicons/react/24/solid';
import { useCart } from '../context/CartContext';
import apiService from '../services/api';

/* ── Sparkle Component ── */
const SparkleStar = ({ style }) => (
  <svg className="sparkle" style={style} viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M80 0C80 0 84.5 59.5 160 80C160 80 84.5 100.5 80 160C80 160 75.5 100.5 0 80C0 80 75.5 59.5 80 0Z" fill="currentColor" />
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
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviews] = useState([]);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-slide functionality
  useEffect(() => {
    if (!product || product.images.length <= 1 || !isAutoPlaying || selectedImage === 'video') return;

    const interval = setInterval(() => {
      setSelectedImage(prev => typeof prev === 'number' ? (prev + 1) % product.images.length : 0);
    }, 3000);

    return () => clearInterval(interval);
  }, [product, isAutoPlaying, selectedImage]);

  const handlePreviousImage = (e) => {
    e?.stopPropagation();
    setIsAutoPlaying(false);
    if (!product) return;
    setSelectedImage(prev => {
      if (prev === 'video') return product.images.length - 1;
      return prev === 0 ? (product.video ? 'video' : product.images.length - 1) : prev - 1;
    });
  };

  const handleNextImage = (e) => {
    e?.stopPropagation();
    setIsAutoPlaying(false);
    if (!product) return;
    setSelectedImage(prev => {
      if (prev === 'video') return 0;
      if (prev === product.images.length - 1 && product.video) return 'video';
      return (prev + 1) % product.images.length;
    });
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const p = await apiService.getProductById(id);
        if (p && p.status === 'active') {
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
            colors: Array.isArray(p.colors) ? p.colors : (typeof p.colors === 'string' ? JSON.parse(p.colors) : []),
            sizes: Array.isArray(p.sizes) ? p.sizes : (typeof p.sizes === 'string' ? JSON.parse(p.sizes) : []),
            video: p.video || null,
            rating: p.rating || 4.5,
            reviews: p.reviews || 20,
            inStock: (p.stock > 0),
            stock: parseInt(p.stock) || 0,
            sku: p.sku || `SKU-${p.id?.substring(0, 5) || Math.floor(Math.random() * 10000)}`
          });

          if (Array.isArray(p.colors) && p.colors.length > 0) {
            const firstAvail = p.colors.find(c => !c.outOfStock);
            setSelectedColor(firstAvail ? firstAvail.name : p.colors[0].name);
          }
          if (Array.isArray(p.sizes) && p.sizes.length > 0) {
            setSelectedSize(p.sizes[0]);
          }

          // Fetch related products (using category name or ID)
          const categoryFilter = p.category?.id || p.category_id;
          if (categoryFilter) {
            const relRes = await apiService.getProducts({
              category: categoryFilter,
              limit: 8
            });
            const relData = relRes?.products || relRes || [];
            // ONLY SHOW ACTIVE RELATED PRODUCTS
            setRelatedProducts(relData
              .filter(rp => rp.id !== p.id && rp.status === 'active')
              .slice(0, 4)
              .map(rp => ({
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
    if (product.sizes?.length > 0 && !selectedSize) {
      alert('Please select a size before adding to cart.');
      return;
    }
    if (product.colors?.length > 0 && !selectedColor) {
      alert('Please select a color before adding to cart.');
      return;
    }

    addToCart({ ...product, quantity, selectedColor, selectedSize });
    notify(`${quantity} × ${product.name} added to cart!`);
  };

  const handleBuyNow = () => {
    if (product.sizes?.length > 0 && !selectedSize) {
      alert('Please select a size before buying.');
      return;
    }
    if (product.colors?.length > 0 && !selectedColor) {
      alert('Please select a color before buying.');
      return;
    }

    addToCart({ ...product, quantity, selectedColor, selectedSize });
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
            {/* Main image with slider */}
            <div
              className="relative aspect-square rounded-2xl overflow-hidden bg-[#0f172a] border border-[#334155] group card-3d"
              onMouseEnter={() => setIsAutoPlaying(false)}
              onMouseLeave={() => setIsAutoPlaying(true)}
            >
              {selectedImage === 'video' ? (
                <video
                  src={product.video}
                  controls
                  autoPlay
                  className="w-full h-full object-cover outline-none"
                />
              ) : (
                <img
                  src={product.images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 animate-float"
                />
              )}

              {/* Sparkles on image */}
              <SparkleStar style={{ top: '15%', left: '20%', width: '20px', height: '20px' }} />
              <SparkleStar style={{ bottom: '25%', right: '15%', width: '15px', height: '15px', animationDelay: '0.8s' }} />

              {/* Discount badge */}
              <div className="absolute top-4 left-4">
                <span className="bg-red-500/20 border border-red-500/30 text-red-400 text-sm font-semibold px-3 py-1 rounded-full">
                  -{product.discount}% OFF
                </span>
              </div>

              {/* Slider Navigation Arrows */}
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={handlePreviousImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full glass flex items-center justify-center transition-all duration-200 hover:bg-white/20 opacity-0 group-hover:opacity-100"
                    aria-label="Previous image"
                  >
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full glass flex items-center justify-center transition-all duration-200 hover:bg-white/20 opacity-0 group-hover:opacity-100"
                    aria-label="Next image"
                  >
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>

                  {/* Image Counter */}
                  <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full text-white text-sm">
                    {selectedImage + 1} / {product.images.length}
                  </div>

                  {/* Slider Indicators/Dots */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {product.images.map((_, i) => (
                      <button
                        key={i}
                        onClick={(e) => { e.stopPropagation(); setSelectedImage(i); setIsAutoPlaying(false); }}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${selectedImage === i
                            ? 'bg-white w-4'
                            : 'bg-white/50 hover:bg-white/80'
                          }`}
                        aria-label={`Go to image ${i + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}

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
                  className={`aspect-square rounded-xl overflow-hidden border-2 transition-all duration-200 ${selectedImage === i
                    ? 'border-[#e2e8f0] shadow-[0_0_12px_rgba(226,232,240,0.3)]'
                    : 'border-[#334155] hover:border-[rgba(226,232,240,0.4)]'
                    }`}
                >
                  <img src={img} alt={`${product.name} ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
              {product.video && (
                <button
                  onClick={() => setSelectedImage('video')}
                  className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all duration-200 flex items-center justify-center ${selectedImage === 'video'
                    ? 'border-[#e2e8f0] shadow-[0_0_12px_rgba(226,232,240,0.3)]'
                    : 'border-[#334155] hover:border-[rgba(226,232,240,0.4)]'
                    }`}
                >
                  <video src={product.video} className="absolute inset-0 w-full h-full object-cover opacity-40 pointer-events-none" />
                  <div className="relative z-10 w-8 h-8 rounded-full bg-black/60 shadow-[0_0_15px_rgba(0,0,0,0.5)] flex items-center justify-center border border-white/20 backdrop-blur-md">
                    <PlayIcon className="h-4 w-4 text-white ml-0.5" />
                  </div>
                </button>
              )}
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

            {/* Description */}
            <div className="mb-6">
              <p className="text-[#94a3b8] leading-relaxed text-sm">{product.description}</p>
            </div>

            {/* Variants */}
            {(product.colors?.length > 0 || product.sizes?.length > 0) && (
              <div className="space-y-6">
                {product.colors?.length > 0 && (
                  <div>
                    <span className="text-xs text-[#94a3b8] font-semibold uppercase tracking-widest block mb-3">Color: {selectedColor}</span>
                    <div className="flex flex-wrap gap-3">
                      {product.colors.map(color => (
                        <button
                          key={color.name}
                          onClick={() => !color.outOfStock && setSelectedColor(color.name)}
                          disabled={color.outOfStock}
                          className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${
                            color.outOfStock 
                              ? 'opacity-30 cursor-not-allowed border-transparent relative overflow-hidden' 
                              : selectedColor === color.name 
                                ? 'border-[#e2e8f0]' 
                                : 'border-transparent hover:border-[#64748b]'
                          }`}
                          style={{ backgroundColor: color.hex || '#ccc' }}
                          title={color.outOfStock ? `${color.name} - Out of Stock` : color.name}
                        >
                          {color.outOfStock && (
                            <div className="absolute inset-0 flex items-center justify-center -rotate-45 text-[#020617] font-bold bg-black/60 w-full h-full text-[8px] uppercase">
                              Wait
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {product.sizes?.length > 0 && (
                  <div>
                    <span className="text-xs text-[#94a3b8] font-semibold uppercase tracking-widest block mb-3">Size: {selectedSize}</span>
                    <div className="flex flex-wrap gap-3">
                      {product.sizes.map(size => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                            selectedSize === size
                              ? 'border-[#e2e8f0] text-[#e2e8f0] bg-white/5'
                              : 'border-[#334155] text-[#94a3b8] hover:border-[#64748b] hover:text-[#e2e8f0]'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

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
                  onClick={() => {
                    const maxQty = product.stock > 0 ? product.stock : 10;
                    if (quantity < maxQty) {
                      setQuantity(quantity + 1);
                    } else if (product.stock > 0) {
                      notify(`Maximum vault allowance reached (${product.stock} available)`, 'info');
                    }
                  }}
                  className={`px-4 py-2.5 transition-colors ${
                    product.stock > 0 && quantity >= product.stock
                      ? 'text-[#334155] cursor-not-allowed'
                      : 'text-[#64748b] hover:text-[#e2e8f0] hover:bg-[#1e293b]'
                  }`}
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
                className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 rounded-xl font-semibold text-sm transition-all duration-200 ${isInCart(product.id)
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
                { Icon: GiftIcon, label: 'Gift Wrap', sub: '₹500 extra' },
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
            <button onClick={() => alert('The review system is temporarily down for maintenance. Please check back later.')} className="btn-outline text-sm">Write a Review</button>
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

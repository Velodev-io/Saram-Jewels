import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Squares2X2Icon,
  ListBulletIcon,
  MagnifyingGlassIcon,
  HeartIcon,
  ShoppingCartIcon,
  StarIcon,
  SparklesIcon,
  FunnelIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { useCart } from '../context/CartContext';
import apiService from '../services/api';

/* ── Sparkle Component ── */
const SparkleStar = ({ style }) => (
  <svg className="sparkle" style={style} viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M80 0C80 0 84.5 59.5 160 80C160 80 84.5 100.5 80 160C80 160 75.5 100.5 0 80C0 80 75.5 59.5 80 0Z" fill="currentColor"/>
  </svg>
);

/* ── Fallback image placeholder ── */
const PlaceholderImg = ({ name }) => (
  <div className="w-full h-full flex items-center justify-center bg-[#0f172a]">
    <div className="text-center">
      <SparklesIcon className="h-12 w-12 text-[#e2e8f0]/30 mx-auto mb-2" />
      <span className="text-[#64748b] text-xs">{name}</span>
    </div>
  </div>
);

// Products and categories will be fetched from API

const priceRanges = [
  { id: 'all', name: 'All Prices' },
  { id: '0-500', name: 'Under ₹500' },
  { id: '500-1000', name: '₹500 – ₹1000' },
  { id: '1000-2000', name: '₹1000 – ₹2000' },
  { id: '2000-', name: 'Above ₹2000' },
];

const sortOptions = [
  { id: 'featured', name: 'Featured' },
  { id: 'price-low', name: 'Price: Low → High' },
  { id: 'price-high', name: 'Price: High → Low' },
  { id: 'rating', name: 'Top Rated' },
  { id: 'newest', name: 'Newest' },
];

const RatingStars = ({ rating, size = 'sm' }) => {
  const cls = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';
  return (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <StarIcon
          key={i}
          className={`${cls} ${
            i < Math.floor(rating)
              ? 'text-[#e2e8f0] fill-[#e2e8f0]'
              : 'text-[#334155] fill-[#334155]'
          }`}
        />
      ))}
    </div>
  );
};

const ProductCard = ({ product, viewMode, onAddToCart, onWishlistToggle, inCart, inWishlist }) => {
  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

  if (viewMode === 'list') {
    return (
      <div className="card flex gap-6 p-4">
        <div className="w-36 h-36 flex-shrink-0 rounded-xl overflow-hidden bg-[#0f172a]">
          <img
            src={product.images[0]}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>
        <div className="flex-1 flex flex-col justify-between py-1">
          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-[#64748b] text-xs uppercase tracking-widest">{product.category}</span>
                <h3 className="text-[#ffffff] font-semibold mt-0.5 line-clamp-1">{product.name}</h3>
              </div>
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onWishlistToggle(product); }}
                className="text-[#64748b] hover:text-red-400 transition-colors p-1 flex-shrink-0"
              >
                {inWishlist ? <HeartSolid className="h-5 w-5 text-red-400" /> : <HeartIcon className="h-5 w-5" />}
              </button>
            </div>
            <p className="text-[#64748b] text-sm mt-2 line-clamp-2">{product.description}</p>
          </div>
          <div className="flex items-center justify-between mt-4 flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <span className="text-[#e2e8f0] font-bold text-xl">₹{product.price}</span>
              <span className="text-[#64748b] text-sm line-through">₹{product.originalPrice}</span>
              <span className="badge-silver">{discount}% OFF</span>
            </div>
            <div className="flex gap-2">
              <Link to={`/products/${product.id}`} className="btn-ghost text-xs py-2 px-4">
                View
              </Link>
              <button
                onClick={() => onAddToCart(product)}
                className="btn-silver text-xs py-2 px-4"
              >
                <ShoppingCartIcon className="h-4 w-4" />
                {inCart ? 'In Cart' : 'Add to Cart'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card-3d">
    <div className="card group relative card-3d-inner transform-gpu">
      {/* Product Image */}
      <div className="relative overflow-hidden aspect-square rounded-t-[20px] bg-[#0f172a]">
        <img
          src={product.images[0]}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
        />
        <PlaceholderImg name={product.name} style={{ display: 'none' }} />
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-[#020617]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.isFeatured && (
            <span className="badge-silver text-[10px] relative group overflow-hidden">
              ★ Featured
              <SparkleStar style={{ top: '-4px', right: '-4px', width: '8px', height: '8px' }} />
            </span>
          )}
          {discount > 0 && (
            <span className="bg-red-500/20 border border-red-500/30 text-red-400 text-[10px] font-semibold px-2 py-0.5 rounded-full">
              -{discount}%
            </span>
          )}
        </div>

        {/* Wishlist */}
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onWishlistToggle(product); }}
          className="absolute z-10 top-3 right-3 w-9 h-9 rounded-full glass flex items-center justify-center text-[#64748b] hover:text-red-400 transition-all duration-200 opacity-100 shadow-md"
        >
          {inWishlist ? <HeartSolid className="h-4.5 w-4.5 text-red-400" /> : <HeartIcon className="h-4.5 w-4.5" />}
        </button>

        {/* Quick View on hover */}
        <div className="absolute bottom-4 left-4 right-4 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
          <Link
            to={`/products/${product.id}`}
            className="btn-ghost w-full text-xs py-2 justify-center bg-[#020617]/80"
          >
            Quick View
          </Link>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-5">
        <span className="text-[#64748b] text-[10px] uppercase tracking-widest">{product.category}</span>
        <h3 className="text-[#ffffff] font-medium mt-1 mb-3 line-clamp-1 group-hover:text-[#bae6fd] transition-colors duration-200">
          {product.name}
        </h3>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[#e2e8f0] font-bold text-lg">₹{product.price}</span>
            <span className="text-[#64748b] text-xs line-through ml-2">₹{product.originalPrice}</span>
          </div>
          <button
            onClick={() => onAddToCart(product)}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ${
              inCart
                ? 'bg-[#e2e8f0] text-[#020617]'
                : 'bg-[#1e293b] border border-[rgba(226,232,240,0.2)] text-[#94a3b8] hover:border-[#e2e8f0] hover:text-[#e2e8f0]'
            }`}
            title={inCart ? 'In Cart' : 'Add to Cart'}
          >
            <ShoppingCartIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
      </div>
    </div>
  );
};

const ProductList = () => {
  const [viewMode, setViewMode] = useState('grid');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const { addToCart, addToWishlist, removeFromWishlist, isInCart, isInWishlist } = useCart();
  const location = useLocation();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([{ id: 'all', name: 'All' }]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productsData, categoriesData] = await Promise.all([
          apiService.getProducts(),
          apiService.getCategories()
        ]);
        
        const formattedProducts = (productsData?.products || productsData || []).map(p => ({
          id: p.id,
          name: p.name || 'Unknown Product',
          description: p.description || '',
          price: parseFloat(p.price) || 0,
          originalPrice: parseFloat(p.original_price || p.originalPrice || p.price) || 0,
          categoryName: p.category?.name || 'unassigned',
          categoryId: p.category?.id || p.category_id || 'unassigned',
          category: p.category?.name || p.category_id || 'unassigned',
          images: Array.isArray(p.images) && p.images.length > 0 
            ? p.images 
            : (typeof p.images === 'string' ? [p.images] : ['https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&h=600&fit=crop']),
          rating: parseFloat(p.rating) || 4.5,
          reviews: parseInt(p.reviews) || 20,
          isFeatured: p.is_featured || false,
          stock: parseInt(p.stock) || 0,
          status: p.status || 'active'
        }));
        
        const formattedCategories = [
          { id: 'all', name: 'All' },
          ...(categoriesData || [])
            .filter(c => c.status === 'active' || !c.status)
            .map(c => ({
              id: c.id,
              name: c.name || `Category ${c.id}`
            }))
        ];
        
        setProducts(formattedProducts);
        setCategories(formattedCategories);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setTimeout(() => setLoading(false), 400); // Slight delay for smoother transition
      }
    };
    fetchData();
  }, []);

  const CategorySkeleton = () => (
    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 mb-8">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex-shrink-0 w-24 h-9 bg-[#1e293b] rounded-full animate-pulse" />
      ))}
    </div>
  );

  const ProductSkeleton = () => (
    <div className={viewMode === 'list' ? 'flex flex-col gap-4' : 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5'}>
       {[...Array(6)].map((_, i) => (
         <div key={i} className="bg-[#1e293b] rounded-[20px] overflow-hidden border border-[#334155]/20 animate-pulse">
            <div className="aspect-square bg-[#0f172a]" />
            <div className="p-5 space-y-3">
               <div className="h-2 w-16 bg-[#334155] rounded" />
               <div className="h-4 w-3/4 bg-[#334155] rounded" />
               <div className="h-3 w-1/2 bg-[#334155] rounded" />
            </div>
         </div>
       ))}
    </div>
  );

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const s = params.get('search');
    const c = params.get('category');
    if (s) setSearchQuery(s);
    if (c) setSelectedCategory(c);
  }, [location.search]);

  const filtered = products.filter((p) => {
    const matchesSearch =
      !searchQuery ||
      (p.name && p.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = selectedCategory === 'all' || String(p.categoryId) === String(selectedCategory);
    let matchesPrice = true;
    if (priceRange !== 'all') {
      const [min, max] = priceRange.split('-').map(Number);
      matchesPrice = max ? p.price >= min && p.price <= max : p.price >= min;
    }
    const isActive = p.status === 'active';
    return matchesSearch && matchesCat && matchesPrice && isActive;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
    if (sortBy === 'newest') return b.id - a.id;
    return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
  });

  const notify = (msg, type = 'success') => {
    window.dispatchEvent(new CustomEvent('showNotification', { detail: { message: msg, type } }));
  };

  const handleAddToCart = (product) => {
    addToCart({ ...product, quantity: 1 });
    notify(`${product.name} added to cart!`);
  };

  const handleWishlistToggle = (product) => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
      notify(`${product.name} removed from wishlist`, 'info');
    } else {
      addToWishlist(product);
      notify(`${product.name} added to wishlist!`);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] pt-28 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-10">
          <div className="section-label mb-3">
            {searchQuery ? 'Search Results' : 'Our Store'}
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-[#ffffff]">
            {searchQuery
              ? `"${searchQuery}"`
              : selectedCategory !== 'all'
              ? categories.find((c) => c.id === selectedCategory)?.name
              : 'All Products'}
          </h1>
          <p className="text-[#64748b] mt-2">
            Showing <span className="text-[#e2e8f0]">{sorted.length}</span> of {products.length} pieces
          </p>
        </div>

        {/* Category Pills */}
        {loading ? <CategorySkeleton /> : (
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 mb-8">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex-shrink-0 px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedCategory === cat.id
                    ? 'bg-[#e2e8f0] text-[#020617] shadow-[0_0_16px_rgba(226,232,240,0.3)]'
                    : 'bg-[#1e293b] border border-[#334155] text-[#94a3b8] hover:border-[rgba(226,232,240,0.3)] hover:text-[#e2e8f0]'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        <div className="flex gap-8">
          {/* ── Sidebar Filters (Desktop) ── */}
          <aside className="hidden lg:block w-56 flex-shrink-0 space-y-8">
            {/* Price Range */}
            <div>
              <h3 className="text-[#ffffff] text-sm font-semibold uppercase tracking-widest mb-4">
                Price Range
              </h3>
              <div className="space-y-2">
                {priceRanges.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setPriceRange(r.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                      priceRange === r.id
                        ? 'bg-[rgba(226,232,240,0.1)] border border-[rgba(226,232,240,0.3)] text-[#e2e8f0]'
                        : 'text-[#64748b] hover:text-[#94a3b8] hover:bg-[#1e293b]'
                    }`}
                  >
                    {r.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort */}
            <div>
              <h3 className="text-[#ffffff] text-sm font-semibold uppercase tracking-widest mb-4">
                Sort By
              </h3>
              <div className="space-y-2">
                {sortOptions.map((o) => (
                  <button
                    key={o.id}
                    onClick={() => setSortBy(o.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                      sortBy === o.id
                        ? 'bg-[rgba(226,232,240,0.1)] border border-[rgba(226,232,240,0.3)] text-[#e2e8f0]'
                        : 'text-[#64748b] hover:text-[#94a3b8] hover:bg-[#1e293b]'
                    }`}
                  >
                    {o.name}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* ── Main Content ── */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
              {/* Search */}
              <div className="relative flex-1 min-w-0 max-w-sm">
                <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748b]" />
                <input
                  type="text"
                  placeholder="Search jewelry..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-dark !pl-11 !h-11 text-sm bg-[#020617]"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b] hover:text-[#e2e8f0]"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* Mobile filter */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden btn-ghost py-2 px-3 text-xs"
                >
                  <FunnelIcon className="h-4 w-4" /> Filters
                </button>
                {/* View toggle */}
                <div className="flex border border-[#334155] rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2.5 transition-colors ${
                      viewMode === 'grid' ? 'bg-[rgba(226,232,240,0.15)] text-[#e2e8f0]' : 'text-[#64748b] hover:text-[#94a3b8]'
                    }`}
                  >
                    <Squares2X2Icon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2.5 transition-colors border-l border-[#334155] ${
                      viewMode === 'list' ? 'bg-[rgba(226,232,240,0.15)] text-[#e2e8f0]' : 'text-[#64748b] hover:text-[#94a3b8]'
                    }`}
                  >
                    <ListBulletIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile filters panel */}
            {showFilters && (
              <div className="lg:hidden card p-5 mb-6 grid grid-cols-2 gap-4 animate-slide-down">
                <div>
                  <p className="text-[#ffffff] text-xs font-semibold uppercase tracking-widest mb-3">Price</p>
                  <select value={priceRange} onChange={(e) => setPriceRange(e.target.value)} className="input-dark text-sm h-10">
                    {priceRanges.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                </div>
                <div>
                  <p className="text-[#ffffff] text-xs font-semibold uppercase tracking-widest mb-3">Sort</p>
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="input-dark text-sm h-10">
                    {sortOptions.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
                  </select>
                </div>
              </div>
            )}

            {/* Products */}
            {loading ? <ProductSkeleton /> : (
              sorted.length === 0 ? (
                <div className="text-center py-24">
                  <SparklesIcon className="h-16 w-16 text-[#e2e8f0]/20 mx-auto mb-6" />
                  <h3 className="font-display text-2xl text-[#ffffff] mb-2">No pieces found</h3>
                  <p className="text-[#64748b] mb-8">
                    {searchQuery ? `No results for "${searchQuery}"` : 'No items in this category.'}
                  </p>
                  <button
                    onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                    className="btn-outline"
                  >
                    Clear Filters
                  </button>
                </div>
              ) : (
                <div className={
                  viewMode === 'list'
                    ? 'flex flex-col gap-4'
                    : 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5'
                }>
                  {sorted.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      viewMode={viewMode}
                      onAddToCart={handleAddToCart}
                      onWishlistToggle={handleWishlistToggle}
                      inCart={isInCart(product.id)}
                      inWishlist={isInWishlist(product.id)}
                    />
                  ))}
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductList;

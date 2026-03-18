import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ShoppingCartIcon,
  UserIcon,
  Bars3Icon,
  XMarkIcon,
  HeartIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

/* ── Sparkle Component ── */
const SparkleStar = ({ style }) => (
  <svg className="sparkle" style={style} viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M80 0C80 0 84.5 59.5 160 80C160 80 84.5 100.5 80 160C80 160 75.5 100.5 0 80C0 80 75.5 59.5 80 0Z" fill="currentColor"/>
  </svg>
);

const DiamondIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M12 2L2 8l10 14L22 8z" />
  </svg>
);

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isSignedIn, user, isLoaded, logout } = useAuth();
  const { getCartCount, getWishlistCount } = useCart();
  const profileRef = useRef(null);
  const searchRef = useRef(null);

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Collections', href: '/categories' },
    { name: 'Shop', href: '/products' },
    { name: 'Contact', href: '/contact' },
  ];

  const isActive = (path) => location.pathname === path;

  // Scroll detection
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
    setIsSearchOpen(false);
  }, [location]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsSearchOpen(false);
    }
  };

  const cartCount = getCartCount();
  const wishlistCount = getWishlistCount();

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-[#020617]/95 backdrop-blur-xl shadow-[0_2px_40px_rgba(0,0,0,0.8)] border-b border-[rgba(226,232,240,0.12)]'
          : 'bg-transparent'
      }`}
    >
      {/* Top announcement bar */}
      <div className="bg-[#e2e8f0] text-[#020617] text-center text-xs font-semibold tracking-widest uppercase py-2 px-4">
        ✦ &nbsp;Free shipping on orders above ₹499 &nbsp;✦&nbsp; Anti-tarnish American Diamond &nbsp;✦
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* ── Logo ── */}
          <Link to="/" className="flex items-center gap-3 group flex-shrink-0 relative">
            <div className="w-8 h-8 rounded-full border border-[#e2e8f0]/50 flex items-center justify-center text-[#e2e8f0] group-hover:border-[#e2e8f0] group-hover:shadow-[0_0_12px_rgba(226,232,240,0.4)] transition-all duration-300 relative">
              <DiamondIcon />
              <SparkleStar style={{ top: '-10px', right: '-10px', width: '10px', height: '10px' }} />
            </div>
            <div className="leading-none">
              <div className="font-display font-bold text-lg text-[#f8fafc] tracking-widest">
                SARAM
              </div>
              <div className="text-[9px] font-semibold tracking-[0.25em] text-[#e2e8f0] uppercase -mt-0.5">
                Jewels
              </div>
            </div>
          </Link>

          {/* ── Desktop Nav ── */}
          <nav className="hidden md:flex items-center gap-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`relative px-4 py-2 text-sm font-medium tracking-wide transition-all duration-300 group ${
                  isActive(item.href)
                    ? 'text-[#e2e8f0]'
                    : 'text-[#94a3b8] hover:text-[#f8fafc]'
                }`}
              >
                {item.name}
                <span
                  className={`absolute bottom-0 left-4 right-4 h-px bg-gradient-to-r from-[#e2e8f0] to-[#bae6fd] transition-all duration-300 ${
                    isActive(item.href)
                      ? 'opacity-100'
                      : 'opacity-0 group-hover:opacity-60'
                  }`}
                />
              </Link>
            ))}
          </nav>

          {/* ── Right Actions ── */}
          <div className="flex items-center gap-1">
            {/* Search */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2.5 text-[#94a3b8] hover:text-[#e2e8f0] transition-colors duration-200 rounded-lg hover:bg-white/5"
              aria-label="Search"
            >
              <MagnifyingGlassIcon className="h-5 w-5" />
            </button>

            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="relative p-2.5 text-[#94a3b8] hover:text-[#e2e8f0] transition-colors duration-200 rounded-lg hover:bg-white/5"
              aria-label="Wishlist"
            >
              <HeartIcon className="h-5 w-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 bg-[#e2e8f0] text-[#020617] text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center leading-none">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              className="relative p-2.5 text-[#94a3b8] hover:text-[#e2e8f0] transition-colors duration-200 rounded-lg hover:bg-white/5"
              aria-label="Cart"
            >
              <ShoppingCartIcon className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 bg-[#e2e8f0] text-[#020617] text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center leading-none">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User */}
            {!isLoaded ? (
              <div className="w-8 h-8 rounded-full bg-[#1e293b] animate-pulse" />
            ) : isSignedIn ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors group"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#e2e8f0] to-[#94a3b8] flex items-center justify-center text-[#020617] text-xs font-bold">
                    {user?.firstName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </div>
                  <span className="text-sm text-[#94a3b8] group-hover:text-[#f8fafc] transition-colors">
                    {user?.firstName || 'Account'}
                  </span>
                  <ChevronDownIcon className={`h-3.5 w-3.5 text-[#e2e8f0] transition-transform duration-200 ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="md:hidden p-2.5 text-[#94a3b8] hover:text-[#e2e8f0] transition-colors"
                >
                  <UserIcon className="h-5 w-5" />
                </button>

                {isProfileDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 animate-slide-down">
                    <div className="glass rounded-xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.8)] border border-[rgba(226,232,240,0.2)]">
                      <div className="px-4 py-3 border-b border-[rgba(226,232,240,0.15)]">
                        <p className="text-xs text-[#64748b]">Signed in as</p>
                        <p className="text-sm font-medium text-[#f8fafc] truncate">
                          {user?.email || user?.firstName}
                        </p>
                      </div>
                      {[
                        { label: 'My Profile', href: '/profile' },
                        { label: 'My Orders', href: '/profile?tab=orders' },
                        { label: 'Wishlist', href: '/wishlist' },
                      ].map((item) => (
                        <Link
                          key={item.label}
                          to={item.href}
                          onClick={() => setIsProfileDropdownOpen(false)}
                          className="block px-4 py-2.5 text-sm text-[#94a3b8] hover:text-[#e2e8f0] hover:bg-white/5 transition-colors"
                        >
                          {item.label}
                        </Link>
                      ))}
                      <div className="border-t border-[rgba(226,232,240,0.1)] mt-1">
                        <button
                          onClick={() => { logout(); setIsProfileDropdownOpen(false); }}
                          className="w-full text-left px-4 py-2.5 text-sm text-[#64748b] hover:text-red-400 hover:bg-white/5 transition-colors"
                        >
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/sign-in"
                className="hidden md:flex items-center gap-2 ml-2 btn-silver text-xs py-2.5 px-5"
              >
                Sign In
              </Link>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2.5 text-[#94a3b8] hover:text-[#e2e8f0] transition-colors ml-1"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <XMarkIcon className="h-5 w-5" /> : <Bars3Icon className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* ── Search Bar ── */}
        {isSearchOpen && (
          <div className="pb-8 animate-slide-down" ref={searchRef}>
            <div className="max-w-xl mx-auto">
              <form onSubmit={handleSearch} className="relative group">
                <MagnifyingGlassIcon className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94a3b8]" />
                <input
                  id="navbar-search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="What are you looking for today?"
                  autoFocus
                  className="input-dark pl-12 pr-6 h-12 rounded-2xl border border-[rgba(226,232,240,0.1)] focus:border-[rgba(226,232,240,0.3)] bg-black/40 shadow-2xl"
                />
              </form>
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  onClick={handleSearch}
                  className="btn-silver py-2 px-5 text-[9px] font-black tracking-[0.2em] uppercase rounded-full shadow-lg"
                >
                  SEARCH
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Mobile Menu ── */}
      {isMenuOpen && (
        <div className="md:hidden animate-slide-down glass border-t border-[rgba(226,232,240,0.1)]">
          <div className="px-4 pb-6 pt-4 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive(item.href)
                    ? 'text-[#e2e8f0] bg-[rgba(226,232,240,0.08)]'
                    : 'text-[#94a3b8] hover:text-[#f8fafc] hover:bg-white/5'
                }`}
              >
                {isActive(item.href) && <span className="w-1 h-1 rounded-full bg-[#e2e8f0] flex-shrink-0" />}
                {item.name}
              </Link>
            ))}

            <div className="pt-4 border-t border-[rgba(226,232,240,0.1)]">
              {!isSignedIn ? (
                <Link to="/sign-in" className="btn-silver w-full text-center">
                  Sign In
                </Link>
              ) : (
                <div className="flex items-center gap-3 px-4 py-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#e2e8f0] to-[#94a3b8] flex items-center justify-center text-[#020617] text-xs font-bold">
                    {user?.firstName?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#f8fafc]">{user?.firstName || 'Account'}</p>
                    <button
                      onClick={logout}
                      className="text-xs text-[#64748b] hover:text-red-400 transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;

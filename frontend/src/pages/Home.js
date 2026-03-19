import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiService from '../services/api';
import {
  SparklesIcon,
  ShieldCheckIcon,
  TruckIcon,
  GiftIcon,
  StarIcon,
  ArrowRightIcon,
  PhoneIcon,
  EnvelopeIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

/* ── Small reusable diamond separator ── */
const SilverDivider = () => (
  <div className="flex items-center justify-center gap-3 my-2">
    <div className="w-12 h-px bg-gradient-to-r from-transparent to-[#e2e8f0]" />
    <span className="text-[#e2e8f0] text-xs">◆</span>
    <div className="w-12 h-px bg-gradient-to-l from-transparent to-[#e2e8f0]" />
  </div>
);

/* ── Sparkle Component ── */
const SparkleStar = ({ style }) => (
  <svg className="sparkle" style={style} viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M80 0C80 0 84.5 59.5 160 80C160 80 84.5 100.5 80 160C80 160 75.5 100.5 0 80C0 80 75.5 59.5 80 0Z" fill="currentColor"/>
  </svg>
);

// Categories fetched dynamically

const features = [
  {
    Icon: SparklesIcon,
    title: 'Premium Quality',
    desc: 'Anti-tarnish American Diamond jewelry that sparkles for years.',
  },
  {
    Icon: TruckIcon,
    title: 'Free Shipping',
    desc: 'Complimentary shipping on all orders above ₹499 across India.',
  },
  {
    Icon: GiftIcon,
    title: 'Gift Wrapping',
    desc: 'Every order arrives in our signature luxury gift packaging.',
  },
  {
    Icon: ShieldCheckIcon,
    title: 'Cash on Delivery',
    desc: 'Pay only when your jewelry arrives at your doorstep.',
  },
];

const ReviewModal = ({ isOpen, onClose, onSubmit }) => {
  const [name, setName] = useState('');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#020617]/90 backdrop-blur-md p-4">
      <div className="glass-card w-full max-w-lg p-8 rounded-3xl animate-premium-in">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-display text-2xl font-bold text-white">Share Your Brilliance</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">✕</button>
        </div>
        <form onSubmit={(e) => {
          e.preventDefault();
          if (rating === 0) {
            alert("Please select a rating to share your brilliance!");
            return;
          }
          onSubmit({ user_name: name, rating, comment });
          setName(''); setRating(0); setComment('');
        }} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Your Name</label>
            <input 
              type="text" 
              required 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="glass-input w-full px-4 py-3" 
              placeholder="e.g. Mahira K."
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <StarIcon 
                  key={s} 
                  onClick={() => setRating(s)}
                  className={`h-8 w-8 cursor-pointer transition-all ${s <= rating ? 'text-[#e2e8f0] fill-[#e2e8f0]' : 'text-slate-700 hover:text-slate-500'}`} 
                />
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Your Experience</label>
            <textarea 
              required 
              rows="4"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="glass-input w-full px-4 py-3 resize-none" 
              placeholder="Describe your Saram experience..."
            />
          </div>
          <button type="submit" className="btn-silver w-full py-4 uppercase tracking-[0.2em] font-black">
            Submit Review
          </button>
        </form>
      </div>
    </div>
  );
};

const Home = () => {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const [categories, setCategories] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [loadingHome, setLoadingHome] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [reviewsResult, categoriesResult] = await Promise.allSettled([
          apiService.getReviews(),
          apiService.getCategories()
        ]);

        if (reviewsResult.status === 'fulfilled') {
          setReviews(reviewsResult.value || []);
        }

        if (categoriesResult.status === 'fulfilled') {
          const response = categoriesResult.value;
          const formatted = (response || [])
            .filter(c => c.status === 'active' || !c.status)
            .slice(0, 4)
            .map(c => ({
              name: c.name || 'Category',
              sub: c.description ? c.description.substring(0, 20) + '...' : 'Explore',
              href: `/products?category=${c.id}`,
              image: c.image || 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&h=700&fit=crop',
              tag: 'Featured'
            }));
          setCategories(formatted);
        }
      } finally {
        setLoadingHome(false);
      }
    };
    fetchHomeData();
  }, []);

  const handleReviewSubmit = async (data) => {
    try {
      await apiService.createReview(data);
      setIsReviewOpen(false);
      const updated = await apiService.getReviews();
      setReviews(updated);
      window.dispatchEvent(new CustomEvent('showNotification', { 
        detail: { message: 'Thank you for your review!', type: 'success' } 
      }));
    } catch (e) {
      alert("Failed to submit review. Please try again.");
    }
  };

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const onScroll = () => {
      el.style.setProperty('--scroll', `${window.scrollY * 0.4}px`);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#020617]">

      {/* ══════════════════════════════════════
          HERO
      ══════════════════════════════════════ */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
      >
        {/* Background image with parallax */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=1920&h=1080&fit=crop)',
            transform: 'translate3d(0, var(--scroll, 0), 0)',
          }}
        />
        {/* Multi-layer overlay */}
        <div className="hero-overlay absolute inset-0" />
        <div className="absolute inset-0 bg-[#020617]/30" />

        {/* Decorative gold particles */}
        {[
          { top: '20%', left: '8%', size: 3, delay: 0 },
          { top: '35%', right: '12%', size: 2, delay: 1 },
          { bottom: '30%', left: '15%', size: 4, delay: 2 },
          { top: '60%', right: '8%', size: 3, delay: 0.5 },
          { top: '15%', right: '30%', size: 2, delay: 1.5 },
          { bottom: '20%', right: '25%', size: 3, delay: 2.5 },
        ].map((p, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-[#e2e8f0] dot-particle"
            style={{
              ...p,
              width: p.size, height: p.size,
              animationDuration: `${2.5 + i * 0.5}s`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}

        {/* 3D Shiny Sparkles */}
        {[
          { top: '25%', left: '20%', size: '15px', delay: '0s' },
          { top: '10%', right: '25%', size: '20px', delay: '1s' },
          { top: '50%', left: '10%', size: '10px', delay: '2s' },
          { top: '70%', right: '15%', size: '25px', delay: '0.5s' },
          { top: '65%', left: '25%', size: '18px', delay: '1.5s' },
        ].map((s, i) => (
          <SparkleStar
            key={`sparkle-${i}`}
            style={{
              top: s.top, left: s.left, right: s.right, width: s.size, height: s.size,
              animationDelay: s.delay
            }}
          />
        ))}

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center pt-32">
          <div className="section-label justify-center mb-8 animate-fade-in-up">
            Premium American Diamond
          </div>

          <h1 className="font-display font-bold leading-none mb-6 animate-fade-in-up delay-100">
            <span className="block text-7xl sm:text-8xl md:text-9xl text-[#ffffff] tracking-tight">
              SARAM
            </span>
            <span className="block text-shimmer text-5xl sm:text-6xl md:text-7xl tracking-[0.15em] mt-2">
              J E W E L S
            </span>
          </h1>

          <p className="text-[#94a3b8] text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-12 animate-fade-in-up delay-200">
            Timeless brilliance. Curated with precision. Anti-tarnish American Diamond 
            jewelry that celebrates every moment of your story.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up delay-300">
            <button
              onClick={() => navigate('/products')}
              className="btn-silver min-w-[180px] text-sm"
            >
              Shop Collection
              <ArrowRightIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => navigate('/categories')}
              className="btn-outline min-w-[180px] text-sm"
            >
              Explore All
            </button>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50">
            <div className="w-px h-12 bg-gradient-to-b from-[#e2e8f0] to-transparent" />
            <span className="text-[#e2e8f0] text-[10px] tracking-[0.2em] uppercase">Scroll</span>
          </div>
        </div>
      </section>

      {/* Gold divider */}
      <div className="divider-silver" />

      {/* ══════════════════════════════════════
          OCCASIONS BAR
      ══════════════════════════════════════ */}
      <section className="bg-[#0f172a] py-14 border-y border-[rgba(226,232,240,0.1)] overflow-hidden relative">
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/20 blur-3xl rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/20 blur-3xl rounded-full translate-x-1/2 translate-y-1/2" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative">
          <div className="flex flex-col md:flex-row items-center justify-around gap-12">
            <div className="text-center group">
              <span className="block font-display text-2xl md:text-3xl font-light text-slate-300 tracking-[0.2em] uppercase mb-2 group-hover:text-white transition-colors duration-500">Gifting</span>
              <span className="text-[10px] text-slate-500 uppercase tracking-[0.3em] font-bold">Perfect for Loved Ones</span>
            </div>
            <div className="w-px h-8 bg-white/10 hidden md:block" />
            <div className="text-center group">
              <span className="block font-display text-2xl md:text-3xl font-light text-slate-300 tracking-[0.2em] uppercase mb-2 group-hover:text-white transition-colors duration-500">Parties</span>
              <span className="text-[10px] text-slate-500 uppercase tracking-[0.3em] font-bold">Radiate Every Celebration</span>
            </div>
            <div className="w-px h-8 bg-white/10 hidden md:block" />
            <div className="text-center group">
              <span className="block font-display text-2xl md:text-3xl font-light text-slate-300 tracking-[0.2em] uppercase mb-2 group-hover:text-white transition-colors duration-500">Everyday Glam</span>
              <span className="text-[10px] text-slate-500 uppercase tracking-[0.3em] font-bold">Elevate Your Daily Style</span>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          FEATURED CATEGORIES
      ══════════════════════════════════════ */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Heading */}
          <div className="text-center mb-16">
            <div className="section-label justify-center mb-4">Our Collections</div>
            <h2 className="font-display text-5xl md:text-6xl font-bold text-[#ffffff] mb-4">
              Find Your <span className="text-silver-gradient">Perfect</span> Piece
            </h2>
            <SilverDivider />
            <p className="text-[#94a3b8] mt-4 max-w-xl mx-auto">
              From everyday elegance to statement glamour — each piece is selected to be treasured.
            </p>
          </div>

          {/* Category Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loadingHome ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="aspect-[3/4] rounded-[20px] bg-[#1e293b] animate-pulse border border-[#334155]/20" />
              ))
            ) : (
              categories.map((cat, i) => (
                <div key={i} className="card-3d">
                  <Link
                    to={cat.href}
                    className="group card overflow-hidden relative aspect-[3/4] block card-3d-inner"
                  >
                    {/* Background image */}
                    <img
                      src={cat.image}
                      alt={cat.name}
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    {/* Dark gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/40 to-transparent" />
                    {/* Gold border glow on hover */}
                    <div className="absolute inset-0 ring-0 group-hover:ring-1 ring-[#e2e8f0]/40 rounded-[20px] transition-all duration-300" />

                    {/* Tag */}
                    <div className="absolute top-4 left-4">
                      <span className="badge-silver text-[10px]">{cat.tag}</span>
                    </div>

                    {/* Text */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-z-10 translate-y-3 group-hover:translate-y-0 transition-transform duration-500">
                      <h3 className="font-display text-2xl font-bold text-[#ffffff] mb-1 drop-shadow-lg">
                        {cat.name}
                      </h3>
                      <p className="text-[#e2e8f0] text-sm font-medium drop-shadow-md">{cat.sub}</p>
                      <div className="mt-4 flex items-center gap-2 text-xs uppercase tracking-widest text-[#e2e8f0] opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                        Shop Now <ArrowRightIcon className="h-3 w-3 relative top-px" />
                      </div>
                    </div>
                  </Link>
                </div>
              ))
            )}
          </div>

          <div className="text-center mt-12 flex flex-col items-center gap-6">
            <button
              onClick={() => navigate('/products')}
              className="btn-outline px-10"
            >
              View All Products
            </button>

            {/* Testimonials Section immediately under */}
            <div className="w-full mt-24">
              <div className="text-center mb-16">
                <div className="section-label justify-center mb-4">Vanguard Patrons</div>
                <h2 className="font-display text-4xl md:text-5xl font-bold text-[#ffffff] mb-4">
                  The <span className="text-silver-gradient">Saram</span> Experience
                </h2>
                <SilverDivider />
              </div>

              {reviews.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                  {reviews.slice(0, 3).map((t, i) => (
                    <div key={i} className="card p-8 group hover:translate-y-[-8px] transition-all duration-500">
                      <div className="flex gap-1 mb-6">
                        {[...Array(t.rating)].map((_, j) => (
                          <StarIcon key={j} className="h-4 w-4 text-[#e2e8f0] fill-[#e2e8f0]" />
                        ))}
                      </div>
                      <p className="text-[#94a3b8] leading-relaxed text-sm mb-8 italic min-h-[60px]">
                        "{t.comment}"
                      </p>
                      <div className="flex items-center gap-3 border-t border-[rgba(226,232,240,0.1)] pt-5">
                        <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-white text-sm font-bold border border-white/10 group-hover:border-white/30 transition-colors">
                          {t.user_name?.charAt(0) || 'S'}
                        </div>
                        <div>
                          <p className="text-[#f8fafc] font-semibold text-sm">{t.user_name}</p>
                          <p className="text-[#64748b] text-[10px] uppercase tracking-widest">{new Date(t.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-slate-500 italic py-12">
                  Be the first to share your brilliance.
                </div>
              )}

              <div className="mt-12">
                <button
                  onClick={() => setIsReviewOpen(true)}
                  className="btn-silver text-xs px-8 py-3 group"
                >
                  <SparklesIcon className="h-4 w-4 group-hover:rotate-12 transition-transform" />
                  Write Your Review
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ReviewModal 
        isOpen={isReviewOpen} 
        onClose={() => setIsReviewOpen(false)} 
        onSubmit={handleReviewSubmit} 
      />

      {/* ══════════════════════════════════════
          ABOUT / BRAND STORY
      ══════════════════════════════════════ */}
      <section className="py-24 bg-[#0f172a] border-y border-[rgba(226,232,240,0.08)]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Image Side */}
            <div className="relative">
              {/* Outer border */}
              <div className="absolute -inset-4 rounded-2xl border border-[rgba(226,232,240,0.15)]" />
              <div className="aspect-[4/5] rounded-2xl overflow-hidden relative">
                <img
                  src="https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800&h=1000&fit=crop"
                  alt="Saram Jewels curation"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#020617]/60 to-transparent" />
              </div>
              {/* Floating badge */}
              <div className="absolute -bottom-6 -right-6 glass rounded-2xl px-6 py-4 border border-[rgba(226,232,240,0.2)]">
                <div className="font-display text-3xl font-bold text-[#e2e8f0]">5+</div>
                  <div className="text-xs text-[#94a3b8] uppercase tracking-widest">Years of Brilliance</div>
              </div>
            </div>

            {/* Content Side */}
            <div className="space-y-8">
              <div className="section-label">Our Story</div>
              <h2 className="font-display text-5xl md:text-6xl font-bold text-[#ffffff] leading-tight">
                Curated With <span className="text-silver-gradient">Passion</span>,<br />
                Worn With Pride
              </h2>
              <SilverDivider />
              <div className="space-y-5 text-[#94a3b8] leading-relaxed">
                <p>
                  At <span className="text-[#f8fafc] font-semibold">Saram Jewels</span>, we believe every woman 
                  deserves to feel radiant. Our journey began with a vision: to curate stunning jewelry that blends 
                  diamond brilliance with everyday affordability.
                </p>
                <p>
                  We specialize in <span className="text-[#e2e8f0] font-medium">American Diamond (A.D.) jewelry</span> — 
                  finished with anti-tarnish technology so each piece retains its sparkle for years. 
                  From delicate rings to bold statement necklaces, every curation tells a story.
                </p>
                <p>
                  Based in Delhi, we ship across India with care and precision, ensuring your jewelry 
                  arrives in our signature gift packaging — ready to be treasured.
                </p>
              </div>
              <div className="flex flex-wrap gap-4 pt-4">
                <button
                  onClick={() => navigate('/contact')}
                  className="btn-silver"
                >
                  Get in Touch
                </button>
                <button
                  onClick={() => navigate('/products')}
                  className="btn-ghost"
                >
                  Browse Collection
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          WHY SARAM
      ══════════════════════════════════════ */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="section-label justify-center mb-4">The Saram Promise</div>
            <h2 className="font-display text-5xl font-bold text-[#ffffff]">
              Why Choose <span className="text-silver-gradient">Us</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ Icon, title, desc }, i) => (
              <div
                key={i}
                className="card p-8 text-center group"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[rgba(226,232,240,0.15)] to-[rgba(226,232,240,0.05)] border border-[rgba(226,232,240,0.2)] flex items-center justify-center mx-auto mb-6 group-hover:border-[#e2e8f0]/50 transition-colors duration-300">
                  <Icon className="h-7 w-7 text-[#e2e8f0]" />
                </div>
                <h3 className="font-display text-lg font-bold text-[#ffffff] mb-3 tracking-wide">
                  {title}
                </h3>
                <p className="text-[#64748b] text-sm leading-relaxed group-hover:text-[#94a3b8] transition-colors duration-300">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* ══════════════════════════════════════
          CTA BANNER
      ══════════════════════════════════════ */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center opacity-10"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1920&h=600&fit=crop)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#e2e8f0]/5 via-transparent to-[#e2e8f0]/5" />
        <div className="relative max-w-3xl mx-auto text-center">
          <div className="section-label justify-center mb-6">Start Your Journey</div>
          <h2 className="font-display text-6xl md:text-7xl font-bold text-[#ffffff] mb-6 leading-tight">
            Wear Your <span className="text-shimmer">Brilliance</span>
          </h2>
          <p className="text-[#94a3b8] text-lg mb-10">
            Browse our curated collection and find the jewel that tells your story.
          </p>
          <button
            onClick={() => navigate('/products')}
            className="btn-silver text-base px-10 py-4"
          >
            Shop the Collection
            <ArrowRightIcon className="h-5 w-5" />
          </button>
        </div>
      </section>

      {/* ══════════════════════════════════════
          FOOTER
      ══════════════════════════════════════ */}
      <footer className="bg-[#020617] border-t border-[rgba(226,232,240,0.12)]">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {/* Brand */}
            <div className="md:col-span-2 space-y-4">
              <div className="font-display text-2xl font-bold text-silver-gradient tracking-widest">
                SARAM JEWELS
              </div>
              <p className="text-[#64748b] text-sm leading-relaxed max-w-xs">
                Premium American Diamond jewelry. Anti-tarnish. Affordable. Delivered across India.
              </p>
              <div className="flex items-center gap-2 text-[#94a3b8] text-sm">
                <PhoneIcon className="h-4 w-4 text-[#e2e8f0]" />
                +91 8178335392
              </div>
              {/* Social */}
              <div className="flex gap-3 pt-2">
                {[
                  { id: 'FB', href: 'https://facebook.com/sarojram_g' },
                  { id: 'IG', href: 'https://www.instagram.com/sarojram_g/' },
                  { id: 'YT', href: 'https://youtube.com/@sarojram_g' }
                ].map((s) => (
                  <a
                    key={s.id}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full border border-[rgba(226,232,240,0.2)] flex items-center justify-center text-[#64748b] hover:border-[#e2e8f0] hover:text-[#e2e8f0] transition-all duration-200 text-xs font-bold"
                  >
                    {s.id}
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-[#ffffff] font-semibold text-sm uppercase tracking-widest mb-5">
                Quick Links
              </h4>
              <ul className="space-y-3">
                {[
                  { label: 'Home', href: '/' },
                  { label: 'Collections', href: '/categories' },
                  { label: 'Shop', href: '/products' },
                  { label: 'Contact Us', href: '/contact' },
                ].map((l) => (
                  <li key={l.label}>
                    <Link
                      to={l.href}
                      className="text-[#64748b] hover:text-[#e2e8f0] text-sm transition-colors duration-200"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-[#ffffff] font-semibold text-sm uppercase tracking-widest mb-5">
                Support
              </h4>
              <div className="text-[#64748b] text-sm space-y-4">
                <p>
                  <a href="tel:+918178335392" className="hover:text-[#e2e8f0] transition-colors flex items-center gap-2">
                    <PhoneIcon className="h-4 w-4" />
                    +91 8178335392
                  </a>
                </p>
                <p>
                  <a href="mailto:saramjewels@gmail.com" className="hover:text-[#e2e8f0] transition-colors flex items-center gap-2">
                    <EnvelopeIcon className="h-4 w-4" />
                    saramjewels@gmail.com
                  </a>
                </p>
                <div className="space-y-1">
                  <p className="text-[#94a3b8] font-medium flex items-center gap-2">
                    <ClockIcon className="h-4 w-4" />
                    Customer Service Hours
                  </p>
                  <p className="ml-6 text-xs leading-relaxed uppercase tracking-widest font-bold text-sky-400">
                    Mon–Sun: 24/7
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="divider-silver mt-12 mb-8" />
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[#64748b] text-xs">
            <p>© 2025 Saram Jewels. All rights reserved.</p>
            <p className="text-[#e2e8f0]/50 tracking-widest uppercase text-[10px]">
              ✦ Curated with Love in Delhi ✦
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Home;

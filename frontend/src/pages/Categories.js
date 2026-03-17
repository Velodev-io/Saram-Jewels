import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiService from '../services/api';
import {
  SparklesIcon,
  ArrowRightIcon,
  FireIcon,
} from '@heroicons/react/24/outline';

/* ── Sparkle Component ── */
const SparkleStar = ({ style }) => (
  <svg className="sparkle" style={style} viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M80 0C80 0 84.5 59.5 160 80C160 80 84.5 100.5 80 160C80 160 75.5 100.5 0 80C0 80 75.5 59.5 80 0Z" fill="currentColor"/>
  </svg>
);

// Categories will be fetched from API

const Categories = () => {
  const [selected, setSelected] = useState('all');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiService.getCategories();
        const formatted = (response || []).map(c => ({
          id: c.id,
          name: c.name || `Category ${c.id}`,
          description: c.description || '',
          image: c.image || 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&h=600&fit=crop',
          count: c.products?.length || 0,
          featured: false,
          tag: 'Classic'
        }));
        setCategories(formatted);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCategories();
  }, []);

  const filtered = selected === 'all' ? categories : categories.filter((c) => c.id === selected);

  return (
    <div className="min-h-screen bg-[#020617]">

      {/* ── Hero ── */}
      <section className="relative pt-36 pb-20 px-6 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-10"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=1920&h=800&fit=crop)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#020617]/70 to-[#020617]" />
        <div className="relative text-center max-w-4xl mx-auto">
          <div className="section-label justify-center mb-6">Collections</div>
          <h1 className="font-display text-6xl md:text-7xl font-bold text-[#ffffff] mb-5 leading-tight">
            Our <span className="text-silver-gradient">Collections</span>
          </h1>
          <p className="text-[#94a3b8] text-lg max-w-xl mx-auto">
            Explore every category — rings, necklaces, earrings and more. Anti-tarnish. Affordable. Timeless.
          </p>
          <div className="flex items-center justify-center gap-3 mt-8 text-[#64748b] text-sm group relative">
            <SparklesIcon className="h-4 w-4 text-[#e2e8f0]" />
            <span>Anti-tarnish</span>
            <span className="text-[#334155]">·</span>
            <span>Affordable</span>
            <span className="text-[#334155]">·</span>
            <span>Elegant</span>
            <SparklesIcon className="h-4 w-4 text-[#e2e8f0]" />
            
            {/* Sparkles */}
            <SparkleStar style={{ top: '-20px', left: '10%', width: '12px', height: '12px' }} />
            <SparkleStar style={{ bottom: '-15px', right: '15%', width: '10px', height: '10px', animationDelay: '1s' }} />
          </div>
        </div>
      </section>

      {/* ── Filter Pills ── */}
      <div className="border-y border-[rgba(226,232,240,0.08)] bg-[#020617]/80 backdrop-blur-md sticky top-[72px] z-40 px-6 py-4">
        <div className="max-w-7xl mx-auto flex gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setSelected('all')}
            className={`flex-shrink-0 px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              selected === 'all'
                ? 'bg-[#e2e8f0] text-[#020617] shadow-[0_0_16px_rgba(226,232,240,0.3)]'
                : 'bg-[#1e293b] border border-[#334155] text-[#94a3b8] hover:border-[rgba(226,232,240,0.3)] hover:text-[#e2e8f0]'
            }`}
          >
            All Collections
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelected(c.id)}
              className={`flex-shrink-0 px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                selected === c.id
                  ? 'bg-[#e2e8f0] text-[#020617] shadow-[0_0_16px_rgba(226,232,240,0.3)]'
                  : 'bg-[#1e293b] border border-[#334155] text-[#94a3b8] hover:border-[rgba(226,232,240,0.3)] hover:text-[#e2e8f0]'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* ── Categories Grid ── */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((cat) => (
              <div key={cat.id} className={`card-3d ${cat.featured ? 'sm:col-span-2 sm:row-span-1' : ''}`}>
                <Link
                  to={`/products?category=${cat.id}`}
                  className="group card relative overflow-hidden aspect-[3/4] block card-3d-inner w-full h-full"
                >
                {/* Background image */}
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/30 to-transparent" />
                <div className="absolute inset-0 ring-0 group-hover:ring-1 ring-[#e2e8f0]/50 rounded-[20px] transition-all duration-300" />

                {/* Tags */}
                <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                  <span className="badge-silver text-[10px]">{cat.tag}</span>
                  {cat.featured && (
                    <span className="bg-red-500/20 border border-red-500/30 text-red-400 text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <FireIcon className="h-3 w-3" /> Featured
                    </span>
                  )}
                </div>

                {/* Count badge */}
                <div className="absolute top-4 right-4">
                  <span className="bg-[#020617]/60 text-[#94a3b8] text-[10px] px-3 py-1 rounded-full">
                    {cat.count} pieces
                  </span>
                </div>

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-z-10 translate-y-3 group-hover:translate-y-0 transition-transform duration-500">
                  <h3 className="font-display text-2xl font-bold text-[#ffffff] mb-1 drop-shadow-lg">
                    {cat.name}
                  </h3>
                  <p className="text-[#e2e8f0] text-sm font-medium mb-2 drop-shadow-md">{cat.price}</p>
                  <p className="text-[#64748b] text-xs leading-relaxed line-clamp-2 mb-4">
                    {cat.description}
                  </p>
                  <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#e2e8f0] opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                    Explore <ArrowRightIcon className="h-3 w-3" />
                  </div>
                </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Gift Set Highlight ── */}
      <section className="py-16 px-6 bg-[#0f172a] border-y border-[rgba(226,232,240,0.08)]">
        <div className="max-w-4xl mx-auto text-center">
          <div className="section-label justify-center mb-6">
            <FireIcon className="h-4 w-4 mr-1 text-[#e2e8f0]" />
            Special Offer
          </div>
          <h2 className="font-display text-5xl font-bold text-[#ffffff] mb-4">
            Gift Box Sets at <span className="text-silver-gradient">₹1000</span>
          </h2>
          <p className="text-[#94a3b8] text-lg mb-10 max-w-xl mx-auto">
            The perfect combo — a beautiful Necklace + Matching Earrings in our signature gift box. 
            Ready to gift, ready to love.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/products?category=gift-box-set" className="btn-silver">
              Shop Gift Sets
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
            <Link to="/contact" className="btn-outline">
              Contact Us
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Categories;

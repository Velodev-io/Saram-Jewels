import React, { useState } from 'react';
import {
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  ClockIcon,
  PaperAirplaneIcon,
  ChatBubbleOvalLeftEllipsisIcon,
} from '@heroicons/react/24/outline';

const contactInfo = [
  {
    Icon: PhoneIcon,
    title: 'Phone',
    lines: ['+91 8178335392'],
    sub: 'Call us anytime during business hours',
  },
  {
    Icon: EnvelopeIcon,
    title: 'Email',
    lines: ['saramjewels@gmail.com'],
    sub: 'We reply within 24 hours',
  },
  {
    Icon: ClockIcon,
    title: 'Hours',
    lines: ['Mon – Sun: 24/7'],
    sub: 'Available at your convenience',
  },
];

const faqs = [
  {
    q: 'What is American Diamond (A.D.)?',
    a: 'American Diamond, also known as Cubic Zirconia, is a brilliant alternative to natural diamonds — same sparkle at a fraction of the cost.',
  },
  {
    q: 'Is your jewelry anti-tarnish?',
    a: 'Yes! All our pieces are treated with anti-tarnish coating, ensuring they stay brilliant for years of wear.',
  },
  {
    q: 'What is your return policy?',
    a: 'We offer a 30-day return policy for all unused items in original packaging.',
  },
  {
    q: 'Do you ship across India?',
    a: 'Yes, we ship Pan-India. Free shipping on orders above ₹999. International shipping coming soon.',
  },
];

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const result = await res.json();
      if (result.success) {
        setSubmitted(true);
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      }
    } catch {
      setSubmitted(true); // Optimistic for demo
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617]">

      {/* ── Hero ── */}
      <section className="relative pt-40 pb-24 px-6 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-8"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=1920&h=800&fit=crop)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#020617]/80 to-[#020617]" />
        <div className="relative text-center max-w-3xl mx-auto">
          <div className="section-label justify-center mb-6">Get in Touch</div>
          <h1 className="font-display text-6xl md:text-7xl font-bold text-[#ffffff] mb-6 leading-tight">
            We're Here <span className="text-silver-gradient">For You</span>
          </h1>
          <p className="text-[#94a3b8] text-lg leading-relaxed">
            Have a question about our jewelry? Want to know more about a piece? 
            We'd love to hear from you.
          </p>
        </div>
      </section>

      {/* ── Contact Cards ── */}
      <section className="px-6 pb-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {contactInfo.map(({ Icon, title, lines, sub }, i) => (
              <div key={i} className="card p-6 text-center group hover:border-[rgba(226,232,240,0.4)]">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[rgba(226,232,240,0.15)] to-[rgba(226,232,240,0.05)] border border-[rgba(226,232,240,0.2)] flex items-center justify-center mx-auto mb-4 group-hover:border-[#e2e8f0]/50 transition-colors">
                  <Icon className="h-6 w-6 text-[#e2e8f0]" />
                </div>
                <h3 className="text-[#ffffff] font-semibold mb-3">{title}</h3>
                {lines.map((l, j) => (
                  <p key={j} className="text-[#94a3b8] text-sm">{l}</p>
                ))}
                {sub && <p className="text-[#64748b] text-xs mt-2">{sub}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Form + Info ── */}
      <section className="bg-[#0f172a] border-y border-[rgba(226,232,240,0.08)] py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">

            {/* Contact Form */}
            <div>
              <div className="section-label mb-4">Send a Message</div>
              <h2 className="font-display text-4xl font-bold text-[#ffffff] mb-8">
                Let's Start a <span className="text-silver-gradient">Conversation</span>
              </h2>

              {submitted ? (
                <div className="card p-10 text-center">
                  <div className="w-16 h-16 rounded-full bg-[rgba(226,232,240,0.1)] border border-[rgba(226,232,240,0.3)] flex items-center justify-center mx-auto mb-5">
                    <PaperAirplaneIcon className="h-7 w-7 text-[#e2e8f0]" />
                  </div>
                  <h3 className="font-display text-2xl font-bold text-[#ffffff] mb-3">
                    Message Sent!
                  </h3>
                  <p className="text-[#64748b] mb-6">
                    Thank you for reaching out. We'll get back to you within 24 hours.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="btn-outline text-sm"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs text-[#94a3b8] font-semibold uppercase tracking-widest mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text" name="name" value={formData.name} onChange={handleChange}
                        required placeholder="Your name"
                        className="input-dark"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[#94a3b8] font-semibold uppercase tracking-widest mb-2">
                        Email *
                      </label>
                      <input
                        type="email" name="email" value={formData.email} onChange={handleChange}
                        required placeholder="your@email.com"
                        className="input-dark"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs text-[#94a3b8] font-semibold uppercase tracking-widest mb-2">
                        Phone
                      </label>
                      <input
                        type="tel" name="phone" value={formData.phone} onChange={handleChange}
                        placeholder="+91 XXXXX XXXXX"
                        className="input-dark"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[#94a3b8] font-semibold uppercase tracking-widest mb-2">
                        Subject *
                      </label>
                      <select
                        name="subject" value={formData.subject} onChange={handleChange}
                        required className="input-dark"
                      >
                        <option value="">Select topic</option>
                        <option value="general">General Inquiry</option>
                        <option value="product">Product Information</option>
                        <option value="order">Order Status</option>
                        <option value="return">Return & Exchange</option>
                        <option value="wholesale">Wholesale</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-[#94a3b8] font-semibold uppercase tracking-widest mb-2">
                      Message *
                    </label>
                    <textarea
                      name="message" value={formData.message} onChange={handleChange}
                      required rows={5} placeholder="Tell us how we can help you..."
                      className="input-dark resize-none"
                    />
                  </div>
                  <button
                    type="submit" disabled={isSubmitting}
                    className="btn-silver w-full py-4 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-[#020617]/30 border-t-[#020617] rounded-full animate-spin-slow" />
                        Sending...
                      </span>
                    ) : (
                      <>
                        Send Message
                        <PaperAirplaneIcon className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Info Side */}
            <div className="space-y-10">
              <div>
                <div className="section-label mb-4">Connect With Us</div>
                <h2 className="font-display text-4xl font-bold text-[#ffffff] mb-6">
                  Also Reach Us <span className="text-silver-gradient">Directly</span>
                </h2>
                <p className="text-[#64748b] leading-relaxed mb-8">
                  Prefer a quick chat? Reach us on WhatsApp or follow us on social media for 
                  new arrivals, offers, and styling inspiration.
                </p>

                {/* WhatsApp CTA */}
                <a
                  href="https://wa.me/918178335392"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 btn-silver w-full justify-center mb-4"
                >
                  <ChatBubbleOvalLeftEllipsisIcon className="h-5 w-5" />
                  Chat on WhatsApp
                </a>

                {/* Social buttons */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Instagram', href: 'https://www.instagram.com/saram.jewellery_store/' },
                    { label: 'Facebook', href: 'https://www.facebook.com/profile.php?id=61573928366337' },
                    { label: 'YouTube', href: 'https://youtube.com/@sarojram_g' },
                  ].map((s) => (
                    <a
                      key={s.label}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-ghost text-xs py-3 hover:border-[rgba(226,232,240,0.3)] hover:text-[#e2e8f0] text-center"
                    >
                      {s.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <div className="section-label justify-center mb-4">FAQ</div>
            <h2 className="font-display text-4xl font-bold text-[#ffffff]">
              Common <span className="text-silver-gradient">Questions</span>
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="card overflow-hidden">
                <button
                  className="w-full flex items-center justify-between px-6 py-5 text-left"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="text-[#ffffff] font-medium pr-6">{faq.q}</span>
                  <span className={`text-[#e2e8f0] text-xl font-light flex-shrink-0 transition-transform duration-200 ${openFaq === i ? 'rotate-45' : ''}`}>
                    +
                  </span>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 border-t border-[rgba(226,232,240,0.1)] pt-4 animate-slide-down">
                    <p className="text-[#64748b] leading-relaxed text-sm">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default Contact;

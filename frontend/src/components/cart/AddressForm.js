import React, { useState } from 'react';
import { 
  MapPinIcon, 
  PhoneIcon, 
  UserIcon, 
  HomeIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

const AddressForm = ({ onComplete, onBack, initialData }) => {
  const [formData, setFormData] = useState(initialData || {
    name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: 'India'
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Receiver name is required';
    if (!formData.phone.match(/^[0-9]{10}$/)) newErrors.phone = 'Valid 10-digit number required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City required';
    if (!formData.state.trim()) newErrors.state = 'State required';
    if (!formData.zip.match(/^[0-9]{6}$/)) newErrors.zip = 'Valid 6-digit PIN required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onComplete(formData);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in pb-12">
      <div className="text-center mb-10">
        <div className="section-label justify-center mb-4">Logistics</div>
        <h2 className="text-4xl font-display font-bold text-[#ffffff] mb-2 text-silver-gradient">Delivery Address</h2>
        <p className="text-[#64748b] text-sm font-medium tracking-wide">Where should we dispatch your treasures?</p>
      </div>

      <form onSubmit={handleSubmit} className="glass p-8 md:p-10 rounded-[40px] border border-[rgba(226,232,240,0.15)] shadow-[0_40px_80px_rgba(0,0,0,0.4)] relative overflow-hidden">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Full Name */}
          <div className="md:col-span-2 flex flex-col gap-2">
            <label className="text-[10px] font-bold text-[#e2e8f0] uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
              <UserIcon className="h-3 w-3" /> Receiver Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ex. Suryansh Singh"
              className={`input-dark ${errors.name ? 'border-red-400/50' : ''}`}
            />
            {errors.name && <p className="text-[10px] text-red-400 font-bold uppercase tracking-wider mt-1">{errors.name}</p>}
          </div>

          {/* Phone */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold text-[#e2e8f0] uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
              <PhoneIcon className="h-3 w-3" /> Contact Number
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="10-digit mobile number"
              className={`input-dark ${errors.phone ? 'border-red-400/50' : ''}`}
            />
            {errors.phone && <p className="text-[10px] text-red-400 font-bold uppercase tracking-wider mt-1">{errors.phone}</p>}
          </div>

          {/* PIN Code */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold text-[#e2e8f0] uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
              <MapPinIcon className="h-3 w-3" /> PIN Code
            </label>
            <input
              type="text"
              name="zip"
              value={formData.zip}
              onChange={handleChange}
              placeholder="6-digit area code"
              className={`input-dark ${errors.zip ? 'border-red-400/50' : ''}`}
            />
            {errors.zip && <p className="text-[10px] text-red-400 font-bold uppercase tracking-wider mt-1">{errors.zip}</p>}
          </div>

          {/* Address */}
          <div className="md:col-span-2 flex flex-col gap-2">
            <label className="text-[10px] font-bold text-[#e2e8f0] uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
              <HomeIcon className="h-3 w-3" /> Detailed Address
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows="3"
              placeholder="House/Apt No., Street, Landmark..."
              className={`input-dark resize-none ${errors.address ? 'border-red-400/50' : ''}`}
            />
            {errors.address && <p className="text-[10px] text-red-400 font-bold uppercase tracking-wider mt-1">{errors.address}</p>}
          </div>

          {/* City */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold text-[#e2e8f0] uppercase tracking-[0.2em] ml-1">City</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="Ex. Jaipur"
              className={`input-dark ${errors.city ? 'border-red-400/50' : ''}`}
            />
          </div>

          {/* State */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold text-[#e2e8f0] uppercase tracking-[0.2em] ml-1">State</label>
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              placeholder="Ex. Rajasthan"
              className={`input-dark ${errors.state ? 'border-red-400/50' : ''}`}
            />
          </div>
        </div>

        <div className="mt-12 flex flex-col sm:flex-row gap-4">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 btn-outline py-4 rounded-2xl"
          >
            Return to Bag
          </button>
          <button
            type="submit"
            className="flex-[2] btn-silver py-4 rounded-2xl group"
          >
            <span className="flex items-center justify-center gap-3">
               Proceed to Secure Payment
               <ArrowRightIcon className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
        </div>

        <div className="mt-8 flex items-center justify-center gap-4 py-4 border-t border-white/5 opacity-50">
           <MapPinIcon className="h-4 w-4 text-[#e2e8f0]" />
           <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#e2e8f0]">Complimentary Express Shipping Across India</p>
        </div>
      </form>
    </div>
  );
};

export default AddressForm;

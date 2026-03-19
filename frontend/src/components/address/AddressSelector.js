import React, { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { 
  MapPinIcon, 
  PhoneIcon, 
  UserIcon, 
  HomeIcon,
  ArrowRightIcon,
  PlusIcon,
  CheckCircleIcon,
  PencilSquareIcon,
  BuildingOfficeIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useAuth as useClerkAuth } from '@clerk/clerk-react';
import apiService from '../../services/api';

const LABEL_ICONS = {
  Home: HomeIcon,
  Work: BuildingOfficeIcon,
  Other: MapPinIcon,
};

const AddressSelector = ({ onComplete, onBack, user, mode = 'checkout' }) => {
  const { getToken } = useClerkAuth();
  const [addresses, setAddresses] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : '',
    phone: '',
    address: '', // Building Name, Street, Area
    house_no: '', // House No/Tower/Block
    locality: '', // Locality / Town
    city: '',     // We'll use locality as city for backend consistency
    state: '',
    zip: '',
    country: 'India',
    label: 'Home',
    is_default: false
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      setLoading(true);
      const res = await apiService.getAddresses();
      const addrs = res.data || [];
      setAddresses(addrs);
      // Auto-select default
      const def = addrs.find(a => a.is_default);
      if (def) setSelectedId(def.id);
      else if (addrs.length > 0) setSelectedId(addrs[0].id);
    } catch {
      // setShowForm(true); // Don't auto-show form as modal anymore
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    const e = {};
    if (!formData.name.trim()) e.name = 'Name is required';
    if (!formData.phone.match(/^[0-9]{10}$/)) e.phone = 'Valid 10-digit number required';
    if (!formData.zip.match(/^[0-9]{6}$/)) e.zip = 'Valid 6-digit PIN required';
    if (!formData.state.trim()) e.state = 'State is required';
    if (!formData.address.trim()) e.address = 'Address is required';
    if (!formData.locality.trim()) e.locality = 'Locality/Town is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleSaveAddress = async (e) => {
    if (e) e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      // Refresh token before saving to prevent 401
      const token = await getToken();
      if (token) localStorage.setItem('clerk-token', token);

      let result;
      if (editingAddress) {
        result = await apiService.updateAddress(editingAddress.id, formData);
      } else {
        result = await apiService.addAddress(formData);
      }
      await loadAddresses();
      setSelectedId(result.data?.id || null);
      setShowForm(false);
      setEditingAddress(null);
      resetForm();
    } catch (error) {
      console.error('Failed to save address:', error.response?.data || error.message);
      
      const serverMsg = error.response?.data?.message || '';
      const serverDetails = error.response?.data?.error || '';
      
      // If serverDetails is an object, stringify it for the alert
      const detailedMsg = typeof serverDetails === 'object' 
        ? JSON.stringify(serverDetails) 
        : serverDetails;

      const missing = error.response?.data?.missingFields ? ` Missing: ${error.response.data.missingFields.join(', ')}` : '';
      
      alert(`Failed to save address: ${serverMsg} ${detailedMsg} ${missing}`.trim() || 'Failed to save address. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (addr) => {
    setEditingAddress(addr);
    setFormData({
      name: addr.name,
      phone: addr.phone,
      address: addr.address,
      house_no: addr.house_no || '',
      locality: addr.locality || addr.city || '',
      city: addr.city,
      state: addr.state,
      zip: addr.zip,
      country: addr.country || 'India',
      label: addr.label || 'Home',
      is_default: addr.is_default
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : '',
      phone: '', 
      house_no: '',
      address: '', 
      locality: '',
      city: '', 
      state: '', 
      zip: '',
      country: 'India', 
      label: 'Home', 
      is_default: false
    });
    setErrors({});
    setEditingAddress(null);
  };

  const handleProceed = () => {
    const selected = addresses.find(a => a.id === selectedId);
    if (!selected) return;
    onComplete(selected);
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="w-8 h-8 border-2 border-[#334155] border-t-[#e2e8f0] rounded-full animate-spin" />
    </div>
  );

  return (
    <div className={`max-w-2xl mx-auto animate-fade-in ${mode === 'checkout' ? 'pb-12' : ''}`}>
      {mode === 'checkout' && (
        <div className="text-center mb-10">
          <div className="section-label justify-center mb-4">Delivery</div>
          <h2 className="text-4xl font-display font-bold text-white mb-2">
            Select Delivery Address
          </h2>
          <p className="text-[#64748b] text-sm">Where should we deliver your order?</p>
        </div>
      )}

      <div className="space-y-4">
        {/* Saved Addresses */}
        {addresses.length === 0 && (
          <div className="text-center py-16 glass rounded-3xl border border-[rgba(226,232,240,0.1)]">
            <MapPinIcon className="h-16 w-16 text-[#334155] mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-bold text-[#e2e8f0] mb-1">No Addresses Yet</h3>
            <p className="text-[#64748b] text-sm">Add a delivery address to get started.</p>
          </div>
        )}
        
        {addresses.map((addr) => {
          const LabelIcon = LABEL_ICONS[addr.label] || MapPinIcon;
          const isSelected = selectedId === addr.id;
          return (
            <div
              key={addr.id}
              onClick={mode === 'checkout' ? () => setSelectedId(addr.id) : undefined}
              className={`relative p-6 rounded-[24px] border transition-all duration-300 ${
                isSelected && mode === 'checkout'
                  ? 'border-[#e2e8f0]/40 bg-[rgba(226,232,240,0.06)] shadow-[0_12px_40px_-12px_rgba(0,0,0,0.5)] cursor-pointer'
                  : 'border-[rgba(226,232,240,0.08)] bg-[#0f172a]/40 hover:border-[rgba(226,232,240,0.2)] ' + (mode==='checkout'?'cursor-pointer':'')
              }`}
            >
              <div className="flex items-start gap-5">
                {/* Radio (checkout only) */}
                {mode === 'checkout' && (
                  <div className={`mt-1.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                    isSelected ? 'border-[#e2e8f0] bg-[#e2e8f0]' : 'border-[#334155]'
                  }`}>
                    {isSelected && <div className="w-2 h-2 rounded-full bg-[#020617]" />}
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[rgba(226,232,240,0.05)] border border-[rgba(226,232,240,0.1)]">
                      <LabelIcon className="h-3 w-3 text-[#94a3b8]" />
                      <span className="text-[10px] font-black uppercase tracking-[0.15em] text-[#94a3b8]">{addr.label}</span>
                    </div>
                    {addr.is_default && (
                      <span className="text-[9px] font-black uppercase tracking-[0.1em] text-[#e2e8f0] opacity-60">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="font-bold text-[#f8fafc] text-base mb-1">{addr.name}</p>
                  <p className="text-[#94a3b8] text-sm leading-relaxed">
                    {addr.house_no ? `${addr.house_no}, ` : ''}{addr.address}, {addr.locality}, {addr.city}, {addr.state} – <span className="text-[#e2e8f0]">{addr.zip}</span>
                  </p>
                  <div className="mt-3 flex items-center gap-4">
                    <p className="text-[#64748b] text-xs flex items-center gap-1.5">
                      <PhoneIcon className="h-3.5 w-3.5" /> <span className="tracking-wider">{addr.phone}</span>
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleEdit(addr); }}
                    className="p-2.5 rounded-full text-[#64748b] hover:text-[#e2e8f0] hover:bg-white/5 transition-all"
                    title="Edit Address"
                  >
                    <PencilSquareIcon className="h-5 w-5" />
                  </button>
                  {mode === 'manage' && (
                    <button
                      onClick={async (e) => { 
                        e.stopPropagation(); 
                        if (window.confirm("Delete this address?")) {
                          await apiService.deleteAddress(addr.id);
                          loadAddresses();
                        }
                      }}
                      className="p-2.5 rounded-full text-[#64748b] hover:text-red-400 hover:bg-red-400/5 transition-all"
                      title="Delete Address"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Add new address button */}
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="w-full p-8 rounded-[24px] border-2 border-dashed border-[rgba(226,232,240,0.1)] text-[#64748b] hover:border-[rgba(226,232,240,0.3)] hover:text-[#e2e8f0] transition-all flex flex-col items-center justify-center gap-3 group"
        >
          <div className="p-3 rounded-full bg-[rgba(226,232,240,0.03)] group-hover:bg-[rgba(226,232,240,0.08)] transition-all">
            <PlusIcon className="h-6 w-6" />
          </div>
          <span className="text-xs font-bold uppercase tracking-[0.2em]">{editingAddress ? 'Continue Editing' : 'Add New Address'}</span>
        </button>

        {/* Action Buttons (Select mode only) */}
        {mode === 'checkout' && addresses.length > 0 && (
          <div className="flex gap-4 pt-8">
            <button type="button" onClick={onBack} className="flex-1 btn-outline py-5 rounded-2xl text-xs font-bold uppercase tracking-widest">
              Back to Cart
            </button>
            <button
              type="button"
              onClick={handleProceed}
              disabled={!selectedId}
              className="flex-[2] btn-silver py-5 rounded-2xl group disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)]"
            >
              <span className="flex items-center justify-center gap-3">
                Deliver to this Address
                <ArrowRightIcon className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
          </div>
        )}
      </div>

      {/* MODAL FORM SECTION */}
      <Transition appear show={showForm} as={Fragment}>
        <Dialog as="div" className="relative z-[9999]" onClose={() => setShowForm(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-[#020617]/90 backdrop-blur-md" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95 translate-y-8"
                enterTo="opacity-100 scale-100 translate-y-0"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100 translate-y-0"
                leaveTo="opacity-0 scale-95 translate-y-8"
              >
                <Dialog.Panel className="w-full max-w-xl transform overflow-hidden rounded-[40px] border border-[rgba(226,232,240,0.15)] bg-[#0f172a] p-10 shadow-[0_32px_80px_-20px_rgba(0,0,0,0.6)] transition-all">
                  <div className="flex items-center justify-between mb-10">
                    <div>
                      <h3 className="text-2xl font-display font-bold text-white tracking-tight">
                        {editingAddress ? 'Update Details' : 'Add New Address'}
                      </h3>
                      <p className="text-[#64748b] text-sm mt-1">Please provide accurate delivery details</p>
                    </div>
                    <button 
                      onClick={() => setShowForm(false)}
                      className="p-3 rounded-full hover:bg-white/5 text-[#64748b] hover:text-white transition-all"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveAddress} className="space-y-10 font-display">
                    {/* Contact Section */}
                    <div className="space-y-8">
                      <div className="flex items-center gap-4">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#475569] whitespace-nowrap">Contact Information</span>
                        <div className="h-px w-full bg-gradient-to-r from-[rgba(226,232,240,0.1)] to-transparent" />
                      </div>

                      <div className="space-y-8">
                        <div className="relative group">
                          <input type="text" name="name" value={formData.name} onChange={handleFormChange}
                            placeholder=" " className={`peer w-full bg-[rgba(255,255,255,0.02)] border ${errors.name ? 'border-red-400/50' : 'border-[#334155] focus:border-[#e2e8f0]/50'} rounded-2xl px-6 py-4 outline-none transition-all placeholder-transparent text-lg focus:ring-4 focus:ring-[#e2e8f0]/5`} />
                          <label className="absolute left-6 top-4 text-[#64748b] text-base transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:-top-3.5 peer-focus:left-4 peer-focus:text-[#e2e8f0] peer-focus:text-xs peer-focus:bg-[#0f172a] peer-focus:px-2 peer-[:not(:placeholder-shown)]:-top-3.5 peer-[:not(:placeholder-shown)]:left-4 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-[#0f172a] peer-[:not(:placeholder-shown)]:px-2 peer-[:not(:placeholder-shown)]:text-[#e2e8f0]">
                            Full Name *
                          </label>
                          {errors.name && <p className="text-[10px] text-red-500 mt-2 ml-2 font-bold uppercase tracking-wider">{errors.name}</p>}
                        </div>

                        <div className="relative group">
                          <input type="tel" name="phone" value={formData.phone} onChange={handleFormChange}
                            placeholder=" " className={`peer w-full bg-[rgba(255,255,255,0.02)] border ${errors.phone ? 'border-red-400/50' : 'border-[#334155] focus:border-[#e2e8f0]/50'} rounded-2xl px-6 py-4 outline-none transition-all placeholder-transparent text-lg focus:ring-4 focus:ring-[#e2e8f0]/5`} />
                          <label className="absolute left-6 top-4 text-[#64748b] text-base transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:-top-3.5 peer-focus:left-4 peer-focus:text-[#e2e8f0] peer-focus:text-xs peer-focus:bg-[#0f172a] peer-focus:px-2 peer-[:not(:placeholder-shown)]:-top-3.5 peer-[:not(:placeholder-shown)]:left-4 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-[#0f172a] peer-[:not(:placeholder-shown)]:px-2 peer-[:not(:placeholder-shown)]:text-[#e2e8f0]">
                            Mobile Number *
                          </label>
                          {errors.phone && <p className="text-[10px] text-red-500 mt-2 ml-2 font-bold uppercase tracking-wider">{errors.phone}</p>}
                        </div>
                      </div>
                    </div>

                    {/* Address Section */}
                    <div className="space-y-8">
                      <div className="flex items-center gap-4">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#475569] whitespace-nowrap">Delivery Location</span>
                        <div className="h-px w-full bg-gradient-to-r from-[rgba(226,232,240,0.1)] to-transparent" />
                      </div>

                      <div className="space-y-8">
                        <div className="grid grid-cols-2 gap-6">
                          <div className="relative group">
                            <input type="text" name="zip" value={formData.zip} onChange={handleFormChange}
                              placeholder=" " className={`peer w-full bg-[rgba(255,255,255,0.02)] border ${errors.zip ? 'border-red-400/50' : 'border-[#334155] focus:border-[#e2e8f0]/50'} rounded-2xl px-6 py-4 outline-none transition-all placeholder-transparent text-lg focus:ring-4 focus:ring-[#e2e8f0]/5`} />
                            <label className="absolute left-6 top-4 text-[#64748b] text-base transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:-top-3.5 peer-focus:left-4 peer-focus:text-[#e2e8f0] peer-focus:text-xs peer-focus:bg-[#0f172a] peer-focus:px-2 peer-[:not(:placeholder-shown)]:-top-3.5 peer-[:not(:placeholder-shown)]:left-4 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-[#0f172a] peer-[:not(:placeholder-shown)]:px-2 peer-[:not(:placeholder-shown)]:text-[#e2e8f0]">
                              Pincode *
                            </label>
                            {errors.zip && <p className="text-[10px] text-red-500 mt-2 ml-2 font-bold uppercase tracking-wider">{errors.zip}</p>}
                          </div>

                          <div className="relative group">
                            <input type="text" name="state" value={formData.state} onChange={handleFormChange}
                              placeholder=" " className={`peer w-full bg-[rgba(255,255,255,0.02)] border ${errors.state ? 'border-red-400/50' : 'border-[#334155] focus:border-[#e2e8f0]/50'} rounded-2xl px-6 py-4 outline-none transition-all placeholder-transparent text-lg focus:ring-4 focus:ring-[#e2e8f0]/5`} />
                            <label className="absolute left-6 top-4 text-[#64748b] text-base transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:-top-3.5 peer-focus:left-4 peer-focus:text-[#e2e8f0] peer-focus:text-xs peer-focus:bg-[#0f172a] peer-focus:px-2 peer-[:not(:placeholder-shown)]:-top-3.5 peer-[:not(:placeholder-shown)]:left-4 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-[#0f172a] peer-[:not(:placeholder-shown)]:px-2 peer-[:not(:placeholder-shown)]:text-[#e2e8f0]">
                              State *
                            </label>
                            {errors.state && <p className="text-[10px] text-red-500 mt-2 ml-2 font-bold uppercase tracking-wider">{errors.state}</p>}
                          </div>
                        </div>

                        <div className="relative group">
                          <input type="text" name="house_no" value={formData.house_no} onChange={handleFormChange}
                            placeholder=" " className="peer w-full bg-[rgba(255,255,255,0.02)] border border-[#334155] focus:border-[#e2e8f0]/50 rounded-2xl px-6 py-4 outline-none transition-all placeholder-transparent text-lg focus:ring-4 focus:ring-[#e2e8f0]/5" />
                          <label className="absolute left-6 top-4 text-[#64748b] text-base transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:-top-3.5 peer-focus:left-4 peer-focus:text-[#e2e8f0] peer-focus:text-xs peer-focus:bg-[#0f172a] peer-focus:px-2 peer-[:not(:placeholder-shown)]:-top-3.5 peer-[:not(:placeholder-shown)]:left-4 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-[#0f172a] peer-[:not(:placeholder-shown)]:px-2 peer-[:not(:placeholder-shown)]:text-[#e2e8f0]">
                            House No / Flat / Tower / Block
                          </label>
                        </div>

                        <div className="relative group">
                          <input type="text" name="address" value={formData.address} onChange={handleFormChange}
                            placeholder=" " className={`peer w-full bg-[rgba(255,255,255,0.02)] border ${errors.address ? 'border-red-400/50' : 'border-[#334155] focus:border-[#e2e8f0]/50'} rounded-2xl px-6 py-4 outline-none transition-all placeholder-transparent text-lg focus:ring-4 focus:ring-[#e2e8f0]/5`} />
                          <label className="absolute left-6 top-4 text-[#64748b] text-base transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:-top-3.5 peer-focus:left-4 peer-focus:text-[#e2e8f0] peer-focus:text-xs peer-focus:bg-[#0f172a] peer-focus:px-2 peer-[:not(:placeholder-shown)]:-top-3.5 peer-[:not(:placeholder-shown)]:left-4 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-[#0f172a] peer-[:not(:placeholder-shown)]:px-2 peer-[:not(:placeholder-shown)]:text-[#e2e8f0]">
                            Building, Street, Area *
                          </label>
                          {errors.address && <p className="text-[10px] text-red-400 mt-2 ml-2 font-bold uppercase tracking-wider font-bold">{errors.address}</p>}
                        </div>

                        <div className="relative group">
                          <input type="text" name="locality" value={formData.locality} onChange={(e) => {
                            const val = e.target.value;
                            setFormData(p => ({ ...p, locality: val, city: val }));
                            if (errors.locality) setErrors(p => ({ ...p, locality: null }));
                          }}
                            placeholder=" " className={`peer w-full bg-[rgba(255,255,255,0.02)] border ${errors.locality ? 'border-red-400/50' : 'border-[#334155] focus:border-[#e2e8f0]/50'} rounded-2xl px-6 py-4 outline-none transition-all placeholder-transparent text-lg focus:ring-4 focus:ring-[#e2e8f0]/5`} />
                          <label className="absolute left-6 top-4 text-[#64748b] text-base transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:-top-3.5 peer-focus:left-4 peer-focus:text-[#e2e8f0] peer-focus:text-xs peer-focus:bg-[#0f172a] peer-focus:px-2 peer-[:not(:placeholder-shown)]:-top-3.5 peer-[:not(:placeholder-shown)]:left-4 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-[#0f172a] peer-[:not(:placeholder-shown)]:px-2 peer-[:not(:placeholder-shown)]:text-[#e2e8f0]">
                            Locality / Town *
                          </label>
                          {errors.locality && <p className="text-[10px] text-red-500 mt-2 ml-2 font-bold uppercase tracking-wider">{errors.locality}</p>}
                        </div>
                      </div>
                    </div>

                    {/* Preferences */}
                    <div className="space-y-6">
                      <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#475569] text-center">Save As</h3>
                      <div className="flex justify-center gap-6">
                        {['Home', 'Work', 'Other'].map((lbl) => {
                          const Icon = LABEL_ICONS[lbl];
                          const isActive = formData.label === lbl;
                          return (
                            <button
                              key={lbl}
                              type="button"
                              onClick={() => setFormData(p => ({ ...p, label: lbl }))}
                              className={`flex flex-col items-center gap-2 w-20 py-4 rounded-3xl border transition-all duration-300 ${
                                isActive 
                                  ? 'bg-[#e2e8f0] text-[#020617] border-transparent shadow-[0_12px_24px_rgba(226,232,240,0.2)] scale-105' 
                                  : 'bg-[#1e293b]/40 text-[#64748b] border-[rgba(226,232,240,0.1)] hover:border-[#94a3b8]'
                              }`}
                            >
                              <Icon className="h-5 w-5" />
                              <span className="text-[9px] font-black uppercase tracking-widest">{lbl}</span>
                            </button>
                          );
                        })}
                      </div>

                      <div className="flex justify-center pt-4">
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={formData.is_default}
                            onChange={(e) => setFormData(p => ({ ...p, is_default: e.target.checked }))}
                            className="sr-only peer"
                          />
                          <div className="w-5 h-5 rounded-lg border-2 border-[#334155] peer-checked:bg-[#e2e8f0] peer-checked:border-transparent flex items-center justify-center transition-all">
                            {formData.is_default && <svg className="w-3 h-3 text-[#020617]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>}
                          </div>
                          <span className="text-[11px] font-bold uppercase tracking-widest text-[#64748b] group-hover:text-[#94a3b8]">Set as default address</span>
                        </label>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-6 pt-6">
                      <button 
                        type="button" 
                        onClick={() => setShowForm(false)}
                        className="flex-1 py-5 text-[11px] font-black uppercase tracking-[0.3em] text-[#64748b] hover:text-white transition-colors"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        disabled={saving}
                        className="flex-[2] btn-silver py-5 rounded-[20px] font-black uppercase tracking-[0.2em] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)] disabled:opacity-50"
                      >
                        {saving ? 'Processing...' : 'Save Address'}
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default AddressSelector;


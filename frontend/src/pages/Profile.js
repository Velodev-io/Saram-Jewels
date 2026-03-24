import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';
import { 
  UserIcon, 
  ShoppingBagIcon, 
  CogIcon, 
  HeartIcon,
  TruckIcon,
  EyeIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import apiService from '../services/api';
import AddressSelector from '../components/address/AddressSelector';
import PremiumLoader from '../components/common/PremiumLoader';

export default function Profile() {
  const { user, isSignedIn, getToken } = useAuth();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('profile');

  // Handle URL query parameters for active tab
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab && ['profile', 'orders', 'wishlist', 'settings'].includes(tab)) {
      setActiveTab(tab);
    } else {
      setActiveTab('profile');
    }
  }, [location.search]);
  const [orders, setOrders] = useState([]);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [phone, setPhone] = useState('');
  const [phoneUpdating, setPhoneUpdating] = useState(false);
  const [promotionalEmails, setPromotionalEmails] = useState(true);
  const [preferencesUpdating, setPreferencesUpdating] = useState(false);



  // Fetch profile data + orders in parallel
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        if (isSignedIn) {
          // Fire both API calls simultaneously instead of sequentially
          const [profileResult, ordersResult] = await Promise.allSettled([
            apiService.getCurrentUser(),
            apiService.getUserOrders()
          ]);

          // Process profile
          if (profileResult.status === 'fulfilled' && profileResult.value) {
            const userProfile = profileResult.value;
            if (userProfile.phone) setPhone(userProfile.phone);
            if (userProfile.promotional_emails !== undefined) {
              setPromotionalEmails(userProfile.promotional_emails);
            }
          }

          // Process orders
          if (ordersResult.status === 'fulfilled') {
            const userOrders = ordersResult.value;
            const ordersArray = userOrders?.data || (Array.isArray(userOrders) ? userOrders : []);
            
            if (ordersArray && ordersArray.length >= 0) {
              const mapped = ordersArray.map(o => ({
                id: o.order_number || o.id,
                date: o.created_at,
                status: o.status,
                total: o.total_amount,
                items: o.items ? o.items.map(i => ({
                  name: i.product?.name || 'Product',
                  price: i.price,
                  quantity: i.quantity
                })) : [],
                tracking: {
                  number: o.tracking_number || '',
                  carrier: o.shipping_carrier || 'Delivery Partner',
                  updates: [
                    ...(o.status === 'delivered' ? [{ date: new Date(o.updated_at).toLocaleDateString(), status: 'Delivered', location: 'Destination' }] : []),
                    ...(o.status === 'shipped' || o.status === 'delivered' ? [{ date: new Date(o.updated_at).toLocaleDateString(), status: 'Shipped', location: 'In Transit' }] : []),
                    { date: new Date(o.created_at).toLocaleDateString(), status: 'Order Confirmed', location: 'Warehouse' }
                  ]
                }
              }));
              setOrders(mapped);
            }
          }
        }
      } catch (err) {
        console.error("Error fetching profile data:", err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, [isSignedIn, activeTab]);

  // Persist user communication preferences to backend


  const updatePreferences = async (newVal) => {
    try {
      setPreferencesUpdating(true);
      setPromotionalEmails(newVal);
      // Ensure fresh token for API call
      if (getToken) {
        const token = await getToken();
        if (token) localStorage.setItem('clerk-token', token);
      }
      await apiService.updateUser({ promotional_emails: newVal });
    } catch (err) {
      console.error("Error updating preferences:", err.response?.data || err.message);
      // rollback on error
      setPromotionalEmails(!newVal);
    } finally {
      setPreferencesUpdating(false);
    }
  };

  const handlePhoneUpdate = async () => {
    if (!phone) return;
    setPhoneUpdating(true);
    try {
      // Ensure fresh token for API call
      if (getToken) {
        const token = await getToken();
        if (token) localStorage.setItem('clerk-token', token);
      }
      await apiService.updateUser({ phone });
      alert('Phone updated successfully');
    } catch (err) {
      console.error("Error updating phone:", err.response?.data || err.message);
      alert('Failed to update phone');
    } finally {
      setPhoneUpdating(false);
    }
  };

  const getTrackingUrl = (tracking) => {
    if (tracking.carrier === 'Delhivery') {
      return `https://www.delhivery.com/track/package/${tracking.number}`;
    } else if (tracking.carrier === 'DTDC') {
      return `https://www.dtdc.in/tracking/tracking_results.asp?Ttype=awb_no&strCnno=${tracking.number}`;
    }
    return '#';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered': return 'text-[#10b981] bg-[#10b981]/10 border border-[#10b981]/20';
      case 'In Transit': return 'text-[#3b82f6] bg-[#3b82f6]/10 border border-[#3b82f6]/20';
      case 'Out for Delivery': return 'text-[#f59e0b] bg-[#f59e0b]/10 border border-[#f59e0b]/20';
      case 'Order Confirmed': return 'text-[#8b5cf6] bg-[#8b5cf6]/10 border border-[#8b5cf6]/20';
      default: return 'text-[#94a3b8] bg-[#1e293b] border border-[#334155]';
    }
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: UserIcon },
    { id: 'orders', name: 'My Orders', icon: ShoppingBagIcon },
    { id: 'wishlist', name: 'Wishlist', icon: HeartIcon },
    { id: 'settings', name: 'Settings', icon: CogIcon }
  ];

  const renderProfileTab = () => (
    <div className="space-y-6">
      <div className="bg-[#1e293b] rounded-2xl border border-[rgba(226,232,240,0.1)] p-6 md:p-8">
        <h3 className="text-xl font-display font-medium text-[#f8fafc] mb-6 border-b border-[rgba(226,232,240,0.1)] pb-4">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-[#94a3b8] mb-2">First Name</label>
            <input
              type="text"
              value={user?.firstName || ''}
              className="input-dark w-full bg-[#0f172a] opacity-80 cursor-not-allowed"
              readOnly
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-[#94a3b8] mb-2">Last Name</label>
            <input
              type="text"
              value={user?.lastName || ''}
              className="input-dark w-full bg-[#0f172a] opacity-80 cursor-not-allowed"
              readOnly
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-[#94a3b8] mb-2">Email</label>
            <input
              type="email"
              value={user?.email || ''}
              className="input-dark w-full bg-[#0f172a] opacity-80 cursor-not-allowed"
              readOnly
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-[#94a3b8] mb-2">Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Add phone number"
              className="input-dark w-full bg-[#0f172a]"
            />
          </div>
        </div>
        <div className="mt-6">
          <button onClick={handlePhoneUpdate} disabled={phoneUpdating} className="btn-silver py-3 px-6 text-xs transition-all disabled:opacity-50">
            {phoneUpdating ? 'Updating...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="bg-[#1e293b] rounded-2xl border border-[rgba(226,232,240,0.1)] p-6 md:p-8">
        <h3 className="text-xl font-display font-medium text-[#f8fafc] mb-6 border-b border-[rgba(226,232,240,0.1)] pb-4">Saved Addresses</h3>
        {/* Database indexing optimization note for 'addresses' table: */}
        {/*
          tableName: 'addresses',
          indexes: [
            { fields: ['user_id'] },
            { fields: ['is_default'] },
            { fields: ['created_at'] }
          ]
        */}
        <AddressSelector mode="manage" user={user} />
      </div>
    </div>
  );

  const renderOrdersTab = () => (
    <div className="space-y-6">
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <PremiumLoader message="Syncing Order Chronicle..." />
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 bg-[#1e293b] rounded-2xl border border-[rgba(226,232,240,0.1)]">
          <ShoppingBagIcon className="mx-auto h-16 w-16 text-[#64748b]" />
          <h3 className="mt-4 text-xl font-display text-[#f8fafc]">No orders yet</h3>
          <p className="mt-2 text-sm text-[#94a3b8] mb-6">Start shopping to see your elegant order history.</p>
          <button 
            onClick={() => window.location.reload()}
            className="btn-outline px-6 py-2 text-[10px] uppercase tracking-widest font-bold"
          >
            Refresh Orders
          </button>
        </div>
      ) : (
        orders.map((order) => (
          <div key={order.id} className="bg-[#1e293b] rounded-2xl border border-[rgba(226,232,240,0.08)] overflow-hidden">
            {/* Order Header */}
            <div className="p-6 border-b border-[rgba(226,232,240,0.08)] bg-[#0f172a]/40">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-lg font-bold text-[#f8fafc]">Order #{order.id}</h3>
                  <p className="text-xs text-[#94a3b8] font-medium tracking-wide flex items-center mt-2">
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    {new Date(order.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-xl font-bold text-silver-gradient mb-2">₹{order.total.toLocaleString()}</p>
                  <span className={`inline-flex px-3 py-1 text-[10px] uppercase tracking-widest rounded-full ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="p-6 border-b border-[rgba(226,232,240,0.08)]">
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#94a3b8] mb-4">Items</h4>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center group">
                    <div>
                      <p className="text-sm font-medium text-[#e2e8f0] group-hover:text-white transition-colors">{item.name}</p>
                      <p className="text-[11px] font-medium text-[#64748b] mt-1 uppercase tracking-wider">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold text-[#bae6fd]">₹{item.price.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Tracking Information */}
            <div className="p-6">
              <div className="flex justify-between items-center mb-5">
                <h4 className="text-xs font-bold uppercase tracking-widest text-[#94a3b8]">Logistics</h4>
                <a
                  href={getTrackingUrl(order.tracking)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#93c5fd] hover:text-white bg-[#3b82f6]/10 hover:bg-[#3b82f6]/20 border border-[#3b82f6]/20 rounded-full transition-all"
                >
                  <EyeIcon className="h-3 w-3 mr-1" />
                  Track Package
                </a>
              </div>
              
              <div className="bg-[#0f172a] border border-[rgba(226,232,240,0.05)] rounded-xl p-5">
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-[rgba(226,232,240,0.05)]">
                  <div>
                    <p className="text-sm font-semibold text-[#f8fafc]">
                      {order.tracking.carrier}
                    </p>
                    <p className="text-xs text-[#94a3b8] mt-1 font-mono">{order.tracking.number}</p>
                  </div>
                  <TruckIcon className="h-6 w-6 text-[#64748b]" />
                </div>
                
                {/* Tracking Timeline */}
                <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-[rgba(226,232,240,0.2)] before:via-[rgba(226,232,240,0.1)] before:to-transparent">
                  {order.tracking.updates.map((update, index) => (
                    <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full border border-[rgba(226,232,240,0.2)] bg-[#0f172a] text-[#94a3b8] group-[.is-active]:text-[#f8fafc] group-[.is-active]:bg-[rgba(226,232,240,0.1)] shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-colors">
                        <div className={`w-2 h-2 rounded-full ${index === 0 ? 'bg-[#bae6fd] shadow-[0_0_10px_#bae6fd]' : 'bg-[#334155]'}`}></div>
                      </div>
                      <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.5rem)] p-3 rounded-lg bg-[rgba(226,232,240,0.02)] border border-[rgba(226,232,240,0.05)] hover:border-[rgba(226,232,240,0.1)] transition-colors">
                        <p className={`text-sm font-semibold ${index === 0 ? 'text-[#e2e8f0]' : 'text-[#94a3b8]'}`}>{update.status}</p>
                        <p className="text-[11px] text-[#64748b] mt-1 mb-2 font-medium tracking-wide">{update.location}</p>
                        <p className="text-[10px] text-[#475569] uppercase tracking-widest font-bold">{update.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  const renderWishlistTab = () => (
    <div className="text-center py-20 bg-[#1e293b] rounded-2xl border border-[rgba(226,232,240,0.1)]">
      <HeartIcon className="mx-auto h-16 w-16 text-[#64748b]" />
      <h3 className="mt-6 text-xl font-display text-[#f8fafc]">Your wishlist is empty</h3>
      <p className="mt-2 text-sm text-[#94a3b8]">Start curating your favorite pieces.</p>
    </div>
  );

  const renderSettingsTab = () => (
    <div className="space-y-6">
      <div className="bg-[#1e293b] rounded-2xl border border-[rgba(226,232,240,0.1)] p-6 md:p-8">
        <h3 className="text-xl font-display font-medium text-[#f8fafc] mb-6 border-b border-[rgba(226,232,240,0.1)] pb-4">Account Config</h3>
        <div className="space-y-3">
          <button 
            onClick={() => window.open('https://accounts.saramjewels.com/user', '_blank')}
            className="w-full text-left p-5 border border-[rgba(226,232,240,0.08)] bg-[#0f172a]/50 rounded-xl hover:bg-[rgba(226,232,240,0.03)] hover:border-[rgba(226,232,240,0.15)] transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#0f172a] border border-[rgba(226,232,240,0.1)] flex items-center justify-center text-[#94a3b8] group-hover:text-[#bae6fd] group-hover:border-[#bae6fd]/30 transition-colors">
                  <CogIcon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#f8fafc]">Security & Password</p>
                  <p className="text-[10px] text-[#64748b] font-medium uppercase tracking-widest mt-1">Manage your access via Clerk</p>
                </div>
              </div>
              <EyeIcon className="h-4 w-4 text-[#475569] group-hover:text-[#94a3b8]" />
            </div>
          </button>

          <button 
             onClick={() => setShowNotificationModal(true)}
             className="w-full text-left p-5 border border-[rgba(226,232,240,0.08)] bg-[#0f172a]/50 rounded-xl hover:bg-[rgba(226,232,240,0.03)] hover:border-[rgba(226,232,240,0.15)] transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#0f172a] border border-[rgba(226,232,240,0.1)] flex items-center justify-center text-[#94a3b8] group-hover:text-[#bae6fd] group-hover:border-[#bae6fd]/30 transition-colors">
                  <ShoppingBagIcon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#f8fafc]">Preferences</p>
                  <p className="text-[10px] text-[#64748b] font-medium uppercase tracking-widest mt-1">Manage communication protocols</p>
                </div>
              </div>
               <EyeIcon className="h-4 w-4 text-[#475569] group-hover:text-[#94a3b8]" />
            </div>
          </button>
        </div>
      </div>

      {/* Preferences Modal (Consolidated Notifications) */}
      {showNotificationModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
           <div className="bg-[#1e293b] border border-[rgba(226,232,240,0.15)] shadow-2xl rounded-3xl p-8 w-full max-w-md relative animate-fade-in">
             <button
              onClick={() => setShowNotificationModal(false)}
               className="absolute top-6 right-6 w-8 h-8 rounded-full bg-[#0f172a] border border-[rgba(226,232,240,0.1)] flex items-center justify-center text-[#94a3b8] hover:text-white transition-colors"
            >
              ✕
            </button>
            <h3 className="text-2xl font-display font-medium text-white mb-6 pr-8">Preferences</h3>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between p-5 rounded-2xl border border-[rgba(226,232,240,0.05)] bg-[#0f172a]/30">
                <div>
                  <p className="text-sm font-semibold text-[#e2e8f0]">Promotional Alerts</p>
                  <p className="text-[10px] text-[#64748b] font-medium uppercase tracking-widest mt-1">New collections & limited releases</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={promotionalEmails}
                    onChange={(e) => updatePreferences(e.target.checked)}
                    disabled={preferencesUpdating}
                  />
                  <div className="w-11 h-6 bg-[#334155] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3b82f6]"></div>
                </label>
              </div>

              <div className="px-5 py-4 rounded-xl border border-dashed border-white/10 bg-white/5">
                <p className="text-[10px] text-[#94a3b8] font-medium uppercase tracking-[0.1em] leading-relaxed">
                  <span className="text-[#bae6fd] font-black">Mandatory:</span> Transactional emails regarding orders and security are active by default for your protection.
                </p>
              </div>

              <button 
                onClick={() => setShowNotificationModal(false)}
                className="w-full py-4 rounded-2xl bg-silver-gradient text-black text-xs font-black uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-white/5"
                style={{ background: 'linear-gradient(135deg, #94a3b8 0%, #e2e8f0 50%, #bae6fd 100%)' }}
              >
                Close Protocol
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center pt-28 pb-16">
        <div className="text-center bg-[#1e293b] p-12 rounded-3xl border border-[rgba(226,232,240,0.1)] shadow-2xl max-w-sm w-full mx-4">
          <div className="w-20 h-20 mx-auto bg-[#020617] rounded-full border border-[rgba(226,232,240,0.1)] flex items-center justify-center mb-6">
             <UserIcon className="h-10 w-10 text-[#64748b]" />
          </div>
          <h2 className="text-2xl font-display font-medium text-[#f8fafc] mb-3">Authentication Required</h2>
          <p className="text-[13px] text-[#94a3b8] leading-relaxed">Please sign in via the header to access your private collection and settings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] pt-32 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <div className="section-label mb-3 text-left justify-start">Portal</div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-[#ffffff] mb-3">My Account</h1>
          <p className="text-[#94a3b8]">Manage your profile, curation, and preferences cleanly.</p>
        </div>

        <div className="lg:grid lg:grid-cols-12 lg:gap-10">
          {/* Sidebar */}
          <div className="lg:col-span-3">
            <nav className="space-y-2 bg-[#1e293b] p-3 rounded-2xl border border-[rgba(226,232,240,0.08)] sticky top-32">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-5 py-3.5 text-[13px] uppercase tracking-widest font-bold rounded-xl transition-all duration-300 ${
                      activeTab === tab.id
                        ? 'bg-[rgba(226,232,240,0.1)] text-[#e2e8f0] border border-[rgba(226,232,240,0.2)] shadow-md'
                        : 'text-[#64748b] hover:bg-[#0f172a]/50 hover:text-[#94a3b8] border border-transparent'
                    }`}
                  >
                    <Icon className={`h-5 w-5 mr-3 transition-colors ${activeTab === tab.id ? 'text-[#e2e8f0]' : 'text-[#475569]'}`} />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-9 mt-8 lg:mt-0">
            {activeTab === 'profile' && renderProfileTab()}
            {activeTab === 'orders' && renderOrdersTab()}
            {activeTab === 'wishlist' && renderWishlistTab()}
            {activeTab === 'settings' && renderSettingsTab()}
          </div>
        </div>
      </div>
    </div>
  );
}


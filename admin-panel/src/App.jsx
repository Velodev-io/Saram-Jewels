import React, { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  CubeIcon,
  CurrencyRupeeIcon,
  ShoppingBagIcon,
  UsersIcon,
  CogIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  ArchiveBoxIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  ChatBubbleBottomCenterTextIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { SignIn } from '@clerk/clerk-react';
import { useAuth } from './context/AuthContext';
import { useSiteSettings } from './context/SiteSettingsContext';
import apiService from './services/api';

const BulkStockUpdateModal = ({ isOpen, onClose, products, updateBulkStock, getStockStatus, setZoomedImage }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-green-900/40 backdrop-blur-md border border-amber-500/20 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-amber-100">Bulk Stock Update</h2>
          <button onClick={onClose} className="text-amber-200/50 hover:text-amber-100 text-xl font-bold">×</button>
        </div>

        <div className="space-y-4">
          <div className="bg-green-950 p-4 rounded-lg">
            <p className="text-sm text-amber-200/70 mb-4">Update stock levels for multiple products at once. Changes will be applied on-blur.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-amber-500/20">
              <thead className="bg-green-950">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-amber-200/50 uppercase">Product</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-amber-200/50 uppercase">Current Stock</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-amber-200/50 uppercase">New Stock</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-amber-200/50 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="bg-green-900/40 divide-y divide-amber-500/20">
                {products.map((product) => (
                  <tr key={product.id}>
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-8 w-8 rounded object-cover mr-3 cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => setZoomedImage(product.image)}
                          title="Click to zoom"
                        />
                        <div>
                          <div className="text-sm font-medium text-amber-100">{product.name}</div>
                          <div className="text-xs text-amber-200/50">{product.sku}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-amber-100">{product.stock}</td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min="0"
                        defaultValue={product.stock}
                        onBlur={(e) => {
                          const newStock = parseInt(e.target.value) || 0;
                          if (newStock !== product.stock) {
                            updateBulkStock(product.id, newStock);
                          }
                        }}
                        className="w-20 px-2 py-1 text-sm bg-green-950/50 border border-amber-500/40 rounded text-amber-100 focus:ring-2 focus:ring-amber-300"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 text-[10px] font-black uppercase rounded-full ${getStockStatus(product.stock).color}`}>
                        {getStockStatus(product.stock).text}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-white/10">
            <button onClick={onClose} className="px-6 py-2 border border-amber-500/40 rounded-lg text-amber-200/80 hover:bg-green-950 text-xs font-bold uppercase">Cancel</button>
            <button onClick={onClose} className="btn-primary px-8">Propagate Updates</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ImageZoomModal = ({ zoomedImage, setZoomedImage }) => {
  if (!zoomedImage) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[200]">
      <div className="relative max-w-4xl max-h-[90vh] p-4">
        <button onClick={() => setZoomedImage(null)} className="absolute top-2 right-2 z-10 text-white font-bold bg-black/50 rounded-full w-10 h-10 flex items-center justify-center hover:bg-white hover:text-black transition-all">×</button>
        <div className="relative overflow-hidden rounded-lg">
          <img src={zoomedImage} alt="Zoomed product" className="max-w-full max-h-[80vh] object-contain cursor-zoom-in" onMouseEnter={(e) => e.target.style.transform = 'scale(1.5)'} onMouseLeave={(e) => e.target.style.transform = 'scale(1)'} style={{ transition: 'transform 0.3s ease' }} />
        </div>
      </div>
    </div>
  );
};


const AddEditProductModal = ({ isOpen, editingProduct, showAddProduct, onClose, categories, apiService, setProducts, products }) => {
  const [productImages, setProductImages] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);

  useEffect(() => {
    if (editingProduct) {
      if (Array.isArray(editingProduct.images)) {
        setProductImages(editingProduct.images.map((url, idx) => ({
          id: `existing-${idx}-${Date.now()}`,
          url,
          name: `Existing Image ${idx + 1}`
        })));
      } else if (editingProduct.image) {
        setProductImages([{
          id: `existing-main-${Date.now()}`,
          url: editingProduct.image,
          name: 'Main Image'
        }]);
      }
    } else {
      setProductImages([]);
      setSelectedImages([]);
    }
  }, [editingProduct]);

  if (!isOpen && !showAddProduct && !editingProduct) return null;
  const product = editingProduct || {};

  return (
    <div className="fixed inset-0 bg-[#020617]/95 backdrop-blur-xl flex items-start justify-center z-[100] p-4 overflow-y-auto pt-10 pb-20">
      <div className="glass-card p-10 w-full max-w-3xl animate-premium-in border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.9)] relative mb-10">
        <div className="flex justify-between items-center mb-8 pb-4 border-b border-white/10">
          <div>
            <h2 className="text-2xl font-black text-gradient-gold uppercase tracking-tight">
              {editingProduct ? 'Curate Piece' : 'Catalogue New Piece'}
            </h2>
            <p className="text-[10px] font-bold text-silver-dark uppercase tracking-widest mt-1">Registry Entry #{product.id ? product.id.slice(-8).toUpperCase() : 'NEW'}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors group">
            <XMarkIcon className="w-6 h-6 text-silver-dark group-hover:text-white transition-colors" />
          </button>
        </div>

        <form onSubmit={async (e) => {
          e.preventDefault();
          const formData = new FormData(e.target);
          const productData = {
            name: formData.get('name'),
            description: formData.get('description'),
            price: parseFloat(formData.get('price')),
            category_id: parseInt(formData.get('category')),
            sku: formData.get('sku'),
            stock: parseInt(formData.get('stock') || 0),
            status: formData.get('status') || (parseInt(formData.get('stock')) > 0 ? 'active' : 'inactive'),
            image: productImages[0]?.url || 'https://via.placeholder.com/300'
          };

          try {
            if (editingProduct) {
              await apiService.updateProduct(editingProduct.id, productData);
              setProducts(products.map(p => p.id === editingProduct.id ? { ...p, ...productData, category: categories.find(c => c.id === productData.category_id)?.name } : p));
            } else {
              const res = await apiService.addProduct(productData);
              if (res.success) {
                setProducts([{ ...res.data, category: categories.find(c => c.id === productData.category_id)?.name }, ...products]);
              }
            }
            onClose();
          } catch (err) {
            console.error('Operation failed:', err);
            alert('The vault registry rejected the entry. Please check data alignment.');
          }
        }} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-silver-dark mb-2">Piece Title</label>
                <input
                  name="name"
                  defaultValue={product.name}
                  required
                  className="input-dark bg-white/5 focus:bg-white/10 border-white/10 focus:border-gradient-gold w-full"
                  placeholder="Imperial Necklace..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-silver-dark mb-2">Designation SKU</label>
                  <input
                    name="sku"
                    defaultValue={product.sku}
                    required
                    className="input-dark bg-white/5 border-white/10 w-full"
                    placeholder="SKU-XXXX..."
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-silver-dark mb-2">Vault Status</label>
                  <select
                    name="status"
                    defaultValue={product.status || 'active'}
                    className="input-dark bg-white/5 border-white/10 w-full appearance-none"
                  >
                    <option value="active">Active (Visible)</option>
                    <option value="inactive">Inactive (Hidden)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-silver-dark mb-2">Valuation (₹)</label>
                  <input
                    name="price"
                    type="number"
                    step="0.01"
                    defaultValue={product.price}
                    required
                    className="input-dark bg-white/5 border-white/10 w-full"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-silver-dark mb-2">Vault Count</label>
                  <input
                    name="stock"
                    type="number"
                    defaultValue={product.stock}
                    required
                    className="input-dark bg-white/5 border-white/10 w-full"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-silver-dark mb-2">Collection Registry</label>
                <select
                  name="category"
                  defaultValue={product.category_id}
                  required
                  className="input-dark bg-white/5 border-white/10 w-full appearance-none"
                >
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div className="h-full flex flex-col">
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-silver-dark mb-2">Curator Notes</label>
                <textarea
                  name="description"
                  defaultValue={product.description}
                  rows="7"
                  className="input-dark bg-white/5 border-white/10 resize-none w-full flex-grow"
                  placeholder="Detailed lineage and material composition..."
                ></textarea>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-silver-dark mb-4">Visual Documentation</label>
            <div className="grid grid-cols-4 gap-4">
              {productImages.map((img, idx) => (
                <div key={img.id} className="aspect-square rounded-xl border border-white/10 bg-white/5 relative group overflow-hidden">
                  <img src={img.url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <button type="button" onClick={() => setProductImages(prev => prev.filter(p => p.id !== img.id))} className="absolute top-2 right-2 bg-black/60 p-1.5 rounded-full z-10">
                    <XMarkIcon className="w-3 h-3 text-white" />
                  </button>
                </div>
              ))}
              <label className="aspect-square rounded-xl border border-dashed border-white/20 hover:border-gradient-gold hover:bg-white/5 transition-all cursor-pointer flex flex-col items-center justify-center group">
                <PlusIcon className="w-6 h-6 text-silver-dark group-hover:text-gradient-gold transition-colors mb-2" />
                <span className="text-[8px] font-black text-silver-dark uppercase tracking-widest">Enlist Image</span>
                <input type="file" multiple className="hidden" onChange={(e) => {
                  const files = Array.from(e.target.files);
                  files.forEach(file => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setProductImages(prev => [...prev, { id: Date.now() + Math.random(), url: reader.result, name: file.name }]);
                    };
                    reader.readAsDataURL(file);
                  });
                }} />
              </label>
            </div>
          </div>

          <div className="flex justify-between items-center pt-8 border-t border-white/10">
            <button type="button" onClick={onClose} className="text-[10px] font-black uppercase tracking-[0.2em] text-silver-dark hover:text-white transition-colors">Abort Changes</button>
            <button type="submit" className="btn-gold py-4 px-12 text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all">
              {editingProduct ? 'Submit' : 'Enlist Piece'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AddEditCategoryModal = ({ isOpen, onClose, apiService, setCategories, editingCategory }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingCategory) {
      setFormData({
        name: editingCategory.name || '',
        description: editingCategory.description || '',
        image: editingCategory.image || '',
        status: editingCategory.status || 'active'
      });
    } else {
      setFormData({
        name: '',
        description: '',
        image: '',
        status: 'active'
      });
    }
  }, [editingCategory, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingCategory) {
        await apiService.updateCategory(editingCategory.id, formData);
        window.dispatchEvent(new CustomEvent('showNotification', {
          detail: { message: 'Collection refinement completed.', type: 'success' }
        }));
      } else {
        await apiService.createCategory(formData);
        window.dispatchEvent(new CustomEvent('showNotification', {
          detail: { message: 'New registry established successfully.', type: 'success' }
        }));
      }
      const freshCats = await apiService.getCategories();
      if (setCategories) setCategories(freshCats);
      onClose();
    } catch (e) {
      console.error('FAILED TO PROCESS COLLECTION:', e);
      const msg = e.response?.data?.message || 'Vault rejected the collection update. Check your connectivity.';
      alert(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#020617]/95 backdrop-blur-xl flex items-center justify-center z-[100] p-4">
      <div className="glass-card p-10 w-full max-w-lg animate-premium-in border-white/10">
        <h2 className="text-xl font-black text-gradient-gold uppercase tracking-widest mb-8">
          {editingCategory ? 'Refine Collection' : 'Establish Registry'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-silver-dark mb-3">Collection Name</label>
            <input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="input-dark w-full"
              placeholder="e.g. Victorian Opulence"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-silver-dark mb-3">Curation Notes</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input-dark w-full h-24 resize-none"
              placeholder="Describe the essence of this collection..."
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-silver-dark mb-3">Visual Identity (Cover)</label>
            <div className="flex items-center gap-4">
              {formData.image && (
                <img src={formData.image} alt="Preview" className="w-16 h-16 rounded-lg object-cover border border-white/10" />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="text-xs text-silver-dark file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-white/5 file:text-amber-400 hover:file:bg-white/10 cursor-pointer"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-silver-dark mb-3">Vault Status</label>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, status: formData.status === 'active' || !formData.status ? 'inactive' : 'active' })}
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.status === 'active' || !formData.status ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30' : 'bg-white/5 text-silver-dark border border-white/10'}`}
              >
                {formData.status === 'active' || !formData.status ? 'ACTIVE' : 'INACTIVE'}
              </button>
              <span className="text-[10px] text-silver-dark font-bold italic">
                {formData.status === 'active' || !formData.status ? 'Visible to customers' : 'Hidden from storefront'}
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-6 pt-4 border-t border-white/5">
            <button type="button" onClick={onClose} className="text-[10px] font-black text-silver-dark uppercase tracking-widest hover:text-white transition-colors">Abort</button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-silver py-3 px-8 text-[10px]"
            >
              {isSubmitting ? 'Processing...' : (editingCategory ? 'Confirm Refinement' : 'Establish Registry')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const OrderDetailsModal = ({ order, isOpen, onClose, apiService, onUpdateOrderStatus }) => {
  const [fullOrder, setFullOrder] = useState(order?.items?.length > 0 ? order : null);
  const [loadingDetails, setLoadingDetails] = useState(order && !order.items?.length);

  useEffect(() => {
    if (!order || order.items?.length > 0) return;

    const fetchFullOrder = async () => {
      setLoadingDetails(true);
      try {
        const res = await apiService.getOrder(order.id);
        if (res) {
          setFullOrder(res);
        }
      } catch (err) {
        console.error("Error fetching order details:", err);
        setFullOrder(order); // Fallback
      } finally {
        setLoadingDetails(false);
      }
    };

    fetchFullOrder();
  }, [order?.id]);

  if (!isOpen || !order) return null;

  const displayOrder = fullOrder || order;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-green-900/40 backdrop-blur-md border border-amber-500/20 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Order Details - {displayOrder.order_number || displayOrder.id.slice(-8).toUpperCase()}</h2>
          <button
            onClick={onClose}
            className="text-amber-200/50 hover:text-amber-200/80"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-amber-200/80">Customer</label>
              <p className="text-sm text-amber-100">{displayOrder.customer || (displayOrder.user ? (displayOrder.user.first_name + ' ' + displayOrder.user.last_name) : 'Guest')}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-amber-200/80">Total</label>
              <p className="text-sm text-amber-100">₹{parseFloat(displayOrder.total_amount || displayOrder.total).toLocaleString()}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-amber-200/80">Date</label>
              <p className="text-sm text-amber-100">{displayOrder.date || new Date(displayOrder.created_at).toLocaleDateString()}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-amber-200/80">Status</label>
              <select
                id="status_select_input"
                defaultValue={displayOrder.status?.toLowerCase() || 'pending'}
                className="w-full bg-green-950/50 text-amber-100 placeholder-amber-200/50 px-3 py-2 border border-amber-500/40 rounded-lg focus:ring-2 focus:ring-amber-300"
              >
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="col-span-2 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-amber-200/80">Tracking Number</label>
                <input
                  type="text"
                  id="tracking_number_input"
                  defaultValue={displayOrder.tracking_number}
                  placeholder="AWB / Ref #"
                  className="w-full bg-green-950/50 text-amber-100 placeholder-amber-200/30 px-3 py-2 border border-amber-500/40 rounded-lg focus:ring-2 focus:ring-amber-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-amber-200/80">Shipping Carrier</label>
                <select
                  id="shipping_carrier_input"
                  defaultValue={displayOrder.shipping_carrier || ''}
                  className="w-full bg-green-950/50 text-amber-100 placeholder-amber-200/30 px-3 py-2 border border-amber-500/40 rounded-lg focus:ring-2 focus:ring-amber-300"
                >
                  <option value="">Select Carrier</option>
                  <option value="Delhivery">Delhivery</option>
                  <option value="DTDC">DTDC</option>
                  <option value="BlueDart">BlueDart</option>
                  <option value="Delivery Partner">Delivery Partner</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pb-2">
              <button
                onClick={async () => {
                  const status = document.getElementById('status_select_input').value;
                  const tracking = document.getElementById('tracking_number_input').value;
                  const carrier = document.getElementById('shipping_carrier_input').value;
                  await onUpdateOrderStatus(displayOrder.id, status, tracking, carrier);
                  onClose();
                }}
                className="px-6 py-2 bg-amber-500/20 text-amber-200 hover:bg-amber-500 hover:text-green-950 text-[10px] font-black uppercase tracking-widest border border-amber-500/30 rounded-lg transition-all"
              >
                Save Acquisition Updates
              </button>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-amber-200/80 uppercase tracking-widest text-[10px] mb-1">Payment Method</label>
              <div className="px-3 py-2 bg-amber-500/5 border border-amber-500/10 rounded-lg text-amber-100 font-bold flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                {(displayOrder.payment_method || 'CASH ON DELIVERY (COD)')?.toUpperCase()}
              </div>
            </div>

            <div className="col-span-2 bg-green-950/40 p-5 rounded-2xl border border-amber-500/10 mt-2 shadow-lg shadow-black/20">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500/80 mb-4">Logistics Destination</h4>
              {displayOrder.shipping_address ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[8px] font-black uppercase tracking-widest text-amber-500/40 mb-1">Receiver Identity</label>
                      <p className="text-sm font-black text-amber-50">
                        {displayOrder.shipping_address.firstName || displayOrder.shipping_address.name} {displayOrder.shipping_address.lastName || ''}
                      </p>
                    </div>
                    <div>
                      <label className="block text-[8px] font-black uppercase tracking-widest text-amber-500/40 mb-1">Primary Phone</label>
                      <p className="text-sm font-bold text-emerald-400 tracking-wider font-mono">
                        {displayOrder.shipping_address.phone}
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[8px] font-black uppercase tracking-widest text-amber-500/40 mb-1">Vault Registry Address</label>
                    <div className="text-xs font-semibold text-amber-50/90 leading-relaxed bg-black/20 p-3 rounded-xl border border-white/5">
                      {displayOrder.shipping_address.house_no && <span className="text-amber-300 font-black mr-1">{displayOrder.shipping_address.house_no},</span>}
                      {displayOrder.shipping_address.address || displayOrder.shipping_address.addressLine1}
                      {displayOrder.shipping_address.addressLine2 && <><br />{displayOrder.shipping_address.addressLine2}</>}
                      <br />
                      {displayOrder.shipping_address.locality && <>{displayOrder.shipping_address.locality}, </>}
                      {displayOrder.shipping_address.city}, {displayOrder.shipping_address.state}
                      <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between">
                        <span className="text-[9px] font-black text-amber-500/40 uppercase tracking-widest">Pincode:</span>
                        <span className="text-amber-200 font-black tracking-widest">{displayOrder.shipping_address.zip || displayOrder.shipping_address.pincode || displayOrder.shipping_address.zipCode}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-amber-200/40 italic">Legacy destination data not available.</p>
              )}
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-medium text-amber-100 mb-2 uppercase tracking-widest text-[10px]">Acquisition Contents</h3>
            <div className="bg-green-950/40 p-4 rounded-xl border border-white/5 space-y-3">
              {loadingDetails ? (
                <div className="flex flex-col items-center justify-center py-8 gap-3">
                  <div className="w-6 h-6 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
                  <p className="text-[9px] font-black text-amber-500/40 uppercase tracking-widest">Hydrating Item Registry...</p>
                </div>
              ) : (
                <>
                  {displayOrder.items && displayOrder.items.length > 0 ? (
                    displayOrder.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-sm group">
                        <div className="flex flex-col">
                          <span className="text-amber-100 font-medium group-hover:text-amber-400 transition-colors">{item.product?.name || 'Jewelry Piece'}</span>
                          <span className="text-[10px] text-amber-200/50 uppercase tracking-[0.1em]">Quantity: {item.quantity}</span>
                        </div>
                        <span className="text-amber-100 font-black">₹{parseFloat(item.price).toLocaleString()}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-amber-200/40 italic">No pieces found in this acquisition.</p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CustomerProfileModal = ({ customer, isOpen, onClose, apiService }) => {
  const [modalOrders, setModalOrders] = useState(customer?.rawOrders || null);
  const [modalLoading, setModalLoading] = useState(customer && !customer.rawOrders);

  useEffect(() => {
    if (!customer || customer.rawOrders) return;

    const fetchCustomerOrders = async () => {
      setModalLoading(true);
      try {
        const res = await apiService.getUserOrders(customer.id);
        if (res.success) {
          setModalOrders(res.data || []);
        }
      } catch (err) {
        console.error("Error fetching modal orders:", err);
        setModalOrders([]);
      } finally {
        setModalLoading(false);
      }
    };

    fetchCustomerOrders();
  }, [customer?.id]);

  if (!isOpen || !customer) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-green-900/40 backdrop-blur-md border border-amber-500/20 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Customer Profile - {customer.name}</h2>
          <button
            onClick={onClose}
            className="text-amber-200/50 hover:text-amber-200/80"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-6 bg-green-950/30 p-5 rounded-2xl border border-amber-500/10 mb-6">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-amber-500/60 mb-1">Full Identity</label>
              <p className="text-sm font-bold text-amber-50">{customer.name}</p>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-amber-500/60 mb-1">Communication</label>
              <p className="text-sm font-bold text-amber-100/70">{customer.email}</p>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-amber-500/60 mb-1">Acquisitions</label>
              <p className="text-sm font-bold text-amber-50">{customer.orders} Orders</p>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-amber-500/60 mb-1">Lifetime Yield</label>
              <p className="text-sm font-bold text-amber-50">₹{customer.totalSpent.toLocaleString()}</p>
            </div>
          </div>

          <div className="border-t border-amber-500/10 pt-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500/80 mb-4">Historical Acquisitions</h3>
            <div className="space-y-3">
              {modalLoading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <div className="w-8 h-8 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
                  <p className="text-[10px] font-black text-amber-500/40 uppercase tracking-widest">Hydrating Legacy Registry...</p>
                </div>
              ) : (
                <>
                  {(modalOrders || []).length === 0 ? (
                    <div className="bg-green-950/20 border border-dashed border-amber-500/10 p-8 rounded-2xl text-center">
                      <p className="text-xs text-amber-200/40 uppercase tracking-widest font-black">No legacy acquisitions found</p>
                    </div>
                  ) : (
                    (modalOrders || []).map(order => (
                      <div key={order.id} className="bg-green-950/40 border border-amber-500/5 p-4 rounded-xl flex justify-between items-center group hover:border-amber-500/20 transition-all shadow-lg shadow-black/20">
                        <div>
                          <p className="text-[10px] font-black text-amber-500/60 uppercase tracking-widest mb-1">
                            SJ-{(order.id || '').substring(0, 8).toUpperCase()}
                          </p>
                          <p className="text-xs font-bold text-amber-200/60">{new Date(order.created_at || order.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-black text-amber-50 mb-1">₹{parseFloat(order.total_amount).toLocaleString()}</p>
                          <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${order.status === 'delivered' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                              order.status === 'cancelled' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Admin = () => {
  const { user, isSignedIn, isLoaded } = useAuth();

  // High-priority vault telemetry for auth debugging
  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      console.log('--- VAULT AUTH MANIFEST ---');
      console.log('Email:', user.primaryEmailAddress?.emailAddress);
      console.log('Public Metadata (FULL):', JSON.stringify(user.publicMetadata, null, 2));
      console.log('Is Admin:', user.publicMetadata?.role === 'admin');
      console.log('---------------------------');
    }
  }, [isLoaded, isSignedIn, user]);

  const { siteSettings, updateSiteSettings } = useSiteSettings();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(null);
  const [showCustomerProfile, setShowCustomerProfile] = useState(null);
  const [showBulkStockUpdate, setShowBulkStockUpdate] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [zoomedImage, setZoomedImage] = useState(null);
  const [productImages, setProductImages] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    lowStock: true,
    newOrders: true
  });
  const [reviews, setReviews] = useState([]);
  const [inquiries, setInquiries] = useState([]);

  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

  // Use backend API to check admin status (fetches live data from Clerk)
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!isLoaded) return;

      // Allow localhost without authentication
      if (isLocalhost) {
        setIsAdmin(true);
        setLoading(false);
        return;
      }

      if (!isSignedIn) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001/api'}/users/check-admin`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('clerk-token')}`,
            'Content-Type': 'application/json'
          }
        });
        const data = await response.json();
        setIsAdmin(data.isAdmin || false);
        console.log('Admin check result:', data);
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      }

      setLoading(false);
    };

    checkAdminStatus();
  }, [isLoaded, isSignedIn, isLocalhost]);

  useEffect(() => {
    if (!isLoaded) return;

    if (!isAdmin && !isLocalhost) {
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        const results = await Promise.allSettled([
          apiService.getProducts(),
          apiService.getOrders(),
          apiService.getCustomers(),
          apiService.getCategories(),
          apiService.getReviews(),
          apiService.getInquiries()
        ]);

        const [productsRes, ordersRes, customersRes, categoriesRes, reviewsRes, inquiriesRes] = results;

        // Map products
        if (productsRes.status === 'fulfilled' && productsRes.value?.products) {
          setProducts(productsRes.value.products.map(p => ({
            ...p,
            category: p.category?.name || 'Uncategorized',
            status: p.status || (p.stock > 0 ? 'active' : 'inactive'),
            image: p.images?.[0] || 'https://via.placeholder.com/300'
          })));
        }

        // Map orders
        if (ordersRes.status === 'fulfilled' && ordersRes.value) {
          const ordersArray = Array.isArray(ordersRes.value) ? ordersRes.value : (ordersRes.value.data || []);
          setOrders(ordersArray.map(o => ({
            id: o.id, // KEEP AS UUID FOR API CALLS
            displayId: o.order_number || o.id.slice(-8).toUpperCase(),
            customer: o.user ? (o.user.first_name + ' ' + o.user.last_name).trim() || o.user.email : 'Guest',
            total: parseFloat(o.total_amount) || 0,
            status: o.status ? o.status.charAt(0).toUpperCase() + o.status.slice(1) : 'Pending',
            date: new Date(o.created_at || o.createdAt).toLocaleDateString(),
            payment_method: o.payment_method || 'COD',
            items: o.items || [],
            tracking_number: o.tracking_number,
            shipping_carrier: o.shipping_carrier,
            shipping_address: o.shipping_address
          })));
        }

        // Map customers (Optimized: No rawOrders in initial load)
        if (customersRes.status === 'fulfilled' && Array.isArray(customersRes.value)) {
          setCustomers(customersRes.value.map(c => ({
            id: c.id,
            name: ((c.first_name || '') + ' ' + (c.last_name || '')).trim() || c.email || 'Unknown',
            email: c.email,
            orders: parseInt(c.ordersCount) || 0,
            totalSpent: parseFloat(c.totalSpent) || 0,
            promotionalEmails: c.promotional_emails
          })));
        } else if (customersRes.status === 'fulfilled') {
          console.error('Customer data is not an array:', customersRes.value);
        }

        // Set Categories
        if (categoriesRes.status === 'fulfilled') {
          setCategories(categoriesRes.value);
        }

        // Set Reviews
        if (reviewsRes.status === 'fulfilled') {
          setReviews(reviewsRes.value);
        }

        // Set Inquiries
        if (inquiriesRes.status === 'fulfilled' && inquiriesRes.value.success) {
          setInquiries(inquiriesRes.value.data);
        }
      } catch (e) {
        console.error('Failed to load admin data:', e);
      } finally {
        setLoading(false);
      }
    };

    loadData();
    // Keep it sync with a 30s poll
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [isLoaded, isAdmin, isLocalhost]);

  // Effect to populate images when editing a product
  useEffect(() => {
    if (editingProduct) {
      if (Array.isArray(editingProduct.images)) {
        setProductImages(editingProduct.images.map((url, idx) => ({
          id: `existing-${idx}-${Date.now()}`,
          url,
          name: `Existing Image ${idx + 1}`
        })));
      } else if (editingProduct.image) {
        setProductImages([{
          id: `existing-main-${Date.now()}`,
          url: editingProduct.image,
          name: 'Main Image'
        }]);
      }
    } else {
      setProductImages([]);
      setSelectedImages([]);
    }
  }, [editingProduct]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin shadow-[0_0_15px_rgba(245,158,11,0.2)]"></div>
      </div>
    );
  }

  if (isSignedIn && !isAdmin) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-4">
        <div className="glass-card p-10 max-w-lg text-center border-red-500/20 shadow-[0_0_50px_rgba(239,68,68,0.1)]">
          <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-red-500/20 animate-pulse">
            <ExclamationTriangleIcon className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-4">Registry Entry Refused</h2>
          <p className="text-sm text-slate-400 font-bold mb-8 leading-relaxed">
            Your current identity lacks the <span className="text-amber-400">'admin'</span> claim. This vault is reserved for elite curators.
          </p>
          <div className="flex flex-col gap-4">
            <button
              onClick={() => {
                // We'll use the logout from useAuth
                window.location.href = window.location.origin;
              }}
              className="btn-silver py-3"
            >
              Return to Catalog
            </button>
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mt-4">
              Authenticated As: {user?.emailAddresses[0]?.emailAddress}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center relative overflow-hidden px-4">
        {/* Background Decorative Elements */}
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-sky-500/5 rounded-full blur-[120px]" />

        <div className="text-center mb-12 animate-premium-in relative z-10">
          <div className="w-20 h-20 bg-gradient-to-tr from-slate-200 to-slate-400 rounded-3xl flex items-center justify-center font-black text-slate-950 shadow-2xl shadow-white/10 mx-auto mb-6 rotate-3">
            S
          </div>
          <h1 className="text-5xl font-black text-gradient-silver tracking-tighter mb-3">Saram Jewels</h1>
          <div className="flex items-center justify-center gap-3">
            <div className="h-[1px] w-8 bg-slate-500/20" />
            <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Elite Admin Vault</p>
            <div className="h-[1px] w-8 bg-slate-500/20" />
          </div>
        </div>

        <div className="glass-card p-2 rounded-[2rem] animate-premium-in shadow-white/5 relative z-10">
          <SignIn />
        </div>

        <p className="mt-12 text-[10px] font-bold text-slate-500/40 uppercase tracking-widest animate-premium-in delay-300">
          SECURED BY SARAM CRYPTO-ARCHITECTURE
        </p>
      </div>
    );
  }

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: ChartBarIcon },
    { id: 'products', name: 'Products', icon: CubeIcon },
    { id: 'categories', name: 'Categories', icon: ArchiveBoxIcon },
    { id: 'orders', name: 'Orders', icon: ShoppingBagIcon },
    { id: 'customers', name: 'Customers', icon: UsersIcon },
    { id: 'inventory', name: 'Inventory', icon: ArchiveBoxIcon },
    { id: 'reviews', name: 'Client Reviews', icon: ChatBubbleBottomCenterTextIcon },
    { id: 'messages', name: 'Inquiries', icon: ChatBubbleBottomCenterTextIcon },
    { id: 'settings', name: 'Settings', icon: CogIcon }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-sky-400 bg-sky-500/20 border border-sky-500/30 shadow-[0_0_12px_rgba(56,189,248,0.2)]';
      case 'Delivered': return 'text-emerald-400 bg-emerald-500/20 border border-emerald-500/30';
      case 'In Transit': return 'text-indigo-400 bg-indigo-500/20 border border-indigo-500/30';
      case 'inactive': return 'text-slate-400 bg-slate-800/60 border border-slate-700/50 grayscale opacity-60';
      default: return 'text-slate-400 bg-slate-800/40 border border-slate-700/30';
    }
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return { color: 'text-rose-400 bg-rose-500/20', text: 'Out of Stock' };
    if (stock <= 5) return { color: 'text-amber-400 bg-amber-400/20', text: 'Low Stock' };
    return { color: 'text-sky-400 bg-sky-500/20', text: 'In Stock' };
  };

  const filteredProducts = products.filter(product =>
    product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredOrders = orders.filter(order =>
    order.displayId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.customer?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCustomers = customers.filter(customer =>
    customer.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Product Management Functions
  const addProduct = async (productData) => {
    try {
      const newProduct = await apiService.createProduct(productData);
      const cat = categories.find(c => c.id === productData.category_id);
      const formattedNewProduct = {
        ...newProduct,
        category: cat ? cat.name : 'Uncategorized',
        status: newProduct.stock > 0 ? 'active' : 'inactive',
        image: (Array.isArray(newProduct.images) && newProduct.images[0]) || newProduct.image || 'https://via.placeholder.com/300',
        price: parseFloat(newProduct.price),
        originalPrice: parseFloat(newProduct.original_price || newProduct.originalPrice || newProduct.price)
      };
      setProducts([formattedNewProduct, ...products]);
      setShowAddProduct(false);

      // Success cleanup
      setSelectedImage(null);
      setImagePreview(null);
      setSelectedImages([]);
      setProductImages([]);

      return true;
    } catch (e) {
      console.error(e);
      const errorMsg = e.response?.data?.message || 'Failed to catalogue piece. Check manifest details.';
      alert(errorMsg);
      return false;
    }
  };

  const updateProductStock = async (productId, newStock) => {
    try {
      await apiService.updateProduct(productId, { stock: newStock });
      setProducts(products.map(product =>
        product.id === productId ? {
          ...product,
          stock: newStock,
          status: newStock > 0 ? 'active' : 'inactive'
        } : product
      ));
      return true;
    } catch (e) {
      console.error(e);
      alert('Failed to update stock.');
      return false;
    }
  };

  const updateProduct = async (productId, productData) => {
    try {
      const updated = await apiService.updateProduct(productId, productData);
      const cat = categories.find(c => c.id === productData.category_id);
      setProducts(products.map(product =>
        product.id === productId ? {
          ...product,
          ...updated,
          category: cat ? cat.name : product.category,
          status: updated.stock > 0 ? 'active' : 'inactive',
          image: (Array.isArray(updated.images) && updated.images[0]) || updated.image || product.image,
          price: parseFloat(updated.price),
          originalPrice: parseFloat(updated.original_price || updated.originalPrice || updated.price)
        } : product
      ));
      setEditingProduct(null);

      // Success cleanup
      setSelectedImage(null);
      setImagePreview(null);
      setSelectedImages([]);
      setProductImages([]);

      return true;
    } catch (e) {
      console.error(e);
      alert('Failed to update curation.');
      return false;
    }
  };

  const deleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await apiService.deleteProduct(productId);
        setProducts(products.filter(product => product.id !== productId));
      } catch (e) {
        console.error(e);
      }
    }
  };

  const toggleProductStatus = async (productId) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const newStatus = product.status === 'active' ? 'inactive' : 'active';

    try {
      // Optimitic update
      setProducts(products.map(p =>
        p.id === productId ? { ...p, status: newStatus } : p
      ));

      // Persist to backend
      // We'll update the 'stock' as well if it's currently 0 but being activated? 
      // Or just let status be independent.
      await apiService.updateProduct(productId, { status: newStatus });
    } catch (e) {
      console.error(e);
      // Revert on error
      setProducts(products.map(p =>
        p.id === productId ? { ...p, status: product.status } : p
      ));
      alert('Failed to sync status change with vault.');
    }
  };

  // Order Management Functions
  const updateOrderStatus = async (orderId, status, tracking_number = null, shipping_carrier = null) => {
    try {
      const dbStatus = status.toLowerCase();
      const response = await apiService.updateOrderStatus(orderId, {
        status: dbStatus,
        tracking_number,
        shipping_carrier
      });

      const displayStatus = status.charAt(0).toUpperCase() + status.slice(1);
      const updatedOrder = {
        ...orders.find(o => o.id === orderId),
        status: displayStatus,
        tracking_number,
        shipping_carrier
      };

      setOrders(orders.map(order => order.id === orderId ? updatedOrder : order));

      if (showOrderDetails && showOrderDetails.id === orderId) {
        setShowOrderDetails(updatedOrder);
      }
    } catch (e) {
      console.error(e);
      alert('Failed to update acquisition protocol.');
    }
  };

  // Category Management Functions
  const addCategory = async (categoryData) => {
    try {
      const newCategory = await apiService.createCategory(categoryData);
      setCategories([...categories, {
        ...newCategory,
        products: [] // New categories start with no products
      }]);
      setShowAddCategory(false);
      setImagePreview(null); // Clear image preview only on success
      return true;
    } catch (e) {
      console.error(e);
      const msg = e.response?.data?.message || 'Check if the name is unique or image is too large.';
      alert(`Failed to establish this realm: ${msg}`);
      return false;
    }
  };

  const deleteCategory = async (id) => {
    try {
      const category = categories.find(c => c.id === id);
      if (category.products?.length > 0) {
        alert('This collection still holds pieces. Redistribute or remove pieces before dissolving the realm.');
        return false;
      }

      await apiService.deleteCategory(id);
      setCategories(categories.filter(c => c.id !== id));
      return true;
    } catch (e) {
      console.error(e);
      alert('Failed to dissolve the collection.');
      return false;
    }
  };

  // Bulk Stock Update Functions
  const updateBulkStock = async (productId, newStock) => {
    try {
      await apiService.updateProduct(productId, { stock: newStock });
      setProducts(products.map(product =>
        product.id === productId ? { ...product, stock: newStock, status: newStock > 0 ? 'active' : 'inactive' } : product
      ));
    } catch (e) {
      console.error(e);
    }
  };

  const updateInquiryStatus = async (inquiryId, status) => {
    try {
      await apiService.updateInquiryStatus(inquiryId, status);
      setInquiries(inquiries.map(inquiry =>
        inquiry.id === inquiryId ? { ...inquiry, status } : inquiry
      ));
    } catch (e) {
      console.error(e);
    }
  };

  // Image Handling Functions
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = () => {
    // Create a file input for camera
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'camera';
    input.onchange = handleImageUpload;
    input.click();
  };

  const handleGallerySelect = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = handleImageUpload;
    input.click();
  };

  const handleImageUrlInput = (url) => {
    setImagePreview(url);
    setSelectedImage(null);
  };

  // Multiple Image Handling Functions
  const handleMultipleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newImage = {
          id: Date.now() + Math.random(),
          file: file,
          url: e.target.result,
          name: file.name
        };
        setSelectedImages(prev => [...prev, newImage]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleMultipleImageUrlInput = (urls) => {
    const urlArray = urls.split('\n').filter(url => url.trim());
    const newImages = urlArray.map(url => ({
      id: Date.now() + Math.random(),
      url: url.trim(),
      name: `Image ${Date.now()}`
    }));
    setProductImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (imageId, isSelected = false) => {
    if (isSelected) {
      setSelectedImages(prev => prev.filter(img => img.id !== imageId));
    } else {
      setProductImages(prev => prev.filter(img => img.id !== imageId));
    }
  };

  const reorderImages = (index, direction) => {
    const images = [...productImages];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex >= 0 && newIndex < images.length) {
      const temp = images[index];
      images[index] = images[newIndex];
      images[newIndex] = temp;
      setProductImages(images);
    }
  };

  const setMainImage = (index) => {
    const images = [...productImages];
    const [main] = images.splice(index, 1);
    setProductImages([main, ...images]);
  };

  // Notification Functions
  const toggleNotification = (type) => {
    setNotifications(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };



  const renderDashboard = () => (
    <div className="space-y-8 animate-premium-in">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-gradient-silver">Dashboard Overview</h2>
          <p className="text-slate-400 mt-1">Welcome back! Accessing vault analytics.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-slate-900/40 backdrop-blur-md border border-slate-500/20 rounded-xl text-slate-300 text-sm font-medium">
            Timestamp: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-6 group hover:translate-y-[-4px] transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400 uppercase tracking-wider">Inquiries</p>
              <h3 className="text-3xl font-bold text-white mt-1">{inquiries.filter(i => i.status === 'unread').length}</h3>
            </div>
            <div className="p-3 bg-amber-500/10 rounded-2xl group-hover:bg-amber-500/20 transition-colors">
              <ChatBubbleBottomCenterTextIcon className="h-8 w-8 text-amber-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-amber-400">
            <span className="font-bold">{inquiries.length} total</span>
            <span className="ml-1 text-slate-500">patron messages</span>
          </div>
        </div>

        <div className="glass-card p-6 group hover:translate-y-[-4px] transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400 uppercase tracking-wider">Acquisitions</p>
              <h3 className="text-3xl font-bold text-white mt-1">{orders.length}</h3>
            </div>
            <div className="p-3 bg-emerald-500/10 rounded-2xl group-hover:bg-emerald-500/20 transition-colors">
              <ShoppingBagIcon className="h-8 w-8 text-emerald-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-emerald-400">
            <span className="font-bold">+{Math.floor(orders.length * 0.05)}%</span>
            <span className="ml-1 text-slate-500">yield growth</span>
          </div>
        </div>

        <div className="glass-card p-6 group hover:translate-y-[-4px] transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400 uppercase tracking-wider">Patrons</p>
              <h3 className="text-3xl font-bold text-white mt-1">{customers.length}</h3>
            </div>
            <div className="p-3 bg-indigo-400/10 rounded-2xl group-hover:bg-indigo-400/20 transition-colors">
              <UsersIcon className="h-8 w-8 text-indigo-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-indigo-400">
            <span className="font-bold">+{Math.floor(customers.length * 0.08)}%</span>
            <span className="ml-1 text-slate-500">expansion</span>
          </div>
        </div>

        <div className="glass-card p-6 group hover:translate-y-[-4px] transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400 uppercase tracking-wider">Total Yield</p>
              <h3 className="text-3xl font-bold text-white mt-1">₹{orders.reduce((sum, order) => sum + order.total, 0).toLocaleString()}</h3>
            </div>
            <div className="p-3 bg-slate-200/10 rounded-2xl group-hover:bg-slate-200/20 transition-colors">
              <CurrencyRupeeIcon className="h-8 w-8 text-slate-300" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-sky-400">
            <span className="font-bold">+12.4%</span>
            <span className="ml-1 text-slate-500">net liquidity</span>
          </div>
        </div>
      </div>

      {/* Low Stock Alert */}
      <div className="glass-card overflow-hidden transition-all duration-300">
        <div className="px-6 py-4 border-b border-amber-500/10 flex items-center justify-between">
          <h3 className="text-lg font-bold text-amber-50 flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-amber-400 mr-2" />
            Low Stock Alert
          </h3>
          <span className="px-3 py-1 bg-amber-500/10 text-amber-400 text-xs font-bold rounded-full">
            {products.filter(p => p.stock <= 5).length} Items At Risk
          </span>
        </div>
        <div className="p-6">
          {products.filter(p => p.stock <= 5).length === 0 ? (
            <div className="text-center py-8">
              <p className="text-amber-200/30">No low stock items. Everything is on track!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {products.filter(p => p.stock <= 5).map((product) => (
                <div key={product.id} className="flex items-center justify-between p-4 bg-green-950/40 border border-amber-500/10 rounded-xl hover:bg-green-950/60 transition-all group">
                  <div className="flex items-center gap-4">
                    <img src={product.image} className="h-12 w-12 rounded-lg object-cover border border-amber-500/10" alt="" />
                    <div>
                      <p className="text-sm font-bold text-amber-100">{product.name}</p>
                      <p className="text-xs text-amber-200/40">SKU: {product.sku}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-black ${product.stock === 0 ? 'text-red-400' : 'text-amber-400'}`}>
                      {product.stock} left
                    </p>
                    <button className="text-xs text-amber-200/60 hover:text-amber-300 font-bold underline transition-colors">Adjust Stock</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderProducts = () => (
    <div className="space-y-8 animate-premium-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-gradient-silver">Product Catalog</h2>
          <p className="text-slate-400 mt-1">Manage, track and organize your jewelry collection.</p>
        </div>
        <button
          onClick={() => setShowAddProduct(true)}
          className="btn-primary flex items-center gap-2"
        >
          <PlusIcon className="h-5 w-5" />
          Add New Piece
        </button>
      </div>

      <div className="glass-card p-4">
        <div className="relative group">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-sky-400 transition-colors" />
          <input
            type="text"
            placeholder="Search by name, SKU or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="glass-input w-full pl-12 pr-4 py-3"
          />
        </div>
      </div>

      <div className="glass-card overflow-hidden border-none shadow-2xl">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#e2e8f0]/10">
            <thead>
              <tr className="bg-[#0f172a]/80">
                <th className="px-6 py-5 text-left text-xs font-black text-slate-400 uppercase tracking-widest">The Piece</th>
                <th className="px-6 py-5 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Category</th>
                <th className="px-6 py-5 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Valuation</th>
                <th className="px-6 py-5 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Inventory</th>
                <th className="px-6 py-5 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-5 text-right text-xs font-black text-slate-400 uppercase tracking-widest">Management</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-500/5">
              {filteredProducts.map((product) => {
                const stockStatus = getStockStatus(product.stock);
                return (
                  <tr key={product.id} className="group hover:bg-white/[0.02] transition-all">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-4">
                        <div className="relative group/img">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="h-14 w-14 rounded-xl object-cover border border-white/10 cursor-pointer group-hover/img:scale-105 transition-transform"
                            onClick={() => setZoomedImage(product.image)}
                          />
                          {product.stock === 0 && (
                            <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center">
                              <span className="text-[8px] font-black text-white uppercase tracking-tighter">Out</span>
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-100 group-hover:text-white transition-colors">{product.name}</div>
                          <div className="text-xs text-slate-500 font-mono tracking-tighter mt-0.5">#{product.sku}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 bg-slate-900/50 border border-white/5 rounded-full text-xs font-bold text-slate-400 uppercase">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-black text-slate-100">₹{product.price.toLocaleString()}</div>
                      {product.originalPrice > product.price && (
                        <div className="text-[10px] text-slate-600 line-through">₹{product.originalPrice.toLocaleString()}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-bold ${stockStatus.color.split(' ')[0]}`}>{product.stock} units</div>
                      <div className="w-24 h-1 bg-slate-800 rounded-full mt-1.5 overflow-hidden">
                        <div
                          className={`h-full ${stockStatus.color.split(' ')[1].replace('/20', '')}`}
                          style={{ width: `${Math.min(100, (product.stock / 20) * 100)}%` }}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 text-[10px] font-black rounded-full uppercase tracking-widest ${getStatusColor(product.status)}`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end items-center gap-2 transition-all">
                        <button
                          onClick={() => setEditingProduct(product)}
                          className="p-2 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                          title="Edit Piece"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => toggleProductStatus(product.id)}
                          className={`p-2 rounded-lg transition-all ${product.status === 'active' ? 'bg-sky-500/10 text-sky-400 hover:bg-sky-500/20' : 'bg-slate-500/10 text-slate-400 hover:bg-slate-500/20'}`}
                        >
                          {product.status === 'active' ? <EyeIcon className="h-4 w-4" /> : <EyeSlashIcon className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => deleteProduct(product.id)}
                          className="p-2 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 rounded-lg transition-all"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderOrders = () => (
    <div className="space-y-8 animate-premium-in">
      <div>
        <h2 className="text-3xl font-extrabold text-gradient-silver">Client Orders</h2>
        <p className="text-slate-400 mt-1">Monitor sales and manage fulfillment pipeline.</p>
      </div>

      <div className="glass-card p-4">
        <div className="relative group">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-amber-400 transition-colors" />
          <input
            type="text"
            placeholder="Search acquisitions by ID or customer name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="glass-input w-full pl-12 pr-4 py-3"
          />
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-amber-500/10">
            <thead>
              <tr className="bg-green-950/80">
                <th className="px-6 py-5 text-left text-xs font-black text-amber-400 uppercase tracking-widest">Order Ref</th>
                <th className="px-6 py-5 text-left text-xs font-black text-amber-400 uppercase tracking-widest">Client</th>
                <th className="px-6 py-5 text-left text-xs font-black text-amber-400 uppercase tracking-widest">Value</th>
                <th className="px-6 py-5 text-left text-xs font-black text-amber-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-5 text-left text-xs font-black text-amber-400 uppercase tracking-widest">Manifest Date</th>
                <th className="px-6 py-5 text-right text-xs font-black text-amber-400 uppercase tracking-widest">Intervention</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-500/5">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-amber-500/[0.02] transition-colors group text-sm">
                  <td className="px-6 py-4 whitespace-nowrap font-black text-amber-50">{order.displayId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-amber-200/80 font-bold">{order.customer}</td>
                  <td className="px-6 py-4 whitespace-nowrap font-black text-amber-100 italic">₹{order.total.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 text-[10px] font-black rounded-full uppercase tracking-widest ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-amber-200/30 text-xs">{order.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      onClick={() => setShowOrderDetails(order)}
                      className="px-4 py-1.5 bg-amber-500/10 text-amber-400 hover:bg-amber-500 text-[10px] font-black uppercase tracking-widest border border-amber-500/20 rounded-lg hover:text-green-950 transition-all"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderCustomers = () => (
    <div className="space-y-8 animate-premium-in">
      <div>
        <h2 className="text-3xl font-extrabold text-gradient-gold">Customer Registry</h2>
        <p className="text-amber-200/60 mt-1">Manage relationships and track lifetime value.</p>
      </div>

      <div className="glass-card p-4">
        <div className="relative group">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-gold-400 transition-colors" />
          <input
            type="text"
            placeholder="Identify client by name or email registry..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="glass-input w-full pl-12 pr-4 py-3"
          />
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-amber-500/10">
            <thead>
              <tr className="bg-green-950/80">
                <th className="px-6 py-5 text-left text-xs font-black text-amber-400 uppercase tracking-widest">Client Identity</th>
                <th className="px-6 py-5 text-left text-xs font-black text-amber-400 uppercase tracking-widest">Communication</th>
                <th className="px-6 py-5 text-left text-xs font-black text-amber-400 uppercase tracking-widest">Email Drops</th>
                <th className="px-6 py-5 text-left text-xs font-black text-amber-400 uppercase tracking-widest">Acquisitions</th>
                <th className="px-6 py-5 text-left text-xs font-black text-amber-400 uppercase tracking-widest">Lifetime Yield</th>
                <th className="px-6 py-5 text-right text-xs font-black text-amber-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-500/5">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-amber-500/[0.02] transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 bg-amber-500/10 rounded-full flex items-center justify-center font-black text-amber-500 text-xs border border-amber-500/10 uppercase">
                        {customer.name?.charAt(0) || '?'}
                      </div>
                      <div className="text-sm font-bold text-amber-50">{customer.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-amber-200/60 font-mono italic">{customer.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${customer.promotionalEmails ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                      {customer.promotionalEmails ? 'Promotional ON' : 'Promotional OFF'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-amber-50">{customer.orders} Orders</td>
                  <td className="px-6 py-4 whitespace-nowrap font-black text-amber-100">₹{customer.totalSpent.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      onClick={() => setShowCustomerProfile(customer)}
                      className="px-4 py-1.5 border border-amber-500/20 rounded-lg text-amber-300 text-xs font-bold hover:bg-amber-500/10 transition-all opacity-0 group-hover:opacity-100"
                    >
                      Dossier
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderCategories = () => (
    <div className="space-y-8 animate-premium-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-gradient-gold">Collections</h2>
          <p className="text-amber-200/60 mt-1">Organize your pieces into elegant categories.</p>
        </div>
        <button
          onClick={() => setShowAddCategory(true)}
          className="btn-primary flex items-center gap-2"
        >
          <PlusIcon className="h-5 w-5" />
          New Category
        </button>
      </div>

      <div className="glass-card border border-amber-500/10 overflow-hidden shadow-2xl shadow-black/40">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-amber-500/10">
            <thead>
              <tr className="bg-amber-400/5 backdrop-blur-md">
                <th className="px-6 py-5 text-left text-[10px] font-black text-amber-400/60 uppercase tracking-[0.2em]">Category Name</th>
                <th className="px-6 py-5 text-left text-[10px] font-black text-amber-400/60 uppercase tracking-[0.2em]">Identifier</th>
                <th className="px-6 py-5 text-left text-[10px] font-black text-amber-400/60 uppercase tracking-[0.2em]">Description</th>
                <th className="px-6 py-5 text-left text-[10px] font-black text-amber-400/60 uppercase tracking-[0.2em]">Status</th>
                <th className="px-6 py-5 text-right text-[10px] font-black text-amber-400/60 uppercase tracking-[0.2em]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-500/5 bg-green-950/20">
              {categories.map((category) => (
                <tr key={category.id} className="hover:bg-amber-500/[0.03] transition-all duration-300 group">
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="text-sm font-black text-amber-50 group-hover:text-amber-300 transition-colors uppercase tracking-tight">{category.name}</div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <span className="px-2 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-[10px] font-black font-mono text-amber-400/60 uppercase">
                      {category.slug || category.id?.substring(0, 8)}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="text-xs font-bold text-amber-200/40 line-clamp-1 max-w-xs">{category.description || 'No legacy documented...'}</div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-sm font-black">
                    <span className={`px-3 py-1 text-[10px] font-black rounded-full uppercase tracking-widest ${category.status === 'active' || !category.status ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30' : 'bg-white/5 text-silver-dark border border-white/10'}`}>
                      {category.status || 'active'}
                    </span>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-right">
                    <div className="flex justify-end items-center gap-2">
                      <button
                        onClick={() => toggleCategoryStatus(category.id)}
                        className={`p-2.5 rounded-xl transition-all ${category.status === 'inactive' ? 'bg-slate-500/10 text-slate-400 hover:bg-slate-500/20' : 'bg-sky-500/10 text-sky-400 hover:bg-sky-500/20'}`}
                        title={category.status === 'inactive' ? 'Release Collection' : 'Move to Vault'}
                      >
                        {category.status === 'inactive' ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                      </button>
                      <button
                        onClick={() => setEditingCategory(category)}
                        className="p-2.5 text-amber-100/40 hover:text-amber-300 hover:bg-amber-500/10 rounded-xl transition-all"
                        title="Refine Collection"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('Dissolve this collection and its legacy?')) {
                            deleteCategory(category.id);
                          }
                        }}
                        className="p-2.5 text-red-100/40 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all"
                        title="Dissolve Registry"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // End of old Category Modal logic


  const renderInventory = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-amber-100">Inventory Management</h2>
        <p className="text-amber-200/70">Track stock levels and manage inventory</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-green-900/40 backdrop-blur-md border border-amber-500/20 rounded-lg shadow-xl shadow-black/20 p-6">
          <h3 className="text-lg font-semibold text-amber-100 mb-4">Stock Overview</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-amber-200/70">Total Products</span>
              <span className="text-sm font-medium text-amber-100">{products.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-amber-200/70">In Stock</span>
              <span className="text-sm font-medium text-emerald-400">{products.filter(p => p.stock > 5).length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-amber-200/70">Low Stock</span>
              <span className="text-sm font-medium text-amber-300">{products.filter(p => p.stock <= 5 && p.stock > 0).length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-amber-200/70">Out of Stock</span>
              <span className="text-sm font-medium text-red-400">{products.filter(p => p.stock === 0).length}</span>
            </div>
          </div>
        </div>

        <div className="bg-green-900/40 backdrop-blur-md border border-amber-500/20 rounded-lg shadow-xl shadow-black/20 p-6">
          <h3 className="text-lg font-semibold text-amber-100 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button
              onClick={() => setShowAddProduct(true)}
              className="w-full bg-green-950/50 text-amber-100 placeholder-amber-200/50 text-left p-3 border border-amber-500/30 rounded-lg hover:bg-green-950 transition-colors"
            >
              <div className="flex items-center">
                <PlusIcon className="h-5 w-5 text-amber-300 mr-3" />
                <div>
                  <div className="text-sm font-medium text-amber-100">Add New Product</div>
                  <div className="text-sm text-amber-200/50">Create a new product listing</div>
                </div>
              </div>
            </button>
            <button
              onClick={() => setShowBulkStockUpdate(true)}
              className="w-full bg-green-950/50 text-amber-100 placeholder-amber-200/50 text-left p-3 border border-amber-500/30 rounded-lg hover:bg-green-950 transition-colors"
            >
              <div className="flex items-center">
                <ArchiveBoxIcon className="h-5 w-5 text-emerald-400 mr-3" />
                <div>
                  <div className="text-sm font-medium text-amber-100">Update Stock</div>
                  <div className="text-sm text-amber-200/50">Bulk update inventory levels</div>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Product List with Stock Update */}
      <div className="bg-green-900/40 backdrop-blur-md border border-amber-500/20 rounded-lg shadow-xl shadow-black/20 overflow-hidden">
        <div className="p-4 border-b border-amber-500/20">
          <h3 className="text-lg font-semibold text-amber-100">Product Inventory</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-amber-500/20">
            <thead className="bg-green-950">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-amber-200/50 uppercase">Product</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-amber-200/50 uppercase">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-amber-200/50 uppercase">Current Stock</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-amber-200/50 uppercase">Update Stock</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-amber-200/50 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-green-900/40 divide-y divide-amber-500/20">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-green-950/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-10 w-10 rounded object-cover mr-3"
                      />
                      <div>
                        <div className="text-sm font-medium text-amber-100">{product.name}</div>
                        <div className="text-xs text-amber-200/50">{product.sku}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-amber-200/70">{product.category}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium text-amber-100">{product.stock}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        defaultValue={product.stock}
                        id={`stock-input-${product.id}`}
                        className="w-20 px-2 py-1 text-sm bg-green-950/50 border border-amber-500/40 rounded text-amber-100 focus:ring-2 focus:ring-amber-300 focus:outline-none"
                      />
                      <button
                        onClick={async () => {
                          const inputEl = document.getElementById(`stock-input-${product.id}`);
                          const newStock = parseInt(inputEl?.value) || 0;
                          if (newStock !== product.stock) {
                            try {
                              await updateProductStock(product.id, newStock);
                            } catch (error) {
                              console.error('Failed to update stock:', error);
                            }
                          }
                        }}
                        className="px-3 py-1 text-xs bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded hover:bg-amber-500/40 transition-colors"
                      >
                        Update
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStockStatus(product.stock).color}`}>
                      {getStockStatus(product.stock).text}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderReviews = () => (
    <div className="space-y-8 animate-premium-in">
      <div>
        <h2 className="text-3xl font-extrabold text-gradient-gold">Client Reflections</h2>
        <p className="text-amber-200/60 mt-1">Authentic testimonies from the realm's patrons.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-card p-6 border-amber-500/10">
          <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Total Resonance</p>
          <p className="text-3xl font-black text-slate-100">{reviews.length}</p>
        </div>
        <div className="glass-card p-6 border-amber-500/10">
          <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Average Scrutiny</p>
          <div className="flex items-center gap-2">
            <p className="text-3xl font-black text-amber-400">
              {(reviews.reduce((acc, r) => acc + r.rating, 0) / (reviews.length || 1)).toFixed(1)}
            </p>
            <StarIcon className="h-6 w-6 text-amber-500 fill-amber-500" />
          </div>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/5">
            <thead>
              <tr className="bg-slate-900/60">
                <th className="px-6 py-5 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Patron Identity</th>
                <th className="px-6 py-5 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Resonance</th>
                <th className="px-6 py-5 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Testimony</th>
                <th className="px-6 py-5 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Date Collected</th>
                <th className="px-6 py-5 text-right text-xs font-black text-slate-400 uppercase tracking-widest">Intervention</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {reviews.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500 italic font-medium">
                    The chronicle of reflections is currently void of new data.
                  </td>
                </tr>
              ) : (
                reviews.map((review) => (
                  <tr key={review.id} className="hover:bg-amber-500/[0.01] transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-[10px] font-black text-slate-400 uppercase">
                          {review.user?.first_name?.charAt(0) || review.name?.charAt(0) || '?'}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-100">{review.name || (review.user?.first_name + ' ' + (review.user?.last_name || ''))}</p>
                          <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{review.user?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-0.5 text-amber-500">
                        {[...Array(5)].map((_, i) => (
                          <StarIcon key={i} className={`h-3 w-3 ${i < review.rating ? 'fill-amber-500' : 'text-slate-800'}`} />
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs text-slate-400 italic line-clamp-2 max-w-sm">"{review.comment}"</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500">
                      {new Date(review.createdAt || review.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderMessages = () => (
    <div className="space-y-8 animate-premium-in">
      <div>
        <h2 className="text-3xl font-extrabold text-gradient-silver">Client Inquiries</h2>
        <p className="text-slate-400 mt-1">Direct communications from patrons across the digital estate.</p>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/5">
            <thead>
              <tr className="bg-slate-900/60">
                <th className="px-6 py-5 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Patron Details</th>
                <th className="px-6 py-5 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Inquiry Topic</th>
                <th className="px-6 py-5 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Message Digest</th>
                <th className="px-6 py-5 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Curation Date</th>
                <th className="px-6 py-5 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-5 text-right text-xs font-black text-slate-400 uppercase tracking-widest">Intervention</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {inquiries.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500 italic">
                    No chronicles of inquiry found in the digital vault.
                  </td>
                </tr>
              ) : (
                inquiries.map((inquiry) => (
                  <tr key={inquiry.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-slate-100">{inquiry.name}</div>
                      <div className="text-xs text-slate-500">{inquiry.email}</div>
                      {inquiry.phone && <div className="text-[10px] text-slate-600 font-mono mt-1">{inquiry.phone}</div>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 bg-slate-900 border border-white/5 rounded-md text-[10px] font-black uppercase text-slate-400">
                        {inquiry.subject}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-slate-400 line-clamp-2 max-w-xs">{inquiry.message}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500">
                      {new Date(inquiry.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${inquiry.status === 'unread' ? 'text-amber-400 bg-amber-500/10 border border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]' :
                        inquiry.status === 'replied' ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' :
                          'text-slate-500 bg-slate-800/10 grayscale'
                        }`}>
                        {inquiry.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => updateInquiryStatus(inquiry.id, inquiry.status === 'replied' ? 'unread' : 'replied')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${inquiry.status === 'replied' ? 'border-amber-500/20 text-amber-400 hover:bg-amber-500/10' : 'border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10'
                            }`}
                        >
                          {inquiry.status === 'replied' ? 'Mark Unread' : 'Mark Replied'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-8 animate-premium-in">
      <div>
        <h2 className="text-3xl font-extrabold text-gradient-gold">Global Configurations</h2>
        <p className="text-amber-200/60 mt-1">Define the operational parameters of your luxury store.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card p-8">
          <h3 className="text-lg font-black text-amber-50 uppercase tracking-widest mb-6 border-b border-amber-500/10 pb-4">General Parameters</h3>
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            updateSiteSettings({
              siteName: formData.get('siteName'),
              siteDescription: formData.get('siteDescription'),
              currency: formData.get('currency'),
              taxRate: parseFloat(formData.get('taxRate')),
              shippingCost: parseFloat(formData.get('shippingCost')),
              freeShippingThreshold: parseFloat(formData.get('freeShippingThreshold'))
            });
            alert('Curated settings saved successfully!');
          }}>
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-black text-amber-400 uppercase tracking-widest mb-2">Establishment Name</label>
                <input
                  name="siteName"
                  type="text"
                  defaultValue={siteSettings.siteName}
                  className="glass-input w-full px-4 py-3"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-amber-400 uppercase tracking-widest mb-2">Heritage Description</label>
                <input
                  name="siteDescription"
                  type="text"
                  defaultValue={siteSettings.siteDescription}
                  className="glass-input w-full px-4 py-3"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-amber-400 uppercase tracking-widest mb-2">Valuation Currency</label>
                  <select
                    name="currency"
                    defaultValue={siteSettings.currency}
                    className="glass-input w-full px-4 py-3 appearance-none"
                  >
                    <option value="INR" className="bg-green-950">INR (₹)</option>
                    <option value="USD" className="bg-green-950">USD ($)</option>
                    <option value="EUR" className="bg-green-950">EUR (€)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-amber-400 uppercase tracking-widest mb-2">Fiscal Duty (%)</label>
                  <input
                    name="taxRate"
                    type="number"
                    step="0.1"
                    defaultValue={siteSettings.taxRate}
                    className="glass-input w-full px-4 py-3"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-amber-400 uppercase tracking-widest mb-2">Shipping Cost (₹)</label>
                  <input
                    name="shippingCost"
                    type="number"
                    step="0.01"
                    defaultValue={siteSettings.shippingCost}
                    className="glass-input w-full px-4 py-3"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-amber-400 uppercase tracking-widest mb-2">Free Delivery At (₹)</label>
                  <input
                    name="freeShippingThreshold"
                    type="number"
                    step="0.01"
                    defaultValue={siteSettings.freeShippingThreshold}
                    className="glass-input w-full px-4 py-3"
                  />
                </div>
              </div>
              <button type="submit" className="btn-primary w-full mt-4">
                Propagate Changes
              </button>
            </div>
          </form>
        </div>

        <div className="space-y-8">
          <div className="glass-card p-8">
            <h3 className="text-lg font-black text-amber-50 uppercase tracking-widest mb-6 border-b border-amber-500/10 pb-4">Communication</h3>
            <div className="space-y-6">
              {[
                { id: 'email', label: 'Email Dispatch', desc: 'Receive automated reports via secure mail.' },
                { id: 'push', label: 'Vanguard Alerts', desc: 'Real-time browser notifications for priority events.' }
              ].map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-green-950/40 border border-amber-500/10 rounded-2xl">
                  <div>
                    <div className="text-sm font-bold text-amber-50">{item.label}</div>
                    <div className="text-[10px] text-amber-200/40 uppercase font-black tracking-widest mt-1">{item.desc}</div>
                  </div>
                  <button
                    onClick={() => toggleNotification(item.id)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 ${notifications[item.id] ? 'bg-amber-400 shadow-lg shadow-amber-500/40' : 'bg-green-800'
                      }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-green-950 transition-transform duration-300 ${notifications[item.id] ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-8 bg-gradient-to-br from-amber-500/10 to-transparent">
            <h3 className="text-lg font-black text-amber-50 uppercase tracking-widest mb-2 italic">System Integrity</h3>
            <p className="text-sm text-amber-200/60 mb-6">Current backend: <span className="font-mono text-amber-400">v2.4.0-Imperial</span></p>
            <button className="text-xs font-black text-red-400 uppercase tracking-widest hover:text-red-300 transition-colors">
              Danger Zone: Purge Cache & Re-index
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white/30 border-t-white"></div>
      </div>
    );
  }

  // End of helper functions

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 selection:bg-white/10">
      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Sidebar */}
        <aside className="w-full lg:w-72 glass-card border-l-0 border-y-0 border-r border-white/5 lg:sticky lg:top-0 lg:h-screen flex flex-col z-50 overflow-y-auto">
          <div className="p-8 border-b border-white/5">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-tr from-slate-200 to-slate-400 rounded-xl flex items-center justify-center font-black text-slate-950 shadow-lg shadow-white/5">
                S
              </div>
              <h1 className="text-2xl font-black text-gradient-silver tracking-tighter">Saram Admin</h1>
            </div>

            <div className="p-4 bg-slate-900/40 border border-white/5 rounded-2xl">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Authenticated As</p>
              <p className="text-sm font-bold text-slate-100 truncate">{user?.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(56,189,248,0.4)]" />
                <span className="text-[10px] font-bold text-slate-500 uppercase">Secure Link Active</span>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-6 space-y-1.5">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`sidebar-link w-full group ${isActive ? 'sidebar-link-active' : 'sidebar-link-inactive'}`}
                >
                  <Icon className={`h-5 w-5 mr-3 transition-transform group-hover:scale-110 ${isActive ? 'text-slate-900' : 'text-slate-400/60 group-hover:text-white'}`} />
                  <span className="tracking-tight">{tab.name}</span>
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 bg-slate-900 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          <div className="p-6 border-t border-amber-500/5">
            <button className="flex items-center w-full px-4 py-3 text-red-400/60 hover:text-red-400 hover:bg-red-500/5 rounded-xl transition-all font-bold text-sm">
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 p-4 md:p-8">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'products' && renderProducts()}
          {activeTab === 'categories' && renderCategories()}
          {activeTab === 'orders' && renderOrders()}
          {activeTab === 'customers' && renderCustomers()}
          {activeTab === 'inventory' && renderInventory()}
          {activeTab === 'reviews' && renderReviews()}
          {activeTab === 'messages' && renderMessages()}
          {activeTab === 'settings' && renderSettings()}
        </div>
      </div>

      {/* Standalone Modals */}
      <AddEditProductModal
        isOpen={showAddProduct || !!editingProduct}
        editingProduct={editingProduct}
        showAddProduct={showAddProduct}
        onClose={() => { setShowAddProduct(false); setEditingProduct(null); }}
        categories={categories}
        apiService={apiService}
        setProducts={setProducts}
        products={products}
      />

      <AddEditCategoryModal
        isOpen={showAddCategory || !!editingCategory}
        editingCategory={editingCategory}
        onClose={() => { setShowAddCategory(false); setEditingCategory(null); }}
        apiService={apiService}
        setCategories={setCategories}
      />

      <OrderDetailsModal
        order={showOrderDetails}
        isOpen={!!showOrderDetails}
        onClose={() => setShowOrderDetails(null)}
        apiService={apiService}
        onUpdateOrderStatus={updateOrderStatus}
      />

      <CustomerProfileModal
        customer={showCustomerProfile}
        isOpen={!!showCustomerProfile}
        onClose={() => setShowCustomerProfile(null)}
        apiService={apiService}
      />
      <BulkStockUpdateModal
        isOpen={showBulkStockUpdate}
        onClose={() => setShowBulkStockUpdate(false)}
        products={products}
        updateBulkStock={updateProductStock}
        getStockStatus={getStockStatus}
        setZoomedImage={setZoomedImage}
      />
      <ImageZoomModal
        zoomedImage={zoomedImage}
        setZoomedImage={setZoomedImage}
      />
    </div>
  );
};

export default Admin;

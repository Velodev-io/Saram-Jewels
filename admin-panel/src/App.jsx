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
  ArchiveBoxIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { SignIn } from '@clerk/clerk-react';
import { useAuth } from './context/AuthContext';
import { useSiteSettings } from './context/SiteSettingsContext';
import apiService from './services/api';

const Admin = () => {
  const { user, isSignedIn } = useAuth();
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
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    lowStock: true,
    newOrders: true
  });


  useEffect(() => {
    const loadData = async () => {
      try {
        const [productsData, ordersData, customersData, categoriesData] = await Promise.all([
          apiService.getProducts(),
          apiService.getOrders(),
          apiService.getCustomers(),
          apiService.getCategories()
        ]);
        
        // Map products
        if (productsData && productsData.products) {
          setProducts(productsData.products.map(p => ({
            ...p,
            category: p.category?.name || 'Uncategorized',
            status: p.stock > 0 ? 'active' : 'inactive',
            image: p.images?.[0] || 'https://via.placeholder.com/300'
          })));
        }
        
        // Map orders
        if (ordersData) {
          setOrders(ordersData.map(o => ({
            id: o.order_number || o.id,
            customer: o.user ? (o.user.first_name + ' ' + o.user.last_name).trim() || o.user.email : 'Guest',
            total: parseFloat(o.total_amount) || 0,
            status: o.status === 'processing' ? 'Processing' : o.status === 'pending' ? 'Pending' : o.status === 'completed' ? 'Delivered' : 'Cancelled',
            date: new Date(o.createdAt).toLocaleDateString()
          })));
        }
        
        // Map customers
        if (customersData) {
           setCustomers(customersData.map(c => ({
             id: c.id,
             name: (c.first_name + ' ' + c.last_name).trim() || 'Unknown',
             email: c.email,
             orders: c.orders?.length || 0,
             totalSpent: c.orders?.reduce((sum, o) => sum + parseFloat(o.total_amount), 0) || 0
           })));
        }

        // Set Categories
        if (categoriesData) {
          setCategories(categoriesData);
        }
      } catch (e) {
        console.error('Failed to load admin data:', e);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Check if user is admin - for now, allow any signed-in user
  // TODO: Add proper admin role checking later
  const isAdmin = isSignedIn;
  
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#052e16] flex flex-col items-center justify-center relative overflow-hidden px-4">
        {/* Background Decorative Elements */}
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/5 rounded-full blur-[120px]" />
        
        <div className="text-center mb-12 animate-premium-in relative z-10">
          <div className="w-20 h-20 bg-gradient-to-tr from-amber-200 to-amber-500 rounded-3xl flex items-center justify-center font-black text-green-950 shadow-2xl shadow-amber-500/20 mx-auto mb-6 rotate-3">
            S
          </div>
          <h1 className="text-5xl font-black text-gradient-gold tracking-tighter mb-3">Saram Jewels</h1>
          <div className="flex items-center justify-center gap-3">
            <div className="h-[1px] w-8 bg-amber-500/20" />
            <p className="text-xs font-black text-amber-400 uppercase tracking-[0.3em]">Imperial Admin Registry</p>
            <div className="h-[1px] w-8 bg-amber-500/20" />
          </div>
        </div>
        
        <div className="glass-card p-2 rounded-[2rem] animate-premium-in shadow-amber-500/5 relative z-10">
          <SignIn />
        </div>

        <p className="mt-12 text-[10px] font-bold text-amber-200/20 uppercase tracking-widest animate-premium-in delay-300">
          Protected by Saram Security Infrastructure
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
    { id: 'settings', name: 'Settings', icon: CogIcon }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-emerald-400 bg-emerald-500/20';
      case 'Delivered': return 'text-emerald-400 bg-emerald-500/20';
      case 'In Transit': return 'text-amber-300 bg-amber-500/20';
      default: return 'text-amber-200/70 bg-green-800/50';
    }
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return { color: 'text-red-400 bg-red-500/20', text: 'Out of Stock' };
    if (stock <= 5) return { color: 'text-amber-300 bg-amber-400/20', text: 'Low Stock' };
    return { color: 'text-emerald-400 bg-emerald-500/20', text: 'In Stock' };
  };

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchQuery.toLowerCase())
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
    } catch(e) {
       console.error(e);
       const errorMsg = e.response?.data?.message || 'Failed to catalogue piece. Check manifest details.';
       alert(errorMsg);
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
    } catch(e) {
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
      } catch(e) {
        console.error(e);
      }
    }
  };

  const toggleProductStatus = (productId) => {
    setProducts(products.map(product => 
      product.id === productId 
        ? { ...product, status: product.status === 'active' ? 'inactive' : 'active' }
        : product
    ));
  };

  // Order Management Functions
  const updateOrderStatus = async (orderId, status) => {
    try {
      await apiService.updateOrderStatus(orderId, status);
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: status === 'processing' ? 'Processing' : status === 'pending' ? 'Pending' : status === 'completed' ? 'Delivered' : 'Cancelled' } : order
      ));
      if (showOrderDetails && showOrderDetails.id === orderId) {
        setShowOrderDetails({ ...showOrderDetails, status: status === 'processing' ? 'Processing' : status === 'pending' ? 'Pending' : status === 'completed' ? 'Delivered' : 'Cancelled' });
      }
    } catch (e) {
      console.error(e);
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

  // Bulk Stock Update Functions
  const updateBulkStock = async (productId, newStock) => {
    try {
      await apiService.updateProduct(productId, { stock: newStock });
      setProducts(products.map(product => 
        product.id === productId ? { ...product, stock: newStock, status: newStock > 0 ? 'active' : 'inactive' } : product
      ));
    } catch(e) {
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

  const reorderImages = (fromIndex, toIndex) => {
    setProductImages(prev => {
      const newImages = [...prev];
      const [movedImage] = newImages.splice(fromIndex, 1);
      newImages.splice(toIndex, 0, movedImage);
      return newImages;
    });
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
          <h2 className="text-3xl font-extrabold text-gradient-gold">Dashboard Overview</h2>
          <p className="text-amber-200/60 mt-1">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-green-900/40 backdrop-blur-md border border-amber-500/20 rounded-xl text-amber-200/80 text-sm font-medium">
            Today: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-6 group hover:translate-y-[-4px] transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-amber-200/60 uppercase tracking-wider">Total Products</p>
              <h3 className="text-3xl font-bold text-amber-50 mt-1">{products.length}</h3>
            </div>
            <div className="p-3 bg-amber-500/10 rounded-2xl group-hover:bg-amber-500/20 transition-colors">
              <CubeIcon className="h-8 w-8 text-amber-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-emerald-400">
            <span className="font-bold">+{Math.floor(products.length * 0.1)}%</span>
            <span className="ml-1 text-amber-200/40">from last month</span>
          </div>
        </div>

        <div className="glass-card p-6 group hover:translate-y-[-4px] transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-amber-200/60 uppercase tracking-wider">Total Orders</p>
              <h3 className="text-3xl font-bold text-amber-50 mt-1">{orders.length}</h3>
            </div>
            <div className="p-3 bg-emerald-500/10 rounded-2xl group-hover:bg-emerald-500/20 transition-colors">
              <ShoppingBagIcon className="h-8 w-8 text-emerald-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-emerald-400">
            <span className="font-bold">+{Math.floor(orders.length * 0.05)}%</span>
            <span className="ml-1 text-amber-200/40">from last month</span>
          </div>
        </div>

        <div className="glass-card p-6 group hover:translate-y-[-4px] transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-amber-200/60 uppercase tracking-wider">Total Customers</p>
              <h3 className="text-3xl font-bold text-amber-50 mt-1">{customers.length}</h3>
            </div>
            <div className="p-3 bg-amber-400/10 rounded-2xl group-hover:bg-amber-400/20 transition-colors">
              <UsersIcon className="h-8 w-8 text-amber-300" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-emerald-400">
            <span className="font-bold">+{Math.floor(customers.length * 0.08)}%</span>
            <span className="ml-1 text-amber-200/40">from last month</span>
          </div>
        </div>

        <div className="glass-card p-6 group hover:translate-y-[-4px] transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-amber-200/60 uppercase tracking-wider">Total Revenue</p>
              <h3 className="text-3xl font-bold text-amber-50 mt-1">₹{orders.reduce((sum, order) => sum + order.total, 0).toLocaleString()}</h3>
            </div>
            <div className="p-3 bg-amber-200/10 rounded-2xl group-hover:bg-amber-200/20 transition-colors">
              <CurrencyRupeeIcon className="h-8 w-8 text-amber-200" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-emerald-400">
            <span className="font-bold">+12%</span>
            <span className="ml-1 text-amber-200/40">from last month</span>
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
          <h2 className="text-3xl font-extrabold text-gradient-gold">Product Catalog</h2>
          <p className="text-amber-200/60 mt-1">Manage, track and organize your jewelry collection.</p>
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
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-amber-500/40 group-focus-within:text-amber-400 transition-colors" />
          <input
            type="text"
            placeholder="Search by name, SKU or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="glass-input w-full pl-12 pr-4 py-3 bg-green-950/30"
          />
        </div>
      </div>

      <div className="glass-card overflow-hidden border-none shadow-2xl">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-amber-500/10">
            <thead>
              <tr className="bg-green-950/80">
                <th className="px-6 py-5 text-left text-xs font-black text-amber-400 uppercase tracking-widest">The Piece</th>
                <th className="px-6 py-5 text-left text-xs font-black text-amber-400 uppercase tracking-widest">Category</th>
                <th className="px-6 py-5 text-left text-xs font-black text-amber-400 uppercase tracking-widest">Valuation</th>
                <th className="px-6 py-5 text-left text-xs font-black text-amber-400 uppercase tracking-widest">Inventory</th>
                <th className="px-6 py-5 text-left text-xs font-black text-amber-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-5 text-right text-xs font-black text-amber-400 uppercase tracking-widest">Management</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-500/5">
              {filteredProducts.map((product) => {
                const stockStatus = getStockStatus(product.stock);
                return (
                  <tr key={product.id} className="hover:bg-amber-500/[0.02] transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="h-14 w-14 rounded-xl object-cover border border-amber-500/20 cursor-pointer group-hover:scale-105 transition-transform"
                            onClick={() => setZoomedImage(product.image)}
                          />
                          {product.stock === 0 && (
                            <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center">
                              <span className="text-[8px] font-black text-white uppercase tracking-tighter">Out</span>
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-amber-50 group-hover:text-amber-300 transition-colors">{product.name}</div>
                          <div className="text-xs text-amber-200/40 font-mono tracking-tighter mt-0.5">#{product.sku}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 bg-green-950/50 border border-amber-500/10 rounded-full text-xs font-bold text-amber-200/60 uppercase">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-black text-amber-50">₹{product.price.toLocaleString()}</div>
                      {product.originalPrice > product.price && (
                        <div className="text-[10px] text-amber-200/30 line-through">₹{product.originalPrice.toLocaleString()}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-bold ${stockStatus.color.split(' ')[0]}`}>{product.stock} units</div>
                      <div className="w-24 h-1 bg-green-950 rounded-full mt-1.5 overflow-hidden">
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
                      <div className="flex justify-end items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => setEditingProduct(product)}
                          className="p-2 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 rounded-lg transition-all"
                          title="Edit Piece"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => toggleProductStatus(product.id)}
                          className={`p-2 rounded-lg transition-all ${product.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20' : 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'}`}
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => deleteProduct(product.id)}
                          className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-all"
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
        <h2 className="text-3xl font-extrabold text-gradient-gold">Client Orders</h2>
        <p className="text-amber-200/60 mt-1">Monitor sales and manage fulfillment pipeline.</p>
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
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-amber-500/[0.02] transition-colors group text-sm">
                  <td className="px-6 py-4 whitespace-nowrap font-black text-amber-50">{order.id}</td>
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

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-amber-500/10">
            <thead>
              <tr className="bg-green-950/80">
                <th className="px-6 py-5 text-left text-xs font-black text-amber-400 uppercase tracking-widest">Client Identity</th>
                <th className="px-6 py-5 text-left text-xs font-black text-amber-400 uppercase tracking-widest">Communication</th>
                <th className="px-6 py-5 text-left text-xs font-black text-amber-400 uppercase tracking-widest">Acquisitions</th>
                <th className="px-6 py-5 text-left text-xs font-black text-amber-400 uppercase tracking-widest">Lifetime Yield</th>
                <th className="px-6 py-5 text-right text-xs font-black text-amber-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-500/5">
              {customers.map((customer) => (
                <tr key={customer.id} className="hover:bg-amber-500/[0.02] transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 bg-amber-500/10 rounded-full flex items-center justify-center font-black text-amber-500 text-xs border border-amber-500/10 uppercase">
                        {customer.name.charAt(0)}
                      </div>
                      <div className="text-sm font-bold text-amber-50">{customer.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-amber-200/60 font-mono italic">{customer.email}</td>
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
                <th className="px-6 py-5 text-left text-[10px] font-black text-amber-400/60 uppercase tracking-[0.2em]">Pieces</th>
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
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="text-sm font-black text-amber-100">{category.products?.length || 0} Pieces</div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-right">
                    <button 
                      onClick={() => {
                        if(window.confirm('Dissolve this collection and its legacy?')) {
                          // deleteCategory logic
                        }
                      }}
                      className="p-2.5 text-red-400/40 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                    >
                      <TrashIcon className="h-5 w-5" />
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

  const renderAddCategoryModal = () => {
    if (!showAddCategory) return null;

    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-4 md:p-8">
        <div className="glass-card p-0 w-full max-w-lg max-h-[90vh] overflow-y-auto animate-premium-in border-amber-500/20 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          <div className="p-8">
            <div className="flex justify-between items-center mb-10 pb-4 border-b border-amber-500/10">
              <div>
                <h3 className="text-2xl font-black text-gradient-gold uppercase tracking-tighter">Found New Collection</h3>
                <p className="text-[10px] font-bold text-amber-200/40 uppercase tracking-[0.2em] mt-1">Expansion of the Saram Legacy</p>
              </div>
              <button 
                onClick={() => { setShowAddCategory(false); setImagePreview(null); }}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-green-950/50 text-amber-200/40 hover:text-amber-100 border border-amber-500/10 transition-all"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={async (e) => {
              e.preventDefault();
              const submitButton = e.target.querySelector('button[type="submit"]');
              const originalText = submitButton.innerText;
              submitButton.innerText = 'Manifesting...';
              submitButton.disabled = true;

              const formData = new FormData(e.target);
              const success = await addCategory({
                name: formData.get('name'),
                description: formData.get('description'),
                image: imagePreview || 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&h=600&fit=crop'
              });

              if (!success) {
                submitButton.innerText = originalText;
                submitButton.disabled = false;
              }
            }}>
              <div className="space-y-8">
                <div>
                  <label className="block text-[10px] font-black text-amber-400 uppercase tracking-[0.2em] mb-3">Collection Designation</label>
                  <input 
                    name="name" 
                    required 
                    placeholder="e.g. Imperial Heritage"
                    className="glass-input w-full px-5 py-4 text-sm font-bold" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-amber-400 uppercase tracking-[0.2em] mb-3">Historical Narrative</label>
                  <textarea 
                    name="description" 
                    rows="4" 
                    placeholder="Detail the essence and craftsmanship of this curation..."
                    className="glass-input w-full px-5 py-4 text-sm font-bold resize-none" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-amber-400 uppercase tracking-[0.2em] mb-3">Visual Anchor</label>
                  <div className="flex gap-6 items-center p-4 bg-green-950/40 border border-amber-500/10 rounded-2xl">
                    <div className="relative group">
                      <img 
                        src={imagePreview || 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=200&h=200&fit=crop'} 
                        className={`w-20 h-20 rounded-xl object-cover border-2 ${imagePreview ? 'border-amber-400 shadow-lg shadow-amber-500/20' : 'border-amber-500/10 opacity-30'}`} 
                        alt="Preview" 
                      />
                      {imagePreview && (
                        <div className="absolute inset-0 bg-black/60 rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                          <PlusIcon className="h-6 w-6 text-amber-200" />
                        </div>
                      )}
                    </div>
                    <label className="flex-1 cursor-pointer">
                      <div className="glass-card p-4 text-center text-[10px] font-black uppercase text-amber-200/40 hover:text-amber-100 transition-all border-dashed border-2 border-amber-500/10 hover:border-amber-500/30">
                        {imagePreview ? 'Re-select Visual' : 'Upload Collection Visual'}
                      </div>
                      <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                    </label>
                  </div>
                </div>
                <div className="flex gap-4 pt-6 border-t border-amber-500/10">
                  <button 
                    type="button" 
                    onClick={() => { setShowAddCategory(false); setImagePreview(null); }} 
                    className="btn-secondary flex-1 py-4 uppercase tracking-widest text-[10px] font-black"
                  >
                    Rescind
                  </button>
                  <button 
                    type="submit" 
                    className="btn-primary flex-1 py-4 uppercase tracking-widest text-[10px] font-black"
                  >
                    Found Collection
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

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
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 ${
                      notifications[item.id] ? 'bg-amber-400 shadow-lg shadow-amber-500/40' : 'bg-green-800'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-green-950 transition-transform duration-300 ${
                      notifications[item.id] ? 'translate-x-6' : 'translate-x-1'
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
      <div className="min-h-screen bg-green-950 text-amber-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  // Add/Edit Product Modal
  const renderAddEditProductModal = () => {
    if (!showAddProduct && !editingProduct) return null;
    
    const product = editingProduct || {};
    
    return (
      <div className="fixed inset-0 bg-[#020617]/95 backdrop-blur-xl flex items-start justify-center z-[100] p-4 overflow-y-auto pt-10 pb-20">
        <div className="glass-card p-10 w-full max-w-3xl animate-premium-in border-amber-500/20 shadow-[0_0_100px_rgba(0,0,0,0.9)] relative mb-10">
          <div className="flex justify-between items-center mb-8 pb-4 border-b border-amber-500/10">
            <div>
              <h2 className="text-2xl font-black text-gradient-gold uppercase tracking-tight">
                {editingProduct ? 'Curate Piece' : 'Catalogue New Piece'}
              </h2>
              <p className="text-xs text-amber-200/40 font-bold uppercase tracking-widest mt-1">Product Manifest</p>
            </div>
            <button
              onClick={() => {
                setShowAddProduct(false);
                setEditingProduct(null);
                setSelectedImage(null);
                setImagePreview(null);
              }}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-green-950/50 text-amber-200/40 hover:text-amber-100 border border-amber-500/10 transition-all"
            >
              ✕
            </button>
          </div>
          
          <form 
            onSubmit={async (e) => {
              e.preventDefault();
              const submitButton = e.target.querySelector('button[type="submit"]');
              const originalText = submitButton.innerText;
              submitButton.innerText = 'Processing...';
              submitButton.disabled = true;

              try {
                const formData = new FormData(e.target);
                
                // Combine all images (main image + additional images)
                const allImages = [
                  imagePreview || formData.get('image') || 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&h=600&fit=crop',
                  ...selectedImages.map(img => img.url),
                  ...productImages.map(img => img.url)
                ].filter(Boolean);
                
                const productData = {
                  name: formData.get('name'),
                  category_id: formData.get('category_id'),
                  price: parseFloat(formData.get('price')),
                  originalPrice: parseFloat(formData.get('originalPrice')),
                  stock: parseInt(formData.get('stock')),
                  sku: formData.get('sku'),
                  is_featured: formData.get('is_featured') === 'on',
                  image: allImages[0] || 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&h=600&fit=crop',
                  images: allImages // Store all images for the product
                };
                
                let success = false;
                if (editingProduct) {
                  success = await updateProduct(editingProduct.id, productData);
                } else {
                  success = await addProduct(productData);
                }
                
                if (!success) {
                  throw new Error('Operation failed');
                }
              } catch (error) {
                console.error('Form submission failed:', error);
              } finally {
                if (submitButton) {
                  submitButton.innerText = originalText;
                  submitButton.disabled = false;
                }
              }
            }}
          >
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-black text-amber-400 uppercase tracking-widest mb-2">Item Designation</label>
                <input
                  name="name"
                  type="text"
                  defaultValue={product.name}
                  required
                  placeholder="e.g. Royal Heritage Ring"
                  className="glass-input w-full px-4 py-3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-amber-200/80 mb-1">Category</label>
                <select
                  name="category_id"
                  defaultValue={product.category_id}
                  required
                  className="glass-input w-full px-4 py-3 appearance-none"
                >
                  <option value="" className="bg-green-950">Select Realm</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id} className="bg-green-950">{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-amber-200/80 mb-1">Price (₹)</label>
                <input
                  name="price"
                  type="number"
                  step="0.01"
                  defaultValue={product.price}
                  required
                  className="w-full bg-green-950/50 text-amber-100 placeholder-amber-200/50 px-3 py-2 border border-amber-500/40 rounded-lg focus:ring-2 focus:ring-amber-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-amber-200/80 mb-1">Original Price (₹)</label>
                <input
                  name="originalPrice"
                  type="number"
                  step="0.01"
                  defaultValue={product.originalPrice}
                  required
                  className="w-full bg-green-950/50 text-amber-100 placeholder-amber-200/50 px-3 py-2 border border-amber-500/40 rounded-lg focus:ring-2 focus:ring-amber-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-amber-200/80 mb-1">Stock</label>
                <input
                  name="stock"
                  type="number"
                  defaultValue={product.stock}
                  required
                  className="w-full bg-green-950/50 text-amber-100 placeholder-amber-200/50 px-3 py-2 border border-amber-500/40 rounded-lg focus:ring-2 focus:ring-amber-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-amber-200/80 mb-1">SKU</label>
                <input
                  name="sku"
                  type="text"
                  defaultValue={product.sku}
                  required
                  className="w-full bg-green-950/50 text-amber-100 placeholder-amber-200/50 px-3 py-2 border border-amber-500/40 rounded-lg focus:ring-2 focus:ring-amber-300"
                />
              </div>
              <div className="col-span-2 flex items-center gap-3 p-4 bg-amber-500/5 rounded-xl border border-amber-500/10">
                <input
                  id="is_featured"
                  name="is_featured"
                  type="checkbox"
                  defaultChecked={product.is_featured}
                  className="w-5 h-5 rounded border-amber-500/40 text-amber-500 focus:ring-amber-500 bg-green-950/50"
                />
                <label htmlFor="is_featured" className="text-sm font-black text-amber-50 uppercase tracking-widest cursor-pointer">
                  Featured Piece (Vanguard Collection)
                </label>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-amber-200/80 mb-1">Product Image</label>
                
                {/* Image Preview */}
                {(imagePreview || product.image) && (
                  <div className="mb-4">
                    <img
                      src={imagePreview || product.image}
                      alt="Product preview"
                      className="w-32 h-32 object-cover rounded-lg border border-amber-500/40 cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => setZoomedImage(imagePreview || product.image)}
                      title="Click to zoom"
                    />
                  </div>
                )}
                
                {/* Image Upload Options */}
                <div className="space-y-3">
                  {/* URL Input */}
                  <div>
                    <label className="block text-sm font-medium text-amber-200/70 mb-1">Image URL</label>
                    <input
                      name="image"
                      type="url"
                      defaultValue={product.image}
                      onChange={(e) => handleImageUrlInput(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="w-full bg-green-950/50 text-amber-100 placeholder-amber-200/50 px-3 py-2 border border-amber-500/40 rounded-lg focus:ring-2 focus:ring-amber-300"
                    />
                  </div>
                  
                  {/* Upload Buttons */}
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={handleGallerySelect}
                      className="flex-1 px-4 py-2 border border-amber-500/40 rounded-lg text-amber-200/80 hover:bg-green-950 flex items-center justify-center"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Gallery
                    </button>
                    
                    <button
                      type="button"
                      onClick={handleCameraCapture}
                      className="flex-1 px-4 py-2 border border-amber-500/40 rounded-lg text-amber-200/80 hover:bg-green-950 flex items-center justify-center"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Camera
                    </button>
                    
                    <label className="flex-1 px-4 py-2 border border-amber-500/40 rounded-lg text-amber-200/80 hover:bg-green-950 flex items-center justify-center cursor-pointer">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      Upload
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  
                  {/* Selected File Info */}
                  {selectedImage && (
                    <div className="text-sm text-amber-200/70">
                      Selected: {selectedImage.name} ({(selectedImage.size / 1024).toFixed(1)} KB)
                    </div>
                  )}
                </div>
              </div>

              {/* Multiple Product Images Section */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-amber-200/80 mb-1">Additional Product Images</label>
                <p className="text-sm text-amber-200/50 mb-4">Add multiple images to showcase your product from different angles</p>
                
                {/* Multiple Image Upload Options */}
                <div className="space-y-4">
                  {/* Multiple URL Input */}
                  <div>
                    <label className="block text-sm font-medium text-amber-200/70 mb-1">Image URLs (one per line)</label>
                    <textarea
                      name="additionalImages"
                      placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg&#10;https://example.com/image3.jpg"
                      rows="3"
                      onChange={(e) => handleMultipleImageUrlInput(e.target.value)}
                      className="w-full bg-green-950/50 text-amber-100 placeholder-amber-200/50 px-3 py-2 border border-amber-500/40 rounded-lg focus:ring-2 focus:ring-amber-300 resize-none"
                    />
                  </div>
                  
                  {/* Multiple File Upload */}
                  <div>
                    <label className="block text-sm font-medium text-amber-200/70 mb-2">Upload Multiple Images</label>
                    <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-amber-500/40 rounded-lg cursor-pointer hover:border-pink-500 transition-colors">
                      <div className="text-center">
                        <svg className="w-8 h-8 mx-auto text-amber-200/30 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="text-sm text-amber-200/70">Click to upload multiple images</p>
                        <p className="text-xs text-amber-200/50">PNG, JPG, JPEG up to 10MB each</p>
                      </div>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleMultipleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Selected Images Preview */}
                  {(selectedImages.length > 0 || productImages.length > 0) && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-amber-200/80">Selected Images ({selectedImages.length + productImages.length})</h4>
                      
                      {/* Selected Images Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {selectedImages.map((image, index) => (
                          <div key={image.id} className="relative group">
                            <img
                              src={image.url}
                              alt={image.name}
                              className="w-full bg-green-950/50 text-amber-100 placeholder-amber-200/50 h-24 object-cover rounded-lg border border-amber-500/40"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(image.id, true)}
                              className="absolute top-1 right-1 bg-red-500 text-green-950 font-semibold rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              ×
                            </button>
                            <div className="text-xs text-amber-200/50 mt-1 truncate">{image.name}</div>
                          </div>
                        ))}
                        
                        {productImages.map((image, index) => (
                          <div key={image.id} className="relative group">
                            <img
                              src={image.url}
                              alt={image.name}
                              className="w-full bg-green-950/50 text-amber-100 placeholder-amber-200/50 h-24 object-cover rounded-lg border border-amber-500/40"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(image.id, false)}
                              className="absolute top-1 right-1 bg-red-500 text-green-950 font-semibold rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              ×
                            </button>
                            <div className="text-xs text-amber-200/50 mt-1 truncate">{image.name}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowAddProduct(false);
                  setEditingProduct(null);
                  setSelectedImage(null);
                  setImagePreview(null);
                  setSelectedImages([]);
                  setProductImages([]);
                }}
                className="px-4 py-2 border border-amber-500/40 rounded-lg text-amber-200/80 hover:bg-green-950"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-gradient-to-r from-amber-200 to-amber-400 text-green-950 font-semibold rounded-lg hover:from-amber-300 hover:to-amber-500 shadow-lg shadow-amber-500/20 transition-all duration-300 transform hover:-translate-y-0.5"
              >
                {editingProduct ? 'Update Product' : 'Add Product'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Order Details Modal
  const renderOrderDetailsModal = () => {
    if (!showOrderDetails) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-green-900/40 backdrop-blur-md border border-amber-500/20 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Order Details - {showOrderDetails.id}</h2>
            <button
              onClick={() => setShowOrderDetails(null)}
              className="text-amber-200/50 hover:text-amber-200/80"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-amber-200/80">Customer</label>
                <p className="text-sm text-amber-100">{showOrderDetails.customer}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-amber-200/80">Total</label>
                <p className="text-sm text-amber-100">₹{showOrderDetails.total.toLocaleString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-amber-200/80">Date</label>
                <p className="text-sm text-amber-100">{showOrderDetails.date}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-amber-200/80">Status</label>
                <select
                  value={showOrderDetails.status}
                  onChange={(e) => updateOrderStatus(showOrderDetails.id, e.target.value)}
                  className="w-full bg-green-950/50 text-amber-100 placeholder-amber-200/50 px-3 py-2 border border-amber-500/40 rounded-lg focus:ring-2 focus:ring-amber-300"
                >
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="In Transit">In Transit</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <h3 className="font-medium text-amber-100 mb-2">Order Items</h3>
              <div className="bg-green-950 p-4 rounded-lg">
                <p className="text-sm text-amber-200/70">Order items would be displayed here</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Customer Profile Modal
  const renderCustomerProfileModal = () => {
    if (!showCustomerProfile) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-green-900/40 backdrop-blur-md border border-amber-500/20 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Customer Profile - {showCustomerProfile.name}</h2>
            <button
              onClick={() => setShowCustomerProfile(null)}
              className="text-amber-200/50 hover:text-amber-200/80"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-amber-200/80">Name</label>
                <p className="text-sm text-amber-100">{showCustomerProfile.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-amber-200/80">Email</label>
                <p className="text-sm text-amber-100">{showCustomerProfile.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-amber-200/80">Total Orders</label>
                <p className="text-sm text-amber-100">{showCustomerProfile.orders}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-amber-200/80">Total Spent</label>
                <p className="text-sm text-amber-100">₹{showCustomerProfile.totalSpent.toLocaleString()}</p>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <h3 className="font-medium text-amber-100 mb-2">Order History</h3>
              <div className="bg-green-950 p-4 rounded-lg">
                <p className="text-sm text-amber-200/70">Order history would be displayed here</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Bulk Stock Update Modal
  const renderBulkStockUpdateModal = () => {
    if (!showBulkStockUpdate) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-green-900/40 backdrop-blur-md border border-amber-500/20 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Bulk Stock Update</h2>
            <button
              onClick={() => setShowBulkStockUpdate(false)}
              className="text-amber-200/50 hover:text-amber-200/80"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="bg-green-950 p-4 rounded-lg">
              <p className="text-sm text-amber-200/70 mb-4">
                Update stock levels for multiple products at once. Changes will be applied immediately.
              </p>
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
                <tbody className="bg-green-900/40 backdrop-blur-md border border-amber-500/20 divide-y divide-amber-500/20">
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
                            <div className="text-sm text-amber-200/50">{product.sku}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-amber-100">{product.stock}</td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min="0"
                          defaultValue={product.stock}
                          onChange={(e) => {
                            const newStock = parseInt(e.target.value) || 0;
                            updateBulkStock(product.id, newStock);
                          }}
                          className="w-20 px-2 py-1 border border-amber-500/40 rounded focus:ring-2 focus:ring-amber-300"
                        />
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
            
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                onClick={() => setShowBulkStockUpdate(false)}
                className="px-4 py-2 border border-amber-500/40 rounded-lg text-amber-200/80 hover:bg-green-950"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowBulkStockUpdate(false);
                  alert('Stock levels updated successfully!');
                }}
                className="px-4 py-2 bg-gradient-to-r from-amber-200 to-amber-400 text-green-950 font-semibold rounded-lg hover:from-amber-300 hover:to-amber-500 shadow-lg shadow-amber-500/20 transition-all duration-300 transform hover:-translate-y-0.5"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Image Zoom Modal
  const renderImageZoomModal = () => {
    if (!zoomedImage) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
        <div className="relative max-w-4xl max-h-[90vh] p-4">
          {/* Close Button */}
          <button
            onClick={() => setZoomedImage(null)}
            className="absolute top-2 right-2 z-10 text-green-950 font-semibold hover:text-gray-300 text-2xl font-bold bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center"
          >
            ×
          </button>
          
          {/* Image Container with Zoom */}
          <div className="relative overflow-hidden rounded-lg">
            <img
              src={zoomedImage}
              alt="Zoomed product"
              className="w-full bg-green-950/50 text-amber-100 placeholder-amber-200/50 h-auto max-h-[80vh] object-contain cursor-zoom-in"
              style={{
                transform: 'scale(1)',
                transition: 'transform 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.5)';
                e.target.style.cursor = 'zoom-out';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.cursor = 'zoom-in';
              }}
              onWheel={(e) => {
                e.preventDefault();
                const scale = parseFloat(e.target.style.transform.replace('scale(', '').replace(')', '')) || 1;
                const newScale = e.deltaY > 0 ? Math.max(0.5, scale - 0.1) : Math.min(3, scale + 0.1);
                e.target.style.transform = `scale(${newScale})`;
              }}
            />
          </div>
          
          {/* Zoom Controls */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            <button
              onClick={(e) => {
                const img = e.target.parentElement.previousElementSibling.querySelector('img');
                const scale = parseFloat(img.style.transform.replace('scale(', '').replace(')', '')) || 1;
                const newScale = Math.max(0.5, scale - 0.2);
                img.style.transform = `scale(${newScale})`;
              }}
              className="bg-green-900/40 backdrop-blur-md border border-amber-500/20 bg-opacity-80 hover:bg-opacity-100 text-amber-200/90 px-3 py-1 rounded-lg text-sm font-medium"
            >
              Zoom Out
            </button>
            <button
              onClick={(e) => {
                const img = e.target.parentElement.previousElementSibling.querySelector('img');
                const scale = parseFloat(img.style.transform.replace('scale(', '').replace(')', '')) || 1;
                const newScale = Math.min(3, scale + 0.2);
                img.style.transform = `scale(${newScale})`;
              }}
              className="bg-green-900/40 backdrop-blur-md border border-amber-500/20 bg-opacity-80 hover:bg-opacity-100 text-amber-200/90 px-3 py-1 rounded-lg text-sm font-medium"
            >
              Zoom In
            </button>
            <button
              onClick={(e) => {
                const img = e.target.parentElement.previousElementSibling.querySelector('img');
                img.style.transform = 'scale(1)';
              }}
              className="bg-green-900/40 backdrop-blur-md border border-amber-500/20 bg-opacity-80 hover:bg-opacity-100 text-amber-200/90 px-3 py-1 rounded-lg text-sm font-medium"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-green-950 text-amber-100 selection:bg-amber-500/30">
      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Sidebar */}
        <aside className="w-full lg:w-72 glass-card border-l-0 border-y-0 border-r border-amber-500/10 lg:sticky lg:top-0 lg:h-screen flex flex-col z-50 overflow-y-auto">
          <div className="p-8 border-b border-amber-500/5">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-tr from-amber-200 to-amber-500 rounded-xl flex items-center justify-center font-black text-green-950 shadow-lg shadow-amber-500/20">
                S
              </div>
              <h1 className="text-2xl font-black text-gradient-gold tracking-tighter">Saram Admin</h1>
            </div>
            
            <div className="p-4 bg-green-950/40 border border-amber-500/10 rounded-2xl">
              <p className="text-[10px] font-black text-amber-400 uppercase tracking-[0.2em] mb-1">Authenticated As</p>
              <p className="text-sm font-bold text-amber-50 truncate">{user?.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-[10px] font-bold text-amber-200/40 uppercase">Active Session</span>
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
                  <Icon className={`h-5 w-5 mr-3 transition-transform group-hover:scale-110 ${isActive ? 'text-green-950' : 'text-amber-400/60 group-hover:text-amber-400'}`} />
                  <span className="tracking-tight">{tab.name}</span>
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 bg-green-950 rounded-full" />
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
          {activeTab === 'settings' && renderSettings()}
        </div>
      </div>

      {/* Modals */}
      {renderAddEditProductModal()}
      {renderAddCategoryModal()}
      {renderOrderDetailsModal()}
      {renderCustomerProfileModal()}
      {renderBulkStockUpdateModal()}
      {renderImageZoomModal()}
    </div>
  );
};

export default Admin;

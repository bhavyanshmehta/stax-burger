"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Flame, 
  ShoppingBag, 
  DollarSign, 
  ClipboardList, 
  RefreshCw, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink,
  CheckCircle,
  Truck,
  ChefHat,
  BellRing,
  Plus,
  Trash2,
  Edit2,
  Eye,
  ToggleLeft,
  ToggleRight,
  User,
  ShieldCheck,
  Lock,
  Upload,
  AlertCircle
} from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import AuthModal from "@/components/AuthModal";

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Dashboard tabs: "orders" or "menu"
  const [activeTab, setActiveTab] = useState("orders");

  // Orders states
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState(null);

  // Menu/Products states
  const [products, setProducts] = useState([]);
  const [menuLoading, setMenuLoading] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Product Form states
  const [prodName, setProdName] = useState("");
  const [prodDesc, setProdDesc] = useState("");
  const [prodPrice, setProdPrice] = useState("");
  const [prodImage, setProdImage] = useState("");
  const [prodCategory, setProdCategory] = useState("signature");
  const [prodVegType, setProdVegType] = useState("veg");
  const [prodAvailability, setProdAvailability] = useState(true);
  const [prodTag, setProdTag] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  // Auth/Protection states
  const [authError, setAuthError] = useState("");
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  useEffect(() => {
    // Check session
    const hasKeys = isSupabaseConfigured();
    if (hasKeys) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        handleUserSession(session?.user || null);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        handleUserSession(session?.user || null);
      });

      return () => subscription.unsubscribe();
    } else {
      // Mock session loading
      const simUser = localStorage.getItem("stax_simulated_user");
      if (simUser) {
        handleUserSession(JSON.parse(simUser));
      } else {
        setLoading(false);
      }
    }
  }, []);

  const handleUserSession = (currentUser) => {
    setUser(currentUser);
    if (currentUser) {
      // Admin check: email contains 'admin' or ends with '@stax.com'
      const email = currentUser.email || "";
      const isUserAdmin = email.includes("admin") || email.endsWith("@stax.com");
      setIsAdmin(isUserAdmin);
      
      if (isUserAdmin) {
        fetchDashboardData();
      } else {
        setAuthError("Unauthorized access. You must use an authorized @stax.com email.");
        setLoading(false);
      }
    } else {
      setIsAdmin(false);
      setLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    await Promise.all([fetchOrders(false), fetchProducts()]);
    setLoading(false);
  };

  const fetchOrders = async (showSpinner = false) => {
    if (showSpinner) setRefreshing(true);
    const hasKeys = isSupabaseConfigured();
    try {
      if (hasKeys) {
        const { data, error } = await supabase
          .from("orders")
          .select("*, items:order_items(*)")
          .order("created_at", { ascending: false });

        if (error) throw error;
        
        // Format orders for component consumption
        const formatted = data.map(ord => ({
          ...ord,
          _id: ord.id,
          estimatedTime: ord.estimated_time,
          paymentMethod: ord.payment_method,
          items: (ord.items || []).map(itm => ({
            name: itm.product_name,
            price: `₹${itm.price}`,
            qty: itm.quantity,
            image: itm.product_image
          }))
        }));
        setOrders(formatted);
      } else {
        // Fallback Database GET
        const res = await fetch("/api/orders");
        const data = await res.json();
        if (data.success) {
          setOrders(data.orders);
        }
      }
    } catch (err) {
      console.error("Admin fetch orders error:", err);
    } finally {
      setRefreshing(false);
    }
  };

  const fetchProducts = async () => {
    setMenuLoading(true);
    const hasKeys = isSupabaseConfigured();
    try {
      if (hasKeys) {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .order("id", { ascending: true });
        if (error) throw error;
        setProducts(data);
      } else {
        // Mock default menu load
        const localBurgers = [
          { id: 1, name: "The Classic Stack", price: 229, category: "signature", veg_type: "non-veg", availability: true, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800&auto=format&fit=crop" },
          { id: 2, name: "Double Flame Stack", price: 289, category: "signature", veg_type: "non-veg", availability: true, image: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?q=80&w=800&auto=format&fit=crop" },
          { id: 3, name: "Cheese Overload Stack", price: 259, category: "veg", veg_type: "veg", availability: true, image: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?q=80&w=800&auto=format&fit=crop" },
          { id: 4, name: "STAX Fries", price: 109, category: "sides", veg_type: "veg", availability: true, image: "https://images.unsplash.com/photo-1606755962773-d324e0a13086?q=80&w=800&auto=format&fit=crop" }
        ];
        const savedProd = JSON.parse(localStorage.getItem("stax_sim_products"));
        setProducts(savedProd || localBurgers);
      }
    } catch (err) {
      console.error("Admin fetch products error:", err);
    } finally {
      setMenuLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await response.json();
      if (data.success) {
        setOrders(prev => 
          prev.map(ord => 
            ord._id === orderId ? { ...ord, status: newStatus } : ord
          )
        );
      } else {
        alert("Failed to update status: " + data.message);
      }
    } catch (err) {
      console.error("Admin status patch error:", err);
    }
  };

  const handleTimeChange = async (orderId, newTime) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ estimatedTime: newTime }),
      });
      const data = await response.json();
      if (data.success) {
        setOrders(prev => 
          prev.map(ord => 
            ord._id === orderId ? { ...ord, estimatedTime: newTime } : ord
          )
        );
      } else {
        alert("Failed to update time: " + data.message);
      }
    } catch (err) {
      console.error("Admin time patch error:", err);
    }
  };

  // --- MENU MANAGEMENT CRUD ACTIONS ---

  const handleOpenProductModal = (product = null) => {
    setEditingProduct(product);
    if (product) {
      setProdName(product.name);
      setProdDesc(product.description || "");
      setProdPrice(product.price.toString());
      setProdImage(product.image);
      setProdCategory(product.category);
      setProdVegType(product.veg_type || "veg");
      setProdAvailability(product.availability);
      setProdTag(product.tag || "");
    } else {
      setProdName("");
      setProdDesc("");
      setProdPrice("");
      setProdImage("");
      setProdCategory("signature");
      setProdVegType("veg");
      setProdAvailability(true);
      setProdTag("");
    }
    setIsProductModalOpen(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const hasKeys = isSupabaseConfigured();

    if (hasKeys) {
      try {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Math.random().toString(36).substring(2, 11)}.${fileExt}`;
        const filePath = `products/${fileName}`;

        // Upload to product-images Supabase Storage Bucket
        const { data, error } = await supabase.storage
          .from("product-images")
          .upload(filePath, file);

        if (error) throw error;

        // Retrieve public URL
        const { data: urlData } = supabase.storage
          .from("product-images")
          .getPublicUrl(filePath);

        setProdImage(urlData.publicUrl);
      } catch (err) {
        console.error("Storage upload failed:", err);
        alert("Failed to upload image. Make sure 'product-images' bucket is created and set to public read.");
      } finally {
        setUploadingImage(false);
      }
    } else {
      // Mock Upload
      setTimeout(() => {
        setProdImage("https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800&auto=format&fit=crop");
        setUploadingImage(false);
      }, 1000);
    }
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!prodName.trim() || !prodPrice.trim() || !prodImage.trim()) {
      alert("Name, Price, and Product Image are required.");
      return;
    }

    const priceNum = parseInt(prodPrice);
    if (isNaN(priceNum)) {
      alert("Price must be a valid number.");
      return;
    }

    const hasKeys = isSupabaseConfigured();
    const productPayload = {
      name: prodName,
      description: prodDesc,
      price: priceNum,
      image: prodImage,
      category: prodCategory,
      veg_type: prodVegType,
      availability: prodAvailability,
      tag: prodTag || null,
      is_new: editingProduct ? editingProduct.is_new : true
    };

    try {
      if (hasKeys) {
        if (editingProduct) {
          // Edit
          const { error } = await supabase
            .from("products")
            .update(productPayload)
            .eq("id", editingProduct.id);
          if (error) throw error;
        } else {
          // Add
          const { error } = await supabase
            .from("products")
            .insert(productPayload);
          if (error) throw error;
        }
      } else {
        // Mock DB CRUD
        let updatedProducts = [...products];
        if (editingProduct) {
          updatedProducts = updatedProducts.map(p => 
            p.id === editingProduct.id ? { ...p, ...productPayload } : p
          );
        } else {
          const newProd = {
            id: Date.now(),
            ...productPayload,
          };
          updatedProducts.unshift(newProd);
        }
        localStorage.setItem("stax_sim_products", JSON.stringify(updatedProducts));
      }

      await fetchProducts();
      setIsProductModalOpen(false);
    } catch (err) {
      console.error("Save product error:", err);
      alert("Error saving product: " + err.message);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!confirm("Are you sure you want to delete this menu item?")) return;
    const hasKeys = isSupabaseConfigured();

    try {
      if (hasKeys) {
        const { error } = await supabase
          .from("products")
          .delete()
          .eq("id", productId);
        if (error) throw error;
      } else {
        const updated = products.filter(p => p.id !== productId);
        setProducts(updated);
        localStorage.setItem("stax_sim_products", JSON.stringify(updated));
      }
      await fetchProducts();
    } catch (err) {
      console.error("Delete product error:", err);
      alert("Failed to delete product: " + err.message);
    }
  };

  const handleToggleProductAvailability = async (product) => {
    const updatedStatus = !product.availability;
    const hasKeys = isSupabaseConfigured();

    try {
      if (hasKeys) {
        const { error } = await supabase
          .from("products")
          .update({ availability: updatedStatus })
          .eq("id", product.id);
        if (error) throw error;
      } else {
        const updated = products.map(p => 
          p.id === product.id ? { ...p, availability: updatedStatus } : p
        );
        setProducts(updated);
        localStorage.setItem("stax_sim_products", JSON.stringify(updated));
      }
      await fetchProducts();
    } catch (err) {
      console.error("Toggle availability error:", err);
    }
  };

  // Metrics Calculations
  const totalRevenue = orders.reduce((sum, ord) => sum + (ord.total || 0), 0);
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => ["Received", "Preparing", "Cooking", "Out for Delivery"].includes(o.status)).length;
  const completedOrders = orders.filter(o => o.status === "Delivered").length;

  const getStatusStyle = (status) => {
    switch (status) {
      case "Received": return "bg-yellow-500/10 border-yellow-500/35 text-yellow-400";
      case "Preparing": return "bg-pink-500/10 border-pink-500/35 text-pink-400";
      case "Cooking": return "bg-orange-500/10 border-orange-500/35 text-orange-400";
      case "Out for Delivery": return "bg-blue-500/10 border-blue-500/35 text-blue-400";
      case "Delivered": return "bg-green-500/10 border-green-500/35 text-green-400";
      default: return "bg-red-500/10 border-red-500/35 text-red-400";
    }
  };

  // --- RENDERS ---

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 rounded-full border-2 border-[#FF7A00] border-t-transparent animate-spin" />
        <span className="font-heading font-black text-xs uppercase tracking-widest text-white/50">
          Loading Operations Console...
        </span>
      </div>
    );
  }

  // Auth Protection Shield Layout
  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-6 relative overflow-hidden select-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#FF7A00]/5 rounded-full filter blur-[120px] pointer-events-none" />
        
        <div className="relative w-full max-w-md bg-[#0a0a0a]/90 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] p-8 text-center shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 mx-auto mb-6 shadow-[0_0_20px_rgba(239,68,68,0.15)]">
            <Lock className="w-7 h-7" />
          </div>

          <h3 className="font-heading font-black text-2xl uppercase tracking-wider text-white mb-2">
            Restricted HQ Access
          </h3>
          <p className="text-white/40 text-xs leading-relaxed max-w-xs mx-auto mb-8 font-medium">
            STAX HQ Operations Portal is locked. Authorized employee login is required.
          </p>

          {authError && (
            <div className="text-red-400 font-bold text-xs bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-6">
              {authError}
            </div>
          )}

          <button
            onClick={() => setIsAuthOpen(true)}
            className="w-full py-4 bg-gradient-to-r from-[#FF7A00] to-[#FFB347] hover:scale-102 text-black font-heading font-black text-xs uppercase tracking-widest rounded-2xl shadow-[0_4px_25px_rgba(255,122,0,0.35)] transition-all duration-300 border-none cursor-pointer"
          >
            Authenticate Admin
          </button>

          <a href="/" className="text-[10px] text-white/30 hover:text-white uppercase tracking-widest font-black block mt-6 no-underline transition-colors duration-200">
            Back to Customer Home
          </a>
        </div>

        <AuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          onAuthSuccess={handleUserSession}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white py-16 px-6 md:px-12 relative overflow-hidden select-none">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#FF7A00]/5 rounded-full filter blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-6 mb-12 border-b border-white/5 pb-8">
          <div className="flex flex-col gap-2 text-left">
            <span className="flex items-center gap-2 text-[#FF7A00] font-heading font-black text-xs uppercase tracking-widest">
              <ShieldCheck className="w-4 h-4 text-[#FF7A00]" /> STAX Operations HQ
            </span>
            <h1 className="font-heading font-black text-4xl md:text-5xl text-white uppercase tracking-tighter leading-none m-0">
              Kitchen Console
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-4 self-start md:self-auto">
            {/* Database indicator */}
            {!isSupabaseConfigured() ? (
              <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/25 px-4 py-2.5 rounded-full text-yellow-500 font-bold text-[10px] uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                Local Sandbox Active
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/25 px-4 py-2.5 rounded-full text-green-400 font-bold text-[10px] uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                Supabase Online
              </div>
            )}

            <button
              onClick={() => fetchOrders(true)}
              disabled={refreshing}
              className="flex items-center gap-2 bg-[#121212] hover:bg-[#FF7A00]/10 border border-white/10 hover:border-[#FF7A00]/40 text-white font-heading font-black text-xs uppercase tracking-widest px-6 py-3.5 rounded-full transition-all duration-300 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-[#FF7A00]" : ""}`} />
              Refresh Logs
            </button>
          </div>
        </div>

        {/* Setup Warning for sandbox mode */}
        {!isSupabaseConfigured() && (
          <div className="bg-[#FF7A00]/5 border border-[#FF7A00]/25 rounded-[2rem] p-6 mb-12 text-left relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-lg">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF7A00]/5 rounded-full filter blur-3xl pointer-events-none" />
            <div className="flex-1 flex flex-col gap-1.5">
              <h4 className="font-heading font-black text-xs uppercase tracking-wider text-[#FF7A00] m-0 flex items-center gap-2">
                ⚠️ Handover Configuration Warning: Missing Supabase Environment Keys
              </h4>
              <p className="text-white/60 text-xs leading-relaxed max-w-3xl m-0 font-medium">
                The operations desk is currently running in local simulation mode. 
                Configure <code className="bg-white/5 border border-white/10 px-1.5 py-0.5 rounded font-mono text-white text-[10px]">NEXT_PUBLIC_SUPABASE_URL</code> and <code className="bg-white/5 border border-white/10 px-1.5 py-0.5 rounded font-mono text-white text-[10px]">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to connect real live databases.
              </p>
            </div>
            <a 
              href="https://github.com/bhavyanshmehta/stax-burger#installation--local-setup" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex-shrink-0 bg-[#FF7A00]/10 hover:bg-[#FF7A00]/20 border border-[#FF7A00]/30 hover:border-[#FF7A00]/50 text-[#FF7A00] font-heading font-black text-[10px] uppercase tracking-widest px-5 py-3 rounded-xl transition-all duration-300 no-underline text-center"
            >
              Schema Setup Guide
            </a>
          </div>
        )}

        {/* Tab Selection */}
        <div className="flex gap-4 mb-8 border-b border-white/5 pb-4 text-left">
          <button
            onClick={() => setActiveTab("orders")}
            className={`font-heading font-black text-sm uppercase tracking-wider py-2 border-b-2 cursor-pointer transition-all duration-300 ${
              activeTab === "orders" ? "border-[#FF7A00] text-[#FF7A00]" : "border-transparent text-white/40 hover:text-white"
            }`}
          >
            Order Desk ({pendingOrders} Pending)
          </button>
          <button
            onClick={() => setActiveTab("menu")}
            className={`font-heading font-black text-sm uppercase tracking-wider py-2 border-b-2 cursor-pointer transition-all duration-300 ${
              activeTab === "menu" ? "border-[#FF7A00] text-[#FF7A00]" : "border-transparent text-white/40 hover:text-white"
            }`}
          >
            Menu Customizer ({products.length} Items)
          </button>
        </div>

        {/* ORDER DESK TAB VIEW */}
        {activeTab === "orders" && (
          <>
            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <div className="bg-[#0c0c0c] border border-white/5 rounded-3xl p-6 flex items-center justify-between shadow-lg">
                <div className="flex flex-col text-left">
                  <span className="text-[9px] text-white/30 font-bold uppercase tracking-widest">Gross Sales</span>
                  <span className="font-heading font-black text-3xl text-[#FF7A00] mt-1">₹{totalRevenue}</span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-[#FF7A00]/10 border border-[#FF7A00]/20 flex items-center justify-center text-[#FF7A00]">
                  <DollarSign className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-[#0c0c0c] border border-white/5 rounded-3xl p-6 flex items-center justify-between shadow-lg">
                <div className="flex flex-col text-left">
                  <span className="text-[9px] text-white/30 font-bold uppercase tracking-widest">Processed Logs</span>
                  <span className="font-heading font-black text-3xl text-white mt-1">{totalOrders}</span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/70">
                  <ClipboardList className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-[#0c0c0c] border border-white/5 rounded-3xl p-6 flex items-center justify-between shadow-lg">
                <div className="flex flex-col text-left">
                  <span className="text-[9px] text-white/30 font-bold uppercase tracking-widest">Cooking Stacks</span>
                  <span className="font-heading font-black text-3xl text-white mt-1">{pendingOrders}</span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
                  <ChefHat className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-[#0c0c0c] border border-white/5 rounded-3xl p-6 flex items-center justify-between shadow-lg">
                <div className="flex flex-col text-left">
                  <span className="text-[9px] text-white/30 font-bold uppercase tracking-widest">Delivered Stacks</span>
                  <span className="font-heading font-black text-3xl text-white mt-1">{completedOrders}</span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400">
                  <CheckCircle className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Orders Feed */}
            <div className="bg-[#0c0c0c] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-white/5 bg-[#121212]/30 flex justify-between items-center">
                <h3 className="font-heading font-black text-base uppercase tracking-wider text-white m-0">
                  Incoming Orders Feed
                </h3>
                <span className="text-[10px] text-[#FF7A00] font-black uppercase tracking-widest flex items-center gap-1.5 animate-pulse">
                  <BellRing className="w-3.5 h-3.5" /> Real-time active
                </span>
              </div>

              {orders.length > 0 ? (
                <div className="flex flex-col">
                  {orders.map((ord) => {
                    const isExpanded = expandedOrder === ord._id;
                    const itemsCount = ord.items.reduce((acc, curr) => acc + curr.qty, 0);

                    return (
                      <div 
                        key={ord._id} 
                        className={`border-b border-white/5 transition-all duration-300 ${
                          isExpanded ? "bg-white/[0.01]" : "hover:bg-white/[0.005]"
                        }`}
                      >
                        {/* Primary Row */}
                        <div 
                          onClick={() => setExpandedOrder(isExpanded ? null : ord._id)}
                          className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer select-none"
                        >
                          <div className="flex items-center gap-4 text-left">
                            <div className="flex flex-col">
                              <span className="text-[9px] text-white/30 uppercase tracking-widest font-semibold">Order ID</span>
                              <span className="font-heading font-black text-sm text-white uppercase tracking-wider">{ord.order_number || ord._id}</span>
                            </div>
                            <div className="h-6 w-0.5 bg-white/5" />
                            <div className="flex flex-col">
                              <span className="text-[9px] text-white/30 uppercase tracking-widest font-semibold">Date & Time</span>
                              <span className="text-xs text-white/80 font-bold">
                                {new Date(ord.created_at || ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} — {new Date(ord.created_at || ord.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between md:justify-end gap-6">
                            <div className="flex flex-col text-left md:text-right">
                              <span className="text-[9px] text-white/30 uppercase tracking-widest font-semibold">{itemsCount} Items • {ord.paymentMethod}</span>
                              <span className="text-sm font-heading font-black text-[#FF7A00]">₹{ord.total}</span>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              <span className={`border text-[9px] font-heading font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full ${getStatusStyle(ord.status)}`}>
                                {ord.status}
                              </span>
                              {isExpanded ? <ChevronUp className="w-4 h-4 text-white/35" /> : <ChevronDown className="w-4 h-4 text-white/35" />}
                            </div>
                          </div>
                        </div>

                        {/* Collapsible content details */}
                        {isExpanded && (
                          <div className="px-6 pb-6 pt-2 border-t border-dashed border-white/5 flex flex-col md:flex-row gap-8 text-left bg-black/[0.15]">
                            {/* Customer info */}
                            <div className="flex-1 flex flex-col gap-4">
                              <h4 className="font-heading font-black text-[10px] text-[#FF7A00] uppercase tracking-widest m-0">
                                Customer Details
                              </h4>
                              
                              <div className="flex flex-col gap-2.5 text-xs text-white/70">
                                <div>
                                  <span className="text-white/30 uppercase tracking-widest text-[8.5px] font-bold block mb-0.5">Name</span>
                                  <span className="font-bold text-white text-sm">{ord.name}</span>
                                </div>
                                <div>
                                  <span className="text-white/30 uppercase tracking-widest text-[8.5px] font-bold block mb-0.5">Contact</span>
                                  <span className="font-bold text-white text-sm">{ord.phone}</span>
                                </div>
                                <div>
                                  <span className="text-white/30 uppercase tracking-widest text-[8.5px] font-bold block mb-0.5">Email</span>
                                  <span className="text-white/80">{ord.email}</span>
                                </div>
                                <div>
                                  <span className="text-white/30 uppercase tracking-widest text-[8.5px] font-bold block mb-0.5">Delivery Coordinates</span>
                                  <span className="text-white/80 leading-relaxed">{ord.address}</span>
                                </div>

                                {/* Delivery time manager */}
                                <div className="mt-4 pt-4 border-t border-white/5 flex flex-col gap-2">
                                  <span className="text-white/30 uppercase tracking-widest text-[8.5px] font-bold block">
                                    Est. Delivery Time
                                  </span>
                                  <select
                                    value={ord.estimatedTime || "30 mins"}
                                    onChange={(e) => handleTimeChange(ord._id, e.target.value)}
                                    className="bg-[#121212] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-[#FF7A00] transition-colors duration-300 cursor-pointer"
                                  >
                                    {ord.estimatedTime && !["15 mins", "20 mins", "30 mins", "45 mins", "60 mins", "90 mins", "Delayed", "Arrived"].includes(ord.estimatedTime) && (
                                      <option value={ord.estimatedTime}>{ord.estimatedTime.replace("mins", "Mins")}</option>
                                    )}
                                    <option value="15 mins">15 Mins</option>
                                    <option value="20 mins">20 Mins</option>
                                    <option value="30 mins">30 Mins (Default)</option>
                                    <option value="45 mins">45 Mins</option>
                                    <option value="60 mins">60 Mins</option>
                                    <option value="90 mins">90 Mins</option>
                                    <option value="Delayed">Delayed</option>
                                    <option value="Arrived">Arrived</option>
                                  </select>
                                </div>
                              </div>
                            </div>

                            {/* Stack details */}
                            <div className="flex-1 flex flex-col gap-4">
                              <h4 className="font-heading font-black text-[10px] text-[#FF7A00] uppercase tracking-widest m-0">
                                Stack Details
                              </h4>
                              
                              <div className="flex flex-col gap-3">
                                {ord.items.map((itm, idx) => (
                                  <div key={idx} className="flex items-center justify-between text-xs border-b border-white/5 pb-2.5 last:border-0 last:pb-0">
                                    <div className="flex items-center gap-2.5">
                                      <div className="w-8 h-8 rounded bg-white/5 p-0.5 flex items-center justify-center">
                                        <img src={itm.image} alt={itm.name} className="w-full h-full object-contain" />
                                      </div>
                                      <div className="flex flex-col text-left">
                                        <span className="font-bold text-white leading-tight">{itm.name}</span>
                                        <span className="text-[9px] text-[#FF7A00] font-black uppercase mt-0.5">x{itm.qty}</span>
                                      </div>
                                    </div>
                                    <span className="font-semibold text-white/70">{itm.price}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Kitchen controller triggers */}
                            <div className="w-full md:w-64 border-t md:border-t-0 md:border-l border-white/5 pt-6 md:pt-0 md:pl-8 flex flex-col justify-between">
                              <div className="flex flex-col gap-4">
                                <h4 className="font-heading font-black text-[10px] text-[#FF7A00] uppercase tracking-widest m-0">
                                  Kitchen Controls
                                </h4>
                                
                                <div className="flex flex-col gap-2">
                                  {ord.status === "Received" && (
                                    <>
                                      <button
                                        onClick={() => handleStatusChange(ord._id, "Preparing")}
                                        className="w-full py-3 px-4 bg-gradient-to-r from-[#FF7A00] to-[#FFB347] hover:scale-102 text-black font-heading font-black text-[10px] uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 border-none cursor-pointer"
                                      >
                                        <CheckCircle className="w-4 h-4" /> Accept Order
                                      </button>
                                      <button
                                        onClick={() => handleStatusChange(ord._id, "Rejected")}
                                        className="w-full py-3 px-4 bg-transparent hover:bg-red-500/10 border border-white/10 hover:border-red-500/20 text-white/60 hover:text-red-400 font-heading font-black text-[10px] uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors duration-200"
                                      >
                                        Reject Order
                                      </button>
                                    </>
                                  )}

                                  {ord.status === "Preparing" && (
                                    <button
                                      onClick={() => handleStatusChange(ord._id, "Cooking")}
                                      className="w-full py-3 px-4 bg-[#FF7A00]/10 border border-[#FF7A00]/30 hover:bg-[#FF7A00]/20 text-[#FF7A00] font-heading font-black text-[10px] uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors duration-200"
                                    >
                                      <Flame className="w-4 h-4" /> Start Cooking
                                    </button>
                                  )}

                                  {ord.status === "Cooking" && (
                                    <button
                                      onClick={() => handleStatusChange(ord._id, "Out for Delivery")}
                                      className="w-full py-3 px-4 bg-blue-500/10 border border-blue-500/30 hover:bg-blue-500/20 text-blue-400 font-heading font-black text-[10px] uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors duration-200"
                                    >
                                      <Truck className="w-4 h-4" /> Dispatch Rider
                                    </button>
                                  )}

                                  {ord.status === "Out for Delivery" && (
                                    <button
                                      onClick={() => handleStatusChange(ord._id, "Delivered")}
                                      className="w-full py-3 px-4 bg-green-500/10 border border-green-500/30 hover:bg-green-500/20 text-green-400 font-heading font-black text-[10px] uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors duration-200"
                                    >
                                      <CheckCircle className="w-4 h-4" /> Mark Delivered
                                    </button>
                                  )}

                                  {["Delivered", "Rejected"].includes(ord.status) && (
                                    <span className="text-[10px] text-white/30 font-bold uppercase tracking-wider text-center py-4 block">
                                      Order processing complete
                                    </span>
                                  )}
                                </div>
                              </div>

                              <a
                                href={`/order/${ord._id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] text-white/40 hover:text-[#FF7A00] font-black uppercase tracking-widest no-underline flex items-center gap-1.5 justify-center mt-6 pt-4 border-t border-white/5 transition-colors duration-200"
                              >
                                <ExternalLink className="w-3.5 h-3.5" /> Customer Tracking View
                              </a>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-24 text-center">
                  <Flame className="w-12 h-12 text-white/10 mx-auto mb-4" />
                  <p className="text-white/30 font-heading font-black text-lg uppercase tracking-wider mb-1">
                    No orders received yet
                  </p>
                  <p className="text-white/15 text-xs font-semibold uppercase tracking-widest">
                    Waiting for customers to stack...
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        {/* MENU CUSTOMIZER TAB VIEW */}
        {activeTab === "menu" && (
          <div className="flex flex-col gap-6 text-left">
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <h3 className="font-heading font-black text-base uppercase tracking-wider text-white m-0">
                Live Products Inventory
              </h3>
              <button
                onClick={() => handleOpenProductModal(null)}
                className="flex items-center gap-2 bg-[#FF7A00]/10 hover:bg-[#FF7A00] border border-[#FF7A00]/30 text-[#FF7A00] hover:text-black font-heading font-black text-[10px] uppercase tracking-widest px-5 py-3 rounded-full transition-all duration-300 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add Product
              </button>
            </div>

            {menuLoading ? (
              <div className="py-16 text-center text-white/35 font-bold text-xs uppercase tracking-widest">
                Fetching catalog inventory...
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {products.map((prod) => (
                  <div key={prod.id} className="bg-[#0c0c0c] border border-white/5 rounded-[2rem] p-5 flex gap-4 shadow-lg hover:border-white/10 transition-colors duration-300">
                    <div className="w-24 h-24 rounded-2xl bg-white/5 border border-white/15 p-2 flex items-center justify-center flex-shrink-0">
                      <img src={prod.image} alt={prod.name} className="w-full h-full object-contain" />
                    </div>

                    <div className="flex-1 flex flex-col justify-between text-left">
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-heading font-black text-sm text-white uppercase tracking-wider line-clamp-1">{prod.name}</span>
                          <span className={`text-[8px] font-heading font-black uppercase tracking-wider px-2 py-0.5 rounded border flex-shrink-0 ${
                            prod.veg_type === "veg" ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-red-500/10 border-red-500/20 text-red-400"
                          }`}>
                            {prod.veg_type || "veg"}
                          </span>
                        </div>
                        <p className="text-[10px] text-white/40 leading-relaxed line-clamp-2 mt-1 mb-0">{prod.description || "No description provided."}</p>
                      </div>

                      <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/5">
                        <div className="flex flex-col">
                          <span className="text-[8px] text-white/30 uppercase tracking-widest font-bold">Price</span>
                          <span className="font-heading font-black text-sm text-[#FF7A00]">₹{prod.price}</span>
                        </div>

                        <div className="flex items-center gap-3">
                          {/* Availability Toggle */}
                          <button
                            onClick={() => handleToggleProductAvailability(prod)}
                            className="bg-transparent border-none text-white/40 hover:text-white p-1 cursor-pointer transition-colors"
                            title={prod.availability ? "Disable availability" : "Enable availability"}
                          >
                            {prod.availability ? (
                              <div className="flex items-center gap-1.5 text-green-400 text-[9px] uppercase font-bold">
                                <ToggleRight className="w-6 h-6" /> Available
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 text-white/30 text-[9px] uppercase font-bold">
                                <ToggleLeft className="w-6 h-6" /> Out of stock
                              </div>
                            )}
                          </button>

                          <div className="h-4 w-px bg-white/5" />

                          <button
                            onClick={() => handleOpenProductModal(prod)}
                            className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 hover:border-[#FF7A00]/50 hover:bg-[#FF7A00]/10 flex items-center justify-center text-white/50 hover:text-[#FF7A00] cursor-pointer transition-all duration-300"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(prod.id)}
                            className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 hover:border-red-500/50 hover:bg-red-500/10 flex items-center justify-center text-white/50 hover:text-red-400 cursor-pointer transition-all duration-300"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-24 text-center border border-dashed border-white/10 rounded-3xl">
                <p className="text-white/30 text-xs font-bold uppercase tracking-widest">No products found in database.</p>
              </div>
            )}
          </div>
        )}

      </div>

      {/* PRODUCT ADD/EDIT MODAL OVERLAY */}
      <AnimatePresence>
        {isProductModalOpen && (
          <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsProductModalOpen(false)}
              className="fixed inset-0 bg-black/85 backdrop-blur-[12px]"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] p-8 text-white z-10"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-heading font-black text-lg uppercase tracking-wider text-[#FF7A00] m-0">
                  {editingProduct ? "Edit Menu Product" : "Add New Menu Product"}
                </h3>
                <button
                  onClick={() => setIsProductModalOpen(false)}
                  className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="flex flex-col gap-4 text-left">
                
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold text-white/45 uppercase tracking-wider">Product Name</label>
                  <input
                    type="text"
                    value={prodName}
                    onChange={(e) => setProdName(e.target.value)}
                    placeholder="e.g. Smoky Chipotle Crunch Stack"
                    className="w-full bg-[#121212] border border-white/10 focus:border-[#FF7A00] rounded-xl px-4 py-3 text-white text-xs outline-none transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold text-white/45 uppercase tracking-wider">Description</label>
                  <textarea
                    value={prodDesc}
                    onChange={(e) => setProdDesc(e.target.value)}
                    placeholder="Premium patty smothered with glossy chipotle sauce, swiss slices..."
                    rows="2"
                    className="w-full bg-[#121212] border border-white/10 focus:border-[#FF7A00] rounded-xl px-4 py-3 text-white text-xs outline-none resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold text-white/45 uppercase tracking-wider">Price (₹ INR)</label>
                    <input
                      type="number"
                      value={prodPrice}
                      onChange={(e) => setProdPrice(e.target.value)}
                      placeholder="299"
                      className="w-full bg-[#121212] border border-white/10 focus:border-[#FF7A00] rounded-xl px-4 py-3 text-white text-xs outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold text-white/45 uppercase tracking-wider">Category</label>
                    <select
                      value={prodCategory}
                      onChange={(e) => setProdCategory(e.target.value)}
                      className="w-full bg-[#121212] border border-white/10 focus:border-[#FF7A00] rounded-xl px-3 py-3 text-xs text-white outline-none cursor-pointer"
                    >
                      <option value="signature">Signature Stacks</option>
                      <option value="chicken">Chicken Stacks</option>
                      <option value="veg">Veg Stacks</option>
                      <option value="sides">Sides & Extras</option>
                      <option value="drinks">Beverages</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold text-white/45 uppercase tracking-wider">Veg/Dietary Type</label>
                    <select
                      value={prodVegType}
                      onChange={(e) => setProdVegType(e.target.value)}
                      className="w-full bg-[#121212] border border-white/10 focus:border-[#FF7A00] rounded-xl px-3 py-3 text-xs text-white outline-none cursor-pointer"
                    >
                      <option value="veg">Vegetarian (Veg)</option>
                      <option value="non-veg">Non-Vegetarian (Non-Veg)</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold text-white/45 uppercase tracking-wider">Catalog Tag</label>
                    <input
                      type="text"
                      value={prodTag}
                      onChange={(e) => setProdTag(e.target.value)}
                      placeholder="e.g. Chef Choice, Fire Sizzled"
                      className="w-full bg-[#121212] border border-white/10 focus:border-[#FF7A00] rounded-xl px-4 py-3 text-white text-xs outline-none"
                    />
                  </div>
                </div>

                {/* Image upload and url field */}
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold text-white/45 uppercase tracking-wider">Product Asset Image</label>
                  <div className="flex gap-3 items-center">
                    <input
                      type="text"
                      value={prodImage}
                      onChange={(e) => setProdImage(e.target.value)}
                      placeholder="Paste image URL directly..."
                      className="flex-1 bg-[#121212] border border-white/10 focus:border-[#FF7A00] rounded-xl px-4 py-3 text-white text-xs outline-none"
                    />
                    <label className="bg-white/5 hover:bg-white/10 border border-white/15 px-4 py-3 rounded-xl cursor-pointer text-xs font-bold flex items-center gap-1.5 transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      {uploadingImage ? "Uploading..." : "Upload"}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-2">
                  <input
                    type="checkbox"
                    id="prod_availability"
                    checked={prodAvailability}
                    onChange={(e) => setProdAvailability(e.target.checked)}
                    className="w-4 h-4 accent-[#FF7A00] cursor-pointer"
                  />
                  <label htmlFor="prod_availability" className="text-xs text-white/70 font-semibold cursor-pointer">Available and active in menu</label>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-gradient-to-r from-[#FF7A00] to-[#FFB347] hover:scale-102 text-black font-heading font-black text-xs uppercase tracking-widest rounded-2xl shadow-[0_4px_25px_rgba(255,122,0,0.3)] transition-all duration-300 border-none cursor-pointer mt-4"
                >
                  {editingProduct ? "Save Product Settings" : "Add Product to Catalog"}
                </button>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

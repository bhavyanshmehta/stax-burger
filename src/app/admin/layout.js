"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, RefreshCw, LogOut, CheckCircle, Flame } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export const AdminContext = createContext(null);

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Shared Admin States
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [menuLoading, setMenuLoading] = useState(false);

  useEffect(() => {
    let active = true;

    async function checkAuth() {
      const hasKeys = isSupabaseConfigured();
      if (hasKeys) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!active) return;
          
          if (!session?.user) {
            handleAuthFailure();
            return;
          }

          // Query profiles table to fetch user role
          const { data: profile, error } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", session.user.id)
            .single();

          if (!active) return;

          // Double check email fallback as well
          const email = session.user.email || "";
          const isEmailAdmin = email.includes("admin") || email.endsWith("@stax.com");

          if (profile && profile.role === "admin") {
            setUser(session.user);
            setIsAdmin(true);
            setLoading(false);
            if (pathname === "/admin/login") {
              router.push("/admin/dashboard");
            }
          } else if (isEmailAdmin) {
            // Update db role if email matches admin guidelines
            await supabase.from("profiles").update({ role: "admin" }).eq("id", session.user.id);
            setUser(session.user);
            setIsAdmin(true);
            setLoading(false);
            if (pathname === "/admin/login") {
              router.push("/admin/dashboard");
            }
          } else {
            handleAuthFailure();
          }
        } catch (err) {
          console.error("Auth check error:", err);
          handleAuthFailure();
        }
      } else {
        // Simulation Sandbox Mode
        const simUser = localStorage.getItem("stax_simulated_user");
        if (!active) return;

        if (simUser) {
          const parsed = JSON.parse(simUser);
          const email = parsed.email || "";
          const isSimAdmin = email.includes("admin") || email.endsWith("@stax.com") || parsed.role === "admin";
          
          if (isSimAdmin) {
            setUser(parsed);
            setIsAdmin(true);
            setLoading(false);
            if (pathname === "/admin/login") {
              router.push("/admin/dashboard");
            }
          } else {
            handleAuthFailure();
          }
        } else {
          handleAuthFailure();
        }
      }
    }

    function handleAuthFailure() {
      setIsAdmin(false);
      setUser(null);
      setLoading(false);
      if (pathname !== "/admin/login") {
        router.push("/admin/login");
      }
    }

    checkAuth();

    // Listen for auth state changes
    let subscription = null;
    if (isSupabaseConfigured()) {
      const { data } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === "SIGNED_OUT") {
          setIsAdmin(false);
          setUser(null);
          if (pathname !== "/admin/login") {
            router.push("/admin/login");
          }
        } else if (event === "SIGNED_IN" || event === "USER_UPDATED") {
          checkAuth();
        }
      });
      subscription = data.subscription;
    }

    return () => {
      active = false;
      if (subscription) subscription.unsubscribe();
    };
  }, [pathname, router]);

  // Load orders and products once authorized
  useEffect(() => {
    if (isAdmin) {
      fetchDashboardData();
    }
  }, [isAdmin]);

  const fetchDashboardData = async () => {
    setMenuLoading(true);
    await Promise.all([fetchOrders(false), fetchProducts()]);
    setMenuLoading(false);
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
        
        // Format orders for frontend
        const formatted = data.map(ord => ({
          ...ord,
          _id: ord.id,
          estimatedTime: ord.estimated_time,
          paymentMethod: ord.payment_method,
          paymentStatus: ord.payment_status,
          transactionId: ord.transaction_id,
          items: (ord.items || []).map(itm => ({
            name: itm.product_name,
            price: `₹${itm.price}`,
            qty: itm.quantity,
            image: itm.product_image
          }))
        }));
        setOrders(formatted);
      } else {
        // Fallback Sandbox GET
        const res = await fetch("/api/orders");
        const data = await res.json();
        if (data.success) {
          setOrders(data.orders);
        }
      }
    } catch (err) {
      console.error("Admin layout fetch orders error:", err);
    } finally {
      setRefreshing(false);
    }
  };

  const fetchProducts = async () => {
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
        // Mock menu catalog
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
      console.error("Admin layout fetch products error:", err);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await response.json();
      if (data.success) {
        setOrders(prev => 
          prev.map(ord => ord._id === orderId ? { ...ord, status: newStatus } : ord)
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estimatedTime: newTime }),
      });
      const data = await response.json();
      if (data.success) {
        setOrders(prev => 
          prev.map(ord => ord._id === orderId ? { ...ord, estimatedTime: newTime } : ord)
        );
      } else {
        alert("Failed to update time: " + data.message);
      }
    } catch (err) {
      console.error("Admin time patch error:", err);
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

  const handleLogout = async () => {
    const hasKeys = isSupabaseConfigured();
    if (hasKeys) {
      await supabase.auth.signOut();
    } else {
      localStorage.removeItem("stax_simulated_user");
    }
    setUser(null);
    setIsAdmin(false);
    router.push("/admin/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 rounded-full border-2 border-[#FF7A00] border-t-transparent animate-spin" />
        <span className="font-heading font-black text-xs uppercase tracking-widest text-white/50 animate-pulse">
          Verifying HQ Credentials...
        </span>
      </div>
    );
  }

  // Bypass styling for login path
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  // Double check admin guard
  if (!isAdmin) {
    return null;
  }

  return (
    <AdminContext.Provider value={{
      orders,
      setOrders,
      products,
      setProducts,
      loading,
      menuLoading,
      refreshing,
      fetchOrders,
      fetchProducts,
      handleStatusChange,
      handleTimeChange,
      handleDeleteProduct,
      handleToggleProductAvailability,
      user,
      isAdmin,
      handleLogout
    }}>
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

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-transparent hover:bg-red-500/10 border border-white/10 hover:border-red-500/40 text-white/60 hover:text-red-400 font-heading font-black text-xs uppercase tracking-widest px-6 py-3.5 rounded-full transition-all duration-300 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
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

          {/* Navigation Links */}
          <div className="flex gap-6 mb-8 border-b border-white/5 pb-4 text-left">
            <Link
              href="/admin/dashboard"
              className={`font-heading font-black text-sm uppercase tracking-wider py-2 border-b-2 transition-all duration-300 no-underline ${
                pathname === "/admin/dashboard" ? "border-[#FF7A00] text-[#FF7A00]" : "border-transparent text-white/40 hover:text-white"
              }`}
            >
              Revenue Analytics
            </Link>
            <Link
              href="/admin/orders"
              className={`font-heading font-black text-sm uppercase tracking-wider py-2 border-b-2 transition-all duration-300 no-underline ${
                pathname === "/admin/orders" ? "border-[#FF7A00] text-[#FF7A00]" : "border-transparent text-white/40 hover:text-white"
              }`}
            >
              Order Desk
            </Link>
            <Link
              href="/admin/products"
              className={`font-heading font-black text-sm uppercase tracking-wider py-2 border-b-2 transition-all duration-300 no-underline ${
                pathname === "/admin/products" ? "border-[#FF7A00] text-[#FF7A00]" : "border-transparent text-white/40 hover:text-white"
              }`}
            >
              Menu Customizer
            </Link>
          </div>

          {children}
        </div>
      </div>
    </AdminContext.Provider>
  );
}

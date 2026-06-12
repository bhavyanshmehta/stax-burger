"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Flame, 
  ShoppingBag, 
  DollarSign, 
  ClipboardList, 
  TrendingUp, 
  RefreshCw, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink,
  CheckCircle,
  Truck,
  ChefHat,
  BellRing
} from "lucide-react";

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [error, setError] = useState("");

  const fetchOrders = async (showSpinner = false) => {
    if (showSpinner) setRefreshing(true);
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
        setError("");
      } else {
        setError(data.error || "Failed to load orders");
      }
    } catch (err) {
      console.error("Admin fetch orders error:", err);
      setError("Failed to connect to API server.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // Poll for new orders every 10 seconds
    const interval = setInterval(() => fetchOrders(false), 10000);
    return () => clearInterval(interval);
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const response = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await response.json();
      if (data.success) {
        // Update local state smoothly
        setOrders(prev => 
          prev.map(order => 
            order._id === id ? { ...order, status: newStatus } : order
          )
        );
      } else {
        alert("Failed to update status: " + data.message);
      }
    } catch (err) {
      console.error("Admin status patch error:", err);
      alert("Network error updating status.");
    }
  };

  const toggleExpandOrder = (id) => {
    setExpandedOrder(expandedOrder === id ? null : id);
  };

  // Metrics Calculations
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
  const pendingOrders = orders.filter(o => o.status === "Received" || o.status === "Cooking" || o.status === "Out for Delivery").length;
  const completedOrders = orders.filter(o => o.status === "Delivered").length;

  const getStatusStyle = (status) => {
    switch (status) {
      case "Received":
        return "bg-yellow-500/10 border-yellow-500/35 text-yellow-400";
      case "Cooking":
        return "bg-orange-500/10 border-orange-500/35 text-orange-400";
      case "Out for Delivery":
        return "bg-blue-500/10 border-blue-500/35 text-blue-400";
      case "Delivered":
        return "bg-green-500/10 border-green-500/35 text-green-400";
      default:
        return "bg-white/10 border-white/5 text-white/50";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 rounded-full border-2 border-[#FF7A00] border-t-transparent animate-spin" />
        <span className="font-heading font-black text-xs uppercase tracking-widest text-white/50">
          Loading Admin Control panel...
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white py-16 px-6 md:px-12 relative overflow-hidden select-none">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#FF7A00]/5 rounded-full filter blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-6 mb-12 border-b border-white/5 pb-8">
          <div className="flex flex-col gap-2 text-left">
            <span className="flex items-center gap-2 text-[#FF7A00] font-heading font-black text-xs uppercase tracking-widest">
              <Flame className="w-4 h-4 fill-current" /> STAX HQ
            </span>
            <h1 className="font-heading font-black text-4xl md:text-5xl text-white uppercase tracking-tighter leading-none m-0">
              Kitchen Console
            </h1>
            <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mt-1">
              Active Orders & Operations Center
            </p>
          </div>

          <button
            onClick={() => fetchOrders(true)}
            disabled={refreshing}
            className="flex items-center gap-2 bg-[#121212] hover:bg-[#FF7A00]/10 border border-white/10 hover:border-[#FF7A00]/40 text-white font-heading font-black text-xs uppercase tracking-widest px-6 py-3.5 rounded-full transition-all duration-300 cursor-pointer self-start"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-[#FF7A00]" : ""}`} />
            Refresh Logs
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl mb-8 text-sm font-semibold">
            {error}
          </div>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          
          {/* Revenue */}
          <div className="bg-[#0c0c0c] border border-white/5 rounded-3xl p-6 flex items-center justify-between shadow-lg">
            <div className="flex flex-col text-left">
              <span className="text-[9px] text-white/30 font-bold uppercase tracking-widest">Total Revenue</span>
              <span className="font-heading font-black text-3xl text-[#FF7A00] mt-1">₹{totalRevenue}</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#FF7A00]/10 border border-[#FF7A00]/20 flex items-center justify-center text-[#FF7A00]">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>

          {/* Orders count */}
          <div className="bg-[#0c0c0c] border border-white/5 rounded-3xl p-6 flex items-center justify-between shadow-lg">
            <div className="flex flex-col text-left">
              <span className="text-[9px] text-white/30 font-bold uppercase tracking-widest">Total Orders</span>
              <span className="font-heading font-black text-3xl text-white mt-1">{totalOrders}</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/70">
              <ClipboardList className="w-6 h-6" />
            </div>
          </div>

          {/* Active Orders */}
          <div className="bg-[#0c0c0c] border border-white/5 rounded-3xl p-6 flex items-center justify-between shadow-lg">
            <div className="flex flex-col text-left">
              <span className="text-[9px] text-white/30 font-bold uppercase tracking-widest">Active Orders</span>
              <span className="font-heading font-black text-3xl text-white mt-1">{pendingOrders}</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
              <ChefHat className="w-6 h-6" />
            </div>
          </div>

          {/* Deliveries */}
          <div className="bg-[#0c0c0c] border border-white/5 rounded-3xl p-6 flex items-center justify-between shadow-lg">
            <div className="flex flex-col text-left">
              <span className="text-[9px] text-white/30 font-bold uppercase tracking-widest">Completed Deliveries</span>
              <span className="font-heading font-black text-3xl text-white mt-1">{completedOrders}</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400">
              <CheckCircle className="w-6 h-6" />
            </div>
          </div>

        </div>

        {/* Orders Table Panel */}
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
              {orders.map((order) => {
                const isExpanded = expandedOrder === order._id;
                const itemsCount = order.items.reduce((acc, curr) => acc + curr.qty, 0);

                return (
                  <div 
                    key={order._id} 
                    className={`border-b border-white/5 transition-all duration-300 ${
                      isExpanded ? "bg-white/[0.01]" : "hover:bg-white/[0.005]"
                    }`}
                  >
                    {/* Primary Row */}
                    <div 
                      onClick={() => toggleExpandOrder(order._id)}
                      className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-4 text-left">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-white/30 uppercase tracking-widest font-semibold">Order ID</span>
                          <span className="font-heading font-black text-sm text-white uppercase">{order._id}</span>
                        </div>
                        <div className="h-6 w-0.5 bg-white/5" />
                        <div className="flex flex-col">
                          <span className="text-[10px] text-white/30 uppercase tracking-widest font-semibold">Date & Time</span>
                          <span className="text-xs text-white/80 font-bold">
                            {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} — {new Date(order.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between md:justify-end gap-6">
                        <div className="flex flex-col text-left md:text-right">
                          <span className="text-[10px] text-white/30 uppercase tracking-widest font-semibold">{itemsCount} Items</span>
                          <span className="text-sm font-heading font-black text-[#FF7A00]">₹{order.total}</span>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <span className={`border text-[9px] font-heading font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full ${getStatusStyle(order.status)}`}>
                            {order.status}
                          </span>
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-white/35" /> : <ChevronDown className="w-4 h-4 text-white/35" />}
                        </div>
                      </div>
                    </div>

                    {/* Expanded Content Drawer */}
                    {isExpanded && (
                      <div className="px-6 pb-6 pt-2 border-t border-dashed border-white/5 flex flex-col md:flex-row gap-8 text-left bg-black/[0.15]">
                        {/* Customer & Address Column */}
                        <div className="flex-1 flex flex-col gap-4">
                          <h4 className="font-heading font-black text-[10px] text-[#FF7A00] uppercase tracking-widest m-0">
                            Customer Info
                          </h4>
                          
                          <div className="flex flex-col gap-2.5 text-xs text-white/70">
                            <div>
                              <span className="text-white/30 uppercase tracking-widest text-[8.5px] font-bold block mb-0.5">Name</span>
                              <span className="font-bold text-white text-sm">{order.name}</span>
                            </div>
                            <div>
                              <span className="text-white/30 uppercase tracking-widest text-[8.5px] font-bold block mb-0.5">Contact</span>
                              <span className="font-bold text-white text-sm">{order.phone}</span>
                            </div>
                            <div>
                              <span className="text-white/30 uppercase tracking-widest text-[8.5px] font-bold block mb-0.5">Email</span>
                              <span className="text-white/80">{order.email}</span>
                            </div>
                            <div>
                              <span className="text-white/30 uppercase tracking-widest text-[8.5px] font-bold block mb-0.5">Delivery Address</span>
                              <span className="text-white/80 leading-relaxed">{order.address}</span>
                            </div>
                          </div>
                        </div>

                        {/* Order Items Summary */}
                        <div className="flex-1 flex flex-col gap-4">
                          <h4 className="font-heading font-black text-[10px] text-[#FF7A00] uppercase tracking-widest m-0">
                            Stack Details
                          </h4>
                          
                          <div className="flex flex-col gap-3">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="flex items-center justify-between text-xs border-b border-white/5 pb-2.5 last:border-0 last:pb-0">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-8 h-8 rounded bg-white/5 p-0.5 flex items-center justify-center">
                                    <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                                  </div>
                                  <div className="flex flex-col text-left">
                                    <span className="font-bold text-white leading-tight">{item.name}</span>
                                    <span className="text-[9px] text-[#FF7A00] font-black uppercase mt-0.5">x{item.qty}</span>
                                  </div>
                                </div>
                                <span className="font-semibold text-white/70">{item.price}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Status controls action center */}
                        <div className="w-full md:w-64 border-t md:border-t-0 md:border-l border-white/5 pt-6 md:pt-0 md:pl-8 flex flex-col justify-between">
                          <div className="flex flex-col gap-4">
                            <h4 className="font-heading font-black text-[10px] text-[#FF7A00] uppercase tracking-widest m-0">
                              Kitchen Controls
                            </h4>
                            
                            <div className="flex flex-col gap-2">
                              {/* status change actions */}
                              {[
                                { status: "Received", label: "Accept Order", icon: ClipboardList },
                                { status: "Cooking", label: "Start Cooking", icon: Flame },
                                { status: "Out for Delivery", label: "Dispatch Rider", icon: Truck },
                                { status: "Delivered", label: "Mark Delivered", icon: CheckCircle }
                              ].map((btn) => {
                                const isActive = order.status === btn.status;
                                const Icon = btn.icon;

                                return (
                                  <button
                                    key={btn.status}
                                    onClick={() => handleStatusChange(order._id, btn.status)}
                                    className={`w-full py-3.5 px-4.5 rounded-xl text-left text-xs font-bold uppercase tracking-wider flex items-center gap-3 transition-all duration-300 border cursor-pointer ${
                                      isActive 
                                        ? "bg-[#FF7A00] border-[#FF7A00] text-black shadow-[0_0_12px_rgba(255,122,0,0.25)] font-black"
                                        : "bg-[#121212] border-white/5 text-white/50 hover:border-white/20 hover:text-white"
                                    }`}
                                  >
                                    <Icon className="w-4 h-4 flex-shrink-0" />
                                    {btn.label}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          <a
                            href={`/order/${order._id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-white/40 hover:text-[#FF7A00] font-black uppercase tracking-widest no-underline flex items-center gap-1.5 justify-center mt-6 pt-4 border-t border-white/5 transition-colors duration-300"
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

      </div>
    </div>
  );
}

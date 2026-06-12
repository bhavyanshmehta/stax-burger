"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, Phone, Mail, MapPin, ClipboardList, Trash2, Shield, LogOut } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export default function ProfileModal({ isOpen, onClose, user, onLogout }) {
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Profile fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  // Address fields
  const [addresses, setAddresses] = useState([]);
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");

  // Orders fields
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (!user) return;
    setError("");
    setSuccess("");
    
    // Set initial profile values
    setName(user.user_metadata?.name || "");
    setPhone(user.user_metadata?.phone || "");

    fetchData();
  }, [user, isOpen]);

  const fetchData = async () => {
    if (!user) return;
    const hasKeys = isSupabaseConfigured();

    if (hasKeys) {
      try {
        setLoading(true);
        // 1. Fetch Profile Details
        const { data: profile, error: pError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profile) {
          setName(profile.name);
          setPhone(profile.phone || "");
        }

        // 2. Fetch Addresses
        const { data: addrList, error: aError } = await supabase
          .from("addresses")
          .select("*")
          .eq("profile_id", user.id)
          .order("id", { ascending: false });

        if (addrList) setAddresses(addrList);

        // 3. Fetch Orders & Items
        const { data: orderList, error: oError } = await supabase
          .from("orders")
          .select("*, order_items(*)")
          .eq("profile_id", user.id)
          .order("created_at", { ascending: false });

        if (orderList) setOrders(orderList);

      } catch (err) {
        console.error("Error fetching user data:", err);
      } finally {
        setLoading(false);
      }
    } else {
      // Offline Simulation Loading
      setLoading(true);
      setTimeout(() => {
        // Load simulated addresses
        const simAddr = JSON.parse(localStorage.getItem(`stax_sim_addr_${user.id}`)) || [];
        setAddresses(simAddr);

        // Load simulated orders from fallback JSON / localStorage
        const simOrders = JSON.parse(localStorage.getItem("stax_cart_orders")) || [];
        // Filter orders by email
        const userOrders = simOrders.filter(o => o.email === user.email);
        setOrders(userOrders);
        setLoading(false);
      }, 500);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (!name.trim()) {
      setError("Name is required.");
      setLoading(false);
      return;
    }

    const hasKeys = isSupabaseConfigured();

    if (hasKeys) {
      try {
        const { error: updateError } = await supabase
          .from("profiles")
          .update({ name, phone })
          .eq("id", user.id);

        if (updateError) throw updateError;

        // Also update Auth metadata session values
        await supabase.auth.updateUser({
          data: { name, phone }
        });

        setSuccess("Profile updated successfully!");
      } catch (err) {
        setError(err.message || "Failed to update profile.");
      } finally {
        setLoading(false);
      }
    } else {
      // Simulated Save
      setTimeout(() => {
        const updatedSimUser = {
          ...user,
          user_metadata: { ...user.user_metadata, name, phone }
        };
        localStorage.setItem("stax_simulated_user", JSON.stringify(updatedSimUser));
        setSuccess("Profile updated in simulation sandbox!");
        setLoading(false);
      }, 500);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!street.trim() || !city.trim() || !state.trim() || !zip.trim()) {
      setError("All address fields are required.");
      return;
    }

    const hasKeys = isSupabaseConfigured();

    if (hasKeys) {
      try {
        setLoading(true);
        const { data, error: addError } = await supabase
          .from("addresses")
          .insert({
            profile_id: user.id,
            full_address: street,
            city,
            state,
            postal_code: zip,
          })
          .select();

        if (addError) throw addError;

        setAddresses(prev => [data[0], ...prev]);
        setStreet("");
        setCity("");
        setState("");
        setZip("");
        setSuccess("Address saved successfully!");
      } catch (err) {
        setError(err.message || "Failed to save address.");
      } finally {
        setLoading(false);
      }
    } else {
      // Simulated Add Address
      const newAddr = {
        id: "addr_sim_" + Date.now(),
        profile_id: user.id,
        full_address: street,
        city,
        state,
        postal_code: zip,
      };

      const updated = [newAddr, ...addresses];
      setAddresses(updated);
      localStorage.setItem(`stax_sim_addr_${user.id}`, JSON.stringify(updated));
      
      setStreet("");
      setCity("");
      setState("");
      setZip("");
      setSuccess("Address saved locally!");
    }
  };

  const handleDeleteAddress = async (addrId) => {
    setError("");
    setSuccess("");
    const hasKeys = isSupabaseConfigured();

    if (hasKeys) {
      try {
        setLoading(true);
        const { error: delError } = await supabase
          .from("addresses")
          .delete()
          .eq("id", addrId);

        if (delError) throw delError;

        setAddresses(prev => prev.filter(a => a.id !== addrId));
        setSuccess("Address removed.");
      } catch (err) {
        setError(err.message || "Failed to remove address.");
      } finally {
        setLoading(false);
      }
    } else {
      // Simulated Delete Address
      const updated = addresses.filter(a => a.id !== addrId);
      setAddresses(updated);
      localStorage.setItem(`stax_sim_addr_${user.id}`, JSON.stringify(updated));
      setSuccess("Address removed locally.");
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Received":
        return "bg-yellow-500/10 border-yellow-500/30 text-yellow-400";
      case "Preparing":
      case "Cooking":
        return "bg-orange-500/10 border-orange-500/30 text-orange-400";
      case "Out for Delivery":
        return "bg-blue-500/10 border-blue-500/30 text-blue-400";
      case "Delivered":
        return "bg-green-500/10 border-green-500/30 text-green-400";
      default:
        return "bg-white/10 border-white/5 text-white/50";
    }
  };

  const backdropVariants = {
    closed: { opacity: 0 },
    open: { opacity: 1 },
  };

  const modalVariants = {
    closed: { scale: 0.95, opacity: 0, y: 20 },
    open: { scale: 1, opacity: 1, y: 0, transition: { type: "spring", stiffness: 350, damping: 25 } },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop Overlay */}
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={backdropVariants}
            onClick={onClose}
            className="fixed inset-0 bg-black/85 backdrop-blur-[12px]"
          />

          {/* Modal Container */}
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={modalVariants}
            className="relative w-full max-w-2xl bg-[#0a0a0a]/90 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.8)] text-white flex flex-col md:flex-row min-h-[500px]"
          >
            {/* Sidebar Navigation */}
            <div className="w-full md:w-56 border-r border-white/5 p-6 flex flex-col justify-between bg-black/30">
              <div className="flex flex-col gap-6 text-left">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#FF7A00]/10 border border-[#FF7A00]/25 flex items-center justify-center text-[#FF7A00] font-heading font-black text-sm uppercase">
                    {name ? name.substring(0, 2) : "C"}
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span className="font-heading font-black text-xs uppercase tracking-wider text-white truncate">{name || "Customer"}</span>
                    <span className="text-[9px] text-white/40 font-bold tracking-widest truncate">{user?.email}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 mt-2">
                  {[
                    { id: "profile", label: "My Profile", icon: User },
                    { id: "orders", label: "Order History", icon: ClipboardList },
                    { id: "addresses", label: "Saved Addresses", icon: MapPin },
                  ].map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setActiveTab(tab.id);
                          setError("");
                          setSuccess("");
                        }}
                        className={`w-full py-3 px-4 rounded-xl text-left text-[11px] font-bold uppercase tracking-widest flex items-center gap-3 transition-all duration-300 border cursor-pointer ${
                          isActive
                            ? "bg-[#FF7A00]/10 border-[#FF7A00]/30 text-[#FF7A00] font-black"
                            : "bg-transparent border-transparent text-white/50 hover:text-white"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="w-full py-3 px-4 bg-transparent hover:bg-red-500/10 border border-transparent hover:border-red-500/20 text-white/40 hover:text-red-400 rounded-xl text-left text-[11px] font-bold uppercase tracking-widest flex items-center gap-3 transition-all duration-300 cursor-pointer mt-6"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 p-8 flex flex-col justify-between overflow-y-auto max-h-[85vh] md:max-h-[600px] no-scrollbar">
              
              {/* Close button in main container header area */}
              <div className="absolute top-6 right-6 z-10">
                <button
                  onClick={onClose}
                  className="w-9 h-9 rounded-full border border-white/10 hover:border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/5 cursor-pointer transition-all duration-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Tab Bodies */}
              <div className="flex-1 text-left">
                {error && (
                  <div className="text-red-400 font-bold text-xs bg-red-500/10 border border-red-500/20 rounded-xl p-3.5 mb-6">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="text-green-400 font-bold text-xs bg-green-500/10 border border-green-500/20 rounded-xl p-3.5 mb-6">
                    {success}
                  </div>
                )}

                {/* PROFILE TAB */}
                {activeTab === "profile" && (
                  <form onSubmit={handleUpdateProfile} className="flex flex-col gap-5">
                    <h4 className="font-heading font-black text-sm uppercase tracking-wider text-[#FF7A00] m-0 border-b border-white/5 pb-3">
                      Profile Details
                    </h4>
                    
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-white/50 uppercase tracking-wider flex items-center gap-1.5 pl-1">
                        <User className="w-3.5 h-3.5 text-[#FF7A00]" /> Full Name
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-[#121212] border border-white/10 focus:border-[#FF7A00] rounded-xl px-4 py-3.5 text-white text-xs outline-none transition-all duration-300"
                        placeholder="Anshu Sharma"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-white/50 uppercase tracking-wider flex items-center gap-1.5 pl-1">
                        <Phone className="w-3.5 h-3.5 text-[#FF7A00]" /> Contact Phone
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-[#121212] border border-white/10 focus:border-[#FF7A00] rounded-xl px-4 py-3.5 text-white text-xs outline-none transition-all duration-300"
                        placeholder="9876543210"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-white/30 uppercase tracking-wider flex items-center gap-1.5 pl-1">
                        <Mail className="w-3.5 h-3.5 text-white/20" /> Email (Account ID)
                      </label>
                      <input
                        type="email"
                        value={user?.email || ""}
                        disabled
                        className="w-full bg-[#121212]/40 border border-white/5 rounded-xl px-4 py-3.5 text-white/30 text-xs outline-none cursor-not-allowed"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 bg-gradient-to-r from-[#FF7A00] to-[#FFB347] hover:scale-102 text-black font-heading font-black text-xs uppercase tracking-widest rounded-xl transition-all duration-300 border-none cursor-pointer mt-4"
                    >
                      {loading ? "Saving changes..." : "Save Profile Details"}
                    </button>
                  </form>
                )}

                {/* ADDRESSES TAB */}
                {activeTab === "addresses" && (
                  <div className="flex flex-col gap-6">
                    <h4 className="font-heading font-black text-sm uppercase tracking-wider text-[#FF7A00] m-0 border-b border-white/5 pb-3">
                      Saved Delivery Addresses
                    </h4>

                    {/* Add new Address Form */}
                    <form onSubmit={handleAddAddress} className="bg-[#121212]/30 border border-white/5 rounded-2xl p-5 flex flex-col gap-4">
                      <span className="text-[9px] text-[#FF7A00] font-black uppercase tracking-widest">Add New Coordinates</span>
                      
                      <input
                        type="text"
                        placeholder="Street Address, Area, Landmark"
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                        className="w-full bg-[#121212] border border-white/10 focus:border-[#FF7A00] rounded-xl px-4 py-3 text-white text-xs outline-none transition-all duration-300"
                      />

                      <div className="grid grid-cols-3 gap-3">
                        <input
                          type="text"
                          placeholder="City"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="w-full bg-[#121212] border border-white/10 focus:border-[#FF7A00] rounded-xl px-4 py-3 text-white text-xs outline-none transition-all duration-300"
                        />
                        <input
                          type="text"
                          placeholder="State"
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                          className="w-full bg-[#121212] border border-white/10 focus:border-[#FF7A00] rounded-xl px-4 py-3 text-white text-xs outline-none transition-all duration-300"
                        />
                        <input
                          type="text"
                          placeholder="PIN Code"
                          value={zip}
                          onChange={(e) => setZip(e.target.value)}
                          className="w-full bg-[#121212] border border-white/10 focus:border-[#FF7A00] rounded-xl px-4 py-3 text-white text-xs outline-none transition-all duration-300"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="py-3 bg-transparent hover:bg-white/5 border border-white/15 hover:border-white/30 text-white font-heading font-black text-[10px] uppercase tracking-widest rounded-xl transition-all duration-300 cursor-pointer self-end px-6"
                      >
                        Save Coordinates
                      </button>
                    </form>

                    {/* Address List */}
                    <div className="flex flex-col gap-3 max-h-[200px] overflow-y-auto no-scrollbar pr-1">
                      {addresses.length > 0 ? (
                        addresses.map((addr) => (
                          <div key={addr.id} className="bg-[#121212]/50 border border-white/5 rounded-2xl p-4 flex items-center justify-between gap-4">
                            <div className="flex items-start gap-3">
                              <MapPin className="w-4 h-4 text-[#FF7A00] flex-shrink-0 mt-0.5" />
                              <div className="flex flex-col text-xs leading-relaxed font-medium">
                                <span className="text-white font-bold">{addr.full_address}</span>
                                <span className="text-white/40 text-[10px] mt-0.5">{addr.city}, {addr.state} — {addr.postal_code}</span>
                              </div>
                            </div>
                            <button
                              onClick={() => handleDeleteAddress(addr.id)}
                              className="bg-transparent border-none text-white/30 hover:text-red-400 p-2 cursor-pointer transition-colors duration-200"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))
                      ) : (
                        <div className="py-8 text-center text-white/20 text-xs font-semibold uppercase tracking-wider">
                          No saved addresses found
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ORDER HISTORY TAB */}
                {activeTab === "orders" && (
                  <div className="flex flex-col gap-6">
                    <h4 className="font-heading font-black text-sm uppercase tracking-wider text-[#FF7A00] m-0 border-b border-white/5 pb-3">
                      Your Order History
                    </h4>

                    <div className="flex flex-col gap-4 max-h-[350px] overflow-y-auto no-scrollbar pr-1">
                      {orders.length > 0 ? (
                        orders.map((ord) => (
                          <div key={ord.id || ord._id} className="bg-[#121212]/50 border border-white/5 rounded-3xl p-5 text-left flex flex-col gap-3 shadow-lg">
                            <div className="flex justify-between items-center pb-2.5 border-b border-white/5 text-xs font-bold">
                              <div>
                                <span className="text-[8px] text-white/30 uppercase tracking-widest block font-bold">Order Code</span>
                                <span className="text-[#FF7A00] uppercase font-black font-heading tracking-wide mt-0.5 block">{ord.order_number || ord._id}</span>
                              </div>
                              <div className="text-right">
                                <span className="text-[8px] text-white/30 uppercase tracking-widest block font-bold">Paid Total</span>
                                <span className="text-white mt-0.5 block">₹{ord.total}</span>
                              </div>
                            </div>

                            {/* Items List inside card */}
                            <div className="flex flex-col gap-2.5 my-1">
                              {/* If DB items exist */}
                              {(ord.order_items || ord.items || []).map((itm, i) => (
                                <div key={i} className="flex justify-between items-center text-[11px] text-white/70">
                                  <span>{itm.product_name || itm.name} <span className="text-[#FF7A00] font-black text-[9px] uppercase pl-1">x{itm.quantity || itm.qty}</span></span>
                                  <span>₹{parseInt((itm.price || "0").toString().replace("₹", "")) * (itm.quantity || itm.qty)}</span>
                                </div>
                              ))}
                            </div>

                            <div className="flex justify-between items-center pt-2.5 border-t border-white/5 mt-1">
                              <span className={`border text-[8px] font-heading font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${getStatusStyle(ord.status)}`}>
                                {ord.status}
                              </span>

                              <a
                                href={`/order/${ord.id || ord._id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-[#121212] hover:bg-[#FF7A00]/10 border border-white/10 hover:border-[#FF7A00]/30 text-white hover:text-[#FF7A00] font-heading font-black text-[9px] uppercase tracking-widest px-4 py-2.5 rounded-xl transition-all duration-300 no-underline"
                              >
                                Track Live
                              </a>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="py-16 text-center">
                          <ClipboardList className="w-10 h-10 text-white/10 mx-auto mb-3" />
                          <p className="text-white/30 font-heading font-black text-sm uppercase tracking-wider mb-1">
                            No orders placed yet
                          </p>
                          <a
                            href="#signature-section"
                            onClick={onClose}
                            className="text-[#FF7A00] font-bold text-xs uppercase tracking-widest hover:underline no-underline mt-2 inline-block"
                          >
                            Explore Menu & Order
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

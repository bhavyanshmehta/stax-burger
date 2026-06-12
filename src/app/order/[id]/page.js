"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Flame, 
  MapPin, 
  Phone, 
  User, 
  ShoppingBag, 
  Clock, 
  CheckCircle2, 
  ArrowLeft,
  Bike
} from "lucide-react";

export default function OrderTracking() {
  const params = useParams();
  const id = params?.id;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const steps = [
    { id: "Received", label: "Order Received", desc: "Our chef is preparing to stack" },
    { id: "Cooking", label: "Flame Grilling", desc: "Sizzling over direct open flame" },
    { id: "Out for Delivery", label: "Out for Delivery", desc: "STAX rider is on the way" },
    { id: "Delivered", label: "Delivered", desc: "Enjoy your hot fresh stacks!" }
  ];

  const getStepIndex = (status) => {
    return steps.findIndex(step => step.id === status);
  };

  useEffect(() => {
    if (!id) return;

    let isMounted = true;

    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/orders/${id}`);
        const data = await res.json();
        if (isMounted) {
          if (data.success) {
            setOrder(data.order);
            setError("");
          } else {
            setError(data.message || "Failed to load order");
          }
          setLoading(false);
        }
      } catch (err) {
        console.error("Tracking fetch error:", err);
        if (isMounted) {
          setError("Connection error. Retrying...");
          setLoading(false);
        }
      }
    };

    fetchOrder();

    // Start polling every 5 seconds
    const interval = setInterval(fetchOrder, 5000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 rounded-full border-2 border-[#FF7A00] border-t-transparent animate-spin" />
        <span className="font-heading font-black text-xs uppercase tracking-widest text-white/50">
          Syncing tracking feed...
        </span>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-6 px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
          <Flame className="w-8 h-8" />
        </div>
        <div>
          <h3 className="font-heading font-black text-2xl uppercase tracking-wider mb-2">Order Not Found</h3>
          <p className="text-white/40 text-sm max-w-xs">{error || "This order code does not match any operational logs."}</p>
        </div>
        <a
          href="/"
          className="bg-[#FF7A00] hover:bg-[#FFB347] text-black font-heading font-black text-xs uppercase tracking-widest px-6 py-3.5 rounded-full transition-all duration-300 no-underline"
        >
          Back to Homepage
        </a>
      </div>
    );
  }

  const currentStepIndex = getStepIndex(order.status);

  return (
    <div className="min-h-screen bg-black text-white py-16 px-6 md:px-12 relative overflow-hidden select-none">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#FF7A00]/5 rounded-full filter blur-[150px] pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        
        {/* Navigation Bar */}
        <div className="flex justify-between items-center mb-12">
          <a
            href="/"
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest no-underline"
          >
            <ArrowLeft className="w-4 h-4 text-[#FF7A00]" /> Back to Home
          </a>
          <div className="flex items-center gap-1 bg-[#121212] border border-white/5 px-4 py-2 rounded-full">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
            <span className="text-[10px] text-white/50 uppercase tracking-widest font-black">Live Tracking</span>
          </div>
        </div>

        {/* Header Title */}
        <div className="flex flex-col gap-2 mb-10 text-left">
          <span className="text-[#FF7A00] font-heading font-black text-xs uppercase tracking-widest">
            STAX Order Pipeline
          </span>
          <h1 className="font-heading font-black text-4xl md:text-5xl text-white uppercase tracking-tighter leading-none m-0">
            Track Your Stack
          </h1>
          <p className="text-white/40 text-xs font-medium uppercase tracking-wider mt-1">
            Order Code: <span className="text-[#FF7A00] font-black font-heading tracking-wide uppercase">{order.order_number || order._id}</span>
            <span className="mx-2 text-white/20">•</span>
            Est. Delivery: <span className="text-white font-bold">{order.estimatedTime || "30 mins"}</span>
          </p>
        </div>

        {/* Stepper Card */}
        <div className="bg-[#0c0c0c] border border-white/5 rounded-[2.5rem] p-8 md:p-10 mb-10 shadow-[0_15px_40px_rgba(0,0,0,0.6)]">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            
            {/* Connecting progress line on Desktop */}
            <div className="hidden md:block absolute top-[22px] left-[12.5%] right-[12.5%] h-0.5 bg-white/5 z-0">
              <motion.div 
                className="h-full bg-gradient-to-r from-[#FF7A00] to-[#FFB347] shadow-[0_0_8px_#FF7A00]"
                initial={{ width: 0 }}
                animate={{ width: `${(currentStepIndex / 3) * 100}%` }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
              />
            </div>

            {steps.map((step, idx) => {
              const isCompleted = idx < currentStepIndex;
              const isActive = idx === currentStepIndex;
              const isPending = idx > currentStepIndex;

              return (
                <div key={step.id} className="flex md:flex-col items-center md:text-center gap-4 md:gap-6 relative z-10">
                  {/* Indicator circle */}
                  <div 
                    className={`w-11 h-11 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                      isCompleted 
                        ? "bg-[#FF7A00] border-[#FF7A00] text-black shadow-[0_0_15px_rgba(255,122,0,0.45)]"
                        : isActive
                        ? "bg-black border-[#FF7A00] text-[#FF7A00] shadow-[0_0_20px_rgba(255,122,0,0.3)] scale-110"
                        : "bg-[#121212] border-white/10 text-white/25"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                    ) : (
                      <span className="font-heading font-black text-xs">{idx + 1}</span>
                    )}
                  </div>

                  {/* Labels */}
                  <div className="flex flex-col items-start md:items-center text-left md:text-center gap-0.5">
                    <span className={`text-sm font-heading font-black uppercase tracking-wider transition-colors duration-500 ${
                      isActive ? "text-[#FF7A00]" : isPending ? "text-white/30" : "text-white"
                    }`}>
                      {step.label}
                    </span>
                    <span className="text-[10px] text-white/40 leading-relaxed font-semibold">
                      {step.desc}
                    </span>
                  </div>
                </div>
              );
            })}

          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Deliver to Details & Rider Status */}
          <div className="md:col-span-2 flex flex-col gap-8">
            
            {/* Delivery address details */}
            <div className="bg-[#0c0c0c] border border-white/5 rounded-[2.5rem] p-8 text-left flex flex-col gap-6">
              <h3 className="font-heading font-black text-base uppercase tracking-wider text-[#FF7A00] m-0 border-b border-white/5 pb-4">
                Delivery Details
              </h3>
              
              <div className="flex flex-col gap-4 text-sm font-medium">
                <div className="flex items-start gap-3.5">
                  <User className="w-5 h-5 text-white/30 flex-shrink-0 mt-0.5" />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-white/40 text-[9px] uppercase tracking-widest font-bold">Recipient</span>
                    <span className="text-white font-bold">{order.name}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <Phone className="w-5 h-5 text-white/30 flex-shrink-0 mt-0.5" />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-white/40 text-[9px] uppercase tracking-widest font-bold">Contact Number</span>
                    <span className="text-white font-bold">{order.phone}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <MapPin className="w-5 h-5 text-white/30 flex-shrink-0 mt-0.5" />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-white/40 text-[9px] uppercase tracking-widest font-bold">Address</span>
                    <span className="text-white/80 leading-relaxed">{order.address}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Rider Card */}
            {currentStepIndex >= 2 && (
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#0c0c0c] border border-[#FF7A00]/20 rounded-[2.5rem] p-6 text-left flex items-center justify-between gap-6 shadow-[0_10px_25px_rgba(255,122,0,0.05)] relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-[#FF7A00]/[0.01] pointer-events-none" />
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-[#121212] border border-white/10 flex items-center justify-center text-[#FF7A00] relative">
                    <Bike className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="text-white/30 uppercase tracking-widest font-bold text-[8.5px] block">Your STAX Rider</span>
                    <span className="font-heading font-black text-sm uppercase text-white block mt-0.5">Rahul Sharma</span>
                    <span className="text-[10px] text-white/50 font-bold block mt-0.5">Dispatched from GT Central Jaipur</span>
                  </div>
                </div>
                
                <a 
                  href={`tel:${order.phone}`} 
                  className="bg-[#121212] hover:bg-[#FF7A00]/10 border border-white/10 hover:border-[#FF7A00]/40 p-3.5 rounded-full transition-all duration-300 text-white hover:text-[#FF7A00]"
                >
                  <Phone className="w-4 h-4" />
                </a>
              </motion.div>
            )}

          </div>

          {/* Order Summary Receipt */}
          <div className="bg-[#0c0c0c] border border-white/5 rounded-[2.5rem] p-8 text-left flex flex-col justify-between">
            <div className="flex flex-col gap-6">
              <h3 className="font-heading font-black text-base uppercase tracking-wider text-[#FF7A00] m-0 border-b border-white/5 pb-4 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4" /> Order Summary
              </h3>

              {/* Items List */}
              <div className="flex flex-col gap-4 max-h-[240px] overflow-y-auto pr-1 no-scrollbar">
                {order.items.map((item, i) => (
                  <div key={i} className="flex justify-between items-center gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 p-1 flex items-center justify-center flex-shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="text-xs font-bold text-white leading-tight line-clamp-1">{item.name}</span>
                        <span className="text-[9px] text-[#FF7A00] font-black uppercase mt-0.5">x{item.qty}</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-white/80">{item.price}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Calculations breakdown */}
            <div className="border-t border-white/5 pt-5 mt-6 flex flex-col gap-2.5 text-xs">
              <div className="flex justify-between items-center text-white/50">
                <span>Subtotal</span>
                <span>₹{order.subtotal}</span>
              </div>
              <div className="flex justify-between items-center text-white/50">
                <span>GST (18%)</span>
                <span>₹{order.tax}</span>
              </div>
              <div className="flex justify-between items-center text-white/50">
                <span>Payment Method</span>
                <span className="font-bold text-white">{order.paymentMethod === "Online" ? "Paid Online" : "Cash on Delivery (COD)"}</span>
              </div>
              <div className="flex justify-between items-center pt-2.5 border-t border-white/5 text-sm font-heading font-black text-white">
                <span className="uppercase">Paid Total</span>
                <span className="text-[#FF7A00] text-lg">₹{order.total}</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

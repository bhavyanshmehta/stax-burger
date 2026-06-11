"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, Trash2, ShoppingBag } from "lucide-react";

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQty,
  onRemoveItem,
  onCheckout,
}) {
  // Calculations
  const subtotal = cartItems.reduce(
    (sum, item) => sum + parseInt(item.price.replace("₹", "")) * item.qty,
    0
  );
  const tax = Math.round(subtotal * 0.18); // 18% GST
  const total = subtotal + tax;

  // Drawer Animation variants
  const drawerVariants = {
    closed: { x: "100%", transition: { type: "spring", stiffness: 300, damping: 30 } },
    open: { x: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
  };

  const backdropVariants = {
    closed: { opacity: 0 },
    open: { opacity: 1 },
  };

  const handleExploreMenu = () => {
    onClose();
    document.getElementById("signature-section")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={backdropVariants}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-[8px] z-[100]"
          />

          {/* Slide-out Drawer */}
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={drawerVariants}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-black/80 backdrop-blur-2xl border-l border-white/5 shadow-2xl flex flex-col z-[101] text-white"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#FF7A00] flex items-center justify-center shadow-[0_0_15px_rgba(255,122,0,0.4)]">
                  <ShoppingBag className="w-4.5 h-4.5 text-black" />
                </div>
                <h2 className="font-heading font-black text-lg uppercase tracking-wider text-white m-0">
                  Your Stack
                </h2>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full border border-white/10 hover:border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/5 cursor-pointer transition-all duration-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 no-scrollbar">
              <AnimatePresence initial={false}>
                {cartItems.length > 0 ? (
                  cartItems.map((item) => {
                    const priceNum = parseInt(item.price.replace("₹", ""));
                    const itemSubtotal = priceNum * item.qty;

                    return (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 100, height: 0, margin: 0, padding: 0 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white/[0.02] border border-white/5 hover:border-[#FF7A00]/20 rounded-2xl p-4 flex gap-4 relative overflow-hidden group"
                      >
                        {/* Glowing highlight */}
                        <div className="absolute inset-0 bg-gradient-to-r from-[#FF7A00]/0 to-[#FF7A00]/[0.02] pointer-events-none" />

                        {/* Product Image Frame */}
                        <div className="w-20 h-20 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center p-2 relative overflow-hidden flex-shrink-0">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300 pointer-events-none"
                          />
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 flex flex-col justify-between text-left">
                          <div>
                            <h4 className="font-heading font-black text-sm uppercase text-white tracking-wide m-0 line-clamp-1">
                              {item.name}
                            </h4>
                            <p className="text-[10px] text-white/40 font-semibold uppercase tracking-wider mt-0.5">
                              {item.price} each
                            </p>
                          </div>

                          {/* Quantity and Actions Row */}
                          <div className="flex items-center justify-between mt-2">
                            {/* Quantity Selector */}
                            <div className="flex items-center gap-3 bg-black/40 border border-white/5 rounded-lg px-2 py-1">
                              <button
                                onClick={() => onUpdateQty(item.id, -1)}
                                className="w-6 h-6 rounded-md hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white cursor-pointer border-none"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-4 text-center font-heading font-black text-xs text-[#FF7A00]">
                                {item.qty}
                              </span>
                              <button
                                onClick={() => onUpdateQty(item.id, 1)}
                                className="w-6 h-6 rounded-md hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white cursor-pointer border-none"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            {/* Subtotal & Remove */}
                            <div className="flex items-center gap-3">
                              <span className="font-heading font-black text-sm text-white">
                                ₹{itemSubtotal}
                              </span>
                              <button
                                onClick={() => onRemoveItem(item.id)}
                                className="text-white/30 hover:text-red-500 hover:bg-red-500/10 p-1.5 rounded-lg transition-all duration-300 border-none cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                ) : (
                  /* Empty Cart State */
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1 flex flex-col items-center justify-center py-12 text-center"
                  >
                    {/* Stylized Empty Burger Grill SVG Illustration */}
                    <div className="w-40 h-40 mb-6 relative flex items-center justify-center">
                      <div className="absolute inset-0 bg-[#FF7A00]/5 rounded-full filter blur-[20px] pointer-events-none" />
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 200 200"
                        className="w-32 h-32 text-white/10"
                      >
                        {/* Upper Bun Silhouette */}
                        <path
                          d="M40,90 Q40,40 100,40 Q160,40 160,90 Z"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="6"
                          strokeLinecap="round"
                          className="opacity-25"
                        />
                        {/* Grill Lines */}
                        <line x1="30" y1="110" x2="170" y2="110" stroke="#FF7A00" strokeWidth="6" strokeLinecap="round" className="opacity-75" />
                        <line x1="50" y1="125" x2="150" y2="125" stroke="currentColor" strokeWidth="6" strokeLinecap="round" className="opacity-25" />
                        {/* Sparkles */}
                        <circle cx="80" cy="70" r="3" fill="#FF7A00" className="animate-pulse" />
                        <circle cx="120" cy="65" r="4" fill="#FF7A00" className="animate-pulse" />
                      </svg>
                    </div>

                    <h3 className="font-heading font-black text-xl text-white uppercase tracking-wider mb-2">
                      Your Stack is Empty
                    </h3>
                    <p className="text-white/40 text-xs leading-relaxed max-w-xs mb-6 font-medium">
                      You haven't stacked any delicious flame-crafted burgers yet. Start building now!
                    </p>

                    <button
                      onClick={handleExploreMenu}
                      className="bg-transparent hover:bg-white/5 border border-[#FF7A00]/40 text-[#FF7A00] hover:text-white hover:border-white font-heading font-black text-xs uppercase tracking-widest px-6 py-3.5 rounded-full transition-all duration-300 cursor-pointer"
                    >
                      Explore Menu
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer Summary & Checkout */}
            {cartItems.length > 0 && (
              <div className="p-6 border-t border-white/5 bg-black/40 backdrop-blur-md">
                <div className="flex flex-col gap-2.5 mb-6 text-sm">
                  <div className="flex justify-between items-center text-white/50">
                    <span>Subtotal</span>
                    <span className="font-semibold">₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between items-center text-white/50">
                    <span>GST (18%)</span>
                    <span className="font-semibold">₹{tax}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2.5 border-t border-white/5">
                    <span className="font-heading font-black text-base uppercase text-white">Total</span>
                    <span className="font-heading font-black text-2xl text-[#FF7A00] drop-shadow-[0_0_8px_rgba(255,122,0,0.2)]">
                      ₹{total}
                    </span>
                  </div>
                </div>

                <button
                  onClick={onCheckout}
                  className="w-full py-4 bg-gradient-to-r from-[#FF7A00] to-[#FFB347] hover:scale-102 text-black font-heading font-black text-xs uppercase tracking-widest rounded-2xl shadow-[0_4px_25px_rgba(255,122,0,0.35)] transition-all duration-300 border-none cursor-pointer flex items-center justify-center gap-2"
                >
                  Proceed to Checkout
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

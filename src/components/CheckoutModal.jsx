"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, MapPin, Phone, Mail, User, ClipboardList, Flame } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export default function CheckoutModal({
  isOpen,
  onClose,
  cartItems,
  onClearCart,
  user,
}) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [createdOrder, setCreatedOrder] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");

  // Payment integration states
  const [paymentStatus, setPaymentStatus] = useState(null); // null, 'processing', 'success', 'failed', 'cancelled'
  const [paymentError, setPaymentError] = useState("");
  const [razorpayOrderId, setRazorpayOrderId] = useState("");
  const [razorpayKeyId, setRazorpayKeyId] = useState("");

  // Saved Addresses
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (user) {
        setFormData((prev) => ({
          ...prev,
          name: user.user_metadata?.name || prev.name,
          email: user.email || prev.email,
          phone: user.user_metadata?.phone || prev.phone,
        }));
        fetchAddresses();
      } else {
        setFormData({ name: "", email: "", phone: "", address: "" });
        setSavedAddresses([]);
        setSelectedAddressId("");
      }
      // Reset payment variables on modal re-open
      setPaymentStatus(null);
      setPaymentError("");
      setRazorpayOrderId("");
      setRazorpayKeyId("");
    }
  }, [user, isOpen]);

  const fetchAddresses = async () => {
    if (!user) return;
    const hasKeys = isSupabaseConfigured();
    if (hasKeys) {
      try {
        const { data, error } = await supabase
          .from("addresses")
          .select("*")
          .eq("profile_id", user.id)
          .order("id", { ascending: false });
        if (data) setSavedAddresses(data);
      } catch (err) {
        console.error("Error fetching checkout addresses:", err);
      }
    } else {
      const simAddr = JSON.parse(localStorage.getItem(`stax_sim_addr_${user.id}`)) || [];
      setSavedAddresses(simAddr);
    }
  };

  // Calculations
  const subtotal = cartItems.reduce(
    (sum, item) => sum + parseInt(item.price.replace("₹", "")) * item.qty,
    0
  );
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + tax;

  const validate = () => {
    const tempErrors = {};
    if (!formData.name.trim()) tempErrors.name = "Name is required";
    if (!formData.email.trim()) {
      tempErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      tempErrors.email = "Invalid email format";
    }
    if (!formData.phone.trim()) {
      tempErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phone.replace(/[^0-9]/g, ""))) {
      tempErrors.phone = "Phone number must be 10 digits";
    }
    if (!formData.address.trim()) tempErrors.address = "Delivery address is required";

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (typeof window === "undefined") {
        resolve(false);
        return;
      }
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const openRazorpayWidget = (keyId, rzpOrder) => {
    const options = {
      key: keyId,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      name: "STAX Burger Co.",
      description: "Premium Flame-Grilled Burger Order",
      order_id: rzpOrder.id,
      handler: async function (response) {
        setPaymentStatus("processing");
        try {
          // Register and verify the finalized order on the server
          const orderRes = await fetch("/api/orders", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: formData.name,
              email: formData.email,
              phone: formData.phone,
              address: formData.address,
              items: cartItems,
              subtotal: subtotal,
              tax: tax,
              total: total,
              paymentMethod: "Online",
              profileId: user ? user.id : null,
              isSimulated: false,
              paymentDetails: {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              },
            }),
          });
          const orderData = await orderRes.json();
          if (orderData.success) {
            setOrderId(orderData.order._id || orderData.order.id);
            setCreatedOrder(orderData.order);
            setPaymentStatus("success");
            setIsSubmitted(true);
            
            // Log local simulated orders if fallback online order is registered
            if (orderData.isFallback) {
              const simOrders = JSON.parse(localStorage.getItem("stax_cart_orders") || "[]");
              simOrders.unshift(orderData.order);
              localStorage.setItem("stax_cart_orders", JSON.stringify(simOrders));
            }
          } else {
            setPaymentStatus("failed");
            setPaymentError(orderData.error || "Payment verification failed.");
          }
        } catch (error) {
          console.error("Order completion error:", error);
          setPaymentStatus("failed");
          setPaymentError("Failed to communicate with server for verification. Please contact support.");
        }
      },
      prefill: {
        name: formData.name,
        email: formData.email,
        contact: formData.phone,
      },
      theme: {
        color: "#FF7A00",
      },
      modal: {
        ondismiss: function () {
          setPaymentStatus("cancelled");
          setPaymentError("Checkout window closed. Transaction was cancelled.");
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", function (response) {
      setPaymentStatus("failed");
      setPaymentError(response.error.description || "Razorpay transaction failed.");
    });
    rzp.open();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setApiError("");
    setPaymentError("");

    try {
      if (paymentMethod === "Online") {
        // 1. Initiate Razorpay order creation on server
        const payRes = await fetch("/api/payments/razorpay", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ amount: total }),
        });
        const payData = await payRes.json();

        if (payRes.status === 200 && payData.success) {
          const scriptLoaded = await loadRazorpayScript();
          if (!scriptLoaded) {
            setApiError("Failed to initialize payment gateway SDK. Please check your connection.");
            setIsSubmitting(false);
            return;
          }

          setRazorpayKeyId(payData.keyId);
          setRazorpayOrderId(payData.order.id);
          openRazorpayWidget(payData.keyId, payData.order);
        } else {
          setApiError(payData.error || "Failed to initiate online payment session. Please try again or use COD.");
          setIsSubmitting(false);
        }
        return;
      }

      // COD Path
      setPaymentStatus("processing");
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          items: cartItems,
          subtotal: subtotal,
          tax: tax,
          total: total,
          paymentMethod: "COD",
          profileId: user ? user.id : null,
        }),
      });
      const data = await response.json();
      if (data.success) {
        if (data.isFallback) {
          const simOrders = JSON.parse(localStorage.getItem("stax_cart_orders") || "[]");
          simOrders.unshift(data.order);
          localStorage.setItem("stax_cart_orders", JSON.stringify(simOrders));
        }
        setOrderId(data.order._id || data.order.id);
        setCreatedOrder(data.order);
        setPaymentStatus("success");
        setIsSubmitted(true);
      } else {
        setPaymentStatus("failed");
        setPaymentError(data.error || "Failed to place COD order.");
      }
    } catch (error) {
      console.error("Error submitting order:", error);
      setPaymentStatus("failed");
      setPaymentError("A network error occurred. Please verify your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetryPayment = async () => {
    setPaymentStatus(null);
    setPaymentError("");
    setIsSubmitting(true);
    
    if (paymentMethod === "Online") {
      const activeKeyId = razorpayKeyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID;
      if (activeKeyId && razorpayOrderId) {
        // Retry existing real Razorpay transaction
        const scriptLoaded = await loadRazorpayScript();
        if (scriptLoaded) {
          const rzpOrder = {
            id: razorpayOrderId,
            amount: total * 100,
            currency: "INR"
          };
          openRazorpayWidget(activeKeyId, rzpOrder);
          return;
        }
      }
      setPaymentStatus("failed");
      setPaymentError("Unable to retry payment. Missing active session key or order ID.");
      setIsSubmitting(false);
    }
  };

  const handleCloseSuccess = () => {
    const savedOrderId = orderId;
    // Reset states and clear the cart state
    setIsSubmitted(false);
    setPaymentStatus(null);
    setPaymentError("");
    setRazorpayOrderId("");
    setCreatedOrder(null);
    setFormData({ name: "", email: "", phone: "", address: "" });
    onClearCart();
    onClose();

    // Redirect to dynamic tracking page
    if (typeof window !== "undefined" && savedOrderId) {
      window.location.href = `/order/${savedOrderId}`;
    }
  };

  const backdropVariants = {
    closed: { opacity: 0 },
    open: { opacity: 1 },
  };

  const modalVariants = {
    closed: { scale: 0.9, opacity: 0, y: 20 },
    open: { scale: 1, opacity: 1, y: 0, transition: { type: "spring", stiffness: 350, damping: 25 } },
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 overflow-y-auto">
            {/* Backdrop Overlay */}
            <motion.div
              initial="closed"
              animate="open"
              exit="closed"
              variants={backdropVariants}
              onClick={isSubmitted ? handleCloseSuccess : onClose}
              className="fixed inset-0 bg-black/80 backdrop-blur-[12px]"
            />

            {/* Modal Container */}
            <motion.div
              initial="closed"
              animate="open"
              exit="closed"
              variants={modalVariants}
              className="relative w-full max-w-lg bg-[#0a0a0a]/90 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.8)] text-white"
            >
              {/* Background Glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-72 bg-[#FF7A00]/5 rounded-full filter blur-[80px] pointer-events-none" />

              {/* Header */}
              <div className="p-6 border-b border-white/5 flex items-center justify-between relative z-10">
                <h3 className="font-heading font-black text-xl uppercase tracking-wider text-white m-0">
                  {isSubmitted ? "Order Confirmation" : "Checkout Details"}
                </h3>
                <button
                  onClick={isSubmitted ? handleCloseSuccess : onClose}
                  className="w-9 h-9 rounded-full border border-white/10 hover:border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/5 cursor-pointer transition-all duration-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Content Body */}
              <div className="p-8 relative z-10 max-h-[80vh] overflow-y-auto no-scrollbar">
                
                {paymentStatus === "processing" ? (
                  /* Processing Status View */
                  <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                    <div className="w-16 h-16 rounded-full border-4 border-[#FF7A00]/20 border-t-[#FF7A00] animate-spin mb-6" />
                    <h3 className="font-heading font-black text-xl uppercase tracking-wider text-white mb-2">
                      Verifying Payment
                    </h3>
                    <p className="text-white/40 text-xs leading-relaxed max-w-xs font-semibold uppercase tracking-wider animate-pulse">
                      Securing signature hashes and creating order...
                    </p>
                  </div>
                ) : (paymentStatus === "failed" || paymentStatus === "cancelled") ? (
                  /* Failed / Cancelled Status View */
                  <div className="flex flex-col items-center justify-center py-12 px-6 text-center text-white">
                    <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 mb-6 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                      <X className="w-8 h-8" />
                    </div>
                    <h3 className="font-heading font-black text-2xl uppercase tracking-wider text-white mb-2">
                      {paymentStatus === "failed" ? "Payment Failed" : "Payment Cancelled"}
                    </h3>
                    <p className="text-white/40 text-xs leading-relaxed max-w-xs mb-8 font-medium">
                      {paymentError || (paymentStatus === "failed" 
                        ? "Your transaction could not be completed. Please verify your payment source." 
                        : "The payment session was dismissed. No charges were made.")}
                    </p>
                    
                    <div className="flex flex-col gap-3 w-full max-w-xs">
                      <button
                        onClick={handleRetryPayment}
                        className="w-full py-4 bg-gradient-to-r from-[#FF7A00] to-[#FFB347] hover:scale-102 text-black font-heading font-black text-xs uppercase tracking-widest rounded-2xl shadow-[0_4px_25px_rgba(255,122,0,0.35)] transition-all duration-300 border-none cursor-pointer"
                      >
                        Retry Payment
                      </button>
                      <button
                        onClick={() => {
                          setPaymentStatus(null);
                          setPaymentError("");
                          setIsSubmitting(false);
                        }}
                        className="w-full py-4 bg-transparent hover:bg-white/5 border border-white/10 text-white/60 hover:text-white font-heading font-black text-xs uppercase tracking-widest rounded-2xl transition-all duration-300 cursor-pointer"
                      >
                        Modify Order Details
                      </button>
                    </div>
                  </div>
                ) : !isSubmitted ? (
                  /* Checkout Form */
                  <form onSubmit={handleSubmit} className="flex flex-col gap-6 text-left">
                    {/* Name field */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-white/50 uppercase tracking-wider flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-[#FF7A00]" /> Full Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        placeholder="e.g. Anshu Sharma"
                        value={formData.name}
                        onChange={handleInputChange}
                        className={`w-full bg-[#121212] border ${
                          errors.name ? "border-red-500/50" : "border-white/10"
                        } focus:border-[#FF7A00] rounded-xl px-4 py-3.5 text-white text-sm outline-none transition-all duration-300`}
                      />
                      {errors.name && <span className="text-[10px] text-red-400 font-bold">{errors.name}</span>}
                    </div>

                    {/* Email field */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-white/50 uppercase tracking-wider flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-[#FF7A00]" /> Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        placeholder="e.g. anshu@stax.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full bg-[#121212] border ${
                          errors.email ? "border-red-500/50" : "border-white/10"
                        } focus:border-[#FF7A00] rounded-xl px-4 py-3.5 text-white text-sm outline-none transition-all duration-300`}
                      />
                      {errors.email && <span className="text-[10px] text-red-400 font-bold">{errors.email}</span>}
                    </div>

                    {/* Phone field */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-white/50 uppercase tracking-wider flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-[#FF7A00]" /> Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        placeholder="e.g. 9876543210"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={`w-full bg-[#121212] border ${
                          errors.phone ? "border-red-500/50" : "border-white/10"
                        } focus:border-[#FF7A00] rounded-xl px-4 py-3.5 text-white text-sm outline-none transition-all duration-300`}
                      />
                      {errors.phone && <span className="text-[10px] text-red-400 font-bold">{errors.phone}</span>}
                    </div>

                    {/* Address field */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-white/50 uppercase tracking-wider flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#FF7A00]" /> Delivery Address
                      </label>

                      {/* Saved Addresses Dropdown if logged in */}
                      {savedAddresses.length > 0 && (
                        <div className="flex flex-col gap-1.5 mb-1.5 text-left">
                          <select
                            value={selectedAddressId}
                            onChange={(e) => {
                              const val = e.target.value;
                              setSelectedAddressId(val);
                              if (val) {
                                const addr = savedAddresses.find((a) => a.id.toString() === val.toString());
                                if (addr) {
                                  setFormData((prev) => ({
                                    ...prev,
                                    address: `${addr.full_address}, ${addr.city}, ${addr.state} - ${addr.postal_code}`,
                                  }));
                                  if (errors.address) {
                                    setErrors((prev) => ({ ...prev, address: "" }));
                                  }
                                }
                              }
                            }}
                            className="w-full bg-[#121212] border border-white/10 focus:border-[#FF7A00] rounded-xl px-3 py-2.5 text-xs text-white outline-none cursor-pointer"
                          >
                            <option value="">-- Choose from Saved Addresses --</option>
                            {savedAddresses.map((addr) => (
                              <option key={addr.id} value={addr.id}>
                                {addr.full_address.substring(0, 35)}... ({addr.postal_code})
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      <textarea
                        name="address"
                        placeholder="Enter your full street address and landmarks..."
                        value={formData.address}
                        onChange={handleInputChange}
                        rows="3"
                        className={`w-full bg-[#121212] border ${
                          errors.address ? "border-red-500/50" : "border-white/10"
                        } focus:border-[#FF7A00] rounded-xl px-4 py-3 text-white text-sm outline-none transition-all duration-300 resize-none`}
                      />
                      {errors.address && <span className="text-[10px] text-red-400 font-bold">{errors.address}</span>}
                    </div>

                    {/* Payment Method Selector */}
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-bold text-white/50 uppercase tracking-wider">
                        Payment Method
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() => setPaymentMethod("COD")}
                          className={`py-3 rounded-xl font-heading font-black text-[10px] uppercase tracking-wider border transition-all duration-300 cursor-pointer ${
                            paymentMethod === "COD"
                              ? "bg-[#FF7A00]/10 border-[#FF7A00] text-[#FF7A00] shadow-[0_0_15px_rgba(255,122,0,0.15)]"
                              : "bg-[#121212] border-white/10 text-white/50 hover:border-white/20"
                          }`}
                        >
                          Cash on Delivery
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentMethod("Online")}
                          className={`py-3 rounded-xl font-heading font-black text-[10px] uppercase tracking-wider border transition-all duration-300 cursor-pointer ${
                            paymentMethod === "Online"
                              ? "bg-[#FF7A00]/10 border-[#FF7A00] text-[#FF7A00] shadow-[0_0_15px_rgba(255,122,0,0.15)]"
                              : "bg-[#121212] border-white/10 text-white/50 hover:border-white/20"
                          }`}
                        >
                          Online Payment
                        </button>
                      </div>
                    </div>

                    {/* Order summary mini drawer */}
                    <div className="bg-[#121212]/50 border border-white/5 rounded-2xl p-4 flex flex-col gap-2 mt-2">
                      <span className="text-[10px] font-bold text-white/30 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <ClipboardList className="w-3.5 h-3.5" /> Order Summary
                      </span>
                      <div className="flex justify-between items-center text-xs text-white/70">
                        <span>{cartItems.reduce((acc, curr) => acc + curr.qty, 0)} Items</span>
                        <span>₹{subtotal}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs text-white/70">
                        <span>GST & Packing</span>
                        <span>₹{tax}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm font-heading font-black text-[#FF7A00] pt-2 border-t border-white/5 mt-1">
                        <span>Total Amount</span>
                        <span>₹{total}</span>
                      </div>
                    </div>

                    {apiError && (
                      <div className="text-red-400 font-bold text-xs text-center bg-red-500/10 border border-red-500/20 rounded-xl p-3 mt-2">
                        {apiError}
                      </div>
                    )}

                    {/* Place Order Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 bg-gradient-to-r from-[#FF7A00] to-[#FFB347] hover:scale-102 text-black font-heading font-black text-xs uppercase tracking-widest rounded-2xl shadow-[0_4px_25px_rgba(255,122,0,0.35)] transition-all duration-300 border-none cursor-pointer flex items-center justify-center gap-2 mt-2 disabled:opacity-50 disabled:pointer-events-none"
                    >
                      <Flame className={`w-4 h-4 fill-current ${isSubmitting ? "animate-spin" : ""}`} /> 
                      {isSubmitting ? "Initiating Checkout..." : paymentMethod === "Online" ? "Proceed to Payment" : "Place Order"}
                    </button>
                  </form>
                ) : (
                  /* Success Confirmation Ticket */
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center text-center py-4"
                  >
                    <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center text-green-400 mb-6 shadow-[0_0_20px_rgba(34,197,94,0.2)]">
                      <CheckCircle className="w-8 h-8" />
                    </div>

                    <h3 className="font-heading font-black text-2xl text-white uppercase tracking-wider mb-2">
                      Your STAX order has been received.
                    </h3>
                    <p className="text-white/40 text-xs leading-relaxed max-w-xs mb-8 font-medium">
                      Our chef is fire-grilling your burgers right now. Get ready to experience true stack craftsmanship!
                    </p>

                    {/* Receipt Ticket UI */}
                    <div className="w-full bg-[#121212] border border-white/5 rounded-3xl p-6 text-left relative overflow-hidden flex flex-col gap-4 shadow-lg">
                      {/* Ticket scalloped edge design overlay details */}
                      <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#0a0a0a] rounded-full border-r border-white/5" />
                      <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#0a0a0a] rounded-full border-l border-white/5" />

                      <div className="flex justify-between items-center pb-3 border-b border-white/5">
                        <div>
                          <span className="text-[9px] text-white/30 font-bold uppercase tracking-widest block">Order ID</span>
                          <span className="text-sm font-heading font-black text-white">{orderId}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] text-white/30 font-bold uppercase tracking-widest block">Est. Delivery</span>
                          <span className="text-sm font-bold text-[#FF7A00]">{createdOrder?.estimatedTime || "30 mins"}</span>
                        </div>
                      </div>

                      {/* Customer details */}
                      <div className="flex flex-col gap-2 text-xs">
                        <div>
                          <span className="text-white/30 uppercase tracking-widest font-semibold text-[9px] block">Deliver To</span>
                          <span className="font-bold text-white/70 block mt-0.5">{formData.name}</span>
                          <span className="text-white/40 block mt-0.5 line-clamp-1">{formData.address}</span>
                        </div>
                        
                        {createdOrder?.transactionId && (
                          <div className="mt-1 pt-1 border-t border-white/5">
                            <span className="text-white/30 uppercase tracking-widest font-semibold text-[9px] block">Transaction ID</span>
                            <span className="font-mono text-white/70 text-[10px] mt-0.5 block">{createdOrder.transactionId}</span>
                          </div>
                        )}

                        <div className="flex justify-between mt-2 pt-2 border-t border-dashed border-white/10">
                          <div>
                            <span className="text-white/30 uppercase tracking-widest font-semibold text-[9px] block">Contact</span>
                            <span className="text-white/70 font-semibold">{formData.phone}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-white/30 uppercase tracking-widest font-semibold text-[9px] block">Paid Total</span>
                            <span className="font-heading font-black text-white">₹{total}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleCloseSuccess}
                      className="w-full py-4 bg-transparent hover:bg-white/5 border border-white/20 text-white font-heading font-black text-xs uppercase tracking-widest rounded-2xl transition-all duration-300 border-none cursor-pointer mt-8"
                    >
                      Done & Back to Home
                    </button>
                  </motion.div>
                )}

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </>
  );
}

"use client";

import React, { useContext, useState } from "react";
import { AdminContext } from "../layout";
import { 
  Flame, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink, 
  CheckCircle, 
  Truck, 
  ChefHat, 
  BellRing 
} from "lucide-react";

export default function AdminOrdersPage() {
  const { 
    orders, 
    loading, 
    handleStatusChange, 
    handleTimeChange 
  } = useContext(AdminContext);

  const [expandedOrder, setExpandedOrder] = useState(null);

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

  if (loading) {
    return (
      <div className="py-16 text-center text-white/35 font-bold text-xs uppercase tracking-widest">
        Loading Incoming Orders Feed...
      </div>
    );
  }

  return (
    <div className="bg-[#0c0c0c] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl text-left">
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
                      <span className="text-[9px] text-white/30 uppercase tracking-widest font-semibold">
                        {itemsCount} Items • {ord.paymentMethod} •{' '}
                        <span className={`font-bold ${
                          ord.paymentStatus === 'Paid' ? 'text-green-400' :
                          ord.paymentStatus === 'COD' ? 'text-blue-400' :
                          ord.paymentStatus === 'Refunded' ? 'text-purple-400' :
                          ord.paymentStatus === 'Failed' ? 'text-red-400' : 'text-yellow-400'
                        }`}>
                          {ord.paymentStatus || 'Pending'}
                        </span>
                      </span>
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
                        <div>
                          <span className="text-white/30 uppercase tracking-widest text-[8.5px] font-bold block mb-0.5">Payment Method & Status</span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="font-bold text-white text-xs">{ord.paymentMethod}</span>
                            <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                              ord.paymentStatus === 'Paid' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                              ord.paymentStatus === 'COD' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                              ord.paymentStatus === 'Refunded' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                              ord.paymentStatus === 'Failed' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                              'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                            }`}>
                              {ord.paymentStatus || 'Pending'}
                            </span>
                          </div>
                          {ord.transactionId && (
                            <span className="font-mono text-white/40 text-[10px] block mt-1">
                              Tx ID: {ord.transactionId}
                            </span>
                          )}
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
  );
}

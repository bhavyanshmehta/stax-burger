"use client";

import React, { useContext } from "react";
import { AdminContext } from "../layout";
import { DollarSign, ClipboardList, ChefHat, CheckCircle, TrendingUp, CreditCard, ShoppingBag } from "lucide-react";

export default function AdminDashboardPage() {
  const { orders, loading } = useContext(AdminContext);

  if (loading) {
    return (
      <div className="py-16 text-center text-white/35 font-bold text-xs uppercase tracking-widest">
        Compiling Dashboard Metrics...
      </div>
    );
  }

  // Analytics Metrics
  const totalRevenue = orders.reduce((sum, ord) => sum + (ord.total || 0), 0);
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => ["Received", "Preparing", "Cooking", "Out for Delivery"].includes(o.status)).length;
  const completedOrders = orders.filter(o => o.status === "Delivered").length;
  const averageOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  // Breakdown Calculations
  const paymentBreakdown = orders.reduce((acc, ord) => {
    const method = ord.paymentMethod || "COD";
    acc[method] = (acc[method] || 0) + (ord.total || 0);
    return acc;
  }, {});

  const statusBreakdown = orders.reduce((acc, ord) => {
    const status = ord.status || "Received";
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-8 text-left">
      
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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

      {/* Advanced Revenue Analytics section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Core Stats Card */}
        <div className="bg-[#0c0c0c] border border-white/5 rounded-[2rem] p-6 shadow-xl flex flex-col gap-6 md:col-span-2">
          <h3 className="font-heading font-black text-sm uppercase tracking-wider text-white m-0 flex items-center gap-2 pb-4 border-b border-white/5">
            <TrendingUp className="w-4 h-4 text-[#FF7A00]" /> Operational Efficiency
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl text-left">
              <span className="text-[9px] text-white/30 uppercase font-bold tracking-widest block">Average Ticket Size</span>
              <span className="text-xl font-heading font-black text-white mt-1.5 block">₹{averageOrderValue}</span>
              <p className="text-[10px] text-white/40 mt-1 mb-0 leading-relaxed font-semibold">Average billing amount across all processed orders.</p>
            </div>
            
            <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl text-left">
              <span className="text-[9px] text-white/30 uppercase font-bold tracking-widest block">Order Completion Rate</span>
              <span className="text-xl font-heading font-black text-white mt-1.5 block">
                {totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0}%
              </span>
              <p className="text-[10px] text-white/40 mt-1 mb-0 leading-relaxed font-semibold">Ratio of successful handovers to total received orders.</p>
            </div>
          </div>

          <div className="flex flex-col gap-3.5 mt-2">
            <span className="text-[9px] text-white/30 uppercase font-bold tracking-widest block pl-1">Order Status Ratios</span>
            <div className="flex h-3 w-full bg-white/5 rounded-full overflow-hidden">
              {Object.entries(statusBreakdown).map(([status, count], i) => {
                const colors = {
                  Received: "bg-yellow-500",
                  Preparing: "bg-pink-500",
                  Cooking: "bg-orange-500",
                  "Out for Delivery": "bg-blue-500",
                  Delivered: "bg-green-500"
                };
                const percentage = totalOrders > 0 ? (count / totalOrders) * 100 : 0;
                return (
                  <div
                    key={status}
                    style={{ width: `${percentage}%` }}
                    className={`${colors[status] || "bg-red-500"} transition-all duration-500`}
                    title={`${status}: ${count} (${Math.round(percentage)}%)`}
                  />
                );
              })}
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-2 mt-1">
              {Object.entries(statusBreakdown).map(([status, count]) => {
                const colors = {
                  Received: "bg-yellow-500",
                  Preparing: "bg-pink-500",
                  Cooking: "bg-orange-500",
                  "Out for Delivery": "bg-blue-500",
                  Delivered: "bg-green-500"
                };
                return (
                  <div key={status} className="flex items-center gap-1.5 text-[9px] font-bold uppercase text-white/60">
                    <span className={`w-2 h-2 rounded-full ${colors[status] || "bg-red-500"}`} />
                    {status}: {count}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Payment Methods card */}
        <div className="bg-[#0c0c0c] border border-white/5 rounded-[2rem] p-6 shadow-xl flex flex-col gap-6">
          <h3 className="font-heading font-black text-sm uppercase tracking-wider text-white m-0 flex items-center gap-2 pb-4 border-b border-white/5">
            <CreditCard className="w-4 h-4 text-[#FF7A00]" /> Payment Gateways
          </h3>

          <div className="flex flex-col gap-4">
            {Object.keys(paymentBreakdown).length > 0 ? (
              Object.entries(paymentBreakdown).map(([method, amount]) => {
                const percent = totalRevenue > 0 ? Math.round((amount / totalRevenue) * 100) : 0;
                return (
                  <div key={method} className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center text-xs font-bold text-white/80">
                      <span className="uppercase">{method}</span>
                      <span>₹{amount} ({percent}%)</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${percent}%` }}
                        className="h-full bg-gradient-to-r from-[#FF7A00] to-[#FFB347] rounded-full"
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-12 text-center text-white/20 text-xs font-semibold uppercase tracking-wider">
                No payment logs recorded
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Recent Activity summary */}
      <div className="bg-[#0c0c0c] border border-white/5 rounded-[2.5rem] p-6 shadow-xl flex flex-col gap-4">
        <h3 className="font-heading font-black text-sm uppercase tracking-wider text-white m-0 flex items-center gap-2 pb-4 border-b border-white/5">
          <ShoppingBag className="w-4 h-4 text-[#FF7A00]" /> Recent Activity Log
        </h3>
        
        <div className="flex flex-col max-h-[250px] overflow-y-auto no-scrollbar">
          {orders.slice(0, 5).map((ord, i) => (
            <div key={ord._id || i} className="flex justify-between items-center py-3.5 border-b border-white/5 last:border-0 text-xs">
              <div className="flex flex-col text-left gap-0.5">
                <span className="font-bold text-white/80">{ord.name} placed order {ord.order_number || ord._id}</span>
                <span className="text-[10px] text-white/30 font-semibold uppercase">
                  {new Date(ord.created_at || ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} — {new Date(ord.created_at || ord.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="text-right">
                <span className="font-heading font-black text-[#FF7A00]">₹{ord.total}</span>
              </div>
            </div>
          ))}
          {orders.length === 0 && (
            <div className="py-12 text-center text-white/20 text-xs font-semibold uppercase tracking-wider">
              No recent logs recorded
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

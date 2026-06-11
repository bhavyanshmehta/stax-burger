"use client";

import React from "react";
import { Flame, Smartphone, Download, Award, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

export default function MobileApp() {
  return (
    <section id="app" className="py-24 md:py-32 px-6 md:px-12 bg-transparent relative border-b border-white/5 overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-[#FFB347]/5 rounded-full filter blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16 relative z-10">
        {/* Left column: Text details */}
        <div className="w-full md:w-1/2 flex flex-col gap-6 text-center md:text-left text-white">
          <div className="flex items-center justify-center md:justify-start gap-2 text-[#FF7A00] font-heading font-extrabold text-xs uppercase tracking-widest">
            <Smartphone className="w-4 h-4" />
            Sizzle App
          </div>
          
          <h2 className="font-heading font-black text-4xl md:text-6xl uppercase tracking-tighter leading-none m-0 text-white">
            THE STAX APP
          </h2>
          
          <p className="text-white/50 text-base md:text-lg leading-relaxed max-w-xl m-0 font-medium">
            Unlock the ultimate flame-grilled digital workspace. Order customized 3D recipes, track hot thermal deliveries, and earn crown points on every bite.
          </p>

          {/* App specs checklist */}
          <div className="flex flex-col gap-5 mt-4">
            <div className="flex items-start gap-4 text-left">
              <div className="w-10 h-10 rounded-xl bg-[#FF7A00]/10 border border-[#FF7A00]/20 flex items-center justify-center text-[#FF7A00] shrink-0">
                <Flame className="w-5 h-5 fill-current" />
              </div>
              <div>
                <h4 className="text-white font-heading font-extrabold text-base uppercase tracking-tight mb-1">
                  Thermal Express Delivery
                </h4>
                <p className="text-white/40 text-xs leading-relaxed m-0 font-medium">
                  Hot thermal courier tracking ensures your handcrafted burgers go from fire grates to your plate piping hot.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 text-left">
              <div className="w-10 h-10 rounded-xl bg-[#FFB347]/10 border border-[#FFB347]/20 flex items-center justify-center text-[#FFB347] shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-white font-heading font-extrabold text-base uppercase tracking-tight mb-1">
                  Crown Club Rewards
                </h4>
                <p className="text-white/40 text-xs leading-relaxed m-0 font-medium">
                  Earn points dynamically on custom builds and unlock free sides, fries, and drinks automatically.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 text-left">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-500 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-white font-heading font-extrabold text-base uppercase tracking-tight mb-1">
                  Secure Checkout
                </h4>
                <p className="text-white/40 text-xs leading-relaxed m-0 font-medium">
                  One-tap Apple Pay, Google Pay, and encrypted UPI systems secure your orders.
                </p>
              </div>
            </div>
          </div>

          {/* Download Buttons */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-6">
            <button
              onClick={() => alert("iOS App Store package coming soon!")}
              className="flex items-center gap-3 bg-[#FF7A00] hover:bg-[#FFB347] text-black font-heading font-black text-xs uppercase tracking-widest px-6 py-4 rounded-2xl shadow-[0_0_20px_rgba(255,122,0,0.2)] hover:scale-105 transition-all duration-300 cursor-pointer border-none"
            >
              <Download className="w-4 h-4" />
              Download iOS App
            </button>
            <button
              onClick={() => alert("Android Google Play package coming soon!")}
              className="flex items-center gap-3 bg-[#1A1A1A] hover:bg-white/10 text-white border border-white/10 font-heading font-black text-xs uppercase tracking-widest px-6 py-4 rounded-2xl hover:scale-105 transition-all duration-300 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Google Play
            </button>
          </div>
        </div>

        {/* Right column: 3D phone mockup */}
        <div className="w-full md:w-1/2 flex items-center justify-center">
          <motion.div
            initial={{ rotateY: -15, rotateX: 10 }}
            whileInView={{ rotateY: -5, rotateX: 5 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="w-[300px] h-[600px] rounded-[50px] border-[12px] border-[#1A1A1A] bg-[#000000] relative shadow-[0_30px_60px_-15px_rgba(0,0,0,0.9)] overflow-hidden"
          >
            {/* Phone notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[30px] bg-[#1A1A1A] rounded-b-[18px] z-30 flex items-center justify-center">
              <div className="w-12 h-1 bg-black/60 rounded-full" />
            </div>

            {/* Simulated App Screen */}
            <div className="w-full h-full p-6 pt-12 flex flex-col justify-between relative z-10 bg-[#0c0c0c] text-white text-left">
              {/* App screen Header */}
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <span className="text-[10px] font-bold text-white/40">STAX LAB</span>
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              </div>

              {/* App central body screen */}
              <div className="flex flex-col gap-4 my-auto">
                <div className="w-full aspect-[4/3] rounded-2xl bg-black/60 border border-white/5 flex items-center justify-center relative overflow-hidden">
                  {/* Glowing flame */}
                  <Flame className="w-16 h-16 text-[#FF7A00]/10 fill-current animate-pulse absolute" />
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] text-white/30 font-bold uppercase tracking-widest mb-1">Recipe Active</span>
                    <span className="text-sm font-heading font-black text-center uppercase tracking-tight px-3">
                      Double Cheese Stack
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center text-[10px] font-bold text-white/40">
                    <span>THERMAL SEARING</span>
                    <span>72% COMPLETE</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="w-[72%] h-full bg-[#FF7A00] rounded-full" />
                  </div>
                </div>

                {/* Coupon widget */}
                <div className="glass-card border border-white/5 rounded-xl p-3 flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-[8px] text-white/30 font-bold">ACTIVE DEAL</span>
                    <span className="text-xs font-mono font-bold text-[#FF7A00]">STAX50</span>
                  </div>
                  <span className="text-[10px] font-bold text-green-500 bg-green-500/10 border border-green-500/20 px-2.5 py-0.5 rounded-full">
                    Applied
                  </span>
                </div>
              </div>

              {/* App bottom button */}
              <button className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FFB347] text-black font-heading font-black text-[10px] uppercase tracking-widest text-center shadow-[0_0_15px_rgba(255,122,0,0.2)] border-none cursor-pointer">
                Track Live Sizzle
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}



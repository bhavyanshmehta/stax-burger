"use client";

import React from "react";
import { Flame, Mail, ArrowRight, Globe } from "lucide-react";

export default function Footer() {
  const handleSubscribe = (e) => {
    e.preventDefault();
    alert("Subscribed to STAX Newsletter!");
    e.target.reset();
  };

  return (
    <footer className="bg-transparent border-t border-white/5 py-16 md:py-24 px-6 md:px-12 text-white overflow-hidden relative">
      {/* Subtle bottom glow flare */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-[#FF7A00]/5 rounded-full filter blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 pb-16 border-b border-white/5">
        {/* Brand details */}
        <div className="flex flex-col gap-5 md:col-span-1">
          <a href="#" className="flex items-center gap-2 group text-[#F5EBDC] no-underline w-fit">
            <div className="w-9 h-9 rounded-full bg-[#FF7A00] flex items-center justify-center shadow-[0_0_15px_rgba(255,122,0,0.4)] group-hover:scale-110 transition-transform duration-300">
              <Flame className="w-5.5 h-5.5 text-[#000000] fill-current" />
            </div>
            <span className="font-heading font-black text-lg tracking-wider uppercase text-white">
              STAX
            </span>
          </a>
          <p className="text-white/40 text-xs leading-relaxed max-w-xs m-0 font-medium">
            Premium flame-crafted digital experiences. Crafting burgers over an open flame. All rights reserved.
          </p>
        </div>

        {/* Navigation column */}
        <div className="flex flex-col gap-4">
          <h4 className="font-heading font-extrabold text-sm uppercase tracking-widest text-[#FF7A00]">
            Navigation
          </h4>
          <ul className="list-none p-0 m-0 flex flex-col gap-2.5">
            <li><a href="#signature" className="text-white/50 hover:text-[#FF7A00] transition-colors duration-300 text-xs no-underline uppercase tracking-wider font-semibold">Selections</a></li>
            <li><a href="#deals" className="text-white/50 hover:text-[#FF7A00] transition-colors duration-300 text-xs no-underline uppercase tracking-wider font-semibold">Deals</a></li>
            <li><a href="#customizer" className="text-white/50 hover:text-[#FF7A00] transition-colors duration-300 text-xs no-underline uppercase tracking-wider font-semibold">Grill Lab</a></li>
            <li><a href="#locations" className="text-white/50 hover:text-[#FF7A00] transition-colors duration-300 text-xs no-underline uppercase tracking-wider font-semibold">Kitchens</a></li>
          </ul>
        </div>

        {/* Legal links column */}
        <div className="flex flex-col gap-4">
          <h4 className="font-heading font-extrabold text-sm uppercase tracking-widest text-[#FFB347]">
            Legal Specs
          </h4>
          <ul className="list-none p-0 m-0 flex flex-col gap-2.5">
            <li><a href="#" className="text-white/50 hover:text-[#FF7A00] transition-colors duration-300 text-xs no-underline uppercase tracking-wider font-semibold">Privacy Policy</a></li>
            <li><a href="#" className="text-white/50 hover:text-[#FF7A00] transition-colors duration-300 text-xs no-underline uppercase tracking-wider font-semibold">Terms of Use</a></li>
            <li><a href="#" className="text-white/50 hover:text-[#FF7A00] transition-colors duration-300 text-xs no-underline uppercase tracking-wider font-semibold">Allergens Guide</a></li>
            <li><a href="#" className="text-white/50 hover:text-[#FF7A00] transition-colors duration-300 text-xs no-underline uppercase tracking-wider font-semibold">Nutritional Info</a></li>
          </ul>
        </div>

        {/* Newsletter subscription form */}
        <div className="flex flex-col gap-4">
          <h4 className="font-heading font-extrabold text-sm uppercase tracking-widest text-white/95">
            STAX Newsletter
          </h4>
          <p className="text-white/40 text-xs leading-relaxed m-0 font-medium">
            Subscribe to receive exclusive thermal discount codes and menu drop notifications.
          </p>
          <form onSubmit={handleSubscribe} className="flex bg-[#121212] border border-white/5 rounded-xl overflow-hidden p-1.5 mt-2">
            <div className="flex items-center pl-3 text-white/30">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="email"
              placeholder="Your Email Address"
              required
              className="bg-transparent border-none outline-none pl-3 text-xs text-white placeholder-white/20 w-full font-medium"
            />
            <button
              type="submit"
              className="w-10 h-10 rounded-lg bg-[#FF7A00] hover:bg-[#FFB347] flex items-center justify-center text-black transition-all duration-300 cursor-pointer border-none"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Footer base metadata */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 pt-8 text-center md:text-left text-xs text-white/30 font-medium">
        <p className="m-0">&copy; 2026 STAX. All rights reserved. Designed in premium Awwwards style.</p>
        
        {/* Social connections */}
        <div className="flex items-center gap-5">
          <a href="#" className="text-white/40 hover:text-[#FF7A00] transition-colors duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </a>
          <a href="#" className="text-white/40 hover:text-[#FF7A00] transition-colors duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
              <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
            </svg>
          </a>
          <a href="#" className="text-white/40 hover:text-[#FF7A00] transition-colors duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
            </svg>
          </a>
          <a href="#" className="text-white/40 hover:text-[#FF7A00] transition-colors duration-300"><Globe className="w-4 h-4" /></a>
        </div>
      </div>
    </footer>
  );
}



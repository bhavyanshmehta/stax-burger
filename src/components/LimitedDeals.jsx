"use client";

import React, { useRef, useEffect } from "react";
import { Flame, Copy, Check } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const deals = [
  {
    id: 1,
    title: "STAX Feast Deal",
    code: "STAX50",
    discount: "Flat 50% OFF",
    desc: "Get flat 50% off on your second custom stack built in our 3D Grill Workshop.",
    badge: "Limited Offer",
    bg: "bg-[#FF7A00]/10 border-[#FF7A00]/20",
    color: "text-[#FF7A00]",
  },
  {
    id: 2,
    title: "The STAX Royale",
    code: "STAXFEAST",
    discount: "Free Sides & Drink",
    desc: "Get a free serving of skin-on Paprika Wedges and a large Coca-Cola on orders above ₹499.",
    badge: "App Exclusive",
    bg: "bg-[#FFB347]/10 border-[#FFB347]/20",
    color: "text-[#FFB347]",
  },
  {
    id: 3,
    title: "Grill Workshop Bonus",
    code: "CRAFT3D",
    discount: "Save ₹100 Flat",
    desc: "Flat ₹100 discount when ordering any combo with custom ingredients in the 3D lab.",
    badge: "3D Customizer Bonus",
    bg: "bg-amber-500/10 border-amber-500/20",
    color: "text-amber-500",
  },
];

export default function LimitedDeals() {
  const containerRef = useRef(null);
  const cardsRef = useRef([]);
  const [copiedId, setCopiedId] = React.useState(null);

  useEffect(() => {
    // GSAP ScrollTrigger to stagger horizontal card entrances
    const ctx = gsap.context(() => {
      gsap.fromTo(
        cardsRef.current,
        { opacity: 0, x: 100, scale: 0.95 },
        {
          opacity: 1,
          x: 0,
          scale: 1,
          duration: 1.0,
          stagger: 0.2,
          ease: "power2.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 80%",
            toggleActions: "play none none none",
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleCopy = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <section
      ref={containerRef}
      id="deals"
      className="py-24 md:py-32 px-6 md:px-12 bg-transparent relative border-b border-white/5 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="flex flex-col gap-3 mb-16 text-center md:text-left">
          <span className="flex items-center justify-center md:justify-start gap-2 text-[#FF7A00] font-heading font-extrabold text-xs uppercase tracking-widest animate-pulse">
            <Flame className="w-4 h-4 fill-current" />
            Limited Time Offers
          </span>
          <h2 className="font-heading font-black text-4xl md:text-6xl text-white uppercase tracking-tighter leading-none m-0">
            STAX DEALS
          </h2>
          <p className="text-white/50 max-w-xl text-sm md:text-base leading-relaxed m-0 font-medium">
            Exclusive promo codes valid for our launch. Copy to clipboard and unlock premium savings at checkout.
          </p>
        </div>

        {/* Horizontal Deals Container */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {deals.map((deal, idx) => (
            <div
              key={deal.id}
              ref={(el) => (cardsRef.current[idx] = el)}
              className="bg-[#121212] rounded-3xl p-8 border border-white/5 flex flex-col justify-between min-h-[320px] transition-all duration-300 shadow-[0_4px_30px_rgba(0,0,0,0.4)] hover:shadow-[0_8px_35px_rgba(0,0,0,0.6)] hover:border-white/10"
            >
              <div>
                <div className="flex justify-between items-center mb-6">
                  <span className="text-[10px] font-heading font-black uppercase tracking-widest px-3 py-1 rounded-full border border-white/10 bg-white/5 text-white/80">
                    {deal.badge}
                  </span>
                  <span className={`text-sm font-heading font-black uppercase tracking-widest ${deal.color}`}>
                    {deal.discount}
                  </span>
                </div>
                <h3 className="font-heading font-extrabold text-2xl text-white uppercase tracking-tight mb-3">
                  {deal.title}
                </h3>
                <p className="text-white/60 text-sm leading-relaxed mb-6 font-medium">
                  {deal.desc}
                </p>
              </div>

              {/* Copy Code Action Box */}
              <div className="flex items-center justify-between bg-black/30 border border-white/5 rounded-2xl p-4">
                <div className="flex flex-col">
                  <span className="text-[10px] text-white/40 uppercase tracking-widest font-semibold mb-0.5">Code</span>
                  <span className="text-base font-mono font-black tracking-wider text-white">{deal.code}</span>
                </div>

                <button
                  onClick={() => handleCopy(deal.code, deal.id)}
                  className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-heading font-black text-xs uppercase tracking-widest transition-all duration-300 cursor-pointer border-none ${
                    copiedId === deal.id
                      ? "bg-green-500 text-black shadow-[0_0_15px_rgba(34,197,94,0.3)]"
                      : "bg-[#FF7A00] hover:bg-[#FFB347] text-black"
                  }`}
                >
                  {copiedId === deal.id ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copy
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

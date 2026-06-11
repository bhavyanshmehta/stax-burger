"use client";

import React, { useEffect, useRef } from "react";
import { Flame, Plus, Minus, RotateCcw, ShoppingBag } from "lucide-react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const ingredientPrices = {
  topBun: { name: "Artisanal Top Bun", price: 20 },
  lettuce: { name: "Crisp Leaf Lettuce", price: 20 },
  tomatoes: { name: "Juicy Tomato Slices", price: 30 },
  onion: { name: "Purple Onion Rings", price: 20 },
  pickles: { name: "Ribbed Dill Pickles", price: 20 },
  cheese: { name: "Melted Cheddar Cheese", price: 50 },
  patty: { name: "Flame-Broiled Angus Patty", price: 100 },
  sauce: { name: "Glossy Chipotle Sauce", price: 15 },
  bottomBun: { name: "Toasted Bottom Bun", price: 20 },
};

const defaultConfig = {
  topBun: 0,
  lettuce: 0,
  tomatoes: 0,
  onion: 0,
  pickles: 0,
  cheese: 0,
  patty: 0,
  sauce: 0,
  bottomBun: 0,
};

export default function Customizer({
  activeCustomizer,
  setActiveCustomizer,
  activeBurgerName,
  setActiveBurgerName,
  setHoveredIngredient,
}) {
  const containerRef = useRef(null);
  const [config, setConfig] = React.useState(defaultConfig);

  useEffect(() => {
    // If activeCustomizer is null, set local config, else sync
    if (activeCustomizer) {
      setConfig(activeCustomizer);
    }
  }, [activeCustomizer]);

  useEffect(() => {
    // GSAP ScrollTrigger to automatically trigger "customizer camera perspective"
    // when the user scrolls into the Customizer section.
    const trigger = ScrollTrigger.create({
      trigger: containerRef.current,
      start: "top 60%",
      end: "bottom 40%",
      onEnter: () => {
        setActiveCustomizer(config);
      },
      onEnterBack: () => {
        setActiveCustomizer(config);
      },
      onLeave: () => {
        setActiveCustomizer(null);
      },
      onLeaveBack: () => {
        setActiveCustomizer(null);
      },
    });

    return () => trigger.kill();
  }, [config, setActiveCustomizer]);

  const updateQty = (key, delta) => {
    const newQty = Math.max(0, Math.min(3, config[key] + delta));
    const newConfig = { ...config, [key]: newQty };
    setConfig(newConfig);
    if (activeCustomizer) {
      setActiveCustomizer(newConfig);
    }
  };

  const resetConfig = () => {
    setConfig(defaultConfig);
    setActiveBurgerName("Custom Stack");
    if (activeCustomizer) {
      setActiveCustomizer(defaultConfig);
    }
  };

  // Calculate total price based on configuration
  const calculateTotal = () => {
    let basePrice = 150; // base price for assembling
    Object.keys(config).forEach((key) => {
      basePrice += config[key] * ingredientPrices[key].price;
    });
    return basePrice;
  };

  return (
    <section
      ref={containerRef}
      id="customizer"
      className="py-24 md:py-32 px-6 md:px-12 bg-transparent relative border-b border-white/5 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-12 md:gap-16 relative z-10">
        
        {/* Left half: customizer placeholder spacer to make room for the 3D Canvas on the left */}
        <div className="w-full md:w-1/2 min-h-[350px] md:min-h-[500px] pointer-events-none" />

        {/* Right half: builder controls */}
        <div className="w-full md:w-1/2 flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <span className="flex items-center gap-2 text-[#FF7A00] font-heading font-extrabold text-xs uppercase tracking-widest animate-pulse">
              <Flame className="w-4 h-4 fill-current" />
              Grill Lab Workshop
            </span>
            <h2 className="font-heading font-black text-3xl md:text-5xl text-white uppercase tracking-tighter leading-none m-0">
              {activeBurgerName === "Custom Stack" ? "BUILD YOUR OWN" : `CUSTOMIZE ${activeBurgerName}`}
            </h2>
            <p className="text-white/50 text-sm leading-relaxed m-0 font-medium">
              Customize ingredient quantities in real time. Add toppings, double the patties, melt extra cheddar, or go naked.
            </p>
          </div>

          {/* Controls list */}
          <div className="flex flex-col gap-3 max-h-[380px] overflow-y-auto pr-2">
            {Object.keys(ingredientPrices).map((key) => {
              const item = ingredientPrices[key];
              const qty = config[key];
              return (
                <div
                  key={key}
                  onMouseEnter={() => setHoveredIngredient && setHoveredIngredient(key)}
                  onMouseLeave={() => setHoveredIngredient && setHoveredIngredient(null)}
                  className="bg-[#121212] border border-white/5 rounded-2xl p-4 flex items-center justify-between transition-all duration-300 hover:border-[#FF7A00]/40 hover:bg-white/[0.04] hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(0,0,0,0.4)] cursor-pointer"
                >
                  <div className="flex flex-col text-left">
                    <span className="text-white font-heading font-bold text-sm uppercase tracking-tight">
                      {item.name}
                    </span>
                    <span className="text-[10px] text-white/40 font-semibold uppercase tracking-wider">
                      +₹{item.price} each
                    </span>
                  </div>

                  {/* Quantity buttons */}
                  <div className="flex items-center gap-4 bg-black/30 border border-white/5 rounded-xl px-2 py-1.5">
                    <button
                      onClick={() => updateQty(key, -1)}
                      disabled={qty === 0}
                      className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center text-white cursor-pointer border-none"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-5 text-center font-heading font-black text-sm text-[#FF7A00]">
                      {qty}
                    </span>
                    <button
                      onClick={() => updateQty(key, 1)}
                      disabled={qty === 3}
                      className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center text-white cursor-pointer border-none"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pricing summary */}
          <div className="bg-[#121212] border border-white/5 rounded-3xl p-6 flex flex-col gap-4 mt-2 shadow-[0_4px_25px_rgba(0,0,0,0.4)]">
            <div className="flex justify-between items-center">
              <span className="text-white/50 text-xs font-semibold uppercase tracking-widest">Base + Additions</span>
              <button
                onClick={resetConfig}
                className="flex items-center gap-1.5 text-xs text-[#FF7A00] hover:text-[#FFB347] font-bold uppercase tracking-wider transition-colors bg-transparent border-none cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Recipe
              </button>
            </div>
            
            <div className="flex items-center justify-between pt-2 border-t border-white/5">
              <div className="flex flex-col text-left">
                <span className="text-[10px] text-white/40 uppercase tracking-widest font-semibold mb-0.5">Est. Total</span>
                <span className="text-3xl font-heading font-black text-white">₹{calculateTotal()}</span>
              </div>

              <button
                onClick={() => alert(`Custom Stack added to cart! Price: ₹${calculateTotal()}`)}
                className="flex items-center gap-3 bg-gradient-to-r from-[#FF7A00] to-[#FFB347] hover:scale-105 text-black font-heading font-black text-xs uppercase tracking-widest px-6 py-3.5 rounded-2xl shadow-[0_4px_20px_rgba(255,122,0,0.25)] transition-all duration-300 cursor-pointer border-none"
              >
                <ShoppingBag className="w-4 h-4" />
                Order Custom Stack
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

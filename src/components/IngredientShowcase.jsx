"use client";

import React, { useEffect, useRef } from "react";
import { Flame, Compass } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const ingredients = [
  {
    id: "topBun",
    name: "Artisanal Sesame Bun",
    origin: "Freshly Baked Daily",
    desc: "Soft, golden brioche bun glazed with butter and hand-sprinkled with organic white sesame seeds.",
  },
  {
    id: "lettuce",
    name: "Hydroponic Lettuce",
    origin: "Local Farm Sourced",
    desc: "Sustainably grown butterhead lettuce, washed in ice water to lock in a refreshing, crisp snap.",
  },
  {
    id: "tomatoes",
    name: "Heirloom Tomatoes",
    origin: "Vine-Ripened",
    desc: "Thick, juicy slices of vine-ripened heirloom tomatoes, selected for balanced acidity and sweetness.",
  },
  {
    id: "onion",
    name: "Purple Sweet Onions",
    origin: "Tangy & Sharp",
    desc: "Concentric rings of red sweet onions, providing a sharp crunch that cuts through the savory cheese.",
  },
  {
    id: "pickles",
    name: "Barrel-Aged Pickles",
    origin: "Brine-Fermented",
    desc: "Crunchy crinkle-cut pickles fermented in aromatic dill and garlic brine for a sour punch.",
  },
  {
    id: "cheese",
    name: "Melted Cheddar",
    origin: "Wisconsin Premium",
    desc: "Creamy, high-melt cheddar slices draped over the hot patty, melting down the sides in layers.",
  },
  {
    id: "patty",
    name: "Flame-Broiled Angus Patty",
    origin: "100% Angus Beef",
    desc: "Flame-crafted beef patty seared over open grates at 700°F to trap juices and lock in wood-smoke flavors.",
  },
  {
    id: "bottomBun",
    name: "Caramelized Heel Bun",
    origin: "Toasted Flat-grill",
    desc: "Flat-toasted brioche base that forms a crunchy barrier to keep sauces intact without getting soggy.",
  },
];

export default function IngredientShowcase({
  activeShowcase,
  setActiveShowcase,
  activeIngredients,
  setActiveIngredients,
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    // GSAP ScrollTrigger to automatically trigger "showcase mode" in parent page
    // when the user scrolls into the Ingredient Showcase section.
    const trigger = ScrollTrigger.create({
      trigger: containerRef.current,
      start: "top 60%",
      end: "bottom 40%",
      onEnter: () => {
        setActiveShowcase(true);
        setActiveIngredients("all");
      },
      onEnterBack: () => {
        setActiveShowcase(true);
      },
      onLeave: () => {
        setActiveShowcase(false);
      },
      onLeaveBack: () => {
        setActiveShowcase(false);
      },
    });

    return () => trigger.kill();
  }, [setActiveShowcase, setActiveIngredients]);

  return (
    <section
      ref={containerRef}
      id="ingredients-showcase"
      className="py-24 md:py-32 px-6 md:px-12 bg-[#050505] relative border-b border-white/5 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12 md:gap-16 relative z-10">
        
        {/* Left half: Exploded status indicator placeholder */}
        <div className="w-full md:w-1/2 min-h-[400px] flex flex-col items-center justify-center rounded-3xl border border-white/5 bg-black/40 p-8 text-center relative overflow-hidden">
          <div className="absolute top-4 left-4 flex items-center gap-2 text-white/30 text-xs font-mono uppercase tracking-widest">
            <Compass className="w-3.5 h-3.5 animate-spin" />
            3D Canvas Viewport Linked
          </div>
          
          {activeIngredients === "all" ? (
            <div className="flex flex-col items-center gap-4 animate-pulse">
              <div className="w-16 h-16 rounded-full border border-[#FF7A00]/30 bg-[#FF7A00]/5 flex items-center justify-center text-[#FF7A00] shadow-[0_0_20px_rgba(255,122,0,0.15)]">
                <Flame className="w-8 h-8 fill-current" />
              </div>
              <h3 className="font-heading font-black text-xl text-white uppercase tracking-wider">
                Exploded Lab Active
              </h3>
              <p className="text-white/40 text-xs max-w-xs leading-relaxed">
                Hover or tap on any ingredient in the right panel to filter the 3D burger model in real time.
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 text-center">
              <span className="text-[10px] font-heading font-black uppercase tracking-widest text-[#FF7A00] bg-[#FF7A00]/10 border border-[#FF7A00]/25 px-3 py-1 rounded-full">
                {ingredients.find(item => item.id === activeIngredients)?.origin}
              </span>
              <h3 className="font-heading font-black text-3xl text-white uppercase tracking-tight m-0">
                {ingredients.find(item => item.id === activeIngredients)?.name}
              </h3>
              <p className="text-white/50 text-sm leading-relaxed max-w-sm m-0">
                {ingredients.find(item => item.id === activeIngredients)?.desc}
              </p>
            </div>
          )}
        </div>

        {/* Right half: List of ingredients */}
        <div className="w-full md:w-1/2 flex flex-col gap-4">
          <div className="flex flex-col gap-3 mb-6">
            <span className="flex items-center gap-2 text-[#FF7A00] font-heading font-extrabold text-xs uppercase tracking-widest">
              <Flame className="w-4 h-4 fill-current" />
              Ingredient Showcase
            </span>
            <h2 className="font-heading font-black text-3xl md:text-5xl uppercase tracking-tighter leading-none m-0">
              EXPLODED DETAILS
            </h2>
          </div>

          <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto pr-2">
            {ingredients.map((item) => (
              <button
                key={item.id}
                onMouseEnter={() => {
                  setActiveShowcase(true);
                  setActiveIngredients(item.id);
                }}
                onMouseLeave={() => {
                  setActiveIngredients("all");
                }}
                onClick={() => {
                  setActiveShowcase(true);
                  setActiveIngredients(item.id);
                }}
                className={`w-full text-left glass-card border rounded-2xl p-5 flex items-center justify-between transition-all duration-300 cursor-pointer ${
                  activeIngredients === item.id
                    ? "border-[#FF7A00]/50 bg-white/[0.04] translate-x-3"
                    : "border-white/5 bg-transparent"
                }`}
              >
                <div>
                  <h4 className="text-white font-heading font-bold text-base uppercase tracking-tight mb-1">
                    {item.name}
                  </h4>
                  <span className="text-[10px] text-white/30 font-semibold uppercase tracking-wider">
                    {item.origin}
                  </span>
                </div>
                <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  activeIngredients === item.id ? "bg-[#FF7A00] scale-150 shadow-[0_0_10px_#FF7A00]" : "bg-white/10"
                }`} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import React, { useRef, useState, useEffect } from "react";
import { Flame, Star, Plus, GlassWater, Leaf, ChevronLeft, ChevronRight } from "lucide-react";

// Custom 3D Tilt Wrapper Component
function TiltCard({ children, className }) {
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    const box = card.getBoundingClientRect();
    const x = e.clientX - box.left - box.width / 2;
    const y = e.clientY - box.top - box.height / 2;
    
    const rotX = -(y / (box.height / 2)) * 5;
    const rotY = (x / (box.width / 2)) * 5;

    card.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.01, 1.01, 1.01)`;
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`${className} transition-all duration-300 ease-out`}
      style={{ transformStyle: "preserve-3d" }}
    >
      {children}
    </div>
  );
}

const categories = [
  { id: "signature", label: "Signature Stacks" },
  { id: "chicken", label: "Chicken Stacks" },
  { id: "veg", label: "Veg Stacks" },
  { id: "sides", label: "Sides & Extras" },
  { id: "drinks", label: "Beverages" }
];

const burgers = [
  // Signature Stacks
  {
    id: 1,
    name: "The Classic Stack",
    desc: "Single premium flame-crafted patty topped with signature stack sauce, fresh leaf lettuce, ripe tomatoes, onions, and sweet dill pickles on a toasted bun.",
    price: "₹229",
    rating: 4.8,
    reviews: "1.2k",
    tag: "Signature",
    category: "signature",
    vegType: "non-veg",
    isNew: false,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: 2,
    name: "Double Flame Stack",
    desc: "Two flame-crafted patties, double melted cheddar, crispy onion strings, and signature stack sauce.",
    price: "₹289",
    rating: 4.9,
    reviews: "2.1k",
    tag: "Flame Crafted",
    category: "signature",
    vegType: "non-veg",
    isNew: true,
    image: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: 3,
    name: "Truffle Melt Stack",
    desc: "Single premium flame-crafted patty topped with sautéed wild mushrooms, Swiss cheese, and truffle aioli.",
    price: "₹349",
    rating: 4.9,
    reviews: "1.4k",
    tag: "Elite",
    category: "signature",
    vegType: "non-veg",
    isNew: true,
    image: "https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: 4,
    name: "Smoky BBQ Stack",
    desc: "Flame-crafted patty, smoked cheddar, crispy bacon, caramelized onions, and house-made BBQ sauce.",
    price: "₹299",
    rating: 4.7,
    reviews: "820",
    tag: "Classic BBQ",
    category: "signature",
    vegType: "non-veg",
    isNew: false,
    image: "https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=800&auto=format&fit=crop",
  },
  // Chicken Stacks
  {
    id: 5,
    name: "Firehouse Chicken Stack",
    desc: "Spicy hand-breaded chicken breast, melted pepper jack cheese, jalapeños, and fiery chipotle mayo.",
    price: "₹249",
    rating: 4.8,
    reviews: "1.1k",
    tag: "Fiery Chicken",
    category: "chicken",
    vegType: "non-veg",
    isNew: false,
    image: "https://images.unsplash.com/photo-1606755962773-d324e0a13086?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: 6,
    name: "Smoky BBQ Chicken Stack",
    desc: "Crispy chicken breast tossed in smoky BBQ sauce, topped with creamy slaw and pickles.",
    price: "₹239",
    rating: 4.6,
    reviews: "630",
    tag: "Smoky BBQ",
    category: "chicken",
    vegType: "non-veg",
    isNew: false,
    image: "https://images.unsplash.com/photo-1606755962773-d324e0a13086?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: 7,
    name: "Crispy Chicken Stack",
    desc: "Hand-breaded golden chicken breast with fresh lettuce, tomatoes, and garlic aioli.",
    price: "₹199",
    rating: 4.7,
    reviews: "950",
    tag: "Crispy Chicken",
    category: "chicken",
    vegType: "non-veg",
    isNew: false,
    image: "https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?q=80&w=800&auto=format&fit=crop",
  },
  // Veg Stacks
  {
    id: 8,
    name: "Kimchi Fire Stack",
    desc: "Crispy plant-based patty glazed in sweet & spicy Korean Kimchi sauce with sesame slaw and fresh scallions.",
    price: "₹219",
    rating: 4.8,
    reviews: "1.2k",
    tag: "Korean Flame",
    category: "veg",
    vegType: "veg",
    isNew: true,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: 9,
    name: "Cheese Overload Stack",
    desc: "Molten cheese lava patty, topped with garlic butter mushrooms, lettuce, and truffle mayo.",
    price: "₹259",
    rating: 4.9,
    reviews: "980",
    tag: "Cheese Melt",
    category: "veg",
    vegType: "veg",
    isNew: true,
    image: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: 10,
    name: "Crispy Veg Stack",
    desc: "Crispy golden vegetable patty loaded with fresh tomatoes, leaf lettuce, and herb dressing.",
    price: "₹169",
    rating: 4.6,
    reviews: "1.4k",
    tag: "Crispy Veg",
    category: "veg",
    vegType: "veg",
    isNew: false,
    image: "https://images.unsplash.com/photo-1606755962773-d324e0a13086?q=80&w=800&auto=format&fit=crop",
  },
  // Sides & Extras
  {
    id: 11,
    name: "STAX Fries",
    desc: "Thick-cut golden sea salt fries, crispy on the outside, fluffy on the inside.",
    price: "₹109",
    rating: 4.7,
    reviews: "3k",
    tag: "Sides",
    category: "sides",
    vegType: "veg",
    isNew: false,
    image: "https://images.unsplash.com/photo-1606755962773-d324e0a13086?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: 12,
    name: "STAX Onion Rings",
    desc: "Crispy hand-battered jumbo onion rings served with signature dipping sauce.",
    price: "₹129",
    rating: 4.8,
    reviews: "1.9k",
    tag: "Sides",
    category: "sides",
    vegType: "veg",
    isNew: false,
    image: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: 13,
    name: "Peri Peri Bites",
    desc: "Spicy melted cheese and jalapeño bites coated in crispy breadcrumbs.",
    price: "₹149",
    rating: 4.7,
    reviews: "820",
    tag: "Sides",
    category: "sides",
    vegType: "veg",
    isNew: false,
    image: "https://images.unsplash.com/photo-1606755962773-d324e0a13086?q=80&w=800&auto=format&fit=crop",
  },
  // Beverages
  {
    id: 14,
    name: "Cold Cola",
    desc: "Chilled and carbonated sparkling soda, the perfect refreshing pairing to complement your sizzling flame-crafted burger.",
    price: "₹99",
    rating: 4.9,
    reviews: "3k",
    tag: "Chilled Can",
    category: "drinks",
    vegType: "veg",
    isNew: false,
    image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: 15,
    name: "Iced Hibiscus Tea",
    desc: "Sweet and chilled freshly brewed hibiscus tea infused with real citrus lemon juice for ultimate refreshment.",
    price: "₹119",
    rating: 4.7,
    reviews: "1.2k",
    tag: "Real Brewed",
    category: "drinks",
    vegType: "veg",
    isNew: false,
    image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: 16,
    name: "STAX Brew Coffee",
    desc: "Rich, creamy iced coffee brewed from double-roasted Arabica beans, sweet milk, and served ice cold with chocolate hints.",
    price: "₹149",
    rating: 4.8,
    reviews: "1.9k",
    tag: "Brewed",
    category: "drinks",
    vegType: "veg",
    isNew: false,
    image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=800&auto=format&fit=crop",
  },
];

const presets = {
  "The Classic Stack": { topBun: 1, lettuce: 1, tomatoes: 1, onion: 1, pickles: 1, cheese: 0, patty: 1, sauce: 1, bottomBun: 1 },
  "Double Flame Stack": { topBun: 1, lettuce: 0, tomatoes: 0, onion: 1, pickles: 0, cheese: 2, patty: 2, sauce: 1, bottomBun: 1 },
  "Truffle Melt Stack": { topBun: 1, lettuce: 0, tomatoes: 0, onion: 1, pickles: 0, cheese: 1, patty: 1, sauce: 1, bottomBun: 1 },
  "Smoky BBQ Stack": { topBun: 1, lettuce: 0, tomatoes: 0, onion: 1, pickles: 1, cheese: 1, patty: 1, sauce: 1, bottomBun: 1 },
  "Firehouse Chicken Stack": { topBun: 1, lettuce: 1, tomatoes: 1, onion: 1, pickles: 0, cheese: 1, patty: 1, sauce: 1, bottomBun: 1 },
  "Smoky BBQ Chicken Stack": { topBun: 1, lettuce: 1, tomatoes: 0, onion: 0, pickles: 1, cheese: 0, patty: 1, sauce: 1, bottomBun: 1 },
  "Crispy Chicken Stack": { topBun: 1, lettuce: 1, tomatoes: 1, onion: 0, pickles: 0, cheese: 0, patty: 1, sauce: 1, bottomBun: 1 },
  "Kimchi Fire Stack": { topBun: 1, lettuce: 1, tomatoes: 0, onion: 1, pickles: 0, cheese: 0, patty: 1, sauce: 1, bottomBun: 1 },
  "Cheese Overload Stack": { topBun: 1, lettuce: 1, tomatoes: 0, onion: 1, pickles: 0, cheese: 1, patty: 1, sauce: 1, bottomBun: 1 },
  "Crispy Veg Stack": { topBun: 1, lettuce: 1, tomatoes: 1, onion: 0, pickles: 1, cheese: 0, patty: 1, sauce: 1, bottomBun: 1 }
};

export default function SignatureBurgers({ onCustomize }) {
  const [activeCategory, setActiveCategory] = useState("signature");
  const [vegOnly, setVegOnly] = useState(false);
  const [nonVegOnly, setNonVegOnly] = useState(false);
  const scrollRef = useRef(null);
  
  // Refs and styles for the sliding active indicator highlight
  const categoryRefs = useRef({});
  const [highlightStyle, setHighlightStyle] = useState({ left: 0, width: 0, opacity: 0 });

  // Update sliding highlight pill coordinates when category changes
  useEffect(() => {
    const activeBtn = categoryRefs.current[activeCategory];
    if (activeBtn) {
      const { offsetLeft, offsetWidth } = activeBtn;
      setHighlightStyle({
        left: offsetLeft,
        width: offsetWidth,
        opacity: 1
      });
    }
  }, [activeCategory]);

  // Horizontal scroll action helper
  const scrollCategories = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft } = scrollRef.current;
      const scrollAmount = 260;
      scrollRef.current.scrollTo({
        left: direction === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: "smooth"
      });
    }
  };

  // Filter logic: category + dietary preference
  let filteredItems = burgers.filter(b => b.category === activeCategory);
  if (vegOnly) {
    filteredItems = filteredItems.filter(b => b.vegType === "veg");
  }
  if (nonVegOnly) {
    filteredItems = filteredItems.filter(b => b.vegType === "non-veg");
  }

  return (
    <section id="signature" className="py-24 md:py-32 px-6 md:px-12 bg-transparent relative overflow-hidden">
      
      {/* Embedded style to hide Chrome/Safari scrollbar handles for the category slider */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* Background flare */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#FF7A00]/5 rounded-full filter blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Title Header */}
        <div className="flex flex-col gap-3 mb-16 md:mb-20 text-center md:text-left">
          <span className="flex items-center justify-center md:justify-start gap-2 text-[#FF7A00] font-heading font-extrabold text-xs uppercase tracking-widest animate-pulse">
            <Flame className="w-4 h-4 fill-current" />
            STAX Menu
          </span>
          <h2 className="font-heading font-black text-4xl md:text-6xl text-white uppercase tracking-tighter leading-none m-0">
            EXPLORE THE MENU
          </h2>
          <p className="text-white/50 max-w-xl text-sm md:text-base leading-relaxed m-0 font-medium">
            Artisanal stacks flame-crafted to perfection. Select a category below to browse selections.
          </p>
        </div>

        {/* Horizontally Scrollable Category Bar Selector with Arrows */}
        <div className="relative flex items-center mb-10 border-b border-white/5 pb-2">
          {/* Scroll Left Button */}
          <button 
            onClick={() => scrollCategories("left")} 
            className="absolute left-0 z-20 w-9 h-9 rounded-full border border-white/10 bg-black/80 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/5 cursor-pointer shadow-md transition-all duration-300"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Horizontally scrollable list */}
          <div 
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto no-scrollbar px-10 py-3.5 w-full scroll-smooth select-none relative items-center"
          >
            {/* Sliding Highlight Pill */}
            <div 
              className="absolute bg-[#FF7A00] rounded-full transition-all duration-300 ease-out -z-10 shadow-[0_0_20px_rgba(255,122,0,0.4)] h-[38px]"
              style={{
                left: `${highlightStyle.left}px`,
                width: `${highlightStyle.width}px`,
                opacity: highlightStyle.opacity,
              }}
            />

            {categories.map((cat) => (
              <button
                key={cat.id}
                ref={(el) => (categoryRefs.current[cat.id] = el)}
                onClick={() => {
                  setActiveCategory(cat.id);
                  // Reset filters on category changes
                  setVegOnly(false);
                  setNonVegOnly(false);
                }}
                className={`flex-shrink-0 font-heading font-black text-xs uppercase tracking-wider px-6 py-2.5 rounded-full relative z-10 cursor-pointer transition-colors duration-300 ${
                  activeCategory === cat.id 
                    ? "text-black" 
                    : "text-white/40 hover:text-white/80"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Scroll Right Button */}
          <button 
            onClick={() => scrollCategories("right")} 
            className="absolute right-0 z-20 w-9 h-9 rounded-full border border-white/10 bg-black/80 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/5 cursor-pointer shadow-md transition-all duration-300"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Veg / Non-Veg Toggle Filters Selector */}
        <div className="flex gap-4 justify-center md:justify-start mb-14">
          {/* Veg Pill Toggle */}
          <button
            onClick={() => {
              setVegOnly(!vegOnly);
              setNonVegOnly(false);
            }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full border text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
              vegOnly
                ? "border-green-500 bg-green-500/10 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.25)]"
                : "border-white/10 bg-[#121212] text-white/55 hover:border-green-500/30 hover:text-green-400"
            }`}
          >
            <div className={`w-3.5 h-3.5 rounded-[4px] border flex items-center justify-center ${vegOnly ? "border-green-400" : "border-white/35"}`}>
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
            </div>
            <span>Veg Selections</span>
          </button>

          {/* Non-Veg Pill Toggle */}
          <button
            onClick={() => {
              setNonVegOnly(!nonVegOnly);
              setVegOnly(false);
            }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full border text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
              nonVegOnly
                ? "border-red-500 bg-red-500/10 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.25)]"
                : "border-white/10 bg-[#121212] text-white/55 hover:border-red-500/30 hover:text-red-400"
            }`}
          >
            <div className={`w-3.5 h-3.5 rounded-[4px] border flex items-center justify-center ${nonVegOnly ? "border-red-400" : "border-white/35"}`}>
              <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
            </div>
            <span>Non-Veg Selections</span>
          </button>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => {
              const borderHoverColor = item.vegType === "veg"
                ? "hover:border-green-500/40 hover:shadow-[0_20px_50px_rgba(34,197,94,0.1)]"
                : "hover:border-red-500/40 hover:shadow-[0_20px_50px_rgba(239,68,68,0.1)]";

              return (
                <TiltCard
                  key={item.id}
                  className={`bg-[#0d0d0d] rounded-3xl p-8 border border-white/5 flex flex-col justify-between min-h-[480px] relative group shadow-[0_4px_30px_rgba(0,0,0,0.4)] hover:-translate-y-2.5 transition-all duration-500 ${borderHoverColor}`}
                >
                  {/* Glowing background behind image */}
                  <div className="absolute top-12 left-1/2 -translate-x-1/2 w-48 h-48 bg-[#FF7A00]/6 rounded-full filter blur-[40px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Card Upper Content */}
                  <div className="relative z-10 flex flex-col flex-1" style={{ transform: "translateZ(30px)" }}>
                    
                    {/* Header Indicators */}
                    <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center gap-3">
                        {/* Food tag indicators (veg / non-veg / beverage) */}
                        {item.category === "drinks" ? (
                          <div className="w-4.5 h-4.5 border border-blue-500/40 flex items-center justify-center rounded-[3px] bg-transparent">
                            <GlassWater className="w-3.5 h-3.5 text-blue-500" />
                          </div>
                        ) : (
                          <div className={`w-4.5 h-4.5 border flex items-center justify-center rounded-[3px] bg-transparent ${
                            item.vegType === "veg" ? "border-green-600" : "border-red-600"
                          }`}>
                            <div className={`w-2 h-2 rounded-full ${
                              item.vegType === "veg" ? "bg-green-600" : "bg-red-600"
                            }`} />
                          </div>
                        )}

                        {item.isNew ? (
                          <span className="text-[7.5px] font-heading font-black uppercase tracking-widest text-white bg-red-600 px-2.5 py-0.5 rounded-full shadow-[0_0_8px_rgba(220,38,38,0.45)]">
                            NEW
                          </span>
                        ) : (
                          <span className="text-[9px] font-heading font-black uppercase tracking-widest text-[#FF7A00] bg-[#FF7A00]/10 border border-[#FF7A00]/20 px-3 py-1 rounded-full">
                            {item.tag}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1 text-white">
                        <Star className="w-3.5 h-3.5 text-[#FF7A00] fill-current" />
                        <span className="text-xs font-bold">{item.rating}</span>
                      </div>
                    </div>

                    {/* Overflowing Burger Image Container */}
                    <div className="relative w-full h-44 mb-6 flex items-center justify-center select-none">
                      {/* Realistic Shadow beneath burger */}
                      <div className="absolute bottom-1 w-32 h-3 bg-black/60 rounded-full filter blur-[5px] scale-x-110 opacity-75 group-hover:scale-x-125 group-hover:opacity-100 group-hover:blur-[6px] transition-all duration-500 pointer-events-none" />
                      
                      {/* Floating, Zooming Image */}
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-full h-full object-contain z-10 animate-float-burger group-hover:scale-122 group-hover:-translate-y-8 transition-all duration-500 ease-out pointer-events-none"
                        style={{
                          filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.5))",
                        }}
                      />
                    </div>

                    {/* Text content */}
                    <h3 className="font-heading font-extrabold text-2xl text-white uppercase tracking-tight mb-2 text-left line-clamp-1">
                      {item.name}
                    </h3>
                    <p className="text-white/50 text-xs leading-relaxed mb-6 font-medium text-left line-clamp-2">
                      {item.desc}
                    </p>
                  </div>

                  {/* Card Footer / Purchase Panel */}
                  <div
                    className="flex items-center justify-between pt-4 border-t border-white/5 relative z-10"
                    style={{ transform: "translateZ(40px)" }}
                  >
                    <div className="flex flex-col text-left">
                      <span className="text-[9px] text-white/40 uppercase tracking-widest font-semibold mb-0.5">Price</span>
                      <span className="text-2xl font-heading font-black text-white">{item.price}</span>
                    </div>

                    {item.category !== "drinks" ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => onCustomize && onCustomize(item.name, presets[item.name])}
                          className="bg-transparent hover:bg-white/5 border border-white/20 text-white rounded-full font-heading font-black text-[9px] uppercase tracking-widest px-3.5 py-2 cursor-pointer transition-all duration-300 shadow-sm"
                        >
                          Customize
                        </button>
                        <button
                          onClick={() => alert(`${item.name} added to cart!`)}
                          className="bg-[#FF7A00] hover:bg-[#FFB347] text-black rounded-full font-heading font-black text-[9px] uppercase tracking-widest px-4 py-2 flex items-center gap-1 cursor-pointer border-none transition-all duration-300 shadow-sm"
                        >
                          <span>ORDER</span>
                          <Plus className="w-3 h-3 stroke-[3]" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => alert(`${item.name} added to cart!`)}
                        className="bg-[#FF7A00] hover:bg-[#FFB347] text-black rounded-full font-heading font-black text-[9px] uppercase tracking-widest px-5 py-2.5 flex items-center gap-1.5 cursor-pointer border-none transition-all duration-300 shadow-md"
                      >
                        <span>ORDER NOW</span>
                        <Plus className="w-3 h-3 stroke-[3]" />
                      </button>
                    )}
                  </div>
                </TiltCard>
              );
            })
          ) : (
            <div className="col-span-full py-24 text-center border border-white/5 rounded-3xl bg-[#121212]/30 backdrop-blur-sm">
              <p className="text-white/30 font-heading font-black text-lg uppercase tracking-wider mb-2">
                Sorry, No selections found matching this preference!
              </p>
              <p className="text-white/15 text-sm font-medium">
                Try switching toggles or selecting another category above.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

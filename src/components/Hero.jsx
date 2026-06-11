"use client";
import React, { useState, useEffect, useRef } from "react";
import { Flame, Menu, X, ChevronDown, GlassWater, Sparkles, Tag, ShieldCheck, MapPin, Award, ArrowRight } from "lucide-react";
import gsap from "gsap";

export default function Hero({ cartCount = 0, onCartOpen }) {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [prevDropdown, setPrevDropdown] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Mobile menu states
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeMobileDropdown, setActiveMobileDropdown] = useState(null);

  const dropdownRef = useRef(null);

  // Monitor page scroll to style the global sticky header wrapper
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavHover = (tab) => {
    setPrevDropdown(activeDropdown);
    setActiveDropdown(tab);
  };

  // GSAP animations for the mega menu dropdown panel
  useEffect(() => {
    if (!dropdownRef.current) return;
    if (activeDropdown) {
      const isSwitching = prevDropdown !== null;
      
      if (!isSwitching) {
        // First-time open animation
        gsap.killTweensOf(dropdownRef.current);
        gsap.set(dropdownRef.current, { display: "block" });
        gsap.fromTo(
          dropdownRef.current,
          { opacity: 0, y: -15, scale: 0.98 },
          { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: "power2.out" }
        );
      }

      // Stagger column items fade-in
      const columns = dropdownRef.current?.querySelectorAll(".megamenu-column");
      const featured = dropdownRef.current?.querySelector(".megamenu-featured");
      
      if (columns && columns.length > 0) {
        gsap.killTweensOf(columns);
        gsap.fromTo(
          columns,
          { opacity: 0, y: isSwitching ? 5 : 12 },
          { opacity: 1, y: 0, duration: 0.35, stagger: 0.04, ease: "power2.out" }
        );
      }

      if (featured) {
        gsap.killTweensOf(featured);
        gsap.fromTo(
          featured,
          { opacity: 0, x: isSwitching ? 8 : 15 },
          { opacity: 1, x: 0, duration: 0.45, delay: isSwitching ? 0.05 : 0.15, ease: "power2.out" }
        );
      }
    } else {
      // Close/Exit animation
      gsap.killTweensOf(dropdownRef.current);
      gsap.to(dropdownRef.current, {
        opacity: 0,
        y: -15,
        scale: 0.98,
        duration: 0.25,
        ease: "power2.in",
        onComplete: () => {
          gsap.set(dropdownRef.current, { display: "none" });
        }
      });
    }
  }, [activeDropdown]);

  // Render the megamenu content dynamically based on hovered item
  const renderDropdownContent = () => {
    switch (activeDropdown) {
      case "menu":
        return (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 text-left">
            {/* Left Side Links */}
            <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="megamenu-column flex flex-col gap-4">
                <span className="font-heading font-black text-xs uppercase tracking-widest text-[#FF7A00] mb-1 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 fill-current" /> Signature Stacks
                </span>
                <div className="flex flex-col gap-2.5 text-sm">
                  <a href="#signature-section" onClick={() => setActiveDropdown(null)} className="text-white/60 hover:text-white transition-colors duration-200 no-underline font-medium hover:translate-x-1.5 transform transition-transform duration-200">The Classic Stack</a>
                  <a href="#signature-section" onClick={() => setActiveDropdown(null)} className="text-white/60 hover:text-white transition-colors duration-200 no-underline font-medium hover:translate-x-1.5 transform transition-transform duration-200">Double Flame Stack</a>
                  <a href="#signature-section" onClick={() => setActiveDropdown(null)} className="text-white/60 hover:text-white transition-colors duration-200 no-underline font-medium hover:translate-x-1.5 transform transition-transform duration-200">Truffle Melt Stack</a>
                </div>
              </div>
              <div className="megamenu-column flex flex-col gap-4">
                <span className="font-heading font-black text-xs uppercase tracking-widest text-[#FF7A00] mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#FF7A00]" /> Chicken Stacks
                </span>
                <div className="flex flex-col gap-2.5 text-sm">
                  <a href="#signature-section" onClick={() => setActiveDropdown(null)} className="text-white/60 hover:text-white transition-colors duration-200 no-underline font-medium hover:translate-x-1.5 transform transition-transform duration-200">Firehouse Chicken Stack</a>
                  <a href="#signature-section" onClick={() => setActiveDropdown(null)} className="text-white/60 hover:text-white transition-colors duration-200 no-underline font-medium hover:translate-x-1.5 transform transition-transform duration-200">Smoky BBQ Chicken Stack</a>
                  <a href="#signature-section" onClick={() => setActiveDropdown(null)} className="text-white/60 hover:text-white transition-colors duration-200 no-underline font-medium hover:translate-x-1.5 transform transition-transform duration-200">Crispy Chicken Stack</a>
                </div>
              </div>
              <div className="megamenu-column flex flex-col gap-4">
                <span className="font-heading font-black text-xs uppercase tracking-widest text-[#FF7A00] mb-1 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#FF7A00]" /> Veg Stacks
                </span>
                <div className="flex flex-col gap-2.5 text-sm">
                  <a href="#signature-section" onClick={() => setActiveDropdown(null)} className="text-white/60 hover:text-white transition-colors duration-200 no-underline font-medium hover:translate-x-1.5 transform transition-transform duration-200">Kimchi Fire Stack</a>
                  <a href="#signature-section" onClick={() => setActiveDropdown(null)} className="text-white/60 hover:text-white transition-colors duration-200 no-underline font-medium hover:translate-x-1.5 transform transition-transform duration-200">Cheese Overload Stack</a>
                  <a href="#signature-section" onClick={() => setActiveDropdown(null)} className="text-white/60 hover:text-white transition-colors duration-200 no-underline font-medium hover:translate-x-1.5 transform transition-transform duration-200">Crispy Veg Stack</a>
                </div>
              </div>
              <div className="megamenu-column flex flex-col gap-4">
                <span className="font-heading font-black text-xs uppercase tracking-widest text-[#FF7A00] mb-1">Sides</span>
                <div className="flex flex-col gap-2.5 text-sm">
                  <a href="#signature-section" onClick={() => setActiveDropdown(null)} className="text-white/60 hover:text-white transition-colors duration-200 no-underline font-medium hover:translate-x-1.5 transform transition-transform duration-200">STAX Fries</a>
                  <a href="#signature-section" onClick={() => setActiveDropdown(null)} className="text-white/60 hover:text-white transition-colors duration-200 no-underline font-medium hover:translate-x-1.5 transform transition-transform duration-200">STAX Onion Rings</a>
                  <a href="#signature-section" onClick={() => setActiveDropdown(null)} className="text-white/60 hover:text-white transition-colors duration-200 no-underline font-medium hover:translate-x-1.5 transform transition-transform duration-200">Peri Peri Bites</a>
                </div>
              </div>
              <div className="megamenu-column flex flex-col gap-4">
                <span className="font-heading font-black text-xs uppercase tracking-widest text-[#FF7A00] mb-1">Desserts</span>
                <div className="flex flex-col gap-2.5 text-sm">
                  <a href="#signature-section" onClick={() => setActiveDropdown(null)} className="text-white/60 hover:text-white transition-colors duration-200 no-underline font-medium hover:translate-x-1.5 transform transition-transform duration-200">Choco Lava Cake</a>
                  <a href="#signature-section" onClick={() => setActiveDropdown(null)} className="text-white/60 hover:text-white transition-colors duration-200 no-underline font-medium hover:translate-x-1.5 transform transition-transform duration-200">Sundae Cups</a>
                  <a href="#signature-section" onClick={() => setActiveDropdown(null)} className="text-white/60 hover:text-white transition-colors duration-200 no-underline font-medium hover:translate-x-1.5 transform transition-transform duration-200">Premium Brownie</a>
                </div>
              </div>
              <div className="megamenu-column flex flex-col gap-4">
                <span className="font-heading font-black text-xs uppercase tracking-widest text-[#FF7A00] mb-1">Beverages</span>
                <div className="flex flex-col gap-2.5 text-sm">
                  <a href="#signature-section" onClick={() => setActiveDropdown(null)} className="text-white/60 hover:text-white transition-colors duration-200 no-underline font-medium hover:translate-x-1.5 transform transition-transform duration-200">STAX Brew Coffee</a>
                  <a href="#signature-section" onClick={() => setActiveDropdown(null)} className="text-white/60 hover:text-white transition-colors duration-200 no-underline font-medium hover:translate-x-1.5 transform transition-transform duration-200">Iced Hibiscus Tea</a>
                  <a href="#signature-section" onClick={() => setActiveDropdown(null)} className="text-white/60 hover:text-white transition-colors duration-200 no-underline font-medium hover:translate-x-1.5 transform transition-transform duration-200">Cold Cola</a>
                </div>
              </div>
            </div>

            {/* Right Side Featured Content Panel */}
            <div className="megamenu-featured md:col-span-4 border-l border-white/5 pl-8 flex flex-col gap-4">
              <span className="text-[10px] font-heading font-black uppercase tracking-widest text-white/30">Chef's Choice</span>
              <div className="relative w-full h-48 rounded-2xl overflow-hidden bg-white/5 border border-white/10 group/featured relative animate-float-burger">
                <img 
                  src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800&auto=format&fit=crop" 
                  alt="Double Flame Stack" 
                  className="w-full h-full object-cover group-hover/featured:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent flex flex-col justify-end p-4 text-left">
                  <span className="text-[8px] bg-[#FF7A00] text-black font-black uppercase px-2 py-0.5 rounded-full w-max mb-1">Featured</span>
                  <h4 className="text-white font-heading font-black text-sm uppercase m-0 tracking-wide">Double Flame Stack</h4>
                </div>
              </div>
              <p className="text-white/50 text-xs leading-relaxed m-0 text-left font-medium">
                Two flame-crafted patties, double melted cheddar, crispy onion strings, and signature stack sauce.
              </p>
              <div className="flex items-center justify-between mt-1 pt-3 border-t border-white/5">
                <span className="text-lg font-heading font-black text-[#FF7A00]">₹289</span>
                <a 
                  href="#signature-section" 
                  onClick={() => setActiveDropdown(null)}
                  className="bg-[#FF7A00] hover:bg-[#FFB347] text-black font-heading font-black text-[10px] uppercase tracking-widest px-4.5 py-2.5 rounded-full transition-all duration-300 no-underline flex items-center gap-1 shadow-[0_0_15px_rgba(255,122,0,0.2)] hover:scale-102 border-none animate-pulse"
                >
                  <span>Order Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        );
      case "signature-stacks":
        return (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 text-left">
            {/* Left Side Links */}
            <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="megamenu-column flex flex-col gap-4">
                <span className="font-heading font-black text-xs uppercase tracking-widest text-[#FF7A00] mb-1 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 fill-current" /> Beef & Lamb Stacks
                </span>
                <div className="flex flex-col gap-2.5 text-sm">
                  <a href="#signature-section" onClick={() => setActiveDropdown(null)} className="text-white/60 hover:text-white transition-colors duration-200 no-underline font-medium hover:translate-x-1.5 transform transition-transform duration-200">The Classic Stack</a>
                  <a href="#signature-section" onClick={() => setActiveDropdown(null)} className="text-white/60 hover:text-white transition-colors duration-200 no-underline font-medium hover:translate-x-1.5 transform transition-transform duration-200">Smoky BBQ Stack</a>
                  <a href="#signature-section" onClick={() => setActiveDropdown(null)} className="text-white/60 hover:text-white transition-colors duration-200 no-underline font-medium hover:translate-x-1.5 transform transition-transform duration-200">Double Flame Stack</a>
                </div>
              </div>
              <div className="megamenu-column flex flex-col gap-4">
                <span className="font-heading font-black text-xs uppercase tracking-widest text-[#FF7A00] mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#FF7A00]" /> Chicken & Veg Stacks
                </span>
                <div className="flex flex-col gap-2.5 text-sm">
                  <a href="#signature-section" onClick={() => setActiveDropdown(null)} className="text-white/60 hover:text-white transition-colors duration-200 no-underline font-medium hover:translate-x-1.5 transform transition-transform duration-200">Firehouse Chicken Stack</a>
                  <a href="#signature-section" onClick={() => setActiveDropdown(null)} className="text-white/60 hover:text-white transition-colors duration-200 no-underline font-medium hover:translate-x-1.5 transform transition-transform duration-200">Truffle Melt Stack</a>
                  <a href="#signature-section" onClick={() => setActiveDropdown(null)} className="text-white/60 hover:text-white transition-colors duration-200 no-underline font-medium hover:translate-x-1.5 transform transition-transform duration-200">Kimchi Fire Stack</a>
                  <a href="#signature-section" onClick={() => setActiveDropdown(null)} className="text-white/60 hover:text-white transition-colors duration-200 no-underline font-medium hover:translate-x-1.5 transform transition-transform duration-200">Cheese Overload Stack</a>
                </div>
              </div>
              <div className="megamenu-column flex flex-col gap-4">
                <span className="font-heading font-black text-xs uppercase tracking-widest text-[#FF7A00] mb-1 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#FF7A00]" /> Sides & Extras
                </span>
                <div className="flex flex-col gap-2.5 text-sm">
                  <a href="#signature-section" onClick={() => setActiveDropdown(null)} className="text-white/60 hover:text-white transition-colors duration-200 no-underline font-medium hover:translate-x-1.5 transform transition-transform duration-200">Sweet Potato Fries</a>
                  <a href="#signature-section" onClick={() => setActiveDropdown(null)} className="text-white/60 hover:text-white transition-colors duration-200 no-underline font-medium hover:translate-x-1.5 transform transition-transform duration-200">Crisp Onion Rings</a>
                  <a href="#signature-section" onClick={() => setActiveDropdown(null)} className="text-white/60 hover:text-white transition-colors duration-200 no-underline font-medium hover:translate-x-1.5 transform transition-transform duration-200">STAX Soda</a>
                </div>
              </div>
            </div>

            {/* Right Side Featured Content Panel */}
            <div className="megamenu-featured md:col-span-4 border-l border-white/5 pl-8 flex flex-col gap-4">
              <span className="text-[10px] font-heading font-black uppercase tracking-widest text-white/30">Artisanal Choice</span>
              <div className="relative w-full h-48 rounded-2xl overflow-hidden bg-white/5 border border-white/10 group/featured relative animate-float-burger">
                <img 
                  src="https://images.unsplash.com/photo-1586190848861-99aa4a171e90?q=80&w=800&auto=format&fit=crop" 
                  alt="Truffle Melt Stack" 
                  className="w-full h-full object-cover group-hover/featured:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent flex flex-col justify-end p-4 text-left">
                  <span className="text-[8px] bg-[#FF7A00] text-black font-black uppercase px-2 py-0.5 rounded-full w-max mb-1">Elite</span>
                  <h4 className="text-white font-heading font-black text-sm uppercase m-0 tracking-wide">Truffle Melt Stack</h4>
                </div>
              </div>
              <p className="text-white/50 text-xs leading-relaxed m-0 text-left font-medium">
                Single premium flame-crafted patty topped with sautéed wild mushrooms, Swiss cheese, and truffle aioli.
              </p>
              <div className="flex items-center justify-between mt-1 pt-3 border-t border-white/5">
                <span className="text-lg font-heading font-black text-[#FF7A00]">₹349</span>
                <a 
                  href="#signature-section" 
                  onClick={() => setActiveDropdown(null)}
                  className="bg-[#FF7A00] hover:bg-[#FFB347] text-black font-heading font-black text-[10px] uppercase tracking-widest px-4.5 py-2.5 rounded-full transition-all duration-300 no-underline flex items-center gap-1 shadow-[0_0_15px_rgba(255,122,0,0.2)] hover:scale-102 border-none"
                >
                  <span>Order Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        );
      case "craft-process":
        return (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 text-left">
            <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="megamenu-column flex flex-col gap-4">
                <span className="font-heading font-black text-xs uppercase tracking-widest text-[#FF7A00] mb-1 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5" /> Flame Grilling
                </span>
                <div className="flex flex-col gap-2.5 text-sm">
                  <a href="#customizer-section" onClick={() => setActiveDropdown(null)} className="text-white/60 hover:text-white transition-colors duration-200 no-underline font-medium hover:translate-x-1.5 transform transition-transform duration-200">Direct Flame Broiling</a>
                  <a href="#customizer-section" onClick={() => setActiveDropdown(null)} className="text-white/60 hover:text-white transition-colors duration-200 no-underline font-medium hover:translate-x-1.5 transform transition-transform duration-200">370°F Embers Control</a>
                  <a href="#customizer-section" onClick={() => setActiveDropdown(null)} className="text-white/60 hover:text-white transition-colors duration-200 no-underline font-medium hover:translate-x-1.5 transform transition-transform duration-200">Sizzling Caramelization</a>
                </div>
              </div>
              <div className="megamenu-column flex flex-col gap-4">
                <span className="font-heading font-black text-xs uppercase tracking-widest text-[#FF7A00] mb-1">Ingredient Promise</span>
                <div className="flex flex-col gap-2.5 text-sm">
                  <a href="#customizer-section" onClick={() => setActiveDropdown(null)} className="text-white/60 hover:text-white transition-colors duration-200 no-underline font-medium hover:translate-x-1.5 transform transition-transform duration-200">100% Whole Muscle Meat</a>
                  <a href="#customizer-section" onClick={() => setActiveDropdown(null)} className="text-white/60 hover:text-white transition-colors duration-200 no-underline font-medium hover:translate-x-1.5 transform transition-transform duration-200">Daily Fresh Cut Veggies</a>
                  <a href="#customizer-section" onClick={() => setActiveDropdown(null)} className="text-white/60 hover:text-white transition-colors duration-200 no-underline font-medium hover:translate-x-1.5 transform transition-transform duration-200">Zero Preservatives Promise</a>
                </div>
              </div>
              <div className="megamenu-column flex flex-col gap-4">
                <span className="font-heading font-black text-xs uppercase tracking-widest text-[#FF7A00] mb-1">STAX LAB</span>
                <div className="flex flex-col gap-2.5 text-sm">
                  <a href="#customizer-section" onClick={() => setActiveDropdown(null)} className="text-white/60 hover:text-white transition-colors duration-200 no-underline font-medium hover:translate-x-1.5 transform transition-transform duration-200">Custom Ingredient Count</a>
                  <a href="#customizer-section" onClick={() => setActiveDropdown(null)} className="text-white/60 hover:text-white transition-colors duration-200 no-underline font-medium hover:translate-x-1.5 transform transition-transform duration-200">Real-Time 3D Previews</a>
                  <a href="#customizer-section" onClick={() => setActiveDropdown(null)} className="text-white/60 hover:text-white transition-colors duration-200 no-underline font-medium hover:translate-x-1.5 transform transition-transform duration-200">Order Custom Recipes</a>
                </div>
              </div>
            </div>

            <div className="megamenu-featured md:col-span-4 border-l border-white/5 pl-8 flex flex-col gap-4">
              <span className="text-[10px] font-heading font-black uppercase tracking-widest text-white/30">Grill Workshop</span>
              <div className="relative w-full h-48 rounded-2xl overflow-hidden bg-white/5 border border-white/10 group/featured relative">
                <img 
                  src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=800&auto=format&fit=crop" 
                  alt="STAX Lab" 
                  className="w-full h-full object-cover group-hover/featured:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent flex flex-col justify-end p-4 text-left">
                  <span className="text-[8px] bg-[#FF7A00] text-black font-black uppercase px-2 py-0.5 rounded-full w-max mb-1">3D Lab</span>
                  <h4 className="text-white font-heading font-black text-sm uppercase m-0 tracking-wide">Design Your Own STAX</h4>
                </div>
              </div>
              <p className="text-white/50 text-xs leading-relaxed m-0 text-left font-medium">
                Assemble ingredients interactively in 3D: add double cheese, stack extra patties, and specify flame-sear.
              </p>
              <div className="flex items-center justify-between mt-1 pt-3 border-t border-white/5">
                <span className="text-xs font-bold text-white/40 uppercase tracking-wider">Customized Order</span>
                <a 
                  href="#customizer-section" 
                  onClick={() => setActiveDropdown(null)}
                  className="bg-[#FF7A00] hover:bg-[#FFB347] text-black font-heading font-black text-[10px] uppercase tracking-widest px-4.5 py-2.5 rounded-full transition-all duration-300 no-underline flex items-center gap-1 shadow-[0_0_15px_rgba(255,122,0,0.2)] hover:scale-102 border-none animate-pulse"
                >
                  <span>Build Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        );
      case "rewards":
        return (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 text-left">
            <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="megamenu-column flex flex-col gap-4">
                <span className="font-heading font-black text-xs uppercase tracking-widest text-[#FF7A00] mb-1 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5" /> STAX Club Perks
                </span>
                <div className="flex flex-col gap-2.5 text-sm">
                  <a href="#app-section" onClick={() => setActiveDropdown(null)} className="text-white/60 hover:text-white transition-colors duration-200 no-underline font-medium hover:translate-x-1.5 transform transition-transform duration-200">Earn Loyalty Crowns</a>
                  <a href="#app-section" onClick={() => setActiveDropdown(null)} className="text-white/60 hover:text-white transition-colors duration-200 no-underline font-medium hover:translate-x-1.5 transform transition-transform duration-200">Tier Benefits & Status</a>
                  <a href="#app-section" onClick={() => setActiveDropdown(null)} className="text-white/60 hover:text-white transition-colors duration-200 no-underline font-medium hover:translate-x-1.5 transform transition-transform duration-200">Crowns Balance Portal</a>
                </div>
              </div>
              <div className="megamenu-column flex flex-col gap-4">
                <span className="font-heading font-black text-xs uppercase tracking-widest text-[#FF7A00] mb-1">Redeem Rewards</span>
                <div className="flex flex-col gap-2.5 text-sm">
                  <a href="#app-section" onClick={() => setActiveDropdown(null)} className="text-white/60 hover:text-white transition-colors duration-200 no-underline font-medium hover:translate-x-1.5 transform transition-transform duration-200">Redeem Free Stacks</a>
                  <a href="#app-section" onClick={() => setActiveDropdown(null)} className="text-white/60 hover:text-white transition-colors duration-200 no-underline font-medium hover:translate-x-1.5 transform transition-transform duration-200">Exclusive App Coupons</a>
                  <a href="#app-section" onClick={() => setActiveDropdown(null)} className="text-white/60 hover:text-white transition-colors duration-200 no-underline font-medium hover:translate-x-1.5 transform transition-transform duration-200">Free Side Upgrades</a>
                </div>
              </div>
              <div className="megamenu-column flex flex-col gap-4">
                <span className="font-heading font-black text-xs uppercase tracking-widest text-[#FF7A00] mb-1">Mobile App Perks</span>
                <div className="flex flex-col gap-2.5 text-sm">
                  <a href="#app-section" onClick={() => setActiveDropdown(null)} className="text-white/60 hover:text-white transition-colors duration-200 no-underline font-medium hover:translate-x-1.5 transform transition-transform duration-200">Live Thermal Tracking</a>
                  <a href="#app-section" onClick={() => setActiveDropdown(null)} className="text-white/60 hover:text-white transition-colors duration-200 no-underline font-medium hover:translate-x-1.5 transform transition-transform duration-200">Contactless Store Pickup</a>
                  <a href="#app-section" onClick={() => setActiveDropdown(null)} className="text-white/60 hover:text-white transition-colors duration-200 no-underline font-medium hover:translate-x-1.5 transform transition-transform duration-200">Digital Crown Wallet</a>
                </div>
              </div>
            </div>

            <div className="megamenu-featured md:col-span-4 border-l border-white/5 pl-8 flex flex-col gap-4">
              <span className="text-[10px] font-heading font-black uppercase tracking-widest text-white/30">Join and Earn</span>
              <div className="relative w-full h-48 rounded-2xl overflow-hidden bg-white/5 border border-white/10 group/featured relative">
                <img 
                  src="https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=800&auto=format&fit=crop" 
                  alt="STAX Perks" 
                  className="w-full h-full object-cover group-hover/featured:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent flex flex-col justify-end p-4 text-left">
                  <span className="text-[8px] bg-yellow-500 text-black font-black uppercase px-2 py-0.5 rounded-full w-max mb-1">STAX Perks</span>
                  <h4 className="text-white font-heading font-black text-sm uppercase m-0 tracking-wide">Claim Your Welcome Crowns</h4>
                </div>
              </div>
              <p className="text-white/50 text-xs leading-relaxed m-0 text-left font-medium">
                Get 200 welcome crowns instantly upon download. Earn 10 crowns for every ₹100 spent, and redeem free Stacks.
              </p>
              <div className="flex items-center justify-between mt-1 pt-3 border-t border-white/5">
                <span className="text-xs font-bold text-white/40 uppercase tracking-wider">Free To Join</span>
                <a 
                  href="#app-section" 
                  onClick={() => setActiveDropdown(null)}
                  className="bg-[#FF7A00] hover:bg-[#FFB347] text-black font-heading font-black text-[10px] uppercase tracking-widest px-4.5 py-2.5 rounded-full transition-all duration-300 no-underline flex items-center gap-1 shadow-[0_0_15px_rgba(255,122,0,0.2)] hover:scale-102 border-none animate-pulse"
                >
                  <span>Download App</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        );
      case "locations":
        return (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 text-left">
            <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="megamenu-column flex flex-col gap-4">
                <span className="font-heading font-black text-xs uppercase tracking-widest text-[#FF7A00] mb-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> Rajasthan Kitchens
                </span>
                <div className="flex flex-col gap-2.5 text-sm">
                  <a href="#locations-section" onClick={() => setActiveDropdown(null)} className="text-white/60 hover:text-white transition-colors duration-200 no-underline font-medium hover:translate-x-1.5 transform transition-transform duration-200">STAX — GT Central Jaipur</a>
                  <a href="#locations-section" onClick={() => setActiveDropdown(null)} className="text-white/60 hover:text-white transition-colors duration-200 no-underline font-medium hover:translate-x-1.5 transform transition-transform duration-200">STAX — Sardarpura Jodhpur</a>
                  <a href="#locations-section" onClick={() => setActiveDropdown(null)} className="text-white/60 hover:text-white transition-colors duration-200 no-underline font-medium hover:translate-x-1.5 transform transition-transform duration-200">STAX — Mittal Mall Ajmer</a>
                  <a href="#locations-section" onClick={() => setActiveDropdown(null)} className="text-white/60 hover:text-white transition-colors duration-200 no-underline font-medium hover:translate-x-1.5 transform transition-transform duration-200">STAX — Celebration Mall Udaipur</a>
                </div>
              </div>
              <div className="megamenu-column flex flex-col gap-4">
                <span className="font-heading font-black text-xs uppercase tracking-widest text-[#FF7A00] mb-1">Metro Service Zones</span>
                <div className="flex flex-col gap-2.5 text-sm">
                  <a href="#locations-section" onClick={() => setActiveDropdown(null)} className="text-white/60 hover:text-white transition-colors duration-200 no-underline font-medium hover:translate-x-1.5 transform transition-transform duration-200">STAX — Connaught Place Delhi</a>
                  <a href="#locations-section" onClick={() => setActiveDropdown(null)} className="text-white/60 hover:text-white transition-colors duration-200 no-underline font-medium hover:translate-x-1.5 transform transition-transform duration-200">STAX — Bandra West Mumbai</a>
                  <a href="#locations-section" onClick={() => setActiveDropdown(null)} className="text-white/60 hover:text-white transition-colors duration-200 no-underline font-medium hover:translate-x-1.5 transform transition-transform duration-200">STAX — Indiranagar Bangalore</a>
                </div>
              </div>
            </div>

            <div className="megamenu-featured md:col-span-4 border-l border-white/5 pl-8 flex flex-col gap-4">
              <span className="text-[10px] font-heading font-black uppercase tracking-widest text-white/30">Store Finder</span>
              <div className="relative w-full h-48 rounded-2xl overflow-hidden bg-white/5 border border-white/10 group/featured relative">
                <img 
                  src="https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=800&auto=format&fit=crop" 
                  alt="STAX Kitchen storefront" 
                  className="w-full h-full object-cover group-hover/featured:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent flex flex-col justify-end p-4 text-left">
                  <span className="text-[8px] bg-green-600 text-white font-black uppercase px-2 py-0.5 rounded-full w-max mb-1">Find Kitchen</span>
                  <h4 className="text-white font-heading font-black text-sm uppercase m-0 tracking-wide">Locate Active Grills</h4>
                </div>
              </div>
              <p className="text-white/50 text-xs leading-relaxed m-0 text-left font-medium">
                Enter your area zip code to scan operational hours, map coordinates, and thermal delivery radius codes.
              </p>
              <div className="flex items-center justify-between mt-1 pt-3 border-t border-white/5">
                <span className="text-xs font-bold text-white/40 uppercase tracking-wider">7 Kitchens Active</span>
                <a 
                  href="#locations-section" 
                  onClick={() => setActiveDropdown(null)}
                  className="bg-[#FF7A00] hover:bg-[#FFB347] text-black font-heading font-black text-[10px] uppercase tracking-widest px-4.5 py-2.5 rounded-full transition-all duration-300 no-underline flex items-center gap-1 shadow-[0_0_15px_rgba(255,122,0,0.2)] hover:scale-102 border-none animate-pulse"
                >
                  <span>Locate Store</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      {/* Navigation Header Wrapper */}
      <header
        onMouseLeave={() => {
          setPrevDropdown(activeDropdown);
          setActiveDropdown(null);
        }}
        className={`fixed top-0 left-0 w-full z-50 px-6 md:px-12 transition-all duration-500 py-5 ${
          isScrolled 
            ? "py-4 bg-black/40 backdrop-blur-md border-b border-white/5 shadow-lg" 
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between relative">
          
          {/* Logo on the left */}
          <a href="#" onClick={() => setActiveDropdown(null)} className="flex items-center gap-2 group text-[#FAF9F6] no-underline">
            <div className="w-10 h-10 rounded-full bg-[#FF7A00] flex items-center justify-center shadow-[0_0_15px_rgba(255,122,0,0.4)] group-hover:scale-110 transition-transform duration-300">
              <Flame className="w-6 h-6 text-[#000000] fill-current" />
            </div>
            <span className="font-heading font-black text-xl tracking-wider uppercase text-white">
              STAX
            </span>
          </a>

          {/* Center-aligned rounded pill navigation container */}
          <nav
            className="rounded-full px-8 py-2.5 hidden md:flex items-center gap-8 shadow-[0_10px_35px_rgba(0,0,0,0.5)] relative z-50 transition-all duration-300"
            style={{
              backdropFilter: "blur(20px) saturate(160%)",
              WebkitBackdropFilter: "blur(20px) saturate(160%)",
              background: "rgba(10,10,10,0.65)",
              border: "1px solid rgba(255,255,255,0.08)"
            }}
          >
            {[
              { id: "menu", label: "Menu", href: "#signature-section" },
              { id: "signature-stacks", label: "Signature Stacks", href: "#signature-section" },
              { id: "craft-process", label: "Craft Process", href: "#customizer-section" },
              { id: "rewards", label: "Rewards", href: "#app-section" },
              { id: "locations", label: "Locations", href: "#locations-section" }
            ].map((item) => (
              <a
                key={item.id}
                href={item.href}
                onMouseEnter={() => handleNavHover(item.id)}
                className="text-sm font-semibold text-white/80 hover:text-[#FF7A00] hover:drop-shadow-[0_0_8px_rgba(255,122,0,0.6)] transition-all duration-300 no-underline uppercase tracking-wider relative group py-1 block cursor-pointer"
              >
                {/* Text shift up on hover */}
                <span className="inline-block transition-transform duration-300 group-hover:-translate-y-[2px]">
                  {item.label}
                </span>
                
                {/* Underline and Glow */}
                <span className={`absolute bottom-0 left-0 w-0 h-[2px] bg-[#FF7A00] group-hover:w-full transition-all duration-300 shadow-[0_0_8px_#FF7A00] ${
                  activeDropdown === item.id ? "w-full" : ""
                }`} />
              </a>
            ))}
          </nav>

          {/* Right CTA / Order Indicator + Hamburger */}
          <div className="flex items-center gap-4">
            {/* Desktop Cart Button */}
            <button
              id="cart-icon-nav"
              onClick={onCartOpen}
              className="hidden md:flex relative w-10 h-10 rounded-full border border-white/10 items-center justify-center text-white/80 hover:text-[#FF7A00] hover:border-[#FF7A00]/30 bg-black/40 hover:bg-[#FF7A00]/5 cursor-pointer transition-all duration-300"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="8" cy="21" r="1" />
                <circle cx="19" cy="21" r="1" />
                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#FF7A00] text-black font-heading font-black text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-[0_0_8px_rgba(255,122,0,0.6)]">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile Cart Button */}
            <button
              onClick={onCartOpen}
              className="md:hidden relative w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/80 hover:text-[#FF7A00] hover:border-[#FF7A00]/30 bg-black/40 hover:bg-[#FF7A00]/5 cursor-pointer transition-all duration-300"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="8" cy="21" r="1" />
                <circle cx="19" cy="21" r="1" />
                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#FF7A00] text-black font-heading font-black text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-[0_0_8px_rgba(255,122,0,0.6)]">
                  {cartCount}
                </span>
              )}
            </button>

            <a
              href="#customizer-section"
              onClick={() => setActiveDropdown(null)}
              className="hidden md:block text-xs font-bold text-[#FF7A00] border border-[#FF7A00]/30 bg-[#FF7A00]/5 rounded-full px-4 py-2 hover:bg-[#FF7A00] hover:text-black transition-all duration-300 no-underline uppercase tracking-wider shadow-[0_0_15px_rgba(255,122,0,0.05)] hover:shadow-[0_0_15px_rgba(255,122,0,0.2)]"
            >
              Grill Workshop
            </a>

            {/* Mobile Hamburger Icon */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/5 cursor-pointer transition-colors duration-300"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          {/* Desktop Mega Menu Dropdown Container */}
          <div
            ref={dropdownRef}
            className="absolute left-1/2 -translate-x-1/2 top-full mt-4 w-full max-w-7xl z-40 rounded-[2.5rem] p-10 shadow-[0_25px_60px_rgba(0,0,0,0.9)] hidden opacity-0 border border-white/8 overflow-hidden"
            style={{
              backdropFilter: "blur(20px) saturate(160%)",
              WebkitBackdropFilter: "blur(20px) saturate(160%)",
              background: "rgba(10,10,10,0.65)",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.9), 0 0 40px rgba(255,122,0,0.05)"
            }}
          >
            {renderDropdownContent()}
          </div>

        </div>
      </header>

      {/* Mobile Menu Drawer */}
      <div 
        className={`fixed inset-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-xl transition-all duration-500 ease-in-out md:hidden flex flex-col ${
          isMobileMenuOpen ? "opacity-100 pointer-events-auto translate-x-0" : "opacity-0 pointer-events-none translate-x-full"
        }`} 
        style={{ borderLeft: "1px solid rgba(255,255,255,0.08)" }}
      >
        {/* Header inside Mobile Menu */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <a href="#" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 text-[#FAF9F6] no-underline">
            <div className="w-8 h-8 rounded-full bg-[#FF7A00] flex items-center justify-center">
              <Flame className="w-5 h-5 text-[#000000] fill-current" />
            </div>
            <span className="font-heading font-black text-lg tracking-wider uppercase text-white">
              STAX
            </span>
          </a>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/5 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable list of mobile items */}
        <div className="flex-1 overflow-y-auto px-6 py-8 flex flex-col gap-6">
          {[
            { id: "menu", label: "Menu", subitems: ["Signature Stacks", "Chicken Stacks", "Veg Stacks", "Sides", "Desserts", "Beverages"], link: "#signature-section" },
            { id: "signature-stacks", label: "Signature Stacks", subitems: ["Beef & Lamb Stacks", "Chicken & Veg Stacks", "Sides & Extras"], link: "#signature-section" },
            { id: "craft-process", label: "Craft Process", subitems: ["Flame Grilling Process", "Ingredient Promise", "STAX Lab"], link: "#customizer-section" },
            { id: "rewards", label: "Rewards", subitems: ["Earn Crowns", "Redeem Rewards", "Mobile App Perks"], link: "#app-section" },
            { id: "locations", label: "Locations", subitems: ["Jaipur Kitchens", "Jodhpur Kitchens", "Ajmer Kitchens", "Udaipur Kitchens"], link: "#locations-section" }
          ].map((item) => {
            const isSubOpen = activeMobileDropdown === item.id;
            return (
              <div key={item.id} className="border-b border-white/5 pb-4">
                <button
                  onClick={() => setActiveMobileDropdown(isSubOpen ? null : item.id)}
                  className="w-full flex items-center justify-between text-left py-2 font-heading font-black text-xl uppercase tracking-wider text-white hover:text-[#FF7A00] cursor-pointer"
                >
                  <span>{item.label}</span>
                  <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${isSubOpen ? "rotate-180 text-[#FF7A00]" : "text-white/40"}`} />
                </button>

                {/* Subitems (Accordion) */}
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  isSubOpen ? "max-h-[320px] opacity-100 mt-3 pl-4" : "max-h-0 opacity-0 pointer-events-none"
                }`}>
                  <div className="flex flex-col gap-3">
                    {item.subitems.map((sub, i) => (
                      <a
                        key={i}
                        href={item.link}
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          setActiveMobileDropdown(null);
                        }}
                        className="text-sm font-semibold text-white/50 hover:text-white no-underline transition-colors duration-200 block"
                      >
                        {sub}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer inside mobile menu */}
        <div className="p-6 border-t border-white/5 flex flex-col gap-4">
          <a
            href="#customizer-section"
            onClick={() => setIsMobileMenuOpen(false)}
            className="w-full py-4 text-center rounded-full bg-[#FF7A00] hover:bg-[#FFB347] text-black font-heading font-black text-xs uppercase tracking-widest no-underline transition-all duration-300"
          >
            Grill Workshop
          </a>
        </div>
      </div>

      {/* Floating Action Cart Button (Bottom Right) */}
      <button
        id="floating-cart-btn"
        onClick={onCartOpen}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#FF7A00] hover:bg-[#FFB347] hover:scale-110 flex items-center justify-center text-black shadow-[0_4px_25px_rgba(255,122,0,0.45)] transition-all duration-300 border-none cursor-pointer"
      >
        <div className="relative">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="8" cy="21" r="1" />
            <circle cx="19" cy="21" r="1" />
            <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
          </svg>
          {cartCount > 0 && (
            <span className="absolute -top-3.5 -right-3.5 bg-white text-black font-heading font-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-black shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
              {cartCount}
            </span>
          )}
        </div>
      </button>
    </>
  );
}
